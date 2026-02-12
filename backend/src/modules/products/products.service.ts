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

    return {
      ...product,
      margin: Number(product.purchasePrice) > 0 
        ? ((Number(product.salePrice) - Number(product.purchasePrice)) / Number(product.purchasePrice)) * 100 
        : 100,
      availableStock: Number(product.stockQuantity) - Number(product.reservedStock || 0),
    };
  }

  async create(companyId: string, dto: CreateProductDto) {
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

    return this.prisma.product.create({
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
  }

  async update(id: string, companyId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: {
        category: true,
        supplier: true,
      },
    });
  }

  async adjustStock(id: string, companyId: string, dto: AdjustStockDto) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newQuantity = Number(product.stockQuantity) + dto.quantity;
    
    if (newQuantity < 0) {
      throw new Error('Stock cannot be negative');
    }

    return this.prisma.product.update({
      where: { id },
      data: { stockQuantity: newQuantity },
    });
  }

  async remove(id: string, companyId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Soft delete by setting isActive to false
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
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
