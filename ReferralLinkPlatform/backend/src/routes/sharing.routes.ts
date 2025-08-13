import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Share tracking data structure
interface ShareRecord {
  id: string;
  linkId: string;
  userId: string;
  method: 'sms' | 'email' | 'whatsapp';
  recipient: string;
  contactName?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
  clickedAt?: Date;
  convertedAt?: Date;
}

// In-memory store for shares (in production, use database)
const shares: ShareRecord[] = [];

// Share a referral link with a single contact
router.post('/share', authenticateToken as any, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { linkId, method, recipient, message, contactName } = req.body;
    const userId = req.user?.userId;

    if (!linkId || !method || !recipient || !message) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Create share record
    const shareRecord: ShareRecord = {
      id: Math.random().toString(36).substring(7),
      linkId,
      userId,
      method,
      recipient,
      contactName,
      message,
      status: 'pending',
      sentAt: new Date()
    };

    // Simulate sending (in production, integrate with Twilio/SendGrid)
    try {
      switch (method) {
        case 'sms':
        case 'whatsapp':
          // TODO: Integrate with Twilio
          console.log(`Sending ${method} to ${recipient}:`, message);
          shareRecord.status = 'sent';
          break;
        case 'email':
          // TODO: Integrate with SendGrid
          console.log(`Sending email to ${recipient}:`, message);
          shareRecord.status = 'sent';
          break;
        default:
          throw new Error('Invalid share method');
      }
    } catch (error) {
      shareRecord.status = 'failed';
      shareRecord.error = error instanceof Error ? error.message : 'Unknown error';
    }

    shares.push(shareRecord);

    return res.status(201).json({
      message: 'Share processed',
      share: shareRecord
    });
  } catch (error) {
    console.error('Share error:', error);
    return res.status(500).json({
      error: 'Failed to share link'
    });
  }
});

// Bulk share endpoint
router.post('/bulk-share', authenticateToken as any, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { linkId, method, recipients, message } = req.body;
    const userId = req.user?.userId;

    if (!linkId || !method || !recipients || !Array.isArray(recipients) || !message) {
      return res.status(400).json({
        error: 'Missing required fields or invalid recipients array'
      });
    }

    const results = [];
    
    for (const recipient of recipients) {
      const shareRecord: ShareRecord = {
        id: Math.random().toString(36).substring(7),
        linkId,
        userId,
        method,
        recipient: recipient.contact,
        contactName: recipient.name,
        message,
        status: 'pending',
        sentAt: new Date()
      };

      // Simulate sending with rate limiting
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay between sends
      
      try {
        // TODO: Actual implementation with Twilio/SendGrid
        console.log(`Sending ${method} to ${recipient.contact}:`, message);
        shareRecord.status = 'sent';
      } catch (error) {
        shareRecord.status = 'failed';
        shareRecord.error = error instanceof Error ? error.message : 'Unknown error';
      }

      shares.push(shareRecord);
      results.push({
        recipient: recipient.contact,
        name: recipient.name,
        status: shareRecord.status,
        error: shareRecord.error
      });
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failCount = results.filter(r => r.status === 'failed').length;

    return res.status(201).json({
      message: `Shared with ${successCount} contacts, ${failCount} failed`,
      results,
      summary: {
        total: recipients.length,
        successful: successCount,
        failed: failCount
      }
    });
  } catch (error) {
    console.error('Bulk share error:', error);
    return res.status(500).json({
      error: 'Failed to perform bulk share'
    });
  }
});

// Get share history for a link
router.get('/link/:linkId/shares', authenticateToken as any, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { linkId } = req.params;
    const userId = req.user?.userId;

    const linkShares = shares.filter(s => s.linkId === linkId && s.userId === userId);

    return res.json({
      shares: linkShares,
      total: linkShares.length,
      sent: linkShares.filter(s => s.status === 'sent').length,
      failed: linkShares.filter(s => s.status === 'failed').length,
      clicked: linkShares.filter(s => s.clickedAt).length,
      converted: linkShares.filter(s => s.convertedAt).length
    });
  } catch (error) {
    console.error('Get shares error:', error);
    return res.status(500).json({
      error: 'Failed to get share history'
    });
  }
});

// Get all shares for the user
router.get('/my-shares', authenticateToken as any, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const userShares = shares.filter(s => s.userId === userId);

    // Group by method
    const byMethod = {
      sms: userShares.filter(s => s.method === 'sms').length,
      email: userShares.filter(s => s.method === 'email').length,
      whatsapp: userShares.filter(s => s.method === 'whatsapp').length
    };

    // Group by status
    const byStatus = {
      sent: userShares.filter(s => s.status === 'sent').length,
      failed: userShares.filter(s => s.status === 'failed').length,
      pending: userShares.filter(s => s.status === 'pending').length
    };

    return res.json({
      shares: userShares,
      total: userShares.length,
      byMethod,
      byStatus,
      engagement: {
        clicked: userShares.filter(s => s.clickedAt).length,
        converted: userShares.filter(s => s.convertedAt).length
      }
    });
  } catch (error) {
    console.error('Get my shares error:', error);
    return res.status(500).json({
      error: 'Failed to get share history'
    });
  }
});

// Track when a shared link is clicked
router.post('/track-click', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { shareId } = req.body;

    const share = shares.find(s => s.id === shareId);
    if (share && !share.clickedAt) {
      share.clickedAt = new Date();
    }

    return res.json({
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Track click error:', error);
    return res.status(500).json({
      error: 'Failed to track click'
    });
  }
});

// Track when a shared link converts
router.post('/track-conversion', async (req: Request, res: Response): Promise<Response> => {
  try {
    const { shareId } = req.body;

    const share = shares.find(s => s.id === shareId);
    if (share && !share.convertedAt) {
      share.convertedAt = new Date();
    }

    return res.json({
      message: 'Conversion tracked'
    });
  } catch (error) {
    console.error('Track conversion error:', error);
    return res.status(500).json({
      error: 'Failed to track conversion'
    });
  }
});

export default router;