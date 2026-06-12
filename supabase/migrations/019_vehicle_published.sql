-- 019_vehicle_published.sql
-- Draft/publish workflow for vehicle listings. Admins create vehicles as
-- drafts and publish them explicitly; only published vehicles are visible
-- to the public site (enforced by RLS, not just app queries).

-- Existing rows are backfilled to published=true (the site is live and all
-- current stock is already visible); the default is then flipped so NEW
-- vehicles start as drafts.
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;
ALTER TABLE vehicles ALTER COLUMN published SET DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_vehicles_published ON vehicles(published);

-- Public sees only published vehicles; admins see everything.
DROP POLICY IF EXISTS public_select_vehicles ON vehicles;
CREATE POLICY public_select_vehicles ON vehicles
    FOR SELECT TO anon, authenticated
    USING (published OR public.is_admin());

-- Keep chatbot retrieval consistent (defence in depth — the function is
-- SECURITY INVOKER so the policy above already applies to anon callers).
CREATE OR REPLACE FUNCTION match_vehicles(
    query_embedding vector(384),
    match_count int DEFAULT 5,
    min_similarity float DEFAULT 0.0,
    include_sold boolean DEFAULT false
)
RETURNS TABLE (
    id uuid,
    year smallint,
    make text,
    model text,
    price numeric,
    mileage int,
    body_type text,
    fuel_type text,
    transmission text,
    colour text,
    engine_size text,
    drive_type text,
    description text,
    features text[],
    status text,
    stock_number text,
    similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.year,
        v.make::text,
        v.model::text,
        v.price,
        v.mileage,
        v.body_type::text,
        v.fuel_type::text,
        v.transmission::text,
        v.colour::text,
        v.engine_size::text,
        v.drive_type::text,
        v.description,
        v.features,
        v.status::text,
        v.stock_number::text,
        (1 - (v.embedding <=> query_embedding))::float AS similarity
    FROM vehicles v
    WHERE v.embedding IS NOT NULL
      AND v.published
      AND (include_sold OR v.status <> 'sold')
      AND (1 - (v.embedding <=> query_embedding)) > min_similarity
    ORDER BY v.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
