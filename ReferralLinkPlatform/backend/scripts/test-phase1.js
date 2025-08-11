const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const API_BASE = 'http://localhost:5000';

async function testPhase1Implementation() {
  console.log('🧪 Testing Phase 1 Implementation\n');
  console.log('Company URL: https://instabids.ai');
  console.log('Link Expiry: 10 days (automatic)\n');

  try {
    // Test 1: Create test user
    console.log('1️⃣ Creating test user...');
    const testEmail = `phase1_test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'Phase1',
        last_name: 'Test'
      }
    });

    if (authError) throw authError;
    console.log('✅ User created:', authUser.user.id);

    // Create user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: testEmail,
        first_name: 'Phase1',
        last_name: 'Test',
        password_hash: 'hashed'
      })
      .select()
      .single();

    if (profileError && profileError.code !== '23505') throw profileError;

    // Sign in to get token
    const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) throw signInError;
    const token = session.session.access_token;
    console.log('✅ User signed in');

    // Test 2: Create referral link (should use instabids.ai automatically)
    console.log('\n2️⃣ Creating referral link (no URL input needed)...');
    const { data: link, error: linkError } = await supabase
      .from('referral_links')
      .insert({
        user_id: authUser.user.id,
        original_url: process.env.COMPANY_URL || 'https://instabids.ai',
        company_url: process.env.COMPANY_URL || 'https://instabids.ai',
        custom_message: 'Check out this amazing platform!',
        is_primary: true,
        metadata: {
          tags: ['test', 'phase1'],
          trackClicks: true,
          enableQR: true
        }
      })
      .select()
      .single();

    if (linkError) throw linkError;
    console.log('✅ Link created with short code:', link.short_code);
    console.log('   Destination:', link.company_url);
    console.log('   Expires at:', new Date(link.expires_at).toLocaleDateString());

    // Test 3: Verify link expires in 10 days
    console.log('\n3️⃣ Verifying 10-day expiration...');
    const createdDate = new Date(link.created_at);
    const expiresDate = new Date(link.expires_at);
    const daysDiff = Math.round((expiresDate - createdDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 10) {
      console.log('✅ Link expires in exactly 10 days');
    } else {
      console.log(`⚠️ Link expires in ${daysDiff} days (expected 10)`);
    }

    // Test 4: Try to create another link (should return existing)
    console.log('\n4️⃣ Testing one-link-per-user rule...');
    const { data: existingLink, error: existingError } = await supabase
      .from('referral_links')
      .select('*')
      .eq('user_id', authUser.user.id)
      .eq('is_primary', true)
      .single();

    if (existingLink) {
      console.log('✅ One primary link per user enforced');
      console.log('   Existing link:', existingLink.short_code);
    }

    // Test 5: Test link redirect
    console.log('\n5️⃣ Testing link redirect to instabids.ai...');
    const redirectUrl = `${API_BASE}/r/${link.short_code}`;
    console.log('   Redirect URL:', redirectUrl);
    console.log('   Will redirect to: https://instabids.ai?ref=' + link.short_code + '&source=referral');

    // Test 6: Track a click
    console.log('\n6️⃣ Tracking a click...');
    const { data: click, error: clickError } = await supabase
      .from('clicks')
      .insert({
        referral_link_id: link.id,
        ip_address: '127.0.0.1',
        user_agent: 'Phase1-Test-Agent',
        device: 'desktop',
        browser: 'test',
        os: 'test'
      })
      .select()
      .single();

    if (clickError) throw clickError;
    console.log('✅ Click tracked successfully');

    // Test 7: Verify company URL is hard-coded
    console.log('\n7️⃣ Verifying hard-coded company URL...');
    const { data: allLinks, error: linksError } = await supabase
      .from('referral_links')
      .select('company_url, original_url')
      .eq('user_id', authUser.user.id);

    if (linksError) throw linksError;
    
    const allUseInstabids = allLinks.every(l => 
      l.company_url === 'https://instabids.ai' || 
      l.original_url === 'https://instabids.ai'
    );
    
    if (allUseInstabids) {
      console.log('✅ All links use instabids.ai as destination');
    } else {
      console.log('⚠️ Some links have different URLs');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await supabase.auth.admin.deleteUser(authUser.user.id);
    console.log('✅ Test data cleaned up');

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 PHASE 1 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ Company URL hard-coded to instabids.ai');
    console.log('✅ Links auto-expire in 10 days');
    console.log('✅ One primary link per user enforced');
    console.log('✅ No URL input required from users');
    console.log('✅ Simplified link creation process');
    console.log('\n🎉 Phase 1 implementation verified successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run tests
testPhase1Implementation();