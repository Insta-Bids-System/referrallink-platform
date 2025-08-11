# 🚂 Railway Deployment Troubleshooting

## Common Issues and Solutions

### 1. Build Failing - TypeScript Not Found

**Error**: `tsc: command not found` or `Cannot find module 'typescript'`

**Solution**: Already fixed! TypeScript moved to dependencies in package.json

### 2. Wrong Directory Structure

**Issue**: Railway can't find the backend folder

**Solution**: Added `railway.json` with correct paths:
- Build: `cd ReferralLinkPlatform/backend && npm install && npm run build`
- Start: `cd ReferralLinkPlatform/backend && node dist/server.js`

### 3. Environment Variables Not Loading

**Check in Railway Dashboard**:
1. Click on your service
2. Go to "Variables" tab
3. Ensure all these are set:

```
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://zyxeshuhnzkltlatsmxn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVzaHVobnprbHRsYXRzbXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MDMzODQsImV4cCI6MjA3MDQ3OTM4NH0.wCsW4Q-F3Gf5IVbXA-sA_rTmUCHjWVx2fXtXShN2qIE
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGVzaHVobnprbHRsYXRzbXhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkwMzM4NCwiZXhwIjoyMDcwNDc5Mzg0fQ.T8gNeeZcIyZjEKgvoJQm40fsDpqXK7jQxwfY0plQL2c
OPENAI_API_KEY=[YOUR_ACTUAL_KEY]
COMPANY_URL=https://instabids.ai
JWT_SECRET=your-production-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-production-refresh-secret-32-chars
```

### 4. Port Binding Issues

**Error**: `Error: listen EADDRINUSE: address already in use`

**Solution**: Railway automatically sets PORT. Our code already uses:
```javascript
const PORT = process.env.PORT || 5000;
```

### 5. Build Timeout

**Issue**: Build takes too long and times out

**Solution**: 
- Railway has 20-minute build timeout
- Our build should take < 2 minutes
- If timeout occurs, try redeploying

### 6. Memory Issues

**Error**: `JavaScript heap out of memory`

**Solution**: Add to Railway environment variables:
```
NODE_OPTIONS=--max-old-space-size=4096
```

## How to View Logs in Railway

1. Go to your Railway dashboard
2. Click on your deployment
3. Click "View Logs" button
4. Look for:
   - Build logs (during deployment)
   - Deploy logs (runtime errors)

## Manual Railway CLI Deployment (Alternative)

If dashboard doesn't work, use CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

## Checking Deployment Status

Your app should be available at:
- Railway provides URL like: `https://referrallink-platform-production.up.railway.app`

Test endpoints:
1. Health check: `https://your-url.up.railway.app/health`
2. API status: `https://your-url.up.railway.app/api/status`

## If Build Still Fails

### Option 1: Pre-build Locally
```bash
cd ReferralLinkPlatform/backend
npm run build
git add dist -f
git commit -m "Add pre-built dist folder"
git push
```

### Option 2: Use Simpler Start
In Railway, set custom start command:
```
cd ReferralLinkPlatform/backend && npm install && npx tsc && node dist/server.js
```

### Option 3: Use Node Instead of TypeScript
Change start command to:
```
cd ReferralLinkPlatform/backend && npx ts-node src/server.ts
```

## Current Status

✅ **Fixed Issues**:
1. TypeScript in dependencies
2. Railway.json configuration added
3. Correct directory paths
4. Build and start commands configured

## Need More Help?

1. Check Railway Status: https://status.railway.app/
2. Railway Docs: https://docs.railway.app/
3. View deployment logs in Railway dashboard
4. Common error patterns:
   - `MODULE_NOT_FOUND` = dependency issue
   - `tsc not found` = TypeScript not in dependencies
   - `ENOENT` = wrong file path
   - `ECONNREFUSED` = database connection issue

## Your Next Steps

1. Railway should auto-redeploy with the new changes
2. Check the build logs in Railway dashboard
3. Once deployed, test: `https://your-url.up.railway.app/health`
4. If still failing, share the exact error from Railway logs