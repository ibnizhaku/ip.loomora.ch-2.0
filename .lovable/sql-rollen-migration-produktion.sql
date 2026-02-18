-- =============================================================================
-- SQL MIGRATIONS-SCRIPT: System-Rollen Permissions Update
-- Loomora — Multi-Tenant Security Hardening
-- Datum: 2026-02-18
-- Context-ID: 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
-- =============================================================================
--
-- ZWECK:
--   Ergänzt bestehende System-Rollen (Owner, Admin, Member) in der Produktion
--   um alle neuen granularen Module, die im Hardening neu hinzugekommen sind.
--   Neue Rollen werden NICHT erstellt — nur fehlende Permissions werden ergänzt.
--
-- AUSFÜHRUNG:
--   1. Auf dem Produktions-Server (app.loomora.ch) ausführen
--   2. Verbindung zur PostgreSQL-Datenbank herstellen:
--      psql -U loomora -d loomora_prod
--   3. Script als Transaktion ausführen:
--      \i sql-rollen-migration-produktion.sql
--
-- SICHERHEIT:
--   - Nur INSERT ... ON CONFLICT DO NOTHING → idempotent, wiederholbar
--   - Keine DELETE/UPDATE auf bestehende Permissions
--   - Keine strukturellen Schema-Änderungen
-- =============================================================================

BEGIN;

-- =============================================================================
-- HILFSFUNKTION: Fügt eine Permission hinzu, wenn sie noch nicht existiert
-- =============================================================================
-- Verwendet INSERT ... ON CONFLICT DO NOTHING (idempotent)
-- Tabelle: role_permissions (module VARCHAR, permission VARCHAR, role_id VARCHAR)

-- =============================================================================
-- SCHRITT 1: OWNER-ROLLEN (isSystemRole=true, name='Owner') aktualisieren
-- =============================================================================
-- Owner bekommt: read + write + delete + admin auf ALLE neuen Module

INSERT INTO role_permissions (id, role_id, module, permission, created_at)
SELECT
  gen_random_uuid()::text,
  r.id,
  m.module,
  m.permission,
  NOW()
