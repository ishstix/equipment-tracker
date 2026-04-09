-- Equipment Tracker Schema
-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- 1. Equipment table
create table if not exists equipment (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text,
  total_quantity integer not null default 1 check (total_quantity >= 1),
  available_quantity integer not null default 1 check (available_quantity >= 0),
  condition text not null default 'good' check (condition in ('good', 'needs_repair', 'out_of_commission')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Checkout requests table
create table if not exists checkout_requests (
  id uuid default gen_random_uuid() primary key,
  requester_name text not null,
  requester_email text not null,
  checkout_date timestamptz default now() not null,
  due_date timestamptz not null,
  status text not null default 'active' check (status in ('active', 'returned', 'overdue')),
  notes text,
  created_at timestamptz default now() not null
);

-- 3. Checkout items table (one row per item per request)
create table if not exists checkout_items (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references checkout_requests(id) on delete cascade not null,
  equipment_id uuid references equipment(id) on delete cascade not null,
  quantity integer not null default 1 check (quantity >= 1),
  returned boolean not null default false,
  return_date timestamptz,
  created_at timestamptz default now() not null
);

-- 4. RPC: decrement available quantity
create or replace function decrement_available(eq_id uuid, amount integer)
returns void language sql as $$
  update equipment
  set available_quantity = greatest(available_quantity - amount, 0),
      updated_at = now()
  where id = eq_id;
$$;

-- 5. RPC: increment available quantity
create or replace function increment_available(eq_id uuid, amount integer)
returns void language sql as $$
  update equipment
  set available_quantity = least(available_quantity + amount, total_quantity),
      updated_at = now()
  where id = eq_id;
$$;

-- 6. Auto-update updated_at on equipment
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists equipment_updated_at on equipment;
create trigger equipment_updated_at
  before update on equipment
  for each row execute function update_updated_at();

-- 7. Row Level Security (RLS) — allow all reads, restrict writes to service role
alter table equipment enable row level security;
alter table checkout_requests enable row level security;
alter table checkout_items enable row level security;

-- Public can read equipment
create policy "Public read equipment" on equipment for select using (true);

-- Service role bypasses RLS for all operations (used by server-side API)
-- (service role key in SUPABASE_SERVICE_ROLE_KEY always bypasses RLS)

-- Public can insert checkout requests and items (for the checkout form)
create policy "Public insert requests" on checkout_requests for insert with check (true);
create policy "Public insert items" on checkout_items for insert with check (true);

-- Public can read requests (needed for the POST flow to return data)
create policy "Public read requests" on checkout_requests for select using (true);
create policy "Public read items" on checkout_items for select using (true);
