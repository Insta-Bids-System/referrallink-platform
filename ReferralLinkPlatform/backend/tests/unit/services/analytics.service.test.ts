import analyticsService from '../../../src/services/analytics.service';
import { ReferralLink, Click, Conversion, User } from '../../../src/models';

jest.mock('../../../src/models');

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserAnalytics', () => {
    it('should return user analytics with correct metrics', async () => {
      const userId = 'test-user-id';
      const mockLinks = [
        { id: 'link1' },
        { id: 'link2' }
      ];

      (ReferralLink.findAll as jest.Mock).mockResolvedValue(mockLinks);
      (Click.count as jest.Mock).mockResolvedValueOnce(100); // total clicks
      (Click.count as jest.Mock).mockResolvedValueOnce(50); // unique clicks
      (Conversion.count as jest.Mock).mockResolvedValue(10);

      const result = await analyticsService.getUserAnalytics(userId);

      expect(result.summary.totalClicks).toBe(100);
      expect(result.summary.uniqueClicks).toBe(50);
      expect(result.summary.totalConversions).toBe(10);
      expect(result.summary.conversionRate).toBe('10.00');
      expect(result.summary.totalLinks).toBe(2);
    });

    it('should handle date filters correctly', async () => {
      const userId = 'test-user-id';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      (ReferralLink.findAll as jest.Mock).mockResolvedValue([]);
      (Click.count as jest.Mock).mockResolvedValue(0);
      (Conversion.count as jest.Mock).mockResolvedValue(0);

      await analyticsService.getUserAnalytics(userId, startDate, endDate);

      expect(Click.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clickedAt: expect.any(Object)
          })
        })
      );
    });

    it('should handle zero clicks gracefully', async () => {
      const userId = 'test-user-id';

      (ReferralLink.findAll as jest.Mock).mockResolvedValue([]);
      (Click.count as jest.Mock).mockResolvedValue(0);
      (Conversion.count as jest.Mock).mockResolvedValue(0);

      const result = await analyticsService.getUserAnalytics(userId);

      expect(result.summary.conversionRate).toBe('0.00');
    });
  });

  describe('getPlatformAnalytics', () => {
    it('should return platform-wide metrics', async () => {
      (User.count as jest.Mock).mockResolvedValueOnce(1000); // total users
      (ReferralLink.count as jest.Mock).mockResolvedValue(5000);
      (Click.count as jest.Mock).mockResolvedValue(10000);
      (Conversion.count as jest.Mock).mockResolvedValue(500);

      const result = await analyticsService.getPlatformAnalytics();

      expect(result.summary.totalUsers).toBe(1000);
      expect(result.summary.totalLinks).toBe(5000);
      expect(result.summary.totalClicks).toBe(10000);
      expect(result.summary.totalConversions).toBe(500);
      expect(result.summary.conversionRate).toBe(5);
    });
  });

  describe('trackEvent', () => {
    it('should log events correctly', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await analyticsService.trackEvent('click', 'user-123', { linkId: 'abc' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Tracking event:',
        expect.objectContaining({
          eventType: 'click',
          userId: 'user-123',
          metadata: { linkId: 'abc' }
        })
      );

      consoleSpy.mockRestore();
    });
  });
});