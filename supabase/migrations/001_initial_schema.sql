-- ============================================================
-- WA Tools — Initial Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ─── TABLES ──────────────────────────────────────────────────

create table public.user_profiles (
  id               uuid references auth.users(id) on delete cascade primary key,
  email            text not null,
  name             text,
  role             text not null default 'admin',   -- admin | advertiser | cs
  tier             text not null default 'trial',   -- trial | starter | pro | agency
  trial_ends_at    timestamptz not null default (now() + interval '30 days'),
  created_at       timestamptz not null default now()
);

create table public.links (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  slug             text unique not null,
  label            text,
  destination_phone text not null,
  message          text,
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

create table public.rotators (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  slug             text unique not null,
  label            text,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);

create table public.rotator_cs (
  id               uuid primary key default gen_random_uuid(),
  rotator_id       uuid references public.rotators(id) on delete cascade not null,
  name             text not null,
  phone            text not null,
  active           boolean not null default true,
  sort_order       int not null default 0
);

create table public.click_events (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null,
  link_id          uuid references public.links(id) on delete set null,
  rotator_id       uuid references public.rotators(id) on delete set null,
  contact_phone    text,         -- filled when WABA message arrives
  utm_source       text,
  utm_medium       text,
  utm_campaign     text,
  ip               text,
  user_agent       text,
  clicked_at       timestamptz not null default now()
);

create table public.conversions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null,
  click_id         uuid references public.click_events(id) on delete set null,
  link_id          uuid references public.links(id) on delete set null,
  currency         text not null default 'IDR',
  amount           numeric not null default 0,
  note             text,
  converted_by     uuid references auth.users(id) on delete set null,
  converted_at     timestamptz not null default now()
);

-- ─── INDEXES ─────────────────────────────────────────────────

create index on public.links (user_id);
create index on public.links (slug);
create index on public.rotators (user_id);
create index on public.click_events (user_id, clicked_at desc);
create index on public.click_events (link_id);
create index on public.conversions (user_id, converted_at desc);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────
-- Fires on every new user regardless of signup method (email, OAuth, etc.)

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, email, name, role, tier, trial_ends_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'admin',
    'trial',
    now() + interval '30 days'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

alter table public.user_profiles enable row level security;
alter table public.links         enable row level security;
alter table public.rotators      enable row level security;
alter table public.rotator_cs    enable row level security;
alter table public.click_events  enable row level security;
alter table public.conversions   enable row level security;

-- user_profiles
create policy "user: read own"   on public.user_profiles for select using (auth.uid() = id);
create policy "user: update own" on public.user_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
-- insert is done by the trigger (security definer), no policy needed

-- links
create policy "user: manage own links"        on public.links for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "public: read active links"     on public.links for select using (active = true);

-- rotators
create policy "user: manage own rotators"     on public.rotators    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- rotator_cs (owned through the rotator)
create policy "user: manage own rotator_cs"  on public.rotator_cs  for all using (
  exists (select 1 from public.rotators r where r.id = rotator_id and r.user_id = auth.uid())
);

-- click_events (writes by service role via API routes; reads by owner)
create policy "user: read own clicks"         on public.click_events for select using (auth.uid() = user_id);
create policy "service: insert clicks"        on public.click_events for insert with check (true);

-- conversions
create policy "user: manage own conversions"  on public.conversions  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "service: insert conversions"   on public.conversions  for insert with check (true);
