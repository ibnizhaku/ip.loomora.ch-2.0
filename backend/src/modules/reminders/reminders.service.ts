import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateReminderDto, 
  UpdateReminderDto, 
  SendReminderDto,
  CreateBatchRemindersDto,
  RecordPaymentDto,
  ReminderStatus,
  ReminderLevel,
  REMINDER_FEES,
  INKASSO_FEE,
  SendMethod,
} from './dto/reminder.dto';
import { mapReminderResponse } from '../../common/mappers/response.mapper';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    level?: number;
    customerId?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, level, customerId, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };

    // Status-Filter: unterstützt einzelnen Wert ODER kommaseparierte Liste (z.B. "SENT,PAID,CANCELLED")
    if (status) {
      const statuses = status.split(',').map(s => s.trim()).filter(Boolean);
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }

    if (level) where.level = level;
    if (customerId) where.invoice = { customerId };
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { invoice: { number: { contains: search, mode: 'insensitive' } } },
        { invoice: { customer: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.reminder.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              totalAmount: true,
              dueDate: true,
              date: true,
              status: true,
              projectId: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                  companyName: true,
                  email: true,
                  phone: true,
                  street: true,
                  zipCode: true,
                  city: true,
                  country: true,
                },
              },
            },
          },
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        } as any,
      }),
      this.prisma.reminder.count({ where }),
    ]);

    return {
      data: data.map(mapReminderResponse),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const reminder = await this.prisma.reminder.findFirst({
      where: { id, companyId },
      include: {
        invoice: {
          include: {
            customer: true,
            items: { include: { product: true } },
          },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      } as any,
    });

    if (!reminder) {
      throw new NotFoundException('Mahnung nicht gefunden');
    }

    return reminder;
  }

  async create(companyId: string, dto: CreateReminderDto, userId?: string) {
    // Get invoice (inkl. projectId für automatische Übernahme)
    const invoice = await (this.prisma.invoice as any).findFirst({
      where: { id: dto.invoiceId, companyId },
      include: { customer: true },
    });

    if (!invoice) {
      throw new NotFoundException('Rechnung nicht gefunden');
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Rechnung ist bereits bezahlt');
    }

    // Get last reminder for this invoice to determine level
    const lastReminder = await this.prisma.reminder.findFirst({
      where: { invoiceId: dto.invoiceId },
      orderBy: { level: 'desc' },
    });

    const level = dto.level ?? (lastReminder ? Math.min(lastReminder.level + 1, 5) : 1);
    
    if (level < 1 || level > 5) {
      throw new BadRequestException('Mahnstufe muss zwischen 1 und 5 liegen');
    }

    // 10-Tage-Mindestfrist seit letzter Mahnung (Schweizer Mahnpraxis)
    if (lastReminder && lastReminder.status === ReminderStatus.SENT) {
      const daysSinceLast = Math.floor(
        (Date.now() - new Date(lastReminder.sentAt || lastReminder.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceLast < 10) {
        throw new BadRequestException(
          `Zwischen Mahnungen müssen mindestens 10 Tage liegen. Letzte Mahnung vor ${daysSinceLast} Tagen.`,
        );
      }
    }

    // Mahngebühr nach Stufe (Stufe 5 = Letzte Mahnung inkl. Inkasso-Gebühr)
    const fee = REMINDER_FEES[level] || 0;

    // Calculate interest (OR Art. 104: default 5% p.a.)
    const interestRate = dto.interestRate ?? 5;
    const invoiceDueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date();
    const overdueDays = Math.max(0, Math.floor((Date.now() - invoiceDueDate.getTime()) / (1000 * 60 * 60 * 24)));
    const openAmount = Number(invoice.totalAmount) - Number(invoice.paidAmount || 0);
    const interestAmount = overdueDays > 0 ? openAmount * (interestRate / 100) * (overdueDays / 365) : 0;
    const interestAmountRounded = Math.round(interestAmount * 100) / 100;

    const totalWithFee = openAmount + fee + interestAmountRounded;

    // Generate reminder number – atomischer Counter via Raw SQL (reminderCounter Spalte)
    const year = new Date().getFullYear();
    const result = await this.prisma.$queryRaw<[{ reminderCounter: number }]>`
      UPDATE companies SET "reminderCounter" = "reminderCounter" + 1
      WHERE id = ${companyId}
      RETURNING "reminderCounter"
    `;
    const counterValue = Number(result[0]?.reminderCounter ?? 1);
    const number = `MHN-${year}-${String(counterValue).padStart(5, '0')}`;

    // Calculate due date (typically 10 days from now)
    const dueDate = dto.dueDate 
      ? new Date(dto.dueDate) 
      : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    const reminder = await this.prisma.reminder.create({
      data: {
        companyId,
        invoiceId: dto.invoiceId,
        number,
        level,
        status: ReminderStatus.DRAFT,
        fee,
        totalWithFee,
        interestRate,
        interestAmount: interestAmountRounded,
        dueDate,
        notes: dto.notes,
        ...(userId ? { createdById: userId } : {}),
        ...(invoice.projectId ? { projectId: invoice.projectId } : {}),
      } as any,
      include: {
        invoice: {
          include: { customer: true },
        },
      },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'REMINDERS' as any,
            entityType: 'REMINDER',
            entityId: reminder.id,
            entityName: reminder.number || '',
            action: 'CREATE' as any,
            description: `Mahnung "${reminder.number}" erstellt`,
            newValues: { number: reminder.number, level: reminder.level, status: reminder.status },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return reminder;
  }

  async update(id: string, companyId: string, dto: UpdateReminderDto, userId?: string) {
    const reminder = await this.findOne(id, companyId);

    if (reminder.status === ReminderStatus.SENT && !dto.status) {
      throw new BadRequestException('Versendete Mahnung kann nicht bearbeitet werden');
    }

    const oldValues = { status: reminder.status, dueDate: reminder.dueDate, notes: reminder.notes, fee: reminder.fee };

    // Gebühr und Zinsen neu berechnen wenn fee oder interestRate geändert werden
    let newFee = dto.fee !== undefined ? dto.fee : undefined;
    let newInterestRate = dto.interestRate !== undefined ? dto.interestRate : undefined;
    let newTotalWithFee: number | undefined;

    if (newFee !== undefined || newInterestRate !== undefined) {
      const currentFee = newFee ?? Number(reminder.fee);
      const currentInterestAmount = Number(reminder.interestAmount ?? 0);
      const invoice = await (this.prisma.invoice as any).findFirst({
        where: { id: reminder.invoiceId },
        select: { totalAmount: true, paidAmount: true, dueDate: true },
      });
      const openAmount = Number(invoice?.totalAmount ?? 0) - Number(invoice?.paidAmount ?? 0);

      let interestAmt = currentInterestAmount;
      if (newInterestRate !== undefined) {
        const invoiceDueDate = invoice?.dueDate ? new Date(invoice.dueDate) : new Date();
        const overdueDays = Math.max(0, Math.floor((Date.now() - invoiceDueDate.getTime()) / (1000 * 60 * 60 * 24)));
        interestAmt = overdueDays > 0 ? Math.round(openAmount * (newInterestRate / 100) * (overdueDays / 365) * 100) / 100 : 0;
      }
      newTotalWithFee = openAmount + currentFee + interestAmt;
    }

    const updated = await this.prisma.reminder.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(newFee !== undefined ? { fee: newFee } : {}),
        ...(newInterestRate !== undefined ? { interestRate: newInterestRate } : {}),
        ...(newTotalWithFee !== undefined ? { totalWithFee: newTotalWithFee } : {}),
      },
      include: {
        invoice: {
          include: { customer: true },
        },
      },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'REMINDERS' as any,
            entityType: 'REMINDER',
            entityId: updated.id,
            entityName: updated.number || '',
            action: 'UPDATE' as any,
            description: `Mahnung "${updated.number}" aktualisiert`,
            oldValues,
            newValues: {
              status: updated.status,
              dueDate: updated.dueDate,
              notes: updated.notes,
              fee: updated.fee,
            },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return updated;
  }

  async recordPayment(id: string, companyId: string, dto: RecordPaymentDto, userId?: string) {
    const reminder = await this.findOne(id, companyId);

    if (reminder.status === ReminderStatus.PAID) {
      throw new BadRequestException('Zahlung wurde bereits erfasst');
    }
    if (reminder.status === ReminderStatus.CANCELLED) {
      throw new BadRequestException('Stornierte Mahnung kann nicht als bezahlt markiert werden');
    }

    const paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : new Date();

    // Mahnung als bezahlt markieren
    const updatedReminder = await this.prisma.reminder.update({
      where: { id },
      data: {
        status: ReminderStatus.PAID,
        notes: dto.notes ? `${reminder.notes ? reminder.notes + '\n' : ''}Zahlung ${dto.amount} CHF am ${paymentDate.toLocaleDateString('de-CH')} erfasst: ${dto.notes}` : reminder.notes,
      },
      include: { invoice: { include: { customer: true } } },
    });

    // Rechnung paidAmount aktualisieren
    const invoice = await (this.prisma.invoice as any).findFirst({
      where: { id: reminder.invoiceId },
      select: { totalAmount: true, paidAmount: true },
    });
    if (invoice) {
      const newPaidAmount = Math.min(
        Number(invoice.totalAmount),
        Number(invoice.paidAmount ?? 0) + dto.amount,
      );
      const newStatus = newPaidAmount >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIAL';
      await (this.prisma.invoice as any).update({
        where: { id: reminder.invoiceId },
        data: { paidAmount: newPaidAmount, status: newStatus },
      });
    }

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'REMINDERS' as any,
            entityType: 'REMINDER',
            entityId: updatedReminder.id,
            entityName: updatedReminder.number || '',
            action: 'UPDATE' as any,
            description: `Zahlung CHF ${dto.amount} für Mahnung "${updatedReminder.number}" erfasst`,
            newValues: { status: ReminderStatus.PAID, amount: dto.amount, paymentDate },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return updatedReminder;
  }

  async send(id: string, companyId: string, dto: SendReminderDto, userId?: string) {
    const reminder = await this.findOne(id, companyId);

    if (reminder.status === ReminderStatus.SENT) {
      throw new BadRequestException('Mahnung wurde bereits versendet');
    }

    // Update invoice status if not already in dunning
    await this.prisma.invoice.update({
      where: { id: reminder.invoiceId },
      data: { status: 'OVERDUE' },
    });

    // Mark reminder as sent
    const updatedReminder = await this.prisma.reminder.update({
      where: { id },
      data: {
        status: ReminderStatus.SENT,
        sentAt: new Date(),
        sendMethod: dto.method,
      },
      include: {
        invoice: {
          include: { customer: true },
        },
      },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'REMINDERS' as any,
            entityType: 'REMINDER',
            entityId: updatedReminder.id,
            entityName: updatedReminder.number || '',
            action: 'SEND' as any,
            description: `Mahnung "${updatedReminder.number}" versendet`,
            newValues: {
              status: updatedReminder.status,
              sentAt: updatedReminder.sentAt,
              sendMethod: updatedReminder.sendMethod,
            },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    // In a real implementation, this would:
    // - Generate PDF letter with QR-Rechnung
    // - Send email if method is EMAIL or BOTH
    // - Queue for postal delivery if method is POST or BOTH

    return {
      ...updatedReminder,
      message: this.getSendConfirmationMessage(dto.method, reminder.level),
    };
  }

  async delete(id: string, companyId: string, userId?: string) {
    const reminder = await this.findOne(id, companyId);

    if (reminder.status === ReminderStatus.SENT) {
      throw new BadRequestException('Versendete Mahnung kann nicht gelöscht werden');
    }

    const deleted = await this.prisma.reminder.delete({ where: { id } });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'REMINDERS' as any,
            entityType: 'REMINDER',
            entityId: deleted.id,
            entityName: deleted.number || '',
            action: 'DELETE' as any,
            description: `Mahnung "${deleted.number}" gelöscht`,
            oldValues: { number: deleted.number, level: deleted.level, status: deleted.status },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return deleted;
  }

  // Get overdue invoices that need reminders
  // Nur Rechnungen ohne aktive (nicht stornierte/bezahlte) Mahnung zurückgeben
  async getOverdueInvoices(companyId: string) {
    const today = new Date();

    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: ['SENT', 'OVERDUE'] },
        dueDate: { lt: today },
        // Nur Rechnungen ohne aktive Mahnung (alles ausser CANCELLED)
        reminders: {
          none: {
            status: { not: ReminderStatus.CANCELLED },
          },
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            companyName: true,
            email: true,
          },
        },
        reminders: {
          orderBy: { level: 'desc' },
          take: 1,
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return overdueInvoices.map(invoice => {
      const lastReminder = invoice.reminders[0];
      const nextLevel = lastReminder ? Math.min(lastReminder.level + 1, 5) : 1;
      const daysOverdue = Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...invoice,
        number: invoice.number,
        amount: Number(invoice.totalAmount ?? 0),
        daysOverdue,
        currentLevel: lastReminder?.level || 0,
        nextLevel,
        nextFee: REMINDER_FEES[nextLevel] || 0,
        reminders: undefined,
      };
    });
  }

  // Create batch reminders for multiple invoices
  async createBatchReminders(companyId: string, dto: CreateBatchRemindersDto) {
    const results = [];

    for (const invoiceId of dto.invoiceIds) {
      try {
        const reminder = await this.create(companyId, { invoiceId });
        results.push({ invoiceId, success: true, reminder });
      } catch (error) {
        results.push({ invoiceId, success: false, error: error.message });
      }
    }

    return {
      total: dto.invoiceIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }

  // Statistics for dashboard
  async getStatistics(companyId: string) {
    const today = new Date();

    const [totalReminders, openReminders, byLevel] = await Promise.all([
      this.prisma.reminder.count({ where: { companyId } }),
      this.prisma.reminder.count({ 
        where: { companyId, status: { in: [ReminderStatus.DRAFT, ReminderStatus.SENT] } } 
      }),
      this.prisma.reminder.groupBy({
        by: ['level'],
        where: { companyId, status: { in: [ReminderStatus.DRAFT, ReminderStatus.SENT] } },
        _count: true,
        _sum: { totalWithFee: true },
      }),
    ]);

    const overdueInvoices = await this.prisma.invoice.count({
      where: {
        companyId,
        status: { in: ['SENT', 'OVERDUE'] },
        dueDate: { lt: today },
      },
    });

    const totalFees = byLevel.reduce((sum, l) => sum + Number(l._sum.totalWithFee || 0), 0);

    const sentReminders = await this.prisma.reminder.count({
      where: { companyId, status: ReminderStatus.SENT },
    });

    return {
      totalReminders,
      pendingReminders: openReminders,
      sentReminders,
      totalOutstanding: totalFees,
      byLevel: byLevel.map(l => ({
        level: l.level,
        count: l._count,
        amount: Number(l._sum.totalWithFee || 0),
      })),
    };
  }

  // Auto-generate reminders for all overdue invoices
  async generateReminders(companyId: string, userId?: string) {
    const overdueInvoices = await this.getOverdueInvoices(companyId);
    
    const created = [];
    const skipped = [];

    for (const invoice of overdueInvoices) {
      const lastReminder = (invoice as any).reminders?.[0]; // Latest reminder (safe navigation)
      const nextLevel = lastReminder ? Math.min(lastReminder.level + 1, 5) : 1;

      // Check if enough days passed since last reminder
      if (lastReminder) {
        const daysSinceLastReminder = Math.floor(
          (Date.now() - new Date(lastReminder.sentAt || lastReminder.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastReminder < 10) {
          skipped.push({ invoiceId: invoice.id, reason: 'Too soon after last reminder' });
          continue;
        }
      }

      // Create reminder
      try {
        const reminder = await this.create(companyId, {
          invoiceId: invoice.id,
          level: nextLevel,
          notes: `Automatisch generiert am ${new Date().toLocaleDateString('de-CH')}`,
        });
        created.push(reminder);
      } catch (error) {
        skipped.push({ invoiceId: invoice.id, reason: error.message });
      }
    }

    return {
      generated: created.length,
      skipped: skipped.length,
      reminders: created.map(r => ({ id: r.id, number: r.number, level: r.level })),
    };
  }

  private getSendConfirmationMessage(method: SendMethod, level: number): string {
    const levelNames: Record<number, string> = {
      1: 'Zahlungserinnerung',
      2: '1. Mahnung',
      3: '2. Mahnung',
      4: '3. Mahnung',
      5: 'Letzte Mahnung vor Inkasso',
    };

    const methodText = {
      [SendMethod.EMAIL]: 'per E-Mail',
      [SendMethod.POST]: 'per Post',
      [SendMethod.BOTH]: 'per E-Mail und Post',
    };

    return `${levelNames[level] || 'Mahnung'} wurde ${methodText[method]} versendet.`;
  }
}
