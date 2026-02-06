import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTimeTypeDto,
  CreateProjectPhaseDto,
  UpdateProjectPhaseDto,
  CreateMachineDto,
  UpdateMachineDto,
  MachineQueryDto,
  CreateMachineBookingDto,
  CreateMaterialConsumptionDto,
  ProjectCostQueryDto,
  CreateProjectBudgetLineDto,
  CreateActivityTypeDto,
  CreateMetallbauTimeEntryDto,
  TimeTypeCode,
  CostType,
  ProjectType,
  ProjectPhaseType,
  SurchargeType,
} from './dto/metallbau.dto';
import { format } from 'date-fns';

// Zuschlagssätze gemäß GAV Metallbau Schweiz
const SURCHARGE_RATES: Record<SurchargeType, { percent?: number; amount?: number }> = {
  [SurchargeType.MONTAGE]: { percent: 15 },
  [SurchargeType.NACHT]: { percent: 25 },
  [SurchargeType.SAMSTAG]: { percent: 25 },
  [SurchargeType.SONNTAG]: { percent: 50 },
  [SurchargeType.FEIERTAG]: { percent: 100 },
  [SurchargeType.HOEHE]: { amount: 3 }, // CHF pro Stunde
  [SurchargeType.SCHMUTZ]: { amount: 2 }, // CHF pro Stunde
};

