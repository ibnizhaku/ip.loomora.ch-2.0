import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  HttpCode, 
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import { WebhookService, ZahlsWebhookEvent } from './webhook.service';
import { 
  CreateCheckoutDto, 
  ChangePlanDto, 
  CancelSubscriptionDto,
} from './dto/subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';
import { SubscriptionGuard } from '../auth/guards/subscription.guard';
import { PermissionGuard, RequirePermissions } from '../auth/guards/permission.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private webhookService: WebhookService,
  ) {}

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  @Get('plans')
  @ApiOperation({ summary: 'Alle verfügbaren Abo-Pläne' })
  async getPlans() {
    return this.subscriptionsService.getAvailablePlans();
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Zahls.ch Webhook Endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook verarbeitet' })
  @ApiResponse({ status: 400, description: 'Ungültige Signatur oder Payload' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-zahls-signature') signature: string,
  ) {
    const rawBody = req.rawBody?.toString() || '';

    // Signatur validieren
    if (!this.webhookService.validateSignature(rawBody, signature || '')) {
      throw new BadRequestException('Ungültige Webhook-Signatur');
    }

    const event = JSON.parse(rawBody) as ZahlsWebhookEvent;
    
    await this.webhookService.processWebhookEvent(event);

    return { received: true };
  }

  // ==========================================
  // AUTHENTICATED ENDPOINTS
  // ==========================================

  @Get('status')
  @UseGuards(JwtAuthGuard, CompanyGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aktueller Subscription-Status' })
  async getStatus(@CurrentUser() user: CurrentUserPayload) {
    return this.subscriptionsService.getSubscriptionStatus(user.companyId);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
  @RequirePermissions('settings:admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Checkout-Session erstellen' })
  @ApiResponse({ status: 200, description: 'Checkout URL generiert' })
  async createCheckout(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.subscriptionsService.createCheckout(user.companyId, user.userId, dto);
  }

  @Post('change-plan')
  @UseGuards(JwtAuthGuard, CompanyGuard, SubscriptionGuard, PermissionGuard)
  @RequirePermissions('settings:admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Abo-Plan wechseln' })
  async changePlan(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChangePlanDto,
  ) {
    return this.subscriptionsService.changePlan(user.companyId, dto);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard, CompanyGuard, SubscriptionGuard, PermissionGuard)
  @RequirePermissions('settings:admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Abo kündigen' })
  async cancelSubscription(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancelSubscription(user.companyId, dto);
  }

  @Post('reactivate')
  @UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
  @RequirePermissions('settings:admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gekündigtes Abo reaktivieren' })
  async reactivateSubscription(@CurrentUser() user: CurrentUserPayload) {
    return this.subscriptionsService.reactivateSubscription(user.companyId);
  }

  // ==========================================
  // ADMIN ENDPOINTS (für internes Testing)
  // ==========================================

  @Get('config-status')
  @UseGuards(JwtAuthGuard, CompanyGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Zahls.ch Konfigurationsstatus prüfen' })
  async getConfigStatus(@CurrentUser() user: CurrentUserPayload) {
    const skipPayment = this.subscriptionsService.isSkipPaymentEnabled();
    return {
      zahlsConfigured: this.subscriptionsService.isZahlsConfigured(),
      skipPaymentEnabled: skipPayment,
      message: skipPayment
        ? 'LOOMORA_SKIP_PAYMENT ist aktiv – Zahlung wird übersprungen.'
        : this.subscriptionsService.isZahlsConfigured()
          ? 'Zahls.ch ist konfiguriert und bereit'
          : 'Zahls.ch ist NICHT konfiguriert. ZAHLS_API_KEY und ZAHLS_WEBHOOK_SECRET müssen gesetzt werden.',
    };
  }
}
