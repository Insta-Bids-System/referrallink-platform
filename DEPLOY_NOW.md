# 🚀 Deploy Your ReferralLink Platform NOW!

Your platform is **READY TO DEPLOY**! Follow these simple steps:

## Option 1: Deploy to Railway (Recommended - Easiest)

### Step 1: Sign up for Railway
1. Go to https://railway.app
2. Sign up with GitHub (recommended) or email
3. You get $5 free credit (enough for testing)

### Step 2: Deploy via Railway Dashboard
1. Click "New Project" → "Deploy from GitHub repo"
2. If you haven't pushed to GitHub yet:
   ```bash
   cd C:\Users\USER\Desktop\ReferralLink
   git init
   git add .
   git commit -m "Initial deployment"
   git remote add origin https://github.com/YOUR_USERNAME/referrallink.git
   git push -u origin main
   ```
3. Select your repo in Railway
4. Railway will auto-detect Node.js and start building

### Step 3: Add Environment Variables in Railway
Click on your deployment → Variables → Add these:

```
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://zyxeshuhnzkltlatsmxn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVzaHVobnprbHRsYXRzbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDMzODQsImV4cCI6MjA3MDQ3OTM4NH0.wCsW4Q-F3Gf5IVbXA-sA_rTmUCHjWVx2fXtXShN2qIE
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVzaHVobnprbHRsYXRzbXhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkwMzM4NCwiZXhwIjoyMDcwNDc5Mzg0fQ.T8gNeeZcIyZjEKgvoJQm40fsDpqXK7jQxwfY0plQL2c
OPENAI_API_KEY=your-openai-api-key-here
COMPANY_URL=https://instabids.ai
JWT_SECRET=production-secret-change-this-to-something-random-32chars
JWT_REFRESH_SECRET=production-refresh-secret-change-this-also-32chars
```

### Step 4: Get Your Live URL
Railway will give you a URL like: `https://referrallink-backend.up.railway.app`

## Option 2: Deploy to Render (Free Tier Available)

### Step 1: Sign up for Render
1. Go to https://render.com
2. Sign up with GitHub
3. Free tier available!

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - Name: `referrallink-backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/server.js`

### Step 3: Add Environment Variables
Same as Railway - add all the variables in Render dashboard

## Option 3: Local Testing First

### Test Production Build Locally:
```bash
cd ReferralLinkPlatform\backend

# Start production server
start-production.bat

# In another terminal, test it:
curl http://localhost:5000/health
```

## After Deployment - Test Your API

### 1. Health Check
```bash
curl https://your-deployed-url.com/health
```

### 2. Test User Registration
```bash
curl -X POST https://your-deployed-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"firstName\":\"Test\",\"lastName\":\"User\"}"
```

### 3. Test AI Message Generation
First login to get a token, then:
```bash
curl -X POST https://your-deployed-url.com/api/ai/generate-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"platform\":\"sms\",\"referralLink\":\"https://test.link\"}"
```

## Mobile App Configuration

Once deployed, update your mobile app to use the production API:

1. Edit `ReferralLinkPlatform/mobile/src/config/api.ts`
2. Change the API_URL to your deployed URL:
```javascript
export const API_URL = 'https://your-deployed-url.com';
```

## Quick Deploy Commands

### If you have Railway CLI installed:
```bash
cd ReferralLinkPlatform/backend
railway login
railway link
railway up
```

### If you have Vercel CLI installed:
```bash
cd ReferralLinkPlatform/backend
vercel --prod
```

### Using Git Deploy (Heroku-style):
```bash
# Add Render/Railway git remote
git remote add production https://your-service.git

# Deploy
git push production main
```

## 🎉 Your Platform is Live!

Once deployed, you'll have:
- ✅ Backend API running in the cloud
- ✅ Supabase database connected
- ✅ OpenAI integration working
- ✅ Instabids.ai as the destination
- ✅ 10-day link expiry active
- ✅ AI message generation ready

## Next Steps

1. **Update Mobile App**:
   ```bash
   cd ReferralLinkPlatform/mobile
   # Update API_URL in config
   npx expo build:android
   npx expo build:ios
   ```

2. **Monitor Your App**:
   - Check Railway/Render dashboard for logs
   - Monitor Supabase for database activity
   - Watch OpenAI usage in their dashboard

3. **Share Your Success**:
   - Your app is live at: `https://your-deployed-url.com`
   - Test with friends and family
   - Gather feedback for Phase 3

## Troubleshooting

### If deployment fails:
1. Check build logs in Railway/Render dashboard
2. Verify all environment variables are set
3. Ensure TypeScript builds locally: `npm run build`

### If API doesn't respond:
1. Check the health endpoint: `/health`
2. Look at deployment logs
3. Verify PORT is set correctly

### If database connection fails:
1. Check Supabase is not paused
2. Verify connection string in environment
3. Test locally with production .env

## 🚨 IMPORTANT: Security

Before sharing publicly:
1. Change the JWT secrets in production
2. Set up domain and SSL
3. Enable rate limiting
4. Monitor costs (especially OpenAI)

---

**Ready to deploy? Just pick Option 1 (Railway) or Option 2 (Render) above and follow the steps. Your platform will be live in 5 minutes!** 🚀