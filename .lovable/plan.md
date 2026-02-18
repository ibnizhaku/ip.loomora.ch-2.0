
# Multi-Tenant Security Hardening — Loomora

## Ausgangslage (IST-Zustand)

Nach Analyse aller 43+ Controller zeigt sich ein klares Bild:

- **Nur 2 von ~43 Business-Controllern** nutzen den vollständigen Guard-Stack
- **Invitations** und **Subscriptions (change-plan/cancel)** sind korrekt geschützt
- **Alle anderen**: nur `JwtAuthGuard` — kein CompanyGuard, kein PermissionGuard
- `/auth/getMyCompanies` gibt `[]` zurück (TODO-Kommentar)
- `jwt.strategy.ts` prüft nur `user.status`, nicht `user.isActive`

---

## Umfang der Änderungen

Das Hardening gliedert sich in 6 Phasen, die alle im **Backend** (`/backend`) umgesetzt werden. Kein Frontend-Code wird verändert.

### Betroffene Dateien

**Phase 1 — Controller-Sicherheit (41 Controller-Dateien):**

Alle Controller erhalten den vollständigen Guard-Stack und `@RequirePermissions()` pro Route.

| Controller | Modul-Prefix | GET | POST | PUT/PATCH | DELETE |
|---|---|---|---|---|---|
| `customers.controller.ts` | `customers` | `:read` | `:write` | `:write` | `:delete` |
| `invoices.controller.ts` | `invoices` | `:read` | `:write` | `:write` | `:delete` |
| `quotes.controller.ts` | `quotes` | `:read` | `:write` | `:write` | `:delete` |
| `orders.controller.ts` | `orders` | `:read` | `:write` | `:write` | `:delete` |
| `delivery-notes.controller.ts` | `delivery-notes` | `:read` | `:write` | `:write` | `:delete` |
| `credit-notes.controller.ts` | `credit-notes` | `:read` | `:write` | `:write` | `:delete` |
| `reminders.controller.ts` | `reminders` | `:read` | `:write` | `:write` | `:delete` |
| `suppliers.controller.ts` | `suppliers` | `:read` | `:write` | `:write` | `:delete` |
| `products.controller.ts` | `products` | `:read` | `:write` | `:write` | `:delete` |
| `purchase-orders.controller.ts` | `purchase-orders` | `:read` | `:write` | `:write` | `:delete` |
| `purchase-invoices.controller.ts` | `purchase-invoices` | `:read` | `:write` | `:write` | `:delete` |
| `goods-receipts.controller.ts` | `goods-receipts` | `:read` | `:write` | `:write` | `:delete` |
| `employees.controller.ts` | `employees` | `:read` | `:write` | `:write` | `:delete` |
| `employee-contracts.controller.ts` | `employee-contracts` | `:read` | `:write` | `:write` | `:delete` |
| `absences.controller.ts` | `absences` | `:read` | `:write` | `:write` | `:delete` |
| `payroll.controller.ts` | `payroll` | `:read` | `:write` | `:write` | `:delete` |
| `travel-expenses.controller.ts` | `travel-expenses` | `:read` | `:write` | `:write` | `:delete` |
| `recruiting.controller.ts` | `recruiting` | `:read` | `:write` | `:write` | `:delete` |
| `training.controller.ts` | `training` | `:read` | `:write` | `:write` | `:delete` |
| `departments.controller.ts` | `departments` | `:read` | `:write` | `:write` | `:delete` |
| `withholding-tax.controller.ts` | `payroll` | `:read` | `:write` | `:write` | — |
| `swissdec.controller.ts` | `payroll` | `:read` | `:write` | — | — |
| `finance.controller.ts` | `finance` | `:read` | `:write` | `:write` | — |
| `journal-entries.controller.ts` | `journal-entries` | `:read` | `:write` | `:write` | `:delete` |
| `payments.controller.ts` | `payments` | `:read` | `:write` | `:write` | `:delete` |
| `bank-import.controller.ts` | `bank-accounts` | `:read` | `:write` | `:write` | `:delete` |
| `vat-returns.controller.ts` | `vat-returns` | `:read` | `:write` | `:write` | `:delete` |
| `budgets.controller.ts` | `budgets` | `:read` | `:write` | `:write` | `:delete` |
| `cost-centers.controller.ts` | `cost-centers` | `:read` | `:write` | `:write` | `:delete` |
| `cash-book.controller.ts` | `cash-book` | `:read` | `:write` | `:write` | `:delete` |
| `fixed-assets.controller.ts` | `fixed-assets` | `:read` | `:write` | `:write` | `:delete` |
| `projects.controller.ts` | `projects` | `:read` | `:write` | `:write` | `:delete` |
| `tasks.controller.ts` | `tasks` | `:read` | `:write` | `:write` | `:delete` |
| `time-entries.controller.ts` | `time-entries` | `:read` | `:write` | `:write` | `:delete` |
| `calendar.controller.ts` | `calendar` | `:read` | `:write` | `:write` | `:delete` |
| `roles.controller.ts` | `roles` | `:read` | `:admin` | `:admin` | `:admin` |
| `users.controller.ts` | `users` | `:read` | `:write` | `:write` | `:delete` |
| `company.controller.ts` | `company` | `:read` | `:write` | `:write` | — |
| `reports.controller.ts` | `reports` | `:read` | — | — | — |
| `documents.controller.ts` | `documents` | `:read` | `:write` | `:write` | `:delete` |
| `service-tickets.controller.ts` | `service-tickets` | `:read` | `:write` | `:write` | `:delete` |
| `dashboard.controller.ts` | `dashboard` | `:read` | — | — | — |
| `messages.controller.ts` | `messages` | `:read` | `:write` | — | `:delete` |
| `notifications.controller.ts` | `notifications` | `:read` | — | `:write` | `:delete` |
| `settings.controller.ts` | `settings` | `:read` | `:write` | `:write` | — |
| `marketing.controller.ts` | `marketing` | `:read` | `:write` | `:write` | `:delete` |
| `ecommerce.controller.ts` | `ecommerce` | `:read` | `:write` | `:write` | `:delete` |
| `bom.controller.ts` | `products` | `:read` | `:write` | `:write` | `:delete` |
| `calculations.controller.ts` | `quotes` | `:read` | `:write` | `:write` | `:delete` |
| `production-orders.controller.ts` | `production-orders` | `:read` | `:write` | `:write` | `:delete` |
| `quality-control.controller.ts` | `quality-control` | `:read` | `:write` | `:write` | `:delete` |
| `gav-metallbau.controller.ts` | `settings` | `:read` | `:write` | `:write` | — |
| `contracts.controller.ts` | `contracts` | `:read` | `:write` | `:write` | `:delete` |
| `recruiting.controller.ts` | `recruiting` | `:read` | `:write` | `:write` | `:delete` |

