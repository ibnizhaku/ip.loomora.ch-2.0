import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto & { categoryId?: string; isService?: string }) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', categoryId, isService } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isService !== undefined) {
      where.isService = isService === 'true';
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          supplier: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Calculate margin and available stock
    const enrichedData = data.map((product) => ({
      ...product,
      purchasePrice: Number(product.purchasePrice || 0),
      salePrice: Number(product.salePrice || 0),
      stockQuantity: Number(product.stockQuantity || 0),
      margin: Number(product.purchasePrice) > 0 
        ? ((Number(product.salePrice) - Number(product.purchasePrice)) / Number(product.purchasePrice)) * 100 
        : 100,
      availableStock: Number(product.stockQuantity) - Number(product.reservedStock || 0),
    }));

    return {
      data: enrichedData,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const mapped = {
      ...product,
      salePrice: Number(product.salePrice || 0),
      purchasePrice: Number(product.purchasePrice || 0),
      stockQuantity: Number(product.stockQuantity || 0),
      minStock: Number(product.minStock || 0),
      reservedStock: Number((product as any).reservedStock || 0),
      weight: product.weight ? Number(product.weight) : 0,
      margin: Number(product.purchasePrice) > 0
        ? ((Number(product.salePrice) - Number(product.purchasePrice)) / Number(product.purchasePrice)) * 100
        : 100,
      availableStock: Number(product.stockQuantity) - Number((product as any).reservedStock || 0),
    };

    return { data: mapped };
  }

  async create(companyId: string, dto: CreateProductDto, userId?: string) {
    // Generate SKU if not provided
    let sku = dto.sku;
    if (!sku) {
      const prefix = dto.isService ? 'SERV' : 'PROD';
      const lastProduct = await this.prisma.product.findFirst({
        where: { companyId, sku: { startsWith: prefix } },
        orderBy: { sku: 'desc' },
      });
      
      const lastNum = lastProduct?.sku 
        ? parseInt(lastProduct.sku.split('-')[1] || '0') 
        : 0;
      sku = `${prefix}-${String(lastNum + 1).padStart(4, '0')}`;
    }

    const created = await this.prisma.product.create({
      data: {
        ...dto,
        sku,
        companyId,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'PRODUCTS' as any,
            entityType: 'PRODUCT',
            entityId: created.id,
            entityName: created.name || '',
            action: 'CREATE' as any,
            description: `Produkt "${created.name}" erstellt`,
            newValues: { name: created.name },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return created;
  }

  async update(id: string, companyId: string, dto: UpdateProductDto, userId?: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const oldValues = {
      name: product.name,
      sku: product.sku,
    };

    const updated = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        category: true,
        supplier: true,
      },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'PRODUCTS' as any,
            entityType: 'PRODUCT',
            entityId: updated.id,
            entityName: updated.name || '',
            action: 'UPDATE' as any,
            description: `Produkt "${updated.name}" aktualisiert`,
            oldValues,
            newValues: { name: updated.name, sku: updated.sku },
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return updated;
  }

  async adjustStock(id: string, companyId: string, dto: AdjustStockDto, userId?: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const stockBefore = Number(product.stockQuantity);
    // dto.quantity kann absoluter Zielbestand oder relative Änderung sein
    // Wenn > 0 immer relative Interpretation: stockBefore + dto.quantity
    const stockAfter = dto.quantity;  // Bestand wird auf diesen Wert gesetzt (absolut)
    const delta = stockAfter - stockBefore;

    return this.prisma.$transaction(async (tx) => {
      // Produkt-Bestand aktualisieren
      const updated = await tx.product.update({
        where: { id },
        data: { stockQuantity: stockAfter },
      });

      // Lagerbewegung protokollieren
      await (tx as any).inventoryMovement.create({
        data: {
          productId: id,
          type: delta >= 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
          quantity: delta,
          stockBefore,
          stockAfter,
          reason: dto.reason || 'Manuelle Korrektur',
          companyId,
          ...(userId ? { userId } : {}),
        },
      });

      // Reorder-Point Alert prüfen
      const reorderPoint = Number((product as any).reorderPoint ?? product.minStock ?? 0);
      const belowReorder = stockAfter <= reorderPoint && reorderPoint > 0;

      return { ...updated, belowReorderPoint: belowReorder, reorderPoint };
    });
  }

  // Produkte unter Nachbestellpunkt zurückgeben
  async getLowStockProducts(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: { companyId, isActive: true, isService: false },
      include: { supplier: { select: { id: true, name: true } } },
    });

    return products
      .filter((p) => {
        const stock = Number(p.stockQuantity);
        const threshold = Number((p as any).reorderPoint ?? p.minStock ?? 0);
        return stock <= threshold;
      })
      .map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        stockQuantity: Number(p.stockQuantity),
        minStock: Number(p.minStock),
        reorderPoint: Number((p as any).reorderPoint ?? p.minStock ?? 0),
        reorderQuantity: Number((p as any).reorderQuantity ?? 0),
        supplier: (p as any).supplier,
        status: Number(p.stockQuantity) <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      }));
  }

  async remove(id: string, companyId: string, userId?: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const oldValues = {
      name: product.name,
      sku: product.sku,
    };

    const updated = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    if (userId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            module: 'PRODUCTS' as any,
            entityType: 'PRODUCT',
            entityId: updated.id,
            entityName: product.name || '',
            action: 'DELETE' as any,
            description: `Produkt "${product.name}" deaktiviert`,
            oldValues,
            retentionUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
            companyId,
            userId,
          },
        });
      } catch (e) { /* audit log failure should not break main operation */ }
    }

    return updated;
  }

  // Categories
  async findAllCategories(companyId: string) {
    return this.prisma.productCategory.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async createCategory(companyId: string, data: { name: string; description?: string }) {
    return this.prisma.productCategory.create({
      data: {
        ...data,
        companyId,
      },
    });
  }

  async getStats(companyId: string) {
    const [total, active, inactive, services, products] = await Promise.all([
      this.prisma.product.count({ where: { companyId } }),
      this.prisma.product.count({ where: { companyId, isActive: true } }),
      this.prisma.product.count({ where: { companyId, isActive: false } }),
      this.prisma.product.count({ where: { companyId, isService: true } }),
      this.prisma.product.findMany({
        where: { companyId, isService: false },
        select: { stockQuantity: true, minStock: true },
      }),
    ]);

    // Count low stock items
    const lowStock = products.filter(p => p.stockQuantity <= p.minStock).length;

    return { total, active, inactive, services, lowStock };
  }
}