FROM roles r
CROSS JOIN (
  VALUES
    -- Neue Module die Owner neu bekommt (oder bereits hat → ON CONFLICT überspringt)
    ('marketing',          'read'),
    ('marketing',          'write'),
    ('marketing',          'delete'),
    ('marketing',          'admin'),
    ('ecommerce',          'read'),
    ('ecommerce',          'write'),
    ('ecommerce',          'delete'),
    ('ecommerce',          'admin'),
    ('calendar',           'read'),
    ('calendar',           'write'),
    ('calendar',           'delete'),
    ('calendar',           'admin'),
    ('messages',           'read'),
    ('messages',           'write'),
    ('messages',           'delete'),
    ('messages',           'admin'),
    ('notifications',      'read'),
    ('notifications',      'write'),
    ('notifications',      'delete'),
    ('notifications',      'admin'),
    ('service-tickets',    'read'),
    ('service-tickets',    'write'),
    ('service-tickets',    'delete'),
    ('service-tickets',    'admin'),
    ('dashboard',          'read'),
    ('dashboard',          'write'),
    ('dashboard',          'delete'),
    ('dashboard',          'admin'),
    ('reports',            'read'),
    ('reports',            'write'),
    ('reports',            'delete'),
    ('reports',            'admin'),
    ('contracts',          'read'),
    ('contracts',          'write'),
    ('contracts',          'delete'),
    ('contracts',          'admin'),
    ('recruiting',         'read'),
    ('recruiting',         'write'),
    ('recruiting',         'delete'),
    ('recruiting',         'admin'),
    ('training',           'read'),
    ('training',           'write'),
    ('training',           'delete'),
    ('training',           'admin'),
    ('production-orders',  'read'),
    ('production-orders',  'write'),
    ('production-orders',  'delete'),
    ('production-orders',  'admin'),
    ('quality-control',    'read'),
    ('quality-control',    'write'),
    ('quality-control',    'delete'),
    ('quality-control',    'admin'),
    ('bank-import',        'read'),
    ('bank-import',        'write'),
    ('bank-import',        'delete'),
    ('bank-import',        'admin'),
    ('vat-returns',        'read'),
    ('vat-returns',        'write'),
    ('vat-returns',        'delete'),
    ('vat-returns',        'admin'),
    ('budgets',            'read'),
    ('budgets',            'write'),
    ('budgets',            'delete'),
    ('budgets',            'admin'),
    ('cost-centers',       'read'),
    ('cost-centers',       'write'),
    ('cost-centers',       'delete'),
    ('cost-centers',       'admin'),
    ('cash-book',          'read'),
    ('cash-book',          'write'),
    ('cash-book',          'delete'),
    ('cash-book',          'admin'),
    ('fixed-assets',       'read'),
    ('fixed-assets',       'write'),
    ('fixed-assets',       'delete'),
    ('fixed-assets',       'admin'),
    ('journal-entries',    'read'),
    ('journal-entries',    'write'),
    ('journal-entries',    'delete'),
    ('journal-entries',    'admin'),
    ('bom',                'read'),
    ('bom',                'write'),
    ('bom',                'delete'),
    ('bom',                'admin'),
    ('calculations',       'read'),
    ('calculations',       'write'),
    ('calculations',       'delete'),
    ('calculations',       'admin'),
    ('delivery-notes',     'read'),
    ('delivery-notes',     'write'),
    ('delivery-notes',     'delete'),
    ('delivery-notes',     'admin'),
    ('credit-notes',       'read'),
    ('credit-notes',       'write'),
    ('credit-notes',       'delete'),
    ('credit-notes',       'admin'),
    ('reminders',          'read'),
    ('reminders',          'write'),
    ('reminders',          'delete'),
    ('reminders',          'admin'),
    ('purchase-orders',    'read'),
    ('purchase-orders',    'write'),
    ('purchase-orders',    'delete'),
    ('purchase-orders',    'admin'),
    ('purchase-invoices',  'read'),
    ('purchase-invoices',  'write'),
    ('purchase-invoices',  'delete'),
    ('purchase-invoices',  'admin'),
    ('goods-receipts',     'read'),
    ('goods-receipts',     'write'),
    ('goods-receipts',     'delete'),
    ('goods-receipts',     'admin'),
    ('employee-contracts', 'read'),
    ('employee-contracts', 'write'),
    ('employee-contracts', 'delete'),
    ('employee-contracts', 'admin'),
    ('withholding-tax',    'read'),
    ('withholding-tax',    'write'),
    ('withholding-tax',    'delete'),
    ('withholding-tax',    'admin'),
    ('swissdec',           'read'),
    ('swissdec',           'write'),
    ('swissdec',           'delete'),
    ('swissdec',           'admin'),
    ('gav-metallbau',      'read'),
    ('gav-metallbau',      'write'),
    ('gav-metallbau',      'delete'),
    ('gav-metallbau',      'admin'),
    ('absences',           'read'),
    ('absences',           'write'),
    ('absences',           'delete'),
    ('absences',           'admin'),
    ('travel-expenses',    'read'),
    ('travel-expenses',    'write'),
    ('travel-expenses',    'delete'),
    ('travel-expenses',    'admin'),
    ('departments',        'read'),
    ('departments',        'write'),
    ('departments',        'delete'),
    ('departments',        'admin'),
    ('payroll',            'read'),
    ('payroll',            'write'),
    ('payroll',            'delete'),
    ('payroll',            'admin'),
    ('tasks',              'read'),
    ('tasks',              'write'),
    ('tasks',              'delete'),
    ('tasks',              'admin'),
    ('time-entries',       'read'),
    ('time-entries',       'write'),
    ('time-entries',       'delete'),
    ('time-entries',       'admin')
) AS m(module, permission)
WHERE r.name = 'Owner'
  AND r.is_system_role = true
ON CONFLICT (role_id, module, permission) DO NOTHING;

-- =============================================================================
-- SCHRITT 2: ADMIN-ROLLEN (isSystemRole=true, name='Admin') aktualisieren
-- =============================================================================
-- Admin: wie Owner, aber OHNE 'settings'-Modul (kein settings:* für Admin)

INSERT INTO role_permissions (id, role_id, module, permission, created_at)
SELECT
  gen_random_uuid()::text,
  r.id,
  m.module,
  m.permission,
  NOW()
