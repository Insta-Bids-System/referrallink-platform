export interface ReferralLink {
  id: string;
  userId: string;
  shortCode: string;
  originalUrl: string;
  customMessage?: string;
  metadata: ReferralMetadata;
  statistics: ReferralStatistics;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralMetadata {
  campaignName?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  tags?: string[];
  customParameters?: Record<string, any>;
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

export interface Click {
  id: string;
  referralLinkId: string;
  ipAddress: string;
  userAgent: string;
  referer?: string;
  country?: string;
  city?: string;
  device: string;
  browser: string;
  os: string;
  clickedAt: Date;
}

export interface Conversion {
  id: string;
  referralLinkId: string;
  clickId: string;
  convertedUserId?: string;
  conversionType: 'signup' | 'purchase' | 'custom';
  conversionValue?: number;
  metadata?: Record<string, any>;
  convertedAt: Date;
}

export class ReferralLinkModel {
  static async create(_linkData: Partial<ReferralLink>): Promise<ReferralLink> {
    // Database implementation
    throw new Error('Not implemented');
  }

  static async findByShortCode(_shortCode: string): Promise<ReferralLink | null> {
    // Database implementation
    throw new Error('Not implemented');
  }

  static async findByUserId(_userId: string): Promise<ReferralLink[]> {
    // Database implementation
    throw new Error('Not implemented');
  }

  static async update(_id: string, _updates: Partial<ReferralLink>): Promise<ReferralLink> {
    // Database implementation
    throw new Error('Not implemented');
  }

  static async recordClick(_clickData: Partial<Click>): Promise<Click> {
    // Database implementation
    throw new Error('Not implemented');
  }

  static async recordConversion(_conversionData: Partial<Conversion>): Promise<Conversion> {
    // Database implementation
    throw new Error('Not implemented');
  }

  static async getStatistics(_linkId: string): Promise<ReferralStatistics> {
    // Database implementation
    throw new Error('Not implemented');
  }
}