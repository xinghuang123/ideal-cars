-- About page editable sections: values and team members.
-- Admins manage the lists (add/remove/reorder); public reads active rows
-- in display_order for the /about page.

-- 1. Values
CREATE TABLE IF NOT EXISTS about_values (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title         text NOT NULL DEFAULT 'New Value',
    description   text NOT NULL DEFAULT '',
    display_order integer NOT NULL DEFAULT 0,
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    updated_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS about_values_order_idx
    ON about_values (display_order)
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION public.touch_about_values_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS about_values_touch_updated_at ON about_values;
CREATE TRIGGER about_values_touch_updated_at
    BEFORE UPDATE ON about_values
    FOR EACH ROW EXECUTE FUNCTION public.touch_about_values_updated_at();

ALTER TABLE about_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_select_active_about_values ON about_values
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY admin_insert_about_values ON about_values
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY admin_update_about_values ON about_values
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_delete_about_values ON about_values
    FOR DELETE TO authenticated USING (public.is_admin());

-- Seed the four default values (matching the current hard-coded about page).
INSERT INTO about_values (title, description, display_order)
VALUES
    ('Transparency',
     'No hidden fees, no surprises. We believe in honest pricing and clear communication at every step of the process.',
     0),
    ('Quality',
     'Every vehicle we sell is thoroughly inspected and comes with a comprehensive vehicle history. We stand behind what we sell.',
     1),
    ('Customer First',
     'Your satisfaction is our priority. We listen to your needs and work hard to find the perfect vehicle and deal for you.',
     2),
    ('Community',
     'We are proud to be part of the local community. We support local events and charities, and treat every customer like family.',
     3)
ON CONFLICT DO NOTHING;


-- 2. Team members
CREATE TABLE IF NOT EXISTS about_team_members (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name          text NOT NULL DEFAULT 'New Member',
    role          text NOT NULL DEFAULT '',
    photo_url     text,
    display_order integer NOT NULL DEFAULT 0,
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    updated_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS about_team_members_order_idx
    ON about_team_members (display_order)
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION public.touch_about_team_members_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS about_team_members_touch_updated_at ON about_team_members;
CREATE TRIGGER about_team_members_touch_updated_at
    BEFORE UPDATE ON about_team_members
    FOR EACH ROW EXECUTE FUNCTION public.touch_about_team_members_updated_at();

ALTER TABLE about_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_select_active_about_team_members ON about_team_members
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY admin_insert_about_team_members ON about_team_members
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY admin_update_about_team_members ON about_team_members
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_delete_about_team_members ON about_team_members
    FOR DELETE TO authenticated USING (public.is_admin());

-- Seed the three default team members (matching the current hard-coded about page).
INSERT INTO about_team_members (name, role, display_order)
VALUES
    ('James Mitchell', 'Founder & Director', 0),
    ('Sarah Chen',     'Sales Manager',      1),
    ('David Thompson', 'Service Manager',    2)
ON CONFLICT DO NOTHING;


-- 3. New site_content key for the second paragraph of "Our Story".
INSERT INTO site_content (key, value) VALUES
    ('our_story_body',
     'What started as a small yard with a handful of vehicles has grown into a full-service dealership offering quality used cars, vehicle finance, servicing, and repairs. Despite our growth, we have never lost sight of what matters most - putting our customers first and delivering genuine value. Whether you are buying your first car or upgrading your family vehicle, our friendly team is here to help every step of the way.')
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
