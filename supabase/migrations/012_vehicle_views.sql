-- Track vehicle detail-page views so admins can see "top viewed" stats.
-- Lightweight: increment a counter per vehicle, plus a separate event table
-- for time-series queries (last 30 days).

ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS vehicle_views (
    id          bigserial PRIMARY KEY,
    vehicle_id  uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    viewed_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_views_viewed_at ON vehicle_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_views_vehicle ON vehicle_views(vehicle_id, viewed_at DESC);

ALTER TABLE vehicle_views ENABLE ROW LEVEL SECURITY;

-- Anyone (anon, authenticated) can record a view.
CREATE POLICY public_insert_vehicle_views ON vehicle_views
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admins can read view records.
CREATE POLICY admin_select_vehicle_views ON vehicle_views
    FOR SELECT TO authenticated USING (public.is_admin());

-- RPC to atomically increment the counter and insert a row.
CREATE OR REPLACE FUNCTION public.record_vehicle_view(v_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE vehicles SET view_count = view_count + 1 WHERE id = v_id;
    INSERT INTO vehicle_views (vehicle_id) VALUES (v_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_vehicle_view(uuid) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
