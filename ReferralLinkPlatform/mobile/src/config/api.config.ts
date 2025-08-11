// API Configuration
// For Expo development, use your computer's local IP address
// You can find this by running 'ipconfig' on Windows or 'ifconfig' on Mac/Linux

const API_CONFIG = {
  // Change this to your computer's IP address when testing on physical device
  // Use 'localhost' or '127.0.0.1' when testing on web browser
  // Use '10.0.2.2' for Android emulator
  
  // Your local IP address (update this based on your network)
  LOCAL_IP: '192.168.29.252',
  
  // API endpoints
  getBaseUrl: () => {
    // Always use Railway backend
    return 'https://referrallink-platform-production.up.railway.app';
  }
};

export const API_BASE_URL = API_CONFIG.getBaseUrl();
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  
  // Referrals
  REFERRALS: `${API_BASE_URL}/api/referrals`,
  REFERRAL_DETAILS: (id: string) => `${API_BASE_URL}/api/referrals/${id}`,
  REFERRAL_STATS: (id: string) => `${API_BASE_URL}/api/referrals/${id}/statistics`,
  
  // Analytics
  USER_ANALYTICS: `${API_BASE_URL}/api/analytics/user`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`
};

export default API_CONFIG;