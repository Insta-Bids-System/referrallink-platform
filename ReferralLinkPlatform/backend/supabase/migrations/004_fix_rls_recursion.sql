-- Fix RLS recursion issue
-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Service role full access to users" ON users;
DROP POLICY IF EXISTS "Service role full access to referral links" ON referral_links;
DROP POLICY IF EXISTS "Service role full access to clicks" ON clicks;
DROP POLICY IF EXISTS "Service role full access to conversions" ON conversions;

-- Recreate service role policies without recursion
-- Service role bypasses RLS entirely, so we use a simpler check
CREATE POLICY "Service role bypass for users" ON users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass for referral_links" ON referral_links
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass for clicks" ON clicks
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role bypass for conversions" ON conversions
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Also ensure the anon role can insert into referral_links when needed
CREATE POLICY "Anon can read active links" ON referral_links
    FOR SELECT
    TO anon
    USING (is_active = true);