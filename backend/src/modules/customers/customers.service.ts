import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CreateContactDto, UpdateContactDto } from './dto/customer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { projects: true, invoices: true },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    // Calculate aggregated fields
    const enrichedData = await Promise.all(
      data.map(async (customer) => {
        const invoiceStats = await this.prisma.invoice.aggregate({
          where: { customerId: customer.id },
          _sum: { totalAmount: true },
        });

        const openInvoices = await this.prisma.invoice.count({
          where: {
            customerId: customer.id,
            status: { in: ['SENT', 'OVERDUE'] },
          },
        });

        return {
          ...customer,
          totalRevenue: invoiceStats._sum.totalAmount || 0,
          openInvoices,
          projectCount: customer._count.projects,
        };
      }),
    );

    return {
      data: enrichedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: {
        projects: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            tasks: {
              select: { id: true, title: true, status: true, dueDate: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        invoices: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        deliveryNotes: {
          select: { id: true, number: true, status: true, date: true },
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          select: { id: true, number: true, status: true, date: true, total: true },
          orderBy: { createdAt: 'desc' },
        },
        contacts: true,
        _count: {
          select: { projects: true, invoices: true, quotes: true, orders: true, deliveryNotes: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Calculate aggregates
    const invoiceStats = await this.prisma.invoice.aggregate({
      where: { customerId: id },
      _sum: { totalAmount: true, paidAmount: true },
    });

    const openInvoices = await this.prisma.invoice.count({
      where: {
        customerId: id,
        status: { in: ['SENT', 'OVERDUE'] },
      },
    });

    // Flatten tasks from all projects for convenience
    const customerAny = customer as any;
    const tasks = customerAny.projects?.flatMap((p: any) =>
      p.tasks?.map((t: any) => ({ ...t, projectId: p.id, projectName: p.name })) || []
    ) || [];

    return {
      ...customer,
      tasks,
      totalRevenue: invoiceStats._sum.totalAmount || 0,
      totalPaid: invoiceStats._sum.paidAmount || 0,
      openInvoices,
      projectCount: customerAny._count?.projects ?? 0,
    };
  }

  async create(companyId: string, dto: CreateCustomerDto, userId?: string) {
    // Generate customer number if not provided
    let number = dto.number;
    if (!number) {
      const lastCustomer = await this.prisma.customer.findFirst({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      });
      
      // Extract number from KD-XXXX format
      let lastNum = 0;
      if (lastCustomer?.number) {
        const match = lastCustomer.number.match(/KD-(\d+)/);
        if (match) {
          lastNum = parseInt(match[1], 10);
        }
      }
      number = `KD-${String(lastNum + 1).padStart(4, '0')}`;
    }

    // Handle creditLimit conversion (DTO is number, Prisma expects Decimal)
    const createData: any = {
      ...dto,
      number,
      companyId,
    };

    const created = await this.prisma.customer.create({
      data: createData,
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'CUSTOMERS' as any,
            entityType: 'CUSTOMER',
            entityId: created.id,
            entityName: created.companyName || created.name || '',
            action: 'CREATE' as any,
            description: `Kunde "${created.companyName || created.name || ''}" erstellt`,
            newValues: { name: created.companyName || created.name },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return created;
  }

  async update(id: string, companyId: string, dto: UpdateCustomerDto, userId?: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const oldValues = {
      name: customer.name,
      companyName: customer.companyName,
      email: customer.email,
    };

    const updated = await this.prisma.customer.update({
      where: { id },
      data: dto,
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'CUSTOMERS' as any,
            entityType: 'CUSTOMER',
            entityId: updated.id,
            entityName: updated.companyName || updated.name || '',
            action: 'UPDATE' as any,
            description: `Kunde "${updated.companyName || updated.name || ''}" aktualisiert`,
            oldValues,
            newValues: { name: updated.companyName || updated.name, email: updated.email },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return updated;
  }

  async remove(id: string, companyId: string, userId?: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: { quotes: true, orders: true, invoices: true, projects: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check for dependencies
    const deps = customer._count;
    const totalDeps = deps.quotes + deps.orders + deps.invoices + deps.projects;
    
    if (totalDeps > 0) {
      const details: string[] = [];
      if (deps.quotes > 0) details.push(`${deps.quotes} Angebot(e)`);
      if (deps.orders > 0) details.push(`${deps.orders} Auftrag/Aufträge`);
      if (deps.invoices > 0) details.push(`${deps.invoices} Rechnung(en)`);
      if (deps.projects > 0) details.push(`${deps.projects} Projekt(e)`);
      
      throw new BadRequestException(
        `Kunde kann nicht gelöscht werden. Verknüpfte Daten: ${details.join(', ')}. Bitte zuerst die verknüpften Einträge entfernen oder archivieren.`
      );
    }

    const oldValues = {
      name: customer.name,
      companyName: customer.companyName,
      email: customer.email,
    };
    const entityName = customer.companyName || customer.name || '';

    const deleted = await this.prisma.customer.delete({
      where: { id },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'CUSTOMERS' as any,
            entityType: 'CUSTOMER',
            entityId: deleted.id,
            entityName,
            action: 'DELETE' as any,
            description: `Kunde "${entityName}" gelöscht`,
            oldValues,
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return deleted;
  }

  async getStats(companyId: string) {
    const [total, active, allCustomers] = await Promise.all([
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.customer.count({ where: { companyId, isActive: true } }),
      this.prisma.customer.findMany({
        where: { companyId },
        select: { id: true },
      }),
    ]);

    // Calculate totalRevenue from invoices
    const invoiceStats = await this.prisma.invoice.groupBy({
      by: ['customerId'],
      where: { 
        companyId,
        customerId: { in: allCustomers.map(c => c.id) },
      },
      _sum: { totalAmount: true },
    });

    // Create revenue map
    const revenueMap = new Map(
      invoiceStats.map(stat => [stat.customerId, Number(stat._sum.totalAmount) || 0])
    );

    // Count prospects (customers with zero revenue)
    const prospects = allCustomers.filter(c => !revenueMap.has(c.id) || revenueMap.get(c.id) === 0).length;

    // Sum total revenue
    const totalRevenue = Array.from(revenueMap.values()).reduce((sum, val) => sum + val, 0);

    return { total, active, prospects, totalRevenue };
  }

  // ========================
  // CUSTOMER CONTACTS
  // ========================

  async getContacts(customerId: string, companyId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    return this.prisma.contact.findMany({
      where: { customerId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async addContact(customerId: string, companyId: string, dto: CreateContactDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    // If isPrimary, unset other primary contacts
    if (dto.isPrimary) {
      await this.prisma.contact.updateMany({
        where: { customerId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.contact.create({
      data: {
        customerId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        mobile: dto.mobile,
        position: dto.position,
        isPrimary: dto.isPrimary || false,
        notes: dto.notes,
      },
    });
  }

  async updateContact(customerId: string, contactId: string, companyId: string, dto: UpdateContactDto) {
    const customer = await this.prisma.customer.findFirst({ where: { id: customerId, companyId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const contact = await this.prisma.contact.findFirst({ where: { id: contactId, customerId } });
    if (!contact) throw new NotFoundException('Contact not found');

    if (dto.isPrimary) {
      await this.prisma.contact.updateMany({
        where: { customerId, isPrimary: true, id: { not: contactId } },
        data: { isPrimary: false },
      });
    }

    return this.prisma.contact.update({
      where: { id: contactId },
      data: dto,
    });
  }

  async removeContact(customerId: string, contactId: string, companyId: string) {
    const customer = await this.prisma.customer.findFirst({ where: { id: customerId, companyId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const contact = await this.prisma.contact.findFirst({ where: { id: contactId, customerId } });
    if (!contact) throw new NotFoundException('Contact not found');

    return this.prisma.contact.delete({ where: { id: contactId } });
  }
  async findDebtors(companyId: string) {
    const customers = await this.prisma.customer.findMany({
      where: { companyId, isActive: true },
      include: {
        invoices: {
          where: { status: { not: 'DRAFT' } },
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            dueDate: true,
            status: true,
            paidAt: true,
          },
        },
      },
      orderBy: { companyName: 'asc' },
    });

    const now = new Date();

    return customers
      .map((c: any) => {
        const invoices = c.invoices || [];
        const totalReceivables = invoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0);
        const openAmount = invoices
          .filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
          .reduce((sum: number, inv: any) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount || 0)), 0);
        const overdueAmount = invoices
          .filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.dueDate && new Date(inv.dueDate) < now)
          .reduce((sum: number, inv: any) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount || 0)), 0);
        const lastPaid = invoices
          .filter((inv: any) => inv.paidAt)
          .sort((a: any, b: any) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0];

        let status: 'good' | 'warning' | 'critical' = 'good';
        if (overdueAmount > 0) status = overdueAmount > totalReceivables * 0.5 ? 'critical' : 'warning';

        return {
          id: c.id,
          number: c.number,
          name: c.name,
          company: c.companyName || c.name,
          totalReceivables,
          openAmount,
          overdueAmount,
          lastPayment: lastPaid ? new Date(lastPaid.paidAt).toISOString().split('T')[0] : null,
          paymentTerms: c.paymentTermDays || 30,
          creditLimit: Number(c.creditLimit || 0),
          status,
          invoiceCount: invoices.length,
        };
      })
      .filter((d: any) => d.totalReceivables > 0 || d.openAmount > 0);
  }

}
