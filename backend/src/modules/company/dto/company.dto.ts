import { IsString, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Loomora AG' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Loomora AG' })
  @IsOptional()
  @IsString()
  legalName?: string;

  @ApiPropertyOptional({ example: 'Industriestrasse 10' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: '8000' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ example: 'Zürich' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'CH' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '+41 44 123 45 67' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'info@loomora.ch' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://loomora.ch' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'CHE-123.456.789' })
  @IsOptional()
  @IsString()
  vatNumber?: string;

  @ApiPropertyOptional({ example: 'CH93 0076 2011 6238 5295 7' })
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiPropertyOptional({ example: 'UBSWCHZH80A' })
  @IsOptional()
  @IsString()
  bic?: string;

  @ApiPropertyOptional({ example: 'UBS Switzerland AG' })
  @IsOptional()
  @IsString()
  bankName?: string;
}

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'Max Keller' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'CEO' })
  @IsNotEmpty()
  @IsString()
  role: string;
}
