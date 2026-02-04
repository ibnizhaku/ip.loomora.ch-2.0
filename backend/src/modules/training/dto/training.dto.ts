import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsBoolean, IsArray, Min, Max } from 'class-validator';

export enum TrainingStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TrainingType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  ONLINE = 'ONLINE',
  WORKSHOP = 'WORKSHOP',
  CERTIFICATION = 'CERTIFICATION',
  SAFETY = 'SAFETY',
  COMPLIANCE = 'COMPLIANCE',
}

export enum ParticipantStatus {
  REGISTERED = 'REGISTERED',
  CONFIRMED = 'CONFIRMED',
  ATTENDED = 'ATTENDED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
  WAITLIST = 'WAITLIST',
}

export class CreateTrainingDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TrainingType })
  @IsEnum(TrainingType)
  type: TrainingType;

  @ApiPropertyOptional({ enum: TrainingStatus })
  @IsEnum(TrainingStatus)
  @IsOptional()
  status?: TrainingStatus;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  durationHours?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isOnline?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  meetingUrl?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerPerson?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalBudget?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  instructorId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  instructorName?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetDepartments?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisites?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  certificationType?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTrainingDto extends PartialType(CreateTrainingDto) {}

export class AddParticipantDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiPropertyOptional({ enum: ParticipantStatus })
  @IsEnum(ParticipantStatus)
  @IsOptional()
  status?: ParticipantStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateParticipantDto {
  @ApiPropertyOptional({ enum: ParticipantStatus })
  @IsEnum(ParticipantStatus)
  @IsOptional()
  status?: ParticipantStatus;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  attended?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  certificateIssued?: boolean;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  certificateExpiryDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class TrainingReportDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  type?: string;
}
