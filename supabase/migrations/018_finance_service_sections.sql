-- Editable Finance and Service page sections.
-- Adds tables for finance benefits and FAQs (services table already exists),
-- and site_content keys for all section headings/subtitles + Service CTA copy.

-- 1. Finance benefits ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS finance_benefits (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    icon          text NOT NULL DEFAULT '*',
    title         text NOT NULL DEFAULT 'New Benefit',
    description   text NOT NULL DEFAULT '',
    display_order integer NOT NULL DEFAULT 0,
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    updated_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS finance_benefits_order_idx
    ON finance_benefits (display_order)
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION public.touch_finance_benefits_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS finance_benefits_touch_updated_at ON finance_benefits;
CREATE TRIGGER finance_benefits_touch_updated_at
    BEFORE UPDATE ON finance_benefits
    FOR EACH ROW EXECUTE FUNCTION public.touch_finance_benefits_updated_at();

ALTER TABLE finance_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_select_active_finance_benefits ON finance_benefits
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY admin_insert_finance_benefits ON finance_benefits
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY admin_update_finance_benefits ON finance_benefits
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_delete_finance_benefits ON finance_benefits
    FOR DELETE TO authenticated USING (public.is_admin());

INSERT INTO finance_benefits (icon, title, description, display_order) VALUES
    ('%', 'Competitive Rates',
     'We work with multiple lenders to find you the best interest rates available, ensuring you get the most affordable repayments.',
     0),
    ('~', 'Flexible Terms',
     'Choose a loan term from 1 to 5 years to suit your budget. Adjust your deposit and repayment schedule to fit your lifestyle.',
     1),
    ('!', 'Quick Approval',
     'Our streamlined application process means you can get pre-approved quickly, often within the same day.',
     2),
    ('*', 'All Credit Types',
     'Whether you have excellent credit or are rebuilding, we have finance options available. Everyone deserves a fair go.',
     3)
ON CONFLICT DO NOTHING;


-- 2. Finance FAQs -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS finance_faqs (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question      text NOT NULL DEFAULT 'New Question',
    answer        text NOT NULL DEFAULT '',
    display_order integer NOT NULL DEFAULT 0,
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    updated_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS finance_faqs_order_idx
    ON finance_faqs (display_order)
    WHERE is_active = true;

CREATE OR REPLACE FUNCTION public.touch_finance_faqs_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS finance_faqs_touch_updated_at ON finance_faqs;
CREATE TRIGGER finance_faqs_touch_updated_at
    BEFORE UPDATE ON finance_faqs
    FOR EACH ROW EXECUTE FUNCTION public.touch_finance_faqs_updated_at();

ALTER TABLE finance_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_select_active_finance_faqs ON finance_faqs
    FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY admin_insert_finance_faqs ON finance_faqs
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY admin_update_finance_faqs ON finance_faqs
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY admin_delete_finance_faqs ON finance_faqs
    FOR DELETE TO authenticated USING (public.is_admin());

INSERT INTO finance_faqs (question, answer, display_order) VALUES
    ('What documents do I need to apply for finance?',
     'You will typically need a valid NZ driver licence or passport, proof of income (recent payslips or bank statements), proof of address (utility bill or bank statement), and details of your current employment. We will guide you through exactly what is needed during the application process.',
     0),
    ('Can I get finance with bad credit?',
     'Yes, we work with a range of lenders who specialise in different credit profiles. While interest rates may vary depending on your credit history, we are committed to finding a solution that works for you. Everyone deserves a fair go.',
     1),
    ('How long does the approval process take?',
     'In many cases, we can get a pre-approval within the same business day. Full approval typically takes 1-2 business days once all documentation has been submitted. We work hard to make the process as quick and smooth as possible.',
     2),
    ('Can I pay off my loan early?',
     'Yes, most of our finance options allow early repayment. Some lenders may charge a small early repayment fee, but many do not. We will make sure you understand all the terms before you sign anything.',
     3),
    ('What is the minimum deposit required?',
     'The minimum deposit varies depending on the lender and your credit profile. In some cases, no deposit is required. However, a larger deposit will reduce your loan amount and monthly repayments. We recommend putting down at least 10-20% if possible.',
     4)
ON CONFLICT DO NOTHING;


-- 3. Services -- table already exists from 001_initial_schema.sql.
-- Add RLS + admin write policies that are missing for this table.

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'services'
          AND policyname = 'public_select_active_services'
    ) THEN
        CREATE POLICY public_select_active_services ON services
            FOR SELECT TO anon, authenticated
            USING (is_active = true OR public.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'services'
          AND policyname = 'admin_insert_services'
    ) THEN
        CREATE POLICY admin_insert_services ON services
            FOR INSERT TO authenticated WITH CHECK (public.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'services'
          AND policyname = 'admin_update_services'
    ) THEN
        CREATE POLICY admin_update_services ON services
            FOR UPDATE TO authenticated
            USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'services'
          AND policyname = 'admin_delete_services'
    ) THEN
        CREATE POLICY admin_delete_services ON services
            FOR DELETE TO authenticated USING (public.is_admin());
    END IF;
END $$;


-- 4. Site content keys for Finance and Service section copy -------------------

INSERT INTO site_content (key, value) VALUES
    -- Finance
    ('page_finance_subtitle',
     'Flexible finance solutions to get you on the road sooner.'),
    ('finance_benefits_heading',     'Why Finance With Us'),
    ('finance_benefits_subtitle',
     'We make car finance simple, transparent, and accessible.'),
    ('finance_calculator_heading',   'Finance Calculator'),
    ('finance_calculator_subtitle',
     'Use our calculator to estimate your weekly and monthly repayments.'),
    ('finance_apply_heading',        'Apply for Finance'),
    ('finance_apply_subtitle',
     'Pre-approval is fast and obligation-free. We''ll be in touch within one business day.'),
    ('finance_faq_heading',          'Frequently Asked Questions'),
    ('finance_faq_subtitle',         'Common questions about car finance answered.'),
    -- Service
    ('page_service_subtitle',
     'Professional vehicle servicing and repairs by experienced mechanics.'),
    ('service_intro_heading',        'Our Services'),
    ('service_intro_subtitle',
     'From routine maintenance to complex repairs, our qualified mechanics keep your vehicle running at its best.'),
    ('service_cta_heading',          'Ready to Book a Service?'),
    ('service_cta_body',
     'Get in touch with our team to schedule your next service or repair. We offer competitive pricing and quality workmanship.'),
    ('service_cta_button_text',      'Book a Service')
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
