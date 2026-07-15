-- ============================================================
-- Migration 005 — Crowns come from completed pet cycles
-- (prestige), not missions. Run AFTER 004.
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Crowns are derived: 1 completed 10-stage pet cycle (prestige) = 1 crown.
-- The stored counter is dropped; impact totals sum prestige directly.

alter table public.profiles drop column if exists crowns;

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
