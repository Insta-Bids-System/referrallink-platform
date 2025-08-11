import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const referralApi = {
  getUserLinks: async (options?: { limit?: number }) => {
    // Mock data for now
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
  },
  
  createLink: async (data: any) => {
    const response = await axios.post(`${API_BASE_URL}/referrals/create`, data);
    return response.data;
  },
  
  getLinkDetails: async (linkId: string) => {
    const response = await axios.get(`${API_BASE_URL}/referrals/${linkId}`);
    return response.data;
  }
};