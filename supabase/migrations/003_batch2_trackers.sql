-- ============================================================
-- Migration 003 — Batch 2-3 trackers:
-- freelance, health, cycle, travel, baby, pet
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── FREELANCE ───────────────────────────────────────────────

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

-- ── HEALTH ──────────────────────────────────────────────────

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

-- ── CYCLE ───────────────────────────────────────────────────

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

-- ── TRAVEL ──────────────────────────────────────────────────

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

-- ── BABY ────────────────────────────────────────────────────

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

-- ── PET ─────────────────────────────────────────────────────

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

-- ── ROW LEVEL SECURITY ──────────────────────────────────────

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
