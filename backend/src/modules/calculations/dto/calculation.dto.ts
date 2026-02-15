import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export enum CalculationStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  APPROVED = 'APPROVED',
  TRANSFERRED = 'TRANSFERRED',  // Transferred to quote
}

export enum CostItemType {
  MATERIAL = 'MATERIAL',
  LABOR = 'LABOR',
  EXTERNAL = 'EXTERNAL',
  OVERHEAD = 'OVERHEAD',
}

export class CalculationItemDto {
  @IsEnum(CostItemType)
  type: CostItemType;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNumber()
  unitCost: number;

  @IsOptional()
  @IsNumber()
  hours?: number;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateCalculationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  bomId?: string;  // Copy from BOM

  @IsOptional()
  @IsString()
  customerId?: string;

  // Markup percentages
  @IsOptional()
  @IsNumber()
  materialMarkup?: number;  // Default 15%

  @IsOptional()
  @IsNumber()
  laborMarkup?: number;  // Default 10%

  @IsOptional()
  @IsNumber()
  overheadPercent?: number;  // Default 8%

  @IsOptional()
  @IsNumber()
  profitMargin?: number;  // Default 12%

  @IsOptional()
  @IsNumber()
  riskMargin?: number;  // Default 5%

  @IsOptional()
  @IsNumber()
  discount?: number;  // Final discount %

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CalculationItemDto)
  items: CalculationItemDto[];
}

export class UpdateCalculationDto extends PartialType(CreateCalculationDto) {
  @IsOptional()
  @IsEnum(CalculationStatus)
  status?: CalculationStatus;
}

export class CalculationResultDto {
  materialCost: number;
  laborCost: number;
  externalCost: number;
  directCosts: number;
  
  materialMarkupAmount: number;
  laborMarkupAmount: number;
  overheadAmount: number;
  
  subtotal: number;
  profitAmount: number;
  riskAmount: number;
  
  grossTotal: number;
  discountAmount: number;
  
  netTotal: number;
  vatAmount: number;
  grandTotal: number;
  
  hourlyRateEffective: number;  // Calculated effective hourly rate
  marginPercent: number;  // Overall margin %
}
