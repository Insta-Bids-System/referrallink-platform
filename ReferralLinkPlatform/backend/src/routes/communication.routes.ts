import { Router, Request, Response, NextFunction } from 'express';
import communicationService from '../services/communication.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Send single message
router.post(
  '/send',
  [
    body('recipient').isObject().withMessage('Recipient object required'),
    body('recipient.name').isString().notEmpty(),
    body('recipient.phoneNumber').optional().isMobilePhone('any'),
    body('recipient.email').optional().isEmail(),
    body('recipient.whatsappNumber').optional().isMobilePhone('any'),
    body('referralLinkId').isUUID(),
    body('messageType').isIn(['sms', 'email', 'whatsapp']),
    body('customMessage').optional().isString(),
    body('useAI').optional().isBoolean()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { recipient, referralLinkId, messageType } = req.body;

      const result = await communicationService.sendReferralNotification(
        userId,
        referralLinkId,
        recipient,
        messageType
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// Send bulk messages
router.post(
  '/bulk',
  [
    body('recipients').isArray({ min: 1, max: 100 }).withMessage('Recipients array required (1-100 items)'),
    body('recipients.*.name').isString().notEmpty(),
    body('recipients.*.phoneNumber').optional().isMobilePhone('any'),
    body('recipients.*.email').optional().isEmail(),
    body('recipients.*.whatsappNumber').optional().isMobilePhone('any'),
    body('referralLinkId').isUUID(),
    body('messageType').isIn(['sms', 'email', 'whatsapp']),
    body('customMessage').optional().isString(),
    body('useAI').optional().isBoolean()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const request = req.body;

      const results = await communicationService.sendBulkMessages(userId, request);

      const summary = {
        total: results.length,
        sent: results.filter(r => r.status === 'sent').length,
        failed: results.filter(r => r.status === 'failed').length,
        pending: results.filter(r => r.status === 'pending').length
      };

      res.json({
        success: true,
        data: {
          summary,
          results
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Send test message
router.post(
  '/test',
  [
    body('messageType').isIn(['sms', 'email', 'whatsapp']),
    body('phoneNumber').optional().isMobilePhone('any'),
    body('email').optional().isEmail(),
    body('whatsappNumber').optional().isMobilePhone('any'),
    body('message').isString().notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageType, phoneNumber, email, whatsappNumber, message } = req.body;
      let result;

      switch (messageType) {
        case 'sms':
          if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number required for SMS' });
          }
          result = await communicationService.sendSMS(phoneNumber, message);
          break;
        case 'email':
          if (!email) {
            return res.status(400).json({ error: 'Email required for email message' });
          }
          result = await communicationService.sendEmail(
            email,
            'Test Message',
            message
          );
          break;
        case 'whatsapp':
          if (!whatsappNumber) {
            return res.status(400).json({ error: 'WhatsApp number required' });
          }
          result = await communicationService.sendWhatsApp(whatsappNumber, message);
          break;
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

// Validate phone number
router.post(
  '/validate-phone',
  [
    body('phoneNumber').isMobilePhone('any')
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber } = req.body;
      
      const isValid = await communicationService.validatePhoneNumber(phoneNumber);

      res.json({
        success: true,
        data: {
          phoneNumber,
          isValid
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get message status
router.get(
  '/status/:messageId',
  [
    param('messageId').isString().notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { messageId } = req.params;
      const { provider = 'twilio' } = req.query;
      
      const status = await communicationService.getMessageStatus(
        messageId,
        provider as 'twilio' | 'sendgrid'
      );

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get communication templates
router.get(
  '/templates',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templates = {
        sms: [
          {
            id: 'sms-1',
            name: 'Quick Share',
            template: 'Hi {name}! Check out {product}: {link}',
            characterCount: 40
          },
          {
            id: 'sms-2',
            name: 'Personal Recommendation',
            template: 'Hey {name}, I think you\'d love {product}. Here\'s my referral link: {link}',
            characterCount: 75
          }
        ],
        email: [
          {
            id: 'email-1',
            name: 'Professional',
            subject: 'Recommendation: {product}',
            template: 'Dear {name},\n\nI wanted to share {product} with you...\n\n{link}'
          },
          {
            id: 'email-2',
            name: 'Casual',
            subject: 'Check this out!',
            template: 'Hey {name}!\n\nFound something awesome...\n\n{link}'
          }
        ],
        whatsapp: [
          {
            id: 'wa-1',
            name: 'Friendly',
            template: 'Hey {name}! 👋\n\nCheck out {product}: {link}'
          },
          {
            id: 'wa-2',
            name: 'Detailed',
            template: 'Hi {name},\n\nI\'ve been using {product} and it\'s amazing!\n\n{link}'
          }
        ]
      };

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;