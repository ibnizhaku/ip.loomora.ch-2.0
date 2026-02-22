import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SuppliersService {
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
      products: (supplier.products || []).map((p: any) => ({
        ...p,
        purchasePrice: p.purchasePrice ? Number(p.purchasePrice) : 0,
        salePrice: p.salePrice ? Number(p.salePrice) : 0,
        minStock: p.minStock ? Number(p.minStock) : 0,
      })),
      purchaseOrders: (supplier.purchaseOrders || []).map((po: any) => ({
        ...po,
        total: po.total ? Number(po.total) : 0,
        subtotal: po.subtotal ? Number(po.subtotal) : 0,
        vatAmount: po.vatAmount ? Number(po.vatAmount) : 0,
      })),
      totalOrders: supplier._count.purchaseOrders,
      totalValue: Number(orderStats._sum.total || 0),
    };
  }

  async create(companyId: string, dto: CreateSupplierDto, userId?: string) {
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

    const supplier = await this.prisma.supplier.create({
      data: {
        ...dto,
        number,
        companyId,
      },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'SUPPLIERS' as any,
            entityType: 'SUPPLIER',
            entityId: supplier.id,
            entityName: (supplier as any).companyName || (supplier as any).name || '',
            action: 'CREATE' as any,
            description: `Lieferant "${(supplier as any).companyName || (supplier as any).name || ''}" erstellt`,
            newValues: { number: supplier.number, companyName: (supplier as any).companyName, name: (supplier as any).name },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) {}
    }

    return supplier;
  }

  async update(id: string, companyId: string, dto: UpdateSupplierDto, userId?: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const entityName = (supplier as any).companyName || (supplier as any).name || '';
    const updated = await this.prisma.supplier.update({
      where: { id },
      data: dto,
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'SUPPLIERS' as any,
            entityType: 'SUPPLIER',
            entityId: id,
            entityName: (updated as any).companyName || (updated as any).name || entityName,
            action: 'UPDATE' as any,
            description: `Lieferant "${(updated as any).companyName || (updated as any).name || entityName}" aktualisiert`,
            oldValues: { companyName: (supplier as any).companyName, name: (supplier as any).name },
            newValues: { companyName: (updated as any).companyName, name: (updated as any).name },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) {}
    }

    return updated;
  }

  async getStats(companyId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [total, active, newSuppliers] = await Promise.all([
      this.prisma.supplier.count({ where: { companyId } }),
      this.prisma.supplier.count({ where: { companyId, isActive: true } }),
      this.prisma.supplier.count({ where: { companyId, createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    const totalPurchaseVolume = await this.prisma.purchaseOrder.aggregate({
      where: { companyId },
      _sum: { total: true },
    });

    return {
      total,
      active,
      newSuppliers,
      totalValue: Number(totalPurchaseVolume._sum.total || 0),
      avgRating: 0,
    };
  }

  async remove(id: string, companyId: string, userId?: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: { purchaseOrders: true, purchaseInvoices: true },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    // Check for dependencies
    const deps = supplier._count;
    const totalDeps = deps.purchaseOrders + deps.purchaseInvoices;
    
    if (totalDeps > 0) {
      const details: string[] = [];
      if (deps.purchaseOrders > 0) details.push(`${deps.purchaseOrders} Bestellung(en)`);
      if (deps.purchaseInvoices > 0) details.push(`${deps.purchaseInvoices} Eingangsrechnung(en)`);
      
      throw new BadRequestException(
        `Lieferant kann nicht gelöscht werden. Verknüpfte Daten: ${details.join(', ')}. Bitte zuerst die verknüpften Einträge entfernen.`
      );
    }

    const entityName = (supplier as any).companyName || (supplier as any).name || '';

    // Hard delete - safe now
    const deleted = await this.prisma.supplier.delete({
      where: { id },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'SUPPLIERS' as any,
            entityType: 'SUPPLIER',
            entityId: id,
            entityName,
            action: 'DELETE' as any,
            description: `Lieferant "${entityName}" gelöscht`,
            oldValues: { companyName: (supplier as any).companyName, name: (supplier as any).name },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) {}
    }

    return deleted;
  }
  async findCreditors(companyId: string) {
    const suppliers = await this.prisma.supplier.findMany({
      where: { companyId, isActive: true },
      include: {
        purchaseInvoices: {
          where: { status: { not: 'DRAFT' } },
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            dueDate: true,
            status: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { companyName: 'asc' },
    });

    const now = new Date();

    const creditors = suppliers
      .map((s: any) => {
        const invoices = s.purchaseInvoices || [];
        const totalPayables = invoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0);
        const openAmount = invoices
          .filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
          .reduce((sum: number, inv: any) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount || 0)), 0);
        const overdueAmount = invoices
          .filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.dueDate && new Date(inv.dueDate) < now)
          .reduce((sum: number, inv: any) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount || 0)), 0);
        const lastPaid = invoices
          .filter((inv: any) => inv.status === 'PAID')
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

        let status: 'current' | 'due_soon' | 'overdue' = 'current';
        if (overdueAmount > 0) status = 'overdue';
        else if (invoices.some((inv: any) => inv.dueDate && (new Date(inv.dueDate).getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000 && inv.status !== 'PAID')) {
          status = 'due_soon';
        }

        return {
          id: s.id,
          number: s.number,
          name: s.name,
          company: s.companyName || s.name,
          totalPayables,
          openAmount,
          overdueAmount,
          lastPayment: lastPaid ? new Date(lastPaid.updatedAt).toISOString().split('T')[0] : null,
          paymentTerms: s.paymentTermDays || 30,
          status,
          invoiceCount: invoices.length,
          bankAccount: s.iban || null,
        };
      });

    return { data: creditors };
  }

}
