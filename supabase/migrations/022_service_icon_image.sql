-- Allow an optional uploaded image per service card. When set, the public
-- /service page shows the image instead of the built-in SVG icon. Admins
-- upload it in site-content; files live in the existing `site-images` bucket
-- under the `services/` prefix.

ALTER TABLE services
    ADD COLUMN IF NOT EXISTS icon_image_url text;

NOTIFY pgrst, 'reload schema';
