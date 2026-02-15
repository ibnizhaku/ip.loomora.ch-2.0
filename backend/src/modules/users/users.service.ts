import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, query: PaginationDto) {
    const { page = 1, pageSize = 10, search, sortBy = 'lastName', sortOrder = 'asc' } = query;
    const { skip, take } = this.prisma.getPagination(page, pageSize);

    const where: any = {
      memberships: {
        some: { companyId }
      }
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if ((query as any).role) {
      where.memberships = {
        some: {
          companyId,
          role: { name: { equals: (query as any).role, mode: 'insensitive' } },
        },
      };
    }

    // isActive filter
    if ((query as any).isActive !== undefined) {
      const isActiveVal = String((query as any).isActive) === 'true';
      where.isActive = isActiveVal;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          status: true,
          twoFactorEnabled: true,
          avatarUrl: true,
          lastLoginAt: true,
          createdAt: true,
          employeeId: true,
          employee: { select: { id: true, number: true } },
          memberships: {
            where: { companyId },
            select: {
              role: { select: { name: true } },
              isOwner: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const mappedData = data.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      role: (user.memberships[0]?.role?.name || user.role || 'user').toLowerCase(),
      status: user.status === 'PENDING' ? 'pending' : user.isActive ? 'active' : 'inactive',
      lastLogin: user.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '',
      twoFactor: user.twoFactorEnabled,
      avatar: user.avatarUrl,
      avatarUrl: user.avatarUrl,
      isOwner: user.memberships[0]?.isOwner || false,
      employeeId: user.employeeId,
      employeeNumber: user.employee?.number,
    }));

    return this.prisma.createPaginatedResponse(mappedData, total, page, pageSize);
  }

  async findById(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { 
        id,
        memberships: { some: { companyId } }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        status: true,
        twoFactorEnabled: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        employeeId: true,
        employee: { select: { id: true, number: true } },
        memberships: {
          where: { companyId },
          select: {
            role: { select: { name: true } },
            isOwner: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: (user.memberships[0]?.role?.name || user.role || 'user').toLowerCase(),
      status: user.status === 'PENDING' ? 'pending' : user.isActive ? 'active' : 'inactive',
      lastLogin: user.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '',
      twoFactor: user.twoFactorEnabled,
      avatar: user.avatarUrl,
      isOwner: user.memberships[0]?.isOwner || false,
      createdAt: user.createdAt?.toISOString(),
      employeeId: user.employeeId,
      employeeNumber: user.employee?.number,
    };
  }

  async create(companyId: string, dto: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role?: string;
    createEmployee?: boolean;
    position?: string;
    departmentId?: string;
    hireDate?: string;
  }) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('E-Mail-Adresse ist bereits registriert');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Find role
    const roleName = dto.role || 'user';
    const role = await this.prisma.role.findFirst({
      where: { companyId, name: { contains: roleName, mode: 'insensitive' } },
    });

    return this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          status: 'ACTIVE',
          isActive: true,
        },
      });

      // Create membership
      await tx.userCompanyMembership.create({
        data: {
          userId: user.id,
          companyId,
          roleId: role?.id || (await tx.role.findFirst({ where: { companyId } }))!.id,
          isOwner: false,
          isPrimary: true,
        },
      });

      // Optionally create employee
      if (dto.createEmployee) {
        const company = await tx.company.update({
          where: { id: companyId },
          data: { employeeCounter: { increment: 1 } },
        });

        const number = `MA-${String(company.employeeCounter).padStart(4, '0')}`;

        const employee = await tx.employee.create({
          data: {
            number,
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email.toLowerCase(),
            phone: dto.phone,
            position: dto.position,
            departmentId: dto.departmentId || null,
            hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
            companyId,
          },
        });

        // Link user to employee
        await tx.user.update({
          where: { id: user.id },
          data: { employeeId: employee.id },
        });
      }

      return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
    });
  }

  async update(id: string, companyId: string, dto: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
  }) {
    const user = await this.prisma.user.findFirst({
      where: { id, memberships: { some: { companyId } } },
    });

    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    // Check email uniqueness if changing
    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing) {
        throw new ConflictException('E-Mail-Adresse ist bereits registriert');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        isActive: dto.isActive,
      },
    });
  }

  async delete(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, memberships: { some: { companyId } } },
      include: {
        memberships: { where: { companyId } },
      },
    });

    if (!user) {
      throw new NotFoundException('Benutzer nicht gefunden');
    }

    // Check if user is owner
    if (user.memberships[0]?.isOwner) {
      throw new BadRequestException('Der Company-Eigentümer kann nicht gelöscht werden');
    }

    // Remove membership (don't delete user - might be in other companies)
    await this.prisma.userCompanyMembership.deleteMany({
      where: { userId: id, companyId },
    });

    return { success: true, message: 'Benutzer aus der Company entfernt' };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  // ─── PERMISSIONS ─────────────────────────────────────────

  private readonly MODULES = [
    'Dashboard', 'Projekte', 'Aufgaben', 'Zeiterfassung', 'Produktion', 'Stücklisten',
    'Kunden', 'Rechnungen', 'Buchhaltung', 'Personal', 'Einstellungen',
  ];

  // Module name → backend permission module key mapping
  private readonly MODULE_KEY_MAP: Record<string, string> = {
    'Dashboard': 'dashboard',
    'Projekte': 'projects',
    'Aufgaben': 'tasks',
    'Zeiterfassung': 'time-entries',
    'Produktion': 'production',
    'Stücklisten': 'bom',
    'Kunden': 'customers',
    'Rechnungen': 'invoices',
    'Buchhaltung': 'finance',
    'Personal': 'employees',
    'Einstellungen': 'settings',
  };

  async getPermissions(userId: string, companyId: string) {
    // 1. Get user membership with role
    const membership = await this.prisma.userCompanyMembership.findFirst({
      where: { userId, companyId },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!membership) throw new NotFoundException('Benutzer nicht in dieser Company');

    const role = membership.role;
    const rolePermissions = role?.permissions || [];

    // 2. Get user overrides
    const overrides = await this.prisma.userPermissionOverride.findMany({
      where: { userId, companyId },
    });

    const overrideMap = new Map(overrides.map(o => [o.module, o]));

    // 3. Build permission list per module
    const permissions = this.MODULES.map(moduleName => {
      const moduleKey = this.MODULE_KEY_MAP[moduleName] || moduleName.toLowerCase();

      // Check if there's an override for this module
      const override = overrideMap.get(moduleName);
      if (override) {
        return {
          module: moduleName,
          read: override.canRead,
          write: override.canWrite,
          delete: override.canDelete,
          source: 'override' as const,
        };
      }

      // Fall back to role permissions
      const rolePerms = rolePermissions.filter(p => p.module === moduleKey);
      const hasAdmin = rolePerms.some(p => p.permission === 'admin');
      const hasRead = hasAdmin || rolePerms.some(p => p.permission === 'read');
      const hasWrite = hasAdmin || rolePerms.some(p => p.permission === 'write');
      const hasDelete = hasAdmin || rolePerms.some(p => p.permission === 'delete');

      return {
        module: moduleName,
        read: hasRead,
        write: hasWrite,
        delete: hasDelete,
        source: 'role' as const,
      };
    });

    return {
      roleId: role?.id || '',
      roleName: role?.name || 'Unbekannt',
      permissions,
    };
  }

  async updatePermissions(userId: string, companyId: string, permissions: any[]) {
    // 1. Verify membership
    const membership = await this.prisma.userCompanyMembership.findFirst({
      where: { userId, companyId },
      include: {
        role: { include: { permissions: true } },
      },
    });

    if (!membership) throw new NotFoundException('Benutzer nicht in dieser Company');

    const rolePermissions = membership.role?.permissions || [];

    // 2. Only save overrides (entries with source: "override")
    const overrides = permissions.filter(p => p.source === 'override');

    // 3. For each override, check if it differs from role default
    const toUpsert: any[] = [];
    for (const perm of overrides) {
      const moduleKey = this.MODULE_KEY_MAP[perm.module] || perm.module.toLowerCase();
      const rolePerms = rolePermissions.filter(p => p.module === moduleKey);
      const hasAdmin = rolePerms.some(p => p.permission === 'admin');
      const roleRead = hasAdmin || rolePerms.some(p => p.permission === 'read');
      const roleWrite = hasAdmin || rolePerms.some(p => p.permission === 'write');
      const roleDelete = hasAdmin || rolePerms.some(p => p.permission === 'delete');

      // Only save if different from role default
      if (perm.read !== roleRead || perm.write !== roleWrite || perm.delete !== roleDelete) {
        toUpsert.push({
          userId,
          companyId,
          module: perm.module,
          canRead: !!perm.read,
          canWrite: !!perm.write,
          canDelete: !!perm.delete,
        });
      }
    }

    // 4. Delete all current overrides for this user+company
    await this.prisma.userPermissionOverride.deleteMany({
      where: { userId, companyId },
    });

    // 5. Create new overrides
    if (toUpsert.length > 0) {
      await this.prisma.userPermissionOverride.createMany({
        data: toUpsert,
      });
    }

    // 6. Return updated permissions
    return this.getPermissions(userId, companyId);
  }
}
