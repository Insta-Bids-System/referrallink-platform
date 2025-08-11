-- Drop all existing policies to fix recursion
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Service role bypass for users" ON users;

DROP POLICY IF EXISTS "Users can view own referral links" ON referral_links;
DROP POLICY IF EXISTS "Users can create own referral links" ON referral_links;
DROP POLICY IF EXISTS "Users can update own referral links" ON referral_links;
DROP POLICY IF EXISTS "Users can delete own referral links" ON referral_links;
DROP POLICY IF EXISTS "Public can view active links by short code" ON referral_links;
DROP POLICY IF EXISTS "Admins can view all referral links" ON referral_links;
DROP POLICY IF EXISTS "Service role bypass for referral_links" ON referral_links;
DROP POLICY IF EXISTS "Anon can read active links" ON referral_links;

-- Recreate simplified policies without recursion

-- Users table policies
CREATE POLICY "users_select_own" ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_signup" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Service role has full access (bypasses RLS)
ALTER TABLE users FORCE ROW LEVEL SECURITY;
GRANT ALL ON users TO service_role;

-- Referral links policies
CREATE POLICY "referral_links_select_own" ON referral_links
    FOR SELECT
    USING (user_id = auth.uid() OR is_active = true);

CREATE POLICY "referral_links_insert_own" ON referral_links
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "referral_links_update_own" ON referral_links
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "referral_links_delete_own" ON referral_links
    FOR DELETE
    USING (user_id = auth.uid());

-- Service role has full access
ALTER TABLE referral_links FORCE ROW LEVEL SECURITY;
GRANT ALL ON referral_links TO service_role;

-- Clicks table - simplified
DROP POLICY IF EXISTS "Users can view clicks for own links" ON clicks;
DROP POLICY IF EXISTS "Public can insert clicks" ON clicks;
DROP POLICY IF EXISTS "Admins can view all clicks" ON clicks;
DROP POLICY IF EXISTS "Service role bypass for clicks" ON clicks;

CREATE POLICY "clicks_insert_public" ON clicks
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "clicks_select_link_owner" ON clicks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM referral_links 
            WHERE referral_links.id = clicks.referral_link_id 
            AND referral_links.user_id = auth.uid()
        )
    );

ALTER TABLE clicks FORCE ROW LEVEL SECURITY;
GRANT ALL ON clicks TO service_role;

-- Conversions table - simplified
DROP POLICY IF EXISTS "Users can view conversions for own links" ON conversions;
DROP POLICY IF EXISTS "Public can insert conversions" ON conversions;
DROP POLICY IF EXISTS "Admins can view all conversions" ON conversions;
DROP POLICY IF EXISTS "Service role bypass for conversions" ON conversions;

CREATE POLICY "conversions_insert_public" ON conversions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "conversions_select_link_owner" ON conversions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM referral_links 
            WHERE referral_links.id = conversions.referral_link_id 
            AND referral_links.user_id = auth.uid()
        )
    );

ALTER TABLE conversions FORCE ROW LEVEL SECURITY;
GRANT ALL ON conversions TO service_role;