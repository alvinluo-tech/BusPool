-- ============================================
-- Fix: Allow public read of user profiles
-- Ticket square needs to display uploader info
-- ============================================
create policy "Anyone can view user profiles"
  on public.users for select
  using (true);
