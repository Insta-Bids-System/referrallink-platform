import OpenAI from 'openai';
import { WritingStyleProfile } from './writingStyleAnalyzer';
import { supabaseAdmin } from '../../config/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
});

export interface MessageOptions {
  recipientName?: string;
  platform: 'sms' | 'email' | 'whatsapp' | 'facebook' | 'twitter' | 'linkedin';
  productName?: string;
  referralLink: string;
  customContext?: string;
  tone?: 'friendly' | 'professional' | 'casual' | 'enthusiastic';
}

export interface GeneratedMessage {
  id: string;
  content: string;
  platform: string;
  score: number; // Confidence score 0-100
  reasoning?: string;
}

export class MessageGenerator {
  /**
   * Generate personalized referral messages based on user's writing style
   */
  static async generateMessages(
    userId: string,
    style: WritingStyleProfile | null,
    options: MessageOptions,
    count: number = 5
  ): Promise<GeneratedMessage[]> {
    try {
      // Build style description for AI
      const styleDescription = style ? this.buildStyleDescription(style) : 'natural and friendly';
      
      // Platform-specific constraints
      const platformConstraints = this.getPlatformConstraints(options.platform);
      
      // Create the prompt
      const prompt = `Generate ${count} different referral messages for ${options.platform}.
      
      Product: Instabids.ai (an innovative auction platform)
      Link: ${options.referralLink}
      ${options.recipientName ? `Recipient: ${options.recipientName}` : ''}
      ${options.customContext ? `Context: ${options.customContext}` : ''}
      
      Writing Style: ${styleDescription}
      ${style?.commonPhrases?.length ? `Common phrases to consider: ${style.commonPhrases.join(', ')}` : ''}
      ${style?.emojiUsage && style.emojiUsage !== 'none' ? `Emoji usage: ${style.emojiUsage}` : ''}
      
      Platform constraints: ${platformConstraints}
      
      Requirements:
      1. Each message should be unique and engaging
      2. Include the referral link naturally
      3. Match the user's writing style
      4. Be appropriate for ${options.platform}
      5. Focus on the value of Instabids.ai
      
      Return as JSON array with format:
      [
        {
          "content": "message text",
          "score": 85,
          "reasoning": "why this message works"
        }
      ]`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert copywriter who specializes in personalized messaging. You excel at matching writing styles and creating engaging referral messages.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"messages": []}');
      
      // Handle different response formats from GPT
      let messages = [];
      if (Array.isArray(result)) {
        messages = result;
      } else if (result.messages) {
        messages = result.messages;
      } else if (result.variations) {
        messages = result.variations;
      } else {
        // If result is an object with numbered keys or other format
        messages = Object.values(result).filter((v: any) => 
          typeof v === 'object' && (v.content || v.text || v.message)
        );
      }

      // Format and add IDs
      return messages.map((msg: any, index: number) => ({
        id: `msg_${Date.now()}_${index}`,
        content: msg.content || msg.text || msg.message || String(msg),
        platform: options.platform,
        score: msg.score || 80,
        reasoning: msg.reasoning
      })).slice(0, count);

    } catch (error) {
      console.error('Error generating messages:', error);
      
      // Fallback messages
      return this.getFallbackMessages(options, count);
    }
  }

  /**
   * Generate a single optimized message
   */
  static async generateSingleMessage(
    userId: string,
    style: WritingStyleProfile | null,
    options: MessageOptions
  ): Promise<GeneratedMessage> {
    const messages = await this.generateMessages(userId, style, options, 1);
    return messages[0];
  }

  /**
   * Improve an existing message based on feedback
   */
  static async improveMessage(
    originalMessage: string,
    feedback: string,
    style: WritingStyleProfile | null,
    options: MessageOptions
  ): Promise<GeneratedMessage> {
    try {
      const styleDescription = style ? this.buildStyleDescription(style) : 'natural and friendly';
      
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at refining and improving messages based on feedback while maintaining the user\'s writing style.'
          },
          {
            role: 'user',
            content: `Improve this referral message based on the feedback:
            
            Original message: "${originalMessage}"
            Feedback: "${feedback}"
            Platform: ${options.platform}
            Writing style: ${styleDescription}
            Product: Instabids.ai
            Link to include: ${options.referralLink}
            
            Return a JSON object with:
            {
              "content": "improved message",
              "score": 90,
              "reasoning": "what was improved"
            }`
          }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        id: `improved_${Date.now()}`,
        content: result.content || originalMessage,
        platform: options.platform,
        score: result.score || 85,
        reasoning: result.reasoning || 'Message improved based on feedback'
      };

    } catch (error) {
      console.error('Error improving message:', error);
      return {
        id: `original_${Date.now()}`,
        content: originalMessage,
        platform: options.platform,
        score: 70,
        reasoning: 'Could not improve message'
      };
    }
  }

  /**
   * Build style description from profile
   */
  private static buildStyleDescription(style: WritingStyleProfile): string {
    const descriptions = [];
    
    // Tone
    descriptions.push(`${style.tone} tone`);
    
    // Vocabulary
    if (style.vocabulary === 'simple') {
      descriptions.push('simple and clear language');
    } else if (style.vocabulary === 'complex') {
      descriptions.push('sophisticated vocabulary');
    }
    
    // Sentence length
    descriptions.push(`${style.sentenceLength} sentences`);
    
    // Personality
    if (style.personality) {
      descriptions.push(style.personality.toLowerCase());
    }
    
    return descriptions.join(', ');
  }

  /**
   * Get platform-specific constraints
   */
  private static getPlatformConstraints(platform: string): string {
    const constraints: { [key: string]: string } = {
      sms: 'Keep under 160 characters. Be concise and direct.',
      email: 'Can be longer. Include subject-worthy opening. Professional tone acceptable.',
      whatsapp: 'Conversational. Can use emojis. Keep under 300 characters.',
      facebook: 'Engaging and social. Can be casual. 200-300 characters ideal.',
      twitter: 'Must be under 280 characters. Can use hashtags.',
      linkedin: 'Professional tone. Focus on value proposition. 150-300 characters.'
    };
    
    return constraints[platform] || 'Be clear and engaging.';
  }

  /**
   * Get fallback messages if AI fails
   */
  private static getFallbackMessages(
    options: MessageOptions,
    count: number
  ): GeneratedMessage[] {
    const templates = [
      `Hey${options.recipientName ? ' ' + options.recipientName : ''}! Check out Instabids.ai - it's revolutionizing online auctions! ${options.referralLink}`,
      `I've been using Instabids.ai and it's amazing! Thought you might like it too: ${options.referralLink}`,
      `Found this cool auction platform called Instabids.ai. Worth checking out! ${options.referralLink}`,
      `${options.recipientName ? options.recipientName + ', ' : ''}You've got to see Instabids.ai! Game-changer for online auctions: ${options.referralLink}`,
      `Quick share - Instabids.ai is incredible for auctions. Here's my link: ${options.referralLink}`
    ];
    
    return templates.slice(0, count).map((content, index) => ({
      id: `fallback_${Date.now()}_${index}`,
      content,
      platform: options.platform,
      score: 70,
      reasoning: 'Default template message'
    }));
  }

  /**
   * Save user's message selection for learning
   */
  static async saveMessageSelection(
    userId: string,
    messageId: string,
    message: GeneratedMessage,
    selected: boolean
  ): Promise<void> {
    try {
      // Store message selection for future learning
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('profile')
        .eq('id', userId)
        .single();

      const messageHistory = user?.profile?.messageHistory || [];
      messageHistory.push({
        messageId,
        content: message.content,
        platform: message.platform,
        score: message.score,
        selected,
        timestamp: new Date()
      });

      // Keep last 100 messages
      const recentHistory = messageHistory.slice(-100);

      await supabaseAdmin
        .from('users')
        .update({
          profile: {
            ...user?.profile,
            messageHistory: recentHistory
          }
        })
        .eq('id', userId);

    } catch (error) {
      console.error('Error saving message selection:', error);
    }
  }

  /**
   * Get message templates based on platform
   */
  static async getMessageTemplates(platform: string): Promise<GeneratedMessage[]> {
    const templates: { [key: string]: string[] } = {
      sms: [
        'Check out Instabids.ai! Amazing auction platform: {link}',
        'Found something cool - Instabids.ai! {link}',
        'You\'ll love Instabids.ai: {link}'
      ],
      email: [
        'Subject: You\'ll Love This!\n\nHi there,\n\nI wanted to share Instabids.ai with you - it\'s an incredible auction platform that\'s changing the game.\n\nCheck it out: {link}\n\nBest regards',
        'Subject: Quick Share\n\nThought you\'d be interested in Instabids.ai. It\'s revolutionizing online auctions!\n\n{link}'
      ],
      whatsapp: [
        'Hey! 👋 Check out Instabids.ai - amazing auction platform! {link}',
        'Found this cool site - Instabids.ai 🚀 You\'ll love it! {link}'
      ],
      facebook: [
        'Just discovered Instabids.ai and I\'m blown away! 🤯 Revolutionary auction platform. Check it out: {link}',
        'Friends, you need to see Instabids.ai! Game-changer for online auctions 🎯 {link}'
      ],
      twitter: [
        'Discovered @Instabids_ai - revolutionary auction platform! 🚀 Check it out: {link} #auctions #innovation',
        'Game-changer alert! 🎯 Instabids.ai is transforming online auctions. Join me: {link}'
      ],
      linkedin: [
        'I\'m impressed by Instabids.ai\'s innovative approach to online auctions. Worth exploring for anyone interested in cutting-edge platforms: {link}',
        'Sharing an exciting discovery: Instabids.ai is revolutionizing the auction space. Check it out: {link}'
      ]
    };

    const platformTemplates = templates[platform] || templates.sms;
    
    return platformTemplates.map((content, index) => ({
      id: `template_${platform}_${index}`,
      content,
      platform,
      score: 75,
      reasoning: 'Pre-defined template'
    }));
  }
}