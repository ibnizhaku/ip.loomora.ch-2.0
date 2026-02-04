import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsEmail, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  VACATION = 'VACATION',
  SICK = 'SICK',
  INACTIVE = 'INACTIVE',
}

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Max' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Keller' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'm.keller@loomora.ch' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+41 44 123 45 67' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '+41 79 123 45 67' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ example: 'Geschäftsführer' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ example: '2020-01-15' })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiPropertyOptional({ example: '756.1234.5678.90' })
  @IsOptional()
  @IsString()
  ahvNumber?: string;

  @ApiPropertyOptional({ example: '1985-03-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'CH' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 'verheiratet' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  childrenCount?: number;

  @ApiPropertyOptional({ example: 'Vollzeit' })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  workloadPercent?: number;

  @ApiPropertyOptional({ example: 'CH93 0076 2011 6238 5295 7' })
  @IsOptional()
  @IsString()
  iban?: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class EmployeeQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departmentId?: string;
}
