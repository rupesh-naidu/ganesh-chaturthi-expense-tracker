-- ==============================================================================
-- GANESH CHATURTHI 2026: DATABASE SCHEMA, RLS POLICIES & EXPENSE PROTECTION
-- ==============================================================================

-- 1. Create Profiles Table (Tied to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text not null check (role in ('admin', 'committee', 'devotee')) default 'devotee',
  created_at timestamptz default now()
);

-- 2. Create Transactions Table
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('donation', 'expense')),
  name text not null check (trim(name) <> ''),
  amount numeric(12, 2) not null check (amount > 0),
  description text not null check (trim(description) <> ''),
  created_at timestamptz default now(),
  created_by uuid references auth.users(id),
  updated_at timestamptz default now(),
  updated_by uuid references auth.users(id)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;

-- 3. Helper Function to Check if Current Authenticated User is an Admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

create or replace function public.can_manage_finance()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'committee')
  );
end;
$$ language plpgsql security definer;

-- 4. RLS Policies for Profiles
drop policy if exists "Allow users to view own profile or admins to view all" on public.profiles;
create policy "Allow users to view own profile or admins to view all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Allow admins to update profiles" on public.profiles;
create policy "Allow admins to update profiles"
  on public.profiles for update
  using (public.is_admin());

-- 5. RLS Policies for Transactions
-- A. SELECT: Public read access for community transparency (Devotees and Viewers)
drop policy if exists "Allow everyone to read transactions" on public.transactions;
create policy "Allow everyone to read transactions"
  on public.transactions for select
  using (true);

-- B. INSERT: Committee and admin only
drop policy if exists "Allow admins to insert transactions" on public.transactions;
drop policy if exists "Allow committee and admin to insert transactions" on public.transactions;
create policy "Allow committee and admin to insert transactions"
  on public.transactions for insert
  with check (public.can_manage_finance());

-- C. UPDATE: Committee and admin only
drop policy if exists "Allow admins to update transactions" on public.transactions;
drop policy if exists "Allow committee and admin to update transactions" on public.transactions;
create policy "Allow committee and admin to update transactions"
  on public.transactions for update
  using (public.can_manage_finance())
  with check (public.can_manage_finance());

-- D. DELETE: Committee and admin only
drop policy if exists "Allow admins to delete transactions" on public.transactions;
drop policy if exists "Allow committee and admin to delete transactions" on public.transactions;
create policy "Allow committee and admin to delete transactions"
  on public.transactions for delete
  using (public.can_manage_finance());

-- 6. Database-Level Expense Protection Trigger (Negative Balance Prevention)
create or replace function public.check_sufficient_funds()
returns trigger as $$
declare
  v_donations numeric(12, 2);
  v_expenses numeric(12, 2);
  v_current_holding numeric(12, 2);
begin
  -- Serialize balance-changing writes so concurrent expenses cannot both pass
  -- the balance check using the same stale total.
  perform pg_advisory_xact_lock(hashtext('public.transactions.balance'));

  -- Compute current totals excluding the row being modified
  select
    coalesce(sum(case when type = 'donation' then amount else 0 end), 0),
    coalesce(sum(case when type = 'expense' then amount else 0 end), 0)
  into v_donations, v_expenses
  from public.transactions
  where id <> coalesce(new.id, old.id);

  if tg_op = 'INSERT' then
    if new.type = 'expense' then
      v_current_holding := v_donations - v_expenses;
      if new.amount > v_current_holding then
        raise exception 'Insufficient funds. Current holding is ₹%', v_current_holding;
      end if;
    end if;

  elsif tg_op = 'UPDATE' then
    if new.type = 'donation' then
      v_donations := v_donations + new.amount;
    else
      v_expenses := v_expenses + new.amount;
    end if;

    if (v_donations - v_expenses) < 0 then
      raise exception 'Insufficient funds. Operation would result in a negative balance.';
    end if;

  elsif tg_op = 'DELETE' then
    if old.type = 'donation' then
      if (v_donations - v_expenses) < 0 then
        raise exception 'Cannot delete donation. Remaining funds would be less than total expenses.';
      end if;
    end if;
  end if;

  -- A BEFORE DELETE trigger must return OLD. Returning NEW (which is NULL for
  -- deletes) silently cancels the deletion.
  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_check_sufficient_funds on public.transactions;
create trigger trg_check_sufficient_funds
  before insert or update or delete on public.transactions
  for each row execute function public.check_sufficient_funds();

-- 7. Automatic User Profile Creation on Signup Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    -- First signed up user automatically becomes admin; all later users are devotees.
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'devotee' end
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ensure a direct API request cannot demote the final administrator and leave
-- the project without anyone able to manage committee access.
create or replace function public.prevent_last_admin_removal()
returns trigger as $$
begin
  if old.role = 'admin' and new.role <> 'admin' and not exists (
    select 1 from public.profiles where role = 'admin' and id <> old.id
  ) then
    raise exception 'At least one administrator is required.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_prevent_last_admin_removal on public.profiles;
create trigger trg_prevent_last_admin_removal
  before update of role on public.profiles
  for each row execute function public.prevent_last_admin_removal();

-- 8. Enable Realtime Publications for Transactions
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'transactions'
  ) then
    alter publication supabase_realtime add table public.transactions;
  end if;
end $$;

alter table public.transactions replica identity full;

-- 9. Seed Initial Benchmark Transactions (₹72,500 Donations, ₹23,750 Expenses = ₹48,750 Current Holding)
insert into public.transactions (type, name, amount, description, created_at)
select * from (
  values
    ('donation'::text, 'Anand Sharma'::text, 44000.00::numeric, 'Principal idol sponsor contribution'::text, now() - interval '36 hours'),
    ('expense'::text, 'Sound System Vendor'::text, 6450.00::numeric, 'Audio speakers and lighting rental'::text, now() - interval '30 hours'),
    ('donation'::text, 'Society Building A & B'::text, 25000.00::numeric, 'Collective wing donation'::text, now() - interval '24 hours'),
    ('expense'::text, 'Vikram (Decorator)'::text, 14000.00::numeric, 'Mandap & Tent decoration advance'::text, now() - interval '18 hours'),
    ('expense'::text, 'Rahul'::text, 800.00::numeric, 'Pooja materials'::text, now() - interval '2 hours'),
    ('donation'::text, 'Priya'::text, 2000.00::numeric, 'Contribution'::text, now() - interval '1 hour'),
    ('donation'::text, 'Anil'::text, 500.00::numeric, 'Contribution'::text, now() - interval '25 minutes'),
    ('expense'::text, 'Suresh'::text, 2500.00::numeric, 'Flowers and decoration'::text, now() - interval '12 minutes'),
    ('donation'::text, 'Ravi'::text, 1000.00::numeric, 'Ganesh Chaturthi contribution'::text, now() - interval '30 seconds')
) as t(type, name, amount, description, created_at)
where not exists (select 1 from public.transactions limit 1);