**Muster für jeden Controller:**
```typescript
// Vorher:
@UseGuards(JwtAuthGuard)
@Controller('customers')

// Nachher:
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('customers')

// Und pro Route:
@Get()
@RequirePermissions('customers:read')
findAll(...)

@Post()
@RequirePermissions('customers:write')
create(...)

@Put(':id')
@RequirePermissions('customers:write')
update(...)

@Delete(':id')
@RequirePermissions('customers:delete')
remove(...)
```

**Sonderregeln:**
- Spezial-Aktionen (send, cancel, approve, convert, duplicate) → `:write`
- Admin-Operationen (Rollen-CRUD, Permission-Overrides) → `:admin`
- Stats/Reports (schreibgeschützt) → `:read`
- Public Endpoints (Einladungs-Validierung, Webhook) → kein Guard (bleiben public)

---

**Phase 2 — jwt.strategy.ts — User-Deaktivierungs-Bug**

**Datei:** `backend/src/modules/auth/strategies/jwt.strategy.ts`

**Problem:** `isActive=false` blockiert JWT nicht. Der Guard prüft nur `user.status !== 'ACTIVE'`.

**Fix:**
```typescript
// Vorher (Zeile 28):
if (!user || user.status !== 'ACTIVE') {

// Nachher:
if (!user || user.status !== 'ACTIVE' || !user.isActive) {
```

Dies stellt sicher, dass `users.service.update()` mit `isActive: false` sofort einen Sperreffekt hat — der JwtStrategy-Check greift bei jeder Anfrage.

---

**Phase 3 — auth.controller.ts — /auth/companies implementieren**

**Datei:** `backend/src/modules/auth/auth.controller.ts`

**Problem:** `GET /auth/companies` gibt `[]` zurück mit TODO-Kommentar.

**Fix:**
```typescript
@Get('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async getMyCompanies(@CurrentUser() user: CurrentUserPayload) {
  return this.authService.getMyCompanies(user.userId);
}
```

**Datei:** `backend/src/modules/auth/auth.service.ts`

