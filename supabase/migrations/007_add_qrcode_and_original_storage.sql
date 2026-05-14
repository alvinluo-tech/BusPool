-- ============================================
-- Add QR code data field to tickets
-- Add ticket-originals bucket (admin-only read)
-- Add is_admin flag to users
-- ============================================

-- Add qr_code_data column
alter table public.tickets
add column if not exists qr_code_data text;

-- Add is_admin flag to users
alter table public.users
add column if not exists is_admin boolean default false;

-- ============================================
-- Ticket-originals bucket (private, admin-only read)
-- ============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ticket-originals', 'ticket-originals', false, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

-- Uploader can insert to own folder
create policy "Uploader can insert original photos"
  on storage.objects for insert
  with check (
    bucket_id = 'ticket-originals'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Uploader can delete own originals
create policy "Uploader can delete own originals"
  on storage.objects for delete
  using (
    bucket_id = 'ticket-originals'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Only admins can read originals
create policy "Only admins can view originals"
  on storage.objects for select
  using (
    bucket_id = 'ticket-originals'
    and exists (
      select 1 from public.users
      where id = auth.uid()
        and is_admin = true
    )
  );
