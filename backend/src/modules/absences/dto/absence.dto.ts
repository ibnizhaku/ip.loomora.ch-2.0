import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum AbsenceType {
  VACATION = 'VACATION',
  SICK = 'SICK',
  UNPAID = 'UNPAID',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  OTHER = 'OTHER',
}

export enum AbsenceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateAbsenceDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'VACATION' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ enum: AbsenceStatus })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: '2024-02-05' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2024-02-09' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  days?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAbsenceDto extends PartialType(CreateAbsenceDto) {}

export class AbsenceQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: AbsenceStatus })
  @IsOptional()
  @IsEnum(AbsenceStatus)
  status?: AbsenceStatus;

  @ApiPropertyOptional({ enum: AbsenceType })
  @IsOptional()
  @IsEnum(AbsenceType)
  type?: AbsenceType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeId?: string;
}
