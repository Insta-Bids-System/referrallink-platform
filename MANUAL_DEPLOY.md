# Manual Railway Deployment Steps

## Current Status
- Railway CLI installed ✅
- Project ready for deployment ✅
- Environment variables configured ✅

## Steps to Deploy:

1. Open a new terminal
2. Navigate to backend:
   ```
   cd C:\Users\USER\Desktop\ReferralLink\ReferralLinkPlatform\backend
   ```

3. Link Railway project:
   ```
   railway link
   ```
   - Select: **instabids-referralLink**
   - Workspace: **insta-bids-system's Projects**

4. Deploy to Railway:
   ```
   railway up
   ```

5. Check deployment status:
   ```
   railway logs
   ```

6. Verify deployment:
   - Visit: https://referrallink-platform-production.up.railway.app/health
   - Should return: `{"status":"ok","timestamp":"..."}`

## After Deployment:

1. Update mobile app to use Railway URL:
   - File: `ReferralLinkPlatform/mobile/.env`
   - Change: `API_URL=https://referrallink-platform-production.up.railway.app`

2. Test mobile app with production backend
3. Build APK for distribution

## Alternative: GitHub Push Deploy

Since Railway is connected to GitHub:
1. Commit and push changes:
   ```
   git add .
   git commit -m "Deploy to Railway"
   git push origin clean-master
   ```

Railway will automatically deploy from GitHub push.