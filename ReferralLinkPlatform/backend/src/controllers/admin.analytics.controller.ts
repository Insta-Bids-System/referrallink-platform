import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth.middleware';

export class AdminAnalyticsController {
  /**
   * Get overall platform analytics
   */
  static async getPlatformAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Get total users
      const { count: totalUsers } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total links
      const { count: totalLinks } = await supabaseAdmin
        .from('referral_links')
        .select('*', { count: 'exact', head: true });

      // Get all clicks
      const { data: clicks, error: clicksError } = await supabaseAdmin
        .from('clicks')
        .select('*')
        .order('clicked_at', { ascending: false });

      if (clicksError) throw clicksError;

      // Get all conversions
      const { data: conversions, error: convError } = await supabaseAdmin
        .from('conversions')
        .select('*')
        .order('converted_at', { ascending: false });

      if (convError) throw convError;

      // Calculate statistics
      const totalClicks = clicks?.length || 0;
      const uniqueVisitors = new Set(clicks?.map(c => c.ip_address) || []).size;
      const totalConversions = conversions?.length || 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      // Get top performing links
      const linkPerformance: Record<string, any> = {};
      
      clicks?.forEach(click => {
        if (!linkPerformance[click.referral_link_id]) {
          linkPerformance[click.referral_link_id] = {
            clicks: 0,
            conversions: 0,
            uniqueVisitors: new Set()
          };
        }
        linkPerformance[click.referral_link_id].clicks++;
        linkPerformance[click.referral_link_id].uniqueVisitors.add(click.ip_address);
      });

      conversions?.forEach(conv => {
        if (linkPerformance[conv.referral_link_id]) {
          linkPerformance[conv.referral_link_id].conversions++;
        }
      });

      // Get link details for top performers
      const topLinkIds = Object.entries(linkPerformance)
        .sort((a, b) => b[1].clicks - a[1].clicks)
        .slice(0, 10)
        .map(([id]) => id);

      const { data: topLinks } = await supabaseAdmin
        .from('referral_links')
        .select('id, short_code, user_id, created_at')
        .in('id', topLinkIds);

      // Get recent activity (last 24 hours)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recentClicks = clicks?.filter(c => c.clicked_at > yesterday) || [];
      const recentConversions = conversions?.filter(c => c.converted_at > yesterday) || [];

      res.json({
        overview: {
          totalUsers: totalUsers || 0,
          totalLinks: totalLinks || 0,
          totalClicks,
          uniqueVisitors,
          totalConversions,
          conversionRate: conversionRate.toFixed(2)
        },
        last24Hours: {
          clicks: recentClicks.length,
          conversions: recentConversions.length,
          newLinks: 0 // Would need to query links created in last 24h
        },
        topPerformingLinks: topLinks?.map(link => ({
          ...link,
          performance: {
            clicks: linkPerformance[link.id].clicks,
            uniqueVisitors: linkPerformance[link.id].uniqueVisitors.size,
            conversions: linkPerformance[link.id].conversions,
            conversionRate: linkPerformance[link.id].clicks > 0 
              ? ((linkPerformance[link.id].conversions / linkPerformance[link.id].clicks) * 100).toFixed(2)
              : 0
          }
        })) || [],
        recentActivity: {
          clicks: recentClicks.slice(0, 50).map(click => ({
            id: click.id,
            linkId: click.referral_link_id,
            timestamp: click.clicked_at,
            country: click.country,
            device: click.device
          })),
          conversions: recentConversions.slice(0, 20).map(conv => ({
            id: conv.id,
            linkId: conv.referral_link_id,
            timestamp: conv.converted_at,
            type: conv.conversion_type,
            value: conv.conversion_value
          }))
        }
      });
    } catch (error: any) {
      console.error('Error getting platform analytics:', error);
      res.status(500).json({ 
        error: 'Failed to get platform analytics',
        details: error.message 
      });
    }
  }

  /**
   * Get analytics for a specific user
   */
  static async getUserAnalytics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      // Get user's links
      const { data: userLinks, error: linksError } = await supabaseAdmin
        .from('referral_links')
        .select('*')
        .eq('user_id', userId);

      if (linksError) throw linksError;

      const linkIds = userLinks?.map(l => l.id) || [];

      // Get clicks for user's links
      const { data: clicks, error: clicksError } = await supabaseAdmin
        .from('clicks')
        .select('*')
        .in('referral_link_id', linkIds)
        .order('clicked_at', { ascending: false });

      if (clicksError) throw clicksError;

      // Get conversions for user's links
      const { data: conversions, error: convError } = await supabaseAdmin
        .from('conversions')
        .select('*')
        .in('referral_link_id', linkIds)
        .order('converted_at', { ascending: false });

      if (convError) throw convError;

      // Calculate user statistics
      const totalClicks = clicks?.length || 0;
      const uniqueVisitors = new Set(clicks?.map(c => c.ip_address) || []).size;
      const totalConversions = conversions?.length || 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const totalRevenue = conversions?.reduce((sum, c) => sum + (c.conversion_value || 0), 0) || 0;

      res.json({
        userId,
        linksCreated: userLinks?.length || 0,
        statistics: {
          totalClicks,
          uniqueVisitors,
          totalConversions,
          conversionRate: conversionRate.toFixed(2),
          totalRevenue
        },
        links: userLinks?.map(link => ({
          id: link.id,
          shortCode: link.short_code,
          url: `${process.env.COMPANY_URL || 'https://instabids.ai'}?ref=${link.short_code}`,
          createdAt: link.created_at,
          expiresAt: link.expires_at,
          isActive: link.is_active,
          statistics: link.statistics
        })) || [],
        recentClicks: clicks?.slice(0, 20) || [],
        recentConversions: conversions?.slice(0, 10) || []
      });
    } catch (error: any) {
      console.error('Error getting user analytics:', error);
      res.status(500).json({ 
        error: 'Failed to get user analytics',
        details: error.message 
      });
    }
  }

  /**
   * Get all clicks with filtering
   */
  static async getAllClicks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate, linkId, limit = 100 } = req.query;

      let query = supabaseAdmin
        .from('clicks')
        .select('*, referral_links!inner(short_code, user_id)')
        .order('clicked_at', { ascending: false })
        .limit(Number(limit));

      if (linkId) {
        query = query.eq('referral_link_id', linkId as string);
      }

      if (startDate) {
        query = query.gte('clicked_at', startDate as string);
      }

      if (endDate) {
        query = query.lte('clicked_at', endDate as string);
      }

      const { data: clicks, error } = await query;

      if (error) throw error;

      res.json({
        totalClicks: clicks?.length || 0,
        clicks: clicks || []
      });
    } catch (error: any) {
      console.error('Error getting clicks:', error);
      res.status(500).json({ 
        error: 'Failed to get clicks',
        details: error.message 
      });
    }
  }
}

export default AdminAnalyticsController;