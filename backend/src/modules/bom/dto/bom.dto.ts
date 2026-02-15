import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export enum BomItemType {
  MATERIAL = 'MATERIAL',
  LABOR = 'LABOR',
  EXTERNAL = 'EXTERNAL',  // Fremdleistung
}

export class BomItemDto {
  @IsEnum(BomItemType)
  type: BomItemType;

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
  hours?: number;  // For labor items

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateBomDto {
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
  templateId?: string;  // Base on existing BOM

  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @IsOptional()
  @IsString()
  category?: string;  // Metalltreppe, Geländer, Tor, etc.

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomItemDto)
  items: BomItemDto[];
}

export class UpdateBomDto extends PartialType(CreateBomDto) {}

// Predefined Swiss Metallbau templates
export const BOM_TEMPLATES = [
  {
    name: 'Metalltreppe Standard',
    category: 'Treppe',
    items: [
      { type: 'MATERIAL', description: 'Stahlprofil U-140', quantity: 12, unit: 'lfm', unitPrice: 45.00 },
      { type: 'MATERIAL', description: 'Trittstufen Riffelblech 800mm', quantity: 15, unit: 'Stk', unitPrice: 85.00 },
      { type: 'MATERIAL', description: 'Geländerpfosten Ø42mm', quantity: 16, unit: 'Stk', unitPrice: 35.00 },
      { type: 'MATERIAL', description: 'Handlauf Ø42mm', quantity: 8, unit: 'lfm', unitPrice: 28.00 },
      { type: 'LABOR', description: 'Schweissarbeiten', hours: 24, hourlyRate: 85.00 },
      { type: 'LABOR', description: 'Montage vor Ort', hours: 8, hourlyRate: 95.00 },
      { type: 'EXTERNAL', description: 'Feuerverzinkung', quantity: 1, unit: 'pauschal', unitPrice: 850.00 },
    ],
  },
  {
    name: 'Geländer / Balkon',
    category: 'Geländer',
    items: [
      { type: 'MATERIAL', description: 'Flachstahl 60x10', quantity: 20, unit: 'lfm', unitPrice: 18.00 },
      { type: 'MATERIAL', description: 'Rundstahl Ø12mm (Stäbe)', quantity: 50, unit: 'lfm', unitPrice: 8.50 },
      { type: 'MATERIAL', description: 'Handlauf Ø42mm Edelstahl', quantity: 6, unit: 'lfm', unitPrice: 65.00 },
      { type: 'LABOR', description: 'Fertigung Werkstatt', hours: 16, hourlyRate: 85.00 },
      { type: 'LABOR', description: 'Montage inkl. Bohren', hours: 6, hourlyRate: 95.00 },
      { type: 'EXTERNAL', description: 'Pulverbeschichtung RAL', quantity: 1, unit: 'pauschal', unitPrice: 420.00 },
    ],
  },
  {
    name: 'Tor / Zaun',
    category: 'Tor',
    items: [
      { type: 'MATERIAL', description: 'Vierkantrohr 40x40x3', quantity: 25, unit: 'lfm', unitPrice: 22.00 },
      { type: 'MATERIAL', description: 'Flachstahl Füllung 30x5', quantity: 40, unit: 'lfm', unitPrice: 12.00 },
      { type: 'MATERIAL', description: 'Torpfosten 100x100x4', quantity: 2, unit: 'Stk', unitPrice: 180.00 },
      { type: 'MATERIAL', description: 'Schloss + Beschläge', quantity: 1, unit: 'Set', unitPrice: 280.00 },
      { type: 'LABOR', description: 'Fertigung', hours: 20, hourlyRate: 85.00 },
      { type: 'LABOR', description: 'Montage + Einbetonieren', hours: 8, hourlyRate: 95.00 },
      { type: 'EXTERNAL', description: 'Feuerverzinkung', quantity: 1, unit: 'pauschal', unitPrice: 680.00 },
    ],
  },
];
