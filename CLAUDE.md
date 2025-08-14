# ReferralLink Platform

## 🚀 Quick Start

```bash
# Mobile App
cd ReferralLinkPlatform/mobile
npx expo start --tunnel --port 8085

# Backend Health Check
curl https://referrallink-platform-production.up.railway.app/health

# Deploy Updates
git push origin clean-master  # Railway auto-deploys
```

## 📊 Current Status (Jan 14, 2025 - END OF DAY)

### ✅ FULLY WORKING FEATURES
- **URL Format**: Links correctly share as `https://instabids.ai?ref=ABC123` (NOT backend URL)
- **Click Tracking**: Every click stored in Supabase with IP, device, browser, location
- **Mobile App**: Creating links, sharing without duplicate URLs, viewing analytics
- **Backend**: Live at https://referrallink-platform-production.up.railway.app
- **Database**: Supabase PostgreSQL with test user (ID: 550e8400-e29b-41d4-a716-446655440000)
- **AI Messages**: GPT-4 generates personalized messages
- **Share Feature**: Fixed - no more duplicate URLs in WhatsApp/SMS
- **Analytics APIs**: Platform-wide and user-specific metrics working

### 🔧 Test Credentials
- Email: `test@example.com`
- Password: `password123`
- User ID: `550e8400-e29b-41d4-a716-446655440000`

## 🎯 TOMORROW'S STARTING POINT

### Continue From Here - Choose One:

#### Option 1: Twilio/SendGrid Integration (RECOMMENDED)
Backend endpoints are READY at `/api/communication/send` and `/api/communication/bulk`.
Just need to:
1. Get Twilio account (free trial works)
2. Add these to Railway environment:
```bash
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
SENDGRID_API_KEY=your_key
```
3. Test bulk SMS/Email sending from BulkShareScreen

#### Option 2: Build Analytics Dashboard
- Create web dashboard at `/ReferralLinkPlatform/web`
- Use existing analytics endpoints
- Add charts with Chart.js or Recharts
- Export functionality already in backend

#### Option 3: Conversion Tracking
- InstaBids needs to call our webhook when user registers
- Endpoint: `POST /api/referrals/conversion`
- Track ROI and user earnings

## 🔥 TODAY'S ACCOMPLISHMENTS (Jan 14, 2025)

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

## 🎬 TOMORROW'S SESSION PROMPT

```
Continue the ReferralLink project from Jan 14, 2025. 

CURRENT STATE:
- Links share correctly as instabids.ai?ref=ABC123 (WORKING)
- Click tracking with full analytics (WORKING)
- Mobile app fully functional (WORKING)
- Backend on Railway, DB on Supabase (WORKING)

WHAT WAS FIXED TODAY:
- URL format changed from backend URL to instabids.ai?ref=shortCode
- Duplicate URL in WhatsApp sharing fixed
- Filter undefined error in LinksScreen fixed
- Created AdminAnalyticsController for metrics

NEXT PRIORITY:
Implement Twilio/SendGrid for bulk SMS/Email messaging. The backend endpoints are ready at /api/communication/send and /api/communication/bulk. Just need to add API keys to Railway environment variables.

DO NOT:
- Change the URL format (it's correct now)
- Create new documentation files
- Modify authentication (it's working)
- Touch the database schema (it's complete)

TEST USER:
email: test@example.com
password: password123

Start by checking: cd ReferralLinkPlatform/mobile && npx expo start --tunnel --port 8085
```

## 📞 Support
- GitHub: https://github.com/Insta-Bids-System/referrallink-platform
- Branch: `clean-master`
- Railway: Auto-deploys on push
- Supabase Project: zyxeshuhnzkltlatsmxn