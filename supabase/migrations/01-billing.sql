-- ============================================================
-- Quick Exam Gen — billing / coins schema
-- ============================================================

-- ============================================================
-- 1. coins_transactions  (append-only ledger)
-- ============================================================
create table public.coins_transactions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  amount      integer     not null,
  type        text        not null check (type in ('purchase', 'export')),
  ref_id      uuid,
  note        text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

alter table public.coins_transactions enable row level security;

-- Users can read their own transactions; all writes are service-role only
create policy "coins_transactions: owner select"
  on public.coins_transactions for select
  using (user_id = auth.uid());

-- ============================================================
-- 2. coins_balance  (materialized running total)
-- ============================================================
create table public.coins_balance (
  user_id     uuid        primary key references auth.users(id) on delete cascade,
  balance     integer     not null default 0 check (balance >= 0),
  updated_at  timestamptz not null default now()
);

alter table public.coins_balance enable row level security;

-- Users can read their own balance; all writes are via trigger (SECURITY DEFINER)
create policy "coins_balance: owner select"
  on public.coins_balance for select
  using (user_id = auth.uid());

-- Trigger function: upsert balance after every transaction insert
create or replace function public.update_coins_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.coins_balance (user_id, balance, updated_at)
  values (new.user_id, new.amount, now())
  on conflict (user_id) do update
    set balance    = coins_balance.balance + excluded.balance,
        updated_at = now();
  return new;
end;
$$;

create trigger trg_coins_transactions_balance
  after insert on public.coins_transactions
  for each row execute function public.update_coins_balance();

-- ============================================================
-- 3. Initialize coins balance row on new user sign-up
-- ============================================================
create or replace function public.init_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.coins_balance (user_id, balance)
  values (new.id, 0)
  on conflict do nothing;

  return new;
end;
$$;

create trigger trg_new_user_init_balance
  after insert on auth.users
  for each row execute function public.init_balance();

