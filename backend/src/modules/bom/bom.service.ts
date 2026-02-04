import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBomDto, UpdateBomDto, BomItemType, BOM_TEMPLATES } from './dto/bom.dto';

@Injectable()
export class BomService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    projectId?: string;
    isTemplate?: boolean;
    category?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, projectId, isTemplate, category, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (projectId) where.projectId = projectId;
    if (isTemplate !== undefined) where.isTemplate = isTemplate;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.billOfMaterial.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          items: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      this.prisma.billOfMaterial.count({ where }),
    ]);

    // Calculate totals for each BOM
    const dataWithTotals = data.map(bom => ({
      ...bom,
      totalMaterial: this.calculateTotal(bom.items, 'MATERIAL'),
      totalLabor: this.calculateTotal(bom.items, 'LABOR'),
      totalExternal: this.calculateTotal(bom.items, 'EXTERNAL'),
      grandTotal: this.calculateGrandTotal(bom.items),
    }));

    return {
      data: dataWithTotals,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const bom = await this.prisma.billOfMaterial.findFirst({
      where: { id, companyId },
      include: {
        project: { select: { id: true, name: true, number: true } },
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            product: { select: { id: true, sku: true, name: true } },
          },
        },
      },
    });

    if (!bom) {
      throw new NotFoundException('Stückliste nicht gefunden');
    }

    return {
      ...bom,
      totalMaterial: this.calculateTotal(bom.items, 'MATERIAL'),
      totalLabor: this.calculateTotal(bom.items, 'LABOR'),
      totalExternal: this.calculateTotal(bom.items, 'EXTERNAL'),
      grandTotal: this.calculateGrandTotal(bom.items),
    };
  }

  async create(companyId: string, dto: CreateBomDto) {
    // Validate project if provided
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, companyId },
      });
      if (!project) {
        throw new NotFoundException('Projekt nicht gefunden');
      }
    }

    // If based on template, copy items
    let items = dto.items;
    if (dto.templateId) {
      const template = await this.findOne(dto.templateId, companyId);
      items = template.items.map((item, index) => ({
        type: item.type as BomItemType,
        productId: item.productId,
        description: item.description,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        hours: item.hours ? Number(item.hours) : undefined,
        hourlyRate: item.hourlyRate ? Number(item.hourlyRate) : undefined,
        sortOrder: index,
      }));
    }

    return this.prisma.billOfMaterial.create({
      data: {
        companyId,
        name: dto.name,
        description: dto.description,
        projectId: dto.projectId,
        isTemplate: dto.isTemplate || false,
        category: dto.category,
        items: {
          create: items.map((item, index) => ({
            type: item.type,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || 'Stk',
            unitPrice: item.unitPrice,
            hours: item.hours,
            hourlyRate: item.hourlyRate,
            total: this.calculateItemTotal(item),
            sortOrder: item.sortOrder ?? index,
          })),
        },
      },
      include: {
        project: { select: { id: true, name: true } },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateBomDto) {
    const bom = await this.findOne(id, companyId);

    // Update base data
    const updateData: any = {
      name: dto.name,
      description: dto.description,
      isTemplate: dto.isTemplate,
      category: dto.category,
    };

    // If items are provided, replace all items
    if (dto.items) {
      await this.prisma.bomItem.deleteMany({ where: { bomId: id } });

      await this.prisma.bomItem.createMany({
        data: dto.items.map((item, index) => ({
          bomId: id,
          type: item.type,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'Stk',
          unitPrice: item.unitPrice,
          hours: item.hours,
          hourlyRate: item.hourlyRate,
          total: this.calculateItemTotal(item),
          sortOrder: item.sortOrder ?? index,
        })),
      });
    }

    return this.prisma.billOfMaterial.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async delete(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.billOfMaterial.delete({ where: { id } });
  }

  async duplicate(id: string, companyId: string, newName?: string) {
    const bom = await this.findOne(id, companyId);

    return this.prisma.billOfMaterial.create({
      data: {
        companyId,
        name: newName || `${bom.name} (Kopie)`,
        description: bom.description,
        projectId: bom.projectId,
        isTemplate: false,
        category: bom.category,
        items: {
          create: bom.items.map(item => ({
            type: item.type,
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            hours: item.hours,
            hourlyRate: item.hourlyRate,
            total: item.total,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  // Get predefined templates
  getTemplates() {
    return BOM_TEMPLATES.map((template, index) => ({
      id: `template-${index}`,
      ...template,
      items: template.items.map((item, itemIndex) => ({
        ...item,
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || (item.hours && item.hourlyRate ? item.hours * item.hourlyRate : 0),
        total: item.unitPrice 
          ? (item.quantity || 1) * item.unitPrice 
          : (item.hours || 0) * (item.hourlyRate || 0),
        sortOrder: itemIndex,
      })),
    }));
  }

  private calculateItemTotal(item: any): number {
    if (item.type === 'LABOR') {
      return (item.hours || 0) * (item.hourlyRate || 0);
    }
    return (item.quantity || 0) * (item.unitPrice || 0);
  }

  private calculateTotal(items: any[], type: string): number {
    return items
      .filter(item => item.type === type)
      .reduce((sum, item) => sum + Number(item.total || 0), 0);
  }

  private calculateGrandTotal(items: any[]): number {
    return items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  }
}
