-- SAP · Phase 3 — admin visibility
-- Run this whole file in Supabase → SQL Editor. Safe to re-run.
--
-- What it adds:
--   ai_messages  every AI request+reply, from every screen, written server-side
--   app_events   lightweight activity trail (screen opens, key actions)
--   admin_*      views that make the Table Editor readable at a glance
--
-- Users still cannot read each other's rows. YOU see everything because the
-- SQL Editor / Table Editor run as service_role, which bypasses RLS.

-- ============ 1. TABLES ============

create table if not exists ai_messages (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  source       text not null default 'chat',   -- chat | diet | style | care | workout | analysis | inventory | facehair | backfill
  user_text    text,
  reply_text   text,
  image_count  int  not null default 0,
  image_paths  text[],                          -- archived copies in the 'photos' bucket
  model        text,
  latency_ms   int,
  error        text,
  created_at   timestamptz default now()
);

create index if not exists ai_messages_user_time on ai_messages (user_id, created_at desc);
create index if not exists ai_messages_time      on ai_messages (created_at desc);

create table if not exists app_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  event      text not null,                      -- screen_view | meal_added | workout_done | …
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists app_events_user_time on app_events (user_id, created_at desc);
create index if not exists app_events_time      on app_events (created_at desc);

-- ============ 2. RLS ============
-- Insert-only for the owner, and NO select policy: a user can write their own
-- rows but can never read anyone's — including their own — back through the app.

alter table ai_messages enable row level security;
alter table app_events  enable row level security;

drop policy if exists "insert own ai messages" on ai_messages;
create policy "insert own ai messages" on ai_messages
  for insert with check (auth.uid() = user_id);

drop policy if exists "insert own events" on app_events;
create policy "insert own events" on app_events
  for insert with check (auth.uid() = user_id);

-- ============ 3. HELPERS ============
-- Never let one malformed value break a whole admin view.

create or replace function safe_num(t text) returns numeric
language plpgsql immutable as $$
begin
  return t::numeric;
exception when others then
  return null;
end $$;

-- Turn a raw slot ('body_front', 'chat_diet-photo') into something readable.
-- The 12 onboarding slots are all shape_angle, so the generic rule covers them:
--   body_front → Body · Front      hair_top → Hair · Top
create or replace function photo_label(slot text) returns text
language sql immutable as $$
  select case
    when slot is null            then 'Unknown'
    when slot like 'wardrobe%'   then 'Wardrobe item'
    when slot like 'chat\_%'     then 'Sent to AI · ' ||
      coalesce(nullif(replace(substr(slot, 6), '-', ' '), ''), 'chat')
    else initcap(replace(replace(slot, '_initial', ''), '_', ' · '))
  end
$$;

-- ============ 4. ADMIN VIEWS ============

-- Who your users are, and how engaged they each are. Start here.
create or replace view admin_users as
select
  u.id                                                              as user_id,
  u.email,
  p.data->>'name'                                                   as name,
  p.data->>'gender'                                                 as gender,
  p.data->>'dob'                                                    as dob,
  safe_num(p.data->>'height')                                       as height_cm,
  safe_num(p.data->>'weight')                                       as weight_kg,
  p.data->'goals'                                                   as goals,
  p.data->>'dietType'                                               as diet,
  p.data->'allergies'                                               as allergies,
  p.data->'medications'                                             as medications,
  p.data->>'location'                                               as location,
  u.created_at                                                      as signed_up,
  u.last_sign_in_at,
  (select count(*)   from days        d  where d.user_id  = u.id)   as days_logged,
  (select max(d.day) from days        d  where d.user_id  = u.id)   as last_day_logged,
  (select count(*)   from ai_messages m  where m.user_id  = u.id)   as ai_messages,
  (select max(m.created_at) from ai_messages m where m.user_id = u.id) as last_ai_at,
  (select count(*)   from photos      ph where ph.user_id = u.id)   as photos,
  (p.data ? 'analysis')                                             as has_analysis
from auth.users u
left join profiles p on p.id = u.id;

-- Live feed: newest AI interaction first, across all users. Truncated to scan fast.
create or replace view admin_activity as
select
  m.created_at,
  u.email,
  p.data->>'name'         as name,
  m.source,
  m.image_count           as imgs,
  left(m.user_text,  300) as user_said,
  left(m.reply_text, 300) as ai_replied,
  m.error,
  m.latency_ms
from ai_messages m
join auth.users u  on u.id = m.user_id
left join profiles p on p.id = m.user_id;

