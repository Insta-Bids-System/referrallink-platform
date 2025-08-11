import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import { User, ReferralLink } from '../models';
import aiService from './ai.service';

export interface MessageRecipient {
  name: string;
  phoneNumber?: string;
  email?: string;
  whatsappNumber?: string;
}

export interface BulkMessageRequest {
  recipients: MessageRecipient[];
  referralLinkId: string;
  messageType: 'sms' | 'email' | 'whatsapp';
  customMessage?: string;
  useAI?: boolean;
}

export interface MessageStatus {
  recipientId: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  messageId?: string;
  sentAt?: Date;
}

export class CommunicationService {
  private twilioClient: twilio.Twilio;
  private twilioPhoneNumber: string;
  private twilioWhatsAppNumber: string;
  private sendGridApiKey: string;
  private emailFrom: string;

  constructor() {
    // Initialize Twilio (skip if test credentials)
    const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACtest';
    const authToken = process.env.TWILIO_AUTH_TOKEN || 'test';
    
    if (accountSid.startsWith('AC') && accountSid.length > 5) {
      this.twilioClient = twilio(accountSid, authToken);
    } else {
      // Mock client for testing
      this.twilioClient = {} as any;
    }
    
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.twilioWhatsAppNumber = process.env.WHATSAPP_PHONE_NUMBER || '';

    // Initialize SendGrid (skip if test credentials)
    this.sendGridApiKey = process.env.SENDGRID_API_KEY || 'SG.test';
    this.emailFrom = process.env.EMAIL_FROM || 'noreply@referrallink.com';
    
    if (this.sendGridApiKey.startsWith('SG.') && this.sendGridApiKey.length > 5) {
      sgMail.setApiKey(this.sendGridApiKey);
    }
  }

