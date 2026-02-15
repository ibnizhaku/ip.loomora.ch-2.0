import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export enum BudgetStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum BudgetPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export class BudgetLineDto {
  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  costCenterId?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateBudgetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(BudgetPeriod)
  period: BudgetPeriod;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsNumber()
  quarter?: number; // 1-4 for quarterly budgets

  @IsOptional()
  @IsNumber()
  month?: number; // 1-12 for monthly budgets

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetLineDto)
  lines: BudgetLineDto[];
}

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;
}

export class BudgetComparisonDto {
  year: number;
  period?: BudgetPeriod;
  accountIds?: string[];
  costCenterIds?: string[];
}
