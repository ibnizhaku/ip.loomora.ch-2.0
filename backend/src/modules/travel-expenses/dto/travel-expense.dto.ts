import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateTravelExpenseDto {
  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  kilometers?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  kmRate?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  mealAllowance?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  accommodation?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  otherExpenses?: number;

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receiptUrl?: string;
}

export class UpdateTravelExpenseDto extends PartialType(CreateTravelExpenseDto) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;
}
