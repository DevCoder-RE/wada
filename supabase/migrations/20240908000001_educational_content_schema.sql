-- Educational Content Schema Migration
-- Adds tables for educational content management and affiliate tracking

-- Create content types enum
CREATE TYPE content_type AS ENUM ('article', 'video', 'infographic', 'course', 'webinar');
CREATE TYPE content_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE affiliate_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- Educational content table
CREATE TABLE educational_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    content_type content_type NOT NULL,
    content TEXT, -- For articles, or JSON for structured content
    media_url TEXT, -- For videos, images, etc.
    thumbnail_url TEXT,
    author_id UUID REFERENCES auth.users(id),
    status content_status DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[], -- Array of tags for categorization
    category TEXT NOT NULL,
    reading_time_minutes INTEGER,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content categories table
CREATE TABLE content_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES content_categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate links table
CREATE TABLE affiliate_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    affiliate_code TEXT,
    commission_rate DECIMAL(5,2),
    status affiliate_status DEFAULT 'pending',
    partner_name TEXT NOT NULL,
    partner_website TEXT,
    disclosure_text TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content-affiliate relationships
CREATE TABLE content_affiliate_links (
    content_id UUID REFERENCES educational_content(id) ON DELETE CASCADE,
    affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
    placement_context TEXT, -- e.g., 'sidebar', 'inline', 'end-of-article'
    is_active BOOLEAN DEFAULT TRUE,
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (content_id, affiliate_link_id)
);

-- User content engagement table
CREATE TABLE user_content_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES educational_content(id) ON DELETE CASCADE,
    engagement_type TEXT CHECK (engagement_type IN ('view', 'like', 'bookmark', 'share', 'complete')),
    progress_percentage DECIMAL(5,2) DEFAULT 0, -- For courses/videos
    time_spent_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id, engagement_type)
);

-- Content analytics table
CREATE TABLE content_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES educational_content(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    avg_time_spent_seconds INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_id, date)
);

-- Affiliate click tracking table
CREATE TABLE affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_id UUID REFERENCES educational_content(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate conversions table
CREATE TABLE affiliate_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
    click_id UUID REFERENCES affiliate_clicks(id),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_id TEXT,
    commission_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_educational_content_slug ON educational_content(slug);
CREATE INDEX idx_educational_content_status ON educational_content(status);
CREATE INDEX idx_educational_content_category ON educational_content(category);
CREATE INDEX idx_educational_content_published_at ON educational_content(published_at);
CREATE INDEX idx_educational_content_author_id ON educational_content(author_id);
CREATE INDEX idx_content_categories_parent_id ON content_categories(parent_id);
CREATE INDEX idx_affiliate_links_status ON affiliate_links(status);
CREATE INDEX idx_affiliate_links_partner_name ON affiliate_links(partner_name);
CREATE INDEX idx_user_content_engagement_user_id ON user_content_engagement(user_id);
CREATE INDEX idx_user_content_engagement_content_id ON user_content_engagement(content_id);
CREATE INDEX idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX idx_content_analytics_date ON content_analytics(date);
CREATE INDEX idx_affiliate_clicks_affiliate_link_id ON affiliate_clicks(affiliate_link_id);
CREATE INDEX idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);
CREATE INDEX idx_affiliate_conversions_affiliate_link_id ON affiliate_conversions(affiliate_link_id);
CREATE INDEX idx_affiliate_conversions_converted_at ON affiliate_conversions(converted_at);

-- Add updated_at triggers
CREATE TRIGGER update_educational_content_updated_at BEFORE UPDATE ON educational_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON affiliate_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for updating content view counts
CREATE OR REPLACE FUNCTION increment_content_views(content_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE educational_content
    SET view_count = view_count + 1
    WHERE id = content_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create function for tracking affiliate clicks
CREATE OR REPLACE FUNCTION track_affiliate_click(
    affiliate_uuid UUID,
    user_uuid UUID DEFAULT NULL,
    content_uuid UUID DEFAULT NULL,
    session_text TEXT DEFAULT NULL,
    ip INET DEFAULT NULL,
    agent TEXT DEFAULT NULL,
    referrer TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    click_id UUID;
BEGIN
    INSERT INTO affiliate_clicks (
        affiliate_link_id, user_id, content_id, session_id,
        ip_address, user_agent, referrer_url
    ) VALUES (
        affiliate_uuid, user_uuid, content_uuid, session_text,
        ip, agent, referrer
    ) RETURNING id INTO click_id;

    -- Increment click count on affiliate link
    UPDATE affiliate_links
    SET click_count = click_count + 1
    WHERE id = affiliate_uuid;

    RETURN click_id;
END;
$$ LANGUAGE plpgsql;