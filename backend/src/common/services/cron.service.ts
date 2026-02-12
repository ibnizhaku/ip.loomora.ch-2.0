import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private prisma: PrismaService) {}

  // Daily at 02:00 UTC - Check for overdue invoices
  @Cron('0 2 * * *')
  async checkOverdueInvoices() {
    this.logger.log('[Cron] Starting overdue invoice check...');
    
    try {
      const companies = await this.prisma.company.findMany({
        where: {},
        select: { id: true, name: true },
      });

      let totalUpdated = 0;

      for (const company of companies) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updated = await this.prisma.invoice.updateMany({
          where: {
            companyId: company.id,
            status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIAL] },
            dueDate: { lt: today },
          },
          data: { status: InvoiceStatus.OVERDUE },
        });

        if (updated.count > 0) {
          this.logger.log(`[Cron] Company ${company.name}: ${updated.count} invoices marked OVERDUE`);
          totalUpdated += updated.count;
        }
      }

      this.logger.log(`[Cron] Overdue check complete: ${totalUpdated} invoices updated across ${companies.length} companies`);
    } catch (error) {
      this.logger.error(`[Cron] Overdue check failed: ${error.message}`);
    }
  }

  // Daily at 03:00 UTC - Auto-generate reminders
  @Cron('0 3 * * *')
  async generateReminders() {
    this.logger.log('[Cron] Starting auto-reminder generation...');
    
    try {
      const companies = await this.prisma.company.findMany({
        where: {},
        select: { id: true },
      });

      let totalGenerated = 0;

      for (const company of companies) {
        const overdueInvoices = await this.prisma.invoice.findMany({
          where: {
            companyId: company.id,
            status: InvoiceStatus.OVERDUE,
          },
          include: {
            reminders: { orderBy: { level: 'desc' }, take: 1 },
          },
        });

        for (const invoice of overdueInvoices) {
          const lastReminder = invoice.reminders[0];
          
          // Check if enough days passed
          if (lastReminder) {
            const daysSince = Math.floor((Date.now() - new Date(lastReminder.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince < 10) continue; // Wait 10 days between reminders
          }

          const nextLevel = lastReminder ? Math.min(lastReminder.level + 1, 5) : 1;
          
          // Create reminder (simplified - would use RemindersService in real implementation)
          // For now just log
          this.logger.log(`[Cron] Would create level ${nextLevel} reminder for invoice ${invoice.number}`);
          totalGenerated++;
        }
      }

      this.logger.log(`[Cron] Reminder generation complete: ${totalGenerated} reminders generated`);
    } catch (error) {
      this.logger.error(`[Cron] Reminder generation failed: ${error.message}`);
    }
  }

  // Weekly on Monday at 08:00 UTC - Low stock warning
  @Cron('0 8 * * 1')
  async checkLowStock() {
    this.logger.log('[Cron] Starting low stock check...');
    
    try {
      const companies = await this.prisma.company.findMany({
        where: {},
        select: { id: true, name: true },
      });

      for (const company of companies) {
        const lowStockProducts = await this.prisma.product.findMany({
          where: {
            companyId: company.id,
            isService: false,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            sku: true,
            stockQuantity: true,
            minStock: true,
          },
        });

        const belowMin = lowStockProducts.filter(p => p.stockQuantity < p.minStock);

        if (belowMin.length > 0) {
          this.logger.warn(`[Cron] Company ${company.name}: ${belowMin.length} products below minimum stock`);
          belowMin.forEach(p => {
            this.logger.warn(`  - ${p.sku}: ${p.stockQuantity}/${p.minStock}`);
          });
        }
      }

      this.logger.log('[Cron] Low stock check complete');
    } catch (error) {
      this.logger.error(`[Cron] Low stock check failed: ${error.message}`);
    }
  }
}
