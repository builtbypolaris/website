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
create table if not exists public.characters (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  tracker_type text not null check (tracker_type in ('financial', 'todo', 'habit')),
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

-- ============================================================
-- ROW LEVEL SECURITY  (users can only touch their own rows)
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.characters       enable row level security;
alter table public.transactions     enable row level security;
alter table public.tasks            enable row level security;
alter table public.habits           enable row level security;
alter table public.habit_completions enable row level security;

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

-- ============================================================
-- AUTO-CREATE CHARACTER ROWS WHEN PROFILE IS CREATED
-- ============================================================
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer as $$
begin
  insert into public.characters (user_id, tracker_type)
  values
    (new.id, 'financial'),
    (new.id, 'todo'),
    (new.id, 'habit');
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();
