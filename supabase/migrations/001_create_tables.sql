-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- Users table (extends auth.users)
-- ============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  email_verified boolean default false,
  nickname text not null default '',
  avatar_url text,
  points_balance integer default 10,  -- new users get 10 points
  reputation integer default 50 check (reputation >= 0 and reputation <= 100),
  total_uploads integer default 0,
  total_borrows integer default 0,
  successful_uses integer default 0,
  created_at timestamptz default now()
);

-- ============================================
-- Tickets table
-- ============================================
create table public.tickets (
  id uuid primary key default uuid_generate_v4(),
  uploader_id uuid not null references public.users(id) on delete cascade,
  barcode_image_url text not null,
  barcode_thumbnail_url text,
  ticket_type text not null check (ticket_type in ('dayrider', 'daysaver')),
  purchase_time timestamptz not null,
  status text not null default 'available' check (status in ('available', 'in_use', 'completed', 'expired', 'invalid')),
  zone text,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

-- ============================================
-- Transactions table
-- ============================================
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  borrower_id uuid not null references public.users(id) on delete cascade,
  points_amount integer not null default 5,
  status text not null default 'pending' check (status in ('pending', 'confirmed_valid', 'confirmed_invalid', 'auto_settled')),
  failure_reason text check (failure_reason in ('expired', 'already_scanned', 'unknown')),
  confirmed_at timestamptz,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

-- ============================================
-- Appeals table
-- ============================================
create table public.appeals (
  id uuid primary key default uuid_generate_v4(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  appellant_id uuid not null references public.users(id) on delete cascade,
  reason text not null,
  evidence_url text,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'rejected')),
  admin_note text,
  created_at timestamptz default now()
);

-- ============================================
-- Notifications table
-- ============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null check (type in ('ticket_borrowed', 'ticket_expiring', 'confirm_result', 'appeal_result', 'new_ticket')),
  read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- ============================================
-- Admin logs table
-- ============================================
create table public.admin_logs (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references public.users(id),
  action text not null,
  target_type text not null check (target_type in ('user', 'ticket', 'transaction', 'appeal')),
  target_id uuid not null,
  details jsonb,
  reason text not null,
  created_at timestamptz default now()
);

-- ============================================
-- Indexes
-- ============================================
create index idx_tickets_uploader on public.tickets(uploader_id);
create index idx_tickets_status on public.tickets(status);
create index idx_tickets_created_at on public.tickets(created_at desc);
create index idx_transactions_ticket on public.transactions(ticket_id);
create index idx_transactions_borrower on public.transactions(borrower_id);
create index idx_transactions_status on public.transactions(status);
create index idx_appeals_appellant on public.appeals(appellant_id);
create index idx_appeals_status on public.appeals(status);
create index idx_notifications_user on public.notifications(user_id, read);
create index idx_admin_logs_admin on public.admin_logs(admin_id);

-- ============================================
-- Row Level Security
-- ============================================
alter table public.users enable row level security;
alter table public.tickets enable row level security;
alter table public.transactions enable row level security;
alter table public.appeals enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_logs enable row level security;

-- Users policies
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Tickets policies
create policy "Anyone can view available tickets" on public.tickets
  for select using (status = 'available' or auth.uid() = uploader_id);

create policy "Borrowers can view their borrowed ticket" on public.tickets
  for select using (
    exists (
      select 1 from public.transactions
      where transactions.ticket_id = tickets.id
        and transactions.borrower_id = auth.uid()
        and transactions.status = 'pending'
    )
  );

create policy "Authenticated users can insert tickets" on public.tickets
  for insert with check (
    auth.uid() = uploader_id
    and exists (select 1 from public.users where id = auth.uid() and reputation >= 30)
  );

create policy "Uploaders can update own tickets" on public.tickets
  for update using (auth.uid() = uploader_id);

-- Transactions policies
create policy "Users can view own transactions" on public.transactions
  for select using (
    auth.uid() = borrower_id
    or auth.uid() = (select uploader_id from public.tickets where id = ticket_id)
  );

create policy "Authenticated users can insert transactions" on public.transactions
  for insert with check (auth.uid() = borrower_id);

create policy "Users can update own transactions" on public.transactions
  for update using (
    auth.uid() = borrower_id
    or auth.uid() = (select uploader_id from public.tickets where id = ticket_id)
  );

-- Appeals policies
create policy "Users can view own appeals" on public.appeals
  for select using (auth.uid() = appellant_id);

create policy "Users can insert appeals" on public.appeals
  for insert with check (auth.uid() = appellant_id);

-- Notifications policies
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- ============================================
-- Trigger: auto-create user profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, email_verified, nickname)
  values (
    new.id,
    new.email,
    coalesce(new.email_confirmed_at is not null, false),
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
