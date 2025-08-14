import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config/api.config';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

// Create axios instance for auth
const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setToken: async (token) => {
    if (token) {
      await AsyncStorage.setItem('accessToken', token);
    } else {
      await AsyncStorage.removeItem('accessToken');
    }
    set({ token });
  },

  login: async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const response = await authClient.post('/api/auth/login', {
        email,
        password
      });
      
      console.log('Login response received:', response.data);
      
      // Handle both 'accessToken' and 'token' field names for compatibility
      const token = response.data.accessToken || response.data.token;
      const { user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      console.log('Storing token in AsyncStorage:', token.substring(0, 20) + '...');
      await AsyncStorage.setItem('accessToken', token);
      
      // Verify it was stored
      const storedToken = await AsyncStorage.getItem('accessToken');
      console.log('Token verification - stored successfully:', storedToken === token);
      
      set({ user, token, isAuthenticated: true });
      console.log('Auth state updated successfully');
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      
      // Don't use mock fallback - throw the error instead
      throw error;
    }
  },

  register: async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('Attempting registration for:', email);
      const response = await authClient.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName
      });
      
      console.log('Registration response received:', response.data);
      
      // Handle both 'accessToken' and 'token' field names for compatibility
      const token = response.data.accessToken || response.data.token;
      const { user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      console.log('Storing token in AsyncStorage:', token.substring(0, 20) + '...');
      await AsyncStorage.setItem('accessToken', token);
      
      // Verify it was stored
      const storedToken = await AsyncStorage.getItem('accessToken');
      console.log('Token verification - stored successfully:', storedToken === token);
      
      set({ user, token, isAuthenticated: true });
      console.log('Auth state updated successfully');
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    set({ user: null, token: null, isAuthenticated: false });
  },

  initializeAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Initialize auth - checking for stored token:', token ? 'Found' : 'Not found');
      
      if (token) {
        // For now, just set the token and mark as authenticated
        // In production, you'd validate the token with the backend
        console.log('Found stored token, marking as authenticated');
        set({ 
          token, 
          isAuthenticated: true, 
          isLoading: false,
          // We don't have user data, but that's okay for now
          user: null
        });
      } else {
        console.log('No stored token, user needs to login');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isLoading: false });
    }
  }
}));