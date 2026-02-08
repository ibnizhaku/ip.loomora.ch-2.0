import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// LOGIN
// ============================================

export class LoginDto {
  @ApiProperty({ example: 'admin@loomora.ch' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class SelectCompanyDto {
  @ApiProperty({ description: 'Company ID to set as active' })
  @IsString()
  @IsNotEmpty()
  companyId: string;
}

export class SwitchCompanyDto {
  @ApiProperty({ description: 'Company ID to switch to' })
  @IsString()
  @IsNotEmpty()
  companyId: string;
}

// ============================================
// REGISTRATION
// ============================================

export class RegisterDto {
  @ApiProperty({ example: 'admin@loomora.ch' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Max' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Keller' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'Loomora AG' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiPropertyOptional({ example: 'loomora-ag', description: 'URL-friendly company slug' })
  @IsString()
  @IsOptional()
  companySlug?: string;
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

// ============================================
// INVITATION
// ============================================

export class InviteUserDto {
  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Role ID to assign' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Invitation token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional({ description: 'Password (required if user does not exist)' })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'Max' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Keller' })
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class CreateUserDirectDto {
  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'TempPass123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Max' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Keller' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Role ID to assign' })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  sendWelcomeEmail?: boolean;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface CompanySummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
  isOwner: boolean;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  status: string;
}

export interface ActiveCompanyInfo {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscriptionStatus: string;
  planName: string;
  role: string;
  permissions: string[];
  isOwner: boolean;
}

export class TokenResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: UserInfo;

  @ApiPropertyOptional({ description: 'Active company (if set)' })
  activeCompany?: ActiveCompanyInfo;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken?: string;

  @ApiProperty()
  refreshToken?: string;

  @ApiProperty()
  user: UserInfo;

  @ApiPropertyOptional({ description: 'If true, user must select a company' })
  requiresCompanySelection?: boolean;

  @ApiPropertyOptional({ description: 'Available companies to select from' })
  availableCompanies?: CompanySummary[];

  @ApiPropertyOptional({ description: 'Active company (if auto-selected)' })
  activeCompany?: ActiveCompanyInfo;
}

export class RegistrationResponseDto {
  @ApiProperty()
  user: UserInfo;

  @ApiProperty()
  company: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };

  @ApiProperty({ description: 'Payment required before access' })
  requiresPayment: boolean;

  @ApiPropertyOptional({ description: 'Checkout URL (when Zahls.ch is configured)' })
  checkoutUrl?: string;

  @ApiPropertyOptional({ description: 'Temporary token for payment flow' })
  temporaryToken?: string;
}

export class InvitationInfoDto {
  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  companyName?: string;

  @ApiPropertyOptional()
  roleName?: string;

  @ApiPropertyOptional()
  expiresAt?: Date;

  @ApiPropertyOptional()
  userExists?: boolean;

  @ApiPropertyOptional()
  errorMessage?: string;
}
