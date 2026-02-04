import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum GoodsReceiptStatus {
  PENDING = 'PENDING',      // Awaiting arrival
  PARTIAL = 'PARTIAL',      // Partially received
  COMPLETE = 'COMPLETE',    // Fully received
  CANCELLED = 'CANCELLED',
}

export enum QualityStatus {
  NOT_CHECKED = 'NOT_CHECKED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}

export class GoodsReceiptItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  orderedQuantity: number;

  @IsNumber()
  receivedQuantity: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsEnum(QualityStatus)
  qualityStatus?: QualityStatus;

  @IsOptional()
  @IsString()
  qualityNotes?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  storageLocation?: string;
}

export class CreateGoodsReceiptDto {
  @IsString()
  purchaseOrderId: string;

  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @IsOptional()
  @IsString()
  deliveryNoteNumber?: string;

  @IsOptional()
  @IsString()
  carrier?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items: GoodsReceiptItemDto[];
}

export class UpdateGoodsReceiptDto {
  @IsOptional()
  @IsEnum(GoodsReceiptStatus)
  status?: GoodsReceiptStatus;

  @IsOptional()
  @IsString()
  deliveryNoteNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items?: GoodsReceiptItemDto[];
}

export class QualityCheckDto {
  @IsString()
  itemId: string;

  @IsEnum(QualityStatus)
  status: QualityStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  acceptedQuantity?: number;

  @IsOptional()
  @IsNumber()
  rejectedQuantity?: number;
}
