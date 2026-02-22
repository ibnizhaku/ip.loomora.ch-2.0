import { Module, Global } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { EmailService } from './services/email.service';
import { CronService } from './services/cron.service';
import { CryptoService } from './crypto.service';
import { CompanyGuard } from '../modules/auth/guards/company.guard';
import { PermissionGuard } from '../modules/auth/guards/permission.guard';
import { SubscriptionGuard } from '../modules/auth/guards/subscription.guard';
import { PlanLimitsGuard } from '../modules/auth/guards/plan-limits.guard';

/**
 * CommonModule ist @Global() — alle darin exportierten Provider
 * sind ohne weiteren Import in sämtlichen Modulen als Injectable verfügbar.
 * Guards werden hier registriert für Verwendung in Controllern.
 */
@Global()
@Module({
  providers: [PdfService, EmailService, CronService, CryptoService, CompanyGuard, PermissionGuard, SubscriptionGuard, PlanLimitsGuard],
  exports: [PdfService, EmailService, CryptoService, CompanyGuard, PermissionGuard, SubscriptionGuard, PlanLimitsGuard],
})
export class CommonModule {}
