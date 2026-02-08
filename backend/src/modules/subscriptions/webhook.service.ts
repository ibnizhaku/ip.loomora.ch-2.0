import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

export interface ZahlsWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Validiert die Webhook-Signatur
   */
  validateSignature(payload: string, signature: string): boolean {
    const webhookSecret = this.configService.get('ZAHLS_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      this.logger.warn('ZAHLS_WEBHOOK_SECRET nicht konfiguriert');
      return false;
    }

    // HMAC-Signatur berechnen (Anpassung je nach Zahls.ch Dokumentation)
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Verarbeitet eingehende Webhook-Events
   */
  async processWebhookEvent(event: ZahlsWebhookEvent): Promise<void> {
    this.logger.log(`Webhook-Event empfangen: ${event.type} (ID: ${event.id})`);

    // Idempotenz-Check
    const existingEvent = await this.prisma.webhookEvent.findUnique({
      where: { externalEventId: event.id },
    });

    if (existingEvent?.status === 'processed') {
      this.logger.log(`Event ${event.id} bereits verarbeitet, überspringe`);
      return;
    }

    // Event speichern oder aktualisieren
    const webhookEvent = await this.prisma.webhookEvent.upsert({
      where: { externalEventId: event.id },
      create: {
        externalEventId: event.id,
        eventType: event.type,
        payload: event as any,
        status: 'processing',
      },
      update: {
        retryCount: { increment: 1 },
        status: 'processing',
      },
    });

    try {
      // Event-spezifische Verarbeitung
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        default:
          this.logger.warn(`Unbekannter Event-Typ: ${event.type}`);
      }

      // Erfolg markieren
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: 'processed',
          processedAt: new Date(),
        },
      });

      this.logger.log(`Event ${event.id} erfolgreich verarbeitet`);

    } catch (error) {
      this.logger.error(`Fehler bei Event ${event.id}: ${error.message}`);

      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      throw error; // Für Retry
    }
  }

  /**
   * Checkout abgeschlossen - Subscription und Company aktivieren
   */
  private async handleCheckoutCompleted(data: any): Promise<void> {
    const companyId = data.metadata?.companyId;
    const subscriptionId = data.metadata?.subscriptionId;
    const externalSubscriptionId = data.subscription;
    const externalCustomerId = data.customer;

    if (!companyId) {
      throw new BadRequestException('companyId fehlt in Metadata');
    }

    this.logger.log(`Checkout abgeschlossen für Company ${companyId}`);

    // Subscription aktivieren
    await this.prisma.subscription.updateMany({
      where: { 
        OR: [
          { id: subscriptionId },
          { companyId },
        ],
      },
      data: {
        status: 'ACTIVE',
        externalSubscriptionId,
        externalCustomerId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculatePeriodEnd(data),
      },
    });

    // Company aktivieren
    await this.prisma.company.update({
      where: { id: companyId },
      data: { status: 'ACTIVE' },
    });

    this.logger.log(`Company ${companyId} und Subscription aktiviert`);
  }

  /**
   * Rechnung bezahlt - Periode verlängern
   */
  private async handleInvoicePaid(data: any): Promise<void> {
    const subscriptionId = data.subscription;

    if (!subscriptionId) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { externalSubscriptionId: subscriptionId },
    });

    if (!subscription) {
      this.logger.warn(`Subscription ${subscriptionId} nicht gefunden`);
      return;
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodEnd: this.calculatePeriodEnd(data),
      },
    });

    this.logger.log(`Subscription ${subscription.id} Periode verlängert`);
  }

  /**
   * Zahlung fehlgeschlagen
   */
  private async handlePaymentFailed(data: any): Promise<void> {
    const subscriptionId = data.subscription;

    if (!subscriptionId) return;

    const subscription = await this.prisma.subscription.findFirst({
      where: { externalSubscriptionId: subscriptionId },
      include: { company: true },
    });

    if (!subscription) return;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'PAST_DUE' },
    });

    // TODO: Benachrichtigung an User senden

    this.logger.log(`Subscription ${subscription.id} auf PAST_DUE gesetzt`);
  }

  /**
   * Subscription aktualisiert (Plan-Wechsel etc.)
   */
  private async handleSubscriptionUpdated(data: any): Promise<void> {
    const externalSubscriptionId = data.id;

    const subscription = await this.prisma.subscription.findFirst({
      where: { externalSubscriptionId },
    });

    if (!subscription) return;

    // TODO: Plan-Mapping wenn Zahls.ch Price ID anders
    // const newPlanId = await this.mapExternalPriceToInternal(data.items[0].price.id);

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodEnd: data.current_period_end 
          ? new Date(data.current_period_end * 1000) 
          : undefined,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
      },
    });

    this.logger.log(`Subscription ${subscription.id} aktualisiert`);
  }

  /**
   * Subscription gelöscht/abgelaufen
   */
  private async handleSubscriptionDeleted(data: any): Promise<void> {
    const externalSubscriptionId = data.id;

    const subscription = await this.prisma.subscription.findFirst({
      where: { externalSubscriptionId },
      include: { company: true },
    });

    if (!subscription) return;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'EXPIRED' },
    });

    await this.prisma.company.update({
      where: { id: subscription.companyId },
      data: { status: 'SUSPENDED' },
    });

    this.logger.log(`Subscription ${subscription.id} abgelaufen, Company ${subscription.companyId} suspended`);
  }

  /**
   * Berechnet das Periodenende aus Zahls.ch Daten
   */
  private calculatePeriodEnd(data: any): Date {
    if (data.current_period_end) {
      return new Date(data.current_period_end * 1000);
    }
    
    // Fallback: 30 Tage
    const end = new Date();
    end.setDate(end.getDate() + 30);
    return end;
  }
}
