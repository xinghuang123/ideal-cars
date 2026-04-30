-- Customer profiles, vehicles, and service records.
-- Tied to auth.users via FK; admins are also auth.users but we differentiate
-- via app_metadata.role. A customer profile exists when a row in customer_profiles
-- exists for that user_id.

CREATE TABLE customer_profiles (
    id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       varchar(255),
    phone           varchar(50),
    address_line1   varchar(255),
    address_line2   varchar(255),
    city            varchar(100),
    region          varchar(100),
    postcode        varchar(20),
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_customer_profiles_created ON customer_profiles(created_at DESC);

-- Auto-create a customer profile row whenever a new auth.users row appears
-- without an admin role. Admin invitees should NOT get a customer profile.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (NEW.raw_app_meta_data ->> 'role') IS DISTINCT FROM 'admin' THEN
        INSERT INTO public.customer_profiles (id, full_name, phone)
        VALUES (
            NEW.id,
            NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'phone', '')
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-bump updated_at on profile edits.
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER customer_profiles_touch_updated_at
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Customer-owned vehicles. May or may not link to dealer's inventory.
CREATE TABLE customer_vehicles (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    purchased_vehicle_id    uuid REFERENCES vehicles(id) ON DELETE SET NULL,
    purchased_from_dealer   boolean NOT NULL DEFAULT false,
    year                    smallint NOT NULL,
    make                    varchar(100) NOT NULL,
    model                   varchar(100) NOT NULL,
    rego                    varchar(20),
    vin                     varchar(50),
    colour                  varchar(50),
    purchase_date           date,
    last_service_date       date,
    last_service_mileage    int,
    next_service_due_date   date,
    last_wof_date           date,
    next_wof_due_date       date,
    rego_expiry_date        date,
    notes                   text,
    created_at              timestamptz DEFAULT now(),
    updated_at              timestamptz DEFAULT now()
);

CREATE INDEX idx_customer_vehicles_customer ON customer_vehicles(customer_id);
CREATE INDEX idx_customer_vehicles_next_service ON customer_vehicles(next_service_due_date)
    WHERE next_service_due_date IS NOT NULL;
CREATE INDEX idx_customer_vehicles_next_wof ON customer_vehicles(next_wof_due_date)
    WHERE next_wof_due_date IS NOT NULL;
CREATE INDEX idx_customer_vehicles_rego_expiry ON customer_vehicles(rego_expiry_date)
    WHERE rego_expiry_date IS NOT NULL;

CREATE TRIGGER customer_vehicles_touch_updated_at
    BEFORE UPDATE ON customer_vehicles
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Service records performed on customer vehicles.
CREATE TABLE service_records (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_vehicle_id     uuid NOT NULL REFERENCES customer_vehicles(id) ON DELETE CASCADE,
    service_date            date NOT NULL,
    service_type            varchar(100) NOT NULL,
    mileage                 int,
    description             text,
    cost                    numeric(10,2),
    next_service_due_date   date,
    performed_by            varchar(255),
    created_by              uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at              timestamptz DEFAULT now()
);

CREATE INDEX idx_service_records_vehicle ON service_records(customer_vehicle_id, service_date DESC);

-- Link finance applications to a customer account when they were logged in.
ALTER TABLE finance_applications
    ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_finance_applications_customer ON finance_applications(customer_id)
    WHERE customer_id IS NOT NULL;

-- Same for vehicle enquiries (so customers can see their enquiry history).
ALTER TABLE vehicle_enquiries
    ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_vehicle_enquiries_customer ON vehicle_enquiries(customer_id)
    WHERE customer_id IS NOT NULL;

-- Enable RLS.
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT coalesce(
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
        false
    );
$$;

-- customer_profiles: customer reads/edits own; admin reads/edits all.
CREATE POLICY customer_profiles_self_select ON customer_profiles
    FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());
CREATE POLICY customer_profiles_self_update ON customer_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY customer_profiles_admin_insert ON customer_profiles
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY customer_profiles_admin_delete ON customer_profiles
    FOR DELETE TO authenticated USING (public.is_admin());

-- customer_vehicles: customer reads/writes own; admin reads/writes all.
CREATE POLICY customer_vehicles_self_select ON customer_vehicles
    FOR SELECT TO authenticated USING (auth.uid() = customer_id OR public.is_admin());
CREATE POLICY customer_vehicles_self_insert ON customer_vehicles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id OR public.is_admin());
CREATE POLICY customer_vehicles_self_update ON customer_vehicles
    FOR UPDATE TO authenticated USING (auth.uid() = customer_id OR public.is_admin())
    WITH CHECK (auth.uid() = customer_id OR public.is_admin());
CREATE POLICY customer_vehicles_self_delete ON customer_vehicles
    FOR DELETE TO authenticated USING (auth.uid() = customer_id OR public.is_admin());

-- service_records: customer can read records on their own vehicles; admin full access.
CREATE POLICY service_records_self_select ON service_records
    FOR SELECT TO authenticated USING (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM customer_vehicles cv
            WHERE cv.id = service_records.customer_vehicle_id
              AND cv.customer_id = auth.uid()
        )
    );
CREATE POLICY service_records_admin_insert ON service_records
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY service_records_admin_update ON service_records
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY service_records_admin_delete ON service_records
    FOR DELETE TO authenticated USING (public.is_admin());