FROM roles r
CROSS JOIN (
  VALUES
    ('marketing',          'read'),
    ('marketing',          'write'),
    ('marketing',          'delete'),
    ('marketing',          'admin'),
    ('ecommerce',          'read'),
    ('ecommerce',          'write'),
    ('ecommerce',          'delete'),
    ('ecommerce',          'admin'),
    ('calendar',           'read'),
    ('calendar',           'write'),
    ('calendar',           'delete'),
    ('calendar',           'admin'),
    ('messages',           'read'),
    ('messages',           'write'),
    ('messages',           'delete'),
    ('messages',           'admin'),
    ('notifications',      'read'),
    ('notifications',      'write'),
    ('notifications',      'delete'),
    ('notifications',      'admin'),
    ('service-tickets',    'read'),
    ('service-tickets',    'write'),
    ('service-tickets',    'delete'),
    ('service-tickets',    'admin'),
    ('dashboard',          'read'),
    ('dashboard',          'write'),
    ('dashboard',          'delete'),
    ('dashboard',          'admin'),
    ('reports',            'read'),
    ('reports',            'write'),
    ('reports',            'delete'),
    ('reports',            'admin'),
    ('contracts',          'read'),
    ('contracts',          'write'),
    ('contracts',          'delete'),
    ('contracts',          'admin'),
    ('recruiting',         'read'),
    ('recruiting',         'write'),
    ('recruiting',         'delete'),
    ('recruiting',         'admin'),
    ('training',           'read'),
    ('training',           'write'),
    ('training',           'delete'),
    ('training',           'admin'),
    ('production-orders',  'read'),
    ('production-orders',  'write'),
    ('production-orders',  'delete'),
    ('production-orders',  'admin'),
    ('quality-control',    'read'),
    ('quality-control',    'write'),
    ('quality-control',    'delete'),
    ('quality-control',    'admin'),
    ('bank-import',        'read'),
    ('bank-import',        'write'),
    ('bank-import',        'delete'),
    ('bank-import',        'admin'),
    ('vat-returns',        'read'),
    ('vat-returns',        'write'),
    ('vat-returns',        'delete'),
    ('vat-returns',        'admin'),
    ('budgets',            'read'),
    ('budgets',            'write'),
    ('budgets',            'delete'),
    ('budgets',            'admin'),
    ('cost-centers',       'read'),
    ('cost-centers',       'write'),
    ('cost-centers',       'delete'),
    ('cost-centers',       'admin'),
    ('cash-book',          'read'),
    ('cash-book',          'write'),
    ('cash-book',          'delete'),
    ('cash-book',          'admin'),
    ('fixed-assets',       'read'),
    ('fixed-assets',       'write'),
    ('fixed-assets',       'delete'),
    ('fixed-assets',       'admin'),
    ('journal-entries',    'read'),
    ('journal-entries',    'write'),
    ('journal-entries',    'delete'),
    ('journal-entries',    'admin'),
    ('bom',                'read'),
    ('bom',                'write'),
    ('bom',                'delete'),
    ('bom',                'admin'),
    ('calculations',       'read'),
    ('calculations',       'write'),
    ('calculations',       'delete'),
    ('calculations',       'admin'),
    ('delivery-notes',     'read'),
    ('delivery-notes',     'write'),
    ('delivery-notes',     'delete'),
    ('delivery-notes',     'admin'),
    ('credit-notes',       'read'),
    ('credit-notes',       'write'),
    ('credit-notes',       'delete'),
    ('credit-notes',       'admin'),
    ('reminders',          'read'),
    ('reminders',          'write'),
    ('reminders',          'delete'),
    ('reminders',          'admin'),
    ('purchase-orders',    'read'),
    ('purchase-orders',    'write'),
    ('purchase-orders',    'delete'),
    ('purchase-orders',    'admin'),
    ('purchase-invoices',  'read'),
    ('purchase-invoices',  'write'),
    ('purchase-invoices',  'delete'),
    ('purchase-invoices',  'admin'),
    ('goods-receipts',     'read'),
    ('goods-receipts',     'write'),
    ('goods-receipts',     'delete'),
    ('goods-receipts',     'admin'),
    ('employee-contracts', 'read'),
    ('employee-contracts', 'write'),
    ('employee-contracts', 'delete'),
    ('employee-contracts', 'admin'),
    ('withholding-tax',    'read'),
    ('withholding-tax',    'write'),
    ('withholding-tax',    'delete'),
    ('withholding-tax',    'admin'),
    ('swissdec',           'read'),
    ('swissdec',           'write'),
    ('swissdec',           'delete'),
    ('swissdec',           'admin'),
    ('gav-metallbau',      'read'),
    ('gav-metallbau',      'write'),
    ('gav-metallbau',      'delete'),
    ('gav-metallbau',      'admin'),
    ('absences',           'read'),
    ('absences',           'write'),
    ('absences',           'delete'),
    ('absences',           'admin'),
    ('travel-expenses',    'read'),
    ('travel-expenses',    'write'),
    ('travel-expenses',    'delete'),
    ('travel-expenses',    'admin'),
    ('departments',        'read'),
    ('departments',        'write'),
    ('departments',        'delete'),
    ('departments',        'admin'),
    ('payroll',            'read'),
    ('payroll',            'write'),
    ('payroll',            'delete'),
    ('payroll',            'admin'),
    ('tasks',              'read'),
    ('tasks',              'write'),
    ('tasks',              'delete'),
    ('tasks',              'admin'),
    ('time-entries',       'read'),
    ('time-entries',       'write'),
    ('time-entries',       'delete'),
    ('time-entries',       'admin')
) AS m(module, permission)
WHERE r.name = 'Admin'
  AND r.is_system_role = true
