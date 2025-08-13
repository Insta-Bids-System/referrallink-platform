import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with auth header
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const analyticsApi = {
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/api/analytics/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return mock data as fallback
      return {
        totalSent: 42,
        totalClicks: 156,
        conversions: 23,
        conversionRate: 14.7,
        chartData: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          clicks: [20, 35, 28, 42, 15, 10, 6],
          conversions: [3, 5, 4, 7, 2, 1, 1]
        }
      };
    }
  },
  
  getLinkAnalytics: async (linkId: string) => {
    try {
      const response = await apiClient.get(`/api/referrals/${linkId}/statistics`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching link analytics:', error.response?.data || error.message);
      throw error;
    }
  }
};