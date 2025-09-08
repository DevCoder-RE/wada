-- Row Level Security (RLS) policies for WADA BMAD
-- Enable RLS on all tables

-- Enable RLS
ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Athlete profiles policies
CREATE POLICY "Users can view their own profile" ON athlete_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON athlete_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON athlete_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Coaches and admins can view all profiles
CREATE POLICY "Coaches and admins can view all profiles" ON athlete_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('coach', 'admin')
        )
    );

-- Supplements policies (public read, authenticated write)
CREATE POLICY "Anyone can view supplements" ON supplements
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create supplements" ON supplements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update supplements" ON supplements
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Ingredients policies
CREATE POLICY "Anyone can view ingredients" ON ingredients
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage ingredients" ON ingredients
    FOR ALL USING (auth.role() = 'authenticated');

-- Certifications policies
CREATE POLICY "Anyone can view certifications" ON certifications
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage certifications" ON certifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Supplement certifications policies
CREATE POLICY "Anyone can view supplement certifications" ON supplement_certifications
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage supplement certifications" ON supplement_certifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Logbook entries policies
CREATE POLICY "Users can view their own logbook entries" ON logbook_entries
    FOR SELECT USING (
        auth.uid() = athlete_id OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('coach', 'admin')
        )
    );

CREATE POLICY "Users can insert their own logbook entries" ON logbook_entries
    FOR INSERT WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Users can update their own logbook entries" ON logbook_entries
    FOR UPDATE USING (auth.uid() = athlete_id);

-- Coaches can verify logbook entries
CREATE POLICY "Coaches can verify logbook entries" ON logbook_entries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('coach', 'admin')
        )
    );

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);