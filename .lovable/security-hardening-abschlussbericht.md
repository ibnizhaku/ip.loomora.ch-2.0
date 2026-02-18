# Security Hardening Abschlussbericht
## Loomora — Multi-Tenant Security & RBAC Enforcement
**Datum:** 2026-02-18  
**Context-ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## ✅ ABSCHLUSSKONTROLLE — 8 Prüfpunkte

| # | Prüfpunkt | Status |
|---|---|---|
| 1 | Kein Endpoint ohne PermissionGuard | ✅ Alle ~53 Business-Controller gehärtet |
| 2 | Kein Legacy-Feld aktiv (isActive-Fix) | ✅ jwt.strategy.ts prüft `status` UND `isActive` |
| 3 | Kein Service ohne companyId-Filter | ✅ Services nutzen companyId aus JWT (bereits korrekt) |
| 4 | Kein Rollennamen-Check im Code | ✅ Kein hardcoded `['ADMIN', 'OWNER']` — nur Permission-Checks |
| 5 | Kein UI-Only-Schutz ohne Backend-Schutz | ✅ Jeder Endpoint serverseitig geschützt |
| 6 | /auth/companies implementiert | ✅ `GET /auth/companies` → `membershipService.getActiveCompaniesForUser()` |
| 7 | Guards als globale DI-Provider verfügbar | ✅ `CompanyGuard` + `PermissionGuard` in `CommonModule (@Global)` registriert — kein Import pro Modul nötig |
| 8 | PARENT_MAP vollständig (55 Module) | ✅ Alle granularen Module expandiert; System-Rollen decken Owner/Admin/Member vollständig ab |

---

## PHASE 1 — Controller-Sicherheit (vollständig)

Alle Business-Controller implementieren den vollständigen Guard-Stack:

```typescript
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
```

Jede Route ist mit `@RequirePermissions()` dekoriert.

### Gehärtete Controller (53 total)

| Controller | Modul | Guards | Permission-Mapping |
|---|---|---|---|
| `customers.controller.ts` | CRM | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `invoices.controller.ts` | Verkauf | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `quotes.controller.ts` | Verkauf | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `orders.controller.ts` | Verkauf | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `delivery-notes.controller.ts` | Verkauf | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `credit-notes.controller.ts` | Verkauf | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `reminders.controller.ts` | Verkauf | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `suppliers.controller.ts` | Einkauf | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `products.controller.ts` | Lager | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `purchase-orders.controller.ts` | Einkauf | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `purchase-invoices.controller.ts` | Einkauf | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `goods-receipts.controller.ts` | Lager | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `employees.controller.ts` | Personal | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `employee-contracts.controller.ts` | Personal | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `absences.controller.ts` | Personal | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `payroll.controller.ts` | Lohn | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `travel-expenses.controller.ts` | Personal | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `departments.controller.ts` | Personal | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `withholding-tax.controller.ts` | Lohn | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write |
| `swissdec.controller.ts` | Lohn | ✅ JwtAuth + Company + Permission | GET:read, POST:write |
| `finance.controller.ts` | Finanzen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write |
| `journal-entries.controller.ts` | Finanzen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `payments.controller.ts` | Finanzen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `bank-import.controller.ts` | Finanzen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `vat-returns.controller.ts` | Finanzen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `budgets.controller.ts` | Finanzen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `cost-centers.controller.ts` | Finanzen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `cash-book.controller.ts` | Finanzen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `fixed-assets.controller.ts` | Finanzen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `projects.controller.ts` | Projekte | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `tasks.controller.ts` | Projekte | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `time-entries.controller.ts` | Projekte | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `calendar.controller.ts` | Kalender | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `roles.controller.ts` | System | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT/DELETE:admin |
| `users.controller.ts` | System | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `company.controller.ts` | System | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write |
| `reports.controller.ts` | Reports | ✅ JwtAuth + Company + Permission | GET:read |
| `documents.controller.ts` | Dokumente | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `service-tickets.controller.ts` | Service | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `dashboard.controller.ts` | Dashboard | ✅ JwtAuth + Company + Permission | GET:read |
| `messages.controller.ts` | Kommunikation | ✅ JwtAuth + Company + Permission | GET:read, POST:write, DELETE:delete |
| `notifications.controller.ts` | System | ✅ JwtAuth + Company + Permission | GET:read, PUT:write, DELETE:delete |
| `settings.controller.ts` | Einstellungen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write |
| `marketing.controller.ts` | Marketing | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `ecommerce.controller.ts` | E-Commerce | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `bom.controller.ts` | Produktion | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `calculations.controller.ts` | Kalkulation | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `production-orders.controller.ts` | Produktion | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `quality-control.controller.ts` | Produktion | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `contracts.controller.ts` | Verträge | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `recruiting.controller.ts` | Personal | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `training.controller.ts` | Personal | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write, DELETE:delete |
| `gav-metallbau.controller.ts` | Einstellungen | ✅ JwtAuth + Company + Permission | GET:read, POST/PUT:write |

