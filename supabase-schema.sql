-- Jalankan di Supabase SQL Editor

-- Table: user_profiles (role-based access control)
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'advertiser' check (role in ('admin', 'advertiser', 'cs')),
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;

-- Users can read their own profile
create policy "Users read own profile" on user_profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users update own profile" on user_profiles
  for update using (auth.uid() = id);

-- Admin can read all profiles (for user management page)
create policy "Admin reads all profiles" on user_profiles
  for select using (
    exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
  );

-- Admin can update all profiles (for role assignment)
create policy "Admin updates all profiles" on user_profiles
  for update using (
    exists (select 1 from user_profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Table: wa_links
create table if not exists wa_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  slug text unique not null,
  phone_number text not null,
  message text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz default now()
);

alter table wa_links enable row level security;
create policy "Users manage own links" on wa_links
  for all using (auth.uid() = user_id);

-- Table: link_clicks
create table if not exists link_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid references wa_links(id) on delete cascade,
  ip text,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  cs_assigned text,
  clicked_at timestamptz default now()
);

alter table link_clicks enable row level security;
create policy "Users see own link clicks" on link_clicks
  for select using (
    exists (select 1 from wa_links where id = link_clicks.link_id and user_id = auth.uid())
  );

-- Table: rotator_groups
create table if not exists rotator_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  members jsonb default '[]',
  current_index int default 0,
  created_at timestamptz default now()
);

alter table rotator_groups enable row level security;
create policy "Users manage own rotators" on rotator_groups
  for all using (auth.uid() = user_id);

-- Table: bio_links
create table if not exists bio_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  username text unique not null,
  title text,
  subtitle text,
  buttons jsonb default '[]',
  theme jsonb default '{}',
  created_at timestamptz default now()
);

alter table bio_links enable row level security;
create policy "Users manage own bio" on bio_links
  for all using (auth.uid() = user_id);
create policy "Public can read bio links" on bio_links
  for select using (true);

-- Update link_clicks: tambah kolom konversi
alter table link_clicks
  add column if not exists fbclid text,
  add column if not exists converted boolean default false,
  add column if not exists conversion_value numeric,
  add column if not exists converted_at timestamptz;

-- Table: pixel_settings
create table if not exists pixel_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  meta_pixel_id text,
  meta_access_token text,
  updated_at timestamptz default now()
);

alter table pixel_settings enable row level security;
create policy "Users manage own pixel settings" on pixel_settings
  for all using (auth.uid() = user_id);

-- Table: conversions
create table if not exists conversions (
  id uuid primary key default gen_random_uuid(),
  click_id uuid references link_clicks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  value numeric not null,
  currency text default 'IDR',
  order_id text,
  created_at timestamptz default now()
);

alter table conversions enable row level security;
create policy "Users manage own conversions" on conversions
  for all using (auth.uid() = user_id);

-- Table: wallets (saldo per user)
create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  balance numeric default 0 not null,
  updated_at timestamptz default now()
);

alter table wallets enable row level security;
create policy "Users manage own wallet" on wallets
  for all using (auth.uid() = user_id);

-- Table: wallet_ledger (riwayat semua debit/kredit)
create table if not exists wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('topup', 'debit', 'refund', 'bonus')),
  amount numeric not null,
  description text,
  order_id text,
  created_at timestamptz default now()
);

alter table wallet_ledger enable row level security;
create policy "Users see own ledger" on wallet_ledger
  for select using (auth.uid() = user_id);

-- Table: topup_transactions (status pembayaran Midtrans)
create table if not exists topup_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  order_id text unique not null,
  amount numeric not null,
  bonus numeric default 0,
  total_credited numeric not null,
  status text default 'pending' check (status in ('pending','success','cancel','deny','expire')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table topup_transactions enable row level security;
create policy "Users see own topup transactions" on topup_transactions
  for select using (auth.uid() = user_id);
