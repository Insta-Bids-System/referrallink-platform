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

## 📊 Current Status (Jan 14, 2025)

### ✅ What's Working
- **URL Format**: Links share as `https://instabids.ai?ref=ABC123`
- **Click Tracking**: All clicks stored with IP, device, browser, location
- **Mobile App**: Fully functional with Expo SDK 53
- **Backend**: Live on Railway with Supabase database
- **AI Messages**: GPT-4 integration for personalized messages
- **Share Feature**: WhatsApp, SMS, Email (no duplicate URLs)
- **Analytics**: User and admin metrics endpoints ready

### 🔧 Test Credentials
- Email: `test@example.com`
- Password: `password123`

## 🎯 Next Steps

### Option 1: Twilio/SendGrid Integration
```bash
# Add to Railway environment:
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
SENDGRID_API_KEY=your_key
```

### Option 2: Analytics Dashboard
- Build web UI for metrics visualization
- Export reports as CSV/PDF

### Option 3: Conversion Tracking
- Add webhook for InstaBids registrations
- Calculate conversion rates and ROI

## 🏗️ Architecture

### URL Flow
```
User shares: instabids.ai?ref=ABC123
    ↓
Click redirects through backend for tracking
    ↓
Backend records analytics
    ↓
User sees InstaBids website
```

### Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Mobile**: React Native, Expo SDK 53
- **AI**: OpenAI GPT-4
- **Deployment**: Railway (auto-deploy from GitHub)

## 📁 Project Structure

```
ReferralLink/
├── ReferralLinkPlatform/
│   ├── backend/          # API server
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── models/
│   │   └── package.json
│   ├── mobile/           # React Native app
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   └── stores/
│   │   └── package.json
│   └── web/             # Web dashboard (scaffolded)
└── CLAUDE.md            # This file
```

## 🔌 API Endpoints

### Core Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/referrals` - Create link (returns instabids.ai?ref=ABC123)
- `GET /api/referrals` - Get user's links
- `GET /r/:shortCode` - Click tracking redirect

### Analytics (NEW)
- `GET /api/admin/analytics/platform` - Platform metrics
- `GET /api/admin/analytics/user/:userId` - User metrics
- `GET /api/admin/analytics/clicks` - All clicks data

### Communication (Ready, needs API keys)
- `POST /api/communication/send` - Send SMS/Email
- `POST /api/communication/bulk` - Bulk messaging

## 🛠️ Development

### Environment Variables
```env
# Required
DATABASE_URL=postgresql://...  # Supabase
JWT_SECRET=your-secret
COMPANY_URL=https://instabids.ai
OPENAI_API_KEY=your-key

# Optional (for SMS/Email)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SENDGRID_API_KEY=...
```

### Common Commands
```bash
# Install dependencies
npm install --legacy-peer-deps

# Run TypeScript check
npx tsc --noEmit

# Clear Expo cache
npx expo start --clear

# Test API
curl -X POST https://referrallink-platform-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📝 Recent Changes

### Jan 14, 2025
- Fixed URL format to `instabids.ai?ref=shortCode`
- Implemented click tracking with full analytics
- Fixed duplicate URL in WhatsApp sharing
- Added admin analytics endpoints

### Jan 13, 2025
- Completed Phase 3: Contact sharing UI
- Fixed TypeScript errors
- Added referralStore for state management
- Resolved authentication issues

## ⚠️ Known Issues
- Push notifications require development build (not Expo Go)
- Conversion tracking needs implementation on InstaBids side
- Twilio/SendGrid need API keys for testing

## 📞 Support
- GitHub: https://github.com/Insta-Bids-System/referrallink-platform
- Branch: `clean-master`
- Railway: Auto-deploys on push