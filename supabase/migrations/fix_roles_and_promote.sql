-- ==============================================================================
-- FIX: 3-TIER ROLE SYSTEM (Admin -> Committee -> Devotee)
-- Run this in Supabase SQL Editor to enable Admin promotion of Committee members
-- ==============================================================================

-- 1. Remove the old check constraint that only allowed ('admin', 'viewer')
alter table public.profiles drop constraint if exists profiles_role_check;

-- 2. Add the 3-tier check constraint
alter table public.profiles add constraint profiles_role_check 
  check (role in ('admin', 'committee', 'devotee'));

-- 3. Set default role for new signups to 'devotee'
alter table public.profiles alter column role set default 'devotee';

-- 4. Convert any legacy 'viewer' roles to 'devotee'
update public.profiles set role = 'devotee' where role = 'viewer';

-- 5. Helper function: Admin check
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 6. Helper function: Finance manager check (Admin OR Committee)
create or replace function public.can_manage_finance()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'committee')
  );
end;
$$ language plpgsql security definer;

-- 7. Profile RLS Policies:
-- Allow authenticated users to view profiles (so Admin can see list in Roles modal)
drop policy if exists "Allow authenticated to view profiles" on public.profiles;
drop policy if exists "Allow users to view own profile or admins to view all" on public.profiles;
create policy "Allow authenticated to view profiles"
  on public.profiles for select
  using (true);

-- Allow only Admins to update profiles (promote/demote roles)
drop policy if exists "Allow only admins to update profiles" on public.profiles;
drop policy if exists "Allow admins to update profiles" on public.profiles;
drop policy if exists "Allow update on profiles" on public.profiles;
create policy "Allow only admins to update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- 8. Transaction RLS Policies:
drop policy if exists "Allow committee and admin to insert transactions" on public.transactions;
drop policy if exists "Allow admins to insert transactions" on public.transactions;
create policy "Allow committee and admin to insert transactions"
  on public.transactions for insert
  with check (public.can_manage_finance());

drop policy if exists "Allow committee and admin to update transactions" on public.transactions;
drop policy if exists "Allow admins to update transactions" on public.transactions;
create policy "Allow committee and admin to update transactions"
  on public.transactions for update
  using (public.can_manage_finance())
  with check (public.can_manage_finance());

drop policy if exists "Allow committee and admin to delete transactions" on public.transactions;
drop policy if exists "Allow admins to delete transactions" on public.transactions;
create policy "Allow committee and admin to delete transactions"
  on public.transactions for delete
  using (public.can_manage_finance());

-- 9. Automatic Profile Creation on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'devotee' end
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;