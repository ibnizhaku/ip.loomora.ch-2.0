import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsBoolean, IsArray, IsEmail, Min } from 'class-validator';

// ============== CAMPAIGNS ==============
export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CampaignType {
  EMAIL = 'EMAIL',
  SOCIAL = 'SOCIAL',
  PRINT = 'PRINT',
  EVENT = 'EVENT',
  DIGITAL = 'DIGITAL',
  OTHER = 'OTHER',
}

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CampaignType })
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  budget: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  spent?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  targetAudience?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  expectedReach?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  actualReach?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  conversions?: number;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}

// ============== LEADS ==============
export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  COLD_CALL = 'COLD_CALL',
  TRADE_SHOW = 'TRADE_SHOW',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  ADVERTISEMENT = 'ADVERTISEMENT',
  OTHER = 'OTHER',
}

export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateLeadDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @ApiPropertyOptional({ enum: LeadPriority })
  @IsEnum(LeadPriority)
  @IsOptional()
  priority?: LeadPriority;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedValue?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  score?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  campaignId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  nextFollowUp?: string;
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {}

export class ConvertLeadDto {
  @ApiProperty()
  @IsString()
  leadId: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  createProject?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectName?: string;
}

// ============== EMAIL MARKETING ==============
export enum EmailCampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  CANCELLED = 'CANCELLED',
}

export class CreateEmailCampaignDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({ enum: EmailCampaignStatus })
  @IsEnum(EmailCampaignStatus)
  @IsOptional()
  status?: EmailCampaignStatus;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  recipientListIds?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  senderName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  senderEmail?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  replyToEmail?: string;
}

export class UpdateEmailCampaignDto extends PartialType(CreateEmailCampaignDto) {}

// ============== LEAD ACTIVITIES ==============
export enum ActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
  TASK = 'TASK',
}

export class CreateLeadActivityDto {
  @ApiProperty()
  @IsString()
  leadId: string;

  @ApiProperty({ enum: ActivityType })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  activityDate?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  outcome?: string;
}
