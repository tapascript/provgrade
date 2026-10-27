-- Provgrade demo schema ("The next user of your React app may not be a user").
-- Run once in the Supabase SQL editor. Safe to re-run (create if not exists).

create extension if not exists pgcrypto;

create table if not exists public.environments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text not null,
  db_type text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  current_tier text not null,
  created_at timestamptz not null default now()
);

-- Ensure created_at exists on pre-existing tables (idempotent).
alter table public.environments add column if not exists created_at timestamptz not null default now();
alter table public.subscriptions add column if not exists created_at timestamptz not null default now();

-- Make sure current_tier is plain text. The original demo only had Pro/Enterprise,
-- so if the column was created as an enum, convert it so 'Free' is allowed too.
alter table public.subscriptions alter column current_tier type text using current_tier::text;

-- Realtime: expose these tables so the dashboard receives live INSERT/UPDATE/DELETE.
-- NOTE: these two lines error if the table is already in the publication; that is
-- harmless and can be ignored on re-runs.
alter publication supabase_realtime add table public.environments;
alter publication supabase_realtime add table public.subscriptions;

-- Realtime only sends the PK for UPDATE/DELETE unless replica identity is FULL.
alter table public.environments replica identity full;
alter table public.subscriptions replica identity full;

-- Let the browser (anon key) read these tables for the dashboard + realtime.
-- Writes still go through the service-role key on the server.
alter table public.environments enable row level security;
alter table public.subscriptions enable row level security;

create policy "environments are readable" on public.environments
  for select using (true);

create policy "subscriptions are readable" on public.subscriptions
  for select using (true);
