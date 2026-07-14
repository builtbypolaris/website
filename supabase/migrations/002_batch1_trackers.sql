-- ============================================================
-- Migration 002 — Batch 1 trackers: savings, study, mood
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── SAVINGS (nabung & cicilan) ──────────────────────────────

create table if not exists public.savings_goals (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  emoji         text default '🎯',
  target_amount numeric not null,
  created_at    timestamptz default now()
);

create table if not exists public.savings_deposits (
  id         uuid default gen_random_uuid() primary key,
  goal_id    uuid references public.savings_goals(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  amount     numeric not null,
  note       text default '',
  date       date not null,
  created_at timestamptz default now()
);

create table if not exists public.installments (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  item_name      text not null,
  total_amount   numeric not null,
  monthly_amount numeric not null,
  due_day        integer not null check (due_day between 1 and 31),
  created_at     timestamptz default now()
);

create table if not exists public.installment_payments (
  installment_id uuid references public.installments(id) on delete cascade not null,
  user_id        uuid references auth.users(id) on delete cascade not null,
  month          text not null,  -- 'YYYY-MM'
  paid_at        date not null,
  primary key (installment_id, month)
);

-- ── STUDY (exam / study tracker) ────────────────────────────

create table if not exists public.subjects (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  color      text default '#C4B5FD',
  exam_date  date,
  created_at timestamptz default now()
);

create table if not exists public.study_sessions (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  subject_id       uuid references public.subjects(id) on delete cascade not null,
  duration_minutes integer not null check (duration_minutes > 0),
  notes            text default '',
  date             date not null,
  created_at       timestamptz default now()
);

-- ── MOOD ────────────────────────────────────────────────────

create table if not exists public.mood_entries (
  id       uuid default gen_random_uuid() primary key,
  user_id  uuid references auth.users(id) on delete cascade not null,
  mood     integer not null check (mood between 1 and 5),
  tags     text[] default '{}' not null,
  note     text default '',
  entry_at timestamptz default now() not null
);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────

alter table public.savings_goals        enable row level security;
alter table public.savings_deposits     enable row level security;
alter table public.installments         enable row level security;
alter table public.installment_payments enable row level security;
alter table public.subjects             enable row level security;
alter table public.study_sessions       enable row level security;
alter table public.mood_entries         enable row level security;

create policy "savings_goals: own rows" on public.savings_goals
  for all using (auth.uid() = user_id);

create policy "savings_deposits: own rows" on public.savings_deposits
  for all using (auth.uid() = user_id);

create policy "installments: own rows" on public.installments
  for all using (auth.uid() = user_id);

create policy "installment_payments: own rows" on public.installment_payments
  for all using (auth.uid() = user_id);

create policy "subjects: own rows" on public.subjects
  for all using (auth.uid() = user_id);

create policy "study_sessions: own rows" on public.study_sessions
  for all using (auth.uid() = user_id);

create policy "mood_entries: own rows" on public.mood_entries
  for all using (auth.uid() = user_id);
