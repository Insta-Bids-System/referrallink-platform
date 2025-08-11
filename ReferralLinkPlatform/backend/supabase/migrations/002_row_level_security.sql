-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role full access to users" ON users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Referral Links table policies
-- Users can view their own referral links
CREATE POLICY "Users can view own referral links" ON referral_links
    FOR SELECT USING (user_id = auth.uid());

-- Users can create their own referral links
CREATE POLICY "Users can create own referral links" ON referral_links
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own referral links
CREATE POLICY "Users can update own referral links" ON referral_links
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own referral links
CREATE POLICY "Users can delete own referral links" ON referral_links
    FOR DELETE USING (user_id = auth.uid());

-- Public can view active referral links by short code (for redirect)
CREATE POLICY "Public can view active links by short code" ON referral_links
    FOR SELECT USING (is_active = true);

-- Admins can view all referral links
CREATE POLICY "Admins can view all referral links" ON referral_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Service role full access
CREATE POLICY "Service role full access to referral links" ON referral_links
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Clicks table policies
-- Users can view clicks for their own referral links
CREATE POLICY "Users can view clicks for own links" ON clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM referral_links 
            WHERE referral_links.id = clicks.referral_link_id 
            AND referral_links.user_id = auth.uid()
        )
    );

-- Public can insert clicks (for tracking)
CREATE POLICY "Public can insert clicks" ON clicks
    FOR INSERT WITH CHECK (true);

-- Admins can view all clicks
CREATE POLICY "Admins can view all clicks" ON clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Service role full access
CREATE POLICY "Service role full access to clicks" ON clicks
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Conversions table policies
-- Users can view conversions for their own referral links
CREATE POLICY "Users can view conversions for own links" ON conversions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM referral_links 
            WHERE referral_links.id = conversions.referral_link_id 
            AND referral_links.user_id = auth.uid()
        )
    );

-- Public can insert conversions (for tracking)
CREATE POLICY "Public can insert conversions" ON conversions
    FOR INSERT WITH CHECK (true);

-- Admins can view all conversions
CREATE POLICY "Admins can view all conversions" ON conversions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Service role full access
CREATE POLICY "Service role full access to conversions" ON conversions
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function for user registration (bypasses RLS for initial user creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user owns a referral link
CREATE OR REPLACE FUNCTION user_owns_link(link_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM referral_links 
        WHERE id = link_id 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value
    FROM users
    WHERE id = user_id;
    
    RETURN user_role_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;