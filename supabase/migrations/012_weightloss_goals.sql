-- ============================================================
-- Migration 012 — Weight Loss Tracker (reframed Health tracker):
-- goal weight / height / target date on health_goals, plus
-- body measurements and exercise logs
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

alter table public.health_goals
  add column if not exists goal_weight_kg numeric,
  add column if not exists height_cm numeric,
  add column if not exists target_date date;

create table if not exists public.weightloss_measurements (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  date       date not null,
  waist_cm   numeric,
  chest_cm   numeric,
  hips_cm    numeric,
  arms_cm    numeric,
  thighs_cm  numeric,
  created_at timestamptz default now()
);

create table if not exists public.weightloss_exercise_logs (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  date            date not null,
  activity        text not null,
  duration_min    integer not null,
  calories_burned integer,
  created_at      timestamptz default now()
);

alter table public.weightloss_measurements   enable row level security;
alter table public.weightloss_exercise_logs  enable row level security;

create policy "weightloss_measurements: own rows" on public.weightloss_measurements
  for all using (auth.uid() = user_id);
create policy "weightloss_exercise_logs: own rows" on public.weightloss_exercise_logs
  for all using (auth.uid() = user_id);
