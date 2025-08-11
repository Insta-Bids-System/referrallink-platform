@echo off
echo ================================================
echo    RAILWAY DEPLOYMENT - FIXING YOUR BACKEND
echo ================================================
echo.
echo Step 1: Login to Railway
echo ------------------------
echo A browser window will open for authentication
echo.
railway login

echo.
echo Step 2: Navigate to backend directory
cd C:\Users\USER\Desktop\ReferralLink\ReferralLinkPlatform\backend

echo.
echo Step 3: Link to your project
echo -----------------------------
echo Select your project from the list when prompted
echo.
railway link

echo.
echo Step 4: Deploy to Railway
echo -------------------------
echo This will upload and build your backend
echo.
railway up

echo.
echo ================================================
echo    DEPLOYMENT COMPLETE!
echo ================================================
echo.
echo Your backend should now be running at:
echo https://referrallink-platform-production.up.railway.app
echo.
echo Test it with:
echo curl https://referrallink-platform-production.up.railway.app/health
echo.
pause