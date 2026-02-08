import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Plan ID' })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ enum: BillingCycle, default: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle = BillingCycle.MONTHLY;

  @ApiPropertyOptional({ description: 'Success redirect URL' })
  @IsString()
  @IsOptional()
  successUrl?: string;

  @ApiPropertyOptional({ description: 'Cancel redirect URL' })
  @IsString()
  @IsOptional()
  cancelUrl?: string;
}

export class ChangePlanDto {
  @ApiProperty({ description: 'New Plan ID' })
  @IsString()
  @IsNotEmpty()
  planId: string;

  @ApiPropertyOptional({ description: 'Change billing cycle', enum: BillingCycle })
  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ description: 'Cancel at period end (default: true)' })
  @IsOptional()
  cancelAtPeriodEnd?: boolean = true;

  @ApiPropertyOptional({ description: 'Cancellation reason' })
  @IsString()
  @IsOptional()
  reason?: string;
}

// Response DTOs

export interface PlanInfo {
  id: string;
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: Record<string, any>;
  limits: Record<string, any>;
}

export interface SubscriptionInfo {
  id: string;
  status: string;
  planId: string;
  planName: string;
  billingCycle: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelledAt?: Date;
  cancelAtPeriodEnd: boolean;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  checkoutUrl?: string;
  requiresZahlsConfiguration?: boolean;
}

export interface SubscriptionStatusResponse {
  subscription: SubscriptionInfo | null;
  company: {
    id: string;
    name: string;
    status: string;
  };
  plan: PlanInfo | null;
  isActive: boolean;
  warning?: string;
}
