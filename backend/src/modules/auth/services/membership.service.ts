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

    // Permissions aus Rolle extrahieren
    const rolePermissions = membership.role.permissions.map(
      (p) => `${p.module}:${p.permission}`,
    );

    // UserPermissionOverrides laden und mit Rollen-Defaults mergen
    const overrides = await this.prisma.userPermissionOverride.findMany({
      where: { userId, companyId },
    });

    // Backend-Module-Key → German-Name mapping (Umkehr der Frontend-Map)
    const REVERSE_MODULE_MAP: Record<string, string> = {
      'dashboard': 'Dashboard',
      'projects': 'Projekte',
      'tasks': 'Aufgaben',
      'time-entries': 'Zeiterfassung',
      'production': 'Produktion',
      'bom': 'Stücklisten',
      'customers': 'Kunden',
      'invoices': 'Rechnungen',
      'finance': 'Buchhaltung',
      'employees': 'Personal',
      'settings': 'Einstellungen',
    };

    // German-Name → Backend-Module-Key
    const MODULE_KEY_MAP: Record<string, string> = {
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

    if (overrides.length > 0) {
      // Build override map: German module name → override entry
      const overrideMap = new Map(overrides.map(o => [o.module, o]));

      // Collect all unique backend module keys from role permissions
      const roleModules = new Set(membership.role.permissions.map(p => p.module));

      // Start with role permissions as base
      const mergedPermSet = new Set<string>();

      // Process each backend module
      const allModuleKeys = new Set([
        ...roleModules,
        ...overrides.map(o => MODULE_KEY_MAP[o.module] || o.module.toLowerCase()),
      ]);

      for (const moduleKey of allModuleKeys) {
        const germanName = REVERSE_MODULE_MAP[moduleKey] || moduleKey;
        const override = overrideMap.get(germanName);

        if (override) {
          // Override replaces role defaults for this module
          if (override.canRead) mergedPermSet.add(`${moduleKey}:read`);
          if (override.canWrite) mergedPermSet.add(`${moduleKey}:write`);
          if (override.canDelete) mergedPermSet.add(`${moduleKey}:delete`);
        } else {
          // Use role defaults for this module
          for (const rp of membership.role.permissions) {
            if (rp.module === moduleKey) {
              mergedPermSet.add(`${rp.module}:${rp.permission}`);
            }
          }
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

    return {
      membership,
      company,
      subscription,
      role: membership.role,
      permissions: rolePermissions,
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
