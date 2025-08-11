import { Router } from 'express';
import { SupabaseReferralController } from '../controllers/referral.supabase.controller';
import { authenticateSupabase } from '../middleware/auth.supabase';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();

// Public route for handling clicks
router.get('/r/:shortCode', SupabaseReferralController.handleClick);

// Protected routes (require authentication)
router.use(authenticateSupabase);

// Create a new referral link (simplified - no URL or expiration needed)
router.post(
  '/',
  [
    body('customMessage').optional().isString(),
    body('tags').optional().isArray(),
    body('trackClicks').optional().isBoolean(),
    body('enableQR').optional().isBoolean()
  ],
  validateRequest,
  SupabaseReferralController.createLink
);

// Get user's primary link
router.get('/primary', SupabaseReferralController.getPrimaryLink);

// Refresh expired link
router.post('/refresh', SupabaseReferralController.refreshLink);

// Get all referral links for the authenticated user
router.get('/', SupabaseReferralController.getUserLinks);

// Get statistics for a referral link
router.get(
  '/:linkId/statistics',
  [
    param('linkId').isUUID()
  ],
  validateRequest,
  SupabaseReferralController.getLinkStatistics
);

// Note: Update functionality removed - links are immutable except for deletion
// Users should refresh their link to get a new one

// Delete a referral link
router.delete(
  '/:linkId',
  [
    param('linkId').isUUID()
  ],
  validateRequest,
  SupabaseReferralController.deleteLink
);


export default router;