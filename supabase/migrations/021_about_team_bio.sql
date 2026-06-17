-- Add a short self-introduction / bio per team member, shown on the /about
-- "Meet Our Team" cards under the role. Admins edit it in site-content.

ALTER TABLE about_team_members
    ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';

NOTIFY pgrst, 'reload schema';
