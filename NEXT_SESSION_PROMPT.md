# 🚀 Session Continuity Prompt - ReferralLink Platform

## Copy this prompt to start your next session:

```
Continue working on the ReferralLink Platform project. Here's the current state:

PROJECT STATUS:
- Backend: ✅ LIVE at https://referrallink-platform-production.up.railway.app
- Database: ✅ Supabase connected (project: zyxeshuhnzkltlatsmxn)
- Mobile App: ✅ Working with Expo
- GitHub: ✅ Synced (clean-master branch)
- Railway: ✅ Auto-deploys from GitHub

COMPLETED FEATURES (Phases 0, 1, 2):
- Database migrated to Supabase with RLS policies
- Company URL hard-coded to https://instabids.ai
- 10-day auto-expiry for all links
- One primary link per user system
- AI message generation with OpenAI GPT-4
- Multi-platform message support (SMS, Email, WhatsApp, Social)
- Authentication system with JWT tokens
- Click tracking and analytics

RECENT FIXES (Jan 13, 2025):
- Fixed TypeScript AuthRequest interface errors
- Forced IPv4 for Supabase connection (Railway doesn't support IPv6)
- Changed referral routes from Supabase auth to JWT auth
- Fixed token field mismatch (accessToken vs token)
- Changed user IDs to UUID format for Supabase compatibility
- Cleaned up 40+ duplicate documentation files

QUICK COMMANDS:
- Start mobile app: cd ReferralLinkPlatform/mobile && npx expo start --tunnel --port 8084
- Check backend: curl https://referrallink-platform-production.up.railway.app/health
- Deploy updates: git push origin clean-master (Railway auto-deploys)

NEXT PHASE TO IMPLEMENT (Phase 3 - Contact Sharing):
1. Add expo-contacts to mobile app for contact access
2. Create ContactSelector component for multi-select
3. Implement bulk SMS sending via Twilio
4. Add email composer integration
5. Build share tracking system
6. Create sharing analytics dashboard

Please review CLAUDE.md for full project context and continue development.
```

## 📋 What We've Achieved So Far

### ✅ Phase 0 - Database Migration (COMPLETE)
- Migrated from local PostgreSQL to Supabase cloud
- Set up Row Level Security (RLS) policies
- Created users, referral_links, clicks, conversions tables
- Fixed RLS recursion issues
- Configured service role authentication

### ✅ Phase 1 - Core Link System (COMPLETE)
- Hard-coded company URL: https://instabids.ai
- Implemented 10-day auto-expiry for all links
- One primary link per user enforcement
- Removed URL input from mobile UI
- Automatic link refresh after expiry

### ✅ Phase 2 - AI Message Generation (COMPLETE)
- Integrated OpenAI GPT-4 (API key in .env)
- Built WritingStyleAnalyzer service
- Created MessageGenerator with platform constraints
- Added AIMessageScreen to mobile app
- Implemented message improvement based on feedback
- Multi-platform support (SMS, Email, WhatsApp, Social)

### 🔧 Technical Fixes Applied
1. **Authentication System**:
   - JWT middleware for API routes
   - UUID format for user IDs
   - Token compatibility (accessToken/token)

2. **Database Connection**:
   - IPv4 forced for Railway deployment
   - Supabase client properly configured
   - Connection pooling optimized

3. **Mobile App**:
   - API services updated with correct endpoints
   - Auth headers properly configured
   - Error handling with fallbacks

### 📱 Mobile App Configuration
- **API URL**: https://referrallink-platform-production.up.railway.app
- **Port**: 8084 (when running locally)
- **Auth**: Bearer token authentication
- **State Management**: Zustand store

### 🚀 Deployment Configuration
- **Platform**: Railway
- **Project ID**: 951cba32-a911-4855-84aa-24947ddacda0
- **Auto-deploy**: From GitHub clean-master branch
- **Environment**: Production with all env vars set

## 📝 Next Steps (Phase 3 - Contact Sharing)

### Required Implementation:
```javascript
// 1. Install expo-contacts
npx expo install expo-contacts

// 2. ContactSelector Component
- Multi-select interface
- Search/filter functionality
- Contact grouping options

// 3. Bulk Messaging Service
- Twilio SMS integration
- Rate limiting for bulk sends
- Message personalization

// 4. Share Tracking
- Track which contacts received links
- Monitor open rates
- Follow-up reminders
```

### API Endpoints to Create:
- `POST /api/communication/bulk-share` - Share with multiple contacts
- `GET /api/analytics/shares/:linkId` - Get share analytics
- `POST /api/contacts/import` - Import phone contacts
- `GET /api/contacts/status/:shareId` - Check share delivery status

## 🛠️ Development Environment

### Required API Keys (Already Set):
- **OpenAI**: GPT-4 configured
- **Supabase**: Service role key active
- **JWT**: Secret keys configured

### Missing API Keys (Needed for Phase 3):
- **Twilio**: Account SID, Auth Token, Phone Number
- **SendGrid**: API key for emails

### Local Development:
```bash
# Backend
cd ReferralLinkPlatform/backend
npm run dev

# Mobile
cd ReferralLinkPlatform/mobile
npx expo start --tunnel --port 8084

# Database migrations
cd ReferralLinkPlatform/backend
npm run migrate
```

## 📁 Project Structure

```
ReferralLink/
├── CLAUDE.md (main project memory)
├── ReferralLinkPlatform/
│   ├── backend/ (Node.js + TypeScript)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   └── middleware/
│   │   └── dist/ (compiled JS)
│   ├── mobile/ (React Native + Expo)
│   │   └── src/
│   │       ├── screens/
│   │       ├── services/
│   │       └── stores/
│   └── web/ (React - scaffolded)
└── Documentation files
```

## ⚠️ Important Notes

1. **Don't Change**:
   - Company URL (https://instabids.ai)
   - 10-day expiry logic
   - One-link-per-user system
   - Supabase configuration

2. **Known Issues**:
   - Push notifications need production build
   - Social OAuth not implemented yet
   - Web app only scaffolded

3. **Testing Credentials**:
   - Email: test@example.com
   - Password: password123
   - Returns mock user with UUID

## 🔗 Quick Links

- **Live Backend**: https://referrallink-platform-production.up.railway.app
- **GitHub**: https://github.com/Insta-Bids-System/referrallink-platform
- **Railway**: https://railway.app/project/951cba32-a911-4855-84aa-24947ddacda0
- **Supabase**: https://app.supabase.com/project/zyxeshuhnzkltlatsmxn

## 💡 Session Tips

1. Always check `CLAUDE.md` first for project context
2. Run `git pull` before starting work
3. Test locally before pushing to production
4. Railway auto-deploys on git push
5. Mobile app needs reload after API changes

---

**Last Session**: January 13, 2025
**Last Commit**: 70337b1 - Major cleanup
**Working Directory**: C:\Users\USER\Desktop\ReferralLink