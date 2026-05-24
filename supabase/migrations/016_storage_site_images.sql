-- ============================================================
-- Create the site-images storage bucket for marketing assets
-- (hero slideshow backgrounds, etc.).
-- Public can read; only admins (JWT app_metadata.role = 'admin')
-- can upload/update/delete.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-images',
  'site-images',
  true,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload site images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update site images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete site images" ON storage.objects;

CREATE POLICY "Public can view site images"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'site-images');

CREATE POLICY "Admin can upload site images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'site-images'
      AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "Admin can update site images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'site-images'
      AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "Admin can delete site images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'site-images'
      AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

NOTIFY pgrst, 'reload schema';
