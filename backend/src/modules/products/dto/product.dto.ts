import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';
import { VatRate } from '@prisma/client';

export class CreateProductDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: 'Stk' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  purchasePrice?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiPropertyOptional({ enum: VatRate })
  @IsEnum(VatRate)
  @IsOptional()
  vatRate?: VatRate;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxStock?: number;

  @ApiPropertyOptional({ description: 'Nachbestellpunkt: Alert wenn Bestand darunter fällt' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  reorderPoint?: number;

  @ApiPropertyOptional({ description: 'Empfohlene Bestellmenge bei Nachbestellung' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  reorderQuantity?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isService?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  supplierId?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AdjustStockDto {
  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  purchasePrice: number;

  @ApiProperty()
  salePrice: number;

  @ApiProperty()
  vatRate: VatRate;

  @ApiProperty()
  stockQuantity: number;

  @ApiProperty()
  minStock: number;

  @ApiPropertyOptional()
  maxStock?: number;

  @ApiPropertyOptional()
  reservedStock?: number;

  @ApiProperty()
  isService: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  category?: any;

  @ApiPropertyOptional()
  supplierId?: string;

  @ApiPropertyOptional()
  supplier?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Computed fields
  @ApiPropertyOptional()
  margin?: number;

  @ApiPropertyOptional()
  availableStock?: number;
}
