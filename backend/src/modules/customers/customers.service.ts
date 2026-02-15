import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
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

  async create(companyId: string, dto: CreateCustomerDto) {
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

    return this.prisma.customer.create({
      data: createData,
    });
  }

  async update(id: string, companyId: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string) {
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

    // Hard delete - safe now
    return this.prisma.customer.delete({
      where: { id },
    });
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

  async addContact(customerId: string, companyId: string, dto: {
    firstName: string; lastName: string; email?: string; phone?: string; position?: string; isPrimary?: boolean;
  }) {
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
        position: dto.position,
        isPrimary: dto.isPrimary || false,
      },
    });
  }

  async updateContact(customerId: string, contactId: string, companyId: string, dto: {
    firstName?: string; lastName?: string; email?: string; phone?: string; position?: string; isPrimary?: boolean;
  }) {
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
}
