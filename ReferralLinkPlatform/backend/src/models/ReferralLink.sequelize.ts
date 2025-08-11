import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, BeforeCreate } from 'sequelize-typescript';
import { User } from './User.sequelize';
import { Click } from './Click.sequelize';
import { Conversion } from './Conversion.sequelize';
import crypto from 'crypto';

export interface ReferralMetadata {
  campaignName?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  tags?: string[];
  customParameters?: Record<string, any>;
  flagged?: boolean;
  removedReason?: string;
  lastBulkSend?: string;
  totalMessagesSent?: number;
  totalMessagesFailed?: number;
  [key: string]: any;
}

export interface ReferralStatistics {
  totalClicks: number;
  uniqueClicks: number;
  conversions: number;
  conversionRate: number;
  lastClickedAt?: Date;
  clicksByCountry: Record<string, number>;
  clicksByDevice: {
    mobile: number;
    desktop: number;
    tablet: number;
    other: number;
  };
  clicksByChannel: Record<string, number>;
}

@Table({
  tableName: 'referral_links',
  timestamps: true
})
export class ReferralLink extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @Column({
    type: DataType.STRING(10),
    unique: true,
    allowNull: false
  })
  shortCode!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  originalUrl!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  customMessage?: string;

  @Column({
    type: DataType.JSONB,
    defaultValue: {}
  })
  metadata!: ReferralMetadata;

  @Column({
    type: DataType.JSONB,
    defaultValue: {
      totalClicks: 0,
      uniqueClicks: 0,
      conversions: 0,
      conversionRate: 0,
      clicksByCountry: {},
      clicksByDevice: {
        mobile: 0,
        desktop: 0,
        tablet: 0,
        other: 0
      },
      clicksByChannel: {}
    }
  })
  statistics!: ReferralStatistics;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  expiresAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  qrCode?: string;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => Click)
  clicks!: Click[];

  @HasMany(() => Conversion)
  conversions!: Conversion[];

  @BeforeCreate
  static async generateShortCode(link: ReferralLink) {
    if (!link.shortCode) {
      let shortCode: string;
      let exists = true;
      
      while (exists) {
        shortCode = crypto.randomBytes(4).toString('hex');
        const existing = await ReferralLink.findOne({ where: { shortCode } });
        exists = !!existing;
      }
      
      link.shortCode = shortCode!;
    }
  }

  get fullUrl(): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/r/${this.shortCode}`;
  }

  async updateStatistics(): Promise<void> {
    const clicks = await Click.count({ where: { referralLinkId: this.id } });
    const uniqueClicks = await Click.count({ 
      where: { referralLinkId: this.id },
      distinct: true,
      col: 'ipAddress'
    });
    const conversionsCount = await Conversion.count({ where: { referralLinkId: this.id } });
    
    this.statistics = {
      ...this.statistics,
      totalClicks: clicks,
      uniqueClicks: uniqueClicks,
      conversions: conversionsCount,
      conversionRate: clicks > 0 ? (conversionsCount / clicks) * 100 : 0
    };
    
    await this.save();
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  async getConversions() {
    return Conversion.findAll({
      where: { referralLinkId: this.id }
    });
  }
}