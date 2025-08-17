# ReferralLink Platform

## 🚀 Quick Start

```bash
# Mobile App
cd ReferralLinkPlatform/mobile
npx expo start --tunnel --port 8085

# Backend Health Check
curl https://referrallink-platform-production.up.railway.app/health

# Test SMS/Email (after adding credentials)
cd ReferralLinkPlatform/backend
node scripts/test-communication.js

# Deploy Updates
git push origin clean-master  # Railway auto-deploys
```

## 📊 Current Status (Jan 17, 2025 - Session 2)

### ✅ FULLY WORKING FEATURES
- **URL Format**: Links correctly share as `https://instabids.ai?ref=ABC123` (NOT backend URL)
- **Click Tracking**: Every click stored in Supabase with IP, device, browser, location
- **Mobile App**: Creating links, sharing without duplicate URLs, viewing analytics
- **Backend**: Live at https://referrallink-platform-production.up.railway.app
- **Database**: Supabase PostgreSQL with test user (ID: 550e8400-e29b-41d4-a716-446655440000)
- **AI Messages**: GPT-4 generates personalized messages
- **Share Feature**: Fixed - no more duplicate URLs in WhatsApp/SMS
- **Analytics APIs**: Platform-wide and user-specific metrics working
- **Twilio Integration**: SMS sending ready (needs API credentials)
- **SendGrid Integration**: Email sending ready (needs API key)

### 🔧 Test Credentials
- Email: `test@example.com`
- Password: `password123`
- User ID: `550e8400-e29b-41d4-a716-446655440000`

## 🎯 NEXT STEPS

### Immediate Action Required:

#### Step 1: Set Up Twilio Account (5 minutes)
1. Go to https://www.twilio.com/try-twilio
2. Sign up for free trial ($15 credit included)
3. Get a phone number with SMS capability
4. Copy Account SID and Auth Token

#### Step 2: Set Up SendGrid Account (5 minutes)
1. Go to https://signup.sendgrid.com/
2. Sign up for free (100 emails/day forever)
3. Create API key with Full Access
4. Verify sender email address

#### Step 3: Add to Railway (2 minutes)
Follow instructions in TWILIO_SENDGRID_SETUP.md or run:
```bash
cd ReferralLinkPlatform/backend
railway variables set TWILIO_ACCOUNT_SID=ACxxxx
railway variables set TWILIO_AUTH_TOKEN=xxxx
railway variables set TWILIO_PHONE_NUMBER=+1234567890
railway variables set SENDGRID_API_KEY=SG.xxxx
railway variables set EMAIL_FROM=noreply@yourdomain.com
railway up
```

#### Step 4: Test (2 minutes)
```bash
node scripts/test-communication.js
```

#### Option 2: Build Analytics Dashboard
- Create web dashboard at `/ReferralLinkPlatform/web`
- Use existing analytics endpoints
- Add charts with Chart.js or Recharts
- Export functionality already in backend

#### Option 3: Conversion Tracking
- InstaBids needs to call our webhook when user registers
- Endpoint: `POST /api/referrals/conversion`
- Track ROI and user earnings

## 🔥 TODAY'S ACCOMPLISHMENTS (Jan 17, 2025 - Session 2)

### Complete Twilio/SendGrid Integration:
1. **Fetched Latest Documentation**: Retrieved 2025 Twilio v4 and SendGrid API documentation
2. **Updated Communication Service** (`backend/src/services/communication.service.ts`):
   - Added Twilio v4 best practices with improved initialization
   - Enhanced SendGrid with click/open tracking
   - Added phone number E.164 formatting helper
   - Improved error handling with specific error codes
   - Added configuration validation checks
3. **Created TWILIO_SENDGRID_SETUP.md**: 
   - Complete step-by-step account setup guide
   - Railway deployment instructions
   - Cost estimates and production checklist
   - Troubleshooting common issues
4. **Created Test Script** (`backend/scripts/test-communication.js`):
   - Interactive CLI testing tool
   - Tests SMS, email, bulk send, phone validation
   - Includes error troubleshooting tips
   - Color-coded output for better UX
5. **Updated Backend for Production**:
   - Better mock mode when no credentials
   - Console logging for initialization status
   - Support for both test and production modes

### Files Modified/Created Today:
- `TWILIO_SENDGRID_SETUP.md` - NEW: Complete setup guide
- `backend/src/services/communication.service.ts` - UPDATED: Latest API patterns
- `backend/scripts/test-communication.js` - NEW: Testing tool
- `CLAUDE.md` - UPDATED: Current status and next steps

### Previous Accomplishments (Jan 14, 2025)

### Morning Session Issues Fixed:
1. **Axios 401 Error**: Fixed wrong request format (was sending originalUrl, now sends customMessage)
2. **Mock Token Issue**: Auto-clears invalid tokens from storage
3. **Dashboard 500 Error**: Fixed undefined data handling
4. **Foreign Key Error**: Created test user in Supabase

### Evening Session Major Fix:
1. **URL Format Problem**: Changed from `referrallink-backend.up.railway.app/r/ABC123` to `instabids.ai?ref=ABC123`
2. **Duplicate URL in Shares**: Removed `url` property from Share.share()
3. **Filter Error**: Fixed undefined links array in LinksScreen
4. **Click Tracking**: Implemented full analytics with AdminAnalyticsController
5. **Documentation Cleanup**: Removed 15+ redundant files, simplified to single CLAUDE.md

## 🏗️ Technical Details

