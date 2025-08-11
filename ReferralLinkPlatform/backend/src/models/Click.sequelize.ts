import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ReferralLink } from './ReferralLink.sequelize';

@Table({
  tableName: 'clicks',
  timestamps: false
})
export class Click extends Model {
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

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  ipAddress!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  userAgent!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  referer?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  country?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  city?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  region?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'unknown'
  })
  device!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'unknown'
  })
  browser!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'unknown'
  })
  os!: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  clickedAt!: Date;

  @Column({
    type: DataType.JSONB,
    allowNull: true
  })
  metadata?: Record<string, any>;

  @BelongsTo(() => ReferralLink)
  referralLink!: ReferralLink;
}