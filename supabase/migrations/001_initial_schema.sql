-- ============================================================
-- Ideal Cars - Initial Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. ENUMS
-- ============================================================
CREATE TYPE vehicle_status AS ENUM ('available', 'sold', 'special');
CREATE TYPE fuel_type AS ENUM ('Petrol', 'Diesel', 'Hybrid', 'Electric');
CREATE TYPE transmission_type AS ENUM ('Automatic', 'Manual');
CREATE TYPE body_type AS ENUM ('Sedan', 'Hatchback', 'SUV', 'Ute', 'Wagon', 'Coupe', 'Van');
CREATE TYPE enquiry_subject AS ENUM ('General Inquiry', 'Buy a Car', 'Sell a Car', 'Finance', 'Service', 'Other');
CREATE TYPE sell_condition AS ENUM ('Excellent', 'Good', 'Fair', 'Poor');
CREATE TYPE enquiry_status AS ENUM ('new', 'read', 'replied', 'archived');

-- 2. TABLES
-- ============================================================

-- Vehicles (main inventory)
CREATE TABLE vehicles (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_number    varchar(20) UNIQUE NOT NULL,
    make            varchar(50) NOT NULL,
    model           varchar(50) NOT NULL,
    year            smallint NOT NULL CHECK (year >= 1990),
    price           decimal(10,2) NOT NULL CHECK (price >= 0),
    mileage         integer NOT NULL CHECK (mileage >= 0),
    fuel_type       fuel_type NOT NULL,
    transmission    transmission_type NOT NULL,
    body_type       body_type NOT NULL,
    engine_size     varchar(10),
    colour          varchar(30) NOT NULL,
    doors           smallint CHECK (doors >= 2 AND doors <= 5),
    seats           smallint CHECK (seats >= 2 AND seats <= 8),
    drive_type      varchar(10),
    features        text[] DEFAULT '{}',
    description     text,
    status          vehicle_status NOT NULL DEFAULT 'available',
    wof_expiry      date,
    rego_expiry     date,
    vin             varchar(17) UNIQUE,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_make ON vehicles(make);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_year ON vehicles(year);

-- Vehicle images
CREATE TABLE vehicle_images (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id      uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url       text NOT NULL,
    display_order   smallint DEFAULT 0,
    is_primary      boolean DEFAULT false,
    created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);

-- Contact enquiries
CREATE TABLE contact_enquiries (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        varchar(100) NOT NULL,
    email       varchar(255) NOT NULL,
    phone       varchar(20) NOT NULL,
    subject     enquiry_subject NOT NULL,
    message     text NOT NULL,
    status      enquiry_status DEFAULT 'new',
    created_at  timestamptz DEFAULT now()
);

-- Sell car enquiries
CREATE TABLE sell_car_enquiries (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            varchar(100) NOT NULL,
    email           varchar(255) NOT NULL,
    phone           varchar(20) NOT NULL,
    make            varchar(50) NOT NULL,
    model           varchar(50) NOT NULL,
    year            smallint NOT NULL,
    mileage         integer NOT NULL,
    fuel_type       fuel_type NOT NULL,
    transmission    transmission_type NOT NULL,
    condition       sell_condition NOT NULL,
    description     text,
    expected_price  decimal(10,2),
    status          enquiry_status DEFAULT 'new',
    created_at      timestamptz DEFAULT now()
);

-- Vehicle enquiries (from car detail page "Enquire Now")
CREATE TABLE vehicle_enquiries (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id  uuid REFERENCES vehicles(id) ON DELETE SET NULL,
    name        varchar(100) NOT NULL,
    email       varchar(255) NOT NULL,
    phone       varchar(20) NOT NULL,
    message     text,
    status      enquiry_status DEFAULT 'new',
    created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_vehicle_enquiries_vehicle ON vehicle_enquiries(vehicle_id);

-- Finance applications
CREATE TABLE finance_applications (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id          uuid REFERENCES vehicles(id) ON DELETE SET NULL,
    name                varchar(100) NOT NULL,
    email               varchar(255) NOT NULL,
    phone               varchar(20) NOT NULL,
    employment_status   varchar(50),
    annual_income       decimal(10,2),
    deposit_amount      decimal(10,2),
    loan_term_years     smallint,
    message             text,
    status              enquiry_status DEFAULT 'new',
    created_at          timestamptz DEFAULT now()
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email           varchar(255) UNIQUE NOT NULL,
    is_active       boolean DEFAULT true,
    subscribed_at   timestamptz DEFAULT now(),
    unsubscribed_at timestamptz
);

-- Chat sessions (for AI chatbot - Milestone 4)
CREATE TABLE chat_sessions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token   varchar(255) UNIQUE NOT NULL,
    started_at      timestamptz DEFAULT now(),
    ended_at        timestamptz
);

-- Chat messages
CREATE TABLE chat_messages (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role            varchar(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content         text NOT NULL,
    created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);

-- Services
CREATE TABLE services (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title           varchar(100) NOT NULL,
    description     text NOT NULL,
    icon            varchar(50),
    features        text[] DEFAULT '{}',
    display_order   smallint DEFAULT 0,
    is_active       boolean DEFAULT true
);

-- 3. TRIGGERS
-- ============================================================

-- Auto-update updated_at on vehicles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sell_car_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "Public can view vehicles"
    ON vehicles FOR SELECT USING (true);

CREATE POLICY "Public can view vehicle images"
    ON vehicle_images FOR SELECT USING (true);

CREATE POLICY "Public can view services"
    ON services FOR SELECT USING (true);

-- Public INSERT policies (form submissions)
CREATE POLICY "Public can submit contact enquiries"
    ON contact_enquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can submit sell car enquiries"
    ON sell_car_enquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can submit vehicle enquiries"
    ON vehicle_enquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can submit finance applications"
    ON finance_applications FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can subscribe to newsletter"
    ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Public chat policies
CREATE POLICY "Public can create chat sessions"
    ON chat_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read chat sessions"
    ON chat_sessions FOR SELECT USING (true);

CREATE POLICY "Public can insert chat messages"
    ON chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read chat messages"
    ON chat_messages FOR SELECT USING (true);

-- Admin full access policies (using Supabase Auth JWT)
CREATE POLICY "Admin full access vehicles"
    ON vehicles FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access vehicle images"
    ON vehicle_images FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access contact enquiries"
    ON contact_enquiries FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access sell car enquiries"
    ON sell_car_enquiries FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access vehicle enquiries"
    ON vehicle_enquiries FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access finance applications"
    ON finance_applications FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access newsletter"
    ON newsletter_subscribers FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin full access services"
    ON services FOR ALL
    USING (auth.jwt() ->> 'role' = 'admin');

-- 5. SEED DATA - Services
-- ============================================================

INSERT INTO services (title, description, icon, features, display_order) VALUES
('Warrant of Fitness (WOF)', 'Keep your vehicle road-legal with our quick and thorough WOF inspections.', 'shield-check', ARRAY['NZTA-approved inspection', 'Quick turnaround', 'Detailed report provided', 'Re-inspection included'], 1),
('Vehicle Servicing', 'Regular maintenance to keep your car running at its best.', 'wrench', ARRAY['Full & interim services', 'All makes and models', 'Genuine parts available', 'Service book stamped'], 2),
('Mechanical Repairs', 'Expert diagnosis and repair for all mechanical issues.', 'cog', ARRAY['Engine & transmission', 'Brakes & suspension', 'Electrical diagnostics', 'Free quotes available'], 3),
('Tyres & Alignment', 'Complete tyre services to keep you safe on the road.', 'circle', ARRAY['New & quality used tyres', 'Wheel alignment', 'Tyre balancing', 'Puncture repairs'], 4),
('Pre-Purchase Inspection', 'Make an informed buying decision with our thorough vehicle inspection.', 'clipboard-check', ARRAY['Comprehensive 100+ point check', 'Written report', 'Mechanical & structural', 'Peace of mind'], 5),
('Auto Electrical', 'Professional auto electrical services and diagnostics.', 'zap', ARRAY['Computer diagnostics', 'Battery testing & replacement', 'Wiring repairs', 'Accessory installation'], 6);

-- 5b. SEED DATA - Vehicles
-- ============================================================

INSERT INTO vehicles (stock_number, make, model, year, price, mileage, fuel_type, transmission, body_type, engine_size, colour, doors, seats, drive_type, features, description, status, wof_expiry, rego_expiry, vin) VALUES
('IC001', 'Toyota', 'Corolla', 2020, 24990.00, 45000, 'Petrol', 'Automatic', 'Sedan', '2.0L', 'Silver', 4, 5, 'FWD', ARRAY['Bluetooth', 'Reversing Camera', 'Lane Departure Warning', 'Adaptive Cruise Control', 'Apple CarPlay', 'Android Auto', 'LED Headlights'], 'Well-maintained Toyota Corolla with low mileage. Features the latest safety technology including lane departure warning and adaptive cruise control. Perfect for daily commuting with excellent fuel economy.', 'special', '2025-06-15', '2025-08-20', 'JTDBR3BE0L0000001'),
('IC002', 'Mazda', 'CX-5', 2019, 29990.00, 62000, 'Petrol', 'Automatic', 'SUV', '2.5L', 'Red', 4, 5, 'AWD', ARRAY['Leather Seats', 'Sunroof', 'Navigation', 'Blind Spot Monitoring', 'Power Tailgate', 'Heated Seats', 'Bose Sound System'], 'Stunning Mazda CX-5 in Soul Red Crystal. This SUV combines style with practicality, featuring a premium Bose sound system and leather interior. AWD for confident driving in all conditions.', 'available', '2025-04-10', '2025-07-15', 'JM3KFBDL0K0000002'),
('IC003', 'Ford', 'Ranger', 2021, 45990.00, 38000, 'Diesel', 'Automatic', 'Ute', '2.0L', 'Blue', 4, 5, '4WD', ARRAY['Tow Bar', 'Sports Bar', 'Bed Liner', 'Reversing Camera', 'Bluetooth', 'Cruise Control', 'Hill Descent Control'], 'Powerful Ford Ranger XLT with 4WD capability. Ready for work or play with tow bar, sports bar, and bed liner fitted. Low kilometres for the year with full service history.', 'special', '2025-09-01', '2025-11-30', 'MNAUMFF50M0000003'),
('IC004', 'Honda', 'Jazz', 2018, 16990.00, 78000, 'Hybrid', 'Automatic', 'Hatchback', '1.5L', 'White', 4, 5, 'FWD', ARRAY['Bluetooth', 'Magic Seats', 'Reversing Camera', 'Climate Control', 'USB Connectivity'], 'Economical Honda Jazz Hybrid with Honda''s famous Magic Seats for versatile cargo space. Great fuel economy and reliability make this perfect as a city runabout.', 'available', '2025-03-20', '2025-06-10', 'JHMGK5H50JS000004'),
('IC005', 'Nissan', 'X-Trail', 2020, 27990.00, 55000, 'Petrol', 'Automatic', 'SUV', '2.5L', 'Black', 4, 5, 'AWD', ARRAY['7 Seats', 'Reversing Camera', 'Bluetooth', 'Roof Rails', 'Cruise Control', 'Intelligent Key'], 'Spacious Nissan X-Trail with 7-seat configuration, perfect for growing families. AWD system provides confidence in all weather conditions. Well-equipped with modern conveniences.', 'available', '2025-05-25', '2025-09-05', 'JN1TBNT32Z0000005'),
('IC006', 'Suzuki', 'Swift', 2022, 19990.00, 22000, 'Petrol', 'Automatic', 'Hatchback', '1.2L', 'Yellow', 4, 5, 'FWD', ARRAY['Apple CarPlay', 'Android Auto', 'Reversing Camera', 'LED Headlights', 'Cruise Control', 'Keyless Entry'], 'Near-new Suzuki Swift with extremely low kilometres. Fun to drive with excellent fuel economy. Comes with the latest connectivity features and a balance of factory warranty.', 'available', '2026-01-15', '2026-03-20', 'MHKZC71S0N0000006'),
('IC007', 'Mitsubishi', 'Outlander', 2021, 34990.00, 41000, 'Hybrid', 'Automatic', 'SUV', '2.4L', 'Grey', 4, 5, 'AWD', ARRAY['Plug-in Hybrid', 'Leather Seats', 'Sunroof', '360 Camera', 'Head-up Display', 'Heated Steering Wheel', 'Power Tailgate'], 'Premium Mitsubishi Outlander PHEV with incredibly low running costs. Charge at home for daily commuting and use the petrol engine for longer trips. Loaded with luxury features.', 'special', '2025-08-10', '2025-12-01', 'JA4J24A55M0000007'),
('IC008', 'Hyundai', 'Kona', 2022, 32990.00, 18000, 'Electric', 'Automatic', 'SUV', 'N/A', 'Green', 4, 5, 'FWD', ARRAY['64kWh Battery', 'Fast Charging', 'Navigation', 'Blind Spot Monitor', 'Lane Keep Assist', 'Wireless Charging', 'Premium Audio'], 'Fully electric Hyundai Kona with impressive 64kWh battery for long range driving. Very low kilometres and packed with advanced driver assistance features. The future of motoring.', 'available', '2026-02-28', '2026-05-15', 'KM8K33AG0N0000008'),
('IC009', 'Toyota', 'Hilux', 2019, 39990.00, 72000, 'Diesel', 'Automatic', 'Ute', '2.8L', 'White', 4, 5, '4WD', ARRAY['Tow Bar', 'Canopy', 'Reversing Camera', 'Bluetooth', 'Cruise Control', 'Diff Lock'], 'Legendary Toyota Hilux SR5 with the proven 2.8L diesel engine. Comes fitted with a quality canopy and tow bar. Well maintained with full Toyota service history.', 'sold', '2025-07-20', '2025-10-15', 'MROFR22G0K0000009'),
('IC010', 'Kia', 'Sportage', 2023, 38990.00, 12000, 'Petrol', 'Automatic', 'SUV', '2.0L', 'Navy', 4, 5, 'AWD', ARRAY['Panoramic Sunroof', 'Leather Seats', 'Navigation', 'Wireless Apple CarPlay', 'Surround View Monitor', 'Ventilated Seats', 'Highway Driving Assist'], 'Almost new Kia Sportage with the bold new design. Extremely low kilometres and loaded with premium features including ventilated seats and highway driving assist. Balance of 7-year warranty.', 'available', '2026-05-01', '2026-08-10', 'KNAPH81B0P0000010'),
('IC011', 'Mazda', 'Mazda3', 2021, 28990.00, 35000, 'Petrol', 'Automatic', 'Hatchback', '2.0L', 'Red', 4, 5, 'FWD', ARRAY['Heads-up Display', 'Leather Seats', 'Bose Sound System', 'Navigation', 'Adaptive Cruise Control', 'Reversing Camera', 'Blind Spot Monitoring'], 'Beautiful Mazda3 in Soul Red Crystal with the premium interior package. This hatchback combines sporty driving dynamics with luxury features. One owner with full Mazda service history.', 'sold', '2025-11-05', '2026-01-20', 'JM1BPBDL0M0000011'),
('IC012', 'Subaru', 'Outback', 2020, 33990.00, 48000, 'Petrol', 'Automatic', 'Wagon', '2.5L', 'Green', 4, 5, 'AWD', ARRAY['EyeSight Safety', 'Leather Seats', 'Sunroof', 'Power Tailgate', 'Navigation', 'Heated Seats', 'X-Mode'], 'Capable Subaru Outback with Symmetrical AWD and EyeSight safety system. Perfect for adventures with generous ground clearance and a spacious interior. Ideal for New Zealand roads.', 'available', '2025-10-15', '2026-02-28', 'JF1BS9LC0L0000012');
