import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateShopOrderDto, 
  UpdateShopOrderDto, 
  CreateDiscountDto, 
  UpdateDiscountDto,
  ValidateDiscountDto,
  CreateReviewDto,
  UpdateReviewDto,
  ShopSettingsDto,
  ShopOrderStatus,
  PaymentStatus,
  DiscountType,
  ReviewStatus,
} from './dto/ecommerce.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class EcommerceService {
  constructor(private prisma: PrismaService) {}

  // ============== SHOP ORDERS ==============
  async findAllOrders(companyId: string, query: PaginationDto & { status?: string }) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.shopOrder.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
            },
          },
        },
      }),
      this.prisma.shopOrder.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneOrder(id: string, companyId: string) {
    const order = await this.prisma.shopOrder.findFirst({
      where: { id, companyId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        discount: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async createOrder(companyId: string, dto: CreateShopOrderDto) {
    // Generate order number
    const lastOrder = await this.prisma.shopOrder.findFirst({
      where: { companyId },
      orderBy: { orderNumber: 'desc' },
    });
    const lastNum = lastOrder?.orderNumber 
      ? parseInt(lastOrder.orderNumber.replace('WEB-', '')) 
      : 0;
    const orderNumber = `WEB-${String(lastNum + 1).padStart(5, '0')}`;

    // Calculate totals
    let subtotal = 0;
    const itemsData = dto.items.map(item => {
      const itemTotal = item.unitPrice * item.quantity - (item.discount || 0);
      subtotal += itemTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: itemTotal,
      };
    });

    // Apply discount if provided
    let discountAmount = 0;
    let discountId = null;
    if (dto.discountCode) {
      const discount = await this.validateDiscountInternal(companyId, {
        code: dto.discountCode,
        orderTotal: subtotal,
        productIds: dto.items.map(i => i.productId),
      });
      if (discount.valid && discount.discountAmount !== undefined) {
        discountAmount = discount.discountAmount;
        discountId = discount.discountId;
      }
    }

    // Calculate shipping (simplified - would be based on settings)
    const shippingCost = subtotal >= 100 ? 0 : 9.90;

    // Calculate VAT (8.1% Swiss standard)
    const vatRate = 0.081;
    const vatAmount = (subtotal - discountAmount + shippingCost) * vatRate;
    const total = subtotal - discountAmount + shippingCost + vatAmount;

    return this.prisma.shopOrder.create({
      data: {
        orderNumber,
        companyId,
        customerId: dto.customerId,
        customerEmail: dto.customerEmail,
        billingAddress: dto.billingAddress as any,
        shippingAddress: dto.shippingAddress as any || dto.billingAddress as any,
        paymentMethod: dto.paymentMethod,
        subtotal,
        discountAmount,
        discountId,
        shippingCost,
        vatAmount,
        total,
        notes: dto.notes,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async updateOrder(id: string, companyId: string, dto: UpdateShopOrderDto) {
    const order = await this.prisma.shopOrder.findFirst({
      where: { id, companyId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.shopOrder.update({
      where: { id },
      data: dto,
      include: {
        items: true,
      },
    });
  }

  async cancelOrder(id: string, companyId: string) {
    const order = await this.prisma.shopOrder.findFirst({
      where: { id, companyId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === ShopOrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    return this.prisma.shopOrder.update({
      where: { id },
      data: {
        status: ShopOrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }

  async getOrderStats(companyId: string) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalOrders, pendingOrders, monthlyRevenue, allTimeRevenue] = await Promise.all([
      this.prisma.shopOrder.count({ where: { companyId } }),
      this.prisma.shopOrder.count({ where: { companyId, status: ShopOrderStatus.PENDING } }),
      this.prisma.shopOrder.aggregate({
        where: { 
          companyId, 
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      this.prisma.shopOrder.aggregate({
        where: { companyId, paymentStatus: PaymentStatus.PAID },
        _sum: { total: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      allTimeRevenue: allTimeRevenue._sum.total || 0,
    };
  }

  // ============== DISCOUNTS ==============
  async findAllDiscounts(companyId: string, query: PaginationDto) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.discount.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.discount.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneDiscount(id: string, companyId: string) {
    const discount = await this.prisma.discount.findFirst({
      where: { id, companyId },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return discount;
  }

  async createDiscount(companyId: string, dto: CreateDiscountDto) {
    // Check if code already exists
    const existing = await this.prisma.discount.findFirst({
      where: { companyId, code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException('Discount code already exists');
    }

    return this.prisma.discount.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        companyId,
      },
    });
  }

  async updateDiscount(id: string, companyId: string, dto: UpdateDiscountDto) {
    const discount = await this.prisma.discount.findFirst({
      where: { id, companyId },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return this.prisma.discount.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toUpperCase() : undefined,
      },
    });
  }

  async removeDiscount(id: string, companyId: string) {
    const discount = await this.prisma.discount.findFirst({
      where: { id, companyId },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return this.prisma.discount.delete({ where: { id } });
  }

  async validateDiscount(companyId: string, dto: ValidateDiscountDto) {
    return this.validateDiscountInternal(companyId, dto);
  }

  private async validateDiscountInternal(companyId: string, dto: ValidateDiscountDto) {
    const discount = await this.prisma.discount.findFirst({
      where: { 
        companyId, 
        code: dto.code.toUpperCase(),
        isActive: true,
      },
    });

    if (!discount) {
      return { valid: false, reason: 'Discount code not found' };
    }

    const now = new Date();
    if (new Date(discount.validFrom) > now) {
      return { valid: false, reason: 'Discount not yet valid' };
    }

    if (discount.validUntil && new Date(discount.validUntil) < now) {
      return { valid: false, reason: 'Discount expired' };
    }

    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return { valid: false, reason: 'Discount usage limit reached' };
    }

    if (discount.minimumOrderValue && dto.orderTotal < Number(discount.minimumOrderValue)) {
      return { valid: false, reason: `Minimum order value of CHF ${discount.minimumOrderValue} required` };
    }

    // Calculate discount amount
    let discountAmount = 0;
    switch (discount.type) {
      case DiscountType.PERCENTAGE:
        discountAmount = dto.orderTotal * (Number(discount.value) / 100);
        break;
      case DiscountType.FIXED_AMOUNT:
        discountAmount = Number(discount.value);
        break;
      case DiscountType.FREE_SHIPPING:
        discountAmount = 0; // Handled separately
        break;
    }

    if (discount.maximumDiscount && discountAmount > Number(discount.maximumDiscount)) {
      discountAmount = Number(discount.maximumDiscount);
    }

    return {
      valid: true,
      discountId: discount.id,
      discountAmount,
      type: discount.type,
      freeShipping: discount.type === DiscountType.FREE_SHIPPING,
    };
  }

  // ============== REVIEWS ==============
  async findAllReviews(companyId: string, query: PaginationDto & { status?: string; productId?: string; isApproved?: string }) {
    const { page: rawPage = 1, pageSize: rawPageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', status, productId, isApproved } = query;
    const page = Number(rawPage) || 1;
    const pageSize = Number(rawPageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Frontend uses isApproved, backend uses status - support both
    if (isApproved !== undefined) {
      where.status = isApproved === 'true' ? 'APPROVED' : 'PENDING';
    } else if (status) {
      where.status = status;
    }

    if (productId) {
      where.productId = productId;
    }

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOneReview(id: string, companyId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id, companyId },
      include: {
        product: true,
        shopOrder: { select: { id: true, orderNumber: true } },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async createReview(companyId: string, dto: CreateReviewDto) {
    // Verify product exists
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, companyId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check for verified purchase
    let isVerifiedPurchase = dto.isVerifiedPurchase || false;
    if (dto.shopOrderId) {
      const orderItem = await this.prisma.shopOrderItem.findFirst({
        where: {
          shopOrderId: dto.shopOrderId,
          productId: dto.productId,
        },
      });
      isVerifiedPurchase = !!orderItem;
    }

    return this.prisma.review.create({
      data: {
        ...dto,
        companyId,
        isVerifiedPurchase,
        status: ReviewStatus.PENDING,
      },
    });
  }

  async updateReview(id: string, companyId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findFirst({
      where: { id, companyId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        ...dto,
        moderatedAt: dto.status ? new Date() : undefined,
      },
    });
  }

  async removeReview(id: string, companyId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id, companyId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.review.delete({ where: { id } });
  }

  async getReviewStats(companyId: string) {
    const [total, pending, avgRating] = await Promise.all([
      this.prisma.review.count({ where: { companyId } }),
      this.prisma.review.count({ where: { companyId, status: ReviewStatus.PENDING } }),
      this.prisma.review.aggregate({
        where: { companyId, status: ReviewStatus.APPROVED },
        _avg: { rating: true },
      }),
    ]);

    return {
      total,
      pending,
      averageRating: avgRating._avg.rating || 0,
    };
  }

  async getProductReviews(productId: string, companyId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        productId,
        companyId,
        status: ReviewStatus.APPROVED,
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await this.prisma.review.aggregate({
      where: {
        productId,
        companyId,
        status: ReviewStatus.APPROVED,
      },
      _avg: { rating: true },
      _count: true,
    });

    return {
      reviews,
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count,
    };
  }

  // ============== SHOP SETTINGS ==============
  async getShopSettings(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { shopSettings: true },
    });

    return company?.shopSettings || this.getDefaultShopSettings();
  }

  async updateShopSettings(companyId: string, dto: ShopSettingsDto) {
    const currentSettings = await this.getShopSettings(companyId);
    
    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        shopSettings: {
          ...(currentSettings as object),
          ...dto,
        },
      },
      select: { shopSettings: true },
    });
  }

  private getDefaultShopSettings(): ShopSettingsDto {
    return {
      maintenanceMode: false,
      freeShippingThreshold: 100,
      standardShippingCost: 9.90,
      expressShippingCost: 19.90,
      currency: 'CHF',
      enabledPaymentMethods: ['TWINT', 'CREDIT_CARD', 'INVOICE'],
    };
  }
}
