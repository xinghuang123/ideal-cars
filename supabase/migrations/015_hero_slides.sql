-- Homepage hero slideshow: editable slides with optional background image.
-- Admins manage the list (add/remove/reorder); public reads active slides
-- in display_order for the carousel on the homepage.

CREATE TABLE IF NOT EXISTS hero_slides (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url      text,
    heading        text NOT NULL DEFAULT '',
    subheading     text NOT NULL DEFAULT '',
    button_text    text NOT NULL DEFAULT '',
    button_href    text NOT NULL DEFAULT '',
    gradient_class text,
    display_order  integer NOT NULL DEFAULT 0,
    is_active      boolean NOT NULL DEFAULT true,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    updated_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS hero_slides_order_idx
    ON hero_slides (display_order)
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION public.touch_hero_slides_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hero_slides_touch_updated_at ON hero_slides;
CREATE TRIGGER hero_slides_touch_updated_at
    BEFORE UPDATE ON hero_slides
    FOR EACH ROW EXECUTE FUNCTION public.touch_hero_slides_updated_at();

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Public can read active slides only. Admins can read everything.
CREATE POLICY public_select_active_hero_slides ON hero_slides
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

-- Only admins can write.
CREATE POLICY admin_insert_hero_slides ON hero_slides
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY admin_update_hero_slides ON hero_slides
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_delete_hero_slides ON hero_slides
    FOR DELETE TO authenticated USING (public.is_admin());

-- Seed the three default slides (matching the current hard-coded carousel).
INSERT INTO hero_slides (heading, subheading, button_text, button_href, gradient_class, display_order)
VALUES
    ('Find Your Ideal Car',
     'Browse our quality selection of second-hand vehicles',
     'Browse Cars',
     '/buy',
     'bg-gradient-to-br from-navy-dark via-navy to-navy-light',
     0),
    ('Featured Vehicles This Week',
     'Don''t miss our hand-picked featured vehicles',
     'View Featured',
     '/buy?status=special',
     'bg-gradient-to-tr from-navy via-navy-dark to-navy-light',
     1),
    ('Sell Your Car Today',
     'Get a fair valuation for your vehicle',
     'Get Valuation',
     '/sell',
     'bg-gradient-to-bl from-navy-light via-navy to-navy-dark',
     2)
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
