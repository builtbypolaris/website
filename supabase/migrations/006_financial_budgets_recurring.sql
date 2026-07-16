-- ============================================================
-- Migration 006 — Financial tracker: category budgets + recurring bills
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── BUDGETS (monthly Rp limit per expense category) ─────────

create table if not exists public.financial_budgets (
  user_id      uuid references auth.users(id) on delete cascade not null,
  category     text not null,
  monthly_limit numeric not null,
  created_at   timestamptz default now(),
  primary key (user_id, category)
);

-- ── RECURRING (bills / recurring income, mirrors installments) ──

create table if not exists public.financial_recurring (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  amount     numeric not null,
  type       text not null check (type in ('income', 'expense')),
  category   text not null,
  due_day    integer not null check (due_day between 1 and 31),
  active     boolean default true not null,
  created_at timestamptz default now()
);

create table if not exists public.financial_recurring_payments (
  recurring_id uuid references public.financial_recurring(id) on delete cascade not null,
  user_id      uuid references auth.users(id) on delete cascade not null,
  month        text not null,  -- 'YYYY-MM'
  paid_at      date not null,
  primary key (recurring_id, month)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.financial_budgets            enable row level security;
alter table public.financial_recurring           enable row level security;
alter table public.financial_recurring_payments   enable row level security;

drop policy if exists "financial_budgets: own rows" on public.financial_budgets;
create policy "financial_budgets: own rows" on public.financial_budgets
  for all using (auth.uid() = user_id);

drop policy if exists "financial_recurring: own rows" on public.financial_recurring;
create policy "financial_recurring: own rows" on public.financial_recurring
  for all using (auth.uid() = user_id);

drop policy if exists "financial_recurring_payments: own rows" on public.financial_recurring_payments;
create policy "financial_recurring_payments: own rows" on public.financial_recurring_payments
  for all using (auth.uid() = user_id);
