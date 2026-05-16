-- ============================================
-- Migration 016: Notification system wiring
-- Expands notification types, adds helper function,
-- and modifies RPCs to create notifications on events
-- ============================================

-- 1. Expand notification type CHECK constraint
alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in (
    'ticket_borrowed',
    'ticket_expiring',
    'confirm_result',
    'appeal_result',
    'points_received',
    'reputation_changed',
    'reputation_milestone',
    'low_reputation',
    'announcement'
  ));

-- 2. Helper function to insert a notification
create or replace function public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_link text default null
) returns void as $$
begin
  insert into public.notifications (user_id, title, message, type, link)
  values (p_user_id, p_title, p_message, p_type, p_link);
end;
$$ language plpgsql security definer;

-- ============================================
-- 3. Modified: borrow_ticket — notify uploader
-- ============================================
create or replace function public.borrow_ticket(p_ticket_id uuid)
returns json as $$
declare
  v_ticket record;
  v_user record;
  v_points_cost integer := 5;
  v_transaction_id uuid;
  v_expires_at timestamptz;
  v_borrower_nickname text;
begin
  -- Lock the ticket row
  select * into v_ticket
  from public.tickets
  where id = p_ticket_id
  for update;

  -- Check ticket exists and is available
  if v_ticket is null or v_ticket.status != 'available' then
    raise exception 'Ticket is not available';
  end if;

  -- Check ticket hasn't expired
  if v_ticket.expires_at < now() then
    raise exception 'Ticket has expired';
  end if;

  -- Check user exists and has enough points
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

  -- Check user isn't borrowing their own ticket
  if v_ticket.uploader_id = auth.uid() then
    raise exception 'Cannot borrow your own ticket';
  end if;

  -- Get borrower nickname
  select nickname into v_borrower_nickname
  from public.users where id = auth.uid();

  -- Calculate expiration: MIN(4 hours, time until 23:59 today)
  v_expires_at := least(
    now() + interval '4 hours',
    (date_trunc('day', now()) + interval '1 day' - interval '1 second')
  );

  -- Deduct points
  update public.users
  set points_balance = points_balance - v_points_cost,
      total_borrows = total_borrows + 1
  where id = auth.uid();

  -- Create transaction
  insert into public.transactions (ticket_id, borrower_id, points_amount, status, expires_at)
  values (p_ticket_id, auth.uid(), v_points_cost, 'pending', v_expires_at)
  returning id into v_transaction_id;

  -- Update ticket status
  update public.tickets
  set status = 'in_use'
  where id = p_ticket_id;

  -- Notify uploader: someone borrowed their ticket
  perform public.create_notification(
    v_ticket.uploader_id,
    'Your ticket was borrowed',
    coalesce(v_borrower_nickname, 'Someone') || ' borrowed your ticket',
    'ticket_borrowed',
    '/tickets/' || p_ticket_id
  );

  return json_build_object(
    'transaction_id', v_transaction_id,
    'barcode_image_url', v_ticket.barcode_image_url,
    'expires_at', v_expires_at,
    'points_remaining', v_user.points_balance - v_points_cost
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- 4. Modified: confirm_result — notify both parties
-- ============================================
create or replace function public.confirm_result(
  p_transaction_id uuid,
  p_is_valid boolean,
  p_failure_reason text default null
)
returns json as $$
declare
  v_transaction record;
  v_ticket record;
  v_borrower_nickname text;
begin
  -- Lock the transaction row
  select * into v_transaction
  from public.transactions
  where id = p_transaction_id
  for update;

  -- Check transaction exists and is pending
  if v_transaction is null or v_transaction.status != 'pending' then
    raise exception 'Transaction not found or already confirmed';
  end if;

  -- Check user is the borrower
  if v_transaction.borrower_id != auth.uid() then
    raise exception 'Not authorized';
  end if;

  -- Check transaction hasn't expired
  if v_transaction.expires_at < now() then
    raise exception 'Transaction has expired';
  end if;

  -- Get ticket info
  select * into v_ticket
  from public.tickets
  where id = v_transaction.ticket_id;

  -- Get borrower nickname
  select nickname into v_borrower_nickname
  from public.users where id = auth.uid();

  if p_is_valid then
    -- Ticket worked: transfer points to uploader
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

    -- Notify uploader: ticket worked + earned points
    perform public.create_notification(
      v_ticket.uploader_id,
      'Points earned',
      coalesce(v_borrower_nickname, 'Someone') || ' confirmed your ticket worked — you earned ' || v_transaction.points_amount || ' points',
      'points_received',
      '/wallet'
    );

    -- Notify borrower: confirmation recorded
    perform public.create_notification(
      v_transaction.borrower_id,
      'Confirmation recorded',
      'You confirmed the ticket worked. The uploader received your points.',
      'confirm_result',
      '/borrows'
    );
  else
    -- Ticket didn't work: refund points to borrower
    update public.users
    set points_balance = points_balance + v_transaction.points_amount,
        reputation = greatest(reputation - 10, 0)
    where id = v_ticket.uploader_id;

    update public.transactions
    set status = 'confirmed_invalid',
        failure_reason = p_failure_reason,
        confirmed_at = now()
    where id = p_transaction_id;

    update public.tickets
    set status = 'invalid'
    where id = v_ticket.id;

    -- Extra penalty for "already scanned" (二次使用)
    if p_failure_reason = 'already_scanned' then
      update public.users
      set reputation = greatest(reputation - 10, 0)
      where id = v_ticket.uploader_id;
    end if;

    -- Notify uploader: ticket failed + reputation dropped
    perform public.create_notification(
      v_ticket.uploader_id,
      'Ticket flagged as invalid',
      'Your ticket was reported as not working — your reputation has decreased.',
      'reputation_changed',
      '/profile'
    );

    -- Notify borrower: points refunded
    perform public.create_notification(
      v_transaction.borrower_id,
      'Points refunded',
      'Your ' || v_transaction.points_amount || ' points have been refunded.',
      'confirm_result',
      '/wallet'
    );
  end if;

  return json_build_object(
    'success', true,
    'is_valid', p_is_valid,
    'points_refunded', not p_is_valid
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- 5. Modified: admin_review_appeal — notify appellant
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

    -- Notify appellant: appeal resolved
    perform public.create_notification(
      v_appeal.appellant_id,
      'Appeal resolved',
      'Your appeal has been reviewed and resolved. Your reputation has been restored.',
      'appeal_result',
      '/appeals'
    );
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

    -- Notify appellant: appeal rejected
    perform public.create_notification(
      v_appeal.appellant_id,
      'Appeal rejected',
      'Your appeal has been reviewed and was not upheld.',
      'appeal_result',
      '/appeals'
    );
  end if;

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;

-- ============================================
-- 6. Modified: admin_confirm_transaction — notify both parties
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

    -- Notify uploader
    perform public.create_notification(
      v_ticket.uploader_id,
      'Transaction confirmed by admin',
      'An admin confirmed a transaction on your ticket. You earned ' || v_transaction.points_amount || ' points.',
      'points_received',
      '/wallet'
    );

    -- Notify borrower
    perform public.create_notification(
      v_transaction.borrower_id,
      'Transaction confirmed by admin',
      'An admin reviewed and confirmed your borrow as valid.',
      'confirm_result',
      '/borrows'
    );
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

    -- Notify uploader: ticket flagged invalid
    perform public.create_notification(
      v_ticket.uploader_id,
      'Ticket flagged as invalid',
      'An admin reviewed your ticket and marked it as not working. Your reputation has decreased.',
      'reputation_changed',
      '/profile'
    );

    -- Notify borrower: refunded
    perform public.create_notification(
      v_transaction.borrower_id,
      'Points refunded',
      'An admin confirmed your borrow as invalid. Your ' || v_transaction.points_amount || ' points have been refunded.',
      'confirm_result',
      '/wallet'
    );
  end if;

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;

-- ============================================
-- 7. Modified: admin_adjust_user_reputation — notify + milestones + low warning
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
  v_new_milestone boolean := false;
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

  -- Notify user of reputation change
  perform public.create_notification(
    p_user_id,
    'Reputation updated',
    'An admin adjusted your reputation from ' || v_old_reputation || ' to ' || p_value || '. Reason: ' || p_reason,
    'reputation_changed',
    '/profile'
  );

  -- Check for low reputation warning (dropped below 50)
  if v_old_reputation >= 50 and p_value < 50 then
    perform public.create_notification(
      p_user_id,
      'Low reputation warning',
      'Your reputation has fallen below 50. You may face restrictions on borrowing.',
      'low_reputation',
      '/profile'
    );
  end if;

  -- Check for reputation milestones (crossed a threshold upward)
  -- Milestones: 50, 60, 70, 80, 90, 100
  for milestone in 50..100 by 10 loop
    if v_old_reputation < milestone and p_value >= milestone then
      perform public.create_notification(
        p_user_id,
        'Reputation milestone reached!',
        'Your reputation has reached ' || milestone || '! Keep up the good work.',
        'reputation_milestone',
        '/profile'
      );
    end if;
  end loop;

  return json_build_object('success', true, 'new_value', p_value);
end;
$$ language plpgsql security definer;

-- ============================================
-- 8. Modified: admin_adjust_user_points — notify
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

  -- Notify user
  if p_amount >= 0 then
    perform public.create_notification(
      p_user_id,
      'Points received',
      'An admin added ' || p_amount || ' points to your account. Reason: ' || p_reason,
      'points_received',
      '/wallet'
    );
  else
    perform public.create_notification(
      p_user_id,
      'Points deducted',
      'An admin deducted ' || abs(p_amount) || ' points from your account. Reason: ' || p_reason,
      'points_received',
      '/wallet'
    );
  end if;

  return json_build_object('success', true, 'new_balance', v_new_balance);
end;
$$ language plpgsql security definer;

-- ============================================
-- 9. New RPC: publish_announcement — broadcast to all users
-- ============================================
create or replace function public.publish_announcement(
  p_title text,
  p_message text,
  p_link text default null
)
returns json as $$
declare
  v_admin_id uuid;
  v_recipient_count integer := 0;
begin
  v_admin_id := auth.uid();
  if not public.is_admin() then
    raise exception 'Unauthorized: admin access required';
  end if;

  -- Insert a notification for every user who has announcements enabled
  -- We don't check preferences at DB level to keep it simple;
  -- the frontend filters by preferences. This also ensures
  -- users who haven't set preferences still receive announcements.
  insert into public.notifications (user_id, title, message, type, link)
  select id, p_title, p_message, 'announcement', p_link
  from public.users;

  get diagnostics v_recipient_count = row_count;

  insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
  values (v_admin_id, 'publish_announcement', 'user', v_admin_id,
          jsonb_build_object('title', p_title, 'recipient_count', v_recipient_count),
          'Announcement broadcast');

  return json_build_object(
    'success', true,
    'recipient_count', v_recipient_count
  );
end;
$$ language plpgsql security definer;
