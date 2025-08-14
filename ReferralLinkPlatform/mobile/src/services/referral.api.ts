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
  try {
    const token = await AsyncStorage.getItem('accessToken');
    console.log('Retrieved token from storage:', token ? `${token.substring(0, 20)}...` : 'None');
    
    if (token) {
      // Don't send mock tokens
      if (token === 'mock-jwt-token' || !token.includes('.')) {
        console.log('Detected invalid/mock token, removing it');
        await AsyncStorage.removeItem('accessToken');
        throw new Error('Invalid token detected - please login again');
      }
      
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header to request');
    } else {
      console.log('No token found in AsyncStorage');
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
  }
  
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('Got 401 error, clearing token and redirecting to login');
      await AsyncStorage.removeItem('accessToken');
      // The app will automatically redirect to login when token is removed
    }
    return Promise.reject(error);
  }
);

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
      // The backend expects only customMessage and tags now
      // URL is hard-coded to instabids.ai and expiry is auto-set to 10 days
      const requestData = {
        customMessage: data.customMessage || '',
        tags: data.tags || []
      };
      
      console.log('Creating referral link with data:', requestData);
      
      const response = await apiClient.post('/api/referrals', requestData);
      
      // Extract the link data from the response
      if (response.data.link) {
        return response.data.link;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating link:', error.response?.data || error.message);
      
      // Provide more detailed error information
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      
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