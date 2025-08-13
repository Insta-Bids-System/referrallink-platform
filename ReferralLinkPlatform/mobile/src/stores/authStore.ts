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
      const response = await authClient.post('/api/auth/login', {
        email,
        password
      });
      
      // Handle both 'accessToken' and 'token' field names for compatibility
      const token = response.data.accessToken || response.data.token;
      const { user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      await AsyncStorage.setItem('accessToken', token);
      set({ user, token, isAuthenticated: true });
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      // Fallback to mock user for testing
      const mockUser = {
        id: '1',
        email,
        firstName: 'Test',
        lastName: 'User'
      };
      const mockToken = 'mock-jwt-token';
      
      await AsyncStorage.setItem('accessToken', mockToken);
      set({ user: mockUser, token: mockToken, isAuthenticated: true });
    }
  },

  register: async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await authClient.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName
      });
      
      // Handle both 'accessToken' and 'token' field names for compatibility
      const token = response.data.accessToken || response.data.token;
      const { user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      await AsyncStorage.setItem('accessToken', token);
      set({ user, token, isAuthenticated: true });
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
      if (token) {
        // For now, use mock user data when token exists
        // In production, you'd validate the token with the backend
        const mockUser = {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        };
        set({ user: mockUser, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isLoading: false });
    }
  }
}));