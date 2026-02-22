import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Subscription Guard - Prüft ob Company eine aktive Subscription hat
 * Wird nach CompanyGuard ausgeführt
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.companyId) {
      throw new ForbiddenException('Keine aktive Company');
    }

    // Subscription laden
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        companyId: user.companyId,
        status: { in: ['ACTIVE', 'PAST_DUE', 'CANCELLED'] },
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      throw new ForbiddenException('Keine Subscription gefunden. Bitte ein Abonnement abschliessen.');
    }

    // Periodenende prüfen (auch bei ACTIVE)
    if (subscription.currentPeriodEnd && new Date() > subscription.currentPeriodEnd) {
      if (subscription.status === 'ACTIVE' || subscription.status === 'PAST_DUE') {
        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'EXPIRED' },
        });
      }
      throw new ForbiddenException('Abonnement abgelaufen. Bitte erneuern.');
    }

    // Status prüfen
    switch (subscription.status) {
      case 'PENDING':
        throw new ForbiddenException('Zahlung steht noch aus. Bitte Zahlungsvorgang abschliessen.');
      
      case 'EXPIRED':
        throw new ForbiddenException('Abonnement abgelaufen. Bitte erneuern.');
      
      case 'PAST_DUE':
        // Grace Period - Zugriff erlaubt aber mit Warnung
        request.subscriptionWarning = 'Zahlung fehlgeschlagen. Bitte Zahlungsmethode aktualisieren.';
        break;
      
      case 'CANCELLED':
        // Prüfen ob noch innerhalb der bezahlten Periode
        if (subscription.currentPeriodEnd && new Date() > subscription.currentPeriodEnd) {
          throw new ForbiddenException('Abonnement gekündigt und Periode abgelaufen.');
        }
        request.subscriptionWarning = 'Abonnement gekündigt. Zugang endet am ' + 
          subscription.currentPeriodEnd?.toLocaleDateString('de-CH');
        break;
      
      case 'ACTIVE':
        // Alles gut
        break;
    }

    // Subscription-Daten in Request speichern
    request.subscription = subscription;
    request.plan = subscription.plan;

    return true;
  }
}
