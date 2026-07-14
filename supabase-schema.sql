-- ============================================================
-- Nova by Polaris Studio — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES  (extends auth.users with display info)
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  username      text unique not null,
  full_name     text,
  age           integer,
  location      text,
  owned_templates text[] default '{}' not null,
  created_at    timestamptz default now()
);

-- 2. CHARACTERS  (xp / happiness / prestige per tracker per user)
-- tracker_type is intentionally unconstrained: valid ids live in
-- src/novo/types.ts (TemplateId). Rows are created lazily on first save.
create table if not exists public.characters (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  tracker_type text not null,
  xp           integer default 0 not null,
  happiness    integer default 80 not null,
  prestige     integer default 0 not null,
  unique (user_id, tracker_type)
);

-- 3. TRANSACTIONS  (financial tracker)
create table if not exists public.transactions (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  type        text not null check (type in ('income', 'expense')),
  amount      numeric not null,
  category    text not null,
  description text default '',
  date        date not null,
  created_at  timestamptz default now()
);

-- 4. TASKS  (todo tracker)
create table if not exists public.tasks (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  title        text not null,
  completed    boolean default false not null,
  priority     text default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date     date,
  created_at   timestamptz default now(),
  completed_at timestamptz
);

-- 5. HABITS
create table if not exists public.habits (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  icon       text default '✨',
  frequency  text default 'daily' check (frequency in ('daily', 'weekly')),
  created_at timestamptz default now()
);

-- 6. HABIT COMPLETIONS  (one row per habit per day completed)
create table if not exists public.habit_completions (
  habit_id       uuid references public.habits(id) on delete cascade not null,
  user_id        uuid references auth.users(id) on delete cascade not null,
  completed_date date not null,
  primary key (habit_id, completed_date)
);

-- Payments happen off-site on Lynk.id (lynk.id/builtbypolaris). Unlocking a
-- tracker = adding its id to profiles.owned_templates for that user.

-- ── Batch 1 trackers: savings (nabung & cicilan), study, mood ──

-- 8. SAVINGS GOALS
create table if not exists public.savings_goals (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  emoji         text default '🎯',
  target_amount numeric not null,
  created_at    timestamptz default now()
);

-- 9. SAVINGS DEPOSITS
create table if not exists public.savings_deposits (
  id         uuid default gen_random_uuid() primary key,
  goal_id    uuid references public.savings_goals(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  amount     numeric not null,
  note       text default '',
  date       date not null,
  created_at timestamptz default now()
);

-- 10. INSTALLMENTS (cicilan)
create table if not exists public.installments (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  item_name      text not null,
  total_amount   numeric not null,
  monthly_amount numeric not null,
  due_day        integer not null check (due_day between 1 and 31),
  created_at     timestamptz default now()
);

-- 11. INSTALLMENT PAYMENTS (one row per installment per month paid)
create table if not exists public.installment_payments (
  installment_id uuid references public.installments(id) on delete cascade not null,
  user_id        uuid references auth.users(id) on delete cascade not null,
  month          text not null,  -- 'YYYY-MM'
  paid_at        date not null,
  primary key (installment_id, month)
);

-- 12. SUBJECTS (study tracker)
create table if not exists public.subjects (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  color      text default '#C4B5FD',
  exam_date  date,
  created_at timestamptz default now()
);

-- 13. STUDY SESSIONS
create table if not exists public.study_sessions (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  subject_id       uuid references public.subjects(id) on delete cascade not null,
  duration_minutes integer not null check (duration_minutes > 0),
  notes            text default '',
  date             date not null,
  created_at       timestamptz default now()
);

-- 14. MOOD ENTRIES (multiple per day allowed)
create table if not exists public.mood_entries (
  id       uuid default gen_random_uuid() primary key,
  user_id  uuid references auth.users(id) on delete cascade not null,
  mood     integer not null check (mood between 1 and 5),
  tags     text[] default '{}' not null,
  note     text default '',
  entry_at timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY  (users can only touch their own rows)
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.characters       enable row level security;
alter table public.transactions     enable row level security;
alter table public.tasks            enable row level security;
alter table public.habits           enable row level security;
alter table public.habit_completions enable row level security;
alter table public.savings_goals        enable row level security;
alter table public.savings_deposits     enable row level security;
alter table public.installments         enable row level security;
alter table public.installment_payments enable row level security;
alter table public.subjects             enable row level security;
alter table public.study_sessions       enable row level security;
alter table public.mood_entries         enable row level security;

-- profiles
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id);

-- characters
create policy "characters: own rows" on public.characters
  for all using (auth.uid() = user_id);

-- transactions
create policy "transactions: own rows" on public.transactions
  for all using (auth.uid() = user_id);

-- tasks
create policy "tasks: own rows" on public.tasks
  for all using (auth.uid() = user_id);

-- habits
create policy "habits: own rows" on public.habits
  for all using (auth.uid() = user_id);

-- habit_completions
create policy "habit_completions: own rows" on public.habit_completions
  for all using (auth.uid() = user_id);

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
