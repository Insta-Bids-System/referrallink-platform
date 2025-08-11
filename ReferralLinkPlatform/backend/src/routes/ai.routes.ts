import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateSupabase } from '../middleware/auth.supabase';
import { validateRequest } from '../middleware/validation.middleware';
import { body, query } from 'express-validator';

const router = Router();

// All AI routes require authentication
router.use(authenticateSupabase);

// Analyze writing style from social posts
router.post(
  '/analyze-style',
  [
    body('posts').isArray().withMessage('Posts array required'),
    body('posts.*.content').notEmpty().withMessage('Post content required'),
    body('posts.*.platform').optional().isIn(['facebook', 'twitter', 'linkedin', 'instagram'])
  ],
  validateRequest,
  AIController.analyzeWritingStyle
);

// Generate multiple message variations
router.post(
  '/generate-messages',
  [
    body('platform').optional().isIn(['sms', 'email', 'whatsapp', 'facebook', 'twitter', 'linkedin']),
    body('recipientName').optional().isString(),
    body('customContext').optional().isString(),
    body('tone').optional().isIn(['friendly', 'professional', 'casual', 'enthusiastic']),
    body('count').optional().isInt({ min: 1, max: 10 })
  ],
  validateRequest,
  AIController.generateMessages
);

// Generate a single optimized message
router.post(
  '/generate-single',
  [
    body('platform').optional().isIn(['sms', 'email', 'whatsapp', 'facebook', 'twitter', 'linkedin']),
    body('recipientName').optional().isString(),
    body('customContext').optional().isString(),
    body('tone').optional().isIn(['friendly', 'professional', 'casual', 'enthusiastic'])
  ],
  validateRequest,
  AIController.generateSingleMessage
);

// Generate multiple message variations (legacy endpoint)
router.post(
  '/generate-variations',
  [
    body('platform').optional().isIn(['sms', 'email', 'whatsapp', 'facebook', 'twitter', 'linkedin']),
    body('recipientName').optional().isString(),
    body('customContext').optional().isString(),
    body('count').optional().isInt({ min: 1, max: 10 })
  ],
  validateRequest,
  AIController.generateMessages
);

// Improve an existing message
router.post(
  '/improve-message',
  [
    body('originalMessage').notEmpty().withMessage('Original message required'),
    body('feedback').notEmpty().withMessage('Feedback required'),
    body('platform').optional().isIn(['sms', 'email', 'whatsapp', 'facebook', 'twitter', 'linkedin'])
  ],
  validateRequest,
  AIController.improveMessage
);

// Save message selection for learning
router.post(
  '/save-selection',
  [
    body('messageId').notEmpty().withMessage('Message ID required'),
    body('message').isObject().withMessage('Message object required'),
    body('selected').isBoolean().withMessage('Selection status required')
  ],
  validateRequest,
  AIController.saveMessageSelection
);

// Update writing style with new posts
router.put(
  '/writing-style',
  [
    body('posts').isArray().withMessage('Posts array required'),
    body('posts.*.content').notEmpty().withMessage('Post content required')
  ],
  validateRequest,
  AIController.updateWritingStyle
);

// Get user's writing style
router.get('/writing-style', AIController.getWritingStyle);

// Get message templates for a platform
router.get(
  '/templates',
  [
    query('platform').optional().isIn(['sms', 'email', 'whatsapp', 'facebook', 'twitter', 'linkedin'])
  ],
  validateRequest,
  AIController.getMessageTemplates
);

// Legacy endpoints for compatibility
router.post('/generate-message', AIController.generateSingleMessage);
router.get('/preferences', AIController.getWritingStyle);

export default router;