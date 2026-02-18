# Loomora – UI/Backend/RBAC/Token Audit

**Datum:** 18.02.2026  
**Basis:** IST-Zustand. Kein theoretisches Soll. Nur was wirklich im Code steht.  
**Scope:** Frontend (`src/`), Backend (`backend/src/`), Auth-Flow, Multi-Tenant

---

## Inhaltsverzeichnis

1. [Button-Inventur](#1-button-inventur)
2. [Routing-Prüfung](#2-routing-prüfung)
3. [Backend Endpoint / Guard Audit](#3-backend-endpoint--guard-audit)
4. [Frontend Permission-System](#4-frontend-permission-system)
5. [Token-Flow Analyse](#5-token-flow-analyse)
6. [Multi-Tenant Check](#6-multi-tenant-check)
7. [Probleme nach Priorität](#7-probleme-nach-priorität)

---

## 1. Button-Inventur

### 1.1 Delete-Buttons (vollständig)

| Datei | Label | API-Call | Confirm-Dialog | Permission-Check |
|---|---|---|---|---|
| `Users.tsx` | "Löschen" | `deleteMutation.mutate(user.id)` | ✅ `confirm()` | ❌ kein canDelete |
| `RoleDetail.tsx` | "Löschen" | `deleteRole.mutate(id)` | ✅ AlertDialog | ❌ kein canDelete |
| `TaskDetail.tsx` | "Löschen" | `deleteMutation.mutate()` | ✅ `confirm()` | ❌ kein canDelete |
| `DocumentDetail.tsx` | Delete-Icon | `deleteMutation.mutate(id)` | ❌ KEIN Dialog | ❌ kein canDelete |
| `QualityControl.tsx` | "Löschen" | `deleteMutation.mutate(checkId)` | ❌ KEIN Dialog | ❌ kein canDelete |
| `QualityChecklists.tsx` | "Löschen" | `deleteMutation.mutate(template.id)` | ❌ KEIN Dialog | ❌ kein canDelete |
| `QualityChecklistDetail.tsx` | "Löschen" | `deleteMutation.mutateAsync(id)` | ✅ AlertDialog | ❌ kein canDelete |
| `Budgets.tsx` | "Löschen" | `deleteMutation.mutate(id)` | ✅ `confirm()` | ❌ kein canDelete |
| `JournalEntries.tsx` | "Löschen" | `deleteEntry.mutate(id)` | ❌ KEIN Dialog | ❌ kein canDelete |
| `TravelExpenses.tsx` | "Löschen" | `deleteMutation.mutate(id)` | ❌ KEIN Dialog | ❌ kein canDelete |
| `Quotes.tsx` | "Löschen" | `deleteMutation.mutate(quote.id)` | ✅ `confirm()` | ❌ kein canDelete |
| `Invoices.tsx` | "Löschen" | `deleteMutation.mutate(invoice.id)` | ✅ `confirm()` | ❌ kein canDelete |
| `Orders.tsx` | "Löschen" | `deleteMutation.mutate(order.id)` | ✅ `confirm()` | ❌ kein canDelete |
| `Customers.tsx` | "Löschen" | `deleteCustomer.mutateAsync(id)` | ✅ `confirm()` | ❌ kein canDelete |
| `Suppliers.tsx` | "Löschen" | `deleteSupplier.mutateAsync(id)` | ✅ `confirm()` | ❌ kein canDelete |
| `ProjectDetail.tsx` | "Löschen" | `deleteProject.mutateAsync(id)` | ✅ AlertDialog | ❌ kein canDelete |
| `Leads.tsx` | "Löschen" | `deleteMutation.mutate(lead.id)` | ✅ `confirm()` | ❌ kein canDelete |
| `Tasks.tsx` | Delete | `deleteMutation.mutate(taskId)` | ✅ `confirm()` | ❌ kein canDelete |
| `Recruiting.tsx` | Delete | `deleteMutation.mutate(id)` | ❌ KEIN Dialog | ❌ kein canDelete |
| `TimeTracking.tsx` | Delete | `deleteTimeEntry.mutateAsync(id)` | ✅ AlertDialog | ❌ kein canDelete |

**Zusammenfassung Delete:**
- 20 Delete-Buttons total
- **6 ohne Confirm-Dialog:** `DocumentDetail`, `QualityControl`, `QualityChecklists`, `JournalEntries`, `TravelExpenses`, `Recruiting`
- **20 von 20 ohne Permission-Check** (`canDelete()` wird nirgendwo geprüft)

---

### 1.2 Buttons ohne onClick-Handler (broken)

| Datei | Zeile | Label | Status |
|---|---|---|---|
| `EmployeeDetail.tsx` | ~695 | "Hochladen" | ❌ Kein onClick |
| `EmployeeDetail.tsx` | ~708 | "Download" | ❌ Kein onClick |
| `DocumentDetail.tsx` | ~59 | Share-Icon | ❌ Kein onClick |
| `DeliveryNoteDetail.tsx` | ~392 | "Sendung verfolgen" | ❌ Kein onClick |
| `TaskDetail.tsx` | 227 | "Zurück zur Übersicht" | ❌ Kein onClick (navigate vorhanden, aber Button nicht verknüpft) |

**Befund `TaskDetail.tsx` Zeile 227:**  
`navigate` ist auf Zeile 108 definiert und auf 154 für Delete verwendet. Der Button auf Zeile 227 hat kein `onClick={() => navigate('/tasks')}`.

---

### 1.3 Save/Create-Buttons

Alle untersuchten Save-Buttons haben korrekte Mutations:

| Datei | Mutation |
|---|---|
| `UserEdit.tsx` | `updateUser.mutate()` |
| `RoleEdit.tsx` | `updateRole.mutate()` |
| `TimeTracking.tsx` | `createTimeEntry.mutate()` |
| `TaskDetail.tsx` | `updateMutation.mutate()` |
| `EmployeeContractDetail.tsx` | `updateMutation.mutate()` |
| `QualityChecklistDetail.tsx` | `updateMutation.mutateAsync()` |

**Befund:** Kein Save-Button ist permission-gebunden (`canWrite()` wird nie geprüft).

---

### 1.4 Permission-gebundene Buttons

**Ergebnis: KEINE.**

Kein einziger Button im gesamten Frontend prüft `canWrite()`, `canDelete()` oder `hasPermission()`. Alle Buttons werden für jeden authentifizierten User gerendert.

Einzige Ausnahme: **AppSidebar** (`AppSidebar.tsx` Zeile 558) nutzt `canAccessModule()` um Menü-Einträge auszublenden.

---

### 1.5 Modal-Dialogs

Alle untersuchten Modal-Dialogs sind korrekt mit API-Calls verknüpft:

| Datei | Dialog | API-Call |
|---|---|---|
| `RoleDetail.tsx` | Delete Role | ✅ `deleteRole.mutate(id)` |
| `QualityChecklistDetail.tsx` | Delete Checklist | ✅ `deleteMutation.mutateAsync(id)` |
| `ProjectDetail.tsx` | Delete Project | ✅ `deleteProject.mutateAsync(id)` |
| `UserDetail.tsx` | End Sessions | ✅ `endSessionsMutation.mutate(id)` |
| `TimeTracking.tsx` | Add Entry | ✅ `createTimeEntry.mutate()` |
| `TaskDetail.tsx` | Edit Task | ✅ `updateMutation.mutate()` |
| `EmployeeDetail.tsx` | Offboarding | ✅ `handleStartOffboarding()` |

---

## 2. Routing-Prüfung

### 2.1 Route-Übersicht

**Total:** 187 Routen (aus `App.tsx`)  
**Öffentlich (kein Auth):** 3  
**Geschützt via `ProtectedRoute`:** 184  
**Geschützt via `PermissionGuard`:** 0

```
/login          → AuthPage        (öffentlich)
/register       → AuthPage        (öffentlich)
/select-company → SelectCompany   (öffentlich)
/*              → ProtectedRoute  → [184 Routen]
*               → NotFound
```

Alle 184 als geschützt markierten Seiten prüfen nur ob der User **eingeloggt ist** — nicht ob er **Permission** hat.

### 2.2 Vollständige Route-Liste

**Dashboard & Aktivität:** `/`, `/activity`  
**Projekte:** `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit`  
**Aufgaben:** `/tasks`, `/tasks/new`, `/tasks/:id`, `/tasks/:id/edit`  
**CRM:** `/customers`, `/customers/new`, `/customers/:id`, `/customers/:id/edit`, `/suppliers/*` (analog)  
**Zeit:** `/time-tracking`, `/calendar`  
**Verkauf:** `/quotes/*`, `/orders/*`, `/invoices/*`, `/delivery-notes/*`, `/credit-notes/*`, `/reminders/*`  
**Einkauf:** `/purchase-orders/*`, `/purchase-invoices/*`, `/inventory/*`, `/goods-receipts/*`  
**Finanzen:** `/finance`, `/chart-of-accounts/*`, `/journal-entries/*`, `/general-ledger/*`, `/open-items`, `/debtors`, `/creditors`, `/balance-sheet`, `/vat-returns/*`, `/fixed-assets/*`, `/cash-book/*`, `/bank-accounts/*`, `/sepa-payments/*`, `/cost-centers/*`, `/budgets/*`, `/contracts/*`, `/payments/*`  
**HR:** `/hr/*`, `/employee-contracts/*`, `/payroll/*`, `/payslips/:id`, `/payroll/payslip/:id`, `/absences/*`, `/departments/*`, `/recruiting/*`, `/training/*`, `/orgchart`  
**Produkte:** `/products/*`  
**Marketing:** `/campaigns/*`, `/leads/*`, `/email-marketing/*`  
**E-Commerce:** `/shop`, `/discounts/*`, `/reviews/*`  
**Berichte:** `/reports`  
**Dokumente:** `/documents/*`, `/folders/:id`  
**Admin:** `/users/*`, `/company`, `/company/edit`, `/settings`, `/roles/*`, `/audit-log/*`, `/notifications/*`, `/help`  
**Produktion:** `/bom/*`, `/calculation/*`, `/production/*`, `/qr-invoice`, `/bank-import`, `/swissdec`, `/withholding-tax`, `/service/*`, `/quality/*`  
**Sonstiges:** `/website` (nicht in ProtectedRoute)

### 2.3 Routing-Probleme

**Duplikat-Route (P2):**
```
/payslips/:id          → PayslipDetail
/payroll/payslip/:id   → PayslipDetail   ← identisches Ziel
```
Beide Routen in `App.tsx` definiert. Potenzielle Inkonsistenz bei internen Links.

**Fehlende Permission-Checks auf Route-Ebene:**
`ProtectedRoute` prüft nur `isAuthenticated`. Kein `<PermissionGuard module="invoices" action="read">` auf Route-Ebene. Ein User mit `employees:read`-Only kann `/invoices` direkt aufrufen.

**`PermissionGuard` Komponente existiert** (`src/components/auth/PermissionGuard.tsx`), wird aber in `App.tsx` bei keiner Route verwendet.

---

## 3. Backend Endpoint / Guard Audit

### 3.1 Guard-System

**Drei Guards, korrekte Reihenfolge:**

```
JwtAuthGuard → CompanyGuard → PermissionGuard
```

**JwtAuthGuard** (`jwt-auth.guard.ts`): Prüft JWT, setzt `request.user` mit Payload (userId, companyId, permissions[], isOwner).

**CompanyGuard** (`company.guard.ts`): Prüft `user.companyId`, lädt Company aus DB, prüft Status `ACTIVE`, validiert `UserCompanyMembership`. Setzt `request.company`.

**PermissionGuard** (`permission.guard.ts`): Liest `@RequirePermissions` via Reflector. Prüft `user.permissions[]`. Owner hat immer Zugang. `:admin` deckt alle Sub-Actions ab.

---

### 3.2 Endpoints nach Schutz-Status

#### Vollständig geschützt (JwtAuthGuard + CompanyGuard + PermissionGuard)

Die überwiegende Mehrheit aller Business-Controller:

| Controller | Beispiel-Permission |
|---|---|
| `absences.controller.ts` | `absences:read/write/delete` |
| `bom.controller.ts` | `products:read/write/delete` |
| `budgets.controller.ts` | `finance:read/write/delete` |
| `calculations.controller.ts` | `quotes:read/write/delete` |
| `calendar.controller.ts` | `calendar:read/write/delete` |
| `cash-book.controller.ts` | `cash-book:read/write/delete` |
| `company.controller.ts` | `company:read/write` |
| `contracts.controller.ts` | `contracts:read/write/delete` |
| `cost-centers.controller.ts` | `cost-centers:read/write/delete` |
| `credit-notes.controller.ts` | `credit-notes:read/write/delete` |
| `customers.controller.ts` | `customers:read/write/delete` |
| `dashboard.controller.ts` | `dashboard:read` |
| `delivery-notes.controller.ts` | `delivery-notes:read/write/delete` |
| `departments.controller.ts` | `departments:read/write/delete` |
| `documents.controller.ts` | `documents:read/write/delete` |
| `ecommerce.controller.ts` | `ecommerce:read/write/delete` |
| `employee-contracts.controller.ts` | `employee-contracts:read/write/delete` |
| `employees.controller.ts` | `employees:read/write/delete` |
| `finance.controller.ts` | `finance:read/write` |
| `fixed-assets.controller.ts` | `fixed-assets:read/write` |
| `goods-receipts.controller.ts` | `goods-receipts:read/write/delete` |
| `invoices.controller.ts` | `invoices:read/write/delete` |
| `journal-entries.controller.ts` | `journal-entries:read/write/delete` |
| `marketing.controller.ts` | `marketing:read/write/delete` |
| `messages.controller.ts` | `messages:read/write/delete` |
| `notifications.controller.ts` | `notifications:read/write/delete` |
| `orders.controller.ts` | `orders:read/write/delete` |
| `payments.controller.ts` | `payments:read/write` |
| `payroll.controller.ts` | `payroll:read/write` |
| `production-orders.controller.ts` | `production-orders:read/write/delete` |
| `products.controller.ts` | `products:read/write/delete` |
| `projects.controller.ts` | `projects:read/write/delete` |
| `purchase-invoices.controller.ts` | `purchase-invoices:read/write/delete` |
| `purchase-orders.controller.ts` | `purchase-orders:read/write/delete` |
| `quality-control.controller.ts` | `quality-control:read/write/delete` |
| `quotes.controller.ts` | `quotes:read/write/delete` |
| `recruiting.controller.ts` | `recruiting:read/write/delete` |
| `reminders.controller.ts` | `reminders:read/write/delete` |
| `reports.controller.ts` | `reports:read` |
| `roles.controller.ts` | `roles:read/admin` |
| `service-tickets.controller.ts` | `service-tickets:read/write/delete` |
| `settings.controller.ts` | `settings:read/write/admin` |
| `suppliers.controller.ts` | `suppliers:read/write/delete` |
| `tasks.controller.ts` | `tasks:read/write/delete` |
| `time-entries.controller.ts` | `time-entries:read/write/delete` |
| `training.controller.ts` | `training:read/write/delete` |
| `travel-expenses.controller.ts` | `travel-expenses:read/write/delete` |
| `users.controller.ts` | `users:read/write/admin/delete` |
| `vat-returns.controller.ts` | `finance:read/write/delete` |
| `withholding-tax.controller.ts` | `payroll:read/write` |
| `swissdec.controller.ts` | `payroll:read/write` |
| `gav-metallbau.controller.ts` | `payroll:read/write` |
| `bank-import.controller.ts` | `bank-accounts:read/write` |

---

#### Nur JwtAuthGuard — kein CompanyGuard, kein PermissionGuard

**Diese 4 Endpoints haben einen Sonderfall:**  
`companyId` wird intern aus dem JWT-Token via `user.companyId` verwendet, aber es gibt keinen CompanyGuard, der die Membership, den Company-Status und die Subscription validiert.

| Controller | Route | Risiko |
|---|---|---|
| `audit-log.controller.ts` | `GET/POST /audit-log/*` | Kein Permission-Check: jeder Auth-User sieht alle Audit-Logs seiner Company |
| `bank-transactions.controller.ts` | `GET /bank-transactions/*` | Kein Permission-Check: jeder Auth-User sieht Bankdaten |
| `accounting-seed.controller.ts` | `POST /accounting/seed` | Kein Permission-Check: jeder Auth-User kann Seed ausführen |
| `invitations.controller.ts` | `GET /invitations/validate/:token`, `POST /invitations/accept` | Öffentlich (beabsichtigt) |

**Präzisierung:** Da `companyId` aus dem JWT kommt, gibt es keinen Cross-Company-Zugriff. Das Risiko ist: fehlende Rollen-Einschränkung (ein `EMPLOYEE` kann Audit-Logs lesen) und fehlende Subscription-/Status-Prüfung (inaktive Company kann weiter Daten abrufen).

---

#### Öffentliche Endpoints (kein Auth — beabsichtigt)

| Endpoint | Begründung |
|---|---|
| `POST /auth/login` | Login |
| `POST /auth/register` | Registrierung |
| `POST /auth/select-company` | Company-Auswahl nach Login |
| `POST /auth/refresh` | Token-Refresh |
| `POST /auth/2fa/authenticate` | 2FA-Step |
| `GET /health` | Health-Check |
| `GET /invitations/validate/:token` | Einladungs-Link |
| `POST /invitations/accept` | Einladung annehmen |
| `GET /subscriptions/plans` | Plan-Übersicht |
| `POST /subscriptions/webhook` | Stripe Webhook |

---

#### Subscription-Endpoints ohne PermissionGuard

| Endpoint | Guards |
|---|---|
| `GET /subscriptions/status` | JwtAuthGuard + CompanyGuard |
| `POST /subscriptions/checkout` | JwtAuthGuard + CompanyGuard |
| `POST /subscriptions/reactivate` | JwtAuthGuard + CompanyGuard |
| `GET /subscriptions/config-status` | JwtAuthGuard + CompanyGuard |

Diese haben kein `@RequirePermissions`, sind aber company-gebunden. Jeder authentifizierte Company-Member kann Subscription-Status abrufen und Checkout initiieren.

---

### 3.3 Vollständige Permission-Key Liste (55 Keys)

```
absences:read/write/delete
bank-accounts:read/write
calendar:read/write/delete
cash-book:read/write/delete
company:read/write
contracts:read/write/delete
cost-centers:read/write/delete
credit-notes:read/write/delete
customers:read/write/delete
dashboard:read
delivery-notes:read/write/delete
departments:read/write/delete
documents:read/write/delete
ecommerce:read/write/delete
employee-contracts:read/write/delete
employees:read/write/delete
finance:read/write/delete
fixed-assets:read/write
goods-receipts:read/write/delete
invoices:read/write/delete
journal-entries:read/write/delete
marketing:read/write/delete
messages:read/write/delete
notifications:read/write/delete
orders:read/write/delete
payments:read/write
payroll:read/write
production-orders:read/write/delete
products:read/write/delete
projects:read/write/delete
purchase-invoices:read/write/delete
purchase-orders:read/write/delete
quality-control:read/write/delete
quotes:read/write/delete
recruiting:read/write/delete
reminders:read/write/delete
reports:read
roles:read/admin
service-tickets:read/write/delete
settings:read/write/admin
suppliers:read/write/delete
tasks:read/write/delete
time-entries:read/write/delete
training:read/write/delete
travel-expenses:read/write/delete
users:read/write/admin/delete
```

---

## 4. Frontend Permission-System

### 4.1 usePermissions Hook

**Datei:** `src/hooks/use-permissions.ts`

```typescript
export function usePermissions() {
  const { activeCompany, isAuthenticated } = useAuth();

  const permissions = useMemo(() => {
    return activeCompany?.permissions ?? [];
  }, [activeCompany?.permissions]);

  const isOwner = activeCompany?.isOwner ?? false;

  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated) return false;
    if (isOwner) return true;                    // Owner hat alles
    if (permissions.includes('*')) return true;  // Wildcard
    return permissions.includes(permission);
  };

  const canAccessModule = (module: string) => hasPermission(`${module}:read`);
  const canWrite = (module: string) => hasPermission(`${module}:write`);
  const canDelete = (module: string) => hasPermission(`${module}:delete`);

  return { permissions, isOwner, hasPermission, canAccessModule, canWrite, canDelete };
}
```

**Datenquelle:** `activeCompany.permissions` — ein `string[]` aus dem JWT-Token, aktualisiert via `/auth/me`.

### 4.2 PermissionGuard Komponente

**Datei:** `src/components/auth/PermissionGuard.tsx`  
**Verwendung:** `<PermissionGuard module="invoices" action="read">...</PermissionGuard>`  
**Status:** Komponente existiert, wird aber in `App.tsx` bei **keiner** Route eingesetzt.

### 4.3 IST-Zustand der Permission-Nutzung

| Bereich | Verwendung von usePermissions/canAccessModule |
|---|---|
| `AppSidebar.tsx` | ✅ `canAccessModule()` für Sidebar-Einträge |
| `App.tsx` (Routen) | ❌ Keine Permission-Checks |
| Seiten (src/pages/*) | ❌ Keine Permission-Checks |
| Buttons (alle) | ❌ Keine canWrite()/canDelete()-Checks |
| Modale | ❌ Keine Permission-Checks |

**Konsequenz:** Die Sidebar blendet Menü-Einträge korrekt aus. Aber per direkter URL kann jede Seite geöffnet werden. Alle Buttons (Erstellen, Bearbeiten, Löschen) sind für jeden User sichtbar und klickbar — das Backend blockiert dann bei tatsächlichem API-Call.

---

## 5. Token-Flow Analyse

### 5.1 Speicherung

**localStorage:**
```
auth_token      → Access Token (JWT)
refresh_token   → Refresh Token
auth_user       → User-Info (JSON)
auth_company    → Active Company Info inkl. permissions[] (JSON)
auth_companies  → All Available Companies (JSON)
```

### 5.2 Permission-Quelle

Permissions stehen an **zwei Stellen**:

1. **Im JWT-Token** (bei Login/Switch generiert):  
   `backend/src/modules/auth/auth.service.ts` Zeile ~596:
   ```typescript
   const jwtPayload: JwtPayload = {
     sub: userId,
     email: userInfo.email,
     activeCompanyId: companyId,
     roleId: role.id,
     permissions,   // ← aus DB generiert, im Token gespeichert
     isOwner: membership.isOwner,
   };
   ```

2. **Via `/auth/me`** (beim App-Mount aufgerufen):  
   `backend/src/modules/auth/auth.controller.ts` Zeile 118:
   ```typescript
   async getMe(@CurrentUser() user) {
     const { permissions } = await this.authService.getFreshPermissions(user.userId, user.companyId);
     // lädt frisch aus DB (Rolle + UserPermissionOverrides)
   }
   ```

`/auth/me` wird in `AuthContext.tsx` beim Mount ausgeführt und überschreibt den Token-Stand mit frischen DB-Permissions. Dadurch sind Permission-Änderungen nach dem letzten Login auch ohne Re-Login wirksam.

### 5.3 Company-Switch Flow

```
1. Frontend: POST /auth/switch-company { companyId }
2. Backend: Validiert Membership, Company-Status, Subscription
3. Backend: Generiert neue Access + Refresh Tokens mit neuer activeCompanyId + neuen permissions
4. Frontend: Speichert neue Tokens in localStorage
5. Frontend: Aktualisiert activeCompany im AuthContext
6. → Korrekt implementiert
```

### 5.4 401/403 Handling

**401 (Unauthorized):**
```
1. Request schlägt fehl mit 401
2. api.ts: Refresh-Versuch mit stored refreshToken
3. Erfolg: Neue Tokens gespeichert, Request wiederholt
4. Fehler: clearAuth() + redirect zu /login
```
Status: ✅ Korrekt implementiert

**403 (Forbidden):**  
`api.ts` Zeile 127–132:
```typescript
if (!response.ok) {
  const error: ApiError = await response.json();
  throw new Error(error.message || error.error);
}
```
Kein spezifischer 403-Handler. Der Fehler wird als `Error` geworfen. Kein konsistentes UI-Feedback — einzelne Seiten zeigen Toast-Messages via `onError` in `useMutation`, aber es gibt keine zentrale 403-Behandlung.

### 5.5 Token-Refresh Company-Bug

**Datei:** `backend/src/modules/auth/auth.service.ts` Zeile 434

```typescript
async refreshTokens(refreshToken: string) {
  // ...
  const primaryCompanyId = await this.membershipService.getPrimaryCompany(user.id);
  // ↑ Lädt PRIMÄRE Company, nicht die zuletzt aktive
  const companyInfo = await this.membershipService.getActiveCompanyInfo(userId, primaryCompanyId);
  // Generiert neuen Token für primäre Company
}
```

**Szenario:**
1. User hat Company A als primäre Company
2. User wechselt zu Company B via switch-company → neuer Token mit Company B
3. Access Token läuft ab → automatischer Refresh via `api.ts`
4. Refresh-Endpoint generiert neuen Token mit **Company A** (primäre Company)
5. User arbeitet weiterhin in Company B-Context, aber Token zeigt auf Company A
6. Nächster API-Call: Backend sieht Company A im Token → Company B Daten werden abgelehnt

**Auswirkung:** Bei Token-Expiry während eines Company-Wechsels wird der User zur primären Company zurückgesetzt ohne visuelles Feedback.

---

## 6. Multi-Tenant Check

### 6.1 Datenisolation (Backend)

**Sicher:**
- `companyId` kommt ausschließlich aus `user.companyId` im JWT-Payload
- `JwtStrategy` extrahiert `activeCompanyId: payload.activeCompanyId`
- `CompanyGuard` validiert Membership zusätzlich gegen DB
- Alle Business-Services erhalten `companyId` als Parameter und filtern ausnahmslos danach

Beispiele:
- `products.service.ts`: `findAll(companyId: string, ...) → where: { companyId }`
- `invoices.service.ts`: `findAll(companyId: string, ...) → where: { companyId }`
- `employees.service.ts`: `findAll(companyId: string, ...) → where: { companyId }`

**URL-Manipulation:** Ein `GET /invoices?someId=xyz` kann keine anderen Company-Daten liefern, da der `companyId`-Filter aus dem Token kommt, nicht aus der URL.

### 6.2 Risiken

**Audit-Log, Bank-Transactions, Accounting-Seed ohne CompanyGuard:**  
Diese Controller filtern zwar per `user.companyId`, aber der CompanyGuard wird nicht ausgeführt. Das bedeutet:
- Kein Check ob die Company im Status `ACTIVE` ist
- Kein Check ob eine aktive Subscription vorhanden ist
- Kein Membership-DB-Abgleich (nur JWT-Trust)

**Subscription-Endpoints ohne PermissionGuard:**  
`POST /subscriptions/checkout` und `POST /subscriptions/reactivate` können von jedem Company-Member aufgerufen werden, nicht nur vom Owner/Admin.

### 6.3 Company-Switch nach Refresh (siehe 5.5)

Nach Token-Expiry verliert der User den Company-Kontext und wird zur primären Company zurückgesetzt.

---

## 7. Probleme nach Priorität

### P0 — Kritisch

| # | Problem | Datei / Zeile | Beschreibung |
|---|---|---|---|
| P0-1 | **Keine Permission-Checks auf Route-Ebene** | `src/App.tsx` | 184 Routen durch `ProtectedRoute` (Auth-Check), aber keine einzige Route durch `PermissionGuard`. Jeder eingeloggte User kann alle URLs direkt aufrufen. |
| P0-2 | **Keine Permission-Checks auf Button-Ebene** | Alle `src/pages/*.tsx` | Kein einziger Create/Edit/Delete-Button prüft `canWrite()` oder `canDelete()`. Buttons werden für alle User gerendert und aktiviert. Backend blockiert erst beim API-Call. |
| P0-3 | **`/audit-log/*` ohne PermissionGuard** | `audit-log.controller.ts` Zeile 9 | Nur `JwtAuthGuard`. Jeder eingeloggte User (auch EMPLOYEE mit minimalen Rechten) kann alle Audit-Logs der Company lesen und Cleanup auslösen. |
| P0-4 | **`/subscriptions/checkout` ohne PermissionGuard** | `subscriptions.controller.ts` | Jeder Auth-User kann Subscription-Checkout initiieren. Sollte auf `settings:admin` beschränkt sein. |

---

### P1 — Mittlere Probleme

| # | Problem | Datei / Zeile | Beschreibung |
|---|---|---|---|
| P1-1 | **5 Buttons ohne onClick-Handler** | `EmployeeDetail.tsx` (2x), `DocumentDetail.tsx`, `DeliveryNoteDetail.tsx`, `TaskDetail.tsx` | Buttons werden gerendert, aber nichts passiert beim Klick. |
| P1-2 | **6 Delete-Buttons ohne Confirm-Dialog** | `DocumentDetail`, `QualityControl`, `QualityChecklists`, `JournalEntries`, `TravelExpenses`, `Recruiting` | Direktes Löschen ohne Bestätigung. |
| P1-3 | **Token-Refresh Company-Bug** | `auth.service.ts` Zeile 434 | Nach Token-Expiry wird primäre Company aktiviert, nicht aktive. `getPrimaryCompany()` statt aktive Company verwenden. |
| P1-4 | **403-Handling ohne UI-Feedback** | `src/lib/api.ts` Zeile 127 | Kein zentrales 403-Handling. Fehler werden geworfen, aber nicht konsistent als Toast/Message angezeigt. |
| P1-5 | **`/accounting/seed` ohne PermissionGuard** | `accounting-seed.controller.ts` Zeile 11 | Jeder eingeloggte User kann den Kontenplan-Seed auslösen (idempotent, aber trotzdem unerwünscht ohne Prüfung). |
| P1-6 | **`/bank-transactions/*` ohne PermissionGuard** | `bank-transactions.controller.ts` Zeile 14 | Bankdaten ohne Permission-Check. Sollte `finance:read` oder `bank-accounts:read` erfordern. |

---

### P2 — UX-Probleme

| # | Problem | Datei | Beschreibung |
|---|---|---|---|
| P2-1 | **Duplikat-Route Payslips** | `App.tsx` | `/payslips/:id` und `/payroll/payslip/:id` zeigen beide `PayslipDetail`. |
| P2-2 | **Permission-System ungenutzt** | `App.tsx`, alle Pages | `usePermissions()` und `PermissionGuard` sind vorhanden aber nicht eingesetzt. Technische Schuld. |
| P2-3 | **Inkonsistente Confirm-Dialoge** | Diverse Pages | Einige Delete-Buttons nutzen `confirm()` (native), andere `AlertDialog` (UI), andere gar nichts. |

---

### Sicherheitsrisiken (zusammengefasst)

| Risiko | Ausnutzbar? | Impact |
|---|---|---|
| Route-Bypass via direkter URL | Ja, sofort | User sieht UI für Module ohne Berechtigung |
| Button-Klick ohne canWrite-Check | Ja (Backend blockiert) | Backend blockiert, aber UI ist irreführend |
| Audit-Log ohne Permission | Ja | EMPLOYEE kann alle Aktionen aller User lesen |
| Subscription-Checkout ohne Owner | Ja | Jeder Company-Member kann Checkout starten |
| Refresh-Token auf falsche Company | Ja (bei Token-Expiry) | Datenkontextverlust bei Multi-Company-Usern |
| Accounting-Seed ohne Permission | Ja | Jeder Auth-User kann Seed triggern |

---

### Empfehlungen (Cursor-Scope — nur Backend)

1. **`audit-log.controller.ts`:** `@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)` + `@RequirePermissions('settings:read')` hinzufügen.
2. **`bank-transactions.controller.ts`:** CompanyGuard + `@RequirePermissions('bank-accounts:read')` hinzufügen.
3. **`accounting-seed.controller.ts`:** CompanyGuard + `@RequirePermissions('finance:admin')` oder `settings:admin` hinzufügen.
4. **`auth.service.ts` Zeile 434:** `getPrimaryCompany()` durch aktive Company aus RefreshToken-Kontext ersetzen (speichere zuletzt aktive `companyId` im RefreshToken selbst).
5. **`subscriptions.controller.ts`:** `POST /checkout` und `POST /reactivate` mit `@RequirePermissions('settings:admin')` absichern.

### Empfehlungen (Lovable-Scope — nur Frontend)

1. **`App.tsx`:** `<PermissionGuard>` auf allen modul-spezifischen Routen einsetzen.
2. **Alle Pages:** Create/Edit-Buttons mit `{canWrite('module') && <Button>}` wrappen.
3. **Alle Pages:** Delete-Buttons mit `{canDelete('module') && <Button>}` wrappen.
4. **Alle Pages:** Fehlende `confirm()`-Dialoge bei den 6 Delete-Buttons ergänzen.
5. **5 defekte Buttons:** `onClick` Handler implementieren.
6. **`api.ts`:** Zentralen 403-Handler mit `toast.error('Keine Berechtigung')` ergänzen.

---

*Report generiert auf Basis statischer Code-Analyse — IST-Zustand ohne Laufzeit-Prüfung.*
