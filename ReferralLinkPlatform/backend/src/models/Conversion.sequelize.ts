import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ReferralLink } from './ReferralLink.sequelize';
import { Click } from './Click.sequelize';
import { User } from './User.sequelize';

export enum ConversionType {
  SIGNUP = 'signup',
  PURCHASE = 'purchase',
  SUBSCRIPTION = 'subscription',
  CUSTOM = 'custom'
}

@Table({
  tableName: 'conversions',
  timestamps: false
})
export class Conversion extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @ForeignKey(() => ReferralLink)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  referralLinkId!: string;

  @ForeignKey(() => Click)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  clickId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  convertedUserId?: string;

  @Column({
    type: DataType.ENUM(...Object.values(ConversionType)),
    allowNull: false,
    defaultValue: ConversionType.SIGNUP
  })
  conversionType!: ConversionType;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true
  })
  conversionValue?: number;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  currency?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true
  })
  metadata?: Record<string, any>;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  convertedAt!: Date;

  @BelongsTo(() => ReferralLink)
  referralLink!: ReferralLink;

  @BelongsTo(() => Click)
  click!: Click;

  @BelongsTo(() => User)
  convertedUser?: User;
}