import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateCostCenterDto {
  @IsString()
  number: string; // e.g., 100, 200, etc.

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  managerId?: string; // Employee responsible

  @IsOptional()
  @IsNumber()
  budgetAmount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCostCenterDto extends PartialType(CreateCostCenterDto) {}

export class CostCenterReportDto {
  startDate: string;
  endDate: string;

  @IsOptional()
  @IsArray()
  costCenterIds?: string[];
}
