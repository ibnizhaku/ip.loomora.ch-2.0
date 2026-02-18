import { Module, Global } from '@nestjs/common';
import { PdfService } from './services/pdf.service';
import { EmailService } from './services/email.service';
import { CronService } from './services/cron.service';
import { CompanyGuard } from '../modules/auth/guards/company.guard';
import { PermissionGuard } from '../modules/auth/guards/permission.guard';

/**
 * CommonModule ist @Global() — alle darin exportierten Provider
 * sind ohne weiteren Import in sämtlichen Modulen als Injectable verfügbar.
 * CompanyGuard und PermissionGuard werden hier registriert, damit
 * @UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard) in jedem Controller
 * ohne Modul-spezifischen Import funktioniert.
 */
@Global()
@Module({
  providers: [PdfService, EmailService, CronService, CompanyGuard, PermissionGuard],
  exports: [PdfService, EmailService, CompanyGuard, PermissionGuard],
})
export class CommonModule {}
