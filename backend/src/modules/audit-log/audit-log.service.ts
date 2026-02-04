import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAuditLogDto,
  AuditLogQueryDto,
  AuditLogExportDto,
  AuditAction,
  AuditModule,
} from './dto/audit-log.dto';

@Injectable()
export class AuditLogService {
  // Swiss OR requires 10 years retention for business documents
  private readonly RETENTION_YEARS = 10;

  constructor(private prisma: PrismaService) {}

  // Create audit log entry (called by other services)
  async log(
    companyId: string,
    userId: string,
    dto: CreateAuditLogDto,
    context?: { ipAddress?: string; userAgent?: string },
  ) {
    const retentionUntil = new Date();
    retentionUntil.setFullYear(retentionUntil.getFullYear() + this.RETENTION_YEARS);

    return this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: dto.action,
        module: dto.module,
        entityId: dto.entityId,
        entityType: dto.entityType,
        entityName: dto.entityName,
        description: dto.description,
        oldValues: dto.oldValues,
        newValues: dto.newValues,
        metadata: dto.metadata,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        retentionUntil,
      },
    });
  }

  // Bulk create for batch operations
  async logBulk(
    companyId: string,
    userId: string,
    entries: CreateAuditLogDto[],
    context?: { ipAddress?: string; userAgent?: string },
  ) {
    const retentionUntil = new Date();
    retentionUntil.setFullYear(retentionUntil.getFullYear() + this.RETENTION_YEARS);

    return this.prisma.auditLog.createMany({
      data: entries.map(dto => ({
        companyId,
        userId,
        action: dto.action,
        module: dto.module,
        entityId: dto.entityId,
        entityType: dto.entityType,
        entityName: dto.entityName,
        description: dto.description,
        oldValues: dto.oldValues,
        newValues: dto.newValues,
        metadata: dto.metadata,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
        retentionUntil,
      })),
    });
  }

  // Query audit logs with filters
  async findAll(companyId: string, params: AuditLogQueryDto) {
    const {
      action,
      module,
      entityId,
      entityType,
      userId,
      startDate,
      endDate,
      search,
      page = 1,
      pageSize = 50,
    } = params;

    const skip = (page - 1) * pageSize;
    const where: any = { companyId };

    if (action) where.action = action;
    if (module) where.module = module;
    if (entityId) where.entityId = entityId;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { entityName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: data.map(log => ({
        ...log,
        userName: log.user?.name || 'System',
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Get single audit log entry
  async findOne(id: string, companyId: string) {
    const log = await this.prisma.auditLog.findFirst({
      where: { id, companyId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!log) {
      throw new NotFoundException('Audit-Log Eintrag nicht gefunden');
    }

    return {
      ...log,
      userName: log.user?.name || 'System',
    };
  }

  // Get audit trail for specific entity
  async getEntityHistory(companyId: string, entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { companyId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  // Export audit logs (for compliance/audit purposes)
  async export(companyId: string, dto: AuditLogExportDto) {
    const where: any = {
      companyId,
      createdAt: {
        gte: new Date(dto.startDate),
        lte: new Date(dto.endDate),
      },
    };

    if (dto.module) where.module = dto.module;

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (dto.format === 'csv') {
      return this.formatAsCSV(logs);
    }

    return logs;
  }

  private formatAsCSV(logs: any[]): string {
    const headers = [
      'Datum',
      'Uhrzeit',
      'Benutzer',
      'Aktion',
      'Modul',
      'Entität',
      'Beschreibung',
      'IP-Adresse',
    ];

    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleDateString('de-CH'),
      new Date(log.createdAt).toLocaleTimeString('de-CH'),
      log.user?.name || 'System',
      log.action,
      log.module,
      log.entityName || log.entityId || '-',
      log.description || '-',
      log.ipAddress || '-',
    ]);

    return [headers, ...rows].map(row => row.join(';')).join('\n');
  }

  // Get statistics for dashboard
  async getStatistics(companyId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalLogs, byAction, byModule, byUser, recentActivity] = await Promise.all([
      this.prisma.auditLog.count({
        where: { companyId, createdAt: { gte: startDate } },
      }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where: { companyId, createdAt: { gte: startDate } },
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['module'],
        where: { companyId, createdAt: { gte: startDate } },
        _count: true,
      }),
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where: { companyId, createdAt: { gte: startDate } },
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
      this.prisma.auditLog.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { name: true } },
        },
      }),
    ]);

    // Get user names for top users
    const userIds = byUser.map(u => u.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const userMap = new Map(users.map(u => [u.id, u.name]));

    return {
      totalLogs,
      period: `${days} Tage`,
      byAction: byAction.map(a => ({
        action: a.action,
        count: a._count,
      })),
      byModule: byModule.map(m => ({
        module: m.module,
        count: m._count,
      })),
      topUsers: byUser.map(u => ({
        userId: u.userId,
        userName: userMap.get(u.userId) || 'Unbekannt',
        count: u._count,
      })),
      recentActivity: recentActivity.map(log => ({
        id: log.id,
        action: log.action,
        module: log.module,
        entityName: log.entityName,
        userName: log.user?.name || 'System',
        createdAt: log.createdAt,
      })),
    };
  }

  // Cleanup expired logs (should run as scheduled job)
  async cleanupExpiredLogs() {
    const result = await this.prisma.auditLog.deleteMany({
      where: {
        retentionUntil: { lt: new Date() },
      },
    });

    return { deletedCount: result.count };
  }

  // Helper method for other services to log changes
  async logChange(
    companyId: string,
    userId: string,
    module: AuditModule,
    action: AuditAction,
    entity: {
      id: string;
      type: string;
      name?: string;
    },
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    context?: { ipAddress?: string; userAgent?: string },
  ) {
    const changedFields = this.getChangedFields(oldValues, newValues);
    
    return this.log(
      companyId,
      userId,
      {
        action,
        module,
        entityId: entity.id,
        entityType: entity.type,
        entityName: entity.name,
        description: this.generateDescription(action, entity.type, entity.name, changedFields),
        oldValues: changedFields.length > 0 ? this.filterChangedValues(oldValues, changedFields) : undefined,
        newValues: changedFields.length > 0 ? this.filterChangedValues(newValues, changedFields) : undefined,
      },
      context,
    );
  }

  private getChangedFields(oldValues?: Record<string, any>, newValues?: Record<string, any>): string[] {
    if (!oldValues || !newValues) return [];
    
    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    
    for (const key of allKeys) {
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changedFields.push(key);
      }
    }
    
    return changedFields;
  }

  private filterChangedValues(values: Record<string, any> | undefined, changedFields: string[]): Record<string, any> {
    if (!values) return {};
    
    const filtered: Record<string, any> = {};
    for (const field of changedFields) {
      if (field in values) {
        filtered[field] = values[field];
      }
    }
    return filtered;
  }

  private generateDescription(action: AuditAction, entityType: string, entityName?: string, changedFields?: string[]): string {
    const name = entityName || entityType;
    
    switch (action) {
      case AuditAction.CREATE:
        return `${entityType} "${name}" erstellt`;
      case AuditAction.UPDATE:
        const fields = changedFields?.length ? ` (${changedFields.join(', ')})` : '';
        return `${entityType} "${name}" aktualisiert${fields}`;
      case AuditAction.DELETE:
        return `${entityType} "${name}" gelöscht`;
      case AuditAction.VIEW:
        return `${entityType} "${name}" angezeigt`;
      case AuditAction.EXPORT:
        return `${entityType} "${name}" exportiert`;
      case AuditAction.APPROVE:
        return `${entityType} "${name}" genehmigt`;
      case AuditAction.REJECT:
        return `${entityType} "${name}" abgelehnt`;
      case AuditAction.SEND:
        return `${entityType} "${name}" versendet`;
      case AuditAction.LOCK:
        return `${entityType} "${name}" gesperrt`;
      case AuditAction.UNLOCK:
        return `${entityType} "${name}" entsperrt`;
      default:
        return `${action} auf ${entityType} "${name}"`;
    }
  }
}
