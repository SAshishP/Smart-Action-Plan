-- SAP · Phase 2.5 — push reminders
-- Run PART 1 as-is. Edit PART 2 (two placeholders) before running it.

-- ============ PART 1: subscriptions table ============

create table if not exists push_subscriptions (
  endpoint text primary key,        -- unique per phone
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription jsonb not null,      -- the phone's push credentials
  tz text default 'UTC',            -- user's timezone (auto-detected by the app)
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;

create policy "own push subs" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ PART 2: run the sender every 15 minutes ============
-- First: Dashboard → Database → Extensions → enable  pg_cron  and  pg_net
-- Then edit the TWO placeholders below and run this block:
--   YOURPROJECT   = your project ref (the xxxx in https://xxxx.supabase.co)
--   YOUR_SECRET   = the same value you set as the CRON_SECRET function secret

select cron.schedule(
  'sap-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://YOURPROJECT.supabase.co/functions/v1/send-reminders',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "YOUR_SECRET"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- To pause reminders later:  select cron.unschedule('sap-reminders');
