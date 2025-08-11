import OpenAI from 'openai';
import { User, WritingStyleAnalysis } from '../models';
import axios from 'axios';

export interface MessagePersonalizationRequest {
  userId: string;
  recipientName?: string;
  recipientContext?: string;
  productName?: string;
  productDescription?: string;
  referralLink: string;
  messageType: 'sms' | 'email' | 'whatsapp' | 'social';
  tone?: 'formal' | 'casual' | 'friendly' | 'professional';
}

export interface PersonalizedMessage {
  subject?: string;
  body: string;
  preview: string;
  metadata: {
    tone: string;
    readingLevel: number;
    estimatedReadTime: number;
    keywords: string[];
  };
}

export interface StyleAnalysisResult {
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  vocabulary: 'simple' | 'moderate' | 'complex';
  sentenceLength: 'short' | 'medium' | 'long';
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'frequent';
  punctuation: string[];
  commonPhrases: string[];
}

export class AIService {
  private openai: OpenAI;
  private modelName: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.modelName = process.env.OPENAI_MODEL || 'gpt-4';
  }

  async analyzeWritingStyle(userId: string, socialPosts: string[]): Promise<StyleAnalysisResult> {
    try {
      const prompt = `Analyze the writing style from these social media posts and provide a structured analysis:

Posts:
${socialPosts.join('\n---\n')}

Provide analysis in the following JSON format:
{
  "tone": "formal|casual|friendly|professional",
  "vocabulary": "simple|moderate|complex",
  "sentenceLength": "short|medium|long",
  "emojiUsage": "none|minimal|moderate|frequent",
  "punctuation": ["commonly", "used", "punctuation"],
  "commonPhrases": ["frequently", "used", "phrases"]
}`;

      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: 'You are a writing style analyst. Analyze text and provide structured insights about writing patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Save analysis to user profile
      const user = await User.findByPk(userId);
      if (user) {
        const writingStyle: WritingStyleAnalysis = {
          ...analysis,
          analysisDate: new Date()
        };
        user.writingStyle = writingStyle;
        await user.save();
      }

      return analysis;
    } catch (error) {
      console.error('Writing style analysis error:', error);
      throw new Error('Failed to analyze writing style');
    }
  }

  async generatePersonalizedMessage(request: MessagePersonalizationRequest): Promise<PersonalizedMessage> {
    try {
      // Get user's writing style
      const user = await User.findByPk(request.userId);
      const writingStyle = user?.writingStyle;
      
      // Build style instructions
      const styleInstructions = this.buildStyleInstructions(writingStyle, request.tone);
      
      // Create prompt based on message type
      const prompt = this.buildMessagePrompt(request, styleInstructions);

      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: 'You are a message personalization expert. Create engaging, personalized referral messages that match the sender\'s writing style.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const generatedContent = response.choices[0].message.content || '';
      
      // Parse the response
      const message = this.parseGeneratedMessage(generatedContent, request.messageType);
      
      // Add metadata
      const metadata = await this.analyzeMessageMetadata(message.body);
      
      return {
        ...message,
        metadata
      };
    } catch (error) {
      console.error('Message generation error:', error);
      throw new Error('Failed to generate personalized message');
    }
  }

  private buildStyleInstructions(
    writingStyle?: WritingStyleAnalysis | null, 
    requestedTone?: string
  ): string {
    if (!writingStyle) {
      return `Use a ${requestedTone || 'friendly'} tone with moderate vocabulary.`;
    }

    const tone = requestedTone || writingStyle.tone;
    const instructions = [`Use a ${tone} tone`];

    if (writingStyle.vocabulary === 'simple') {
      instructions.push('Use simple, everyday language');
    } else if (writingStyle.vocabulary === 'complex') {
      instructions.push('Use sophisticated vocabulary');
    }

    if (writingStyle.sentenceLength === 'short') {
      instructions.push('Keep sentences short and punchy');
    } else if (writingStyle.sentenceLength === 'long') {
      instructions.push('Use longer, more detailed sentences');
    }

    if (writingStyle.emojiUsage !== 'none') {
      const emojiMap = {
        minimal: 'Include 1-2 emojis',
        moderate: 'Include 3-4 emojis',
        frequent: 'Use emojis liberally'
      };
      instructions.push(emojiMap[writingStyle.emojiUsage] || '');
    }

    if (writingStyle.commonPhrases.length > 0) {
      instructions.push(`Try to naturally incorporate phrases like: ${writingStyle.commonPhrases.slice(0, 3).join(', ')}`);
    }

    return instructions.join('. ') + '.';
  }

  private buildMessagePrompt(
    request: MessagePersonalizationRequest,
    styleInstructions: string
  ): string {
    const basePrompt = `Create a ${request.messageType} message for a referral program.

Context:
- Product/Service: ${request.productName || 'Our amazing product'}
- Description: ${request.productDescription || 'A great solution'}
- Recipient: ${request.recipientName || 'Friend'}
- Recipient Context: ${request.recipientContext || 'Someone who might be interested'}
- Referral Link: ${request.referralLink}

Style Instructions:
${styleInstructions}

Message Requirements:
- Be authentic and personal
- Highlight key benefits
- Include the referral link naturally
- Create urgency without being pushy
${request.messageType === 'sms' ? '- Keep under 160 characters' : ''}
${request.messageType === 'email' ? '- Include a subject line' : ''}
${request.messageType === 'social' ? '- Make it shareable and engaging' : ''}

Generate the message now:`;

    return basePrompt;
  }

  private parseGeneratedMessage(content: string, messageType: string): Omit<PersonalizedMessage, 'metadata'> {
    let subject: string | undefined;
    let body: string;
    let preview: string;

    if (messageType === 'email') {
      // Extract subject line if present
      const subjectMatch = content.match(/Subject:\s*(.+)\n/i);
      if (subjectMatch) {
        subject = subjectMatch[1].trim();
        body = content.replace(subjectMatch[0], '').trim();
      } else {
        body = content;
        subject = 'Check out this amazing opportunity!';
      }
    } else {
      body = content.trim();
    }

    // Create preview (first 100 characters)
    preview = body.substring(0, 100) + (body.length > 100 ? '...' : '');

    return { subject, body, preview };
  }

  private async analyzeMessageMetadata(message: string): Promise<PersonalizedMessage['metadata']> {
    // Basic analysis without AI call for performance
    const words = message.split(/\s+/);
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Estimate reading time (average 200 words per minute)
    const estimatedReadTime = Math.ceil(words.length / 200 * 60); // in seconds
    
    // Detect tone based on keywords
    let tone = 'neutral';
    if (message.match(/excited|amazing|wonderful|fantastic/i)) tone = 'enthusiastic';
    if (message.match(/professional|business|opportunity|investment/i)) tone = 'professional';
    if (message.match(/hey|hi|buddy|friend/i)) tone = 'casual';
    
    // Calculate reading level (simplified Flesch-Kincaid)
    const avgWordsPerSentence = words.length / sentences.length;
    const readingLevel = Math.min(12, Math.max(6, Math.round(avgWordsPerSentence / 2)));
    
    // Extract keywords (simple approach - could use TF-IDF or other methods)
    const keywords = this.extractKeywords(message);

    return {
      tone,
      readingLevel,
      estimatedReadTime,
      keywords
    };
  }

  private extractKeywords(text: string): string[] {
    // Remove common words and extract important terms
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));

    // Count word frequency
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // Sort by frequency and return top 5
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  async generateMessageVariations(
    request: MessagePersonalizationRequest,
    count: number = 3
  ): Promise<PersonalizedMessage[]> {
    const variations: PersonalizedMessage[] = [];
    
    // Generate multiple variations with different tones
    const tones: Array<'formal' | 'casual' | 'friendly' | 'professional'> = 
      ['casual', 'friendly', 'professional'];
    
    for (let i = 0; i < Math.min(count, tones.length); i++) {
      const variation = await this.generatePersonalizedMessage({
        ...request,
        tone: tones[i]
      });
      variations.push(variation);
    }

    return variations;
  }

  async improveMessage(originalMessage: string, feedback: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'system',
            content: 'You are a message improvement expert. Refine messages based on feedback while maintaining authenticity.'
          },
          {
            role: 'user',
            content: `Original message:\n${originalMessage}\n\nFeedback:\n${feedback}\n\nProvide an improved version:`
          }
        ],
        temperature: 0.6,
        max_tokens: 500
      });

      return response.choices[0].message.content || originalMessage;
    } catch (error) {
      console.error('Message improvement error:', error);
      return originalMessage;
    }
  }

  async generateTemplates(userId: string, category: string): Promise<any[]> {
    const user = await User.findByPk(userId);
    const writingStyle = user?.writingStyle;
    
    const templates = [
      {
        id: '1',
        category,
        name: 'Quick Share',
        template: `Hey {recipientName}! 👋 Found something you might love: {productName}. Check it out here: {referralLink}`,
        tags: ['casual', 'short', 'friendly']
      },
      {
        id: '2',
        category,
        name: 'Detailed Recommendation',
        template: `Hi {recipientName},\n\nI've been using {productName} and it's been amazing for {benefit}. Thought you might find it useful too!\n\nHere's my referral link for a special offer: {referralLink}\n\nLet me know if you have any questions!`,
        tags: ['detailed', 'helpful', 'personal']
      },
      {
        id: '3',
        category,
        name: 'Professional',
        template: `Dear {recipientName},\n\nI wanted to share an excellent resource that could benefit your {context}. {productName} offers {keyBenefit}.\n\nYou can learn more here: {referralLink}\n\nBest regards`,
        tags: ['formal', 'professional', 'business']
      }
    ];

    // Adjust templates based on user's writing style
    if (writingStyle) {
      return templates.map(template => ({
        ...template,
        template: this.adjustTemplateToStyle(template.template, writingStyle)
      }));
    }

    return templates;
  }

  private adjustTemplateToStyle(template: string, style: WritingStyleAnalysis): string {
    let adjusted = template;

    // Add emojis based on usage preference
    if (style.emojiUsage === 'frequent' && !adjusted.includes('😊')) {
      adjusted = adjusted.replace(/\./g, '. 😊');
    } else if (style.emojiUsage === 'none') {
      adjusted = adjusted.replace(/[😊👋🎉💡]/g, '');
    }

    // Adjust formality
    if (style.tone === 'casual') {
      adjusted = adjusted.replace('Dear', 'Hey');
      adjusted = adjusted.replace('Best regards', 'Cheers');
    } else if (style.tone === 'formal') {
      adjusted = adjusted.replace('Hey', 'Dear');
      adjusted = adjusted.replace('Check it out', 'Please review');
    }

    return adjusted;
  }
}

export default new AIService();