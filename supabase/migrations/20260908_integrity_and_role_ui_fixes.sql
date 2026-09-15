-- Keep the original organizer as an administrator on existing deployments that
-- were initialized after the three-tier migration made every signup a devotee.
update public.profiles
set role = 'admin'
where id = (
  select id from public.profiles order by created_at asc, id asc limit 1
)
and not exists (
  select 1 from public.profiles where role = 'admin'
);

-- The first account is the bootstrap administrator; subsequent registrations
-- are read-only devotees until an administrator grants committee access.
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

-- Serialize writes that affect the shared balance. Without this lock, two
-- simultaneous expenses can each pass the old balance check and overdraw it.
create or replace function public.check_sufficient_funds()
returns trigger as $$
declare
  v_donations numeric(12, 2);
  v_expenses numeric(12, 2);
  v_current_holding numeric(12, 2);
begin
  perform pg_advisory_xact_lock(hashtext('public.transactions.balance'));

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
    if old.type = 'donation' and (v_donations - v_expenses) < 0 then
      raise exception 'Cannot delete donation. Remaining funds would be less than total expenses.';
    end if;
    return old;
  end if;

  return new;
end;
$$ language plpgsql;

-- Do not let a role update remove the final administrator. This protects the
-- ledger even if someone calls the API directly rather than using the UI.
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
