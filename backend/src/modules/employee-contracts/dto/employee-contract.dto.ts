import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber, IsBoolean } from 'class-validator';

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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  salaryType?: string; // Monatslohn, Stundenlohn

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  baseSalary?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  wageClass?: string; // A, B, C, D, E, F

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gavClass?: string; // Alias for wageClass (GAV Metallbau)

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  workHoursPerWeek?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  weeklyHours?: number; // Alias for workHoursPerWeek

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
  @IsBoolean()
  @IsOptional()
  thirteenthMonth?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  workload?: number; // e.g. 100 for full time

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  workLocation?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department?: string; // Passed through, not stored on contract

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  position?: string; // Passed through, not stored on contract

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string; // ACTIVE, TERMINATED, SUSPENDED

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  publicHolidays?: number; // Anzahl Feiertage pro Jahr

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ahvNumber?: string; // AHV-Nummer des Mitarbeiters

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEmployeeContractDto extends PartialType(CreateEmployeeContractDto) {}
