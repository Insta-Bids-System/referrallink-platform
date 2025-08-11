import request from 'supertest';
import express from 'express';
import { ReferralLink, Click, User } from '../../../src/models';
import referralRouter from '../../../src/routes/referral.routes';
import jwt from 'jsonwebtoken';

// Mock the models
jest.mock('../../../src/models');

const app = express();
app.use(express.json());
app.use('/api/referrals', referralRouter);

describe('Referral API Integration Tests', () => {
  let authToken: string;
  let mockUser: any;

  beforeEach(() => {
    mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'user'
    };

    authToken = jwt.sign(
      { userId: mockUser.id },
      process.env.JWT_SECRET || 'test-secret'
    );

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('POST /api/referrals', () => {
    it('should create a new referral link', async () => {
      const mockLink = {
        id: 'new-link-id',
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        userId: mockUser.id,
        fullUrl: 'http://localhost:5000/r/abc123',
        toJSON: () => ({
          id: 'new-link-id',
          shortCode: 'abc123',
          originalUrl: 'https://example.com'
        }),
        save: jest.fn()
      };

      (ReferralLink.findOne as jest.Mock).mockResolvedValue(null);
      (ReferralLink.create as jest.Mock).mockResolvedValue(mockLink);

      const response = await request(app)
        .post('/api/referrals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'https://example.com',
          customMessage: 'Check this out!'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shortCode).toBe('abc123');
    });

    it('should validate URL format', async () => {
      const response = await request(app)
        .post('/api/referrals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalUrl: 'not-a-valid-url'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/referrals')
        .send({
          originalUrl: 'https://example.com'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/referrals', () => {
    it('should return user referral links with pagination', async () => {
      const mockLinks = [
        {
          id: 'link1',
          shortCode: 'abc123',
          originalUrl: 'https://example1.com',
          fullUrl: 'http://localhost:5000/r/abc123',
          toJSON: () => ({ id: 'link1', shortCode: 'abc123' })
        }
      ];

      (ReferralLink.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockLinks
      });

      const response = await request(app)
        .get('/api/referrals')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.total).toBe(1);
    });

    it('should filter by active status', async () => {
      (ReferralLink.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: []
      });

      const response = await request(app)
        .get('/api/referrals')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ active: 'true' });

      expect(response.status).toBe(200);
      expect(ReferralLink.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true
          })
        })
      );
    });
  });

  describe('GET /r/:shortCode', () => {
    it('should track click and redirect', async () => {
      const mockLink = {
        id: 'link-id',
        shortCode: 'abc123',
        originalUrl: 'https://example.com',
        isActive: true,
        metadata: {},
        isExpired: () => false,
        updateStatistics: jest.fn()
      };

      (ReferralLink.findOne as jest.Mock).mockResolvedValue(mockLink);
      (Click.create as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .get('/r/abc123')
        .set('User-Agent', 'Mozilla/5.0');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('https://example.com');
      expect(Click.create).toHaveBeenCalled();
      expect(mockLink.updateStatistics).toHaveBeenCalled();
    });

    it('should handle expired links', async () => {
      const mockLink = {
        isExpired: () => true
      };

      (ReferralLink.findOne as jest.Mock).mockResolvedValue(mockLink);

      const response = await request(app)
        .get('/r/expired123');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('expired');
    });

    it('should handle non-existent links', async () => {
      (ReferralLink.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/r/notfound');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('404');
    });
  });

  describe('PUT /api/referrals/:id', () => {
    it('should update referral link', async () => {
      const mockLink = {
        id: 'link-id',
        userId: mockUser.id,
        customMessage: 'Old message',
        save: jest.fn(),
        toJSON: () => ({ id: 'link-id', customMessage: 'New message' }),
        fullUrl: 'http://localhost:5000/r/abc123'
      };

      (ReferralLink.findOne as jest.Mock).mockResolvedValue(mockLink);

      const response = await request(app)
        .put('/api/referrals/link-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customMessage: 'New message'
        });

      expect(response.status).toBe(200);
      expect(mockLink.save).toHaveBeenCalled();
    });

    it('should only allow owner to update', async () => {
      const mockLink = {
        id: 'link-id',
        userId: 'different-user-id'
      };

      (ReferralLink.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/referrals/link-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customMessage: 'New message'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/referrals/:id', () => {
    it('should soft delete referral link', async () => {
      const mockLink = {
        id: 'link-id',
        userId: mockUser.id,
        isActive: true,
        save: jest.fn()
      };

      (ReferralLink.findOne as jest.Mock).mockResolvedValue(mockLink);

      const response = await request(app)
        .delete('/api/referrals/link-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(mockLink.isActive).toBe(false);
      expect(mockLink.save).toHaveBeenCalled();
    });
  });

  describe('GET /api/referrals/:id/statistics', () => {
    it('should return link statistics', async () => {
      const mockLink = {
        id: 'link-id',
        userId: mockUser.id,
        statistics: {
          totalClicks: 100,
          uniqueClicks: 50,
          conversions: 10
        },
        updateStatistics: jest.fn(),
        getConversions: jest.fn().mockResolvedValue([])
      };

      (ReferralLink.findOne as jest.Mock).mockResolvedValue(mockLink);
      (Click.findAll as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/referrals/link-id/statistics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.statistics).toEqual(mockLink.statistics);
    });
  });
});