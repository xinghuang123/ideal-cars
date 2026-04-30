-- ============================================================
-- 007_vehicle_embeddings.sql
-- Adds pgvector embedding column to vehicles for RAG chatbot.
-- Embeddings are generated locally via @xenova/transformers using
-- all-MiniLM-L6-v2 (384 dimensions).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS embedding vector(384);

ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS embedding_text text;

ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS embedding_updated_at timestamptz;

-- HNSW index for cosine-distance search. Good recall and fast for
-- the inventory sizes we expect (<10k vehicles).
CREATE INDEX IF NOT EXISTS vehicles_embedding_hnsw_idx
    ON vehicles
    USING hnsw (embedding vector_cosine_ops);

-- Similarity search function. Public-callable so the chatbot route
-- (which uses the anon key) can call it. The function only returns
-- vehicles that are not sold by default, so the assistant doesn't
-- recommend cars that are gone.
CREATE OR REPLACE FUNCTION match_vehicles(
    query_embedding vector(384),
    match_count int DEFAULT 5,
    min_similarity float DEFAULT 0.0,
    include_sold boolean DEFAULT false
)
RETURNS TABLE (
    id uuid,
    year smallint,
    make varchar,
    model varchar,
    price decimal,
    mileage int,
    body_type varchar,
    fuel_type varchar,
    transmission varchar,
    colour varchar,
    engine_size varchar,
    drive_type varchar,
    description text,
    features text[],
    status vehicle_status,
    stock_number varchar,
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
        v.make,
        v.model,
        v.price,
        v.mileage,
        v.body_type,
        v.fuel_type,
        v.transmission,
        v.colour,
        v.engine_size,
        v.drive_type,
        v.description,
        v.features,
        v.status,
        v.stock_number,
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
