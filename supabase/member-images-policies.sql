-- Run this in Supabase SQL editor if you upload directly with anon/authenticated clients.
-- The backend upload route uses SUPABASE_SERVICE_ROLE_KEY and bypasses RLS, but public reads still need a public bucket.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-images',
  'member-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public read member images"
on storage.objects
for select
to public
using (bucket_id = 'member-images');

create policy "Authenticated users can upload member images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'member-images'
  and (storage.extension(name) = any (array['jpg', 'jpeg', 'png', 'webp']))
);

create policy "Authenticated users can update member images"
on storage.objects
for update
to authenticated
using (bucket_id = 'member-images')
with check (
  bucket_id = 'member-images'
  and (storage.extension(name) = any (array['jpg', 'jpeg', 'png', 'webp']))
);