### Nicht gehärtete (bewusst public)

| Controller/Endpoint | Begründung |
|---|---|
| `auth.controller.ts` → POST /auth/login | Public — kein Token vorhanden |
| `auth.controller.ts` → POST /auth/register | Public — kein Token vorhanden |
| `auth.controller.ts` → POST /auth/refresh | Nur RefreshToken-Validierung |
| `invitations.controller.ts` → GET /invitations/validate/:token | Public — Einladungslink |
| Webhook-Endpoints | Stripe/Zahls-Signatur-Validierung statt JWT |

---

## PHASE 2 — jwt.strategy.ts Fix

**Datei:** `backend/src/modules/auth/strategies/jwt.strategy.ts`

```typescript
// VORHER (Bug: isActive=false wurde ignoriert)
if (!user || user.status !== 'ACTIVE') {

// NACHHER (Fix: beide Felder werden geprüft)
if (!user || user.status !== 'ACTIVE' || !user.isActive) {
```

**Effekt:** Ein deaktivierter User (isActive=false) wird ab sofort bei jeder Anfrage geblockt, nicht erst nach Token-Expiry.

---

## PHASE 3 — /auth/companies implementiert

**Endpoint:** `GET /auth/companies`  
**Guard:** `JwtAuthGuard` (kein CompanyGuard — User ist möglicherweise gerade beim Company-Switch)  
**Response:** Array aller aktiven Company-Memberships des Users

```typescript
// auth.controller.ts
@Get('companies')
@UseGuards(JwtAuthGuard)
async getMyCompanies(@CurrentUser() user: CurrentUserPayload) {
  return this.authService.getMyCompanies(user.userId);
}

// auth.service.ts
async getMyCompanies(userId: string) {
  return this.membershipService.getActiveCompaniesForUser(userId);
}
```

**Vorher:** Gab `[]` zurück (TODO-Stub)  
**Nachher:** Liefert reale DB-Daten mit Company-Name, Status, Rolle, Subscription

---

## PHASE 4 — AuditLog bei Login

**Datei:** `backend/src/modules/auth/auth.service.ts` → `generateFullLoginResponse()`

Bei jedem erfolgreichen Login wird ein Eintrag in `AuditLog` geschrieben:

```typescript
await this.prisma.auditLog.create({
  data: {
    userId,
    companyId,
    action: 'LOGIN_SUCCESS',
    module: 'auth',
    metadata: {
      ip: ipAddress ?? null,
      device: deviceInfo ?? null,
      userAgent: userAgent ?? null,
    },
  },
});
```

**Fehlerresilienz:** AuditLog-Fehler blockieren den Login nicht (try/catch mit silent catch).

---

## PHASE 5 — Keine Hardcoded Rollennamen

Alle Permission-Prüfungen erfolgen über `@RequirePermissions()` + `PermissionGuard`.  
Keine Verwendung von `['ADMIN', 'OWNER']` als Strings in Guards oder Services.  
Owner-Bypass ist ausschliesslich im `PermissionGuard` implementiert (via `membership.isOwner`).

---

## PHASE 6 — Multi-Tenant Isolation (bestätigt)

Alle Service-Queries filtern nach `companyId`:
- `where: { companyId: user.companyId }` in allen Prisma-Queries
- `CompanyGuard` validiert bei jeder Anfrage DB-seitig: Membership existiert + Company.status === ACTIVE
- Kein Service nutzt `User.companyId` (Legacy-Feld) — companyId kommt aus dem JWT

---

## Was NICHT geändert wurde (bewusste Entscheidungen)

| Thema | Entscheidung | Begründung |
|---|---|---|
| `User.role` Enum (DB) | Nicht entfernt | Prisma-Migration erfordert Deployment-Absprache |
| `User.companyId` (DB) | Nicht entfernt | Gleicher Grund; wird nicht mehr verwendet |
| Token-Lifetime (15min) | Bleibt | 15min akzeptabel mit isActive-Fix |
| SubscriptionGuard | Nicht pauschal hinzugefügt | CompanyGuard validiert Membership; SubscriptionGuard nur für Plan-gated Features |
| Redis-Blacklist | Out of Scope | isActive-Fix deckt den Hauptanwendungsfall ab |

---

## Zielarchitektur (erreicht)

```
Request
  ↓
JwtAuthGuard          ← Token-Validierung + isActive-Check
  ↓
CompanyGuard          ← DB-validierte Membership + Company.status === ACTIVE
  ↓
PermissionGuard       ← Serverseitige Permission-Prüfung via @RequirePermissions()
  ↓
Controller
  ↓
Service               ← companyId-gefilterte Queries
  ↓
PostgreSQL (Prisma)
```

---

*Abschlussbericht erstellt: 2026-02-18 | Loomora Backend Security Hardening v1.0*
