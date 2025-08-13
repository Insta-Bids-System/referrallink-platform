import { Request, Response } from 'express';
import { SupabaseReferralLinkService } from '../services/supabase/referralLink.service';
import { AuthRequest } from '../middleware/auth.supabase';

export class SupabaseReferralController {
  /**
   * Create a new referral link (one per user, auto-expires in 10 days)
   */
  static async createLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Handle both JWT auth (req.user) and Supabase auth (req.userId)
      const userId = req.userId || req.user?.id || req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { customMessage, tags } = req.body;

      // Check if user already has an active primary link
      const existingLink = await SupabaseReferralLinkService.getPrimaryLink(userId);
      
      if (existingLink && existingLink.is_active) {
        // Return existing link instead of creating a new one
        res.json({
          message: 'You already have an active referral link',
          link: {
            id: existingLink.id,
            shortCode: existingLink.short_code,
            url: `${process.env.BASE_URL}/r/${existingLink.short_code}`,
            destinationUrl: process.env.COMPANY_URL || 'https://instabids.ai',
            customMessage: existingLink.custom_message,
            qrCode: existingLink.qr_code,
            expiresAt: existingLink.expires_at,
            createdAt: existingLink.created_at,
            statistics: existingLink.statistics
          }
        });
        return;
      }

      // Create new link with hard-coded URL and 10-day expiry
      const metadata = {
        tags: tags || [],
        trackClicks: true,
        enableQR: true
      };

      const link = await SupabaseReferralLinkService.createReferralLink(
        userId,
        customMessage,
        metadata
      );

      res.status(201).json({
        message: 'Referral link created successfully',
        link: {
          id: link.id,
          shortCode: link.short_code,
          url: `${process.env.BASE_URL}/r/${link.short_code}`,
          destinationUrl: process.env.COMPANY_URL || 'https://instabids.ai',
          customMessage: link.custom_message,
          qrCode: link.qr_code,
          expiresAt: link.expires_at,
          createdAt: link.created_at
        }
      });
    } catch (error: any) {
      console.error('Error creating referral link:', error);
      res.status(500).json({ error: error.message || 'Failed to create referral link' });
    }
  }

  /**
   * Get user's referral links
   */
  static async getUserLinks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId || req.user?.id || req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const links = await SupabaseReferralLinkService.getUserLinks(userId);

      res.json({
        links: links.map(link => ({
          id: link.id,
          shortCode: link.short_code,
          url: `${process.env.BASE_URL}/r/${link.short_code}`,
          destinationUrl: process.env.COMPANY_URL || 'https://instabids.ai',
          customMessage: link.custom_message,
          qrCode: link.qr_code,
          expiresAt: link.expires_at,
          isActive: link.is_active,
          isPrimary: link.is_primary,
          statistics: link.statistics,
          createdAt: link.created_at
        }))
      });
    } catch (error: any) {
      console.error('Error getting user links:', error);
      res.status(500).json({ error: 'Failed to get referral links' });
    }
  }

  /**
   * Get user's primary referral link
   */
  static async getPrimaryLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId || req.user?.id || req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const link = await SupabaseReferralLinkService.getPrimaryLink(userId);

      if (!link) {
        res.status(404).json({ 
          error: 'No active primary link found',
          message: 'Create a new link to get started'
        });
        return;
      }

      res.json({
        link: {
          id: link.id,
          shortCode: link.short_code,
          url: `${process.env.BASE_URL}/r/${link.short_code}`,
          destinationUrl: process.env.COMPANY_URL || 'https://instabids.ai',
          customMessage: link.custom_message,
          qrCode: link.qr_code,
          expiresAt: link.expires_at,
          statistics: link.statistics,
          createdAt: link.created_at
        }
      });
    } catch (error: any) {
      console.error('Error getting primary link:', error);
      res.status(500).json({ error: 'Failed to get primary link' });
    }
  }

  /**
   * Refresh expired link (creates a new one)
   */
  static async refreshLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId || req.user?.id || req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const link = await SupabaseReferralLinkService.refreshLink(userId);

      res.json({
        message: 'Link refreshed successfully',
        link: {
          id: link.id,
          shortCode: link.short_code,
          url: `${process.env.BASE_URL}/r/${link.short_code}`,
          destinationUrl: process.env.COMPANY_URL || 'https://instabids.ai',
          customMessage: link.custom_message,
          qrCode: link.qr_code,
          expiresAt: link.expires_at,
          createdAt: link.created_at
        }
      });
    } catch (error: any) {
      console.error('Error refreshing link:', error);
      res.status(500).json({ error: 'Failed to refresh link' });
    }
  }

  /**
   * Handle click redirect
   */
  static async handleClick(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode } = req.params;

      const link = await SupabaseReferralLinkService.getLinkByShortCode(shortCode);

      if (!link) {
        res.status(404).redirect(process.env.REDIRECT_404_URL || '/404');
        return;
      }

      if (!link.is_active || (link.expires_at && new Date(link.expires_at) < new Date())) {
        res.redirect(process.env.REDIRECT_EXPIRED_URL || '/expired');
        return;
      }

      // Track click
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const referer = req.headers.referer || req.headers.referrer;

      // Parse user agent for device info (simplified)
      const device = userAgent.toLowerCase().includes('mobile') ? 'mobile' : 
                    userAgent.toLowerCase().includes('tablet') ? 'tablet' : 'desktop';

      await SupabaseReferralLinkService.trackClick(link.id, {
        ip_address: ipAddress,
        user_agent: userAgent,
        referer: referer as string | undefined,
        device,
        metadata: {
          query: req.query,
          headers: {
            'accept-language': req.headers['accept-language'],
            'accept-encoding': req.headers['accept-encoding']
          }
        }
      });

      // Redirect to company URL
      const destinationUrl = process.env.COMPANY_URL || 'https://instabids.ai';
      
      // Append any query parameters from the request
      const url = new URL(destinationUrl);
      Object.keys(req.query).forEach(key => {
        url.searchParams.append(key, req.query[key] as string);
      });
      
      // Add referral tracking parameter
      url.searchParams.append('ref', shortCode);
      url.searchParams.append('source', 'referral');

      res.redirect(url.toString());
    } catch (error: any) {
      console.error('Error handling click:', error);
      res.redirect(process.env.REDIRECT_ERROR_URL || '/error');
    }
  }

  /**
   * Get link statistics
   */
  static async getLinkStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId || req.user?.id || req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { linkId } = req.params;

      // Verify user owns the link
      const links = await SupabaseReferralLinkService.getUserLinks(userId);
      const link = links.find(l => l.id === linkId);

      if (!link) {
        res.status(404).json({ error: 'Link not found' });
        return;
      }

      res.json({
        statistics: {
          ...link.statistics,
          linkId: link.id,
          shortCode: link.short_code,
          createdAt: link.created_at,
          expiresAt: link.expires_at,
          isActive: link.is_active
        }
      });
    } catch (error: any) {
      console.error('Error getting link statistics:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  }

  /**
   * Delete referral link
   */
  static async deleteLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId || req.user?.id || req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { linkId } = req.params;

      await SupabaseReferralLinkService.deleteLink(linkId, userId);

      res.json({ message: 'Link deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting link:', error);
      res.status(500).json({ error: 'Failed to delete link' });
    }
  }
}