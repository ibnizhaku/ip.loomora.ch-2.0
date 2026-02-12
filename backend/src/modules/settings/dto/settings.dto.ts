import { IsString, IsOptional, IsBoolean, IsInt, IsEmail, Min, Max } from 'class-validator';
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

  // E-Mail/SMTP
  @ApiPropertyOptional({ example: 'smtp.example.com' })
  @IsOptional()
  @IsString()
  smtpHost?: string;

  @ApiPropertyOptional({ example: 587 })
  @IsOptional()
  @IsInt()
  smtpPort?: number;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsString()
  smtpUser?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smtpPassword?: string;

  @ApiPropertyOptional({ example: 'noreply@example.com' })
  @IsOptional()
  @IsString()
  smtpFrom?: string;

  @ApiPropertyOptional({ example: 'Loomora ERP' })
  @IsOptional()
  @IsString()
  smtpFromName?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  smtpSsl?: boolean;

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
