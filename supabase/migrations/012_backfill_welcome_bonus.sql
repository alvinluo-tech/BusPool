-- ============================================
-- Backfill welcome_bonus for existing users.
-- Original migration 001 set points_balance
-- default 10, but no point_records was created.
-- All users who joined before migration 009
-- got 10 welcome points via column default.
-- ============================================

insert into public.point_records (user_id, amount, type, description, created_at)
select
  u.id,
  10,
  'welcome_bonus',
  'Welcome bonus',
  u.created_at
from public.users u
where not exists (
  select 1 from public.point_records pr
  where pr.user_id = u.id and pr.type = 'welcome_bonus'
);
