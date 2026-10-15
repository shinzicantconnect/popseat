-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- Creates the coming_soon table for managing upcoming movie titles

create table if not exists public.coming_soon (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  genre text,
  duration_minutes integer default 120,
  release_date date,
  ticket_price numeric(10,2) default 350,
  directed_by text,
  cast_list text,
  poster_url text,
  created_at timestamptz default now()
);

-- Allow public read access (for the landing page)
alter table public.coming_soon enable row level security;

create policy "Public read access"
  on public.coming_soon for select
  using (true);

create policy "Authenticated users can insert"
  on public.coming_soon for insert
  to authenticated
  with check (true);

create policy "Authenticated users can delete"
  on public.coming_soon for delete
  to authenticated
  using (true);
