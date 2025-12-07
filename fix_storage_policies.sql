-- 1. Create Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-thumbnails', 'gallery-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;
-- 2. Drop existing policies to allow clean re-creation
DROP POLICY IF EXISTS "Public Videos View" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Videos Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Videos Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Videos Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Gallery Images View" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Gallery Images Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Gallery Images Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Gallery Images Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Gallery Thumbnails View" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Gallery Thumbnails Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Gallery Thumbnails Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Gallery Thumbnails Delete" ON storage.objects;
-- 3. Re-create Policies
-- 'videos' Bucket Policies
create policy "Public Videos View"
on storage.objects for select
to public
using ( bucket_id = 'videos' );
create policy "Authenticated Videos Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'videos' );
create policy "Authenticated Videos Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'videos' );
create policy "Authenticated Videos Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'videos' );
-- 'gallery-images' Bucket Policies
create policy "Public Gallery Images View"
on storage.objects for select
to public
using ( bucket_id = 'gallery-images' );
create policy "Authenticated Gallery Images Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'gallery-images' );
create policy "Authenticated Gallery Images Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'gallery-images' );
create policy "Authenticated Gallery Images Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'gallery-images' );
-- 'gallery-thumbnails' Bucket Policies
create policy "Public Gallery Thumbnails View"
on storage.objects for select
to public
using ( bucket_id = 'gallery-thumbnails' );
create policy "Authenticated Gallery Thumbnails Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'gallery-thumbnails' );
create policy "Authenticated Gallery Thumbnails Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'gallery-thumbnails' );
create policy "Authenticated Gallery Thumbnails Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'gallery-thumbnails' );