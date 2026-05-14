-- ============================================
-- Fix: Don't deduct points on borrow, only on confirm
-- Pending transactions should NOT move money
-- ============================================

-- 1. borrow_ticket: Remove early deduction
create or replace function public.borrow_ticket(p_ticket_id uuid)
returns json as $$
declare
  v_ticket record;
  v_user record;
  v_points_cost integer := 5;
  v_transaction_id uuid;
  v_expires_at timestamptz;
begin
  -- Lock the ticket row
  select * into v_ticket
  from public.tickets
  where id = p_ticket_id
  for update;

  if v_ticket is null or v_ticket.status != 'available' then
    raise exception 'Ticket is not available';
  end if;

  if v_ticket.expires_at < now() then
    raise exception 'Ticket has expired';
  end if;

  -- Check user exists and has enough points (but don't deduct yet)
  select * into v_user
  from public.users
  where id = auth.uid()
  for update;

  if v_user is null then
    raise exception 'User not found';
  end if;

  if v_user.points_balance < v_points_cost then
    raise exception 'Insufficient points';
  end if;

  if v_ticket.uploader_id = auth.uid() then
    raise exception 'Cannot borrow your own ticket';
  end if;

  -- Calculate expiration: MIN(4 hours, time until 23:59 today)
  v_expires_at := least(
    now() + interval '4 hours',
    (date_trunc('day', now()) + interval '1 day' - interval '1 second')
  );

  -- Create pending transaction (NO points deduction)
  insert into public.transactions (ticket_id, borrower_id, points_amount, status, expires_at)
  values (p_ticket_id, auth.uid(), v_points_cost, 'pending', v_expires_at)
  returning id into v_transaction_id;

  -- Update ticket status
  update public.tickets
  set status = 'in_use'
  where id = p_ticket_id;

  return json_build_object(
    'transaction_id', v_transaction_id,
    'barcode_image_url', v_ticket.barcode_image_url,
    'expires_at', v_expires_at,
    'points_remaining', v_user.points_balance
  );
end;
$$ language plpgsql security definer;

-- 2. confirm_result: Deduct only on valid, no refund on invalid
create or replace function public.confirm_result(
  p_transaction_id uuid,
  p_is_valid boolean,
  p_failure_reason text default null
)
returns json as $$
declare
  v_transaction record;
  v_ticket record;
begin
  select * into v_transaction
  from public.transactions
  where id = p_transaction_id
  for update;

  if v_transaction is null or v_transaction.status != 'pending' then
    raise exception 'Transaction not found or already confirmed';
  end if;

  if v_transaction.borrower_id != auth.uid() then
    raise exception 'Not authorized';
  end if;

  if v_transaction.expires_at < now() then
    raise exception 'Transaction has expired';
  end if;

  select * into v_ticket
  from public.tickets
  where id = v_transaction.ticket_id;

  if p_is_valid then
    -- Deduct from borrower
    update public.users
    set points_balance = points_balance - v_transaction.points_amount,
        total_borrows = total_borrows + 1
    where id = v_transaction.borrower_id;

    -- Credit uploader
    update public.users
    set points_balance = points_balance + v_transaction.points_amount,
        reputation = least(reputation + 2, 100),
        successful_uses = successful_uses + 1
    where id = v_ticket.uploader_id;

    update public.transactions
    set status = 'confirmed_valid',
        confirmed_at = now()
    where id = p_transaction_id;

    update public.tickets
    set status = 'completed'
    where id = v_ticket.id;
  else
    -- Ticket didn't work: NO money was moved, just record the failure
    update public.users
    set reputation = greatest(reputation - 10, 0)
    where id = v_ticket.uploader_id;

    update public.transactions
    set status = 'confirmed_invalid',
        failure_reason = p_failure_reason,
        confirmed_at = now()
    where id = p_transaction_id;

    update public.tickets
    set status = 'invalid'
    where id = v_ticket.id;

    if p_failure_reason = 'already_scanned' then
      update public.users
      set reputation = greatest(reputation - 10, 0)
      where id = v_ticket.uploader_id;
    end if;
  end if;

  return json_build_object(
    'success', true,
    'is_valid', p_is_valid,
    'points_refunded', not p_is_valid
  );
end;
$$ language plpgsql security definer;

-- 3. auto_settle_expired_transactions: No refund needed (points were never deducted)
create or replace function public.auto_settle_expired_transactions()
returns integer as $$
declare
  v_count integer := 0;
  v_transaction record;
begin
  for v_transaction in
    select t.*, tk.uploader_id
    from public.transactions t
    join public.tickets tk on t.ticket_id = tk.id
    where t.status = 'pending'
      and t.expires_at < now()
  loop
    -- No refund: points were never deducted on borrow

    update public.transactions
    set status = 'auto_settled',
        failure_reason = 'expired',
        confirmed_at = now()
    where id = v_transaction.id;

    update public.tickets
    set status = 'expired'
    where id = v_transaction.ticket_id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$ language plpgsql security definer;
