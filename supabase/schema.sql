-- JobDeck Database Schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists homeowner_leads (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text,
  trade_type text not null,
  job_description text not null,
  location text,
  postal_code text not null,
  budget_range text,
  timeline text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists contractors (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  email text not null unique,
  trade_type text not null,
  service_area text not null,  -- comma-separated postal prefixes e.g. "L,M,K"
  plan_type text not null default 'starter', -- 'starter' | 'pro'
  lead_credits_used integer not null default 0,
  lead_credits_limit integer not null default 15,
  stripe_customer_id text,
  stripe_subscription_id text,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists lead_deliveries (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references homeowner_leads(id) on delete cascade,
  contractor_id uuid not null references contractors(id) on delete cascade,
  delivered_at timestamptz,
  delivery_status text not null default 'pending', -- 'pending' | 'sent' | 'failed'
  plan_type text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_homeowner_leads_postal_code on homeowner_leads(postal_code);
create index if not exists idx_homeowner_leads_trade_type on homeowner_leads(trade_type);
create index if not exists idx_contractors_trade_type on contractors(trade_type);
create index if not exists idx_contractors_is_active on contractors(is_active);
create index if not exists idx_lead_deliveries_lead_id on lead_deliveries(lead_id);
create index if not exists idx_lead_deliveries_contractor_id on lead_deliveries(contractor_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table homeowner_leads enable row level security;
alter table contractors enable row level security;
alter table lead_deliveries enable row level security;

-- homeowner_leads: anyone can insert, only service role can read
create policy "Anyone can submit leads"
  on homeowner_leads for insert
  with check (true);

create policy "Service role can read leads"
  on homeowner_leads for select
  using (auth.role() = 'service_role');

-- contractors: contractors can read their own row; service role has full access
create policy "Contractors can view own profile"
  on contractors for select
  using (auth.uid()::text = id::text);

create policy "Service role full access to contractors"
  on contractors for all
  using (auth.role() = 'service_role');

-- lead_deliveries: contractors can see their own deliveries; service role full access
create policy "Contractors can view own deliveries"
  on lead_deliveries for select
  using (
    contractor_id in (
      select id from contractors where id::text = auth.uid()::text
    )
  );

create policy "Service role full access to deliveries"
  on lead_deliveries for all
  using (auth.role() = 'service_role');

-- ============================================================
-- MONTHLY CREDIT RESET FUNCTION
-- ============================================================
-- Schedule this with pg_cron or a Supabase Edge Function cron:
-- cron: "0 0 1 * *"  (midnight on 1st of every month)

create or replace function reset_starter_lead_credits()
returns void
language plpgsql
security definer
as $$
begin
  update contractors
  set lead_credits_used = 0
  where plan_type = 'starter';
end;
$$;

-- If pg_cron is enabled in your Supabase project:
-- select cron.schedule('reset-starter-credits', '0 0 1 * *', 'select reset_starter_lead_credits()');
