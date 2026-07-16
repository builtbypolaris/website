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
  cause         text check (cause in ('social', 'environment')),
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

-- 3b. FINANCIAL BUDGETS + RECURRING BILLS
create table if not exists public.financial_budgets (
  user_id       uuid references auth.users(id) on delete cascade not null,
  category      text not null,
  monthly_limit numeric not null,
  created_at    timestamptz default now(),
  primary key (user_id, category)
);

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
  month        text not null,
  paid_at      date not null,
  primary key (recurring_id, month)
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

-- ── Batch 2-3 trackers: freelance, health, cycle, travel, baby, pet ──

-- 15-17. FREELANCE
create table if not exists public.clients (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  contact    text default '',
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  client_id  uuid references public.clients(id) on delete cascade not null,
  name       text not null,
  deadline   date,
  rate_type  text default 'fixed' check (rate_type in ('hourly', 'fixed')),
  rate       numeric default 0 not null,
  status     text default 'active' check (status in ('active', 'done')),
  created_at timestamptz default now()
);

create table if not exists public.work_logs (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  hours      numeric,
  amount     numeric not null,
  note       text default '',
  date       date not null,
  created_at timestamptz default now()
);

-- 18-21. HEALTH
create table if not exists public.meals (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  meal_type  text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food       text not null,
  calories   integer,
  date       date not null,
  created_at timestamptz default now()
);

create table if not exists public.water_logs (
  user_id uuid references auth.users(id) on delete cascade not null,
  date    date not null,
  glasses integer default 0 not null,
  primary key (user_id, date)
);

create table if not exists public.weight_logs (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  weight_kg  numeric not null,
  date       date not null,
  created_at timestamptz default now()
);

create table if not exists public.health_goals (
  user_id        uuid references auth.users(id) on delete cascade primary key,
  calorie_target integer default 2000 not null,
  water_target   integer default 8 not null
);

-- 22-23. CYCLE
create table if not exists public.periods (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  start_date date not null,
  end_date   date,
  created_at timestamptz default now()
);

create table if not exists public.cycle_logs (
  user_id  uuid references auth.users(id) on delete cascade not null,
  date     date not null,
  flow     integer default 0 not null check (flow between 0 and 3),
  symptoms text[] default '{}' not null,
  note     text default '',
  primary key (user_id, date)
);

-- 24-26. TRAVEL
create table if not exists public.trips (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  destination text not null,
  emoji       text default '✈️',
  start_date  date not null,
  end_date    date not null,
  budget      numeric default 0 not null,
  created_at  timestamptz default now()
);

create table if not exists public.itinerary_items (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  trip_id    uuid references public.trips(id) on delete cascade not null,
  day        date not null,
  time       text,
  title      text not null,
  location   text default '',
  created_at timestamptz default now()
);

create table if not exists public.trip_expenses (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  trip_id    uuid references public.trips(id) on delete cascade not null,
  amount     numeric not null,
  category   text not null,
  note       text default '',
  date       date not null,
  created_at timestamptz default now()
);

-- 27-30. BABY
create table if not exists public.babies (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  emoji      text default '👶',
  birthdate  date not null,
  created_at timestamptz default now()
);

create table if not exists public.baby_events (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  baby_id    uuid references public.babies(id) on delete cascade not null,
  event_type text not null check (event_type in ('feeding', 'sleep_start', 'sleep_end', 'diaper', 'pumping')),
  event_at   timestamptz default now() not null,
  note       text default ''
);

create table if not exists public.growth_entries (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  baby_id    uuid references public.babies(id) on delete cascade not null,
  date       date not null,
  weight_kg  numeric,
  height_cm  numeric,
  created_at timestamptz default now()
);

create table if not exists public.milestones (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  baby_id    uuid references public.babies(id) on delete cascade not null,
  title      text not null,
  date       date not null,
  created_at timestamptz default now()
);

-- 31-34. PET
create table if not exists public.pets (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  species    text default 'other' not null,
  emoji      text default '🐾',
  birthdate  date,
  created_at timestamptz default now()
);

create table if not exists public.pet_events (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  pet_id     uuid references public.pets(id) on delete cascade not null,
  event_type text not null check (event_type in ('feeding', 'walk', 'grooming', 'vet', 'medication', 'play')),
  event_at   timestamptz default now() not null,
  note       text default ''
);

create table if not exists public.pet_care_items (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  pet_id     uuid references public.pets(id) on delete cascade not null,
  title      text not null,
  due_date   date not null,
  done       boolean default false not null,
  created_at timestamptz default now()
);

create table if not exists public.pet_weights (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  pet_id     uuid references public.pets(id) on delete cascade not null,
  date       date not null,
  weight_kg  numeric not null,
  created_at timestamptz default now()
);

-- ── GAMIFICATION: missions / streaks / achievements ─────────