@Injectable()
export class MetallbauService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // TIME TYPES
  // ============================================

  async getTimeTypes(companyId: string) {
    return this.prisma.timeType.findMany({
      where: { companyId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createTimeType(companyId: string, dto: CreateTimeTypeDto) {
    return this.prisma.timeType.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async seedDefaultTimeTypes(companyId: string) {
    const defaultTypes = [
      { code: TimeTypeCode.PROJECT, name: 'Projektzeit', isProjectRelevant: true, isBillable: true, sortOrder: 1 },
      { code: TimeTypeCode.ORDER, name: 'Auftragszeit', isProjectRelevant: true, isBillable: true, sortOrder: 2 },
      { code: TimeTypeCode.GENERAL, name: 'Allgemeine Tätigkeit', isProjectRelevant: false, isBillable: false, sortOrder: 3 },
      { code: TimeTypeCode.ADMIN, name: 'Administration', isProjectRelevant: false, isBillable: false, sortOrder: 4 },
      { code: TimeTypeCode.TRAINING, name: 'Weiterbildung', isProjectRelevant: false, isBillable: false, sortOrder: 5 },
      { code: TimeTypeCode.ABSENCE, name: 'Abwesenheit', isProjectRelevant: false, isBillable: false, affectsCapacity: false, sortOrder: 6 },
    ];

    for (const type of defaultTypes) {
      await this.prisma.timeType.upsert({
        where: { companyId_code: { companyId, code: type.code } },
        create: { ...type, companyId },
        update: {},
      });
    }

    return this.getTimeTypes(companyId);
  }

  // ============================================
  // PROJECT PHASES
  // ============================================

  async getProjectPhases(projectId: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.projectPhase.findMany({
      where: { projectId },
      orderBy: { sequence: 'asc' },
      include: {
        _count: {
          select: { 
            timeEntries: true,
            machineBookings: true,
            materialConsumptions: true,
          },
        },
      },
    });
  }

  async createProjectPhase(companyId: string, dto: CreateProjectPhaseDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, companyId },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Check project status
    if (project.status === 'COMPLETED' || project.status === 'CANCELLED') {
      throw new ForbiddenException('Cannot add phases to closed project');
    }

    return this.prisma.projectPhase.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        phaseType: dto.phaseType,
        sequence: dto.sequence || 1,
        budgetAmount: dto.budgetAmount || 0,
        plannedStart: dto.plannedStart ? new Date(dto.plannedStart) : null,
        plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : null,
      },
    });
  }

  async updateProjectPhase(id: string, companyId: string, dto: UpdateProjectPhaseDto) {
    const phase = await this.prisma.projectPhase.findFirst({
      where: { id },
      include: { project: true },
    });
    if (!phase || phase.project.companyId !== companyId) {
      throw new NotFoundException('Phase not found');
    }

    return this.prisma.projectPhase.update({
      where: { id },
      data: {
        name: dto.name,
        budgetAmount: dto.budgetAmount,
        plannedStart: dto.plannedStart ? new Date(dto.plannedStart) : undefined,
        plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : undefined,
        isCompleted: dto.isCompleted,
        completedAt: dto.isCompleted ? new Date() : undefined,
      },
    });
  }

  async createDefaultPhases(projectId: string, companyId: string, projectType: ProjectType) {
    const phases: { name: string; phaseType: ProjectPhaseType; sequence: number }[] = [];

    switch (projectType) {
      case ProjectType.WERKSTATT:
        phases.push(
          { name: 'Planung', phaseType: ProjectPhaseType.PLANUNG, sequence: 1 },
          { name: 'Fertigung', phaseType: ProjectPhaseType.FERTIGUNG, sequence: 2 },
          { name: 'Abschluss', phaseType: ProjectPhaseType.ABSCHLUSS, sequence: 3 },
        );
        break;
      case ProjectType.MONTAGE:
        phases.push(
          { name: 'Planung', phaseType: ProjectPhaseType.PLANUNG, sequence: 1 },
          { name: 'Montage', phaseType: ProjectPhaseType.MONTAGE, sequence: 2 },
          { name: 'Abschluss', phaseType: ProjectPhaseType.ABSCHLUSS, sequence: 3 },
        );
        break;
      case ProjectType.KOMBINIERT:
      default:
        phases.push(
          { name: 'Planung', phaseType: ProjectPhaseType.PLANUNG, sequence: 1 },
          { name: 'Fertigung', phaseType: ProjectPhaseType.FERTIGUNG, sequence: 2 },
          { name: 'Montage', phaseType: ProjectPhaseType.MONTAGE, sequence: 3 },
          { name: 'Abschluss', phaseType: ProjectPhaseType.ABSCHLUSS, sequence: 4 },
        );
    }

    for (const phase of phases) {
      await this.prisma.projectPhase.create({
        data: {
          projectId,
          ...phase,
        },
      });
    }

    return this.getProjectPhases(projectId, companyId);
  }

  // ============================================
  // MACHINES
  // ============================================

  async getMachines(companyId: string, query: MachineQueryDto) {
    const { page = 1, pageSize = 50, machineType, status } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { companyId };
    if (machineType) where.machineType = machineType;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.machine.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          costCenter: { select: { id: true, name: true, number: true } },
        },
      }),
      this.prisma.machine.count({ where }),
    ]);

    return this.prisma.createPaginatedResponse(data, total, page, pageSize);
  }

  async getMachineById(id: string, companyId: string) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, companyId },
      include: {
        costCenter: true,
        bookings: {
          take: 10,
          orderBy: { bookingDate: 'desc' },
          include: {
            project: { select: { id: true, name: true, number: true } },
          },
        },
      },
    });
    if (!machine) throw new NotFoundException('Machine not found');
    return machine;
  }

  async createMachine(companyId: string, dto: CreateMachineDto) {
    return this.prisma.machine.create({
      data: {
        name: dto.name,
        machineType: dto.machineType || 'SONSTIGE',
        costCenterId: dto.costCenterId,
        hourlyRate: dto.hourlyRate,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
        purchaseValue: dto.purchaseValue,
        currentBookValue: dto.purchaseValue, // Initial = Anschaffungswert
        usefulLifeYears: dto.usefulLifeYears,
        maintenanceCostYear: dto.maintenanceCostYear,
        energyCostHour: dto.energyCostHour,
        notes: dto.notes,
        companyId,
      },
    });
  }

  async updateMachine(id: string, companyId: string, dto: UpdateMachineDto) {
    const machine = await this.prisma.machine.findFirst({
      where: { id, companyId },
    });
    if (!machine) throw new NotFoundException('Machine not found');

    return this.prisma.machine.update({
      where: { id },
      data: dto,
    });
  }

  // ============================================
  // MACHINE BOOKINGS
  // ============================================

  async createMachineBooking(companyId: string, dto: CreateMachineBookingDto) {
    // Validierungen
    const [machine, project] = await Promise.all([
      this.prisma.machine.findFirst({ where: { id: dto.machineId, companyId } }),
      this.prisma.project.findFirst({ where: { id: dto.projectId, companyId } }),
    ]);

    if (!machine) throw new NotFoundException('Machine not found');
    if (!project) throw new NotFoundException('Project not found');

    // Projekt-Status prüfen
    if (project.status === 'COMPLETED' || project.status === 'CANCELLED') {
      throw new ForbiddenException('Cannot book to closed project');
    }

    // Maschinen-Status prüfen
    if (machine.status !== 'ACTIVE') {
      throw new BadRequestException('Machine is not active');
    }

    const hourlyRate = Number(machine.hourlyRate);
    const totalCost = dto.durationHours * hourlyRate;

    // Transaktion: Maschinenbuchung + Kosteneintrag
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.machineBooking.create({
        data: {
          machineId: dto.machineId,
          projectId: dto.projectId,
          projectPhaseId: dto.projectPhaseId,
          bookingDate: dto.bookingDate ? new Date(dto.bookingDate) : new Date(),
          durationHours: dto.durationHours,
          hourlyRate,
          totalCost,
          operatorId: dto.operatorId,
          description: dto.description,
          companyId,
        },
      });

      // Automatische Kostenbuchung
      await tx.projectCostEntry.create({
        data: {
          projectId: dto.projectId,
          projectPhaseId: dto.projectPhaseId,
          entryDate: booking.bookingDate,
          costType: CostType.MACHINE,
          sourceType: 'MACHINE_BOOKING',
          sourceId: booking.id,
          amount: totalCost,
          isDirectCost: true,
          description: `Maschinenkosten: ${machine.name}`,
          companyId,
          machineBookingId: booking.id,
        },
      });

      // Projekt-Totals aktualisieren
      await tx.project.update({
        where: { id: dto.projectId },
        data: {
          actualCostTotal: { increment: totalCost },
        },
      });

      return booking;
    });
  }

  // ============================================
  // MATERIAL CONSUMPTION
  // ============================================

  async createMaterialConsumption(companyId: string, dto: CreateMaterialConsumptionDto) {
    const [product, project] = await Promise.all([
      this.prisma.product.findFirst({ where: { id: dto.productId, companyId } }),
      this.prisma.project.findFirst({ where: { id: dto.projectId, companyId } }),
    ]);

    if (!product) throw new NotFoundException('Product not found');
    if (!project) throw new NotFoundException('Project not found');

    if (project.status === 'COMPLETED' || project.status === 'CANCELLED') {
      throw new ForbiddenException('Cannot book to closed project');
    }

    // Durchschnittspreis ermitteln (Ø-Preis-Methode)
    const unitPrice = Number(product.purchasePrice) || 0;
    const totalCost = dto.quantity * unitPrice;

    return this.prisma.$transaction(async (tx) => {
      const consumption = await tx.materialConsumption.create({
        data: {
          productId: dto.productId,
          projectId: dto.projectId,
          projectPhaseId: dto.projectPhaseId,
          consumptionDate: dto.consumptionDate ? new Date(dto.consumptionDate) : new Date(),
          quantity: dto.quantity,
          unit: dto.unit,
          unitPrice,
          totalCost,
          consumptionType: dto.consumptionType || 'PRODUCTION',
          scrapQuantity: dto.scrapQuantity || 0,
          warehouseId: dto.warehouseId,
          description: dto.description,
          companyId,
        },
      });

      // Automatische Kostenbuchung
      await tx.projectCostEntry.create({
        data: {
          projectId: dto.projectId,
          projectPhaseId: dto.projectPhaseId,
          entryDate: consumption.consumptionDate,
          costType: CostType.MATERIAL,
          sourceType: 'MATERIAL_CONSUMPTION',
          sourceId: consumption.id,
          amount: totalCost,
          isDirectCost: true,
          description: `Material: ${product.name}`,
          companyId,
          materialConsumptionId: consumption.id,
        },
      });

      // Lagerbestand reduzieren
      await tx.product.update({
        where: { id: dto.productId },
        data: {
          stockQuantity: { decrement: dto.quantity },
        },
      });

      // Projekt-Totals aktualisieren
      await tx.project.update({
        where: { id: dto.projectId },
        data: {
          actualCostTotal: { increment: totalCost },
        },
      });

      return consumption;
    });
  }

  // ============================================
  // TIME ENTRY (Erweitert für Metallbau)
  // ============================================

  async createMetallbauTimeEntry(companyId: string, userId: string, dto: CreateMetallbauTimeEntryDto) {
    // TimeType ermitteln
    const timeType = await this.prisma.timeType.findFirst({
      where: { companyId, code: dto.timeTypeCode },
    });

    if (!timeType) {
      throw new BadRequestException(`TimeType ${dto.timeTypeCode} not found. Please seed default time types first.`);
    }

    // Validierung: Projektwirksame Zeit braucht Projekt
    if (timeType.isProjectRelevant && !dto.projectId) {
      throw new BadRequestException('Project is required for project-relevant time types');
    }

    // Validierung: Nicht-projektwirksame Zeit darf kein Projekt haben
    if (!timeType.isProjectRelevant && dto.projectId) {
      throw new BadRequestException('Project is not allowed for non-project-relevant time types');
    }

    // Projekt-Status prüfen
    if (dto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: dto.projectId, companyId },
      });
      if (!project) throw new NotFoundException('Project not found');
      if (project.status === 'COMPLETED' || project.status === 'CANCELLED') {
        throw new ForbiddenException('Cannot book time to closed project');
      }
    }

    // Stundensatz ermitteln
    let baseHourlyRate = dto.baseHourlyRate || 65; // Default-Stundensatz
    
    // Zuschläge berechnen
    let surchargeTotal = 0;
    const hours = dto.duration / 60;

    if (dto.surcharges && dto.surcharges.length > 0) {
      for (const surcharge of dto.surcharges) {
        const rate = SURCHARGE_RATES[surcharge];
        if (rate.percent) {
          surchargeTotal += baseHourlyRate * (rate.percent / 100) * hours;
        }
        if (rate.amount) {
          surchargeTotal += rate.amount * hours;
        }
      }
    }

    // Montagezuschlag automatisch bei Baustelle
    if (dto.workLocation === 'BAUSTELLE' && (!dto.surcharges || !dto.surcharges.includes(SurchargeType.MONTAGE))) {
      surchargeTotal += baseHourlyRate * 0.15 * hours;
    }

    const effectiveHourlyRate = baseHourlyRate + (surchargeTotal / hours);
    const totalCost = (baseHourlyRate * hours) + surchargeTotal;

    return this.prisma.$transaction(async (tx) => {
      // TimeEntry erstellen
      const timeEntry = await tx.timeEntry.create({
        data: {
          userId,
          date: new Date(dto.date),
          duration: dto.duration,
          timeTypeId: timeType.id,
          activityTypeId: dto.activityTypeId,
          costCenterId: dto.costCenterId,
          projectId: dto.projectId,
          projectPhaseId: dto.projectPhaseId,
          taskId: dto.taskId,
          workLocation: dto.workLocation,
          machineId: dto.machineId,
          baseHourlyRate,
          surchargeTotal,
          effectiveHourlyRate,
          totalCost,
          description: dto.description,
          isBillable: timeType.isBillable,
          companyId,
        },
      });

      // Zuschläge speichern
      if (dto.surcharges && dto.surcharges.length > 0) {
        for (const surcharge of dto.surcharges) {
          const rate = SURCHARGE_RATES[surcharge];
          await tx.timeEntrySurcharge.create({
            data: {
              timeEntryId: timeEntry.id,
              surchargeType: surcharge,
              surchargePercent: rate.percent,
              surchargeAmount: rate.amount ? rate.amount * hours : null,
            },
          });
        }
      }

      // Nur bei projektwirksamer Zeit: Kosteneintrag erstellen
      if (timeType.isProjectRelevant && dto.projectId) {
        await tx.projectCostEntry.create({
          data: {
            projectId: dto.projectId,
            projectPhaseId: dto.projectPhaseId,
            entryDate: new Date(dto.date),
            costType: CostType.LABOR,
            sourceType: 'TIME_ENTRY',
            sourceId: timeEntry.id,
            amount: totalCost,
            isDirectCost: true,
            description: `Personalkosten: ${dto.description || 'Zeitbuchung'}`,
            companyId,
            timeEntryId: timeEntry.id,
          },
        });

        // Projekt-Totals aktualisieren
        await tx.project.update({
          where: { id: dto.projectId },
          data: {
            actualCostTotal: { increment: totalCost },
          },
        });
      }

      return timeEntry;
    });
  }

  // ============================================
  // PROJECT COST ENTRIES (Controlling)
  // ============================================

  async getProjectCostEntries(companyId: string, query: ProjectCostQueryDto) {
    const { page = 1, pageSize = 100, projectId, costType, startDate, endDate } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { companyId };
    if (projectId) where.projectId = projectId;
    if (costType) where.costType = costType;
    if (startDate && endDate) {
      where.entryDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.projectCostEntry.findMany({
        where,
        skip,
        take,
        orderBy: { entryDate: 'desc' },
        include: {
          project: { select: { id: true, name: true, number: true } },
          projectPhase: { select: { id: true, name: true, phaseType: true } },
        },
      }),
      this.prisma.projectCostEntry.count({ where }),
    ]);

    return this.prisma.createPaginatedResponse(data, total, page, pageSize);
  }

  // ============================================
  // PROJECT CONTROLLING (KPIs & Dashboard)
  // ============================================

  async getProjectControlling(projectId: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, companyId },
      include: {
        phases: true,
        invoices: {
          where: { status: { not: 'CANCELLED' } },
          select: { totalAmount: true, paidAmount: true },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    // Kosten nach Kategorien aggregieren
    const costsByType = await this.prisma.projectCostEntry.groupBy({
      by: ['costType'],
      where: { projectId, companyId },
      _sum: { amount: true },
    });

    const costMap: Record<string, number> = {};
    for (const ct of costsByType) {
      costMap[ct.costType] = Number(ct._sum.amount) || 0;
    }

    const laborCosts = costMap[CostType.LABOR] || 0;
    const machineCosts = costMap[CostType.MACHINE] || 0;
    const materialCosts = costMap[CostType.MATERIAL] || 0;
    const externalCosts = costMap[CostType.EXTERNAL] || 0;
    const overheadCosts = costMap[CostType.OVERHEAD] || 0;

    const actualCostTotal = laborCosts + machineCosts + materialCosts + externalCosts + overheadCosts;
    const budgetTotal = Number(project.budget) || 0;
    const budgetRemaining = budgetTotal - actualCostTotal;
    const budgetUsedPercent = budgetTotal > 0 ? (actualCostTotal / budgetTotal) * 100 : 0;

    // Erlöse berechnen
    const revenueTotal = project.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    // Marge berechnen
    const deckungsbeitrag = revenueTotal - actualCostTotal;
    const marginPercent = revenueTotal > 0 ? (deckungsbeitrag / revenueTotal) * 100 : 0;

    // Ampelsystem
    let status_color: 'green' | 'yellow' | 'red' = 'green';
    const warnings: string[] = [];

    if (budgetUsedPercent > 110) {
      status_color = 'red';
      warnings.push(`Budget um ${Math.round(budgetUsedPercent - 100)}% überschritten`);
    } else if (budgetUsedPercent > 100) {
      status_color = 'yellow';
      warnings.push(`Budget-Warnung: ${Math.round(budgetUsedPercent)}% verbraucht`);
    }

    if (marginPercent < 5 && revenueTotal > 0) {
      status_color = 'red';
      warnings.push(`Kritische Marge: ${marginPercent.toFixed(1)}%`);
    } else if (marginPercent < 10 && revenueTotal > 0) {
      if (status_color === 'green') status_color = 'yellow';
      warnings.push(`Niedrige Marge: ${marginPercent.toFixed(1)}%`);
    }

    return {
      projectId: project.id,
      projectName: project.name,
      projectNumber: project.number,
      projectType: project.projectType,
      status: project.status,
      
      budgetTotal,
      actualCostTotal,
      budgetRemaining,
      budgetUsedPercent: Math.round(budgetUsedPercent * 10) / 10,
      
      laborCosts,
      machineCosts,
      materialCosts,
      externalCosts,
      overheadCosts,
      
      revenueTotal,
      deckungsbeitrag,
      margin: deckungsbeitrag,
      marginPercent: Math.round(marginPercent * 10) / 10,
      
      status_color,
      warnings,
      
      phases: project.phases.map(p => ({
        id: p.id,
        name: p.name,
        phaseType: p.phaseType,
        budgetAmount: Number(p.budgetAmount),
        actualAmount: Number(p.actualAmount),
        isCompleted: p.isCompleted,
      })),
    };
  }

  // ============================================
  // ACTIVITY TYPES
  // ============================================

  async getActivityTypes(companyId: string) {
    return this.prisma.activityType.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createActivityType(companyId: string, dto: CreateActivityTypeDto) {
    return this.prisma.activityType.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async seedDefaultActivityTypes(companyId: string) {
    const defaultTypes = [
      // Fertigung
      { code: 'SCHNEIDEN', name: 'Schneiden (Laser, Plasma, Säge)', category: 'FERTIGUNG' },
      { code: 'BIEGEN', name: 'Biegen / Kanten', category: 'FERTIGUNG' },
      { code: 'SCHWEISSEN', name: 'Schweissen', category: 'FERTIGUNG' },
      { code: 'SCHLEIFEN', name: 'Schleifen / Entgraten', category: 'FERTIGUNG' },
      { code: 'BOHREN', name: 'Bohren / Fräsen', category: 'FERTIGUNG' },
      { code: 'CNC', name: 'CNC-Bearbeitung', category: 'FERTIGUNG' },
      { code: 'OBERFLAECHE', name: 'Oberflächenbehandlung', category: 'FERTIGUNG' },
      { code: 'QK', name: 'Qualitätskontrolle', category: 'FERTIGUNG' },
      // Montage
      { code: 'ANLIEFERUNG', name: 'Anlieferung / Abladen', category: 'MONTAGE' },
      { code: 'AUSRICHTEN', name: 'Ausrichten / Einmessen', category: 'MONTAGE' },
      { code: 'MONTAGE', name: 'Montage Konstruktion', category: 'MONTAGE' },
      { code: 'BEFESTIGUNG', name: 'Anschrauben / Dübeln', category: 'MONTAGE' },
      { code: 'SCHWEISSEN_BAUSTELLE', name: 'Schweissen vor Ort', category: 'MONTAGE' },
      { code: 'NACHARBEIT', name: 'Nacharbeit', category: 'MONTAGE' },
      // Planung
      { code: 'AUFMASS', name: 'Aufmass', category: 'PLANUNG' },
      { code: 'CAD', name: 'Konstruktion / CAD', category: 'PLANUNG' },
      { code: 'AV', name: 'Arbeitsvorbereitung', category: 'PLANUNG' },
      { code: 'DISPOSITION', name: 'Materialdisposition', category: 'PLANUNG' },
      { code: 'PL', name: 'Projektleitung', category: 'PLANUNG' },
    ];

    for (const type of defaultTypes) {
      await this.prisma.activityType.upsert({
        where: { companyId_code: { companyId, code: type.code } },
        create: { ...type, companyId },
        update: {},
      });
    }

    return this.getActivityTypes(companyId);
  }

  // ============================================
  // BUDGET LINES
  // ============================================

  async createProjectBudgetLine(companyId: string, dto: CreateProjectBudgetLineDto) {
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, companyId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const plannedTotal = dto.plannedQuantity * dto.plannedUnitPrice;

    return this.prisma.projectBudgetLine.create({
      data: {
        projectId: dto.projectId,
        projectPhaseId: dto.projectPhaseId,
        costType: dto.costType,
        description: dto.description,
        plannedQuantity: dto.plannedQuantity,
        plannedUnitPrice: dto.plannedUnitPrice,
        plannedTotal,
        companyId,
      },
    });
  }

  async getProjectBudgetLines(projectId: string, companyId: string) {
    return this.prisma.projectBudgetLine.findMany({
      where: { projectId, companyId },
      include: {
        projectPhase: { select: { id: true, name: true } },
      },
      orderBy: [{ costType: 'asc' }, { description: 'asc' }],
    });
  }
}
