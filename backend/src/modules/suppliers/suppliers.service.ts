import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto) {
    const { page = 1, pageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
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
      this.prisma.supplier.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { purchaseOrders: true, products: true },
          },
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    // Calculate aggregated fields
    const enrichedData = await Promise.all(
      data.map(async (supplier) => {
        const orderStats = await this.prisma.purchaseOrder.aggregate({
          where: { supplierId: supplier.id },
          _sum: { total: true },
          _count: true,
        });

        return {
          ...supplier,
          totalOrders: orderStats._count || 0,
          totalValue: orderStats._sum.total || 0,
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
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId },
      include: {
        products: {
          take: 10,
          orderBy: { name: 'asc' },
        },
        purchaseOrders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { purchaseOrders: true, products: true, purchaseInvoices: true },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Calculate aggregates
    const orderStats = await this.prisma.purchaseOrder.aggregate({
      where: { supplierId: id },
      _sum: { total: true },
    });

    return {
      ...supplier,
      totalOrders: supplier._count.purchaseOrders,
      totalValue: orderStats._sum.total || 0,
    };
  }

  async create(companyId: string, dto: CreateSupplierDto) {
    // Generate supplier number if not provided
    let number = dto.number;
    if (!number) {
      const lastSupplier = await this.prisma.supplier.findFirst({
        where: { companyId },
        orderBy: { number: 'desc' },
      });
      
      const lastNum = lastSupplier?.number 
        ? parseInt(lastSupplier.number.replace('L-', '')) 
        : 0;
      number = `L-${String(lastNum + 1).padStart(3, '0')}`;
    }

    return this.prisma.supplier.create({
      data: {
        ...dto,
        number,
        companyId,
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Soft delete by setting isActive to false
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
