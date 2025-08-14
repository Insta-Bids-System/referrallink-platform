import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import AdminAnalyticsController from '../controllers/admin.analytics.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';
import { UserRole } from '../models/User.sequelize';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// Analytics routes (accessible by all authenticated users for their own data)
router.get('/analytics/platform', AdminAnalyticsController.getPlatformAnalytics);
router.get('/analytics/user/:userId', AdminAnalyticsController.getUserAnalytics);
router.get('/analytics/clicks', AdminAnalyticsController.getAllClicks);

// Require admin role for management routes
router.use(authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// User Management Routes
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('role').optional().isIn(Object.values(UserRole)),
    query('isActive').optional().isBoolean(),
    query('sortBy').optional().isIn(['createdAt', 'email', 'firstName', 'lastName']),
    query('sortOrder').optional().isIn(['ASC', 'DESC'])
  ],
  validateRequest,
  adminController.getUsers
);

router.get(
  '/users/:userId',
  [
    param('userId').isUUID()
  ],
  validateRequest,
  adminController.getUserDetails
);

router.put(
  '/users/:userId',
  [
    param('userId').isUUID(),
    body('isActive').optional().isBoolean(),
    body('isVerified').optional().isBoolean(),
    body('role').optional().isIn(Object.values(UserRole)),
    body('preferences').optional().isObject()
  ],
  validateRequest,
  adminController.updateUser
);

router.delete(
  '/users/:userId',
  [
    param('userId').isUUID(),
    query('hardDelete').optional().isBoolean()
  ],
  validateRequest,
  adminController.deleteUser
);

// Platform Monitoring Routes
router.get('/metrics', adminController.getPlatformMetrics);
router.get('/health', adminController.getSystemHealth);

// Content Moderation Routes
router.get(
  '/moderation/flagged',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('type').optional().isIn(['all', 'links', 'messages'])
  ],
  validateRequest,
  adminController.getFlaggedContent
);

router.post(
  '/moderation/:contentId',
  [
    param('contentId').isUUID(),
    body('action').isIn(['approve', 'remove', 'flag']),
    body('reason').optional().isString()
  ],
  validateRequest,
  adminController.moderateContent
);

// Revenue Tracking Routes
router.get(
  '/revenue',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validateRequest,
  adminController.getRevenueMetrics
);

// System Configuration Routes
router.get('/config', adminController.getSystemConfig);

router.put(
  '/config',
  authorizeRoles(UserRole.SUPER_ADMIN), // Only super admin can change config
  [
    body('limits').optional().isObject(),
    body('pricing').optional().isObject()
  ],
  validateRequest,
  adminController.updateSystemConfig
);

// Report Generation Routes
router.get(
  '/reports',
  [
    query('reportType').isIn(['users', 'revenue', 'engagement']),
    query('startDate').isISO8601(),
    query('endDate').isISO8601(),
    query('format').optional().isIn(['json', 'csv', 'pdf'])
  ],
  validateRequest,
  adminController.generateReport
);

export default router;