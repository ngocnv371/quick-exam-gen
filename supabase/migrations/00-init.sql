-- ============================================================
-- Quick Exam Gen — initial schema
-- ============================================================

-- ------------------------------------------------------------
-- Utility: auto-update updated_at column
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. profiles
-- ============================================================
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles: owner select"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: owner update"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- 2. projects
-- ============================================================
create table public.projects (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  title       text        not null,
  status      text        not null default 'draft'
                check (status in ('draft', 'extracting', 'ready', 'generating', 'done')),
  metadata    jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

create policy "projects: owner select"
  on public.projects for select
  using (user_id = auth.uid());

create policy "projects: owner insert"
  on public.projects for insert
  with check (user_id = auth.uid());

create policy "projects: owner update"
  on public.projects for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "projects: owner delete"
  on public.projects for delete
  using (user_id = auth.uid());

-- ============================================================
-- 3. coins_transactions  (append-only ledger)
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
-- 4. coins_balance  (materialized running total)
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

-- Initialize balance + profile rows when a new user signs up
create or replace function public.init_user_records()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.coins_balance (user_id, balance)
  values (new.id, 0)
  on conflict do nothing;

  insert into public.profiles (id, display_name)
  values (
		new.id,
		coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
	)
  on conflict do nothing;

  return new;
end;
$$;

create trigger trg_new_user_records
  after insert on auth.users
  for each row execute function public.init_user_records();

-- ============================================================
-- 5. Indexes
-- ============================================================
create index idx_projects_user_id
  on public.projects (user_id);

create index idx_coins_transactions_user_created
  on public.coins_transactions (user_id, created_at desc);

-- ============================================================
-- 6. Grants for authenticated role
-- ============================================================
grant usage on schema public to authenticated;

grant select, insert, update, delete on public.profiles          to authenticated;
grant select, insert, update, delete on public.projects          to authenticated;
grant select                         on public.coins_transactions to authenticated;
grant select                         on public.coins_balance      to authenticated;
