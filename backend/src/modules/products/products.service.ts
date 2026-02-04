import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, AdjustStockDto } from './dto/product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto & { categoryId?: string; isService?: string }) {
    const { page = 1, pageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', categoryId, isService } = query;
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
      margin: product.purchasePrice > 0 
        ? ((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100 
        : 100,
      availableStock: product.stockQuantity - (product.reservedStock || 0),
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
      margin: product.purchasePrice > 0 
        ? ((product.salePrice - product.purchasePrice) / product.purchasePrice) * 100 
        : 100,
      availableStock: product.stockQuantity - (product.reservedStock || 0),
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

    const newQuantity = product.stockQuantity + dto.quantity;
    
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
}
