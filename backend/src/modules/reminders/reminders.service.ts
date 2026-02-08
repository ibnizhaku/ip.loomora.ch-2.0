import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateReminderDto, 
  UpdateReminderDto, 
  SendReminderDto,
  CreateBatchRemindersDto,
  ReminderStatus,
  ReminderLevel,
  REMINDER_FEES,
  INKASSO_FEE,
  SendMethod,
} from './dto/reminder.dto';

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
    if (status) where.status = status;
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
              customer: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      this.prisma.reminder.count({ where }),
    ]);

    return {
      data,
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
      },
    });

    if (!reminder) {
      throw new NotFoundException('Mahnung nicht gefunden');
    }

    return reminder;
  }

  async create(companyId: string, dto: CreateReminderDto) {
    // Get invoice
    const invoice = await this.prisma.invoice.findFirst({
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

    // Calculate fee based on level
    const fee = REMINDER_FEES[level] || 0;
    const totalWithFee = Number(invoice.totalAmount) + fee;

    // Generate reminder number
    const count = await this.prisma.reminder.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const number = `MHN-${year}-${String(count + 1).padStart(4, '0')}`;

    // Calculate due date (typically 10 days from now)
    const dueDate = dto.dueDate 
      ? new Date(dto.dueDate) 
      : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    return this.prisma.reminder.create({
      data: {
        companyId,
        invoiceId: dto.invoiceId,
        number,
        level,
        status: ReminderStatus.DRAFT,
        fee,
        totalWithFee,
        dueDate,
        notes: dto.notes,
      },
      include: {
        invoice: {
          include: { customer: true },
        },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateReminderDto) {
    const reminder = await this.findOne(id, companyId);

    if (reminder.status === ReminderStatus.SENT) {
      throw new BadRequestException('Versendete Mahnung kann nicht bearbeitet werden');
    }

    return this.prisma.reminder.update({
      where: { id },
      data: {
        status: dto.status,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
      },
      include: {
        invoice: {
          include: { customer: true },
        },
      },
    });
  }

  async send(id: string, companyId: string, dto: SendReminderDto) {
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

    // In a real implementation, this would:
    // - Generate PDF letter with QR-Rechnung
    // - Send email if method is EMAIL or BOTH
    // - Queue for postal delivery if method is POST or BOTH

    return {
      ...updatedReminder,
      message: this.getSendConfirmationMessage(dto.method, reminder.level),
    };
  }

  async delete(id: string, companyId: string) {
    const reminder = await this.findOne(id, companyId);

    if (reminder.status === ReminderStatus.SENT) {
      throw new BadRequestException('Versendete Mahnung kann nicht gelöscht werden');
    }

    return this.prisma.reminder.delete({ where: { id } });
  }

  // Get overdue invoices that need reminders
  async getOverdueInvoices(companyId: string) {
    const today = new Date();

    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: ['SENT', 'OVERDUE'] },
        dueDate: { lt: today },
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
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
        daysOverdue,
        currentLevel: lastReminder?.level || 0,
        nextLevel,
        nextFee: REMINDER_FEES[nextLevel] || 0,
        reminders: undefined, // Remove from response
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

    return {
      totalReminders,
      openReminders,
      overdueInvoices,
      totalFeesOutstanding: totalFees,
      byLevel: byLevel.map(l => ({
        level: l.level,
        count: l._count,
        totalAmount: l._sum.totalWithFee || 0,
      })),
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
