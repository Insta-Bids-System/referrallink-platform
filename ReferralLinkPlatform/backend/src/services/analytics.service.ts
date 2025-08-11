import { ReferralLink, Click, Conversion, User } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database';

export interface TimeSeriesData {
  date: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

export interface ChannelPerformance {
  channel: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

export interface GeographicData {
  country: string;
  clicks: number;
  conversions: number;
}

export interface DeviceStats {
  device: string;
  clicks: number;
  percentage: number;
}

export interface TopPerformer {
  linkId: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

export class AnalyticsService {
  async getUserAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;

    // Get all user's referral links
    const userLinks = await ReferralLink.findAll({
      where: { userId },
      attributes: ['id']
    });
    const linkIds = userLinks.map(link => link.id);

    // Get total metrics
    const totalClicks = await Click.count({
      where: {
        referralLinkId: { [Op.in]: linkIds },
        ...(Object.keys(dateFilter).length && { clickedAt: dateFilter })
      }
    });

    const uniqueClicks = await Click.count({
      where: {
        referralLinkId: { [Op.in]: linkIds },
        ...(Object.keys(dateFilter).length && { clickedAt: dateFilter })
      },
      distinct: true,
      col: 'ipAddress'
    });

    const totalConversions = await Conversion.count({
      where: {
        referralLinkId: { [Op.in]: linkIds },
        ...(Object.keys(dateFilter).length && { convertedAt: dateFilter })
      }
    });

    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    // Get time series data
    const timeSeriesData = await this.getTimeSeriesData(linkIds, startDate, endDate);

    // Get channel performance
    const channelPerformance = await this.getChannelPerformance(linkIds, dateFilter);

    // Get geographic distribution
    const geographicData = await this.getGeographicData(linkIds, dateFilter);

    // Get device statistics
    const deviceStats = await this.getDeviceStats(linkIds, dateFilter);

    // Get top performing links
    const topPerformers = await this.getTopPerformingLinks(userId, 10, dateFilter);

    return {
      summary: {
        totalClicks,
        uniqueClicks,
        totalConversions,
        conversionRate: conversionRate.toFixed(2),
        totalLinks: userLinks.length
      },
      timeSeriesData,
      channelPerformance,
      geographicData,
      deviceStats,
      topPerformers
    };
  }

