-- ============================================================
-- Migration 009 — To-Do tracker: project tag
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

alter table public.tasks add column if not exists project text;
