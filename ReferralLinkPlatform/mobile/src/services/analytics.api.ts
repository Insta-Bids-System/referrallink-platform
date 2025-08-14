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
      // Handle both wrapped and unwrapped responses
      const data = response.data.data || response.data;
      return {
        totalSent: data.totalSent || 0,
        totalClicks: data.totalClicks || 0,
        conversions: data.conversions || 0,
        conversionRate: data.conversionRate || 0,
        chartData: data.chartData || {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          clicks: [0, 0, 0, 0, 0, 0, 0],
          conversions: [0, 0, 0, 0, 0, 0, 0]
        }
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return empty data instead of mock data
      return {
        totalSent: 0,
        totalClicks: 0,
        conversions: 0,
        conversionRate: 0,
        chartData: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          clicks: [0, 0, 0, 0, 0, 0, 0],
          conversions: [0, 0, 0, 0, 0, 0, 0]
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