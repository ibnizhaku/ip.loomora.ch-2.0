import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EmailService } from '../../common/services/email.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

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
              roleId: true,
              role: { select: { id: true, name: true } },
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
            roleId: true,
            role: { select: { id: true, name: true } },
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
      role: user.memberships[0]?.role?.id || '',
      roleName: (user.memberships[0]?.role?.name || user.role || 'user'),
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
    password?: string;
    sendInvite?: boolean;
  }) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('E-Mail-Adresse ist bereits registriert');
    }

    // Passwort bestimmen: manuell gesetzt, Einladungsflow (temp) oder Fallback (temp)
    let plainPassword: string;
    let isTempPassword = false;

    if (dto.password && dto.password.length >= 8) {
      plainPassword = dto.password;
    } else {
      plainPassword = Math.random().toString(36).slice(-10) + 'A1!';
      isTempPassword = true;
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // Find role
    const roleName = dto.role || 'user';
    const role = await this.prisma.role.findFirst({
      where: { companyId, name: { contains: roleName, mode: 'insensitive' } },
    });

    const result = await this.prisma.$transaction(async (tx) => {
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

    // E-Mail-Einladung senden wenn sendInvite=true oder kein manuelles Passwort gesetzt
    if (dto.sendInvite && isTempPassword) {
      await this.emailService.sendUserInvite({
        email: dto.email.toLowerCase(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        tempPassword: plainPassword,
      });
    }

    return result;
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

    // Update user fields
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email?.toLowerCase(),
        phone: dto.phone,
        isActive: dto.isActive,
      },
    });

    // Update role in membership if provided
    if (dto.role) {
      // Verify the role exists and belongs to this company
      const role = await this.prisma.role.findFirst({
        where: { id: dto.role, companyId },
      });
      if (role) {
        await this.prisma.userCompanyMembership.update({
          where: { userId_companyId: { userId: id, companyId } },
          data: { roleId: dto.role },
        });
      }
    }

    // Return full user detail
    return this.findById(id, companyId);
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

  // All 55 granular module keys (matching frontend sidebar 1:1)
  private readonly ALL_MODULES = [
    // Hauptmenü
    'dashboard', 'projects', 'tasks', 'calendar',
    // CRM
    'customers', 'suppliers',
    // Verkauf
    'quotes', 'orders', 'delivery-notes', 'invoices', 'credit-notes', 'reminders',
    // Verwaltung
    'time-entries', 'purchase-orders', 'purchase-invoices', 'inventory', 'products',
    'bom', 'calculation', 'production', 'quality', 'service', 'contracts', 'documents', 'reports',
    // Buchhaltung
    'finance', 'cash-book', 'cost-centers', 'budgets', 'debtors', 'creditors',
    'bank-accounts', 'chart-of-accounts', 'journal-entries', 'general-ledger',
    'balance-sheet', 'vat-returns', 'fixed-assets',
    // Personal (HR)
    'employees', 'employee-contracts', 'payroll', 'absences', 'travel-expenses',
    'recruiting', 'training', 'departments', 'orgchart',
    // Marketing
    'campaigns', 'leads', 'email-marketing',
    // E-Commerce
    'shop', 'discounts', 'reviews',
    // Administration
    'users', 'roles', 'company', 'settings',
  ];

  // Old broad keys → new granular keys (for migration/inheritance)
  private readonly PARENT_MAP: Record<string, string[]> = {
    'invoices': ['quotes', 'orders', 'delivery-notes', 'invoices', 'credit-notes', 'reminders'],
    'finance': ['finance', 'cash-book', 'cost-centers', 'budgets', 'debtors', 'creditors',
      'bank-accounts', 'chart-of-accounts', 'journal-entries', 'general-ledger',
      'balance-sheet', 'vat-returns', 'fixed-assets'],
    'employees': ['employees', 'employee-contracts', 'payroll', 'absences', 'travel-expenses',
      'recruiting', 'training', 'departments', 'orgchart'],
    'settings': ['users', 'roles', 'company', 'settings'],
  };

  /**
   * Resolve role permissions: if role has a broad key (e.g. "invoices"),
   * expand it to all granular children. Returns a Map<moduleKey, {read,write,delete}>
   */
  private resolveRolePermissions(rolePerms: any[]): Map<string, { read: boolean; write: boolean; delete: boolean }> {
    // Collect raw permissions by module key
    const rawMap = new Map<string, Set<string>>();
    for (const rp of rolePerms) {
      if (!rawMap.has(rp.module)) rawMap.set(rp.module, new Set());
      rawMap.get(rp.module)!.add(rp.permission);
    }

    // Expand broad keys into granular keys
    const resolved = new Map<string, { read: boolean; write: boolean; delete: boolean }>();

    for (const [moduleKey, actions] of rawMap) {
      const hasAdmin = actions.has('admin');
      const read = hasAdmin || actions.has('read');
      const write = hasAdmin || actions.has('write');
      const del = hasAdmin || actions.has('delete');
      const permObj = { read, write, delete: del };

      // If this is a broad parent key, expand to all children
      const children = this.PARENT_MAP[moduleKey];
      if (children) {
        for (const child of children) {
          // Only set if not already set by a more specific permission
          if (!resolved.has(child)) {
            resolved.set(child, { ...permObj });
          }
        }
      }

      // Also set the key itself (covers both direct and parent keys)
      if (!resolved.has(moduleKey)) {
        resolved.set(moduleKey, permObj);
      }
    }

    return resolved;
  }

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

    // 2. Resolve role permissions (expand broad keys to granular)
    const roleMap = this.resolveRolePermissions(rolePermissions);

    // 3. Get user overrides
    const overrides = await this.prisma.userPermissionOverride.findMany({
      where: { userId, companyId },
    });
    const overrideMap = new Map(overrides.map(o => [o.module, o]));

    // 4. Build permission list for ALL 55 modules
    const permissions = this.ALL_MODULES.map(moduleKey => {
      const override = overrideMap.get(moduleKey);
      if (override) {
        return {
          module: moduleKey,
          read: override.canRead,
          write: override.canWrite,
          delete: override.canDelete,
          source: 'override' as const,
        };
      }

      const rolePerm = roleMap.get(moduleKey);
      return {
        module: moduleKey,
        read: rolePerm?.read || false,
        write: rolePerm?.write || false,
        delete: rolePerm?.delete || false,
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

    // 2. Resolve role defaults (expanded)
    const roleMap = this.resolveRolePermissions(membership.role?.permissions || []);

    // 3. Only save overrides (entries with source: "override")
    const overrideEntries = permissions.filter(p => p.source === 'override');

    const toUpsert: any[] = [];
    for (const perm of overrideEntries) {
      const rolePerm = roleMap.get(perm.module);
      const roleRead = rolePerm?.read || false;
      const roleWrite = rolePerm?.write || false;
      const roleDelete = rolePerm?.delete || false;

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