  async sendSMS(phoneNumber: string, message: string): Promise<MessageStatus> {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: phoneNumber
      });

      return {
        recipientId: phoneNumber,
        status: 'sent',
        messageId: result.sid,
        sentAt: new Date()
      };
    } catch (error: any) {
      console.error('SMS send error:', error);
      return {
        recipientId: phoneNumber,
        status: 'failed',
        error: error.message
      };
    }
  }

  async sendEmail(
    email: string, 
    subject: string, 
    htmlContent: string, 
    textContent?: string
  ): Promise<MessageStatus> {
    try {
      const msg = {
        to: email,
        from: this.emailFrom,
        subject,
        text: textContent || this.stripHtml(htmlContent),
        html: htmlContent
      };

      const [response] = await sgMail.send(msg);

      return {
        recipientId: email,
        status: 'sent',
        messageId: response.headers['x-message-id'],
        sentAt: new Date()
      };
    } catch (error: any) {
      console.error('Email send error:', error);
      return {
        recipientId: email,
        status: 'failed',
        error: error.message
      };
    }
  }

  async sendWhatsApp(whatsappNumber: string, message: string): Promise<MessageStatus> {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${this.twilioWhatsAppNumber}`,
        to: `whatsapp:${whatsappNumber}`
      });

      return {
        recipientId: whatsappNumber,
        status: 'sent',
        messageId: result.sid,
        sentAt: new Date()
      };
    } catch (error: any) {
      console.error('WhatsApp send error:', error);
      return {
        recipientId: whatsappNumber,
        status: 'failed',
        error: error.message
      };
    }
  }

  async sendBulkMessages(
    userId: string,
    request: BulkMessageRequest
  ): Promise<MessageStatus[]> {
    const results: MessageStatus[] = [];
    const referralLink = await ReferralLink.findByPk(request.referralLinkId);
    
    if (!referralLink) {
      throw new Error('Referral link not found');
    }

    // Process recipients in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < request.recipients.length; i += batchSize) {
      const batch = request.recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        let message = request.customMessage || '';
        
        // Generate personalized message if AI is enabled
        if (request.useAI) {
          const personalizedMsg = await aiService.generatePersonalizedMessage({
            userId,
            recipientName: recipient.name,
            referralLink: referralLink.fullUrl,
            messageType: request.messageType
          });
          message = personalizedMsg.body;
        } else if (!message) {
          // Use default template
          message = this.getDefaultMessage(
            request.messageType,
            recipient.name,
            referralLink.fullUrl
          );
        }

        // Send based on message type
        switch (request.messageType) {
          case 'sms':
            if (recipient.phoneNumber) {
              return this.sendSMS(recipient.phoneNumber, message);
            }
            break;
          case 'email':
            if (recipient.email) {
              const subject = `${recipient.name}, check out this opportunity!`;
              const htmlContent = this.formatEmailHtml(message, referralLink.fullUrl);
              return this.sendEmail(recipient.email, subject, htmlContent);
            }
            break;
          case 'whatsapp':
            if (recipient.whatsappNumber) {
              return this.sendWhatsApp(recipient.whatsappNumber, message);
            }
            break;
        }

        return {
          recipientId: recipient.name,
          status: 'failed' as const,
          error: 'No valid contact method'
        };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < request.recipients.length) {
        await this.delay(1000); // 1 second delay between batches
      }
    }

    // Update referral link statistics
    await this.updateCommunicationStats(referralLink, results);

    return results;
  }

  async sendReferralNotification(
    userId: string,
    referralLinkId: string,
    recipient: MessageRecipient,
    messageType: 'sms' | 'email' | 'whatsapp'
  ): Promise<MessageStatus> {
    const user = await User.findByPk(userId);
    const referralLink = await ReferralLink.findByPk(referralLinkId);
    
    if (!user || !referralLink) {
      throw new Error('User or referral link not found');
    }

    // Generate personalized message
    const personalizedMsg = await aiService.generatePersonalizedMessage({
      userId,
      recipientName: recipient.name,
      referralLink: referralLink.fullUrl,
      messageType
    });

    switch (messageType) {
      case 'sms':
        if (!recipient.phoneNumber) {
          throw new Error('Phone number required for SMS');
        }
        return this.sendSMS(recipient.phoneNumber, personalizedMsg.body);
      
      case 'email':
        if (!recipient.email) {
          throw new Error('Email address required');
        }
        const htmlContent = this.formatEmailHtml(
          personalizedMsg.body,
          referralLink.fullUrl
        );
        return this.sendEmail(
          recipient.email,
          personalizedMsg.subject || 'Check this out!',
          htmlContent
        );
      
      case 'whatsapp':
        if (!recipient.whatsappNumber) {
          throw new Error('WhatsApp number required');
        }
        return this.sendWhatsApp(recipient.whatsappNumber, personalizedMsg.body);
      
      default:
        throw new Error('Invalid message type');
    }
  }

  private getDefaultMessage(
    messageType: 'sms' | 'email' | 'whatsapp',
    recipientName: string,
    referralLink: string
  ): string {
    const templates = {
      sms: `Hi ${recipientName}! Check out this amazing opportunity: ${referralLink}`,
      email: `<p>Hi ${recipientName},</p>
              <p>I wanted to share something exciting with you!</p>
              <p><a href="${referralLink}">Click here to learn more</a></p>
              <p>Best regards</p>`,
      whatsapp: `Hey ${recipientName}! 👋\n\nI found something you might be interested in:\n${referralLink}\n\nLet me know what you think!`
    };

    return templates[messageType];
  }

  private formatEmailHtml(message: string, referralLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    ${message.replace(/\n/g, '<br>')}
    <div style="text-align: center; margin: 30px 0;">
      <a href="${referralLink}" class="button">Check It Out</a>
    </div>
    <div class="footer">
      <p>This referral link was shared with you through ReferralLink Platform.</p>
      <p>If you didn't expect this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private async updateCommunicationStats(
    referralLink: ReferralLink,
    results: MessageStatus[]
  ): Promise<void> {
    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    
    // Update metadata with communication stats
    referralLink.metadata = {
      ...referralLink.metadata,
      lastBulkSend: new Date().toISOString(),
      totalMessagesSent: (referralLink.metadata.totalMessagesSent || 0) + sentCount,
      totalMessagesFailed: (referralLink.metadata.totalMessagesFailed || 0) + failedCount
    };
    
    await referralLink.save();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const lookup = await this.twilioClient.lookups.v1
        .phoneNumbers(phoneNumber)
        .fetch();
      return !!lookup.phoneNumber;
    } catch (error) {
      return false;
    }
  }

  async getMessageStatus(messageId: string, provider: 'twilio' | 'sendgrid'): Promise<any> {
    try {
      if (provider === 'twilio') {
        const message = await this.twilioClient.messages(messageId).fetch();
        return {
          status: message.status,
          errorCode: message.errorCode,
          errorMessage: message.errorMessage,
          dateCreated: message.dateCreated,
          dateSent: message.dateSent
        };
      }
      // SendGrid status would require webhook implementation
      return null;
    } catch (error) {
      console.error('Get message status error:', error);
      return null;
    }
  }
}

export default new CommunicationService();