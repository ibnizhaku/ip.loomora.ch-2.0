import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum QualityCheckStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CONDITIONAL = 'CONDITIONAL',  // Passed with conditions
}

export enum QualityCheckType {
  INCOMING = 'INCOMING',      // Wareneingang
  IN_PROCESS = 'IN_PROCESS',  // Fertigungsbegleitend
  FINAL = 'FINAL',            // Endkontrolle
}

export class ChecklistItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CheckResultDto {
  @IsString()
  checklistItemId: string;

  @IsBoolean()
  passed: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  measuredValue?: string;

  @IsOptional()
  @IsArray()
  photoUrls?: string[];
}

export class CreateQualityChecklistDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(QualityCheckType)
  type?: QualityCheckType;

  @IsOptional()
  @IsString()
  category?: string;  // Schweissnaht, Massgenauigkeit, Oberfläche, etc.

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  items: ChecklistItemDto[];
}

export class CreateQualityCheckDto {
  @IsOptional()
  @IsString()
  productionOrderId?: string;

  @IsOptional()
  @IsString()
  goodsReceiptId?: string;

  @IsString()
  checklistId: string;

  @IsEnum(QualityCheckType)
  type: QualityCheckType;

  @IsOptional()
  @IsString()
  inspectorId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateQualityCheckDto {
  @IsOptional()
  @IsEnum(QualityCheckStatus)
  status?: QualityCheckStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckResultDto)
  results?: CheckResultDto[];
}

export class CompleteQualityCheckDto {
  @IsEnum(QualityCheckStatus)
  status: QualityCheckStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckResultDto)
  results: CheckResultDto[];
}

// Predefined checklists for Swiss Metallbau
export const QUALITY_CHECKLISTS = [
  {
    name: 'Schweissnaht-Kontrolle',
    category: 'Schweissen',
    type: 'IN_PROCESS',
    items: [
      { name: 'Nahtbreite gemäss Zeichnung', required: true },
      { name: 'Nahthöhe gemäss Norm', required: true },
      { name: 'Keine Poren sichtbar', required: true },
      { name: 'Keine Risse', required: true },
      { name: 'Einbrandtiefe ausreichend', required: true },
      { name: 'Schweissspritzer entfernt', required: false },
    ],
  },
  {
    name: 'Massgenauigkeit',
    category: 'Masse',
    type: 'FINAL',
    items: [
      { name: 'Gesamtlänge ±2mm', required: true },
      { name: 'Gesamtbreite ±2mm', required: true },
      { name: 'Rechtwinkligkeit ±0.5°', required: true },
      { name: 'Lochabstände ±1mm', required: true },
      { name: 'Bohrdurchmesser ±0.5mm', required: true },
    ],
  },
  {
    name: 'Oberflächenbehandlung',
    category: 'Oberfläche',
    type: 'FINAL',
    items: [
      { name: 'Schichtdicke gemessen', required: true },
      { name: 'Farbton gemäss RAL', required: true },
      { name: 'Keine Läufer oder Nasen', required: true },
      { name: 'Keine unbehandelten Stellen', required: true },
      { name: 'Haftung geprüft', required: true },
    ],
  },
  {
    name: 'Wareneingang Material',
    category: 'Eingang',
    type: 'INCOMING',
    items: [
      { name: 'Lieferschein vorhanden', required: true },
      { name: 'Menge stimmt überein', required: true },
      { name: 'Material-Zertifikat vorhanden', required: false },
      { name: 'Keine Transportschäden', required: true },
      { name: 'Kennzeichnung korrekt', required: true },
    ],
  },
];
