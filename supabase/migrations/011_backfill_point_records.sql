-- ============================================
-- Backfill point_records from existing transactions
-- Migration 009 created point_records but old
-- transactions had no corresponding entries.
-- ============================================

-- 1. borrow_cost: one per transaction (borrower paid points)
insert into public.point_records (user_id, amount, type, description, reference_id, created_at)
select
  t.borrower_id,
  -t.points_amount,
  'borrow_cost',
  'Borrowed ticket',
  t.id,
  t.created_at
from public.transactions t
where not exists (
  select 1 from public.point_records pr
  where pr.reference_id = t.id and pr.type = 'borrow_cost'
);

-- 2. upload_reward: for confirmed_valid transactions (uploader earned points)
insert into public.point_records (user_id, amount, type, description, reference_id, created_at)
select
  tk.uploader_id,
  t.points_amount,
  'upload_reward',
  'Ticket share reward',
  t.id,
  t.confirmed_at
from public.transactions t
join public.tickets tk on t.ticket_id = tk.id
where t.status = 'confirmed_valid'
  and t.confirmed_at is not null
  and not exists (
    select 1 from public.point_records pr
    where pr.reference_id = t.id and pr.type = 'upload_reward'
  );

-- 3. refund: for confirmed_invalid and auto_settled (borrower got points back)
insert into public.point_records (user_id, amount, type, description, reference_id, created_at)
select
  t.borrower_id,
  t.points_amount,
  'refund',
  case
    when t.status = 'auto_settled' then 'Refund — transaction expired'
    else 'Refund — ticket was invalid'
  end,
  t.id,
  t.confirmed_at
from public.transactions t
where t.status in ('confirmed_invalid', 'auto_settled')
  and t.confirmed_at is not null
  and not exists (
    select 1 from public.point_records pr
    where pr.reference_id = t.id and pr.type = 'refund'
  );
