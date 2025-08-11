import { Request, Response, NextFunction } from 'express';
import { ReferralLink, Click, User } from '../models';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { parseUserAgent } from '../utils/userAgent';
import { getGeoLocation } from '../utils/geoLocation';

export class ReferralController {
  async createReferralLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { originalUrl, customMessage, metadata, expiresAt } = req.body;
      const userId = (req as any).user.id;

      // Generate unique short code
      let shortCode = req.body.shortCode;
      if (!shortCode) {
        shortCode = crypto.randomBytes(4).toString('hex');
      }

      // Check if short code already exists
      const existing = await ReferralLink.findOne({ where: { shortCode } });
      if (existing) {
        return res.status(400).json({ error: 'Short code already exists' });
      }

      // Create referral link
      const referralLink = await ReferralLink.create({
        userId,
        shortCode,
        originalUrl,
        customMessage,
        metadata: metadata || {},
        expiresAt
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(referralLink.fullUrl);
      referralLink.qrCode = qrCode;
      await referralLink.save();

      res.status(201).json({
        success: true,
        data: {
          ...referralLink.toJSON(),
          fullUrl: referralLink.fullUrl
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getReferralLinks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { page = 1, limit = 10, active } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = { userId };

      if (active !== undefined) {
        where.isActive = active === 'true';
      }

      const { count, rows } = await ReferralLink.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Click,
            attributes: []
          }
        ]
      });

      const links = rows.map(link => ({
        ...link.toJSON(),
        fullUrl: link.fullUrl
      }));

      res.json({
        success: true,
        data: links,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getReferralLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const referralLink = await ReferralLink.findOne({
        where: { id, userId },
        include: [
          {
            model: Click,
            limit: 10,
            order: [['clickedAt', 'DESC']]
          }
        ]
      });

      if (!referralLink) {
        return res.status(404).json({ error: 'Referral link not found' });
      }

      res.json({
        success: true,
        data: {
          ...referralLink.toJSON(),
          fullUrl: referralLink.fullUrl
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReferralLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const updates = req.body;

      const referralLink = await ReferralLink.findOne({
        where: { id, userId }
      });

      if (!referralLink) {
        return res.status(404).json({ error: 'Referral link not found' });
      }

      // Update allowed fields
      const allowedUpdates = ['customMessage', 'metadata', 'expiresAt', 'isActive'];
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          (referralLink as any)[key] = updates[key];
        }
      });

      await referralLink.save();

      res.json({
        success: true,
        data: {
          ...referralLink.toJSON(),
          fullUrl: referralLink.fullUrl
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReferralLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const referralLink = await ReferralLink.findOne({
        where: { id, userId }
      });

      if (!referralLink) {
        return res.status(404).json({ error: 'Referral link not found' });
      }

      // Soft delete by setting isActive to false
      referralLink.isActive = false;
      await referralLink.save();

      res.json({
        success: true,
        message: 'Referral link deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async handleClick(req: Request, res: Response, next: NextFunction) {
    try {
      const { shortCode } = req.params;

      // Find referral link
      const referralLink = await ReferralLink.findOne({
        where: { shortCode, isActive: true }
      });

      if (!referralLink) {
        return res.redirect(process.env.REDIRECT_404_URL || '/404');
      }

      // Check if link is expired
      if (referralLink.isExpired()) {
        return res.redirect(process.env.REDIRECT_EXPIRED_URL || '/expired');
      }

      // Extract click information
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      const referer = req.headers.referer || undefined;

      // Parse user agent
      const { device, browser, os } = parseUserAgent(userAgent);

      // Get geo location (implement this based on your needs)
      const { country, city, region } = await getGeoLocation(ipAddress);

      // Record click
      await Click.create({
        referralLinkId: referralLink.id,
        ipAddress,
        userAgent,
        referer,
        country,
        city,
        region,
        device,
        browser,
        os
      });

      // Update statistics
      await referralLink.updateStatistics();

      // Build redirect URL with UTM parameters
      let redirectUrl = referralLink.originalUrl;
      const metadata = referralLink.metadata;
      
      if (metadata) {
        const params = new URLSearchParams();
        if (metadata.utm_source) params.append('utm_source', metadata.utm_source);
        if (metadata.utm_medium) params.append('utm_medium', metadata.utm_medium);
        if (metadata.utm_campaign) params.append('utm_campaign', metadata.utm_campaign);
        if (metadata.utm_term) params.append('utm_term', metadata.utm_term);
        if (metadata.utm_content) params.append('utm_content', metadata.utm_content);
        
        const separator = redirectUrl.includes('?') ? '&' : '?';
        redirectUrl = `${redirectUrl}${separator}${params.toString()}`;
      }

      // Redirect to original URL
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Click tracking error:', error);
      res.redirect(process.env.REDIRECT_ERROR_URL || '/error');
    }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const referralLink = await ReferralLink.findOne({
        where: { id, userId }
      });

      if (!referralLink) {
        return res.status(404).json({ error: 'Referral link not found' });
      }

      // Get detailed statistics
      await referralLink.updateStatistics();

      // Get recent clicks
      const recentClicks = await Click.findAll({
        where: { referralLinkId: id },
        limit: 100,
        order: [['clickedAt', 'DESC']]
      });

      // Get conversions
      const conversions = await referralLink.getConversions();

      res.json({
        success: true,
        data: {
          statistics: referralLink.statistics,
          recentClicks: recentClicks.map(click => click.toJSON()),
          conversions: conversions.map(conv => conv.toJSON())
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { links } = req.body;

      if (!Array.isArray(links) || links.length === 0) {
        return res.status(400).json({ error: 'Invalid links array' });
      }

      const createdLinks = [];

      for (const linkData of links) {
        const { originalUrl, customMessage, metadata, expiresAt } = linkData;
        
        const referralLink = await ReferralLink.create({
          userId,
          originalUrl,
          customMessage,
          metadata: metadata || {},
          expiresAt
        });

        // Generate QR code
        const qrCode = await QRCode.toDataURL(referralLink.fullUrl);
        referralLink.qrCode = qrCode;
        await referralLink.save();

        createdLinks.push({
          ...referralLink.toJSON(),
          fullUrl: referralLink.fullUrl
        });
      }

      res.status(201).json({
        success: true,
        data: createdLinks
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReferralController();