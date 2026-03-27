-- ============================================================
-- Real Estate TN — Full Database Schema
-- Single source of truth. Run via: node scripts/resetDB.js
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop all tables in reverse dependency order for a clean reset
DROP TABLE IF EXISTS price_history CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS trained_models CASCADE;
DROP TABLE IF EXISTS prediction_factors CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS property_status CASCADE;
DROP TABLE IF EXISTS land_types CASCADE;
DROP TABLE IF EXISTS mock_patta CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ======================== USERS ========================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('user','admin')) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ======================== LAND TYPES ========================
CREATE TABLE IF NOT EXISTS land_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

INSERT INTO land_types (name, description) VALUES
('Agricultural', 'Land used for farming or cultivation'),
('Residential', 'Land used for building houses or apartments')
ON CONFLICT DO NOTHING;

-- ======================== PROPERTY STATUS ========================
CREATE TABLE IF NOT EXISTS property_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(30) UNIQUE NOT NULL
);

INSERT INTO property_status (status) VALUES
('pending'), ('approved'), ('rejected'), ('sold'), ('amenities_requested')
ON CONFLICT DO NOTHING;

-- ======================== PROPERTIES ========================
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    land_type_id INTEGER REFERENCES land_types(id),
    owner_id INTEGER REFERENCES users(id),
    status_id INTEGER REFERENCES property_status(id),
    price DECIMAL(12,2) NOT NULL,
    area DECIMAL(10,2) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(50) DEFAULT 'Tamil Nadu',
    location GEOMETRY(POINT, 4326),
    features JSONB,

    -- Survey & Patta
    patta_number VARCHAR(50),
    survey_number VARCHAR(50),
    subdivision_number VARCHAR(50),
    village VARCHAR(100),
    taluk VARCHAR(100),

    -- Contact Details
    contact_person_name VARCHAR(200),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    contact_address TEXT,

    -- Residential Features
    plot_shape VARCHAR(50),
    road_width DECIMAL(6,2),
    facing VARCHAR(50),
    water_connection BOOLEAN,
    electricity_connection BOOLEAN,
    approval_status VARCHAR(50),
    approval_number VARCHAR(100),
    gated_community BOOLEAN,
    corner_plot BOOLEAN,
    landmarks TEXT,

    -- Agricultural Features
    soil_type VARCHAR(50),
    water_availability VARCHAR(50),
    irrigation_type VARCHAR(50),
    electricity_available BOOLEAN,
    tree_type VARCHAR(100),
    tree_stage VARCHAR(50),
    soil_depth VARCHAR(50),
    road_access_type VARCHAR(50),
    distance_from_highway DECIMAL(8,2),
    fencing_details TEXT,

    -- Amenity Columns (auto‑filled from Geoapify or user fallback)
    distance_to_cbd_km DECIMAL(6,2),
    nearest_bus_distance_m INTEGER,
    nearest_railway_distance_m INTEGER,
    nearest_school_distance_m INTEGER,
    nearest_hospital_distance_m INTEGER,
    nearest_park_distance_m INTEGER,
    nearest_supermarket_distance_m INTEGER,
    schools_1km_count INTEGER DEFAULT 0,
    bus_stops_1km_count INTEGER DEFAULT 0,
    hospitals_2km_count INTEGER DEFAULT 0,
    restaurants_1km_count INTEGER DEFAULT 0,
    banks_1km_count INTEGER DEFAULT 0,
    water_bodies_1km_count INTEGER DEFAULT 0,
    nearest_water_body_distance_m INTEGER,

    -- JSONB blobs
    amenities_data JSONB,
    amenity_credits JSONB,
    user_provided_amenities JSONB,
    amenities_request_note TEXT,

    -- Verification
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(id),
    predicted_price DECIMAL(12,2),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status_id);
CREATE INDEX IF NOT EXISTS idx_properties_land_type ON properties(land_type_id);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);

-- ======================== MOCK PATTA (Official Land Registry) ========================
CREATE TABLE IF NOT EXISTS mock_patta (
    id SERIAL PRIMARY KEY,
    patta_number VARCHAR(50),
    district VARCHAR(100),
    taluk VARCHAR(100),
    village VARCHAR(100),
    survey_number VARCHAR(50),
    subdivision_number VARCHAR(50),
    owner_name VARCHAR(200),
    area DECIMAL(10,2),
    land_type VARCHAR(50),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    fmb_sketch_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ======================== SAMPLE PATTA DATA ========================
-- 5 realistic records across South Tamil Nadu districts
INSERT INTO mock_patta (patta_number, district, taluk, village, survey_number, subdivision_number, owner_name, area, land_type, latitude, longitude) VALUES
-- 1. Tirunelveli — Agricultural land near Palayamkottai
('PTN-2024-001', 'Tirunelveli', 'Palayamkottai', 'Melapalayam', '123/4A', '4A', 'Murugan S', 2.50, 'Agricultural', 8.71390000, 77.75170000),
-- 2. Madurai — Residential plot in Anna Nagar
('PMD-2024-002', 'Madurai', 'Madurai South', 'Anna Nagar', '456/7B', '7B', 'Lakshmi R', 0.12, 'Residential', 9.91950000, 78.11960000),
-- 3. Theni — Agricultural farmland
('PTH-2024-003', 'Theni', 'Periyakulam', 'Bodinayakanur', '789/2', '2', 'Rajan K', 5.00, 'Agricultural', 10.01310000, 77.34910000),
-- 4. Dindigul — Residential plot
('PDG-2024-004', 'Dindigul', 'Dindigul', 'Begampur', '321/1A', '1A', 'Priya M', 0.08, 'Residential', 10.36240000, 77.97010000),
-- 5. Thoothukudi — Agricultural land near coast
('PTK-2024-005', 'Thoothukudi', 'Srivaikuntam', 'Nazareth', '555/3', '3', 'David J', 3.25, 'Agricultural', 8.57360000, 77.92380000)
ON CONFLICT DO NOTHING;

-- ======================== MEDIA ========================
CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT,
    type VARCHAR(10) CHECK (type IN ('image','video','document')),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ======================== PRICE HISTORY ========================
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    price DECIMAL(12,2),
    predicted_price DECIMAL(12,2),
    amenity_credits JSONB,
    recorded_date DATE DEFAULT CURRENT_DATE,
    source VARCHAR(50) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ======================== PREDICTION FACTORS ========================
CREATE TABLE IF NOT EXISTS prediction_factors (
    id SERIAL PRIMARY KEY,
    land_type_id INTEGER REFERENCES land_types(id),
    factor_name VARCHAR(100),
    factor_type VARCHAR(20) CHECK (factor_type IN ('numeric','categorical','boolean')),
    possible_values JSONB,
    is_required BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    UNIQUE(land_type_id, factor_name)
);

-- ======================== TRAINED MODELS ========================
CREATE TABLE IF NOT EXISTS trained_models (
    id SERIAL PRIMARY KEY,
    land_type_id INTEGER REFERENCES land_types(id) UNIQUE,
    model_data JSONB,
    feature_names TEXT[],
    stats JSONB,
    r2_score DECIMAL(5,4),
    training_data_count INTEGER,
    trained_at TIMESTAMP DEFAULT NOW()
);

-- ======================== SEED ADMIN ========================
-- Admin credentials: admin@realestate.com / admin123
INSERT INTO users (name, email, password_hash, phone, role)
VALUES ('System Admin', 'admin@realestate.com', '$2b$10$BuSIKq4Jt4brx1NLGpJtd.ywK5fRINq60rG0irQpqJcfB1Otmq7.6', '9876543210', 'admin')
ON CONFLICT (email) DO NOTHING;
