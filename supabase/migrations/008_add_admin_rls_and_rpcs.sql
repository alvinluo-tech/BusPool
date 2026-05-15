-- ============================================
-- Admin RLS policies and RPC functions
-- Grants admins full read/write access to all tables
-- and provides RPC functions for admin operations
-- ============================================

-- ============================================
-- RLS: Admin read/update policies on all tables
-- ============================================

create policy "Admins can read all users"
  on public.users for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

create policy "Admins can update all users"
  on public.users for update
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

create policy "Admins can read all tickets"
  on public.tickets for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

create policy "Admins can update all tickets"
  on public.tickets for update
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

create policy "Admins can delete tickets"
  on public.tickets for delete
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

create policy "Admins can read all transactions"
  on public.transactions for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

create policy "Admins can update all transactions"
  on public.transactions for update
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

create policy "Admins can read all appeals"
  on public.appeals for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

create policy "Admins can update all appeals"
  on public.appeals for update
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

-- ============================================
-- RLS: Admin read/write for admin_logs
-- ============================================

create policy "Admins can read audit logs"
  on public.admin_logs for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

create policy "Admins can insert audit logs"
  on public.admin_logs for insert
  with check (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

-- ============================================
-- RLS: Admin read for notifications
-- ============================================

create policy "Admins can read all notifications"
  on public.notifications for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

-- ============================================
-- Helper: Check if current user is admin
-- ============================================
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid() and is_admin = true
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- RPC: Admin confirm/deny transaction
-- ============================================
create or replace function public.admin_confirm_transaction(
  p_transaction_id uuid,
  p_is_valid boolean,
  p_reason text
)
returns json as $$
declare
  v_transaction record;
  v_ticket record;
  v_admin_id uuid;
begin
  -- Auth check
  v_admin_id := auth.uid();
  if not public.is_admin() then
    raise exception 'Unauthorized: admin access required';
  end if;

  -- Lock the transaction row
  select * into v_transaction
  from public.transactions
  where id = p_transaction_id
  for update;

  if v_transaction is null then
    raise exception 'Transaction not found';
  end if;

  if v_transaction.status not in ('pending') then
    raise exception 'Transaction is not pending (current: %)', v_transaction.status;
  end if;

  -- Get ticket info
  select * into v_ticket
  from public.tickets
  where id = v_transaction.ticket_id;

  if p_is_valid then
    -- Confirm valid: transfer points to uploader
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

    insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
    values (v_admin_id, 'manual_confirm', 'transaction', p_transaction_id,
            jsonb_build_object('decision', 'valid', 'ticket_id', v_transaction.ticket_id, 'borrower_id', v_transaction.borrower_id),
            p_reason);
  else
    -- Confirm invalid: refund borrower, penalize uploader
    update public.users
    set points_balance = points_balance + v_transaction.points_amount
    where id = v_transaction.borrower_id;

    update public.users
    set reputation = greatest(reputation - 10, 0)
    where id = v_ticket.uploader_id;

    update public.transactions
    set status = 'confirmed_invalid',
        failure_reason = 'unknown',
        confirmed_at = now()
    where id = p_transaction_id;

    update public.tickets
    set status = 'invalid'
    where id = v_ticket.id;

    insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
    values (v_admin_id, 'manual_confirm', 'transaction', p_transaction_id,
            jsonb_build_object('decision', 'invalid', 'ticket_id', v_transaction.ticket_id, 'borrower_id', v_transaction.borrower_id),
            p_reason);
  end if;

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;

-- ============================================
-- RPC: Admin revoke transaction
-- ============================================
create or replace function public.admin_revoke_transaction(
  p_transaction_id uuid,
  p_reason text
)
returns json as $$
declare
  v_transaction record;
  v_ticket record;
  v_admin_id uuid;
begin
  v_admin_id := auth.uid();
  if not public.is_admin() then
    raise exception 'Unauthorized: admin access required';
  end if;

  select * into v_transaction
  from public.transactions
  where id = p_transaction_id
  for update;

  if v_transaction is null then
    raise exception 'Transaction not found';
  end if;

  if v_transaction.status not in ('confirmed_valid', 'confirmed_invalid') then
    raise exception 'Can only revoke confirmed transactions (current: %)', v_transaction.status;
  end if;

  select * into v_ticket
  from public.tickets
  where id = v_transaction.ticket_id;

  if v_transaction.status = 'confirmed_valid' then
    -- Reverse valid: deduct from uploader, refund borrower
    update public.users
    set points_balance = greatest(points_balance - v_transaction.points_amount, 0),
        reputation = greatest(reputation - 2, 0),
        successful_uses = greatest(successful_uses - 1, 0)
    where id = v_ticket.uploader_id;

    update public.users
    set points_balance = points_balance + v_transaction.points_amount
    where id = v_transaction.borrower_id;

    -- Reset ticket to available
    update public.tickets
    set status = 'available'
    where id = v_ticket.id;

  elsif v_transaction.status = 'confirmed_invalid' then
    -- Reverse invalid: deduct refund from borrower, restore uploader
    update public.users
    set points_balance = greatest(points_balance - v_transaction.points_amount, 0)
    where id = v_transaction.borrower_id;

    update public.users
    set reputation = least(reputation + 10, 100)
    where id = v_ticket.uploader_id;

    update public.tickets
    set status = 'available'
    where id = v_ticket.id;
  end if;

  -- Mark transaction as auto_settled (revoked)
  update public.transactions
  set status = 'auto_settled',
      confirmed_at = now()
  where id = p_transaction_id;

  insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
  values (v_admin_id, 'revoke_transaction', 'transaction', p_transaction_id,
          jsonb_build_object('previous_status', v_transaction.status, 'ticket_id', v_transaction.ticket_id),
          p_reason);

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;

-- ============================================
-- RPC: Admin review appeal
-- ============================================
create or replace function public.admin_review_appeal(
  p_appeal_id uuid,
  p_decision text,
  p_admin_note text
)
returns json as $$
declare
  v_appeal record;
  v_transaction record;
  v_admin_id uuid;
begin
  v_admin_id := auth.uid();
  if not public.is_admin() then
    raise exception 'Unauthorized: admin access required';
  end if;

  select * into v_appeal
  from public.appeals
  where id = p_appeal_id
  for update;

  if v_appeal is null then
    raise exception 'Appeal not found';
  end if;

  if v_appeal.status != 'pending' then
    raise exception 'Appeal already processed';
  end if;

  if p_decision = 'resolve' then
    -- Resolve: restore appellant reputation
    select * into v_transaction
    from public.transactions
    where id = v_appeal.transaction_id;

    if v_transaction is not null then
      update public.users
      set reputation = least(reputation + 10, 100)
      where id = v_appeal.appellant_id;
    end if;

    update public.appeals
    set status = 'resolved',
        admin_note = p_admin_note
    where id = p_appeal_id;

    insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
    values (v_admin_id, 'review_appeal', 'appeal', p_appeal_id,
            jsonb_build_object('decision', 'resolved', 'transaction_id', v_appeal.transaction_id),
            p_admin_note);
  else
    -- Reject
    update public.appeals
    set status = 'rejected',
        admin_note = p_admin_note
    where id = p_appeal_id;

    insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
    values (v_admin_id, 'review_appeal', 'appeal', p_appeal_id,
            jsonb_build_object('decision', 'rejected', 'transaction_id', v_appeal.transaction_id),
            p_admin_note);
  end if;

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;

-- ============================================
-- RPC: Admin force remove ticket
-- ============================================
create or replace function public.admin_force_remove_ticket(
  p_ticket_id uuid,
  p_reason text
)
returns json as $$
declare
  v_admin_id uuid;
begin
  v_admin_id := auth.uid();
  if not public.is_admin() then
    raise exception 'Unauthorized: admin access required';
  end if;

  update public.tickets
  set status = 'invalid'
  where id = p_ticket_id;

  if not found then
    raise exception 'Ticket not found';
  end if;

  -- Cancel pending transactions for this ticket
  update public.transactions
  set status = 'auto_settled',
      failure_reason = 'expired',
      confirmed_at = now()
  where ticket_id = p_ticket_id
    and status = 'pending';

  insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
  values (v_admin_id, 'force_remove', 'ticket', p_ticket_id,
          jsonb_build_object('action', 'ticket_invalidated'),
          p_reason);

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;

-- ============================================
-- RPC: Admin adjust user points
-- ============================================
create or replace function public.admin_adjust_user_points(
  p_user_id uuid,
  p_amount integer,
  p_reason text
)
returns json as $$
declare
  v_admin_id uuid;
  v_new_balance integer;
begin
  v_admin_id := auth.uid();
  if not public.is_admin() then
    raise exception 'Unauthorized: admin access required';
  end if;

  update public.users
  set points_balance = greatest(points_balance + p_amount, 0)
  where id = p_user_id
  returning points_balance into v_new_balance;

  if not found then
    raise exception 'User not found';
  end if;

  insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
  values (v_admin_id, 'adjust_points', 'user', p_user_id,
          jsonb_build_object('amount', p_amount, 'new_balance', v_new_balance),
          p_reason);

  return json_build_object('success', true, 'new_balance', v_new_balance);
end;
$$ language plpgsql security definer;

-- ============================================
-- RPC: Admin adjust user reputation
-- ============================================
create or replace function public.admin_adjust_user_reputation(
  p_user_id uuid,
  p_value integer,
  p_reason text
)
returns json as $$
declare
  v_admin_id uuid;
  v_old_reputation integer;
begin
  v_admin_id := auth.uid();
  if not public.is_admin() then
    raise exception 'Unauthorized: admin access required';
  end if;

  if p_value < 0 or p_value > 100 then
    raise exception 'Reputation must be between 0 and 100';
  end if;

  select reputation into v_old_reputation
  from public.users
  where id = p_user_id;

  update public.users
  set reputation = p_value
  where id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
  values (v_admin_id, 'adjust_reputation', 'user', p_user_id,
          jsonb_build_object('old_value', v_old_reputation, 'new_value', p_value),
          p_reason);

  return json_build_object('success', true, 'new_value', p_value);
end;
$$ language plpgsql security definer;

-- ============================================
-- RPC: Admin get dashboard stats
-- ============================================
create or replace function public.admin_get_dashboard_stats()
returns json as $$
declare
  v_total_users integer;
  v_total_tickets integer;
  v_active_tickets integer;
  v_pending_appeals integer;
  v_pending_transactions integer;
  v_daily_uploads integer;
  v_daily_borrows integer;
  v_validity_rate numeric;
  v_points_circulating bigint;
begin
  if not public.is_admin() then
    raise exception 'Unauthorized: admin access required';
  end if;

  select count(*) into v_total_users from public.users;
  select count(*) into v_total_tickets from public.tickets;
  select count(*) into v_active_tickets from public.tickets where status = 'available';
  select count(*) into v_pending_appeals from public.appeals where status = 'pending';
  select count(*) into v_pending_transactions from public.transactions where status = 'pending';

  select count(*) into v_daily_uploads
  from public.tickets
  where created_at >= date_trunc('day', now());

  select count(*) into v_daily_borrows
  from public.transactions
  where created_at >= date_trunc('day', now());

  select case when count(*) > 0
    then round((count(*) filter (where status = 'confirmed_valid')::numeric / count(*)::numeric) * 100, 1)
    else 0 end
  into v_validity_rate
  from public.transactions
  where status in ('confirmed_valid', 'confirmed_invalid');

  select coalesce(sum(points_balance), 0) into v_points_circulating from public.users;

  return json_build_object(
    'total_users', v_total_users,
    'total_tickets', v_total_tickets,
    'active_tickets', v_active_tickets,
    'pending_appeals', v_pending_appeals,
    'pending_transactions', v_pending_transactions,
    'daily_uploads', v_daily_uploads,
    'daily_borrows', v_daily_borrows,
    'validity_rate', v_validity_rate,
    'points_circulating', v_points_circulating
  );
end;
$$ language plpgsql security definer;
