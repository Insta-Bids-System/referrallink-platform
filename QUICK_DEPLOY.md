# 🚀 Quick Railway Deployment

## Option 1: Run the Script (Interactive)
Double-click: **DEPLOY_RAILWAY.bat**

This will:
1. Open browser for Railway login
2. Link to your project
3. Deploy your backend

---

## Option 2: Manual Commands

Open Command Prompt and run:

```bash
# 1. Login to Railway (opens browser)
railway login

# 2. Go to backend folder
cd C:\Users\USER\Desktop\ReferralLink\ReferralLinkPlatform\backend

# 3. Link to your project (select from list)
railway link

# 4. Deploy
railway up
```

---

## Option 3: Use Railway Dashboard

1. Go to https://railway.app
2. Open your project
3. Go to **Settings**
4. Set:
   - Root Directory: `ReferralLinkPlatform/backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Click **Redeploy**

---

## What Gets Fixed:

✅ TypeScript in dependencies (already fixed in code)
✅ Correct build paths
✅ Proper start command

## After Deployment:

Your mobile app will automatically connect to:
`https://referrallink-platform-production.up.railway.app`

Test the backend:
```bash
curl https://referrallink-platform-production.up.railway.app/health
```

## Your App Features:
- Links to **instabids.ai**
- **10-day auto-expiry**
- **AI message generation**
- **Real-time analytics**