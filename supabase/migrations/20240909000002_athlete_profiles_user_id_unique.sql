-- Enforce a single athlete profile per user.
-- Required so the client can upsert profiles (onConflict: 'user_id')
-- to create a profile for a user whose row is missing.
ALTER TABLE athlete_profiles
    ADD CONSTRAINT athlete_profiles_user_id_key UNIQUE (user_id);