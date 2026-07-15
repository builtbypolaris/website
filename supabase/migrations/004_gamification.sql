-- ============================================================
-- Migration 004 — Gamification: missions, crowns, impact cause,
-- streaks, achievements
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── PROFILES: cause + crowns ────────────────────────────────

alter table public.profiles
  add column if not exists cause text check (cause in ('social', 'environment')),
  add column if not exists crowns integer default 0 not null;

-- ── MISSIONS (weekly quests; completed mission = 1 crown) ───

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

alter table public.missions enable row level security;

drop policy if exists "missions_own_rows" on public.missions;
create policy "missions_own_rows" on public.missions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── STREAKS (per tracker) ───────────────────────────────────

create table if not exists public.streaks (
  user_id      uuid references auth.users(id) on delete cascade not null,
  tracker_type text not null,
  current      integer default 0 not null,
  best         integer default 0 not null,
  last_active  date,
  primary key (user_id, tracker_type)
);

alter table public.streaks enable row level security;

drop policy if exists "streaks_own_rows" on public.streaks;
create policy "streaks_own_rows" on public.streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── ACHIEVEMENTS (badges) ───────────────────────────────────

create table if not exists public.achievements (
  user_id      uuid references auth.users(id) on delete cascade not null,
  tracker_type text not null,
  badge_id     text not null,
  earned_at    timestamptz default now() not null,
  primary key (user_id, tracker_type, badge_id)
);

alter table public.achievements enable row level security;

drop policy if exists "achievements_own_rows" on public.achievements;
create policy "achievements_own_rows" on public.achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── PUBLIC IMPACT COUNTERS ──────────────────────────────────
-- Community totals shown on the /studios landing (works logged-out).

create or replace function public.impact_totals()
returns table (social bigint, environment bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce(sum(crowns) filter (where cause = 'social'), 0)      as social,
    coalesce(sum(crowns) filter (where cause = 'environment'), 0) as environment
  from public.profiles;
$$;

grant execute on function public.impact_totals() to anon, authenticated;
