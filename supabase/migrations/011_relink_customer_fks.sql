-- PostgREST can only resolve embedded resources when an explicit FK exists
-- between the two tables in the public schema. The original FKs point to
-- auth.users(id), which works for cascading deletes but doesn't let
-- PostgREST embed counts/details. Re-target them to customer_profiles(id)
-- — semantically equivalent (1:1 with auth.users) and lets us write
-- `customer_profiles.select("*, customer_vehicles(count)")` directly.

ALTER TABLE customer_vehicles
    DROP CONSTRAINT IF EXISTS customer_vehicles_customer_id_fkey;
ALTER TABLE customer_vehicles
    ADD CONSTRAINT customer_vehicles_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE;

ALTER TABLE finance_applications
    DROP CONSTRAINT IF EXISTS finance_applications_customer_id_fkey;
ALTER TABLE finance_applications
    ADD CONSTRAINT finance_applications_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE SET NULL;

ALTER TABLE vehicle_enquiries
    DROP CONSTRAINT IF EXISTS vehicle_enquiries_customer_id_fkey;
ALTER TABLE vehicle_enquiries
    ADD CONSTRAINT vehicle_enquiries_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE SET NULL;

-- Tell PostgREST to reload its schema cache so the new relationships are
-- discoverable immediately.
NOTIFY pgrst, 'reload schema';
