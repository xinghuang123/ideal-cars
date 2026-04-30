-- Fix RETURNS TABLE types to match actual column types. The original
-- migration declared body_type/fuel_type/transmission as varchar but
-- they are user-defined enums in this schema, which causes a type
-- mismatch at runtime.
DROP FUNCTION IF EXISTS match_vehicles(vector, int, float, boolean);

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
      AND (include_sold OR v.status <> 'sold')
      AND (1 - (v.embedding <=> query_embedding)) > min_similarity
    ORDER BY v.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_vehicles(vector, int, float, boolean)
    TO anon, authenticated;
