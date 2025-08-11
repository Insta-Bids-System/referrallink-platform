import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const analyticsApi = {
  getUserStats: async () => {
    // Mock data for now
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
  },
  
  getLinkAnalytics: async (linkId: string) => {
    // Mock API call
    const response = await axios.get(`${API_BASE_URL}/analytics/link/${linkId}`);
    return response.data;
  }
};