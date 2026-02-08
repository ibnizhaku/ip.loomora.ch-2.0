import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';

export const PLAN_LIMITS_KEY = 'plan_limits';

/**
 * Definiert Plan-Limit Checks
 * @example @CheckPlanLimit('max_users') oder @CheckPlanLimit('max_projects', 'projects')
 */
export const CheckPlanLimit = (limitKey: string, countTable?: string) => 
  (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(PLAN_LIMITS_KEY, { limitKey, countTable }, descriptor?.value || target);
    return descriptor || target;
  };

/**
 * Plan Limits Guard - Prüft ob Plan-Limits nicht überschritten werden
 * Wird bei Erstellungsoperationen verwendet
 */
@Injectable()
export class PlanLimitsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const limitConfig = this.reflector.getAllAndOverride<{ limitKey: string; countTable?: string }>(
      PLAN_LIMITS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Kein Limit-Check konfiguriert
    if (!limitConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const subscription = request.subscription;
    const plan = request.plan;

    if (!plan?.limits) {
      return true; // Keine Limits definiert
    }

    const limits = plan.limits as Record<string, number>;
    const maxValue = limits[limitConfig.limitKey];

    if (typeof maxValue !== 'number') {
      return true; // Dieses Limit nicht definiert
    }

    // Aktuellen Count ermitteln
    let currentCount = 0;
    const companyId = request.user?.companyId;

    if (!companyId) {
      throw new ForbiddenException('Keine Company');
    }

    switch (limitConfig.limitKey) {
      case 'max_users':
        currentCount = await this.prisma.userCompanyMembership.count({
          where: { companyId },
        });
        break;

      case 'max_projects':
        currentCount = await this.prisma.project.count({
          where: { companyId },
        });
        break;

      case 'max_customers':
        currentCount = await this.prisma.customer.count({
          where: { companyId },
        });
        break;

      case 'max_products':
        currentCount = await this.prisma.product.count({
          where: { companyId },
        });
        break;

      case 'max_invoices_per_month':
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        currentCount = await this.prisma.invoice.count({
          where: {
            companyId,
            createdAt: { gte: startOfMonth },
          },
        });
        break;

      default:
        // Unbekanntes Limit, ignorieren
        return true;
    }

    if (currentCount >= maxValue) {
      throw new ForbiddenException(
        `Plan-Limit erreicht: Maximal ${maxValue} ${this.getLimitLabel(limitConfig.limitKey)} erlaubt. ` +
        `Aktuell: ${currentCount}. Bitte upgraden Sie Ihren Plan.`
      );
    }

    return true;
  }

  private getLimitLabel(key: string): string {
    const labels: Record<string, string> = {
      max_users: 'Benutzer',
      max_projects: 'Projekte',
      max_customers: 'Kunden',
      max_products: 'Produkte',
      max_invoices_per_month: 'Rechnungen pro Monat',
    };
    return labels[key] || key;
  }
}
