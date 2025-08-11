import { Router, Request, Response, NextFunction } from 'express';
import paymentService from '../services/payment.service';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();

// Webhook endpoint (no auth required)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      await paymentService.handleWebhook(signature, req.body);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }
);

// All other routes require authentication
router.use(authenticateToken);

// Get available plans
router.get('/plans', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = paymentService.getPlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
});

// Get current subscription
router.get('/subscription', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    res.json({
      success: true,
      data: {
        planId: user.profile?.planId || 'free',
        status: user.profile?.subscriptionStatus || 'none',
        currentPeriodEnd: user.profile?.currentPeriodEnd
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create subscription
router.post(
  '/subscription',
  [
    body('planId').isString().notEmpty(),
    body('paymentMethodId').optional().isString()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { planId, paymentMethodId } = req.body;

      const subscription = await paymentService.createSubscription(
        userId,
        planId,
        paymentMethodId
      );

      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update subscription
router.put(
  '/subscription',
  [
    body('planId').isString().notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { planId } = req.body;

      const subscription = await paymentService.updateSubscription(userId, planId);

      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  }
);

// Cancel subscription
router.delete(
  '/subscription',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;

      await paymentService.cancelSubscription(userId);

      res.json({
        success: true,
        message: 'Subscription will be canceled at the end of the billing period'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get payment methods
router.get('/payment-methods', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    
    const paymentMethods = await paymentService.getPaymentMethods(userId);

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    next(error);
  }
});

// Add payment method
router.post(
  '/payment-methods',
  [
    body('paymentMethodId').isString().notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { paymentMethodId } = req.body;

      await paymentService.addPaymentMethod(userId, paymentMethodId);

      res.json({
        success: true,
        message: 'Payment method added successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Remove payment method
router.delete(
  '/payment-methods/:paymentMethodId',
  [
    param('paymentMethodId').isString().notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentMethodId } = req.params;

      await paymentService.removePaymentMethod(paymentMethodId);

      res.json({
        success: true,
        message: 'Payment method removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get invoices
router.get('/invoices', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    
    const invoices = await paymentService.getInvoices(userId);

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
});

// Create checkout session
router.post(
  '/checkout',
  [
    body('planId').isString().notEmpty(),
    body('successUrl').isURL(),
    body('cancelUrl').isURL()
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { planId, successUrl, cancelUrl } = req.body;

      const checkoutUrl = await paymentService.createCheckoutSession(
        userId,
        planId,
        successUrl,
        cancelUrl
      );

      res.json({
        success: true,
        data: { checkoutUrl }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Check usage limits
router.get(
  '/usage/:feature',
  [
    param('feature').isIn(['referralLinks', 'messages', 'aiMessages'])
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { feature } = req.params;

      const allowed = await paymentService.checkUsageLimits(userId, feature);

      res.json({
        success: true,
        data: { allowed }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Fix for express import
import express from 'express';

export default router;