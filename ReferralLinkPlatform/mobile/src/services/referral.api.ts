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

export const referralApi = {
  getUserLinks: async (options?: { limit?: number }) => {
    try {
      const response = await apiClient.get('/api/referrals', {
        params: options
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user links:', error);
      // Return mock data as fallback
      return [
        {
          id: '1',
          shortCode: 'abc123',
          clicks: 45,
          conversions: 5,
          originalUrl: 'https://example.com/product1'
        },
        {
          id: '2',
          shortCode: 'xyz789',
          clicks: 32,
          conversions: 3,
          originalUrl: 'https://example.com/product2'
        },
        {
          id: '3',
          shortCode: 'def456',
          clicks: 28,
          conversions: 2,
          originalUrl: 'https://example.com/product3'
        }
      ].slice(0, options?.limit);
    }
  },
  
  createLink: async (data: any) => {
    try {
      // The backend expects these fields for a referral link
      const requestData = {
        originalUrl: data.originalUrl || 'https://instabids.ai',
        customMessage: data.customMessage || '',
        metadata: data.metadata || {},
        expiresAt: data.expiresAt || null
      };
      
      const response = await apiClient.post('/api/referrals', requestData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating link:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getLinkDetails: async (linkId: string) => {
    try {
      const response = await apiClient.get(`/api/referrals/${linkId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching link details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  shareLink: async (data: {
    linkId: string;
    method: 'sms' | 'email' | 'whatsapp';
    recipient: string;
    message: string;
    contactName?: string;
  }) => {
    try {
      const response = await apiClient.post('/api/sharing/share', data);
      return response.data;
    } catch (error: any) {
      console.error('Error sharing link:', error.response?.data || error.message);
      throw error;
    }
  }
};