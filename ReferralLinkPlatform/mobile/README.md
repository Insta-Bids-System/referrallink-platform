# ReferralLink Mobile App

## Overview
React Native mobile application for the ReferralLink platform, built with Expo SDK 53.

## Tech Stack
- **Framework**: React Native with Expo SDK 53.0.20
- **Language**: TypeScript 5.8.3
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation v6
- **State Management**: Zustand 4.5.7
- **Data Fetching**: TanStack Query v5 (formerly React Query)
- **Push Notifications**: Expo Notifications
- **React Version**: 19.0.0
- **React Native Version**: 0.79.5

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Expo Go app on your phone (for device testing)
- Android Studio (for Android emulator) - optional
- Xcode (for iOS simulator, Mac only) - optional

## Installation

```bash
# Navigate to mobile directory
cd ReferralLinkPlatform/mobile

# Install dependencies
npm install --legacy-peer-deps
```

## Running the App

### Development Server
```bash
# Start Expo development server
npx expo start

# With tunnel (for network issues or remote testing)
npx expo start --tunnel

# Clear cache and restart
npx expo start --clear

# Use specific port if default is busy
npx expo start --port 19001
```

### Platform-Specific Commands
```bash
# iOS Simulator (Mac only, requires Xcode)
npm run ios

# Android Emulator (requires Android Studio)
npm run android

# Web Browser
npm run web
```

## Testing on Physical Device

### Using Expo Go App
1. Download **Expo Go** from:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Scan the QR code:
   - **iOS**: Use the built-in Camera app
   - **Android**: Use Expo Go's QR scanner

### Network Requirements
- Phone and computer must be on the same network
- If on different networks, use tunnel mode: `npx expo start --tunnel`

## Project Structure

```
mobile/
├── App.tsx                 # Main application entry point
├── app.json               # Expo configuration
├── babel.config.js        # Babel configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── src/
    ├── components/        # Reusable UI components
    ├── config/           # App configuration
    ├── contexts/         # React contexts (AuthContext)
    ├── navigation/       # Navigation configuration
    ├── screens/          # App screens
    ├── services/         # API services
    ├── stores/           # Zustand stores
    ├── theme.ts          # App theme configuration
    └── utils/            # Utility functions
```

## Key Features

- **Authentication**: JWT-based authentication with secure token storage
- **Dashboard**: Real-time analytics and metrics visualization
- **Referral Management**: Create, share, and track referral links
- **Push Notifications**: Real-time notifications for link activities
- **Social Sharing**: Share links via SMS, Email, WhatsApp, and social media
- **Analytics**: Track clicks, conversions, and performance metrics
- **QR Codes**: Generate and share QR codes for referral links

## Environment Configuration

The app connects to the backend API configured in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:5000/api"
    }
  }
}
```

For production, update the `apiUrl` to your production backend URL.

## Common Issues & Solutions

### Expo Go Timeout
**Problem**: App times out when loading in Expo Go
**Solution**: Use tunnel mode
```bash
npx expo start --tunnel
```

### Port Already in Use
**Problem**: Port 8081 is already in use
**Solution**: Use a different port
```bash
npx expo start --port 19001
```

### Metro Bundler Cache Issues
**Problem**: Old cached files causing errors
**Solution**: Clear cache and restart
```bash
npx expo start --clear
```

### Network Connection Issues
**Problem**: Phone can't connect to development server
**Solutions**:
1. Ensure both devices are on the same Wi-Fi network
2. Check firewall settings on your computer
3. Use tunnel mode: `npx expo start --tunnel`

### TypeScript Errors
**Problem**: TypeScript compilation errors
**Solution**: Check types are correctly installed
```bash
npm install --save-dev @types/react@~19.0.10 --legacy-peer-deps
npx tsc --noEmit  # Verify TypeScript compilation
```

## Building for Production

### Create Development Build
```bash
# For iOS (requires Apple Developer account)
eas build --platform ios --profile development

# For Android
eas build --platform android --profile development
```

### Create Production Build
```bash
# For iOS
eas build --platform ios --profile production

# For Android
eas build --platform android --profile production
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

## Recent Updates (January 2025)

### Dependency Updates
- Expo SDK updated to v53.0.20 (latest stable)
- React upgraded to v19.0.0
- React Native updated to v0.79.5
- Migrated from react-query v3 to TanStack Query v5
- TypeScript updated to v5.8.3
- All dependencies updated to latest compatible versions

### Breaking Changes Fixed
- Updated notification handler API for Expo SDK 53
- Fixed TanStack Query v5 migration (queryKey and queryFn syntax)
- Updated TypeScript types for React 19
- Removed incompatible @expo/webpack-config package

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Support

For issues or questions:
- Check the [main project documentation](../../CLAUDE.md)
- Open an issue in the project repository
- Contact the development team

## License

MIT License - See LICENSE file for details