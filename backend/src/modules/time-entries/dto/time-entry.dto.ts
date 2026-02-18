import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean, Min, IsEnum, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

// Approval status for time entries
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class CreateTimeEntryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiPropertyOptional({ example: 'Frontend Development' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2024-02-01' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 120, description: 'Duration in minutes' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isBillable?: boolean;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;
}

export class UpdateTimeEntryDto extends PartialType(CreateTimeEntryDto) {}

export class ApproveTimeEntriesDto {
  @ApiProperty({ description: 'Array of time entry IDs to approve/reject' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ enum: ApprovalStatus })
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @ApiPropertyOptional({ description: 'Reason for rejection' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class TimeEntryQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ enum: ApprovalStatus })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @ApiPropertyOptional({ description: 'Filter by employee ID (admin only)' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Get all employees entries (admin only)' })
  @IsOptional()
  @IsBoolean()
  allEmployees?: boolean;
}
