-- ============================================================
-- Migration 007 — To-Do tracker: Kanban status column
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

alter table public.tasks add column if not exists status text not null default 'todo' check (status in ('todo', 'in_progress', 'done'));

update public.tasks set status = 'done' where completed = true and status = 'todo';
