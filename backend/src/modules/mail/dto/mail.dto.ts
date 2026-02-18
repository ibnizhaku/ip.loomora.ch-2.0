import { IsString, IsEmail, IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertMailAccountDto {
  @ApiProperty({ example: 'smtp.gmail.com' })
  @IsString()
  smtpHost: string;

  @ApiProperty({ example: 587 })
  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort: number;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsString()
  smtpUser: string;

  @ApiPropertyOptional({ description: 'Leer lassen um bestehendes Passwort zu behalten' })
  @IsOptional()
  @IsString()
  smtpPassword?: string;

  @ApiProperty({ example: 'Loomora ERP' })
  @IsString()
  fromName: string;

  @ApiProperty({ example: 'noreply@company.ch' })
  @IsEmail()
  fromEmail: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  smtpSsl: boolean;
}

export class SendMailDto {
  @ApiProperty({ example: 'kunde@example.ch' })
  @IsEmail()
  to: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  cc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  bcc?: string;

  @ApiProperty({ example: 'Ihre Rechnung RE-2024-001' })
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Sehr geehrte Damen und Herren...' })
  @IsString()
  message: string;

  @ApiProperty({
    example: 'invoice',
    description: 'invoice | quote | order | delivery-note | reminder | credit-note',
  })
  @IsString()
  documentType: string;

  @ApiProperty({ example: 'clxyz123...' })
  @IsString()
  documentId: string;
}
