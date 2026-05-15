-- ============================================
-- Point Records table — unified audit trail for all point changes
-- ============================================

create table public.point_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount integer not null,
  type text not null check (type in (
    'welcome_bonus',
    'admin_adjustment',
    'upload_reward',
    'borrow_cost',
    'refund',
    'appeal_reward'
  )),
  description text,
  reference_id uuid,
  created_at timestamptz default now()
);

create index idx_point_records_user on public.point_records(user_id, created_at desc);
create index idx_point_records_type on public.point_records(type);

alter table public.point_records enable row level security;

create policy "Users can view own point records"
  on public.point_records for select
  using (auth.uid() = user_id);

create policy "Admins can read all point records"
  on public.point_records for select
  using (exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.is_admin = true
  ));

create policy "Admins and system can insert point records"
  on public.point_records for insert
  with check (
    auth.uid() = user_id
    or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

-- ============================================
-- Update handle_new_user to grant welcome bonus
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  welcome_bonus integer := 50;
begin
  insert into public.users (id, email, email_verified, nickname)
  values (
    new.id,
    new.email,
    coalesce(new.email_confirmed_at is not null, false),
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1))
  );

  -- Welcome bonus
  update public.users
  set points_balance = points_balance + welcome_bonus
  where id = new.id;

  insert into public.point_records (user_id, amount, type, description)
  values (new.id, welcome_bonus, 'welcome_bonus', 'Welcome bonus');

  return new;
end;
$$ language plpgsql security definer;

-- ============================================
-- Update borrow_ticket to record borrow_cost
-- ============================================
create or replace function public.borrow_ticket(p_ticket_id uuid)
returns json as $$
declare
  v_ticket record;
  v_user record;
  v_points_cost integer := 5;
  v_transaction_id uuid;
  v_expires_at timestamptz;
begin
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

  v_expires_at := least(
    now() + interval '4 hours',
    (date_trunc('day', now()) + interval '1 day' - interval '1 second')
  );

  update public.users
  set points_balance = points_balance - v_points_cost,
      total_borrows = total_borrows + 1
  where id = auth.uid();

  insert into public.transactions (ticket_id, borrower_id, points_amount, status, expires_at)
  values (p_ticket_id, auth.uid(), v_points_cost, 'pending', v_expires_at)
  returning id into v_transaction_id;

  -- Record point deduction
  insert into public.point_records (user_id, amount, type, description, reference_id)
  values (auth.uid(), -v_points_cost, 'borrow_cost', 'Borrowed ticket', v_transaction_id);

  update public.tickets
  set status = 'in_use'
  where id = p_ticket_id;

  return json_build_object(
    'transaction_id', v_transaction_id,
    'barcode_image_url', v_ticket.barcode_image_url,
    'expires_at', v_expires_at,
    'points_remaining', v_user.points_balance - v_points_cost
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- Update confirm_result to record upload_reward / refund
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

    insert into public.point_records (user_id, amount, type, description, reference_id)
    values (v_ticket.uploader_id, v_transaction.points_amount, 'upload_reward',
            'Ticket share reward', p_transaction_id);
  else
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

    -- Refund borrower
    update public.users
    set points_balance = points_balance + v_transaction.points_amount
    where id = v_transaction.borrower_id;

    insert into public.point_records (user_id, amount, type, description, reference_id)
    values (v_transaction.borrower_id, v_transaction.points_amount, 'refund',
            'Refund — ticket was invalid', p_transaction_id);

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

-- ============================================
-- Update auto_settle_expired_transactions to record refunds
-- ============================================
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
    update public.users
    set points_balance = points_balance + v_transaction.points_amount
    where id = v_transaction.borrower_id;

    update public.transactions
    set status = 'auto_settled',
        failure_reason = 'expired',
        confirmed_at = now()
    where id = v_transaction.id;

    update public.tickets
    set status = 'expired'
    where id = v_transaction.ticket_id;

    insert into public.point_records (user_id, amount, type, description, reference_id)
    values (v_transaction.borrower_id, v_transaction.points_amount, 'refund',
            'Refund — transaction expired', v_transaction.id);

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$ language plpgsql security definer;

-- ============================================
-- Update admin_confirm_transaction to record point_records
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

  if v_transaction.status not in ('pending') then
    raise exception 'Transaction is not pending (current: %)', v_transaction.status;
  end if;

  select * into v_ticket
  from public.tickets
  where id = v_transaction.ticket_id;

  if p_is_valid then
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

    insert into public.point_records (user_id, amount, type, description, reference_id)
    values (v_ticket.uploader_id, v_transaction.points_amount, 'upload_reward',
            'Share reward (admin confirmed)', p_transaction_id);

    insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
    values (v_admin_id, 'manual_confirm', 'transaction', p_transaction_id,
            jsonb_build_object('decision', 'valid', 'ticket_id', v_transaction.ticket_id, 'borrower_id', v_transaction.borrower_id),
            p_reason);
  else
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

    insert into public.point_records (user_id, amount, type, description, reference_id)
    values (v_transaction.borrower_id, v_transaction.points_amount, 'refund',
            'Refund — admin confirmed invalid', p_transaction_id);

    insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
    values (v_admin_id, 'manual_confirm', 'transaction', p_transaction_id,
            jsonb_build_object('decision', 'invalid', 'ticket_id', v_transaction.ticket_id, 'borrower_id', v_transaction.borrower_id),
            p_reason);
  end if;

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;

-- ============================================
-- Update admin_revoke_transaction to record point_records
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
    update public.users
    set points_balance = greatest(points_balance - v_transaction.points_amount, 0),
        reputation = greatest(reputation - 2, 0),
        successful_uses = greatest(successful_uses - 1, 0)
    where id = v_ticket.uploader_id;

    update public.users
    set points_balance = points_balance + v_transaction.points_amount
    where id = v_transaction.borrower_id;

    update public.tickets
    set status = 'available'
    where id = v_ticket.id;

    insert into public.point_records (user_id, amount, type, description, reference_id)
    values (v_transaction.borrower_id, v_transaction.points_amount, 'refund',
            'Refund — transaction revoked', p_transaction_id);

  elsif v_transaction.status = 'confirmed_invalid' then
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
-- Update admin_adjust_user_points to record point_records
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

  insert into public.point_records (user_id, amount, type, description, reference_id)
  values (p_user_id, p_amount, 'admin_adjustment', p_reason, v_admin_id);

  insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
  values (v_admin_id, 'adjust_points', 'user', p_user_id,
          jsonb_build_object('amount', p_amount, 'new_balance', v_new_balance),
          p_reason);

  return json_build_object('success', true, 'new_balance', v_new_balance);
end;
$$ language plpgsql security definer;

-- ============================================
-- Update admin_review_appeal to record appeal_reward
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
  v_refund_amount integer := 5;
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
    select * into v_transaction
    from public.transactions
    where id = v_appeal.transaction_id;

    if v_transaction is not null then
      update public.users
      set reputation = least(reputation + 10, 100),
          points_balance = points_balance + v_refund_amount
      where id = v_appeal.appellant_id;

      insert into public.point_records (user_id, amount, type, description, reference_id)
      values (v_appeal.appellant_id, v_refund_amount, 'appeal_reward',
              'Compensation — appeal resolved', p_appeal_id);
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