-- ============================================================
-- 4. coin_packages  (product catalogue)
-- ============================================================
create table public.coin_packages (
  id          text        primary key,              -- e.g. 'starter', 'pro'
  label       text        not null,
  coins       integer     not null check (coins > 0),
  price_cents integer     not null check (price_cents > 0),  -- e.g. 199
  currency    text        not null default 'USD',
  active      boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_coin_packages_updated_at
  before update on public.coin_packages
  for each row execute function public.set_updated_at();

alter table public.coin_packages enable row level security;

-- Anyone (including anonymous) can read active packages
create policy "coin_packages: public read"
  on public.coin_packages for select
  using (active = true);

-- Seed the initial packages
insert into public.coin_packages (id, label, coins, price_cents, sort_order) values
  ('starter',   'Starter',   10,  199,  1),
  ('standard',  'Standard',  50,  799,  2),
  ('pro',       'Pro',       120, 1699, 3),
  ('unlimited', 'Unlimited', 300, 3499, 4);

-- ============================================================
-- 5. coin_orders  (purchase lifecycle tracking)
-- ============================================================
-- Lifecycle: pending → paid → fulfilled
--                    └→ failed
--                    └→ cancelled
--
-- pending    — user selected a package and initiated checkout
-- paid       — payment processor confirmed payment received
-- fulfilled  — coins have been credited to the user's balance
-- failed     — payment was declined or timed out
-- cancelled  — user cancelled before paying
create table public.coin_orders (
  id                 uuid        primary key default gen_random_uuid(),
  user_id            uuid        not null references auth.users(id) on delete cascade,
  package_id         text        not null references public.coin_packages(id),
  status             text        not null default 'pending'
                       check (status in ('pending', 'paid', 'fulfilled', 'failed', 'cancelled')),
  coins              integer     not null check (coins > 0),  -- snapshot at order time
  price_cents        integer     not null check (price_cents > 0),
  currency           text        not null default 'USD',
  -- Payment gateway fields (populate when gateway is integrated)
  gateway            text,        -- e.g. 'stripe', 'paypal'
  gateway_order_id   text,        -- ID from the payment provider
  gateway_payload    jsonb,       -- raw webhook / event payload for audit
  -- Linked ledger entry (set when status → fulfilled)
  transaction_id     uuid        references public.coins_transactions(id),
  -- Timestamps for each status transition
  paid_at            timestamptz,
  fulfilled_at       timestamptz,
  failed_at          timestamptz,
  cancelled_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger trg_coin_orders_updated_at
  before update on public.coin_orders
  for each row execute function public.set_updated_at();

alter table public.coin_orders enable row level security;

-- Users can read their own orders
create policy "coin_orders: owner select"
  on public.coin_orders for select
  using (user_id = auth.uid());

-- Users can insert their own pending orders (initiating checkout)
create policy "coin_orders: owner insert"
  on public.coin_orders for insert
  with check (user_id = auth.uid() and status = 'pending');

-- Status transitions and gateway writes are service-role only (via webhook handler)

-- ============================================================
-- 6. Indexes
-- ============================================================
create index idx_coins_transactions_user_created
  on public.coins_transactions (user_id, created_at desc);

create index idx_coin_orders_user_created
  on public.coin_orders (user_id, created_at desc);

create index idx_coin_orders_status
  on public.coin_orders (status);

create index idx_coin_orders_gateway_order_id
  on public.coin_orders (gateway_order_id)
  where gateway_order_id is not null;

-- ============================================================
-- 7. Grants for authenticated role
-- ============================================================
grant select on public.coins_transactions to authenticated;
grant select on public.coins_balance      to authenticated;
grant select on public.coin_packages      to authenticated;
grant select, insert on public.coin_orders to authenticated;
-- Allow anonymous users to browse packages
grant select on public.coin_packages      to anon;

-- ============================================================
-- 8. Billing RPC functions  (service_role only)
--
-- All functions are SECURITY DEFINER and restricted to
-- service_role. They are called exclusively via the admin
-- Supabase client so that each operation is a single atomic
-- DB round-trip.
-- ============================================================

-- 8a. billing_deduct_coins
--     Insert a negative 'export' transaction for a user.
create or replace function public.billing_deduct_coins(
  p_user_id uuid,
  p_amount  integer,
  p_ref_id  uuid    default null,
  p_note    text    default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    raise exception 'Deduction amount must be positive, got %', p_amount;
  end if;

  insert into public.coins_transactions (user_id, amount, type, ref_id, note)
  values (p_user_id, -p_amount, 'export', p_ref_id, p_note);
end;
$$;

revoke execute on function public.billing_deduct_coins(uuid, integer, uuid, text) from public, anon, authenticated;

-- 8b. billing_credit_coins
--     Insert a positive 'purchase' transaction for a user.
--     Returns the new transaction id.
create or replace function public.billing_credit_coins(
  p_user_id uuid,
  p_amount  integer,
  p_note    text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx_id uuid;
begin
  if p_amount <= 0 then
    raise exception 'Credit amount must be positive, got %', p_amount;
  end if;

  insert into public.coins_transactions (user_id, amount, type, note)
  values (p_user_id, p_amount, 'purchase', p_note)
  returning id into v_tx_id;

  return v_tx_id;
end;
$$;

revoke execute on function public.billing_credit_coins(uuid, integer, text) from public, anon, authenticated;

-- 8c. billing_fulfill_order
--     Atomically transition an order through pending → paid →
--     fulfilled and credit the user's coins.
--     Idempotent: a second call on an already-fulfilled order is a no-op.
create or replace function public.billing_fulfill_order(
  p_order_id        uuid,
  p_gateway_payload jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_tx_id uuid;
begin
  -- Lock the row to prevent concurrent fulfillment races
  select id, user_id, coins, status, transaction_id
    into v_order
    from public.coin_orders
   where id = p_order_id
     for update;

  if not found then
    raise exception 'Order not found: %', p_order_id;
  end if;

  -- Idempotent — already done
  if v_order.status = 'fulfilled' then
    return;
  end if;

  if v_order.status not in ('pending', 'paid') then
    raise exception 'Cannot fulfil order in status ''%''', v_order.status;
  end if;

  if v_order.status = 'paid' and v_order.transaction_id is not null then
    -- A previous attempt already credited coins but crashed before marking
    -- fulfilled. Reuse the existing transaction — do NOT credit again.
    v_tx_id := v_order.transaction_id;
  else
    -- Mark paid
    update public.coin_orders
       set status          = 'paid',
           paid_at         = now(),
           gateway_payload = coalesce(p_gateway_payload, gateway_payload)
     where id = p_order_id;

    -- Credit coins (triggers balance update via trg_coins_transactions_balance)
    insert into public.coins_transactions (user_id, amount, type, note)
    values (v_order.user_id, v_order.coins, 'purchase',
            'Top-up: order ' || p_order_id::text)
    returning id into v_tx_id;
  end if;

  -- Mark fulfilled
  update public.coin_orders
     set status         = 'fulfilled',
         fulfilled_at   = now(),
         transaction_id = v_tx_id
   where id = p_order_id;
end;
$$;

revoke execute on function public.billing_fulfill_order(uuid, jsonb) from public, anon, authenticated;

-- 8d. billing_fail_order
--     Mark an order as 'failed' or 'cancelled'.
--     Guards against corrupting fulfilled orders.
--     Idempotent: a second call on an already-terminal order is a no-op.
create or replace function public.billing_fail_order(
  p_order_id uuid,
  p_status   text default 'failed'   -- 'failed' | 'cancelled'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status text;
begin
  if p_status not in ('failed', 'cancelled') then
    raise exception
      'Invalid target status ''%''. Must be ''failed'' or ''cancelled''',
      p_status;
  end if;

  select status
    into v_current_status
    from public.coin_orders
   where id = p_order_id
     for update;

  if not found then
    raise exception 'Order not found: %', p_order_id;
  end if;

  if v_current_status = 'fulfilled' then
    raise exception 'Cannot % a fulfilled order', p_status;
  end if;

  -- Already in a terminal state — idempotent
  if v_current_status in ('failed', 'cancelled') then
    return;
  end if;

  update public.coin_orders
     set status       = p_status,
         failed_at    = case when p_status = 'failed'    then now() else failed_at    end,
         cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end
   where id = p_order_id;
end;
$$;

revoke execute on function public.billing_fail_order(uuid, text) from public, anon, authenticated;
