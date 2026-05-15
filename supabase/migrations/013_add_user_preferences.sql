-- ============================================
-- User Preferences table (settings, notifications, etc.)
-- One row per user, upserted on first settings save.
-- ============================================

create table public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  notifications jsonb not null default '{}'::jsonb,
  analytics_enabled boolean default true,
  quiet_hours jsonb default null,
  updated_at timestamptz default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can upsert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Admins can read all preferences"
  on public.user_preferences for select
  using (public.is_admin());
