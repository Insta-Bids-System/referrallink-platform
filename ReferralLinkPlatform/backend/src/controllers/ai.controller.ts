import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.supabase';
import { WritingStyleAnalyzer, SocialPost } from '../services/ai/writingStyleAnalyzer';
import { MessageGenerator, MessageOptions } from '../services/ai/messageGenerator';
import { SupabaseReferralLinkService } from '../services/supabase/referralLink.service';

export class AIController {
  /**
   * Analyze user's writing style from social posts
   */
  static async analyzeWritingStyle(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { posts } = req.body;

      if (!posts || !Array.isArray(posts) || posts.length === 0) {
        res.status(400).json({ error: 'Social posts are required for analysis' });
        return;
      }

      // Validate posts format
      const validPosts: SocialPost[] = posts.map(post => ({
        platform: post.platform || 'facebook',
        content: post.content || '',
        date: post.date ? new Date(post.date) : new Date()
      }));

      // Analyze writing style
      const styleProfile = await WritingStyleAnalyzer.analyzeWritingStyle(
        validPosts,
        req.userId
      );

      res.json({
        message: 'Writing style analyzed successfully',
        style: styleProfile
      });
    } catch (error: any) {
      console.error('Error analyzing writing style:', error);
      res.status(500).json({ error: 'Failed to analyze writing style' });
    }
  }

  /**
   * Generate personalized referral messages
   */
  static async generateMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const {
        recipientName,
        platform = 'sms',
        customContext,
        tone,
        count = 5
      } = req.body;

      // Get user's primary link
      const primaryLink = await SupabaseReferralLinkService.getPrimaryLink(req.userId);
      
      if (!primaryLink) {
        res.status(404).json({ 
          error: 'No active referral link found. Please create a link first.' 
        });
        return;
      }

      // Get user's writing style
      const writingStyle = await WritingStyleAnalyzer.getWritingStyle(req.userId);

      // Generate referral link URL
      const referralUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/r/${primaryLink.short_code}`;

      // Prepare message options
      const messageOptions: MessageOptions = {
        recipientName,
        platform,
        productName: 'Instabids.ai',
        referralLink: referralUrl,
        customContext,
        tone: tone || writingStyle?.tone
      };

      // Generate messages
      const messages = await MessageGenerator.generateMessages(
        req.userId,
        writingStyle,
        messageOptions,
        Math.min(count, 10) // Limit to 10 messages
      );

      res.json({
        messages,
        writingStyle: writingStyle ? {
          tone: writingStyle.tone,
          emojiUsage: writingStyle.emojiUsage,
          personality: writingStyle.personality
        } : null
      });
    } catch (error: any) {
      console.error('Error generating messages:', error);
      res.status(500).json({ error: 'Failed to generate messages' });
    }
  }

  /**
   * Generate a single optimized message
   */
  static async generateSingleMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { recipientName, platform = 'sms', customContext, tone } = req.body;

      // Get user's primary link
      const primaryLink = await SupabaseReferralLinkService.getPrimaryLink(req.userId);
      
      if (!primaryLink) {
        res.status(404).json({ 
          error: 'No active referral link found. Please create a link first.' 
        });
        return;
      }

      // Get user's writing style
      const writingStyle = await WritingStyleAnalyzer.getWritingStyle(req.userId);

      // Generate referral link URL
      const referralUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/r/${primaryLink.short_code}`;

      // Prepare message options
      const messageOptions: MessageOptions = {
        recipientName,
        platform,
        productName: 'Instabids.ai',
        referralLink: referralUrl,
        customContext,
        tone: tone || writingStyle?.tone
      };

      // Generate single message
      const message = await MessageGenerator.generateSingleMessage(
        req.userId,
        writingStyle,
        messageOptions
      );

      res.json({ message });
    } catch (error: any) {
      console.error('Error generating single message:', error);
      res.status(500).json({ error: 'Failed to generate message' });
    }
  }

  /**
   * Improve an existing message based on feedback
   */
  static async improveMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { originalMessage, feedback, platform = 'sms' } = req.body;

      if (!originalMessage || !feedback) {
        res.status(400).json({ 
          error: 'Original message and feedback are required' 
        });
        return;
      }

      // Get user's primary link
      const primaryLink = await SupabaseReferralLinkService.getPrimaryLink(req.userId);
      
      if (!primaryLink) {
        res.status(404).json({ 
          error: 'No active referral link found' 
        });
        return;
      }

      // Get user's writing style
      const writingStyle = await WritingStyleAnalyzer.getWritingStyle(req.userId);

      // Generate referral link URL
      const referralUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/r/${primaryLink.short_code}`;

      // Improve message
      const improvedMessage = await MessageGenerator.improveMessage(
        originalMessage,
        feedback,
        writingStyle,
        {
          platform,
          referralLink: referralUrl,
          productName: 'Instabids.ai'
        }
      );

      res.json({
        message: improvedMessage,
        original: originalMessage
      });
    } catch (error: any) {
      console.error('Error improving message:', error);
      res.status(500).json({ error: 'Failed to improve message' });
    }
  }

  /**
   * Save user's message selection for learning
   */
  static async saveMessageSelection(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { messageId, message, selected } = req.body;

      if (!messageId || !message) {
        res.status(400).json({ error: 'Message details required' });
        return;
      }

      await MessageGenerator.saveMessageSelection(
        req.userId,
        messageId,
        message,
        selected
      );

      res.json({ 
        message: 'Selection saved successfully',
        messageId 
      });
    } catch (error: any) {
      console.error('Error saving message selection:', error);
      res.status(500).json({ error: 'Failed to save selection' });
    }
  }

  /**
   * Get message templates for a platform
   */
  static async getMessageTemplates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { platform = 'sms' } = req.query;

      const templates = await MessageGenerator.getMessageTemplates(platform as string);

      res.json({ 
        platform,
        templates 
      });
    } catch (error: any) {
      console.error('Error getting templates:', error);
      res.status(500).json({ error: 'Failed to get templates' });
    }
  }

  /**
   * Update user's writing style with new posts
   */
  static async updateWritingStyle(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { posts } = req.body;

      if (!posts || !Array.isArray(posts)) {
        res.status(400).json({ error: 'Posts array required' });
        return;
      }

      const validPosts: SocialPost[] = posts.map(post => ({
        platform: post.platform || 'facebook',
        content: post.content || '',
        date: post.date ? new Date(post.date) : new Date()
      }));

      const updatedStyle = await WritingStyleAnalyzer.updateWritingStyle(
        req.userId,
        validPosts
      );

      res.json({
        message: 'Writing style updated successfully',
        style: updatedStyle
      });
    } catch (error: any) {
      console.error('Error updating writing style:', error);
      res.status(500).json({ error: 'Failed to update writing style' });
    }
  }

  /**
   * Get user's current writing style
   */
  static async getWritingStyle(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const writingStyle = await WritingStyleAnalyzer.getWritingStyle(req.userId);

      if (!writingStyle) {
        res.status(404).json({ 
          error: 'No writing style found. Please analyze your social posts first.' 
        });
        return;
      }

      res.json({ style: writingStyle });
    } catch (error: any) {
      console.error('Error getting writing style:', error);
      res.status(500).json({ error: 'Failed to get writing style' });
    }
  }
}