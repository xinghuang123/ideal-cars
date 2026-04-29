-- ============================================================
-- Reset all RLS policies to a known-good state.
-- Drops every public/admin policy from migration 001 (some were
-- created in a state that PostgREST/Supabase's API gateway
-- didn't honor), then recreates them with explicit TO clauses.
-- ============================================================

-- Drop existing policies (idempotent)
DROP POLICY IF EXISTS "Public can view vehicles" ON vehicles;
DROP POLICY IF EXISTS "Public can view vehicle images" ON vehicle_images;
DROP POLICY IF EXISTS "Public can view services" ON services;
DROP POLICY IF EXISTS "Public can submit contact enquiries" ON contact_enquiries;
DROP POLICY IF EXISTS "Public can submit sell car enquiries" ON sell_car_enquiries;
DROP POLICY IF EXISTS "Public can submit vehicle enquiries" ON vehicle_enquiries;
DROP POLICY IF EXISTS "Public can submit finance applications" ON finance_applications;
DROP POLICY IF EXISTS "Public can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Public can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Public can read chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Public can insert chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Public can read chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Admin full access vehicles" ON vehicles;
DROP POLICY IF EXISTS "Admin full access vehicle images" ON vehicle_images;
DROP POLICY IF EXISTS "Admin full access contact enquiries" ON contact_enquiries;
DROP POLICY IF EXISTS "Admin full access sell car enquiries" ON sell_car_enquiries;
DROP POLICY IF EXISTS "Admin full access vehicle enquiries" ON vehicle_enquiries;
DROP POLICY IF EXISTS "Admin full access finance applications" ON finance_applications;
DROP POLICY IF EXISTS "Admin full access newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admin full access services" ON services;
DROP POLICY IF EXISTS anon_insert ON contact_enquiries;
DROP POLICY IF EXISTS anon_select ON contact_enquiries;

-- Public SELECT
CREATE POLICY public_select_vehicles ON vehicles
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY public_select_vehicle_images ON vehicle_images
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY public_select_services ON services
    FOR SELECT TO anon, authenticated USING (true);

-- Public INSERT (form submissions)
CREATE POLICY public_insert_contact_enquiries ON contact_enquiries
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY public_insert_sell_car_enquiries ON sell_car_enquiries
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY public_insert_vehicle_enquiries ON vehicle_enquiries
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY public_insert_finance_applications ON finance_applications
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY public_insert_newsletter ON newsletter_subscribers
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Chat (anon needs both insert + select for chatbot session continuity)
CREATE POLICY public_insert_chat_sessions ON chat_sessions
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY public_select_chat_sessions ON chat_sessions
    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY public_insert_chat_messages ON chat_messages
    FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY public_select_chat_messages ON chat_messages
    FOR SELECT TO anon, authenticated USING (true);

-- Admin full access — uses JWT 'role' = 'admin' claim (set via app_metadata)
CREATE POLICY admin_all_vehicles ON vehicles
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY admin_all_vehicle_images ON vehicle_images
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY admin_all_contact_enquiries ON contact_enquiries
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY admin_all_sell_car_enquiries ON sell_car_enquiries
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY admin_all_vehicle_enquiries ON vehicle_enquiries
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY admin_all_finance_applications ON finance_applications
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY admin_all_newsletter ON newsletter_subscribers
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
CREATE POLICY admin_all_services ON services
    FOR ALL TO authenticated
    USING ((auth.jwt() ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

NOTIFY pgrst, 'reload schema';
