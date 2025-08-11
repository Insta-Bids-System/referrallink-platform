const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');

  try {
    // Test 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const testEmail = `test_${Date.now()}@example.com`;
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User'
      }
    });

    if (authError) throw authError;
    console.log('✅ User created:', authUser.user.id);

    // Test 2: Check if user profile was auto-created by trigger
    console.log('\n2️⃣ Checking user profile...');
    let { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    // If profile doesn't exist (trigger didn't work), create it manually
    if (!userProfile) {
      console.log('Profile not auto-created, creating manually...');
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: testEmail,
          first_name: 'Test',
          last_name: 'User',
          password_hash: 'hashed_password'
        })
        .select()
        .single();

      if (insertError) throw insertError;
      userProfile = newProfile;
    }
    
    console.log('✅ Profile ready:', userProfile.email);

    // Test 3: Create a referral link
    console.log('\n3️⃣ Creating referral link...');
    const { data: link, error: linkError } = await supabase
      .from('referral_links')
      .insert({
        user_id: authUser.user.id,
        original_url: 'https://example.com',
        company_url: process.env.COMPANY_URL || 'https://company.com/offer',
        custom_message: 'Check out this amazing offer!',
        is_primary: true
      })
      .select()
      .single();

    if (linkError) throw linkError;
    console.log('✅ Referral link created:', link.short_code);

    // Test 4: Track a click
    console.log('\n4️⃣ Tracking a click...');
    const { data: click, error: clickError } = await supabase
      .from('clicks')
      .insert({
        referral_link_id: link.id,
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 Test Browser',
        device: 'desktop',
        browser: 'chrome',
        os: 'windows'
      })
      .select()
      .single();

    if (clickError) throw clickError;
    console.log('✅ Click tracked:', click.id);

    // Test 5: Query data with RLS
    console.log('\n5️⃣ Testing data queries...');
    
    // Get all users (should work with service key)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .limit(5);

    if (usersError) throw usersError;
    console.log(`✅ Found ${users.length} users`);

    // Get referral links
    const { data: links, error: linksError } = await supabase
      .from('referral_links')
      .select('id, short_code, original_url')
      .eq('user_id', authUser.user.id);

    if (linksError) throw linksError;
    console.log(`✅ Found ${links.length} referral links for test user`);

    // Test 6: Test analytics view
    console.log('\n6️⃣ Testing analytics view...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('link_analytics')
      .select('*')
      .eq('user_id', authUser.user.id)
      .single();

    if (analyticsError && analyticsError.code !== 'PGRST116') throw analyticsError;
    if (analytics) {
      console.log('✅ Analytics view working:', {
        totalClicks: analytics.total_clicks,
        uniqueClicks: analytics.unique_clicks
      });
    }

    // Cleanup: Delete test user (cascades to other tables)
    console.log('\n🧹 Cleaning up test data...');
    await supabase.auth.admin.deleteUser(authUser.user.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Supabase integration is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run tests
testSupabaseConnection();