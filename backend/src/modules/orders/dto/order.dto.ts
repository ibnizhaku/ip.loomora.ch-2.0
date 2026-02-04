import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentStatus } from '@prisma/client';

export class OrderItemDto {
  @ApiProperty()
  @IsNumber()
  position: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  number?: string;

  @ApiProperty()
  @IsString()
  customerId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  quoteId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  orderDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  deliveryDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({ enum: DocumentStatus })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  customerId: string;

  @ApiPropertyOptional()
  customer?: any;

  @ApiPropertyOptional()
  projectId?: string;

  @ApiPropertyOptional()
  project?: any;

  @ApiPropertyOptional()
  quoteId?: string;

  @ApiProperty()
  status: DocumentStatus;

  @ApiProperty()
  orderDate: Date;

  @ApiPropertyOptional()
  deliveryDate?: Date;

  @ApiPropertyOptional()
  deliveryAddress?: string;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  vatAmount: number;

  @ApiProperty()
  total: number;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  items: any[];

  @ApiProperty()
  createdAt: Date;
}
