-- ============================================================
-- Add Consumer Information Notice (CIN) and Basic Condition Guide (BCG)
-- as JSONB columns on the vehicles table.
-- Per NZ Fair Trading Act, used vehicles offered for sale by traders
-- must display a CIN and BCG. Storing as JSONB keeps the deeply nested
-- shape simple to manage; the application validates the structure.
-- ============================================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS cin jsonb;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS bcg jsonb;

NOTIFY pgrst, 'reload schema';
