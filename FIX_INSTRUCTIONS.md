# Fix Instructions for ReferralLink Platform

## Issues Fixed:

### 1. ✅ Root URL Error (http://localhost:5000/)
**Problem:** Was showing "Access token required" error
**Solution:** Added a public landing page route in server.ts

**To apply the fix:**
1. Restart the backend server:
   ```bash
   # Stop the current server (Ctrl+C in the terminal running npm run dev)
   cd ReferralLinkPlatform/backend
   npm run dev
   ```

2. Test the fix:
   ```bash
   curl http://localhost:5000/
   ```
   You should now see a welcome message with API information.

### 2. ✅ Expo App Loading Issue
**Problem:** Expo app stuck on loading screen, request timed out
**Solutions Applied:**

1. **Updated CORS settings** to allow all origins in development mode
2. **Created API configuration** with proper IP addresses
3. **Added app.json** configuration file

**To fix Expo connection:**

1. **Find your local IP address:**
   ```bash
   ipconfig
   # Look for IPv4 Address (usually 192.168.x.x)
   ```

2. **Update the API config file:**
   Edit `ReferralLinkPlatform/mobile/src/config/api.config.ts`
   Change the LOCAL_IP to your IP address (currently set to 192.168.29.252)

3. **Restart Expo:**
   ```bash
   cd ReferralLinkPlatform/mobile
   # Clear cache and restart
   npx expo start -c
   ```

4. **When scanning QR code:**
   - Make sure your phone is on the same WiFi network as your computer
   - If using Expo Go app, ensure it's updated to latest version
   - Try typing the URL manually in Expo Go: exp://192.168.29.252:19000

### 3. Alternative: Use Web Version
If mobile still has issues, you can test in web browser:
```bash
cd ReferralLinkPlatform/mobile
npx expo start --web
```
This will open at http://localhost:19006

## Quick Test Commands:

### Test Backend API:
```bash
# Health check
curl http://localhost:5000/health

# Root URL (should show welcome message after restart)
curl http://localhost:5000/

# API test endpoint
curl http://localhost:5000/api/test
```

### Test with Local IP (for mobile):
```bash
# Replace with your IP
curl http://192.168.29.252:5000/health
```

## Current Running Services:

1. **Backend API**: http://localhost:5000 ✅
2. **Expo DevTools**: http://localhost:19002 ✅
3. **Observability Dashboard**: File opened in browser ✅

## Troubleshooting:

### If Expo still times out:
1. **Firewall**: Windows Firewall might block the connection
   - Allow Node.js through Windows Firewall
   - Temporarily disable firewall to test

2. **Use USB debugging instead of WiFi:**
   ```bash
   # For Android
   adb reverse tcp:5000 tcp:5000
   npx expo start --localhost --android
   ```

3. **Use tunnel mode (slower but works through firewalls):**
   ```bash
   npx expo start --tunnel
   ```

### If backend changes don't apply:
The backend uses nodemon and should auto-restart, but if not:
1. Stop the server (Ctrl+C)
2. Start again: `npm run dev`

## Next Steps:
1. Restart the backend to apply the root URL fix
2. Update the mobile app's API config with your IP
3. Try connecting with Expo again
4. If mobile doesn't work, use the web version for testing