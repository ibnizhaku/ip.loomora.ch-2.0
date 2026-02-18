/**
 * Prisma Seed Script – Fehlende Permissions für bestehende Companies
 *
 * Hintergrund:
 * createSystemRoles() wurde um folgende Module erweitert, die bestehende
 * Companies noch nicht in der DB haben:
 *   messages, notifications, service-tickets, marketing, ecommerce, reports
 *
 * Das Script ist vollständig idempotent (createMany + skipDuplicates).
 * Es verändert KEINE bestehenden Permissions.
 *
 * Permission-Matrix (entspricht createSystemRoles() exakt):
 *   Owner  → read, write, delete, admin  (alle 6 Module)
 *   Admin  → read, write, delete, admin  (alle 6 Module)
 *   Member → read, write                 (messages, notifications, service-tickets, marketing, ecommerce)
 *            read only                   (reports)
 *
 * Ausführung auf dem Server:
 *   cd /var/www/loomora/backend
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-missing-permissions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Module die in createSystemRoles() existieren aber in bestehenden Companies fehlen
const MISSING_MODULES = [
  'messages',
  'notifications',
  'service-tickets',
  'marketing',
  'ecommerce',
  'reports',
] as const;

type PermAction = 'read' | 'write' | 'delete' | 'admin';

const ALL_PERMS: PermAction[]   = ['read', 'write', 'delete', 'admin'];
const WRITE_PERMS: PermAction[] = ['read', 'write'];
const READ_PERMS: PermAction[]  = ['read'];

/**
 * Permission-Matrix — exakt analog zu createSystemRoles():
 *
 * reports.controller.ts hat ausschließlich :read Endpoints (11 Stück).
 * Owner/Admin bekommen daher für reports nur read — write/delete wären
 * tote Permissions ohne Endpoint-Abdeckung.
 * Member bekommt für alle operativen Module read+write, reports nur read.
 *
 * messages/notifications/service-tickets/marketing/ecommerce:
 *   Owner/Admin → read, write, delete, admin
 *   Member      → read, write
 */
function getPermissionsForRole(
  roleName: string,
  module: string,
): PermAction[] {
  // reports: rein lesend für alle Rollen (kein write/delete Endpoint existiert)
  if (module === 'reports') return READ_PERMS;

  if (roleName === 'Owner') return ALL_PERMS;

  if (roleName === 'Admin') {
    // Admin = Owner ohne settings; alle 6 Module sind nicht settings
    return ALL_PERMS;
  }

  if (roleName === 'Member') {
    // Operative Module: read + write
    return WRITE_PERMS;
  }

  return [];
}

async function main() {
  console.log('🚀 Starte Permission-Migration für fehlende Module...\n');

  // Alle Companies laden
  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  console.log(`📋 Gefundene Companies: ${companies.length}`);
  companies.forEach((c) => console.log(`   - ${c.name} (${c.id})`));
  console.log();

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const company of companies) {
    console.log(`\n🏢 Verarbeite: ${company.name}`);

    // System-Rollen dieser Company laden
    const systemRoles = await prisma.role.findMany({
      where: {
        companyId: company.id,
        isSystemRole: true,
        name: { in: ['Owner', 'Admin', 'Member'] },
      },
      select: { id: true, name: true },
    });

    if (systemRoles.length === 0) {
      console.log('   ⚠️  Keine System-Rollen gefunden — übersprungen');
      continue;
    }

    console.log(
      `   Rollen: ${systemRoles.map((r) => r.name).join(', ')}`,
    );

    for (const role of systemRoles) {
      // Bestehende Permissions laden um Duplikate zu vermeiden
      const existing = await prisma.rolePermission.findMany({
        where: {
          roleId: role.id,
          module: { in: [...MISSING_MODULES] },
        },
        select: { module: true, permission: true },
      });

      const existingSet = new Set(
        existing.map((p) => `${p.module}:${p.permission}`),
      );

      // Neue Permissions aufbauen
      const toCreate: { roleId: string; module: string; permission: string }[] = [];

      for (const module of MISSING_MODULES) {
        const perms = getPermissionsForRole(role.name, module);

        for (const permission of perms) {
          const key = `${module}:${permission}`;
          if (existingSet.has(key)) {
            totalSkipped++;
          } else {
            toCreate.push({ roleId: role.id, module, permission });
          }
        }
      }

      if (toCreate.length === 0) {
        console.log(`   ✅ ${role.name}: bereits vollständig`);
        continue;
      }

      // createMany mit skipDuplicates als zusätzliche Sicherheit
      const result = await prisma.rolePermission.createMany({
        data: toCreate,
        skipDuplicates: true,
      });

      totalCreated += result.count;
      console.log(
        `   ✅ ${role.name}: ${result.count} Permissions hinzugefügt` +
        ` (${toCreate.map((p) => `${p.module}:${p.permission}`).join(', ')})`,
      );
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`✅ Migration abgeschlossen`);
  console.log(`   Neu erstellt: ${totalCreated}`);
  console.log(`   Übersprungen: ${totalSkipped} (bereits vorhanden)`);
  console.log('─────────────────────────────────────────\n');

  // Verification: Spot-Check für jede Company
  console.log('🔍 Verification Spot-Check:');
  for (const company of companies) {
    const ownerRole = await prisma.role.findFirst({
      where: { companyId: company.id, name: 'Owner', isSystemRole: true },
      include: { permissions: { where: { module: { in: [...MISSING_MODULES] } } } },
    });

    if (!ownerRole) continue;

    const foundModules = Array.from(new Set(ownerRole.permissions.map((p) => p.module)));
    console.log(
      `   ${company.name} / Owner: ${foundModules.length}/${MISSING_MODULES.length} Module ` +
      `[${foundModules.join(', ')}]`,
    );

    if (foundModules.length < MISSING_MODULES.length) {
      const missing = MISSING_MODULES.filter((m) => !foundModules.includes(m));
      console.error(`   ❌ Noch fehlend: ${missing.join(', ')}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Fehler:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
