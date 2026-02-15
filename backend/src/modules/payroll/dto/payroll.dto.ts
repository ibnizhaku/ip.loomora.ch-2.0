import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class PayslipItemDto {
  @IsString()
  category: string; // EARNING, DEDUCTION, EXPENSE, EMPLOYER_CONTRIBUTION

  @IsString()
  type: string; // base, overtime, social, insurance, pension, etc.

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  rate?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreatePayslipDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsNumber()
  year: number;

  @ApiProperty()
  @IsNumber()
  month: number;

  @ApiProperty()
  @IsNumber()
  grossSalary: number;

  @ApiProperty()
  @IsNumber()
  netSalary: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalDeductions?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalExpenses?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  totalEmployerCost?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  targetHours?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  actualHours?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  overtimeHours?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  holidayDays?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sickDays?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  vacationDays?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [PayslipItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayslipItemDto)
  items?: PayslipItemDto[];
}

export class UpdatePayslipDto extends PartialType(CreatePayslipDto) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;
}
