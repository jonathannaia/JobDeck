-- Building Permits table
-- Run this in the Supabase SQL editor

create table if not exists building_permits (
  id uuid primary key default uuid_generate_v4(),
  velocity text not null default 'Fast',   -- 'Fast' | 'Slow'
  trade text not null,
  city text not null,
  address text not null,
  postal text,
  permit_type text,
  description text,
  status text,
  issued_date date,
  est_cost text,
  builder text,
  permit_num text unique,
  created_at timestamptz not null default now()
);

create index if not exists idx_building_permits_trade on building_permits(trade);
create index if not exists idx_building_permits_city on building_permits(city);
create index if not exists idx_building_permits_velocity on building_permits(velocity);
create index if not exists idx_building_permits_issued_date on building_permits(issued_date desc);

alter table building_permits enable row level security;

-- Anyone can see anonymized permit metadata (no address revealed)
create policy "Public can view permits"
  on building_permits for select
  using (true);

-- Only service role can insert/update
create policy "Service role full access to permits"
  on building_permits for all
  using (auth.role() = 'service_role');

-- Track which contractor claimed which permit
create table if not exists permit_claims (
  id uuid primary key default uuid_generate_v4(),
  permit_id uuid not null references building_permits(id) on delete cascade,
  contractor_id uuid not null references contractors(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  stripe_payment_intent_id text,
  unique(permit_id, contractor_id)
);

alter table permit_claims enable row level security;

create policy "Contractors can view own permit claims"
  on permit_claims for select
  using (contractor_id::text = auth.uid()::text);

create policy "Service role full access to permit claims"
  on permit_claims for all
  using (auth.role() = 'service_role');
