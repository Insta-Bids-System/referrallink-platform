#!/usr/bin/env node

/**
 * Test script for Twilio SMS and SendGrid Email functionality
 * Run: node scripts/test-communication.js
 */

const axios = require('axios');
const readline = require('readline');

// Configuration
const API_URL = process.env.API_URL || 'https://referrallink-platform-production.up.railway.app';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function login() {
  log('\n🔐 Logging in...', 'cyan');
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    const token = response.data.token;
    log('✅ Login successful!', 'green');
    return token;
  } catch (error) {
    log(`❌ Login failed: ${error.response?.data?.error || error.message}`, 'red');
    process.exit(1);
  }
}

async function getReferralLink(token) {
  log('\n📎 Getting referral link...', 'cyan');
  
  try {
    // First, try to get existing links
    const getResponse = await axios.get(`${API_URL}/api/referrals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (getResponse.data.data && getResponse.data.data.length > 0) {
      const link = getResponse.data.data[0];
      log(`✅ Using existing link: ${link.fullUrl}`, 'green');
      return link.id;
    }
    
    // Create a new link if none exist
    const createResponse = await axios.post(
      `${API_URL}/api/referrals`,
      {
        name: 'Test Communication Link',
        customMessage: 'Testing Twilio and SendGrid integration'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const link = createResponse.data.data;
    log(`✅ Created new link: ${link.fullUrl}`, 'green');
    return link.id;
  } catch (error) {
    log(`❌ Failed to get referral link: ${error.response?.data?.error || error.message}`, 'red');
    process.exit(1);
  }
}

async function testSMS(token, referralLinkId) {
  log('\n📱 Testing SMS...', 'yellow');
  
  const phoneNumber = await question('Enter phone number for SMS test (E.164 format, e.g., +1234567890): ');
  
  if (!phoneNumber) {
    log('⏭️  Skipping SMS test', 'yellow');
    return;
  }
  
  try {
    // Test direct SMS
    log('Sending test SMS...', 'cyan');
    const response = await axios.post(
      `${API_URL}/api/communication/test`,
      {
        messageType: 'sms',
        phoneNumber: phoneNumber,
        message: `Test SMS from ReferralLink Platform! Your test is working. 🎉`
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.data.status === 'sent') {
      log(`✅ SMS sent successfully! Message ID: ${response.data.data.messageId}`, 'green');
    } else {
      log(`⚠️  SMS failed: ${response.data.data.error}`, 'yellow');
    }
    
    // Test SMS with referral link
    const linkResponse = await axios.post(
      `${API_URL}/api/communication/send`,
      {
        recipient: {
          name: 'Test User',
          phoneNumber: phoneNumber
        },
        referralLinkId: referralLinkId,
        messageType: 'sms',
        customMessage: 'Check out this amazing opportunity!',
        useAI: false
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (linkResponse.data.data.status === 'sent') {
      log('✅ Referral SMS sent successfully!', 'green');
    } else {
      log(`⚠️  Referral SMS failed: ${linkResponse.data.data.error}`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ SMS test failed: ${error.response?.data?.error || error.message}`, 'red');
    
    // Common error troubleshooting
    if (error.response?.data?.error?.includes('not configured')) {
      log('\n💡 Tip: Add Twilio credentials to Railway:', 'cyan');
      log('  railway variables set TWILIO_ACCOUNT_SID=ACxxxx', 'cyan');
      log('  railway variables set TWILIO_AUTH_TOKEN=xxxx', 'cyan');
      log('  railway variables set TWILIO_PHONE_NUMBER=+1234567890', 'cyan');
    } else if (error.response?.data?.error?.includes('not verified')) {
      log('\n💡 Tip: In Twilio trial mode, add this number to verified numbers in Twilio Console', 'cyan');
    }
  }
}