**Neues Method:**
```typescript
async getMyCompanies(userId: string): Promise<CompanySummary[]> {
  return this.membershipService.getActiveCompaniesForUser(userId);
}
```

---

**Phase 4 — AuditLog bei Login schreiben**

**Datei:** `backend/src/modules/auth/auth.service.ts`

In der `generateFullLoginResponse()`-Methode wird nach dem Token-Generating ein AuditLog-Eintrag geschrieben:

```typescript
await this.prisma.auditLog.create({
  data: {
    userId,
    action: 'LOGIN_SUCCESS',
    module: 'auth',
    companyId,
    metadata: { ip: ipAddress, device: deviceInfo },
  }
});
```

---

**Phase 5 — Abschlussbericht-Datei**

**Datei:** `.lovable/security-hardening-abschlussbericht.md`

Enthält:
- Liste aller Controller mit Guards nach dem Fix
- Liste aller Endpoints mit zugehörigen Permissions
- Bestätigung der 6 Prüfpunkte:
  1. Kein Endpoint ohne PermissionGuard
  2. Kein Legacy-Feld aktiv (Status-Fix)
  3. Kein Service ohne companyId-Filter (bereits korrekt)
  4. Kein Rollennamen-Check im Code
  5. Kein UI-Only-Schutz ohne Backend-Schutz
  6. /auth/companies implementiert

---

## Was NICHT geändert wird (bewusste Entscheidungen)

| Thema | Entscheidung | Begründung |
|---|---|---|
| Legacy `User.role` Enum | Kein DB-Schema-Removal | Prisma-Migration erfordert Deployment-Absprache; Enum wird ignoriert aber nicht gelöscht |
| Legacy `User.companyId` | Kein DB-Schema-Removal | Gleicher Grund; Services nutzen bereits `user.companyId` aus JWT |
| Token-Lifetime (15min) | Bleibt unverändert | 15min ist akzeptabel mit dem isActive-Fix; Redis-Blacklist ist Out-of-Scope |
| SubscriptionGuard | Optional, nicht überall | Business-Controller bekommen `JwtAuthGuard, CompanyGuard, PermissionGuard` — SubscriptionGuard wird nicht pauschal hinzugefügt da CompanyGuard die Membership validiert und der SubscriptionGuard nur for Plan-gated Features sinnvoll ist |

---

## Technische Risiken & Mitigation

| Risiko | Mitigation |
|---|---|
| Bestehende User mit Rolle "ohne :read-Permission" werden ausgesperrt | isOwner-Bypass in PermissionGuard schützt Owner. System-Rollen (ADMIN, MEMBER etc.) haben standardmäßig breite Permissions via PARENT_MAP-Expansion |
| Dashboard/Reports werden für eingeschränkte Rollen blockiert | Dashboard bekommt `dashboard:read`, Reports bekommt `reports:read` — Rollen müssen diese Permissions haben |
| Public Endpoints wie Webhook, Einladungs-Validierung werden nicht beeinträchtigt | Diese Endpoints bleiben explizit ohne Guard |

---

## Dateiliste (vollständig)

Alle Dateien liegen in `/backend/src/modules/`:

```
auth/auth.controller.ts          — /auth/companies implementieren
auth/auth.service.ts             — getMyCompanies(), AuditLog bei Login
auth/strategies/jwt.strategy.ts  — isActive-Fix

customers/customers.controller.ts
invoices/invoices.controller.ts
quotes/quotes.controller.ts
orders/orders.controller.ts
suppliers/suppliers.controller.ts
products/products.controller.ts
employees/employees.controller.ts
employee-contracts/...
absences/...
payroll/...
travel-expenses/...
departments/...
withholding-tax/...
swissdec/...
finance/...
journal-entries/...
payments/...
bank-import/...
vat-returns/...
budgets/...
cost-centers/...
cash-book/...
fixed-assets/...
projects/...
tasks/...
time-entries/...
calendar/...
roles/...
users/...
company/...
reports/...
documents/...
service-tickets/...
dashboard/...
messages/...
notifications/...
settings/...
marketing/...
ecommerce/...
bom/...
calculations/...
production-orders/...
quality-control/...
purchase-orders/...
purchase-invoices/...
goods-receipts/...
contracts/...
recruiting/...
training/...
delivery-notes/...
credit-notes/...
reminders/...
gav-metallbau/...

.lovable/security-hardening-abschlussbericht.md
```

**Gesamtzahl betroffener Dateien: ~53**
