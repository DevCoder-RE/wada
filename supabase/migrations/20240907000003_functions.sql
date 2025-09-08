-- Database functions for WADA BMAD

-- Function to verify supplement by barcode
CREATE OR REPLACE FUNCTION verify_supplement_by_barcode(
    barcode_input TEXT
) RETURNS TABLE (
    supplement_id UUID,
    name TEXT,
    brand TEXT,
    certifications JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.brand,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'issuer', c.issuer,
                    'type', c.type,
                    'valid_until', c.valid_until
                )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'::jsonb
        ) as certifications
    FROM supplements s
    LEFT JOIN supplement_certifications sc ON s.id = sc.supplement_id
    LEFT JOIN certifications c ON sc.certification_id = c.id
    WHERE s.barcode = barcode_input
    GROUP BY s.id, s.name, s.brand;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get athlete compliance summary
CREATE OR REPLACE FUNCTION get_athlete_compliance_summary(
    athlete_uuid UUID,
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    total_entries BIGINT,
    verified_entries BIGINT,
    compliance_rate DECIMAL(5,2),
    unique_supplements BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT
            COUNT(*) as total_count,
            COUNT(*) FILTER (WHERE verified = true) as verified_count,
            COUNT(DISTINCT supplement_id) as unique_count
        FROM logbook_entries
        WHERE athlete_id = athlete_uuid
        AND DATE(timestamp) BETWEEN start_date AND end_date
    )
    SELECT
        stats.total_count,
        stats.verified_count,
        CASE
            WHEN stats.total_count > 0
            THEN ROUND((stats.verified_count::DECIMAL / stats.total_count::DECIMAL) * 100, 2)
            ELSE 0
        END as compliance_rate,
        stats.unique_count
    FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create athlete profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO athlete_profiles (user_id, name, email, sport)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'sport', 'Unknown')
    );

    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update athlete profile on user update
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.email != NEW.email THEN
        UPDATE athlete_profiles
        SET email = NEW.email
        WHERE user_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_user_update();