# Railway Deployment Status & Configuration Guide
## Date: January 13, 2025

## ✅ What We've Done

### 1. Fixed Monorepo Structure
- Created root `package.json` with delegation scripts
- Updated `railway.json` to use npm scripts
- All builds work locally

### 2. GitHub Integration
- All commits pushed to `clean-master` branch
- Latest commit: "Fix Railway deployment: Configure monorepo structure"
- Repository: https://github.com/Insta-Bids-System/referrallink-platform

## 🔴 Current Issue
Railway is not auto-deploying from GitHub pushes.

## 📋 ACTION REQUIRED - Check Railway Settings

### Please verify in Railway Dashboard:

1. **Open Railway Service Settings**
   - Go to: https://railway.app/project/be9a5dc8-3f0e-48d0-9741-1f14e892cf81/service/89ca29b9-8e8c-4a5d-a5d9-f056eff59d3f/settings

2. **Check GitHub Integration**
   - Under "Service" → "Source"
   - Verify it's connected to: `Insta-Bids-System/referrallink-platform`
   - Verify branch is: `clean-master`
   - Check "Auto Deploy" is ENABLED

3. **Set Root Directory (IMPORTANT!)**
   - Under "Build & Deploy" → "Root Directory"
   - This should be EMPTY (not set) since we handle it in package.json
   - OR set to `/` (root)

4. **Check Build Settings**
   - Build Command: Should use default or be empty (Nixpacks will use our package.json)
   - Start Command: Should use default or be empty

5. **Check Environment Variables**
   Set these in Railway if not already:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://postgres:InstabidsSystems123@@db.zyxeshuhnzkltlatsmxn.supabase.co:5432/postgres
   SUPABASE_URL=https://zyxeshuhnzkltlatsmxn.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVzaHVobnprbHRsYXRzbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDMzODQsImV4cCI6MjA3MDQ3OTM4NH0.wCsW4Q-F3Gf5IVbXA-sA_rTmUCHjWVx2fXtXShN2qIE
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVzaHVobnprbHRsYXRzbXhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkwMzM4NCwiZXhwIjoyMDcwNDc5Mzg0fQ.T8gNeeZcIyZjEKgvoJQm40fsDpqXK7jQxwfY0plQL2c
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-refresh-secret-key-change-this
   COMPANY_URL=https://instabids.ai
   LINK_EXPIRY_DAYS=10
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
   OPENAI_MODEL=gpt-4-turbo-preview
   CORS_ORIGIN=*
   ```

6. **Trigger Manual Deploy (if needed)**
   - In Railway dashboard, click "Deploy" → "Deploy from GitHub"
   - Select `clean-master` branch
   - Click "Deploy"

## 📂 Our Configuration Files

### `/package.json` (root)
```json
{
  "scripts": {
    "build": "npm run build:backend",
    "start": "npm run start:backend",
    "build:backend": "cd ReferralLinkPlatform/backend && npm run build",
    "start:backend": "cd ReferralLinkPlatform/backend && npm start"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### `/railway.json` (root)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run install:backend && npm run build:backend"
  },
  "deploy": {
    "startCommand": "npm run start:backend"
  }
}
```

### `/ReferralLinkPlatform/backend/package.json`
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

## 🚀 What Should Happen

1. Railway detects push to `clean-master`
2. Nixpacks finds root `package.json`
3. Runs `npm install` (installs root dependencies)
4. Runs build command from `railway.json`
5. Executes start command pointing to backend

## 🔍 Debugging Steps

If deployment still fails after checking settings:

1. **Check Deployment Logs**
   - https://railway.app/project/be9a5dc8-3f0e-48d0-9741-1f14e892cf81/service/89ca29b9-8e8c-4a5d-a5d9-f056eff59d3f/logs

2. **Look for:**
   - "Nixpacks build failed" - means configuration issue
   - "Cannot find module" - means build didn't complete
   - "No start command" - means start script issue

3. **Alternative: Set Root Directory**
   If all else fails, in Railway settings:
   - Set Root Directory to: `/ReferralLinkPlatform/backend`
   - Remove `/railway.json` from repo
   - Let Railway use the backend's package.json directly

## 📱 Mobile App Status
- Running on Expo (port 8082)
- Already configured for Railway URL
- Ready to connect once backend is deployed

## ✅ Everything Else Complete
- Database (Supabase) configured
- All code written and tested
- Mobile app running
- Just need Railway deployment to work