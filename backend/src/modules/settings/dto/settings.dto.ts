import { IsString, IsOptional, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  // Lokalisierung
  @ApiPropertyOptional({ example: 'de' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'Europe/Zurich' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'DD.MM.YYYY' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  // Währung
  @ApiPropertyOptional({ example: 'CHF' })
  @IsOptional()
  @IsString()
  currency?: string;

  // Dokumente / Nummernkreise
  @ApiPropertyOptional({ example: 'RE-' })
  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  invoiceNextNumber?: number;

  @ApiPropertyOptional({ example: 'AN-' })
  @IsOptional()
  @IsString()
  quotePrefix?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  quoteNextNumber?: number;

  @ApiPropertyOptional({ example: 'AU-' })
  @IsOptional()
  @IsString()
  orderPrefix?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  orderNextNumber?: number;

  @ApiPropertyOptional({ example: 'LS-' })
  @IsOptional()
  @IsString()
  deliveryNotePrefix?: string;

  @ApiPropertyOptional({ example: 'GS-' })
  @IsOptional()
  @IsString()
  creditNotePrefix?: string;

  @ApiPropertyOptional({ example: 'BE-' })
  @IsOptional()
  @IsString()
  purchaseOrderPrefix?: string;

  @ApiPropertyOptional({ example: 'KD-' })
  @IsOptional()
  @IsString()
  customerPrefix?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  customerNextNumber?: number;

  @ApiPropertyOptional({ example: 'PRJ-' })
  @IsOptional()
  @IsString()
  projectPrefix?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  projectNextNumber?: number;

  // PDF-Optionen
  @ApiPropertyOptional({ example: 'top-left' })
  @IsOptional()
  @IsString()
  logoPosition?: string;

  @ApiPropertyOptional({ example: 'top-left' })
  @IsOptional()
  @IsString()
  pdfLogoPosition?: string;

  @ApiPropertyOptional({ example: '#1a1a2e' })
  @IsOptional()
  @IsString()
  headerColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  footerLeft?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  footerRight?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfFooterText?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  pdfShowBankDetails?: boolean;

  @ApiPropertyOptional({ example: 'de' })
  @IsOptional()
  @IsString()
  pdfDefaultLanguage?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enableQrInvoice?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enablePdfA?: boolean;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  defaultPaymentTerms?: number;

  // Benachrichtigungen
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  invoiceReminders?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  projectUpdates?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notifyOnNewInvoice?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notifyOnPaymentReceived?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notifyOnContractExpiring?: boolean;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  notifyDaysBeforeExpiry?: number;

  // Sicherheit
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ example: 480 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  sessionTimeoutMin?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(6)
  @Max(128)
  passwordMinLength?: number;
}
