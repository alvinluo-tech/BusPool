-- ============================================
-- Storage Buckets
-- ============================================

-- Barcodes bucket (ticket barcode images)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('barcodes', 'barcodes', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

-- Avatars bucket (user profile photos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- Evidence bucket (appeal evidence photos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidence', 'evidence', true, 10485760, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- ============================================
-- Storage RLS Policies
-- ============================================

-- Barcodes: anyone can read, authenticated users can upload to their own folder
create policy "Barcodes are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'barcodes');

create policy "Authenticated users can upload barcodes"
  on storage.objects for insert
  with check (
    bucket_id = 'barcodes'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own barcodes"
  on storage.objects for delete
  using (
    bucket_id = 'barcodes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: anyone can read, authenticated users can upload their own
create policy "Avatars are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Evidence: public read, authenticated insert to own folder
create policy "Evidence is publicly viewable"
  on storage.objects for select
  using (bucket_id = 'evidence');

create policy "Authenticated users can upload evidence"
  on storage.objects for insert
  with check (
    bucket_id = 'evidence'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own evidence"
  on storage.objects for delete
  using (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
