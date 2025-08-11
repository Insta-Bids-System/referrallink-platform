import { Router, Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analytics.service';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { query } from 'express-validator';
import { UserRole } from '../models/User.sequelize';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user analytics
router.get(
  '/user',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { startDate, endDate } = req.query;

      const analytics = await analyticsService.getUserAnalytics(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get platform-wide analytics (admin only)
router.get(
  '/platform',
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      const analytics = await analyticsService.getPlatformAnalytics(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }
);

// Export analytics data
router.post(
  '/export',
  [
    query('format').isIn(['csv', 'json', 'pdf']).withMessage('Invalid export format'),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { format, startDate, endDate } = req.query;

      const analytics = await analyticsService.getUserAnalytics(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      // Based on format, generate appropriate response
      switch (format) {
        case 'json':
          res.json(analytics);
          break;
        case 'csv':
          // Implement CSV generation
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
          // Convert analytics to CSV format
          res.send('CSV data here');
          break;
        case 'pdf':
          // Implement PDF generation
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=analytics.pdf');
          // Generate PDF
          res.send('PDF data here');
          break;
        default:
          res.status(400).json({ error: 'Invalid format' });
      }
    } catch (error) {
      next(error);
    }
  }
);

// Real-time analytics endpoint (WebSocket connection info)
router.get(
  '/realtime',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;

      res.json({
        success: true,
        data: {
          websocketUrl: `ws://${req.get('host')}/analytics`,
          userId,
          token: 'Use your auth token for WebSocket connection'
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;