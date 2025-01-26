/*
  # Music Documentation System Schema

  1. New Tables
    - `users`: Store user information
      - `id` (uuid, primary key)
      - `email` (text)
      - `created_at` (timestamp)
    
    - `songs`: Store song information
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `duration` (integer, in seconds)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `timeline_entries`: Store instrument settings at specific times
      - `id` (uuid, primary key)
      - `song_id` (uuid, foreign key)
      - `instrument_type` (text)
      - `start_time` (integer, in seconds)
      - `end_time` (integer, in seconds)
      - `settings` (jsonb)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table (managed by Supabase Auth)
create table if not exists users (
  id uuid references auth.users primary key,
  email text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table users enable row level security;

-- Users can read their own data
create policy "Users can read own data" on users
  for select using (auth.uid() = id);

-- Songs table
create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  title text not null,
  duration integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table songs enable row level security;

-- Users can CRUD their own songs
create policy "Users can CRUD own songs" on songs
  for all using (auth.uid() = user_id);

-- Timeline entries table
create table if not exists timeline_entries (
  id uuid primary key default gen_random_uuid(),
  song_id uuid references songs(id) not null,
  instrument_type text not null,
  start_time integer not null,
  end_time integer not null,
  settings jsonb not null default '{}',
  notes text,
  created_at timestamptz default now(),
  constraint valid_time_range check (start_time < end_time)
);

-- Enable RLS
alter table timeline_entries enable row level security;

-- Users can CRUD their own timeline entries
create policy "Users can CRUD own timeline entries" on timeline_entries
  for all using (
    exists (
      select 1 from songs
      where songs.id = timeline_entries.song_id
      and songs.user_id = auth.uid()
    )
  );