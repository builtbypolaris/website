-- ============================================================
-- Migration 010 — Grant tracker access from the Lynk.id sales
-- sheet, via an Apps Script trigger (see scripts/lynk-sheet-sync).
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Every row Apps Script successfully processes gets one entry here.
-- This is the real idempotency guard: the Sheet itself doesn't
-- prevent the script from reprocessing a row twice (e.g. if it's
-- re-run manually), but a duplicate (email, tracker_id) pair here
-- will fail the unique constraint and short-circuit safely.
create table if not exists public.lynk_purchase_events (
  id           uuid default gen_random_uuid() primary key,
  email        text not null,
  tracker_id   text not null,
  processed_at timestamptz default now() not null,
  unique (email, tracker_id)
);

alter table public.lynk_purchase_events enable row level security;
-- No policies for anon/authenticated — only service_role (which
-- bypasses RLS) can read or write this table.

-- service_role-only: this function grants paid access, so it must
-- never be callable with an authenticated user's own JWT (they could
-- otherwise unlock any tracker for any email).
create or replace function public.grant_tracker_access(
  p_email      text,
  p_tracker_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where lower(email) = lower(p_email) limit 1;

  if v_user_id is null then
    return jsonb_build_object('status', 'error', 'reason', 'user_not_found');
  end if;

  begin
    insert into public.lynk_purchase_events (email, tracker_id) values (p_email, p_tracker_id);
  exception when unique_violation then
    return jsonb_build_object('status', 'already_processed', 'email', p_email, 'tracker_id', p_tracker_id);
  end;

  update public.profiles
  set owned_templates = array(select distinct unnest(owned_templates || array[p_tracker_id]))
  where id = v_user_id;

  return jsonb_build_object('status', 'ok', 'user_id', v_user_id, 'tracker_id', p_tracker_id);
end;
$$;

revoke all on function public.grant_tracker_access(text, text) from public;
revoke all on function public.grant_tracker_access(text, text) from anon, authenticated;
grant execute on function public.grant_tracker_access(text, text) to service_role;
