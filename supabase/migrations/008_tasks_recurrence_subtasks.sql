-- ============================================================
-- Migration 008 — To-Do tracker: recurring tasks + subtasks
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

alter table public.tasks add column if not exists recurrence text not null default 'none' check (recurrence in ('none', 'daily', 'weekly'));

create table if not exists public.task_subtasks (
  id          uuid default gen_random_uuid() primary key,
  task_id     uuid references public.tasks(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  completed   boolean default false not null,
  order_index integer default 0 not null,
  created_at  timestamptz default now()
);

alter table public.task_subtasks enable row level security;

drop policy if exists "task_subtasks: own rows" on public.task_subtasks;
create policy "task_subtasks: own rows" on public.task_subtasks
  for all using (auth.uid() = user_id);
