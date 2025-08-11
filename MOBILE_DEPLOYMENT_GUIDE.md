# 📱 Mobile App Deployment Guide

## Prerequisites

1. **Update Backend URL** ⚠️ IMPORTANT
   - Edit `ReferralLinkPlatform/mobile/src/config/api.config.ts`
   - Replace the Railway URL with your actual URL from Railway dashboard
   - Example: `https://your-app.up.railway.app`

2. **Install EAS CLI**:
```bash
npm install -g eas-cli
```

3. **Create Expo Account** (if you don't have one):
   - Go to https://expo.dev
   - Sign up for free

## Step 1: Setup EAS Build

```bash
cd ReferralLinkPlatform/mobile

# Login to Expo
eas login

# Configure EAS (first time only)
eas build:configure
```

This will:
- Create an Expo project
- Generate a project ID
- Update your app.json

## Step 2: Test Locally First

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start Expo
npx expo start

# Test on your phone:
# 1. Install "Expo Go" app from App Store/Play Store
# 2. Scan the QR code
# 3. Test all features work with your Railway backend
```

## Step 3: Build for Android (APK)

### Quick Test Build (APK):
```bash
# Build APK for testing
eas build --profile preview --platform android
```

This creates an APK you can:
- Download directly
- Install on any Android device
- Share with testers

### Production Build (AAB for Play Store):
```bash
# Build for Google Play Store
eas build --profile production --platform android
```

## Step 4: Build for iOS

⚠️ **iOS Requirements**:
- Apple Developer Account ($99/year)
- Or use Expo's free builds (limited)

```bash
# Build for iOS
eas build --profile production --platform ios
```

## Step 5: Download and Test

After building (takes 10-20 minutes):
1. Go to your Expo dashboard: https://expo.dev
2. Find your build
3. Download the APK/IPA file
4. Install and test

## Quick Commands Summary

```bash
# Navigate to mobile app
cd ReferralLinkPlatform/mobile

# Install EAS globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build Android APK for testing
eas build --profile preview --platform android

# Build for production
eas build --profile production --platform android
eas build --profile production --platform ios
```

## Testing Your APK

### On Android Device:
1. Download APK from Expo dashboard
2. Enable "Install from Unknown Sources" in Settings
3. Install the APK
4. Test all features:
   - Login/Register
   - Create referral link (should go to instabids.ai)
   - Generate AI messages
   - View analytics

### Share APK with Others:
- Upload to Google Drive
- Share via email
- Use services like Firebase App Distribution

## Troubleshooting

### "API not working" in app:
- Check Railway URL in `api.config.ts`
- Ensure Railway backend is running
- Test API directly: `https://your-railway-url/health`

### Build fails:
- Run `npm install --legacy-peer-deps`
- Clear cache: `npx expo start --clear`
- Check Expo status: https://status.expo.dev

### App crashes on launch:
- Check logs in Expo dashboard
- Verify all environment variables
- Test locally first with `npx expo start`

## App Features to Test

✅ **User Authentication**
- Register new account
- Login with credentials
- Logout functionality

✅ **Referral Links**
- Create new link (goes to instabids.ai)
- View all links
- Copy link to clipboard
- See 10-day expiry countdown

✅ **AI Messages**
- Generate messages for different platforms
- Copy messages
- See multiple variations

✅ **Analytics**
- View click counts
- See conversion metrics
- Track performance

## Publishing to App Stores

### Google Play Store:
1. Create developer account ($25 one-time)
2. Create app listing
3. Upload AAB file from production build
4. Fill app details
5. Submit for review

### Apple App Store:
1. Apple Developer account ($99/year)
2. Create app in App Store Connect
3. Upload IPA via Transporter
4. Fill app information
5. Submit for review

## Your Current Status

✅ Backend deployed on Railway
✅ Mobile app configured
✅ Ready to build

## Next Steps

1. **Update the Railway URL** in `api.config.ts` with your actual URL
2. **Run**: `eas build --profile preview --platform android`
3. **Wait** 10-20 minutes for build
4. **Download** APK from Expo dashboard
5. **Test** on your phone
6. **Share** with others for testing

## 🎯 Quick Start (Copy & Paste)

```bash
# Go to mobile directory
cd C:\Users\USER\Desktop\ReferralLink\ReferralLinkPlatform\mobile

# Install EAS
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build Android APK
eas build --profile preview --platform android

# Check status
eas build:list
```

After 15-20 minutes, download your APK from https://expo.dev and install on any Android phone!

## Need Help?

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction
- Your Backend: Check Railway dashboard for URL
- Test Backend: `curl https://your-railway-url/health`