-- Full untruncated transcripts, grouped per user in chronological order.
create or replace view admin_chat as
select
  u.email,
  p.data->>'name' as name,
  m.created_at,
  m.source,
  m.user_text,
  m.reply_text,
  m.image_count,
  m.image_paths
from ai_messages m
join auth.users u  on u.id = m.user_id
left join profiles p on p.id = m.user_id;

-- Everything users log day by day, flattened out of the jsonb blob.
create or replace view admin_days as
select
  u.email,
  p.data->>'name'                     as name,
  d.day,
  safe_num(d.data->>'water')          as water,
  safe_num(d.data->>'steps')          as steps,
  safe_num(d.data->>'sleepHours')     as sleep_hours,
  safe_num(d.data->>'calsIn')         as cals_in,
  safe_num(d.data->>'calsOut')        as cals_out,
  safe_num(d.data->>'weightKg')       as weight_kg,
  d.data->>'mood'                     as mood,
  d.data->'symptoms'                  as symptoms,
  jsonb_array_length(coalesce(d.data->'meals', '[]'::jsonb)) as meal_count,
  d.data->'meals'                     as meals,
  d.data->'todos'                     as todos,
  d.updated_at
from days d
join auth.users u  on u.id = d.user_id
left join profiles p on p.id = d.user_id;

-- Every stored photo with a readable label, so you never have to decode a
-- filename. storage_path is exactly where it sits in the 'photos' bucket.
create or replace view admin_photos as
select
  u.email,
  pr.data->>'name'        as name,
  photo_label(ph.slot)    as label,
  case
    when ph.storage_path like '%/chat/%'    then 'AI chat'
    when ph.slot like 'wardrobe%'           then 'Wardrobe'
    when ph.storage_path like '%\_initial.jpg' then 'Onboarding'
    else 'Progress'
  end                     as kind,
  ph.taken_on,
  ph.slot,
  ph.storage_path,
  ph.created_at
from photos ph
join auth.users u   on u.id = ph.user_id
left join profiles pr on pr.id = ph.user_id;

-- Which of the 12 onboarding shots each user has, and which are still missing.
create or replace view admin_photo_coverage as
select
  u.email,
  pr.data->>'name'      as name,
  s.slot,
  photo_label(s.slot)   as label,
  exists (
    select 1 from photos ph
    where ph.user_id = u.id and ph.slot in (s.slot, s.slot || '_initial')
  )                     as have_photo,
  (select max(ph.taken_on) from photos ph
    where ph.user_id = u.id and ph.slot = s.slot) as latest
from auth.users u
left join profiles pr on pr.id = u.id
cross join (values
  ('body_front'), ('body_left'), ('body_right'), ('body_back'),
  ('face_front'), ('face_left'), ('face_right'),
  ('hair_front'), ('hair_left'), ('hair_right'), ('hair_back'), ('hair_top')
) as s(slot);

-- Raw activity trail (screen opens and key actions).
create or replace view admin_events as
select e.created_at, u.email, p.data->>'name' as name, e.event, e.meta
from app_events e
join auth.users u  on u.id = e.user_id
left join profiles p on p.id = e.user_id;

-- One row per user per day: did they show up, and what did they do?
create or replace view admin_engagement as
select
  u.email,
  date_trunc('day', a.at)::date as day,
  count(*) filter (where a.kind = 'ai')    as ai_calls,
  count(*) filter (where a.kind = 'event') as events
from auth.users u
join (
  select user_id, created_at as at, 'ai'::text    as kind from ai_messages
  union all
  select user_id, created_at as at, 'event'::text as kind from app_events
) a on a.user_id = u.id
group by u.email, 2;

-- ============ 5. LOCK THE VIEWS DOWN ============
-- Views run with their owner's rights, so they would otherwise leak every
-- user's data to any logged-in client. Only service_role may read them.

revoke all on admin_users           from anon, authenticated;
revoke all on admin_activity        from anon, authenticated;
revoke all on admin_chat            from anon, authenticated;
revoke all on admin_days            from anon, authenticated;
revoke all on admin_events          from anon, authenticated;
revoke all on admin_engagement      from anon, authenticated;
revoke all on admin_photos          from anon, authenticated;
revoke all on admin_photo_coverage  from anon, authenticated;

grant select on admin_users, admin_activity, admin_chat,
                admin_days, admin_events, admin_engagement,
                admin_photos, admin_photo_coverage to service_role;
