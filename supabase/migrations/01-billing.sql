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
  balance     integer     not null default 0,
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
-- 5. Indexes
-- ============================================================
create index idx_coins_transactions_user_created
  on public.coins_transactions (user_id, created_at desc);

-- ============================================================
-- 6. Grants for authenticated role
-- ============================================================
grant select on public.coins_transactions to authenticated;
grant select on public.coins_balance      to authenticated;
grant select on public.coin_packages      to authenticated;
-- Allow anonymous users to browse packages
grant select on public.coin_packages      to anon;
