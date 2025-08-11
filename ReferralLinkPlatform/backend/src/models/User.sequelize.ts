import { Table, Column, Model, DataType, HasMany, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import { ReferralLink } from './ReferralLink.sequelize';

export interface WritingStyleAnalysis {
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  vocabulary: 'simple' | 'moderate' | 'complex';
  sentenceLength: 'short' | 'medium' | 'long';
  emojiUsage: 'none' | 'minimal' | 'moderate' | 'frequent';
  punctuation: string[];
  commonPhrases: string[];
  analysisDate: Date;
}

export interface AuthProvider {
  provider: 'google' | 'facebook' | 'twitter' | 'email';
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
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

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  passwordHash?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  firstName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  lastName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  phoneNumber?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  profilePicture?: string;

  @Column({
    type: DataType.JSONB,
    defaultValue: {}
  })
  profile?: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true
  })
  writingStyle?: WritingStyleAnalysis;

  @Column({
    type: DataType.JSONB,
    defaultValue: []
  })
  authProviders!: AuthProvider[];

  @Column({
    type: DataType.JSONB,
    defaultValue: {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      defaultMessageChannel: 'email',
      language: 'en',
      timezone: 'UTC'
    }
  })
  preferences!: UserPreferences;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false
  })
  isVerified!: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.USER
  })
  role!: UserRole;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  refreshToken?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  lastLoginAt?: Date;

  @HasMany(() => ReferralLink)
  referralLinks!: ReferralLink[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('passwordHash') && user.passwordHash) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.passwordHash) return false;
    return bcrypt.compare(password, this.passwordHash);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    delete values.refreshToken;
    return values;
  }
}