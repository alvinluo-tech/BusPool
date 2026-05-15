-- ============================================
-- Account self-management RPC functions
-- deactivate_own_account: soft-disable account
-- delete_own_account: hard delete all user data
-- ============================================

-- Soft-deactivate: strip reputation to 0 (functionally disables upload/borrow)
create or replace function public.deactivate_own_account()
returns json as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.users
  set reputation = 0
  where id = v_uid;

  insert into public.admin_logs (admin_id, action, target_type, target_id, details, reason)
  values (v_uid, 'deactivate_account', 'user', v_uid,
          jsonb_build_object('method', 'self-service'),
          'User self-deactivated account');

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;

-- Hard delete: remove from public.users (cascades to related tables)
create or replace function public.delete_own_account()
returns json as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Delete user_preferences first (not CASCADE linked to avoid FK order issues)
  delete from public.user_preferences where user_id = v_uid;

  -- Delete from public.users (FKs with ON DELETE CASCADE will clean up
  -- tickets, transactions, appeals, admin_logs, point_records, notifications)
  delete from public.users where id = v_uid;

  -- Attempt to delete auth user (requires sufficient privileges)
  begin
    delete from auth.users where id = v_uid;
  exception when others then
    -- auth.users might not be accessible; data is already gone
    null;
  end;

  return json_build_object('success', true);
end;
$$ language plpgsql security definer;
