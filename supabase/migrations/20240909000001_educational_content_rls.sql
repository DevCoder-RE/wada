-- Row Level Security for educational content and affiliate tracking tables.
-- These tables were created without RLS, leaving their data freely readable
-- and writable by any anon client. Enable RLS (deny by default) and grant
-- back only the access the application legitimately requires.

ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- educational_content: published content is public; authors (and coaches/admins)
-- can read and manage their own content.
CREATE POLICY "Anyone can view published content" ON educational_content
    FOR SELECT USING (status = 'published' AND published_at IS NOT NULL);

CREATE POLICY "Authors can view their content" ON educational_content
    FOR SELECT USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('coach', 'admin')
        )
    );

CREATE POLICY "Authors can insert content" ON educational_content
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their content" ON educational_content
    FOR UPDATE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('coach', 'admin')
        )
    );

CREATE POLICY "Authors can delete their content" ON educational_content
    FOR DELETE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' IN ('coach', 'admin')
        )
    );

-- content_categories: active categories are public; writes are admin-only.
CREATE POLICY "Anyone can view active categories" ON content_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON content_categories
    FOR ALL USING (EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
    ));

-- affiliate_links: active links are public for outbound clicks; creators and
-- admins manage their own links.
CREATE POLICY "Anyone can view active affiliate links" ON affiliate_links
    FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can view their affiliate links" ON affiliate_links
    FOR SELECT USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Creators can create affiliate links" ON affiliate_links
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their affiliate links" ON affiliate_links
    FOR UPDATE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Creators can delete their affiliate links" ON affiliate_links
    FOR DELETE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- content_affiliate_links: active placements are public.
CREATE POLICY "Anyone can view active placements" ON content_affiliate_links
    FOR SELECT USING (is_active = true);

-- user_content_engagement: users manage only their own engagement records.
CREATE POLICY "Users can view their own engagement" ON user_content_engagement
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own engagement" ON user_content_engagement
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own engagement" ON user_content_engagement
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own engagement" ON user_content_engagement
    FOR DELETE USING (auth.uid() = user_id);

-- content_analytics: readable by the content author and admins; no client writes.
CREATE POLICY "Authors can view analytics for their content" ON content_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM educational_content
            WHERE educational_content.id = content_analytics.content_id
            AND educational_content.author_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- affiliate_clicks: tracked via the SECURITY DEFINER RPC below; reads restricted
-- to the affiliate link creator and admins.
CREATE POLICY "Creators can view clicks on their links" ON affiliate_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM affiliate_links
            WHERE affiliate_links.id = affiliate_clicks.affiliate_link_id
            AND affiliate_links.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- affiliate_conversions: creators can view and record conversions for their
-- own links; admins can view and record conversions for any link.
CREATE POLICY "Creators can view conversions on their links" ON affiliate_conversions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM affiliate_links
            WHERE affiliate_links.id = affiliate_conversions.affiliate_link_id
            AND affiliate_links.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Creators can record conversions" ON affiliate_conversions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM affiliate_links
            WHERE affiliate_links.id = affiliate_conversions.affiliate_link_id
            AND affiliate_links.created_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- These RPCs write rows that RLS now protects. Run them as the table owner
-- (as the other helper functions in this project already do) so the sanctioned
-- RPC entry points keep working instead of every anon client writing directly.
ALTER FUNCTION increment_content_views(UUID) SECURITY DEFINER;
ALTER FUNCTION track_affiliate_click(UUID, UUID, UUID, TEXT, INET, TEXT, TEXT) SECURITY DEFINER;