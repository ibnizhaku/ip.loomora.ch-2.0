-- Migration: Expand broad permission keys to granular module keys
-- This script adds granular permissions for all roles that currently use
-- the old broad keys (invoices, finance, employees, settings).
-- Existing fine-grained keys are NOT touched. Only missing children are added.

-- =================================================================
-- 1. invoices → quotes, orders, delivery-notes, credit-notes, reminders
-- =================================================================
INSERT INTO role_permissions ("id", "roleId", "module", "permission")
SELECT gen_random_uuid(), rp."roleId", child.module, rp.permission
FROM role_permissions rp
CROSS JOIN (
  VALUES ('quotes'), ('orders'), ('delivery-notes'), ('credit-notes'), ('reminders')
) AS child(module)
WHERE rp.module = 'invoices'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions existing
  WHERE existing."roleId" = rp."roleId"
  AND existing.module = child.module
  AND existing.permission = rp.permission
);

-- =================================================================
-- 2. finance → cash-book, cost-centers, budgets, debtors, creditors,
--    bank-accounts, chart-of-accounts, journal-entries, general-ledger,
--    balance-sheet, vat-returns, fixed-assets
-- =================================================================
INSERT INTO role_permissions ("id", "roleId", "module", "permission")
SELECT gen_random_uuid(), rp."roleId", child.module, rp.permission
FROM role_permissions rp
CROSS JOIN (
  VALUES ('cash-book'), ('cost-centers'), ('budgets'), ('debtors'), ('creditors'),
         ('bank-accounts'), ('chart-of-accounts'), ('journal-entries'), ('general-ledger'),
         ('balance-sheet'), ('vat-returns'), ('fixed-assets')
) AS child(module)
WHERE rp.module = 'finance'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions existing
  WHERE existing."roleId" = rp."roleId"
  AND existing.module = child.module
  AND existing.permission = rp.permission
);

-- =================================================================
-- 3. employees → employee-contracts, payroll, absences, travel-expenses,
--    recruiting, training, departments, orgchart
-- =================================================================
INSERT INTO role_permissions ("id", "roleId", "module", "permission")
SELECT gen_random_uuid(), rp."roleId", child.module, rp.permission
FROM role_permissions rp
CROSS JOIN (
  VALUES ('employee-contracts'), ('payroll'), ('absences'), ('travel-expenses'),
         ('recruiting'), ('training'), ('departments'), ('orgchart')
) AS child(module)
WHERE rp.module = 'employees'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions existing
  WHERE existing."roleId" = rp."roleId"
  AND existing.module = child.module
  AND existing.permission = rp.permission
);

-- =================================================================
-- 4. settings → users, roles, company
-- =================================================================
INSERT INTO role_permissions ("id", "roleId", "module", "permission")
SELECT gen_random_uuid(), rp."roleId", child.module, rp.permission
FROM role_permissions rp
CROSS JOIN (
  VALUES ('users'), ('roles'), ('company')
) AS child(module)
WHERE rp.module = 'settings'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions existing
  WHERE existing."roleId" = rp."roleId"
  AND existing.module = child.module
  AND existing.permission = rp.permission
);

-- =================================================================
-- 5. Add missing base modules that every role should inherit
--    (dashboard, tasks, calendar — if not present, inherit from broadest)
-- =================================================================
-- For roles that have projects:read, also add tasks:read, calendar:read, dashboard:read
INSERT INTO role_permissions ("id", "roleId", "module", "permission")
SELECT gen_random_uuid(), rp."roleId", child.module, rp.permission
FROM role_permissions rp
CROSS JOIN (
  VALUES ('dashboard'), ('tasks'), ('calendar')
) AS child(module)
WHERE rp.module = 'projects'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions existing
  WHERE existing."roleId" = rp."roleId"
  AND existing.module = child.module
  AND existing.permission = rp.permission
);

-- =================================================================
-- 6. Migrate old german-named overrides to new key format
-- =================================================================
UPDATE user_permission_overrides SET module = 'dashboard' WHERE module = 'Dashboard';
UPDATE user_permission_overrides SET module = 'projects' WHERE module = 'Projekte';
UPDATE user_permission_overrides SET module = 'tasks' WHERE module = 'Aufgaben';
UPDATE user_permission_overrides SET module = 'time-entries' WHERE module = 'Zeiterfassung';
UPDATE user_permission_overrides SET module = 'production' WHERE module = 'Produktion';
UPDATE user_permission_overrides SET module = 'bom' WHERE module = 'Stücklisten';
UPDATE user_permission_overrides SET module = 'customers' WHERE module = 'Kunden';
UPDATE user_permission_overrides SET module = 'invoices' WHERE module = 'Rechnungen';
UPDATE user_permission_overrides SET module = 'finance' WHERE module = 'Buchhaltung';
UPDATE user_permission_overrides SET module = 'employees' WHERE module = 'Personal';
UPDATE user_permission_overrides SET module = 'settings' WHERE module = 'Einstellungen';
