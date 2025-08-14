require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fixed UUID for test user - must match what's in auth.routes.ts
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

async function createTestUser() {
  try {
    console.log('Checking if test user exists...');
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', TEST_USER_ID)
      .single();
    
    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      return;
    }
    
    console.log('Creating test user...');
    
    // Hash the password
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Create the test user
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: TEST_USER_ID,
        email: 'test@example.com',
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        is_verified: true,
        role: 'user',
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          defaultMessageChannel: 'email',
          language: 'en',
          timezone: 'UTC'
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating test user:', error);
      return;
    }
    
    console.log('✅ Test user created successfully!');
    console.log('User ID:', data.id);
    console.log('Email:', data.email);
    console.log('');
    console.log('You can now login with:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createTestUser().then(() => {
  console.log('\nScript completed');
  process.exit(0);
});