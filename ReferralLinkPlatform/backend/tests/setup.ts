import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

// Mock external services
jest.mock('../src/services/ai.service');
jest.mock('../src/services/communication.service');
jest.mock('../src/services/payment.service');

// Increase timeout for integration tests
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.createMockUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  isActive: true,
  isVerified: true,
  profile: {},
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    defaultMessageChannel: 'email',
    language: 'en',
    timezone: 'UTC'
  }
});

global.createMockReferralLink = () => ({
  id: 'test-link-id',
  userId: 'test-user-id',
  shortCode: 'abc123',
  originalUrl: 'https://example.com',
  metadata: {},
  statistics: {
    totalClicks: 0,
    uniqueClicks: 0,
    conversions: 0,
    conversionRate: 0,
    clicksByCountry: {},
    clicksByDevice: {
      mobile: 0,
      desktop: 0,
      tablet: 0,
      other: 0
    },
    clicksByChannel: {}
  },
  isActive: true
});