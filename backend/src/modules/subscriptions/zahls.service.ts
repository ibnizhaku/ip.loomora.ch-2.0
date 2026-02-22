import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ZahlsCheckoutParams {
  amount: number; // in cents (CHF: 1 CHF = 100 cents)
  currency: string;
  successUrl: string;
  cancelUrl?: string;
  description?: string;
  metadata: Record<string, string>;
}

export interface ZahlsCheckoutResult {
  url: string;
  id?: string;
}

/**
 * Zahls.ch payment provider integration.
 * API docs: https://docs.zahls.ch (requires account)
 * Env: ZAHLS_API_KEY, ZAHLS_API_URL (optional, default https://api.zahls.ch/v2)
 */
@Injectable()
export class ZahlsService {
  private readonly logger = new Logger(ZahlsService.name);

  constructor(private configService: ConfigService) {}

  getApiKey(): string | undefined {
    return this.configService.get('ZAHLS_API_KEY');
  }

  getApiUrl(): string {
    return this.configService.get('ZAHLS_API_URL') || 'https://api.zahls.ch/v2';
  }

  isConfigured(): boolean {
    return !!this.getApiKey();
  }

  /**
   * Create a checkout session and return the payment URL.
   * Zahls.ch uses: POST /Transaction to create a one-time payment.
   * Reference: common pattern for Swiss payment APIs.
   */
  async createCheckout(params: ZahlsCheckoutParams): Promise<ZahlsCheckoutResult | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.warn('ZAHLS_API_KEY not configured');
      return null;
    }

    const baseUrl = this.getApiUrl();

    try {
      // Zahls.ch Transaction API: creates a payment link
      // Endpoint may vary - check docs.zahls.ch for exact path
      const response = await fetch(`${baseUrl}/Transaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(params.amount),
          currency: params.currency,
          successRedirectUrl: params.successUrl,
          failedRedirectUrl: params.cancelUrl || params.successUrl,
          cancelRedirectUrl: params.cancelUrl || params.successUrl,
          description: params.description || 'Loomora Subscription',
          metadata: params.metadata,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`Zahls API error ${response.status}: ${errText}`);
        return null;
      }

      const data = await response.json();

      // Response structure may vary - support common patterns
      const url = data.url ?? data.data?.url ?? data.checkoutUrl ?? data.paymentUrl;
      const id = data.id ?? data.data?.id ?? data.transactionId;

      if (!url || typeof url !== 'string') {
        this.logger.warn('Zahls API did not return a checkout URL', JSON.stringify(data));
        return null;
      }

      return { url, id };
    } catch (err: any) {
      this.logger.error(`Zahls API request failed: ${err?.message}`);
      return null;
    }
  }
}