-- Weekly quests; a completed mission pays bonus XP (crowns come from
-- completed pet cycles — see impact_totals below)
create table if not exists public.missions (
  user_id      uuid references auth.users(id) on delete cascade not null,
  mission_id   text not null,
  week_start   date not null,
  tracker_type text,
  progress     integer default 0 not null,
  target       integer not null,
  completed_at timestamptz,
  created_at   timestamptz default now(),
  primary key (user_id, mission_id, week_start)
);

create table if not exists public.streaks (
  user_id      uuid references auth.users(id) on delete cascade not null,
  tracker_type text not null,
  current      integer default 0 not null,
  best         integer default 0 not null,
  last_active  date,
  primary key (user_id, tracker_type)
);

create table if not exists public.achievements (
  user_id      uuid references auth.users(id) on delete cascade not null,
  tracker_type text not null,
  badge_id     text not null,
  earned_at    timestamptz default now() not null,
  primary key (user_id, tracker_type, badge_id)
);

-- Community impact totals (1 crown = 1 completed pet cycle = prestige)
create or replace function public.impact_totals()
returns table (social bigint, environment bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce(sum(c.prestige) filter (where p.cause = 'social'), 0)      as social,
    coalesce(sum(c.prestige) filter (where p.cause = 'environment'), 0) as environment
  from public.characters c
  join public.profiles p on p.id = c.user_id;
$$;

grant execute on function public.impact_totals() to anon, authenticated;

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
alter table public.clients          enable row level security;
alter table public.projects         enable row level security;
alter table public.work_logs        enable row level security;
alter table public.meals            enable row level security;
alter table public.water_logs       enable row level security;
alter table public.weight_logs      enable row level security;
alter table public.health_goals     enable row level security;
alter table public.periods          enable row level security;
alter table public.cycle_logs       enable row level security;
alter table public.trips            enable row level security;
alter table public.itinerary_items  enable row level security;
alter table public.trip_expenses    enable row level security;
alter table public.babies           enable row level security;
alter table public.baby_events      enable row level security;
alter table public.growth_entries   enable row level security;
alter table public.milestones       enable row level security;
alter table public.pets             enable row level security;
alter table public.pet_events       enable row level security;
alter table public.pet_care_items   enable row level security;
alter table public.pet_weights      enable row level security;
alter table public.financial_budgets           enable row level security;
alter table public.financial_recurring          enable row level security;
alter table public.financial_recurring_payments enable row level security;
alter table public.missions         enable row level security;
alter table public.streaks          enable row level security;
alter table public.achievements     enable row level security;

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

create policy "clients: own rows" on public.clients
  for all using (auth.uid() = user_id);
create policy "projects: own rows" on public.projects
  for all using (auth.uid() = user_id);
create policy "work_logs: own rows" on public.work_logs
  for all using (auth.uid() = user_id);
create policy "meals: own rows" on public.meals
  for all using (auth.uid() = user_id);
create policy "water_logs: own rows" on public.water_logs
  for all using (auth.uid() = user_id);
create policy "weight_logs: own rows" on public.weight_logs
  for all using (auth.uid() = user_id);
create policy "health_goals: own rows" on public.health_goals
  for all using (auth.uid() = user_id);
create policy "periods: own rows" on public.periods
  for all using (auth.uid() = user_id);
create policy "cycle_logs: own rows" on public.cycle_logs
  for all using (auth.uid() = user_id);
create policy "trips: own rows" on public.trips
  for all using (auth.uid() = user_id);
create policy "itinerary_items: own rows" on public.itinerary_items
  for all using (auth.uid() = user_id);
create policy "trip_expenses: own rows" on public.trip_expenses
  for all using (auth.uid() = user_id);
create policy "babies: own rows" on public.babies
  for all using (auth.uid() = user_id);
create policy "baby_events: own rows" on public.baby_events
  for all using (auth.uid() = user_id);
create policy "growth_entries: own rows" on public.growth_entries
  for all using (auth.uid() = user_id);
create policy "milestones: own rows" on public.milestones
  for all using (auth.uid() = user_id);
create policy "pets: own rows" on public.pets
  for all using (auth.uid() = user_id);
create policy "pet_events: own rows" on public.pet_events
  for all using (auth.uid() = user_id);
create policy "pet_care_items: own rows" on public.pet_care_items
  for all using (auth.uid() = user_id);
create policy "pet_weights: own rows" on public.pet_weights
  for all using (auth.uid() = user_id);
create policy "financial_budgets: own rows" on public.financial_budgets
  for all using (auth.uid() = user_id);
create policy "financial_recurring: own rows" on public.financial_recurring
  for all using (auth.uid() = user_id);
create policy "financial_recurring_payments: own rows" on public.financial_recurring_payments
  for all using (auth.uid() = user_id);
create policy "missions: own rows" on public.missions
  for all using (auth.uid() = user_id);
create policy "streaks: own rows" on public.streaks
  for all using (auth.uid() = user_id);
create policy "achievements: own rows" on public.achievements
  for all using (auth.uid() = user_id);
