import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  CONFIRMED = 'CONFIRMED',
  PARTIAL = 'PARTIAL',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export class PurchaseOrderItemDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  vatRate?: number;
}

export class CreatePurchaseOrderDto {
  @IsString()
  supplierId: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;
}

export class SendPurchaseOrderDto {
  @IsEnum(['EMAIL', 'PDF', 'PRINT'])
  method: 'EMAIL' | 'PDF' | 'PRINT';

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