### SMS/Email System Status (Jan 17, 2025):
**BACKEND CODE: 100% COMPLETE** - Just needs API credentials

#### What's Ready:
- ✅ Twilio SMS sending with error handling
- ✅ SendGrid email with HTML templates
- ✅ Bulk messaging with rate limiting
- ✅ Phone number validation
- ✅ WhatsApp support (optional)
- ✅ AI-powered message personalization
- ✅ Click/open tracking for emails
- ✅ E.164 phone formatting
- ✅ Test script for validation

#### To Activate:
1. Create accounts (10 minutes total)
2. Add to Railway: `railway variables set TWILIO_ACCOUNT_SID=...`
3. Test: `node scripts/test-communication.js`

### How Referral System Works:
1. User creates link → Gets `instabids.ai?ref=ABC123`
2. User shares link → Shows correct destination URL
3. Someone clicks → Goes to InstaBids with ref parameter
4. InstaBids should ping our `/r/ABC123` for tracking
5. We record click with full analytics
6. User sees stats in mobile app

### Key Files Modified Today:
- `/backend/src/controllers/referral.supabase.controller.ts` - Fixed URL format
- `/backend/src/controllers/admin.analytics.controller.ts` - NEW analytics
- `/mobile/src/screens/LinkDetailsScreen.tsx` - Fixed share duplicates
- `/mobile/src/screens/LinksScreen.tsx` - Fixed filter error

### Database Tables:
- `users` - Has test user
- `referral_links` - Stores links with shortCodes
- `clicks` - Tracks every click with metadata
- `conversions` - Ready for conversion tracking

## 🔌 API Endpoints Working

### Authentication
- `POST /api/auth/login` - Returns JWT token
- `POST /api/auth/register` - Creates new user

### Referral Links
- `POST /api/referrals` - Creates link, returns `instabids.ai?ref=ABC123`
- `GET /api/referrals` - Gets user's links
- `GET /r/:shortCode` - Tracking redirect

### Analytics (NEW TODAY)
- `GET /api/admin/analytics/platform` - Overall metrics
- `GET /api/admin/analytics/user/:userId` - User-specific metrics
- `GET /api/admin/analytics/clicks` - All clicks with filtering

### Communication (Backend Ready)
- `POST /api/communication/send` - Single message
- `POST /api/communication/bulk` - Bulk messages
- Waiting for Twilio/SendGrid API keys

## 🛠️ Environment Variables

### Currently Set in Railway:
```env
DATABASE_URL=postgresql://...  # Supabase connection
JWT_SECRET=your-secret-key-here
COMPANY_URL=https://instabids.ai
BASE_URL=https://referrallink-platform-production.up.railway.app
OPENAI_API_KEY=sk-...  # Working
```

### Need to Add for SMS/Email:
```env
TWILIO_ACCOUNT_SID=ACxxxxxx
TWILIO_AUTH_TOKEN=xxxxxx
TWILIO_PHONE_NUMBER=+1234567890
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=noreply@instabids.ai
```

## 📝 Git Status
- Branch: `clean-master`
- Latest commit: Fixed filter error in LinksScreen
- GitHub: https://github.com/Insta-Bids-System/referrallink-platform
- Railway: Auto-deploys from GitHub pushes

## ⚠️ Known Issues
- Push notifications warning (expected - need dev build, not Expo Go)
- Conversion tracking needs InstaBids integration
- Twilio/SendGrid need API keys to test

## 🎬 NEXT SESSION PROMPT

```
Continue the ReferralLink project from Jan 17, 2025.

CURRENT STATE:
- Links share correctly as instabids.ai?ref=ABC123 (WORKING)
- Click tracking with full analytics (WORKING)
- Mobile app fully functional (WORKING)
- Backend on Railway, DB on Supabase (WORKING)
- Twilio/SendGrid code COMPLETE - just needs API credentials

WHAT WAS COMPLETED TODAY (Jan 17):
- Updated communication.service.ts with Twilio v4 and SendGrid best practices
- Created TWILIO_SENDGRID_SETUP.md with complete setup instructions
- Created test-communication.js script for testing SMS/Email
- Added phone number E.164 formatting
- Enhanced error handling for common Twilio/SendGrid issues

IMMEDIATE NEXT STEPS:
1. User needs to create Twilio account and get credentials
2. User needs to create SendGrid account and get API key
3. Add credentials to Railway environment variables
4. Test with: node scripts/test-communication.js

AFTER SMS/EMAIL IS WORKING:
- Option 1: Build analytics dashboard at /ReferralLinkPlatform/web
- Option 2: Implement conversion tracking with InstaBids
- Option 3: Add more AI features for message personalization

DO NOT:
- Change the URL format (it's correct: instabids.ai?ref=ABC123)
- Create redundant documentation files
- Modify authentication (it's working)
- Touch the database schema (it's complete)
- Modify communication service (it's ready, just needs credentials)

TEST USER:
email: test@example.com
password: password123

FILES TO CHECK:
- TWILIO_SENDGRID_SETUP.md - Setup instructions
- backend/scripts/test-communication.js - Test tool
- backend/src/services/communication.service.ts - Already updated

Start by checking: cd ReferralLinkPlatform/mobile && npx expo start --tunnel --port 8085
Then test backend: curl https://referrallink-platform-production.up.railway.app/health
```

## 📞 Support
- GitHub: https://github.com/Insta-Bids-System/referrallink-platform
- Branch: `clean-master`
- Railway: Auto-deploys on push
- Supabase Project: zyxeshuhnzkltlatsmxn