async function testEmail(token, referralLinkId) {
  log('\n📧 Testing Email...', 'yellow');
  
  const email = await question('Enter email address for test (or press Enter to skip): ');
  
  if (!email) {
    log('⏭️  Skipping email test', 'yellow');
    return;
  }
  
  try {
    // Test direct email
    log('Sending test email...', 'cyan');
    const response = await axios.post(
      `${API_URL}/api/communication/test`,
      {
        messageType: 'email',
        email: email,
        message: `<h2>Test Email from ReferralLink Platform!</h2>
          <p>Your email integration is working perfectly! 🎉</p>
          <p>This email was sent using SendGrid.</p>`
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.data.status === 'sent') {
      log(`✅ Email sent successfully! Message ID: ${response.data.data.messageId}`, 'green');
    } else {
      log(`⚠️  Email failed: ${response.data.data.error}`, 'yellow');
    }
    
    // Test email with referral link
    const linkResponse = await axios.post(
      `${API_URL}/api/communication/send`,
      {
        recipient: {
          name: 'Test User',
          email: email
        },
        referralLinkId: referralLinkId,
        messageType: 'email',
        customMessage: 'I wanted to share this amazing opportunity with you!',
        useAI: false
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (linkResponse.data.data.status === 'sent') {
      log('✅ Referral email sent successfully!', 'green');
    } else {
      log(`⚠️  Referral email failed: ${linkResponse.data.data.error}`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ Email test failed: ${error.response?.data?.error || error.message}`, 'red');
    
    // Common error troubleshooting
    if (error.response?.data?.error?.includes('not configured')) {
      log('\n💡 Tip: Add SendGrid credentials to Railway:', 'cyan');
      log('  railway variables set SENDGRID_API_KEY=SG.xxxx', 'cyan');
      log('  railway variables set EMAIL_FROM=noreply@yourdomain.com', 'cyan');
    } else if (error.response?.data?.error?.includes('not verified')) {
      log('\n💡 Tip: Verify your sender email in SendGrid:', 'cyan');
      log('  1. Go to SendGrid Dashboard > Settings > Sender Authentication', 'cyan');
      log('  2. Add and verify your email address', 'cyan');
    }
  }
}

async function testBulkSend(token, referralLinkId) {
  log('\n📨 Testing Bulk Send...', 'yellow');
  
  const test = await question('Test bulk send? (y/n): ');
  
  if (test.toLowerCase() !== 'y') {
    log('⏭️  Skipping bulk send test', 'yellow');
    return;
  }
  
  const messageType = await question('Message type (sms/email): ');
  const recipients = [];
  
  log('Enter recipients (press Enter with empty line to finish):', 'cyan');
  
  while (true) {
    const name = await question('  Name: ');
    if (!name) break;
    
    const contact = {};
    contact.name = name;
    
    if (messageType === 'sms') {
      contact.phoneNumber = await question('  Phone: ');
    } else {
      contact.email = await question('  Email: ');
    }
    
    recipients.push(contact);
  }
  
  if (recipients.length === 0) {
    log('⏭️  No recipients entered', 'yellow');
    return;
  }
  
  try {
    log(`Sending bulk ${messageType} to ${recipients.length} recipients...`, 'cyan');
    
    const response = await axios.post(
      `${API_URL}/api/communication/bulk`,
      {
        recipients: recipients,
        referralLinkId: referralLinkId,
        messageType: messageType,
        customMessage: 'Check out this opportunity!',
        useAI: false
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const summary = response.data.data.summary;
    log(`\n📊 Bulk Send Results:`, 'bright');
    log(`  ✅ Sent: ${summary.sent}`, 'green');
    log(`  ❌ Failed: ${summary.failed}`, 'red');
    log(`  ⏳ Pending: ${summary.pending}`, 'yellow');
    
    // Show failed recipients
    const failed = response.data.data.results.filter(r => r.status === 'failed');
    if (failed.length > 0) {
      log('\nFailed recipients:', 'red');
      failed.forEach(f => {
        log(`  - ${f.recipientId}: ${f.error}`, 'red');
      });
    }
    
  } catch (error) {
    log(`❌ Bulk send failed: ${error.response?.data?.error || error.message}`, 'red');
  }
}

async function testValidatePhone(token) {
  log('\n☎️  Testing Phone Validation...', 'yellow');
  
  const phoneNumber = await question('Enter phone number to validate (or press Enter to skip): ');
  
  if (!phoneNumber) {
    log('⏭️  Skipping phone validation', 'yellow');
    return;
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/api/communication/validate-phone`,
      { phoneNumber },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.data.isValid) {
      log(`✅ Phone number ${phoneNumber} is valid!`, 'green');
    } else {
      log(`❌ Phone number ${phoneNumber} is invalid`, 'red');
    }
  } catch (error) {
    log(`❌ Validation failed: ${error.response?.data?.error || error.message}`, 'red');
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('  ReferralLink Platform - Communication Test Suite', 'bright');
  log('='.repeat(60), 'bright');
  
  log('\n📋 Prerequisites:', 'cyan');
  log('  1. Twilio account with credentials in Railway', 'white');
  log('  2. SendGrid account with API key in Railway', 'white');
  log('  3. Backend deployed and running', 'white');
  log(`\n🌐 Testing against: ${API_URL}`, 'cyan');
  
  try {
    // Login
    const token = await login();
    
    // Get or create referral link
    const referralLinkId = await getReferralLink(token);
    
    // Run tests
    await testSMS(token, referralLinkId);
    await testEmail(token, referralLinkId);
    await testBulkSend(token, referralLinkId);
    await testValidatePhone(token);
    
    log('\n' + '='.repeat(60), 'bright');
    log('  ✅ All tests completed!', 'green');
    log('='.repeat(60), 'bright');
    
    log('\n📚 Next Steps:', 'cyan');
    log('  1. Check Twilio Console for SMS logs', 'white');
    log('  2. Check SendGrid Dashboard for email activity', 'white');
    log('  3. Test from mobile app BulkShareScreen', 'white');
    log('  4. Set up webhooks for delivery status', 'white');
    
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Run the test suite
main().catch(console.error);