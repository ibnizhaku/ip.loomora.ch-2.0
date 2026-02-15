import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateEmployeeContractDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsString()
  contractType: string; // Unbefristet, Befristet, Temporär

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty()
  @IsString()
  salaryType: string; // Monatslohn, Stundenlohn

  @ApiProperty()
  @IsNumber()
  baseSalary: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  wageClass?: string; // A, B, C, D, E, F

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  workHoursPerWeek?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  vacationDays?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  probationEnd?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  noticePeriod?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEmployeeContractDto extends PartialType(CreateEmployeeContractDto) {}
