-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('user', 'premium', 'admin', 'super_admin');
CREATE TYPE conversion_type AS ENUM ('signup', 'purchase', 'subscription', 'custom');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    profile_picture TEXT,
    profile JSONB DEFAULT '{}',
    writing_style JSONB,
    auth_providers JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{
        "notifications": {
            "email": true,
            "push": true,
            "sms": false
        },
        "defaultMessageChannel": "email",
        "language": "en",
        "timezone": "UTC"
    }',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    role user_role DEFAULT 'user',
    refresh_token TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create referral_links table
CREATE TABLE IF NOT EXISTS referral_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    custom_message TEXT,
    metadata JSONB DEFAULT '{}',
    statistics JSONB DEFAULT '{
        "totalClicks": 0,
        "uniqueClicks": 0,
        "conversions": 0,
        "conversionRate": 0,
        "clicksByCountry": {},
        "clicksByDevice": {
            "mobile": 0,
            "desktop": 0,
            "tablet": 0,
            "other": 0
        },
        "clicksByChannel": {}
    }',
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 days'),
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT true,
    qr_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clicks table
CREATE TABLE IF NOT EXISTS clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_link_id UUID NOT NULL REFERENCES referral_links(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    referer TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    device VARCHAR(50) DEFAULT 'unknown',
    browser VARCHAR(50) DEFAULT 'unknown',
    os VARCHAR(50) DEFAULT 'unknown',
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Create conversions table
CREATE TABLE IF NOT EXISTS conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_link_id UUID NOT NULL REFERENCES referral_links(id) ON DELETE CASCADE,
    click_id UUID NOT NULL REFERENCES clicks(id) ON DELETE CASCADE,
    converted_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    conversion_type conversion_type DEFAULT 'signup',
    conversion_value DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    metadata JSONB,
    converted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_referral_links_user_id ON referral_links(user_id);
CREATE INDEX idx_referral_links_short_code ON referral_links(short_code);
CREATE INDEX idx_referral_links_is_active ON referral_links(is_active);
CREATE INDEX idx_referral_links_expires_at ON referral_links(expires_at);
CREATE INDEX idx_referral_links_created_at ON referral_links(created_at);

CREATE INDEX idx_clicks_referral_link_id ON clicks(referral_link_id);
CREATE INDEX idx_clicks_ip_address ON clicks(ip_address);
CREATE INDEX idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX idx_clicks_country ON clicks(country);
CREATE INDEX idx_clicks_device ON clicks(device);

CREATE INDEX idx_conversions_referral_link_id ON conversions(referral_link_id);
CREATE INDEX idx_conversions_click_id ON conversions(click_id);
CREATE INDEX idx_conversions_converted_user_id ON conversions(converted_user_id);
CREATE INDEX idx_conversions_conversion_type ON conversions(conversion_type);
CREATE INDEX idx_conversions_converted_at ON conversions(converted_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_links_updated_at BEFORE UPDATE ON referral_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique short codes
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure unique short code
CREATE OR REPLACE FUNCTION ensure_unique_short_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    IF NEW.short_code IS NULL THEN
        LOOP
            new_code := generate_short_code();
            SELECT EXISTS(SELECT 1 FROM referral_links WHERE short_code = new_code) INTO code_exists;
            EXIT WHEN NOT code_exists;
        END LOOP;
        NEW.short_code := new_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for automatic short code generation
CREATE TRIGGER generate_short_code_trigger
    BEFORE INSERT ON referral_links
    FOR EACH ROW
    EXECUTE FUNCTION ensure_unique_short_code();

-- Create view for link analytics
CREATE OR REPLACE VIEW link_analytics AS
SELECT 
    rl.id,
    rl.user_id,
    rl.short_code,
    rl.original_url,
    rl.expires_at,
    rl.is_active,
    COUNT(DISTINCT c.id) as total_clicks,
    COUNT(DISTINCT c.ip_address) as unique_clicks,
    COUNT(DISTINCT conv.id) as conversions,
    CASE 
        WHEN COUNT(DISTINCT c.id) > 0 
        THEN (COUNT(DISTINCT conv.id)::FLOAT / COUNT(DISTINCT c.id) * 100)
        ELSE 0 
    END as conversion_rate,
    MAX(c.clicked_at) as last_clicked_at,
    rl.created_at,
    rl.updated_at
FROM referral_links rl
LEFT JOIN clicks c ON rl.id = c.referral_link_id
LEFT JOIN conversions conv ON rl.id = conv.referral_link_id
GROUP BY rl.id, rl.user_id, rl.short_code, rl.original_url, rl.expires_at, 
         rl.is_active, rl.created_at, rl.updated_at;

-- Add company URL as default (to be updated with actual URL)
ALTER TABLE referral_links 
ADD COLUMN company_url VARCHAR(255) DEFAULT 'https://company.com/offer';

-- Add constraint to ensure one primary link per user
CREATE UNIQUE INDEX idx_one_primary_link_per_user 
ON referral_links(user_id) 
WHERE is_primary = true;

-- Grant permissions for authenticated users (will be used by Supabase Auth)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;