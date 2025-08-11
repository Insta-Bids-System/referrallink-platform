@echo off
echo ================================================
echo    INSTABIDS REFERRAL APP - BUILD PROCESS
echo ================================================
echo.
echo Step 1: Login to Expo Account
echo -------------------------------
echo If you don't have an account, create one at:
echo https://expo.dev/signup
echo.
echo After creating account, press any key to continue...
pause > nul

cd C:\Users\USER\Desktop\ReferralLink\ReferralLinkPlatform\mobile

echo.
echo Logging into EAS...
eas login

echo.
echo Step 2: Configure Build (First Time Only)
echo ------------------------------------------
eas build:configure

echo.
echo Step 3: Building Android APK
echo -----------------------------
echo This will take 10-20 minutes...
echo.
eas build --profile preview --platform android

echo.
echo ================================================
echo    BUILD STARTED!
echo ================================================
echo.
echo 1. Go to https://expo.dev to monitor progress
echo 2. Download APK when ready
echo 3. Install on your Android phone
echo.
echo Your app connects to:
echo - Backend: https://referrallink-platform-production.up.railway.app
echo - Company: https://instabids.ai
echo.
pause