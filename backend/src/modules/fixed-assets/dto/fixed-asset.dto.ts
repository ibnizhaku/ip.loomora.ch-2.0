import { IsString, IsOptional, IsNumber, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export enum AssetCategory {
  BUILDINGS = 'BUILDINGS',           // Immobilien (4%)
  MACHINERY = 'MACHINERY',           // Maschinen & Geräte (12.5%)
  VEHICLES = 'VEHICLES',             // Fahrzeuge (20%)
  FURNITURE = 'FURNITURE',           // Büromöbel (12.5%)
  IT_EQUIPMENT = 'IT_EQUIPMENT',     // IT & EDV (25%)
  SOFTWARE = 'SOFTWARE',             // Software (33%)
  TOOLS = 'TOOLS',                   // Werkzeuge (25%)
  OTHER = 'OTHER',                   // Sonstige (10%)
}

export enum DepreciationMethod {
  LINEAR = 'LINEAR',                 // Lineare AfA
  DECLINING = 'DECLINING',           // Degressive AfA
}

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  FULLY_DEPRECIATED = 'FULLY_DEPRECIATED',
  DISPOSED = 'DISPOSED',
  SOLD = 'SOLD',
}

export class CreateFixedAssetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AssetCategory)
  category: AssetCategory;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsDateString()
  acquisitionDate: string;

  @IsNumber()
  acquisitionCost: number;

  @IsOptional()
  @IsNumber()
  residualValue?: number; // Restwert

  @IsNumber()
  usefulLife: number; // Nutzungsdauer in Jahren

  @IsEnum(DepreciationMethod)
  depreciationMethod: DepreciationMethod;

  @IsOptional()
  @IsNumber()
  depreciationRate?: number; // Override default rate

  @IsOptional()
  @IsString()
  purchaseInvoiceId?: string;

  @IsOptional()
  @IsString()
  costCenterId?: string;

  @IsOptional()
  @IsString()
  assetAccountId?: string;

  @IsOptional()
  @IsString()
  depreciationAccountId?: string;
}

export class UpdateFixedAssetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  residualValue?: number;

  @IsOptional()
  @IsString()
  costCenterId?: string;
}

export class DisposeAssetDto {
  @IsDateString()
  disposalDate: string;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class DepreciationRunDto {
  @IsNumber()
  year: number;

  @IsOptional()
  @IsBoolean()
  postEntries?: boolean; // Create journal entries
}
