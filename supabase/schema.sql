-- SAP · Phase 2 cloud schema (run this in Supabase → SQL Editor)
-- Row Level Security means each user can ONLY read/write their own rows.
-- You (project owner) see everything from the Supabase dashboard on your laptop.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,   -- the whole profile object
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  data jsonb not null default '{}'::jsonb,   -- water, steps, sleep, todos…
  updated_at timestamptz default now(),
  primary key (user_id, day)
);

create table if not exists photos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  slot text not null,            -- body_front, face_left, hair_top…
  taken_on date not null default current_date,
  storage_path text not null,    -- path in the 'photos' storage bucket
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table days enable row level security;
alter table photos enable row level security;

create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own days" on days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own photos" on photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage: create a PRIVATE bucket named 'photos' in the dashboard, then:
create policy "own photo files" on storage.objects
  for all using (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'photos' and auth.uid()::text = (storage.foldername(name))[1]);
