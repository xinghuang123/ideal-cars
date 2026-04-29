-- ============================================================
-- Create the vehicle-images storage bucket and its access policies.
-- Public can read (so the website can display car photos);
-- only admins (JWT app_metadata.role = 'admin') can upload/update/delete.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete vehicle images" ON storage.objects;

CREATE POLICY "Public can view vehicle images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'vehicle-images');

CREATE POLICY "Admin can upload vehicle images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'vehicle-images'
      AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "Admin can update vehicle images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'vehicle-images'
      AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "Admin can delete vehicle images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'vehicle-images'
      AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

NOTIFY pgrst, 'reload schema';
