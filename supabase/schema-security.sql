-- SAP · Security hardening
-- Run this whole file in Supabase → SQL Editor. Safe to re-run.
--
-- Every change here closes a hole that was found by actually performing the
-- attack against this project, not by reading the code and worrying. Each one
-- says what it stops and what it costs you.
--
-- Nothing in here changes what YOU can see. The Supabase dashboard runs as
-- service_role, which bypasses RLS entirely, so your admin views are unaffected.


-- ============ 1. THE AUDIT LOG MUST NOT BE FORGEABLE ============
--
-- Before this, any signed-in user could POST straight to /rest/v1/ai_messages
-- and insert a row with attacker-chosen reply_text, an image_paths array
-- pointing at someone else's file, and a backdated created_at. Confirmed with a
-- real request: it returned 201. That row then appeared in admin_activity,
-- admin_chat and admin_users exactly like a genuine one.
--
-- A log the subject can write to is worse than no log at all, because you would
-- have trusted it. The ai-chat edge function writes these rows as service_role,
-- which bypasses RLS, so real logging is completely unaffected.
--
-- COST: the one-time recovery of pre-cloud chat threads from a device's
-- localStorage is gone. That was a nice-to-have for your visibility, never
-- user-facing, and it is not worth a forgeable audit trail.

drop policy if exists "insert own ai messages" on ai_messages;
revoke insert, update, delete on ai_messages from anon, authenticated;


-- ============ 2. NO SERVER-SIDE REQUESTS TO ARBITRARY HOSTS ============
--
-- push_subscriptions.endpoint was fully attacker-controlled, and the
-- send-reminders cron function — running as service_role — POSTs to whatever
-- is stored there, every 15 minutes, forever. Confirmed: inserting an endpoint
-- of http://169.254.169.254/latest/meta-data/ returned 201. That is the cloud
-- metadata address; on many platforms it hands out credentials.
--
-- This constrains the endpoint to the five real push services. Anything else is
-- rejected at insert time.
--
-- COST: none for real users. Every genuine browser push endpoint is one of
-- these hosts.

alter table push_subscriptions drop constraint if exists push_endpoint_host;
alter table push_subscriptions add constraint push_endpoint_host check (
  endpoint ~ '^https://([a-z0-9-]+\.)?(fcm\.googleapis\.com|android\.googleapis\.com|updates\.push\.services\.mozilla\.com|[a-z0-9-]+\.notify\.windows\.com|[a-z0-9-]+\.push\.apple\.com)/'
);

-- The same rule inside the JSON blob the function actually hands to webpush.
-- The column and the blob are separate values and only the column was checked
-- above, so a mismatched pair would otherwise walk straight past it.
create or replace function push_sub_endpoint_matches()
returns trigger language plpgsql as $$
begin
  if coalesce(new.subscription->>'endpoint', '') <> coalesce(new.endpoint, '') then
    raise exception 'subscription.endpoint must match the endpoint column';
  end if;
  return new;
end $$;

drop trigger if exists push_sub_endpoint_check on push_subscriptions;
create trigger push_sub_endpoint_check
  before insert or update on push_subscriptions
  for each row execute function push_sub_endpoint_matches();


-- ============ 3. STOP ONE USER FLOODING THE EVENT TRAIL ============
--
-- app_events stays client-writable — that is how the activity trail works, and
-- a user forging their own screen-view events harms nobody. What it should not
-- allow is unbounded text, which is a cheap way to bloat your database.

alter table app_events drop constraint if exists app_events_sane;
alter table app_events add constraint app_events_sane check (
  length(event) <= 64 and pg_column_size(meta) <= 4096
);


-- ============ 4. VERIFY (run these and read the output) ============
--
-- 1. Confirm a normal user can no longer write the audit log. Run this in the
--    SQL Editor to see the remaining policies — there should be NO insert
--    policy on ai_messages:
--
--      select tablename, policyname, cmd
--        from pg_policies
--       where tablename in ('ai_messages','app_events','push_subscriptions')
--       order by tablename, cmd;
--
-- 2. Confirm the push constraint actually bites:
--
--      insert into push_subscriptions (user_id, endpoint, subscription)
--      values (auth.uid(), 'http://169.254.169.254/', '{}'::jsonb);
--
--    That must fail with a check-constraint violation. If it succeeds, this
--    file did not run.
--
-- 3. Your admin views are unchanged — open Table Editor → admin_activity and
--    confirm you still see rows.
