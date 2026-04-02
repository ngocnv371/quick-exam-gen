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
-- 4. Indexes
-- ============================================================
create index idx_coins_transactions_user_created
  on public.coins_transactions (user_id, created_at desc);

-- ============================================================
-- 5. Grants for authenticated role
-- ============================================================
grant select on public.coins_transactions to authenticated;
grant select on public.coins_balance      to authenticated;
