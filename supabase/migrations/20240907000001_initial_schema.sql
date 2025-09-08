-- Initial database schema for WADA BMAD project
-- Run this migration to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('athlete', 'coach', 'admin');
CREATE TYPE certification_type AS ENUM ('NSF', 'Informed_Sport', 'ISO_17025', 'WADA_Compliant');

-- Athlete profiles table
CREATE TABLE athlete_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    date_of_birth DATE,
    sport TEXT NOT NULL,
    team TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplements table
CREATE TABLE supplements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT,
    barcode TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certifications table
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    type certification_type NOT NULL,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplement certifications junction table
CREATE TABLE supplement_certifications (
    supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
    certification_id UUID REFERENCES certifications(id) ON DELETE CASCADE,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (supplement_id, certification_id)
);

-- Logbook entries table
CREATE TABLE logbook_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES athlete_profiles(id) ON DELETE CASCADE,
    supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_athlete_profiles_user_id ON athlete_profiles(user_id);
CREATE INDEX idx_supplements_barcode ON supplements(barcode);
CREATE INDEX idx_ingredients_supplement_id ON ingredients(supplement_id);
CREATE INDEX idx_logbook_entries_athlete_id ON logbook_entries(athlete_id);
CREATE INDEX idx_logbook_entries_timestamp ON logbook_entries(timestamp);
CREATE INDEX idx_logbook_entries_supplement_id ON logbook_entries(supplement_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_athlete_profiles_updated_at BEFORE UPDATE ON athlete_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplements_updated_at BEFORE UPDATE ON supplements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_logbook_entries_updated_at BEFORE UPDATE ON logbook_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();