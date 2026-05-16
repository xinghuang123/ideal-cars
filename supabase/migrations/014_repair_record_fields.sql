-- 014_repair_record_fields.sql
-- Extend service_records to support distinct repair entries with their own
-- structured fields (diagnosis, work done, parts/labour breakdown, warranty).
-- Existing rows are treated as services via the default value on record_type.

ALTER TABLE service_records
    ADD COLUMN IF NOT EXISTS record_type varchar(20) NOT NULL DEFAULT 'service'
        CHECK (record_type IN ('service', 'repair'));

ALTER TABLE service_records
    ADD COLUMN IF NOT EXISTS diagnosis       text,
    ADD COLUMN IF NOT EXISTS work_done       text,
    ADD COLUMN IF NOT EXISTS parts_cost      numeric(10,2),
    ADD COLUMN IF NOT EXISTS labour_cost     numeric(10,2),
    ADD COLUMN IF NOT EXISTS warranty_until  date;

CREATE INDEX IF NOT EXISTS idx_service_records_type
    ON service_records(customer_vehicle_id, record_type, service_date DESC);
