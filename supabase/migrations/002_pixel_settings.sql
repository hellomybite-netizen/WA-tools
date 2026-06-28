-- Run this in Supabase SQL Editor after 001_initial_schema.sql

create table public.pixel_settings (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null unique,
  meta_pixel_id    text,
  meta_access_token text,
  updated_at       timestamptz not null default now()
);

alter table public.pixel_settings enable row level security;
create policy "user: manage own pixel settings" on public.pixel_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
