import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto, RoleQueryDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // ─── LIST ──────────────────────────────────────────────
  async findAll(companyId: string, query: RoleQueryDto) {
    const { page = 1, pageSize = 50, search } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = { companyId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        where, skip, take,
        orderBy: [{ isSystemRole: 'desc' }, { name: 'asc' }],
        include: {
          permissions: true,
          memberships: {
            include: {
              user: {
                select: {
                  id: true, firstName: true, lastName: true, email: true,
                  employee: {
                    select: {
                      department: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
          createdByUser: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { memberships: true } },
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    const mapped = data.map(r => this.mapRole(r));
    return this.prisma.createPaginatedResponse(mapped, total, page, pageSize);
  }

  // ─── DETAIL ────────────────────────────────────────────
  async findById(id: string, companyId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
      include: {
        permissions: true,
        memberships: {
          include: {
            user: {
              select: {
                id: true, firstName: true, lastName: true, email: true,
                employee: {
                  select: {
                    department: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { memberships: true } },
      },
    });

    if (!role) throw new NotFoundException('Rolle nicht gefunden');
    return this.mapRole(role);
  }

  // ─── CREATE ────────────────────────────────────────────
  async create(companyId: string, userId: string, dto: CreateRoleDto) {
    // Check unique name per company
    const existing = await this.prisma.role.findFirst({
      where: { companyId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Eine Rolle mit dem Namen "${dto.name}" existiert bereits`);
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description || '',
        isSystemRole: false,
        companyId,
        createdByUserId: userId,
      },
    });

    // Create permissions
    if (dto.permissions?.length) {
      await this.syncPermissions(role.id, dto.permissions);
    }

    return this.findById(role.id, companyId);
  }

  // ─── UPDATE ────────────────────────────────────────────
  async update(id: string, companyId: string, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
    });

    if (!role) throw new NotFoundException('Rolle nicht gefunden');
    if (role.isSystemRole) throw new ForbiddenException('System-Rollen können nicht bearbeitet werden');

    // Check unique name if changing
    if (dto.name && dto.name !== role.name) {
      const existing = await this.prisma.role.findFirst({
        where: { companyId, name: dto.name, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException(`Eine Rolle mit dem Namen "${dto.name}" existiert bereits`);
      }
    }

    await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        description: dto.description ?? undefined,
      },
    });

    // Sync permissions if provided
    if (dto.permissions !== undefined) {
      await this.syncPermissions(id, dto.permissions);
    }

    return this.findById(id, companyId);
  }

  // ─── DELETE ────────────────────────────────────────────
  async delete(id: string, companyId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id, companyId },
      include: { _count: { select: { memberships: true } } },
    });

    if (!role) throw new NotFoundException('Rolle nicht gefunden');
    if (role.isSystemRole) throw new ForbiddenException('System-Rollen können nicht gelöscht werden');
    if (role._count.memberships > 0) {
      throw new ConflictException(
        `Diese Rolle ist noch ${role._count.memberships} Benutzer(n) zugewiesen. Bitte zuerst die Benutzer einer anderen Rolle zuweisen.`
      );
    }

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId: id } }),
      this.prisma.role.delete({ where: { id } }),
    ]);

    return { success: true };
  }

  // ─── HELPER: Sync permissions ──────────────────────────
  private async syncPermissions(roleId: string, permissions: string[]) {
    // Delete existing permissions
    await this.prisma.rolePermission.deleteMany({ where: { roleId } });

    // Parse "module:permission" format and create entries
    const entries = permissions
      .filter(p => p.includes(':'))
      .map(p => {
        const [module, permission] = p.split(':');
        return { roleId, module, permission };
      });

    if (entries.length) {
      await this.prisma.rolePermission.createMany({ data: entries });
    }
  }

  // ─── HELPER: Map Role to Frontend format ───────────────
  private mapRole(role: any) {
    const permissions = (role.permissions || []).map(
      (p: any) => `${p.module}:${p.permission}`
    );

    const users = (role.memberships || []).map((m: any) => ({
      id: m.user.id,
      name: `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim(),
      email: m.user.email || '',
      department: m.user.employee?.department?.name || undefined,
    }));

    return {
      id: role.id,
      name: role.name,
      description: role.description || '',
      type: role.isSystemRole ? 'system' : 'custom',
      isSystem: role.isSystemRole,
      userCount: role._count?.memberships || users.length,
      permissions,
      color: role.isSystemRole ? 'bg-primary/10' : 'bg-accent/10',
      users,
      createdAt: role.createdAt?.toISOString(),
      updatedAt: role.updatedAt?.toISOString(),
      createdBy: role.isSystemRole
        ? 'System'
        : role.createdByUser
          ? `${role.createdByUser.firstName} ${role.createdByUser.lastName}`.trim()
          : undefined,
    };
  }
}
