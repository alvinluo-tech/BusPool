-- ============================================
-- Fix: Replace inline admin checks with is_admin()
-- to prevent infinite RLS recursion on users table.
--
-- Problem: "exists (select 1 from public.users u
--          where u.id = auth.uid() and u.is_admin = true)"
-- triggers RLS again → infinite recursion (42P17).
--
-- Fix: use public.is_admin() — SECURITY DEFINER
-- function that bypasses RLS.
-- ============================================

-- Drop ALL existing admin policies (migration 008)
drop policy if exists "Admins can read all users" on public.users;
drop policy if exists "Admins can update all users" on public.users;
drop policy if exists "Admins can read all tickets" on public.tickets;
drop policy if exists "Admins can update all tickets" on public.tickets;
drop policy if exists "Admins can delete tickets" on public.tickets;
drop policy if exists "Admins can read all transactions" on public.transactions;
drop policy if exists "Admins can update all transactions" on public.transactions;
drop policy if exists "Admins can read all appeals" on public.appeals;
drop policy if exists "Admins can update all appeals" on public.appeals;
drop policy if exists "Admins can read audit logs" on public.admin_logs;
drop policy if exists "Admins can insert audit logs" on public.admin_logs;
drop policy if exists "Admins can read all notifications" on public.notifications;

-- Re-create with public.is_admin() helper
create policy "Admins can read all users"
  on public.users for select
  using (public.is_admin());

create policy "Admins can update all users"
  on public.users for update
  using (public.is_admin());

create policy "Admins can read all tickets"
  on public.tickets for select
  using (public.is_admin());

create policy "Admins can update all tickets"
  on public.tickets for update
  using (public.is_admin());

create policy "Admins can delete tickets"
  on public.tickets for delete
  using (public.is_admin());

create policy "Admins can read all transactions"
  on public.transactions for select
  using (public.is_admin());

create policy "Admins can update all transactions"
  on public.transactions for update
  using (public.is_admin());

create policy "Admins can read all appeals"
  on public.appeals for select
  using (public.is_admin());

create policy "Admins can update all appeals"
  on public.appeals for update
  using (public.is_admin());

create policy "Admins can read audit logs"
  on public.admin_logs for select
  using (public.is_admin());

create policy "Admins can insert audit logs"
  on public.admin_logs for insert
  with check (public.is_admin());

create policy "Admins can read all notifications"
  on public.notifications for select
  using (public.is_admin());
