-- Run in Supabase SQL Editor

create table public.rotators (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null default 'Rotator Utama',
  slug        text unique not null,
  schedule    jsonb,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.rotator_members (
  id          uuid primary key default gen_random_uuid(),
  rotator_id  uuid references public.rotators(id) on delete cascade not null,
  name        text not null,
  phone       text not null,
  active      boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.rotators enable row level security;
alter table public.rotator_members enable row level security;

create policy "user: manage own rotators" on public.rotators
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user: manage own rotator members" on public.rotator_members
  for all using (
    exists (select 1 from public.rotators r where r.id = rotator_id and r.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.rotators r where r.id = rotator_id and r.user_id = auth.uid())
  );

-- Public read for redirect (anon needs to read active rotators + members)
create policy "public: read active rotators" on public.rotators
  for select using (active = true);

create policy "public: read active rotator members" on public.rotator_members
  for select using (active = true);
