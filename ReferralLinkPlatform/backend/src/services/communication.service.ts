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
    // Initialize Twilio with v4 best practices
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (accountSid && authToken && accountSid.startsWith('AC')) {
      // Twilio v4 supports credential storage in environment variables
      // If no credentials are provided when instantiating, it uses TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
      this.twilioClient = twilio(accountSid, authToken);
      console.log('Twilio client initialized successfully');
    } else {
      // Mock client for testing when no credentials
      this.twilioClient = {} as any;
      console.log('Twilio running in mock mode - add credentials to enable SMS');
    }
    
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.twilioWhatsAppNumber = process.env.WHATSAPP_PHONE_NUMBER || '';

    // Initialize SendGrid with latest best practices
    this.sendGridApiKey = process.env.SENDGRID_API_KEY || '';
    this.emailFrom = process.env.EMAIL_FROM || 'noreply@instabids.ai';
    
    if (this.sendGridApiKey && this.sendGridApiKey.startsWith('SG.')) {
      sgMail.setApiKey(this.sendGridApiKey);
      console.log('SendGrid client initialized successfully');
    } else {
      console.log('SendGrid running in mock mode - add API key to enable emails');
    }
  }

  async sendSMS(phoneNumber: string, message: string): Promise<MessageStatus> {
    try {
      // Check if Twilio is properly configured
      if (!this.twilioClient.messages) {
        throw new Error('Twilio not configured. Please add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to environment variables.');
      }

      // Ensure phone number is in E.164 format
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: formattedPhone
      });

      return {
        recipientId: phoneNumber,
        status: 'sent',
        messageId: result.sid,
        sentAt: new Date()
      };
    } catch (error: any) {
      console.error('SMS send error:', error);
      
      // Better error messages for common issues
      let errorMessage = error.message;
      if (error.code === 21211) {
        errorMessage = 'Invalid phone number format. Use E.164 format: +1234567890';
      } else if (error.code === 21608) {
        errorMessage = 'Phone number not verified. In trial mode, add number to verified list in Twilio console.';
      } else if (error.code === 20003) {
        errorMessage = 'Authentication failed. Check your Twilio credentials.';
      }

      return {
        recipientId: phoneNumber,
        status: 'failed',
        error: errorMessage
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
      // Check if SendGrid is properly configured
      if (!this.sendGridApiKey || !this.sendGridApiKey.startsWith('SG.')) {
        throw new Error('SendGrid not configured. Please add SENDGRID_API_KEY to environment variables.');
      }

      const msg = {
        to: email,
        from: this.emailFrom,
        subject,
        text: textContent || this.stripHtml(htmlContent),
        html: htmlContent,
        // Add tracking settings
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: true
          },
          openTracking: {
            enable: true
          }
        }
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
      
      // Better error messages for common SendGrid issues
      let errorMessage = error.message;
      if (error.code === 401) {
        errorMessage = 'SendGrid authentication failed. Check your API key.';
      } else if (error.code === 403) {
        errorMessage = 'Sender email not verified. Verify ' + this.emailFrom + ' in SendGrid.';
      } else if (error.response && error.response.body && error.response.body.errors) {
        errorMessage = error.response.body.errors.map((e: any) => e.message).join(', ');
      }

      return {
        recipientId: email,
        status: 'failed',
        error: errorMessage
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

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add + if not present
    if (!phoneNumber.startsWith('+')) {
      // Assume US number if 10 digits
      if (cleaned.length === 10) {
        cleaned = '1' + cleaned;
      }
      return '+' + cleaned;
    }
    
    return phoneNumber;
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