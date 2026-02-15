import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CompanySummary, ActiveCompanyInfo } from '../dto/auth.dto';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lädt alle aktiven Companies eines Users
   * Nur Companies mit status=ACTIVE und aktiver Subscription
   */
  async getActiveCompaniesForUser(userId: string): Promise<CompanySummary[]> {
    const memberships = await this.prisma.userCompanyMembership.findMany({
      where: {
        userId,
        company: {
          status: 'ACTIVE',
          subscriptions: {
            some: {
              status: { in: ['ACTIVE', 'PAST_DUE'] },
            },
          },
        },
      },
      include: {
        company: {
          include: {
            subscriptions: {
              where: {
                status: { in: ['ACTIVE', 'PAST_DUE'] },
              },
              take: 1,
            },
          },
        },
        role: true,
      },
    });

    return memberships.map((m) => ({
      id: m.company.id,
      name: m.company.name,
      slug: m.company.slug,
      status: m.company.status,
      role: m.role.name,
      isOwner: m.isOwner,
    }));
  }

  /**
   * Lädt alle Companies eines Users (inkl. pending)
   */
  async getAllCompaniesForUser(userId: string): Promise<CompanySummary[]> {
    const memberships = await this.prisma.userCompanyMembership.findMany({
      where: { userId },
      include: {
        company: true,
        role: true,
      },
    });

    return memberships.map((m) => ({
      id: m.company.id,
      name: m.company.name,
      slug: m.company.slug,
      status: m.company.status,
      role: m.role.name,
      isOwner: m.isOwner,
    }));
  }

  /**
   * Prüft ob User Mitglied einer Company ist
   */
  async validateMembership(
    userId: string,
    companyId: string,
  ): Promise<{
    membership: any;
    company: any;
    subscription: any;
    role: any;
    permissions: string[];
  }> {
    const membership = await this.prisma.userCompanyMembership.findUnique({
      where: {
        userId_companyId: { userId, companyId },
      },
      include: {
        company: {
          include: {
            subscriptions: {
              where: {
                status: { in: ['ACTIVE', 'PAST_DUE', 'CANCELLED'] },
              },
              include: {
                plan: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Du bist kein Mitglied dieser Company');
    }

    const company = membership.company;
    const subscription = company.subscriptions[0] || null;

    // ─── Granulare Permission-Auflösung ───────────────────────

    // Old broad keys → new granular keys (for backward-compatible expansion)
    const PARENT_MAP: Record<string, string[]> = {
      'invoices': ['quotes', 'orders', 'delivery-notes', 'invoices', 'credit-notes', 'reminders'],
      'finance': ['finance', 'cash-book', 'cost-centers', 'budgets', 'debtors', 'creditors',
        'bank-accounts', 'chart-of-accounts', 'journal-entries', 'general-ledger',
        'balance-sheet', 'vat-returns', 'fixed-assets'],
      'employees': ['employees', 'employee-contracts', 'payroll', 'absences', 'travel-expenses',
        'recruiting', 'training', 'departments', 'orgchart'],
      'settings': ['users', 'roles', 'company', 'settings'],
    };

    // 1. Expand role permissions into granular module:action pairs
    const mergedPermSet = new Set<string>();

    for (const rp of membership.role.permissions) {
      const actions = rp.permission === 'admin' ? ['read', 'write', 'delete', 'admin'] : [rp.permission];
      const children = PARENT_MAP[rp.module];

      if (children) {
        // Expand broad key to all granular children
        for (const child of children) {
          for (const action of actions) {
            mergedPermSet.add(`${child}:${action}`);
          }
        }
      }
      // Also always add the key itself
      for (const action of actions) {
        mergedPermSet.add(`${rp.module}:${action}`);
      }
    }

    // 2. Load and apply UserPermissionOverrides
    const overrides = await this.prisma.userPermissionOverride.findMany({
      where: { userId, companyId },
    });

    if (overrides.length > 0) {
      for (const override of overrides) {
        const moduleKey = override.module;

        // Remove all existing permissions for this module
        for (const action of ['read', 'write', 'delete', 'admin']) {
          mergedPermSet.delete(`${moduleKey}:${action}`);
        }

        // Add back only the override values
        if (override.canRead) mergedPermSet.add(`${moduleKey}:read`);
        if (override.canWrite) mergedPermSet.add(`${moduleKey}:write`);
        if (override.canDelete) mergedPermSet.add(`${moduleKey}:delete`);
      }
    }

    return {
      membership,
      company,
      subscription,
      role: membership.role,
      permissions: Array.from(mergedPermSet),
    };
  }

  /**
   * Lädt vollständige Company-Info für Token
   */
  async getActiveCompanyInfo(
    userId: string,
    companyId: string,
  ): Promise<ActiveCompanyInfo | null> {
    try {
      const { company, subscription, role, permissions, membership } =
        await this.validateMembership(userId, companyId);

      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
        status: company.status,
        subscriptionStatus: subscription?.status || 'PENDING',
        planName: subscription?.plan?.name || 'Kein Plan',
        role: role.name,
        permissions,
        isOwner: membership.isOwner,
      };
    } catch {
      return null;
    }
  }

  /**
   * Holt die primäre Company eines Users
   */
  async getPrimaryCompany(userId: string): Promise<string | null> {
    const primary = await this.prisma.userCompanyMembership.findFirst({
      where: {
        userId,
        isPrimary: true,
        company: {
          status: 'ACTIVE',
          subscriptions: {
            some: {
              status: { in: ['ACTIVE', 'PAST_DUE'] },
            },
          },
        },
      },
    });

    return primary?.companyId || null;
  }

  /**
   * Setzt eine Company als primär
   */
  async setPrimaryCompany(userId: string, companyId: string): Promise<void> {
    // Erst alle auf false setzen
    await this.prisma.userCompanyMembership.updateMany({
      where: { userId },
      data: { isPrimary: false },
    });

    // Dann die gewählte auf true
    await this.prisma.userCompanyMembership.update({
      where: {
        userId_companyId: { userId, companyId },
      },
      data: { isPrimary: true },
    });
  }

  /**
   * Erstellt System-Rollen für eine neue Company
   */
  async createSystemRoles(companyId: string): Promise<{
    ownerId: string;
    adminId: string;
    memberId: string;
  }> {
    const allPermissions = [
      'customers', 'suppliers', 'products', 'quotes', 'orders', 
      'invoices', 'payments', 'employees', 'projects', 'finance',
      'documents', 'contracts', 'settings', 'users',
    ];

    const allPerms = ['read', 'write', 'delete', 'admin'];
    const writePerms = ['read', 'write'];
    const readPerms = ['read'];

    // Owner Role
    const ownerRole = await this.prisma.role.create({
      data: {
        companyId,
        name: 'Owner',
        description: 'Firmeneigentümer mit Vollzugriff',
        isSystemRole: true,
        permissions: {
          create: allPermissions.flatMap((module) =>
            allPerms.map((permission) => ({ module, permission })),
          ),
        },
      },
    });

    // Admin Role
    const adminRole = await this.prisma.role.create({
      data: {
        companyId,
        name: 'Admin',
        description: 'Administrator mit Vollzugriff (ohne Abonnement-Verwaltung)',
        isSystemRole: true,
        permissions: {
          create: allPermissions
            .filter((m) => m !== 'settings')
            .flatMap((module) =>
              allPerms.map((permission) => ({ module, permission })),
            ),
        },
      },
    });

    // Member Role
    const memberRole = await this.prisma.role.create({
      data: {
        companyId,
        name: 'Member',
        description: 'Standard-Mitarbeiter',
        isSystemRole: true,
        permissions: {
          create: allPermissions
            .filter((m) => !['settings', 'users', 'finance'].includes(m))
            .flatMap((module) =>
              writePerms.map((permission) => ({ module, permission })),
            ),
        },
      },
    });

    return {
      ownerId: ownerRole.id,
      adminId: adminRole.id,
      memberId: memberRole.id,
    };
  }
}
