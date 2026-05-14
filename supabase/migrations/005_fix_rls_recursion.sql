-- ============================================
-- Fix: Remove circular RLS policy recursion
-- tickets -> transactions -> tickets = infinite loop
-- ============================================

-- Drop the problematic policies that create circular references
drop policy if exists "Anyone can view available tickets" on public.tickets;
drop policy if exists "Borrowers can view their borrowed ticket" on public.tickets;
drop policy if exists "Authenticated users can insert tickets" on public.tickets;
drop policy if exists "Uploaders can update own tickets" on public.tickets;

drop policy if exists "Users can view own transactions" on public.transactions;
drop policy if exists "Authenticated users can insert transactions" on public.transactions;
drop policy if exists "Users can update own transactions" on public.transactions;

-- Tickets: public read, authenticated insert/update
create policy "Tickets are publicly viewable"
  on public.tickets for select
  using (true);

create policy "Authenticated users can insert tickets"
  on public.tickets for insert
  with check (
    auth.uid() = uploader_id
    and exists (select 1 from public.users where id = auth.uid() and reputation >= 30)
  );

create policy "Uploaders can update own tickets"
  on public.tickets for update
  using (auth.uid() = uploader_id);

-- Transactions: users can view their own (borrower OR ticket uploader)
-- Use auth.uid() directly to avoid recursion into tickets RLS
create policy "Users can view own transactions"
  on public.transactions for select
  using (
    auth.uid() = borrower_id
    or auth.uid() = (
      select uploader_id from public.tickets where id = ticket_id
    )
  );

create policy "Authenticated users can insert transactions"
  on public.transactions for insert
  with check (auth.uid() = borrower_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (
    auth.uid() = borrower_id
    or auth.uid() = (
      select uploader_id from public.tickets where id = ticket_id
    )
  );
