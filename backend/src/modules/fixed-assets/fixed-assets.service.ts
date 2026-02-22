import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CreateFixedAssetDto, 
  UpdateFixedAssetDto, 
  AssetCategory,
  DepreciationMethod,
  AssetStatus,
  DisposeAssetDto,
  DepreciationRunDto 
} from './dto/fixed-asset.dto';

@Injectable()
export class FixedAssetsService {
  constructor(private prisma: PrismaService) {}

  // Swiss default depreciation rates by category
  private readonly DEFAULT_RATES: Record<AssetCategory, number> = {
    [AssetCategory.BUILDINGS]: 0.04,      // 4%
    [AssetCategory.MACHINERY]: 0.125,     // 12.5%
    [AssetCategory.VEHICLES]: 0.20,       // 20%
    [AssetCategory.FURNITURE]: 0.125,     // 12.5%
    [AssetCategory.IT_EQUIPMENT]: 0.25,   // 25%
    [AssetCategory.SOFTWARE]: 0.33,       // 33%
    [AssetCategory.TOOLS]: 0.25,          // 25%
    [AssetCategory.OTHER]: 0.10,          // 10%
  };

  async findAll(companyId: string, params: {
    page?: number;
    pageSize?: number;
    status?: string;
    category?: string;
    search?: string;
  }) {
    const { page = 1, pageSize = 20, status, category, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = { companyId };
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [raw, total] = await Promise.all([
      this.prisma.fixedAsset.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ acquisitionDate: 'desc' }, { number: 'asc' }],
        include: {
          costCenter: { select: { id: true, number: true, name: true } },
          depreciations: true,
        },
      }),
      this.prisma.fixedAsset.count({ where }),
    ]);

    const data = raw.map((a: any) => {
      const accumulatedDepreciation = (a.depreciations || []).reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
      const bookValue = Number(a.acquisitionCost || 0) - accumulatedDepreciation;
      const categoryMap: Record<string, string> = {
        BUILDINGS: 'buildings',
        MACHINERY: 'machinery',
        VEHICLES: 'vehicles',
        FURNITURE: 'equipment',
        IT_EQUIPMENT: 'equipment',
        SOFTWARE: 'software',
        TOOLS: 'equipment',
        OTHER: 'equipment',
      };
      const statusMap: Record<string, string> = {
        ACTIVE: 'active',
        FULLY_DEPRECIATED: 'fully-depreciated',
        DISPOSED: 'disposed',
        SOLD: 'disposed',
      };
      return {
        ...a,
        inventoryNumber: a.number,
        acquisitionCost: Number(a.acquisitionCost || 0),
        bookValue,
        accumulatedDepreciation,
        status: statusMap[a.status] || 'active',
        category: categoryMap[a.category] || 'equipment',
      };
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string, companyId: string) {
    const asset = await this.prisma.fixedAsset.findFirst({
      where: { id, companyId },
      include: {
        costCenter: { select: { id: true, number: true, name: true } },
        depreciations: {
          orderBy: { year: 'desc' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Anlagegut nicht gefunden');
    }

    // Calculate current values
    const totalDepreciation = asset.depreciations.reduce((sum, d) => sum + Number(d.amount), 0);
    const bookValue = Number(asset.acquisitionCost) - totalDepreciation;
    const remainingLife = Math.max(0, asset.usefulLife - asset.depreciations.length);

    return {
      ...asset,
      totalDepreciation,
      bookValue,
      remainingLife,
      depreciationProgress: (totalDepreciation / Number(asset.acquisitionCost) * 100).toFixed(1),
    };
  }

  async create(companyId: string, dto: CreateFixedAssetDto) {
    // Generate number
    const count = await this.prisma.fixedAsset.count({ where: { companyId } });
    const number = `ANL-${String(count + 1).padStart(5, '0')}`;

    // Determine depreciation rate
    const depreciationRate = dto.depreciationRate || this.DEFAULT_RATES[dto.category];

    return this.prisma.fixedAsset.create({
      data: {
        companyId,
        number,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        serialNumber: dto.serialNumber,
        location: dto.location,
        acquisitionDate: new Date(dto.acquisitionDate),
        acquisitionCost: dto.acquisitionCost,
        residualValue: dto.residualValue || 0,
        usefulLife: dto.usefulLife,
        depreciationMethod: dto.depreciationMethod,
        depreciationRate,
        currentBookValue: dto.acquisitionCost,
        purchaseInvoiceId: dto.purchaseInvoiceId,
        costCenterId: dto.costCenterId,
        assetAccountId: dto.assetAccountId,
        depreciationAccountId: dto.depreciationAccountId,
        status: AssetStatus.ACTIVE,
      },
    });
  }

  async update(id: string, companyId: string, dto: UpdateFixedAssetDto) {
    const asset = await this.findOne(id, companyId);

    if (asset.status === AssetStatus.DISPOSED || asset.status === AssetStatus.SOLD) {
      throw new BadRequestException('Veräusserte Anlage kann nicht bearbeitet werden');
    }

    return this.prisma.fixedAsset.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        serialNumber: dto.serialNumber,
        location: dto.location,
        residualValue: dto.residualValue,
        costCenterId: dto.costCenterId,
      },
    });
  }

  async dispose(id: string, companyId: string, dto: DisposeAssetDto) {
    const asset = await this.findOne(id, companyId);

    if (asset.status !== AssetStatus.ACTIVE && asset.status !== AssetStatus.FULLY_DEPRECIATED) {
      throw new BadRequestException('Anlage kann nicht veräussert werden');
    }

    const bookValue = asset.bookValue;
    const salePrice = dto.salePrice || 0;
    const gainLoss = salePrice - bookValue;

    return this.prisma.fixedAsset.update({
      where: { id },
      data: {
        status: dto.salePrice ? AssetStatus.SOLD : AssetStatus.DISPOSED,
        disposalDate: new Date(dto.disposalDate),
        salePrice: dto.salePrice,
        disposalReason: dto.reason,
        disposalNotes: dto.notes,
        gainLoss,
        currentBookValue: 0,
      },
    });
  }

  // Calculate depreciation for a single asset
  calculateDepreciation(asset: {
    acquisitionCost: number;
    residualValue: number;
    usefulLife: number;
    depreciationMethod: DepreciationMethod;
    depreciationRate: number;
    currentBookValue: number;
    depreciationsCount: number;
  }) {
    const { acquisitionCost, residualValue, usefulLife, depreciationMethod, depreciationRate, currentBookValue, depreciationsCount } = asset;

    const depreciableAmount = acquisitionCost - residualValue;

    if (depreciationMethod === DepreciationMethod.LINEAR) {
      // Linear: Fixed annual amount
      const annualDepreciation = depreciableAmount / usefulLife;
      const remainingValue = Math.max(residualValue, currentBookValue - annualDepreciation);
      return Math.min(annualDepreciation, currentBookValue - residualValue);
    } else {
      // Declining balance: Percentage of book value
      const annualDepreciation = currentBookValue * depreciationRate;
      
      // Switch to linear in final years if it results in higher depreciation
      const remainingYears = usefulLife - depreciationsCount;
      const linearRemaining = (currentBookValue - residualValue) / remainingYears;
      
      if (remainingYears <= 1 || linearRemaining > annualDepreciation) {
        return Math.max(0, currentBookValue - residualValue);
      }
      
      return Math.min(annualDepreciation, currentBookValue - residualValue);
    }
  }

  // Run depreciation for all assets
  async runDepreciation(companyId: string, dto: DepreciationRunDto) {
    const assets = await this.prisma.fixedAsset.findMany({
      where: { 
        companyId, 
        status: AssetStatus.ACTIVE,
        acquisitionDate: { lt: new Date(`${dto.year}-12-31`) },
      },
      include: {
        _count: { select: { depreciations: true } },
      },
    });

    const results: any[] = [];

    for (const asset of assets) {
      // Check if already depreciated for this year
      const existing = await this.prisma.assetDepreciation.findFirst({
        where: { fixedAssetId: asset.id, year: dto.year },
      });
      if (existing) {
        results.push({
          assetId: asset.id,
          assetNumber: asset.number,
          status: 'SKIPPED',
          reason: 'Bereits abgeschrieben',
        });
        continue;
      }

      // Calculate depreciation
      const depreciationAmount = this.calculateDepreciation({
        acquisitionCost: Number(asset.acquisitionCost),
        residualValue: Number(asset.residualValue),
        usefulLife: asset.usefulLife,
        depreciationMethod: asset.depreciationMethod as DepreciationMethod,
        depreciationRate: Number(asset.depreciationRate),
        currentBookValue: Number(asset.currentBookValue),
        depreciationsCount: asset._count.depreciations,
      });

      if (depreciationAmount <= 0) {
        results.push({
          assetId: asset.id,
          assetNumber: asset.number,
          status: 'SKIPPED',
          reason: 'Vollständig abgeschrieben',
        });
        
        // Update status
        await this.prisma.fixedAsset.update({
          where: { id: asset.id },
          data: { status: AssetStatus.FULLY_DEPRECIATED },
        });
        continue;
      }

      const newBookValue = Number(asset.currentBookValue) - depreciationAmount;

      // Create depreciation record
      await this.prisma.assetDepreciation.create({
        data: {
          fixedAssetId: asset.id,
          year: dto.year,
          amount: depreciationAmount,
          bookValueBefore: Number(asset.currentBookValue),
          bookValueAfter: newBookValue,
          isPosted: dto.postEntries || false,
        },
      });

      // Update asset
      await this.prisma.fixedAsset.update({
        where: { id: asset.id },
        data: {
          currentBookValue: newBookValue,
          status: newBookValue <= Number(asset.residualValue) 
            ? AssetStatus.FULLY_DEPRECIATED 
            : AssetStatus.ACTIVE,
        },
      });

      results.push({
        assetId: asset.id,
        assetNumber: asset.number,
        assetName: asset.name,
        status: 'CALCULATED',
        depreciationAmount,
        bookValueBefore: Number(asset.currentBookValue),
        bookValueAfter: newBookValue,
      });
    }

    // Summary
    const calculated = results.filter(r => r.status === 'CALCULATED');
    const totalDepreciation = calculated.reduce((sum, r) => sum + r.depreciationAmount, 0);

    return {
      year: dto.year,
      assetsProcessed: assets.length,
      depreciationsCreated: calculated.length,
      totalDepreciation,
      results,
    };
  }

  // Get depreciation schedule (Abschreibungsplan)
  async getDepreciationSchedule(id: string, companyId: string) {
    const asset = await this.findOne(id, companyId);
    
    const schedule: any[] = [];
    let bookValue = Number(asset.acquisitionCost);
    const startYear = new Date(asset.acquisitionDate).getFullYear();

    for (let year = 0; year < asset.usefulLife; year++) {
      const depreciationAmount = this.calculateDepreciation({
        acquisitionCost: Number(asset.acquisitionCost),
        residualValue: Number(asset.residualValue),
        usefulLife: asset.usefulLife,
        depreciationMethod: asset.depreciationMethod as DepreciationMethod,
        depreciationRate: Number(asset.depreciationRate),
        currentBookValue: bookValue,
        depreciationsCount: year,
      });

      const newBookValue = Math.max(Number(asset.residualValue), bookValue - depreciationAmount);
      
      // Check if already depreciated
      const actualDepreciation = asset.depreciations.find(d => d.year === startYear + year);

      schedule.push({
        year: startYear + year,
        yearNumber: year + 1,
        bookValueStart: bookValue,
        depreciation: depreciationAmount,
        bookValueEnd: newBookValue,
        status: actualDepreciation ? 'COMPLETED' : (startYear + year <= new Date().getFullYear() ? 'PENDING' : 'PLANNED'),
        actualAmount: actualDepreciation ? Number(actualDepreciation.amount) : null,
      });

      bookValue = newBookValue;
      if (bookValue <= Number(asset.residualValue)) break;
    }

    return {
      asset: {
        id: asset.id,
        number: asset.number,
        name: asset.name,
        category: asset.category,
        acquisitionCost: asset.acquisitionCost,
        residualValue: asset.residualValue,
        usefulLife: asset.usefulLife,
        depreciationMethod: asset.depreciationMethod,
        depreciationRate: asset.depreciationRate,
      },
      schedule,
      totalPlannedDepreciation: schedule.reduce((sum, s) => sum + s.depreciation, 0),
    };
  }

  // Get statistics by category
  async getStatistics(companyId: string) {
    const assets = await this.prisma.fixedAsset.findMany({
      where: { companyId },
    });

    const byCategory = Object.values(AssetCategory).map(category => {
      const categoryAssets = assets.filter(a => a.category === category);
      return {
        category,
        count: categoryAssets.length,
        totalAcquisitionCost: categoryAssets.reduce((sum, a) => sum + Number(a.acquisitionCost), 0),
        totalBookValue: categoryAssets.reduce((sum, a) => sum + Number(a.currentBookValue), 0),
      };
    }).filter(c => c.count > 0);

    const activeAssets = assets.filter(a => a.status === AssetStatus.ACTIVE);
    const totalAcquisitionCost = activeAssets.reduce((sum, a) => sum + Number(a.acquisitionCost), 0);
    const totalBookValue = activeAssets.reduce((sum, a) => sum + Number(a.currentBookValue), 0);
    const totalDepreciation = totalAcquisitionCost - totalBookValue;

    const categoryBreakdown = byCategory.map(c => ({
      category: c.category,
      count: c.count,
      value: c.totalBookValue,
    }));

    return {
      totalAssets: assets.length,
      totalValue: totalBookValue,
      totalDepreciation,
      categoryBreakdown,
    };
  }
}
