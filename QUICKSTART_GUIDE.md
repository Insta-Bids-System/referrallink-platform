# 🚀 ReferralLink Platform - Complete Quick Start Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Quick Commands](#quick-commands)
4. [Testing the Platform](#testing-the-platform)
5. [Architecture](#architecture)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**ReferralLink Platform** is a fully-featured referral system for **Instabids.ai** that combines:
- 📱 **Mobile App** (React Native/Expo)
- 🖥️ **Backend API** (Node.js/Express/TypeScript)
- 🗄️ **Database** (Supabase PostgreSQL)
- 🤖 **AI Integration** (OpenAI GPT-4)
- 🚀 **Deployment** (Railway + Expo)

### Core Features Implemented
✅ **Smart Referral Links**
- Auto-directs to instabids.ai
- 10-day automatic expiration
- One primary link per user
- QR code generation
- Short URL codes

✅ **AI-Powered Messages**
- GPT-4 generates personalized messages
- Multiple platform formats (SMS, Email, WhatsApp, Social)
- 5 variations per request
- Learns from user style

✅ **Real-time Analytics**
- Click tracking
- Conversion monitoring
- Geographic distribution
- Device statistics
- Time-series data

✅ **User Management**
- JWT authentication via Supabase
- Secure registration/login
- Profile management
- Password reset

---

## 📊 Current Status (January 11, 2025)

### ✅ What's Working
| Component | Status | URL/Location |
|-----------|--------|--------------|
| **Backend API** | 🟡 Deploying | https://referrallink-platform-production.up.railway.app |
| **Database** | ✅ Live | Supabase (zyxeshuhnzkltlatsmxn) |
| **Mobile App** | ✅ Running | Expo Go (port 8082) |
| **AI Integration** | ✅ Active | OpenAI GPT-4 |
| **GitHub Repo** | ✅ Pushed | https://github.com/Insta-Bids-System/referrallink-platform |

### 🔧 Recent Actions
1. Fixed Railway deployment configuration
2. Moved TypeScript to dependencies
3. Updated mobile API URL to Railway backend
4. Created deployment scripts
5. Running Railway CLI deployment

---

## ⚡ Quick Commands

### 🖥️ Backend Operations
```bash
# Deploy to Railway (if logged in)
cd ReferralLinkPlatform/backend
railway up

# Run locally for testing
cd ReferralLinkPlatform/backend
npm run dev

# Check backend health
curl https://referrallink-platform-production.up.railway.app/health
```

### 📱 Mobile App Operations
```bash
# Start Expo (for development)
cd ReferralLinkPlatform/mobile
npx expo start --tunnel

# Build Android APK (standalone)
eas build --profile preview --platform android

# Build iOS App (requires Apple Developer)
eas build --profile production --platform ios
```

### 🔄 Git Operations
```bash
# Pull latest changes
cd C:\Users\USER\Desktop\ReferralLink
git pull origin master

# Push changes (use clean-master branch to avoid secrets)
git checkout clean-master
git add .
git commit -m "Your message"
git push origin clean-master
```

---

## 🧪 Testing the Platform

### 1. Test Backend API
```bash
# Health check
curl https://referrallink-platform-production.up.railway.app/health

# Register new user
curl -X POST https://referrallink-platform-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### 2. Test Mobile App
1. **Start Expo**: `npx expo start --tunnel`
2. **Scan QR** with Expo Go app
3. **Test Flow**:
   - Register new account
   - Login
   - Create referral link
   - Verify it points to instabids.ai
   - Generate AI messages
   - View analytics

### 3. Test AI Message Generation
```bash
# In the app:
1. Go to Create Link
2. Tap "Generate AI Message"
3. Select platform (SMS/Email/WhatsApp)
4. Review 5 generated variations
```

---

## 🏗️ Architecture

### Technology Stack
```
Frontend (Mobile):
├── React Native 0.79.5
├── Expo SDK 53
├── TypeScript 5.8.3
├── TanStack Query v5
├── React Navigation v6
└── Zustand (State Management)

Backend:
├── Node.js + Express
├── TypeScript 5.3.2
├── Supabase Client
├── OpenAI SDK
├── JWT Authentication
└── Sequelize ORM

Database:
├── Supabase PostgreSQL
├── Row Level Security
├── Real-time subscriptions
└── Auto-backups

Deployment:
├── Railway (Backend)
├── Expo EAS (Mobile)
└── GitHub Actions (CI/CD)
```

### API Endpoints
```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

Referrals:
GET    /api/referrals          (user's links)
POST   /api/referrals          (create link)
GET    /api/referrals/:id      (link details)
DELETE /api/referrals/:id      (delete link)
GET    /r/:shortCode          (redirect)

AI Messages:
POST   /api/ai/generate-message
POST   /api/ai/generate-variations
GET    /api/ai/templates

Analytics:
GET    /api/analytics/user
GET    /api/analytics/link/:id
```

### Database Schema
```sql
users
├── id (UUID, primary)
├── email (unique)
├── password_hash
├── name
├── writing_style (JSONB)
└── created_at

referral_links
├── id (UUID, primary)
├── user_id (foreign key)
├── short_code (unique)
├── company_url (default: instabids.ai)
├── expires_at (10 days)
├── is_primary (boolean)
└── created_at

clicks
├── id (UUID, primary)
├── link_id (foreign key)
├── ip_address
├── user_agent
├── referrer
├── location (JSONB)
└── clicked_at

ai_messages
├── id (UUID, primary)
├── user_id (foreign key)
├── link_id (foreign key)
├── platform (SMS/Email/WhatsApp)
├── content (text)
├── variations (JSONB)
└── created_at
```

---

## 🔧 Troubleshooting

### Railway Deployment Issues
```bash
# Check deployment logs
railway logs

# Redeploy manually
railway up

# Or use Railway Dashboard:
1. Go to railway.app
2. Settings → Root Directory: ReferralLinkPlatform/backend
3. Build Command: npm install && npm run build
4. Start Command: npm start
```

### Mobile App Network Errors
```bash
# Ensure backend is running
curl https://referrallink-platform-production.up.railway.app/health

# Update API URL if needed
# Edit: mobile/src/config/api.config.ts
# Set: return 'https://your-railway-url.up.railway.app'

# Restart Expo
npx expo start --clear
```

### Database Connection Issues
```bash
# Check Supabase status
https://supabase.com/dashboard/project/zyxeshuhnzkltlatsmxn

# Verify environment variables in Railway:
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
```

---

## 📁 Project Structure
```
ReferralLink/
├── ReferralLinkPlatform/
│   ├── backend/           # Node.js API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── routes/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── mobile/           # React Native App
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   └── config/
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── supabase/         # Database
│       └── migrations/
│
├── CLAUDE.md            # Living documentation
├── QUICKSTART_GUIDE.md  # This file
├── tomorrow_prompts.md  # Session continuity
└── railway.json         # Deployment config
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
# Database
SUPABASE_URL=https://zyxeshuhnzkltlatsmxn.supabase.co
SUPABASE_ANON_KEY=[your-key]
SUPABASE_SERVICE_KEY=[your-key]

# Company
COMPANY_URL=https://instabids.ai
LINK_EXPIRY_DAYS=10

# Auth
JWT_SECRET=[your-secret]
JWT_REFRESH_SECRET=[your-refresh-secret]

# AI
OPENAI_API_KEY=sk-proj-[your-key]
OPENAI_MODEL=gpt-4

# Communication (optional)
TWILIO_ACCOUNT_SID=[your-sid]
TWILIO_AUTH_TOKEN=[your-token]
SENDGRID_API_KEY=[your-key]
```

---

## 🎯 Quick Test Checklist

- [ ] Backend health check returns 200
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can create referral link
- [ ] Link redirects to instabids.ai
- [ ] AI generates 5 message variations
- [ ] Analytics track clicks
- [ ] Mobile app connects to backend
- [ ] Links expire after 10 days

---

## 📞 Support Resources

- **Railway Dashboard**: https://railway.app
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Expo Dashboard**: https://expo.dev
- **GitHub Repo**: https://github.com/Insta-Bids-System/referrallink-platform

---

## 🚦 Next Steps

1. **Immediate**: Complete Railway deployment
2. **Today**: Test full user flow
3. **Tomorrow**: Build Android APK
4. **This Week**: Submit to app stores
5. **Next Phase**: Implement contact sharing

---

Last Updated: January 11, 2025, 3:45 PM