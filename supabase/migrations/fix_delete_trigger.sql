-- ==============================================================================
-- FIX: ALLOW TRANSACTIONS TO BE DELETED
-- In PostgreSQL, a BEFORE DELETE trigger MUST return OLD.
-- Returning NEW (which is NULL for deletes) silently cancels the delete operation!
-- ==============================================================================

create or replace function public.check_sufficient_funds()
returns trigger as $$
declare
  v_donations numeric(12, 2);
  v_expenses numeric(12, 2);
  v_current_holding numeric(12, 2);
begin
  -- Serialize balance-changing writes so concurrent expenses cannot overdraw
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
    -- CRITICAL: A BEFORE DELETE trigger MUST return OLD!
    return old;
  end if;

  return new;
end;
$$ language plpgsql;