  private async getTimeSeriesData(
    linkIds: string[],
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeSeriesData[]> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const end = endDate || new Date();

    const clicksData = await sequelize.query(`
      SELECT 
        DATE(clicked_at) as date,
        COUNT(*) as clicks
      FROM clicks
      WHERE referral_link_id = ANY(:linkIds)
        AND clicked_at BETWEEN :start AND :end
      GROUP BY DATE(clicked_at)
      ORDER BY date
    `, {
      replacements: { linkIds, start, end },
      type: 'SELECT'
    });

    const conversionsData = await sequelize.query(`
      SELECT 
        DATE(converted_at) as date,
        COUNT(*) as conversions
      FROM conversions
      WHERE referral_link_id = ANY(:linkIds)
        AND converted_at BETWEEN :start AND :end
      GROUP BY DATE(converted_at)
      ORDER BY date
    `, {
      replacements: { linkIds, start, end },
      type: 'SELECT'
    });

    // Merge clicks and conversions data
    const dataMap = new Map<string, any>();

    (clicksData as any[]).forEach(row => {
      dataMap.set(row.date, { ...dataMap.get(row.date), clicks: Number(row.clicks) });
    });

    (conversionsData as any[]).forEach(row => {
      const existing = dataMap.get(row.date) || { clicks: 0 };
      dataMap.set(row.date, { 
        ...existing, 
        conversions: Number(row.conversions) 
      });
    });

    const result: TimeSeriesData[] = [];
    dataMap.forEach((value, date) => {
      result.push({
        date,
        clicks: value.clicks || 0,
        conversions: value.conversions || 0,
        conversionRate: value.clicks > 0 ? ((value.conversions || 0) / value.clicks) * 100 : 0
      });
    });

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private async getChannelPerformance(
    linkIds: string[],
    dateFilter: any
  ): Promise<ChannelPerformance[]> {
    const referralLinks = await ReferralLink.findAll({
      where: { id: { [Op.in]: linkIds } },
      include: [{
        model: Click,
        where: dateFilter.clickedAt ? { clickedAt: dateFilter.clickedAt } : {},
        required: false
      }]
    });

    const channelMap = new Map<string, { clicks: number; conversions: number }>();

    for (const link of referralLinks) {
      const channel = link.metadata?.utm_source || 'direct';
      const existing = channelMap.get(channel) || { clicks: 0, conversions: 0 };
      
      existing.clicks += link.clicks?.length || 0;
      
      const conversions = await Conversion.count({
        where: {
          referralLinkId: link.id,
          ...(dateFilter.convertedAt && { convertedAt: dateFilter.convertedAt })
        }
      });
      
      existing.conversions += conversions;
      channelMap.set(channel, existing);
    }

    const result: ChannelPerformance[] = [];
    channelMap.forEach((value, channel) => {
      result.push({
        channel,
        clicks: value.clicks,
        conversions: value.conversions,
        conversionRate: value.clicks > 0 ? (value.conversions / value.clicks) * 100 : 0
      });
    });

    return result.sort((a, b) => b.clicks - a.clicks);
  }

  private async getGeographicData(
    linkIds: string[],
    dateFilter: any
  ): Promise<GeographicData[]> {
    const clicks = await Click.findAll({
      where: {
        referralLinkId: { [Op.in]: linkIds },
        country: { [Op.not]: null },
        ...(dateFilter.clickedAt && { clickedAt: dateFilter.clickedAt })
      },
      attributes: [
        'country',
        [sequelize.fn('COUNT', sequelize.col('id')), 'clickCount']
      ],
      group: ['country']
    });

    const result: GeographicData[] = [];
    
    for (const click of clicks) {
      const country = (click as any).country;
      const clickCount = Number((click as any).dataValues.clickCount);
      
      const conversions = await Conversion.count({
        include: [{
          model: Click,
          where: { country },
          required: true
        }],
        where: {
          referralLinkId: { [Op.in]: linkIds },
          ...(dateFilter.convertedAt && { convertedAt: dateFilter.convertedAt })
        }
      });

      result.push({
        country,
        clicks: clickCount,
        conversions
      });
    }

    return result.sort((a, b) => b.clicks - a.clicks);
  }

  private async getDeviceStats(
    linkIds: string[],
    dateFilter: any
  ): Promise<DeviceStats[]> {
    const clicks = await Click.findAll({
      where: {
        referralLinkId: { [Op.in]: linkIds },
        ...(dateFilter.clickedAt && { clickedAt: dateFilter.clickedAt })
      },
      attributes: [
        'device',
        [sequelize.fn('COUNT', sequelize.col('id')), 'clickCount']
      ],
      group: ['device']
    });

    const totalClicks = clicks.reduce((sum, click) => 
      sum + Number((click as any).dataValues.clickCount), 0
    );

    return clicks.map(click => ({
      device: (click as any).device,
      clicks: Number((click as any).dataValues.clickCount),
      percentage: totalClicks > 0 
        ? (Number((click as any).dataValues.clickCount) / totalClicks) * 100 
        : 0
    })).sort((a, b) => b.clicks - a.clicks);
  }

  private async getTopPerformingLinks(
    userId: string,
    limit: number,
    dateFilter: any
  ): Promise<TopPerformer[]> {
    const links = await ReferralLink.findAll({
      where: { userId, isActive: true },
      include: [{
        model: Click,
        where: dateFilter.clickedAt ? { clickedAt: dateFilter.clickedAt } : {},
        required: false
      }],
      limit
    });

    const result: TopPerformer[] = [];

    for (const link of links) {
      const clicks = link.clicks?.length || 0;
      const conversions = await Conversion.count({
        where: {
          referralLinkId: link.id,
          ...(dateFilter.convertedAt && { convertedAt: dateFilter.convertedAt })
        }
      });

      result.push({
        linkId: link.id,
        shortCode: link.shortCode,
        originalUrl: link.originalUrl,
        clicks,
        conversions,
        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0
      });
    }

    return result.sort((a, b) => b.clicks - a.clicks);
  }

  async getPlatformAnalytics(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate) dateFilter[Op.gte] = startDate;
    if (endDate) dateFilter[Op.lte] = endDate;

    // Platform-wide metrics
    const totalUsers = await User.count({ where: { isActive: true } });
    const totalLinks = await ReferralLink.count({ where: { isActive: true } });
    const totalClicks = await Click.count({
      where: dateFilter.clickedAt ? { clickedAt: dateFilter } : {}
    });
    const totalConversions = await Conversion.count({
      where: dateFilter.convertedAt ? { convertedAt: dateFilter } : {}
    });

    // New users over time
    const newUsersData = await sequelize.query(`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as new_users
      FROM users
      WHERE "createdAt" BETWEEN :start AND :end
      GROUP BY DATE("createdAt")
      ORDER BY date
    `, {
      replacements: { 
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate || new Date()
      },
      type: 'SELECT'
    });

    // Revenue data (if applicable)
    const revenueData = await sequelize.query(`
      SELECT 
        DATE(converted_at) as date,
        SUM(conversion_value) as revenue,
        COUNT(*) as transactions
      FROM conversions
      WHERE conversion_value IS NOT NULL
        AND converted_at BETWEEN :start AND :end
      GROUP BY DATE(converted_at)
      ORDER BY date
    `, {
      replacements: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: endDate || new Date()
      },
      type: 'SELECT'
    });

    return {
      summary: {
        totalUsers,
        totalLinks,
        totalClicks,
        totalConversions,
        conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
      },
      newUsersData,
      revenueData
    };
  }

  async trackEvent(eventType: string, userId: string, metadata: any) {
    // Implement event tracking for custom analytics
    // This could be integrated with services like Mixpanel, Amplitude, etc.
    console.log('Tracking event:', { eventType, userId, metadata });
  }
}

export default new AnalyticsService();