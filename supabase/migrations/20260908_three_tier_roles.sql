-- ==============================================================================
-- 3-TIER ROLE SYSTEM: ADMIN (You) -> COMMITTEE (Finance Managers) -> DEVOTEE (Viewers)
-- ==============================================================================

-- 1. Update check constraint on profiles to support admin, committee, devotee
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check 
  check (role in ('admin', 'committee', 'devotee'));

-- Set default role for new profiles to 'devotee'
alter table public.profiles alter column role set default 'devotee';

-- Convert any existing 'viewer' to 'devotee'
update public.profiles set role = 'devotee' where role = 'viewer';

-- 2. Helper functions
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

-- 3. Update RLS policies on transactions:
-- Devotees & Public can SELECT
-- Committee & Admin can INSERT, UPDATE, DELETE
drop policy if exists "Allow admins to insert transactions" on public.transactions;
drop policy if exists "Allow committee and admin to insert transactions" on public.transactions;
create policy "Allow committee and admin to insert transactions"
  on public.transactions for insert
  with check (public.can_manage_finance());

drop policy if exists "Allow admins to update transactions" on public.transactions;
drop policy if exists "Allow committee and admin to update transactions" on public.transactions;
create policy "Allow committee and admin to update transactions"
  on public.transactions for update
  using (public.can_manage_finance())
  with check (public.can_manage_finance());

drop policy if exists "Allow admins to delete transactions" on public.transactions;
drop policy if exists "Allow committee and admin to delete transactions" on public.transactions;
create policy "Allow committee and admin to delete transactions"
  on public.transactions for delete
  using (public.can_manage_finance());

-- 4. RLS policies on profiles (ONLY ADMIN CAN PROMOTE/DEMOTE ROLES!)
drop policy if exists "Allow update on profiles" on public.profiles;
drop policy if exists "Allow admins to update profiles" on public.profiles;
drop policy if exists "Allow only admins to update profiles" on public.profiles;
create policy "Allow only admins to update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Trigger for new user signup: default to 'devotee'
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    'devotee'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;