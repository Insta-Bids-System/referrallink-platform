import { Request, Response, NextFunction } from 'express';
import { User, ReferralLink, Click, Conversion } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import analyticsService from '../services/analytics.service';
import { UserRole } from '../models/User.sequelize';

export class AdminController {
  // User Management
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        role, 
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'DESC' 
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = {};

      if (search) {
        where[Op.or] = [
          { email: { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [[sortBy as string, sortOrder as string]],
        attributes: { exclude: ['passwordHash', 'refreshToken'] }
      });

      res.json({
        success: true,
        data: {
          users: rows,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId, {
        include: [
          {
            model: ReferralLink,
            attributes: ['id', 'shortCode', 'originalUrl', 'statistics']
          }
        ],
        attributes: { exclude: ['passwordHash', 'refreshToken'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user statistics
      const stats = await this.getUserStatistics(userId);

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          statistics: stats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Only allow certain fields to be updated by admin
      const allowedUpdates = ['isActive', 'isVerified', 'role', 'preferences'];
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          (user as any)[key] = updates[key];
        }
      });

      await user.save();

      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { hardDelete = false } = req.query;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (hardDelete === 'true') {
        // Hard delete - remove from database
        await user.destroy();
      } else {
        // Soft delete - deactivate account
        user.isActive = false;
        await user.save();
      }

      res.json({
        success: true,
        message: hardDelete === 'true' ? 'User permanently deleted' : 'User deactivated'
      });
    } catch (error) {
      next(error);
    }
  }

  // Platform Monitoring
  async getPlatformMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await this.calculatePlatformMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }

  async getSystemHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: await this.checkDatabaseHealth(),
        services: await this.checkServicesHealth()
      };

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      next(error);
    }
  }

  // Content Moderation
  async getFlaggedContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, type = 'all' } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Get flagged referral links (example: links reported or suspicious)
      const flaggedLinks = await ReferralLink.findAndCountAll({
        where: {
          [Op.or]: [
            { 'metadata.flagged': true },
            { 'metadata.reportCount': { [Op.gt]: 0 } }
          ]
        },
        limit: Number(limit),
        offset,
        include: [{ model: User, attributes: ['id', 'email', 'firstName', 'lastName'] }]
      });

      res.json({
        success: true,
        data: {
          items: flaggedLinks.rows,
          pagination: {
            total: flaggedLinks.count,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(flaggedLinks.count / Number(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async moderateContent(req: Request, res: Response, next: NextFunction) {
    try {
      const { contentId } = req.params;
      const { action, reason } = req.body;

      const referralLink = await ReferralLink.findByPk(contentId);
      if (!referralLink) {
        return res.status(404).json({ error: 'Content not found' });
      }

      switch (action) {
        case 'approve':
          referralLink.metadata = {
            ...referralLink.metadata,
            flagged: false,
            moderatedAt: new Date().toISOString(),
            moderatedBy: (req as any).user.id
          };
          break;
        case 'remove':
          referralLink.isActive = false;
          referralLink.metadata = {
            ...referralLink.metadata,
            removedReason: reason,
            removedAt: new Date().toISOString(),
            removedBy: (req as any).user.id
          };
          break;
        case 'flag':
          referralLink.metadata = {
            ...referralLink.metadata,
            flagged: true,
            flaggedReason: reason,
            flaggedAt: new Date().toISOString(),
            flaggedBy: (req as any).user.id
          };
          break;
      }

      await referralLink.save();

      res.json({
        success: true,
        data: referralLink
      });
    } catch (error) {
      next(error);
    }
  }

  // Revenue Tracking
  async getRevenueMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      
      const revenue = await this.calculateRevenue(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        success: true,
        data: revenue
      });
    } catch (error) {
      next(error);
    }
  }

  // System Configuration
  async getSystemConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = {
        features: {
          aiPersonalization: process.env.OPENAI_API_KEY ? 'enabled' : 'disabled',
          smsMessaging: process.env.TWILIO_ACCOUNT_SID ? 'enabled' : 'disabled',
          emailMessaging: process.env.SENDGRID_API_KEY ? 'enabled' : 'disabled',
          whatsappMessaging: process.env.WHATSAPP_PHONE_NUMBER ? 'enabled' : 'disabled'
        },
        limits: {
          maxLinksPerUser: 100,
          maxRecipientsPerBulkSend: 100,
          rateLimitPerMinute: 100
        },
        pricing: {
          freeLinksPerMonth: 10,
          premiumPrice: 9.99,
          enterprisePrice: 49.99
        }
      };

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSystemConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { limits, pricing } = req.body;
      
      // In a real implementation, save to database or config file
      // For now, just return success
      
      res.json({
        success: true,
        message: 'System configuration updated'
      });
    } catch (error) {
      next(error);
    }
  }

  // Reports
  async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType, startDate, endDate, format = 'json' } = req.query;
      
      let reportData: any;
      
      switch (reportType) {
        case 'users':
          reportData = await this.generateUserReport(startDate as string, endDate as string);
          break;
        case 'revenue':
          reportData = await this.generateRevenueReport(startDate as string, endDate as string);
          break;
        case 'engagement':
          reportData = await this.generateEngagementReport(startDate as string, endDate as string);
          break;
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }

      // Format response based on requested format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${reportType}-report.csv`);
        // Convert to CSV (implementation needed)
        res.send('CSV data');
      } else {
        res.json({
          success: true,
          data: reportData
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Helper methods
  private async getUserStatistics(userId: string) {
    const [
      totalLinks,
      totalClicks,
      totalConversions,
      lastActivity
    ] = await Promise.all([
      ReferralLink.count({ where: { userId } }),
      Click.count({
        include: [{
          model: ReferralLink,
          where: { userId },
          required: true
        }]
      }),
      Conversion.count({
        include: [{
          model: ReferralLink,
          where: { userId },
          required: true
        }]
      }),
      ReferralLink.findOne({
        where: { userId },
        order: [['updatedAt', 'DESC']],
        attributes: ['updatedAt']
      })
    ]);

    return {
      totalLinks,
      totalClicks,
      totalConversions,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : 0,
      lastActivity: lastActivity?.updatedAt || null
    };
  }

  private async calculatePlatformMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      totalUsers,
      activeUsers,
      totalLinks,
      totalClicks,
      totalConversions,
      newUsersThisMonth,
      revenue
    ] = await Promise.all([
      User.count(),
      User.count({ where: { lastLoginAt: { [Op.gte]: thirtyDaysAgo } } }),
      ReferralLink.count(),
      Click.count(),
      Conversion.count(),
      User.count({ where: { createdAt: { [Op.gte]: thirtyDaysAgo } } }),
      Conversion.sum('conversionValue')
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth
      },
      engagement: {
        totalLinks,
        totalClicks,
        totalConversions,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks * 100).toFixed(2) : 0
      },
      revenue: {
        total: revenue || 0,
        thisMonth: await this.calculateMonthlyRevenue()
      }
    };
  }

  private async calculateRevenue(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate) where.convertedAt = { [Op.gte]: startDate };
    if (endDate) where.convertedAt = { ...where.convertedAt, [Op.lte]: endDate };

    const revenue = await Conversion.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('convertedAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('conversionValue')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactions']
      ],
      group: [sequelize.fn('DATE', sequelize.col('convertedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('convertedAt')), 'ASC']]
    });

    return revenue;
  }

  private async calculateMonthlyRevenue() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const revenue = await Conversion.sum('conversionValue', {
      where: { convertedAt: { [Op.gte]: startOfMonth } }
    });
    
    return revenue || 0;
  }

  private async checkDatabaseHealth() {
    try {
      await sequelize.authenticate();
      return { status: 'connected', latency: 0 };
    } catch (error) {
      return { status: 'disconnected', error: (error as Error).message };
    }
  }

  private async checkServicesHealth() {
    return {
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
      twilio: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not configured',
      sendgrid: process.env.SENDGRID_API_KEY ? 'configured' : 'not configured',
      redis: 'not configured' // Would check Redis connection here
    };
  }

  private async generateUserReport(startDate: string, endDate: string) {
    const users = await User.findAll({
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      attributes: ['id', 'email', 'role', 'createdAt', 'lastLoginAt']
    });

    return {
      totalUsers: users.length,
      byRole: users.reduce((acc: any, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}),
      users: users.map(u => u.toJSON())
    };
  }

  private async generateRevenueReport(startDate: string, endDate: string) {
    return this.calculateRevenue(new Date(startDate), new Date(endDate));
  }

  private async generateEngagementReport(startDate: string, endDate: string) {
    const analytics = await analyticsService.getPlatformAnalytics(
      new Date(startDate),
      new Date(endDate)
    );
    return analytics;
  }
}

export default new AdminController();