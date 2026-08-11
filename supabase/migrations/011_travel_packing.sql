-- ============================================================
-- Migration 011 — Travel Planner packing checklist
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.travel_packing_items (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  trip_id    uuid references public.trips(id) on delete cascade not null,
  text       text not null,
  category   text default 'other' not null,
  packed     boolean default false not null,
  created_at timestamptz default now()
);

alter table public.travel_packing_items enable row level security;

create policy "travel_packing_items: own rows" on public.travel_packing_items
  for all using (auth.uid() = user_id);
