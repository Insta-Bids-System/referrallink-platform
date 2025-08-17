# Twilio & SendGrid Setup Guide for ReferralLink Platform

## Overview
This guide will help you set up Twilio for SMS/WhatsApp and SendGrid for email messaging in the ReferralLink platform. The backend code is already implemented and ready - you just need to add your API credentials.

## 1. Twilio Setup (SMS & WhatsApp)

### Create Twilio Account
1. Go to [Twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free trial account (includes $15 credit)
3. Verify your email and phone number
4. Complete the onboarding questions

### Get Your Credentials
1. Go to [Twilio Console](https://console.twilio.com)
2. From the dashboard, copy:
   - **Account SID**: `AC...` (starts with AC)
   - **Auth Token**: Click to reveal and copy
3. Save these securely - you'll need them for Railway

### Get a Phone Number
1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose a number with SMS capabilities
3. For free trial: You get one free number
4. Copy your phone number in E.164 format: `+1234567890`

### WhatsApp Setup (Optional)
1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Join the sandbox by sending a WhatsApp message to the provided number
3. Note the WhatsApp sandbox number (format: `+14155238886`)
4. For production: Apply for WhatsApp Business API

### Test Phone Numbers (Free Trial)
- Free trial only sends to verified numbers
- Add test numbers: **Phone Numbers** → **Verified Caller IDs**
- Click **Add a new Caller ID** and verify each test number

## 2. SendGrid Setup (Email)

### Create SendGrid Account
1. Go to [SendGrid](https://signup.sendgrid.com/)
2. Sign up for free account (100 emails/day forever free)
3. Complete email verification
4. Fill out account details

### Get API Key
1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: `ReferralLink-Production`
5. Select **Full Access** for permissions
6. Copy the API key (starts with `SG.`) - YOU WON'T SEE IT AGAIN!

### Verify Sender Identity
1. Go to **Settings** → **Sender Authentication**
2. Choose one:
   - **Single Sender Verification** (quick, for testing)
     - Add your email address
     - Verify via email link
   - **Domain Authentication** (recommended for production)
     - Add your domain
     - Add DNS records to your domain provider
     - Wait for verification (usually 24-48 hours)

### Important: Your verified email will be the "from" address

## 3. Add Credentials to Railway

### Login to Railway
```bash
railway login
```

### Link to your project
```bash
cd ReferralLinkPlatform/backend
railway link
```

### Add Environment Variables
```bash
# Twilio
railway variables set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set TWILIO_PHONE_NUMBER=+1234567890

# SendGrid
railway variables set SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set EMAIL_FROM=noreply@yourdomain.com

# Optional: WhatsApp
railway variables set WHATSAPP_PHONE_NUMBER=+14155238886
```

### Deploy Changes
```bash
railway up
```

Or push to GitHub (auto-deploys):
```bash
git add .
git commit -m "Add Twilio and SendGrid credentials"
git push origin clean-master
```

## 4. Test Your Setup

### Test SMS
```bash
curl -X POST https://referrallink-platform-production.up.railway.app/api/communication/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageType": "sms",
    "phoneNumber": "+1234567890",
    "message": "Test SMS from ReferralLink!"
  }'
```

### Test Email
```bash
curl -X POST https://referrallink-platform-production.up.railway.app/api/communication/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageType": "email",
    "email": "test@example.com",
    "message": "Test email from ReferralLink!"
  }'
```

### Get JWT Token for Testing
```bash
curl -X POST https://referrallink-platform-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 5. Test from Mobile App

1. Open the mobile app
2. Go to **Bulk Share** screen
3. Select contacts
4. Choose SMS or Email
5. Send test messages

## 6. Monitor Usage

### Twilio
- Dashboard: https://console.twilio.com
- Monitor: **Monitor** → **Logs** → **Messages**
- Usage: **Monitor** → **Usage** → **This Month**

### SendGrid
- Dashboard: https://app.sendgrid.com
- Activity: **Activity** tab
- Stats: **Stats** → **Overview**

## 7. Production Checklist

### Twilio
- [ ] Upgrade from trial account (add payment method)
- [ ] Remove test number restrictions
- [ ] Apply for A2P 10DLC registration (US numbers)
- [ ] Set up WhatsApp Business API (if needed)
- [ ] Configure webhook for delivery receipts

### SendGrid
- [ ] Complete domain authentication
- [ ] Set up dedicated IP (optional, for high volume)
- [ ] Configure webhook for email events
- [ ] Set up email templates in SendGrid
- [ ] Enable click tracking and open tracking

## 8. Cost Estimates

### Twilio Pricing (2025)
- SMS (US): ~$0.0079 per message
- SMS (International): Varies by country
- Phone Number: $1.15/month (US)
- WhatsApp: ~$0.005 per message

### SendGrid Pricing (2025)
- Free: 100 emails/day forever
- Essentials: $19.95/month for 50k emails
- Pro: Custom pricing for higher volumes

## 9. Troubleshooting

### Common Twilio Issues
- **Error: Invalid phone number**: Use E.164 format (+1234567890)
- **Error: Unverified number**: Add to verified numbers in trial
- **Error: Account suspended**: Check billing or compliance issues

### Common SendGrid Issues
- **Error: Sender not verified**: Verify sender email/domain
- **Error: Spam blocked**: Check email content and reputation
- **Error: Rate limit**: Upgrade plan or slow down sending

## 10. Security Best Practices

1. **Never commit credentials to Git**
2. **Use environment variables only**
3. **Rotate API keys regularly**
4. **Set up IP whitelisting (optional)**
5. **Monitor for unusual activity**
6. **Use webhook signatures for verification**

## Support Links

- Twilio Support: https://support.twilio.com
- SendGrid Support: https://support.sendgrid.com
- Railway Docs: https://docs.railway.app
- Our GitHub: https://github.com/Insta-Bids-System/referrallink-platform

## Next Steps

After setup:
1. Test sending messages from the mobile app
2. Monitor delivery rates
3. Set up webhooks for delivery status
4. Create custom email templates
5. Implement retry logic for failed messages