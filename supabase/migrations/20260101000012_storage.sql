-- =============================================
-- BUCKETS STORAGE
-- =============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('services', 'services', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('products', 'products', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('invoices', 'invoices', false, 10485760, array['application/pdf']),
  ('site', 'site', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
on conflict (id) do nothing;

-- =============================================
-- POLICIES STORAGE
-- =============================================
create policy "Public can view service images"
  on storage.objects for select
  using (bucket_id = 'services');

create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Public can view site images"
  on storage.objects for select
  using (bucket_id = 'site');

create policy "Public can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins manage service images"
  on storage.objects for all
  using (bucket_id = 'services' and public.is_admin())
  with check (bucket_id = 'services' and public.is_admin());

create policy "Admins manage product images"
  on storage.objects for all
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

create policy "Admins manage site images"
  on storage.objects for all
  using (bucket_id = 'site' and public.is_admin())
  with check (bucket_id = 'site' and public.is_admin());

create policy "Staff manage invoices"
  on storage.objects for all
  using (bucket_id = 'invoices' and public.is_staff())
  with check (bucket_id = 'invoices' and public.is_staff());