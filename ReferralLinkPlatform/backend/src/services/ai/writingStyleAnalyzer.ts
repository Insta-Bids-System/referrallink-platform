import OpenAI from 'openai';
import { supabaseAdmin } from '../../config/supabase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
});

export interface WritingStyleProfile {
  tone: 'formal' | 'casual' | 'friendly' | 'professional' | 'enthusiastic';
  vocabulary: 'simple' | 'moderate' | 'complex';
  sentenceLength: 'short' | 'medium' | 'long';
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'frequent';
  punctuation: string[];
  commonPhrases: string[];
  personality: string;
  analysisDate: Date;
}

export interface SocialPost {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram';
  content: string;
  date?: Date;
}

export class WritingStyleAnalyzer {
  /**
   * Analyze user's writing style from social media posts
   */
  static async analyzeWritingStyle(
    posts: SocialPost[],
    userId: string
  ): Promise<WritingStyleProfile> {
    try {
      // Combine posts for analysis
      const combinedText = posts
        .map(p => `[${p.platform}]: ${p.content}`)
        .join('\n\n');

      // Use GPT-4 to analyze writing style
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert linguistic analyst. Analyze the writing style from these social media posts and return a JSON object with the following structure:
            {
              "tone": "formal|casual|friendly|professional|enthusiastic",
              "vocabulary": "simple|moderate|complex",
              "sentenceLength": "short|medium|long",
              "emojiUsage": "none|minimal|moderate|frequent",
              "punctuation": ["common", "punctuation", "marks"],
              "commonPhrases": ["frequently", "used", "phrases"],
              "personality": "A brief description of the writer's personality based on their writing"
            }`
          },
          {
            role: 'user',
            content: combinedText
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      const styleProfile: WritingStyleProfile = {
        tone: analysis.tone || 'friendly',
        vocabulary: analysis.vocabulary || 'moderate',
        sentenceLength: analysis.sentenceLength || 'medium',
        emojiUsage: analysis.emojiUsage || 'minimal',
        punctuation: analysis.punctuation || ['!', '.', '?'],
        commonPhrases: analysis.commonPhrases || [],
        personality: analysis.personality || 'Friendly and approachable',
        analysisDate: new Date()
      };

      // Store the analysis in the database
      await supabaseAdmin
        .from('users')
        .update({ writing_style: styleProfile })
        .eq('id', userId);

      return styleProfile;
    } catch (error) {
      console.error('Error analyzing writing style:', error);
      
      // Return default style if analysis fails
      return {
        tone: 'friendly',
        vocabulary: 'moderate',
        sentenceLength: 'medium',
        emojiUsage: 'minimal',
        punctuation: ['.', '!', '?'],
        commonPhrases: [],
        personality: 'Friendly and professional',
        analysisDate: new Date()
      };
    }
  }

  /**
   * Extract sample posts from user's social media (mock for now)
   */
  static async extractSocialPosts(
    userId: string,
    accessTokens: { [platform: string]: string }
  ): Promise<SocialPost[]> {
    // In production, this would call actual social media APIs
    // For now, we'll return mock data or stored samples
    
    try {
      // Check if user has stored sample posts
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('profile')
        .eq('id', userId)
        .single();

      if (user?.profile?.samplePosts) {
        return user.profile.samplePosts;
      }

      // Return mock data for testing
      return [
        {
          platform: 'twitter',
          content: "Just discovered this amazing platform! Can't wait to share it with everyone 🚀",
          date: new Date()
        },
        {
          platform: 'facebook',
          content: "Hey friends! Check out what I found today. It's absolutely incredible and I think you'll love it too!",
          date: new Date()
        },
        {
          platform: 'linkedin',
          content: "I'm excited to share a remarkable platform that has transformed how I approach online auctions. The innovation here is truly game-changing.",
          date: new Date()
        }
      ];
    } catch (error) {
      console.error('Error extracting social posts:', error);
      return [];
    }
  }

  /**
   * Get or create writing style profile for user
   */
  static async getWritingStyle(userId: string): Promise<WritingStyleProfile | null> {
    try {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('writing_style')
        .eq('id', userId)
        .single();

      if (user?.writing_style) {
        return user.writing_style as WritingStyleProfile;
      }

      // If no style exists, analyze from available data
      const posts = await this.extractSocialPosts(userId, {});
      if (posts.length > 0) {
        return await this.analyzeWritingStyle(posts, userId);
      }

      return null;
    } catch (error) {
      console.error('Error getting writing style:', error);
      return null;
    }
  }

  /**
   * Update user's writing style based on new posts
   */
  static async updateWritingStyle(
    userId: string,
    newPosts: SocialPost[]
  ): Promise<WritingStyleProfile> {
    try {
      // Get existing posts if any
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('profile')
        .eq('id', userId)
        .single();

      const existingPosts = user?.profile?.samplePosts || [];
      const allPosts = [...existingPosts, ...newPosts];

      // Keep only recent posts (last 50)
      const recentPosts = allPosts.slice(-50);

      // Update stored posts
      await supabaseAdmin
        .from('users')
        .update({ 
          profile: { 
            ...user?.profile,
            samplePosts: recentPosts 
          } 
        })
        .eq('id', userId);

      // Re-analyze style
      return await this.analyzeWritingStyle(recentPosts, userId);
    } catch (error) {
      console.error('Error updating writing style:', error);
      throw error;
    }
  }
}