export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string;
  writingStyle?: WritingStyleAnalysis;
  authProviders: AuthProvider[];
  preferences: UserPreferences;
  isActive: boolean;
  isVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface AuthProvider {
  provider: 'google' | 'facebook' | 'twitter' | 'email';
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

export interface WritingStyleAnalysis {
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  vocabulary: 'simple' | 'moderate' | 'complex';
  sentenceLength: 'short' | 'medium' | 'long';
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'frequent';
  punctuation: string[];
  commonPhrases: string[];
  analysisDate: Date;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  defaultMessageChannel: 'sms' | 'email' | 'whatsapp' | 'imessage';
  language: string;
  timezone: string;
}

export enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export class UserModel {
  static async create(_userData: Partial<User>): Promise<User> {
    // Database implementation
    throw new Error('Not implemented');
  }

  static async findById(_id: string): Promise<User | null> {
    // Database implementation
    throw new Error('Not implemented');
  }

  static async findByEmail(_email: string): Promise<User | null> {
    // Database implementation
    throw new Error('Not implemented');
  }

  static async update(_id: string, _updates: Partial<User>): Promise<User> {
    // Database implementation
    throw new Error('Not implemented');
  }

  static async delete(_id: string): Promise<boolean> {
    // Database implementation
    throw new Error('Not implemented');
  }
}