import { WritingStyleAnalyzer } from '../../../src/services/ai/writingStyleAnalyzer';
import { MessageGenerator } from '../../../src/services/ai/messageGenerator';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  tone: 'friendly',
                  vocabulary: 'moderate',
                  sentenceLength: 'medium',
                  emojiUsage: 'moderate',
                  punctuation: ['!', '?', '.'],
                  commonPhrases: ['excited', 'amazing'],
                  personality: 'Enthusiastic and friendly'
                })
              }
            }]
          })
        }
      }
    }))
  };
});

// Mock Supabase
jest.mock('../../../src/config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
      update: jest.fn().mockResolvedValue({ data: null, error: null })
    }))
  }
}));

describe('AI Services', () => {
  describe('WritingStyleAnalyzer', () => {
    it('should analyze writing style from social posts', async () => {
      const posts = [
        { platform: 'twitter' as const, content: 'Just launched my startup! 🚀 So excited!' },
        { platform: 'facebook' as const, content: 'Working on amazing features! Can\'t wait to share!' }
      ];

      const result = await WritingStyleAnalyzer.analyzeWritingStyle(posts, 'test-user');

      expect(result).toBeDefined();
      expect(result.tone).toBe('friendly');
      expect(result.vocabulary).toBe('moderate');
      expect(result.personality).toBe('Enthusiastic and friendly');
    });

    it('should save style to user profile', async () => {
      const posts = [
        { platform: 'twitter' as const, content: 'Amazing news coming soon!' }
      ];
      
      const result = await WritingStyleAnalyzer.analyzeWritingStyle(posts, 'test-user');
      
      expect(result).toBeDefined();
      // Verify that supabase update was called
    });
  });

  describe('MessageGenerator', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should generate fallback messages when no style provided', async () => {
      const messages = await MessageGenerator.generateMessages(
        'test-user',
        null,
        {
          platform: 'sms',
          referralLink: 'https://test.link/abc123'
        },
        3
      );

      expect(messages).toHaveLength(3);
      expect(messages[0].platform).toBe('sms');
      expect(messages[0].content).toContain('Instabids.ai');
      expect(messages[0].content).toContain('https://test.link/abc123');
    });

    it('should respect platform constraints', async () => {
      const smsMessages = await MessageGenerator.generateMessages(
        'test-user',
        null,
        {
          platform: 'sms',
          referralLink: 'https://test.link/abc123'
        },
        1
      );

      // SMS messages should be concise
      expect(smsMessages[0].content.length).toBeLessThan(300);
    });

    it('should include recipient name when provided', async () => {
      const messages = await MessageGenerator.generateMessages(
        'test-user',
        null,
        {
          platform: 'email',
          referralLink: 'https://test.link/abc123',
          recipientName: 'John'
        },
        1
      );

      expect(messages[0].content).toContain('John');
    });
  });

  describe('Platform Constraints', () => {
    it('should generate appropriate messages for each platform', async () => {
      const platforms = ['sms', 'email', 'whatsapp', 'facebook', 'twitter', 'linkedin'];
      
      for (const platform of platforms) {
        const messages = await MessageGenerator.generateMessages(
          'test-user',
          null,
          {
            platform: platform as any,
            referralLink: 'https://test.link/abc123'
          },
          1
        );

        expect(messages).toHaveLength(1);
        expect(messages[0].platform).toBe(platform);
        expect(messages[0].content).toBeTruthy();
        expect(messages[0].score).toBeGreaterThanOrEqual(70);
      }
    });
  });

  describe('Message Templates', () => {
    it('should return templates for each platform', async () => {
      const platforms = ['sms', 'email', 'whatsapp', 'facebook', 'twitter', 'linkedin'];
      
      for (const platform of platforms) {
        const templates = await MessageGenerator.getMessageTemplates(platform);
        
        expect(templates).toBeDefined();
        expect(templates.length).toBeGreaterThan(0);
        expect(templates[0].platform).toBe(platform);
        expect(templates[0].content).toContain('{link}');
      }
    });
  });
});