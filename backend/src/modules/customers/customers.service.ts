import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto) {
    const { page = 1, pageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId, isActive: true };
    
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
        },
        invoices: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { projects: true, invoices: true, quotes: true, orders: true },
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

    return {
      ...customer,
      totalRevenue: invoiceStats._sum.totalAmount || 0,
      totalPaid: invoiceStats._sum.paidAmount || 0,
      openInvoices,
      projectCount: customer._count.projects,
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
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Soft delete by setting isActive to false
    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
