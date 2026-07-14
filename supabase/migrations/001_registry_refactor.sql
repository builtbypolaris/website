-- ============================================================
-- Migration 001 — Registry refactor
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- (For databases created with the original supabase-schema.sql)
-- ============================================================

-- Widen characters: drop the CHECK so future tracker batches need no DDL.
alter table public.characters drop constraint if exists characters_tracker_type_check;

-- Retire eager character creation. Character rows are now created lazily:
-- getCharacter() returns a default when no row exists, saveCharacter() upserts.
drop trigger if exists on_profile_created on public.profiles;
drop function if exists public.handle_new_profile();

-- Payments moved to Lynk.id (off-site checkout, manual unlock via
-- profiles.owned_templates). The old Midtrans edge functions are deleted;
-- if a `payments` table exists from that era it can be dropped:
drop table if exists public.payments;
