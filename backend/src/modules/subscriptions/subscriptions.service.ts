import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ZahlsService } from './zahls.service';
import { 
  CreateCheckoutDto, 
  ChangePlanDto, 
  CancelSubscriptionDto,
  CheckoutResponse,
  SubscriptionStatusResponse,
  PlanInfo,
} from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private zahlsService: ZahlsService,
  ) {}

  /**
   * Prüft ob Zahls.ch vollständig konfiguriert ist (API Key für Checkout, Webhook Secret für Bestätigungen)
   */
  isZahlsConfigured(): boolean {
    const webhookSecret = this.configService.get('ZAHLS_WEBHOOK_SECRET');
    return this.zahlsService.isConfigured() && !!webhookSecret;
  }

  /**
   * Dev/Demo bypass: Skip payment flow, activate company directly
   */
  isSkipPaymentEnabled(): boolean {
    return this.configService.get('LOOMORA_SKIP_PAYMENT') === 'true';
  }

  /**
   * Alle verfügbaren Pläne laden
   */
  async getAvailablePlans(): Promise<PlanInfo[]> {
    const plans = await this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return plans.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      priceMonthly: Number(p.priceMonthly),
      priceYearly: Number(p.priceYearly),
      currency: p.currency,
      features: p.features as Record<string, any>,
      limits: p.limits as Record<string, any>,
    }));
  }

  /**
   * Aktuellen Subscription-Status für Company laden
   */
  async getSubscriptionStatus(companyId: string): Promise<SubscriptionStatusResponse> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company nicht gefunden');
    }

    const subscription = company.subscriptions[0] || null;

    let warning: string | undefined;
    if (subscription?.status === 'PAST_DUE') {
      warning = 'Zahlung fehlgeschlagen. Bitte Zahlungsmethode aktualisieren.';
    } else if (subscription?.status === 'CANCELLED' && subscription.currentPeriodEnd) {
      warning = `Abonnement gekündigt. Zugang endet am ${subscription.currentPeriodEnd.toLocaleDateString('de-CH')}`;
    }

    return {
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
        planName: subscription.plan.name,
        billingCycle: subscription.billingCycle,
        currentPeriodStart: subscription.currentPeriodStart || undefined,
        currentPeriodEnd: subscription.currentPeriodEnd || undefined,
        cancelledAt: subscription.cancelledAt || undefined,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      } : null,
      company: {
        id: company.id,
        name: company.name,
        status: company.status,
      },
      plan: subscription ? {
        id: subscription.plan.id,
        name: subscription.plan.name,
        description: subscription.plan.description || undefined,
        priceMonthly: Number(subscription.plan.priceMonthly),
        priceYearly: Number(subscription.plan.priceYearly),
        currency: subscription.plan.currency,
        features: subscription.plan.features as Record<string, any>,
        limits: subscription.plan.limits as Record<string, any>,
      } : null,
      isActive: subscription?.status === 'ACTIVE' || subscription?.status === 'PAST_DUE',
      warning,
    };
  }

  /**
   * Checkout-Session erstellen
   * Bei LOOMORA_SKIP_PAYMENT=true: Aktiviert Company direkt und gibt successUrl zurück
   */
  async createCheckout(companyId: string, userId: string, dto: CreateCheckoutDto): Promise<CheckoutResponse> {
    // Plan validieren
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan nicht gefunden oder nicht aktiv');
    }

    // Subscription aktualisieren oder erstellen
    let subscription = await this.prisma.subscription.findFirst({
      where: { companyId },
    });

    if (subscription) {
      subscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          planId: dto.planId,
          billingCycle: dto.billingCycle || 'MONTHLY',
          status: 'PENDING',
        },
      });
    } else {
      subscription = await this.prisma.subscription.create({
        data: {
          companyId,
          planId: dto.planId,
          billingCycle: dto.billingCycle || 'MONTHLY',
          status: 'PENDING',
        },
      });
    }

    // Dev/Demo bypass: Keine Zahlung, Company sofort aktivieren
    if (this.isSkipPaymentEnabled()) {
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (dto.billingCycle === 'YEARLY' ? 12 : 1));
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
        },
      });
      await this.prisma.company.update({
        where: { id: companyId },
        data: { status: 'ACTIVE' },
      });
      this.logger.log(`[SKIP_PAYMENT] Company ${companyId} und Subscription aktiviert`);
      const frontendUrl = this.configService.get('LOOMORA_FRONTEND_URL') || this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
      const successUrl = dto.successUrl || `${frontendUrl}/payment-pending?success=1`;
      return {
        success: true,
        message: 'Zahlung übersprungen (LOOMORA_SKIP_PAYMENT).',
        checkoutUrl: successUrl,
      };
    }

    // Zahls.ch nicht konfiguriert
    if (!this.isZahlsConfigured()) {
      this.logger.warn('Zahls.ch ist nicht konfiguriert. Checkout nicht möglich.');
      return {
        success: false,
        message: 'Zahlungssystem noch nicht konfiguriert. Bitte kontaktieren Sie den Administrator.',
        requiresZahlsConfiguration: true,
      };
    }

    // Betrag berechnen (CHF in Rappen)
    const priceChf = dto.billingCycle === 'YEARLY' ? Number(plan.priceYearly) : Number(plan.priceMonthly);
    const amountCents = Math.round(priceChf * 100);

    const frontendUrl = this.configService.get('LOOMORA_FRONTEND_URL') || this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    const successUrl = dto.successUrl || `${frontendUrl}/payment-pending?success=1`;
    const cancelUrl = dto.cancelUrl || `${frontendUrl}/payment-pending`;

    const zahlsResult = await this.zahlsService.createCheckout({
      amount: amountCents,
      currency: plan.currency || 'CHF',
      successUrl,
      cancelUrl,
      description: `Loomora ${plan.name} - ${dto.billingCycle || 'MONTHLY'}`,
      metadata: {
        companyId,
        userId,
        subscriptionId: subscription.id,
        planId: plan.id,
      },
    });

    if (!zahlsResult?.url) {
      this.logger.error(`Zahls checkout failed for Company ${companyId}`);
      return {
        success: false,
        message: 'Checkout konnte nicht erstellt werden. Bitte später erneut versuchen.',
      };
    }

    this.logger.log(`Checkout für Company ${companyId} erstellt, Plan: ${plan.name}`);
    return {
      success: true,
      message: 'Checkout erstellt',
      checkoutUrl: zahlsResult.url,
    };
  }

  /**
   * Plan wechseln
   */
  async changePlan(companyId: string, dto: ChangePlanDto): Promise<SubscriptionStatusResponse> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { companyId },
    });

    if (!subscription) {
      throw new NotFoundException('Keine Subscription gefunden');
    }

    const newPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!newPlan || !newPlan.isActive) {
      throw new NotFoundException('Plan nicht gefunden');
    }

    // TODO: Zahls.ch API für Plan-Wechsel aufrufen
    // await this.zahlsClient.updateSubscription(subscription.externalSubscriptionId, { ... });

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: dto.planId,
        ...(dto.billingCycle && { billingCycle: dto.billingCycle }),
      },
    });

    this.logger.log(`Plan für Company ${companyId} geändert zu ${newPlan.name}`);

    return this.getSubscriptionStatus(companyId);
  }

  /**
   * Subscription kündigen
   */
  async cancelSubscription(companyId: string, dto: CancelSubscriptionDto): Promise<SubscriptionStatusResponse> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { companyId },
    });

    if (!subscription) {
      throw new NotFoundException('Keine Subscription gefunden');
    }

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestException('Subscription bereits gekündigt');
    }

    // TODO: Zahls.ch API für Kündigung aufrufen
    // await this.zahlsClient.cancelSubscription(subscription.externalSubscriptionId, { ... });

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelAtPeriodEnd: dto.cancelAtPeriodEnd ?? true,
      },
    });

    this.logger.log(`Subscription für Company ${companyId} gekündigt`);

    return this.getSubscriptionStatus(companyId);
  }

  /**
   * Subscription reaktivieren
   */
  async reactivateSubscription(companyId: string): Promise<SubscriptionStatusResponse> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { companyId },
    });

    if (!subscription) {
      throw new NotFoundException('Keine Subscription gefunden');
    }

    if (subscription.status !== 'CANCELLED') {
      throw new BadRequestException('Nur gekündigte Subscriptions können reaktiviert werden');
    }

    // Prüfen ob noch innerhalb der Periode
    if (subscription.currentPeriodEnd && new Date() > subscription.currentPeriodEnd) {
      throw new BadRequestException('Periode abgelaufen. Bitte neuen Checkout starten.');
    }

    // TODO: Zahls.ch API für Reaktivierung aufrufen
    // await this.zahlsClient.reactivateSubscription(subscription.externalSubscriptionId);

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        cancelledAt: null,
        cancelAtPeriodEnd: false,
      },
    });

    // Company auch aktivieren falls suspended
    await this.prisma.company.update({
      where: { id: companyId },
      data: { status: 'ACTIVE' },
    });

    this.logger.log(`Subscription für Company ${companyId} reaktiviert`);

    return this.getSubscriptionStatus(companyId);
  }
}
