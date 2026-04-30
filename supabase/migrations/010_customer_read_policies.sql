-- Allow logged-in customers to read their own finance applications and
-- vehicle enquiries via the customer_id column added in migration 009.

DROP POLICY IF EXISTS customer_select_finance_applications ON finance_applications;
CREATE POLICY customer_select_finance_applications ON finance_applications
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());

DROP POLICY IF EXISTS customer_select_vehicle_enquiries ON vehicle_enquiries;
CREATE POLICY customer_select_vehicle_enquiries ON vehicle_enquiries
    FOR SELECT TO authenticated
    USING (customer_id = auth.uid());
