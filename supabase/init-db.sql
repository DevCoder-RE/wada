-- Database initialization script for Coolify deployment
-- This script runs after PostgreSQL starts and sets up the database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('athlete', 'coach', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE certification_type AS ENUM ('NSF', 'Informed_Sport', 'ISO_17025', 'WADA_Compliant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS athlete_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    date_of_birth DATE,
    sport TEXT NOT NULL,
    team TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT,
    barcode TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    type certification_type NOT NULL,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplement_certifications (
    supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
    certification_id UUID REFERENCES certifications(id) ON DELETE CASCADE,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by UUID,
    PRIMARY KEY (supplement_id, certification_id)
);

CREATE TABLE IF NOT EXISTS logbook_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_user_id ON athlete_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_supplements_barcode ON supplements(barcode);
CREATE INDEX IF NOT EXISTS idx_ingredients_supplement_id ON ingredients(supplement_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_athlete_id ON logbook_entries(athlete_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_timestamp ON logbook_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_supplement_id ON logbook_entries(supplement_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_athlete_profiles_updated_at ON athlete_profiles;
CREATE TRIGGER update_athlete_profiles_updated_at BEFORE UPDATE ON athlete_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_supplements_updated_at ON supplements;
CREATE TRIGGER update_supplements_updated_at BEFORE UPDATE ON supplements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_logbook_entries_updated_at ON logbook_entries;
CREATE TRIGGER update_logbook_entries_updated_at BEFORE UPDATE ON logbook_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (these will be managed by Supabase Auth)
-- For now, we'll create basic policies that allow authenticated users

-- Athlete profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON athlete_profiles;
CREATE POLICY "Users can view their own profile" ON athlete_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON athlete_profiles;
CREATE POLICY "Users can update their own profile" ON athlete_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON athlete_profiles;
CREATE POLICY "Users can insert their own profile" ON athlete_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Supplements policies (public read, authenticated write)
DROP POLICY IF EXISTS "Anyone can view supplements" ON supplements;
CREATE POLICY "Anyone can view supplements" ON supplements
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create supplements" ON supplements;
CREATE POLICY "Authenticated users can create supplements" ON supplements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update supplements" ON supplements;
CREATE POLICY "Authenticated users can update supplements" ON supplements
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Ingredients policies
DROP POLICY IF EXISTS "Anyone can view ingredients" ON ingredients;
CREATE POLICY "Anyone can view ingredients" ON ingredients
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage ingredients" ON ingredients;
CREATE POLICY "Authenticated users can manage ingredients" ON ingredients
    FOR ALL USING (auth.role() = 'authenticated');

-- Certifications policies
DROP POLICY IF EXISTS "Anyone can view certifications" ON certifications;
CREATE POLICY "Anyone can view certifications" ON certifications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage certifications" ON certifications;
CREATE POLICY "Authenticated users can manage certifications" ON certifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Supplement certifications policies
DROP POLICY IF EXISTS "Anyone can view supplement certifications" ON supplement_certifications;
CREATE POLICY "Anyone can view supplement certifications" ON supplement_certifications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage supplement certifications" ON supplement_certifications;
CREATE POLICY "Authenticated users can manage supplement certifications" ON supplement_certifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Logbook entries policies
DROP POLICY IF EXISTS "Users can view their own logbook entries" ON logbook_entries;
CREATE POLICY "Users can view their own logbook entries" ON logbook_entries
    FOR SELECT USING (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Users can insert their own logbook entries" ON logbook_entries;
CREATE POLICY "Users can insert their own logbook entries" ON logbook_entries
    FOR INSERT WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Users can update their own logbook entries" ON logbook_entries;
CREATE POLICY "Users can update their own logbook entries" ON logbook_entries
    FOR UPDATE USING (auth.uid() = athlete_id);

-- User preferences policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);