import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  type: AccountType;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  createdAt: Date;
}

export class CreateBankAccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  bankName: string;

  @ApiProperty()
  @IsString()
  iban: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bic?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiPropertyOptional({ default: 'CHF' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  balance?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateBankAccountDto extends PartialType(CreateBankAccountDto) {}

export class BankAccountResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  bankName: string;

  @ApiProperty()
  iban: string;

  @ApiPropertyOptional()
  bic?: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  createdAt: Date;
}