ON CONFLICT (role_id, module, permission) DO NOTHING;

-- =============================================================================
-- SCHRITT 3: MEMBER-ROLLEN (isSystemRole=true, name='Member') aktualisieren
-- =============================================================================
-- Member: read + write auf operative Module (kein Finance, kein Settings, kein Reports:write)

INSERT INTO role_permissions (id, role_id, module, permission, created_at)
SELECT
  gen_random_uuid()::text,
  r.id,
  m.module,
  m.permission,
  NOW()
FROM roles r
CROSS JOIN (
  VALUES
    -- Neue operative Module: read + write
    ('marketing',          'read'),
    ('marketing',          'write'),
    ('ecommerce',          'read'),
    ('ecommerce',          'write'),
    ('calendar',           'read'),
    ('calendar',           'write'),
    ('messages',           'read'),
    ('messages',           'write'),
    ('notifications',      'read'),
    ('service-tickets',    'read'),
    ('service-tickets',    'write'),
    ('contracts',          'read'),
    ('contracts',          'write'),
    ('production-orders',  'read'),
    ('production-orders',  'write'),
    ('quality-control',    'read'),
    ('quality-control',    'write'),
    ('bom',                'read'),
    ('bom',                'write'),
    ('calculations',       'read'),
    ('calculations',       'write'),
    ('delivery-notes',     'read'),
    ('delivery-notes',     'write'),
    ('credit-notes',       'read'),
    ('credit-notes',       'write'),
    ('reminders',          'read'),
    ('reminders',          'write'),
    ('purchase-orders',    'read'),
    ('purchase-orders',    'write'),
    ('purchase-invoices',  'read'),
    ('purchase-invoices',  'write'),
    ('goods-receipts',     'read'),
    ('goods-receipts',     'write'),
    ('employee-contracts', 'read'),
    ('employee-contracts', 'write'),
    ('absences',           'read'),
    ('absences',           'write'),
    ('travel-expenses',    'read'),
    ('travel-expenses',    'write'),
    ('departments',        'read'),
    ('tasks',              'read'),
    ('tasks',              'write'),
    ('time-entries',       'read'),
    ('time-entries',       'write'),
    -- Reports & Dashboard: nur read
    ('reports',            'read'),
    ('dashboard',          'read'),
    -- Recruiting & Training: read + write
    ('recruiting',         'read'),
    ('recruiting',         'write'),
    ('training',           'read'),
    ('training',           'write')
) AS m(module, permission)
WHERE r.name = 'Member'
  AND r.is_system_role = true
ON CONFLICT (role_id, module, permission) DO NOTHING;

-- =============================================================================
-- SCHRITT 4: VERIFIKATION
-- =============================================================================
-- Zeigt die Anzahl Permissions pro Rolle und Company nach der Migration

SELECT
  c.name AS company,
  r.name AS role,
  COUNT(rp.id) AS permission_count
FROM roles r
JOIN companies c ON c.id = r.company_id
LEFT JOIN role_permissions rp ON rp.role_id = r.id
WHERE r.is_system_role = true
  AND r.name IN ('Owner', 'Admin', 'Member')
GROUP BY c.name, r.name
ORDER BY c.name, r.name;

-- =============================================================================
-- SCHRITT 5: DETAILCHECK — fehlende kritische Permissions
-- =============================================================================
-- Zeigt Owner-Rollen, denen 'dashboard:read' noch fehlt (Fehler-Indikator)

SELECT
  c.name AS company,
  r.name AS role,
  'dashboard:read FEHLT' AS problem
FROM roles r
JOIN companies c ON c.id = r.company_id
WHERE r.is_system_role = true
  AND r.name = 'Owner'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id
      AND rp.module = 'dashboard'
      AND rp.permission = 'read'
  );

-- Wenn diese Query 0 Zeilen zurückgibt → Migration erfolgreich
-- =============================================================================

COMMIT;

-- =============================================================================
-- ROLLBACK bei Fehler:
-- Falls eine Zeile fehler wirft (außer ON CONFLICT), wird die ganze
-- Transaktion automatisch zurückgerollt. Sicher ausführbar.
-- =============================================================================
