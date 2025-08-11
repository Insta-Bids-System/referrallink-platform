@echo off
echo Fixing EAS Build Configuration...
cd C:\Users\USER\Desktop\ReferralLink\ReferralLinkPlatform\mobile

echo.
echo Step 1: Login to EAS
eas login

echo.
echo Step 2: Initialize project (this creates the project ID)
eas init

echo.
echo Step 3: Now build the APK
eas build --profile preview --platform android

echo.
echo Build started! Check https://expo.dev for progress.
pause