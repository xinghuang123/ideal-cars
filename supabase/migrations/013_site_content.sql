-- Editable site content: a tiny key/value CMS so admins can change things
-- like phone, email, address, hero text without a code deploy.

CREATE TABLE IF NOT EXISTS site_content (
    key         text PRIMARY KEY,
    value       text NOT NULL DEFAULT '',
    updated_at  timestamptz NOT NULL DEFAULT now(),
    updated_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE OR REPLACE FUNCTION public.touch_site_content_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS site_content_touch_updated_at ON site_content;
CREATE TRIGGER site_content_touch_updated_at
    BEFORE UPDATE ON site_content
    FOR EACH ROW EXECUTE FUNCTION public.touch_site_content_updated_at();

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content (it's used on public pages).
CREATE POLICY public_select_site_content ON site_content
    FOR SELECT TO anon, authenticated USING (true);

-- Only admins can write.
CREATE POLICY admin_insert_site_content ON site_content
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY admin_update_site_content ON site_content
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_delete_site_content ON site_content
    FOR DELETE TO authenticated USING (public.is_admin());

-- Seed defaults. ON CONFLICT DO NOTHING so reapplying is safe.
INSERT INTO site_content (key, value) VALUES
    ('phone', '020 4190 7335'),
    ('phone_href', 'tel:02041907335'),
    ('email', 'idealcarsnzltd@gmail.com'),
    ('address', '64 Broad Street, Woolston, Christchurch 8062'),
    ('hours_weekday', 'Monday – Friday: 9:00 AM – 6:00 PM'),
    ('hours_saturday', 'Saturday: 10:00 AM – 4:00 PM'),
    ('hours_sunday', 'Sunday: Closed'),
    ('tagline', 'Your trusted car dealer in New Zealand'),
    ('hero_title', 'Find Your Ideal Car'),
    ('hero_subtitle', 'Browse our quality selection of second-hand vehicles'),
    ('about_intro', 'Ideal Cars is a family-owned used car dealership in Christchurch, New Zealand. We''ve been helping Kiwis find quality second-hand vehicles at fair prices since 2018.')
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
