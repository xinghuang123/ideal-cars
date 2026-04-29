-- ============================================================
-- Move admin role check from top-level JWT claim to app_metadata.
-- Top-level 'role' in Supabase JWTs is the Postgres role
-- ('authenticated', 'anon', etc.) — not a place for custom roles.
-- Convention: store admin flag in app_metadata.role = 'admin'.
-- ============================================================

DROP POLICY IF EXISTS admin_all_vehicles ON vehicles;
DROP POLICY IF EXISTS admin_all_vehicle_images ON vehicle_images;
DROP POLICY IF EXISTS admin_all_contact_enquiries ON contact_enquiries;
DROP POLICY IF EXISTS admin_all_sell_car_enquiries ON sell_car_enquiries;
DROP POLICY IF EXISTS admin_all_vehicle_enquiries ON vehicle_enquiries;
DROP POLICY IF EXISTS admin_all_finance_applications ON finance_applications;
DROP POLICY IF EXISTS admin_all_newsletter ON newsletter_subscribers;
DROP POLICY IF EXISTS admin_all_services ON services;

CREATE POLICY admin_all_vehicles ON vehicles
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY admin_all_vehicle_images ON vehicle_images
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY admin_all_contact_enquiries ON contact_enquiries
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY admin_all_sell_car_enquiries ON sell_car_enquiries
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY admin_all_vehicle_enquiries ON vehicle_enquiries
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY admin_all_finance_applications ON finance_applications
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY admin_all_newsletter ON newsletter_subscribers
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY admin_all_services ON services
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
    WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

NOTIFY pgrst, 'reload schema';
