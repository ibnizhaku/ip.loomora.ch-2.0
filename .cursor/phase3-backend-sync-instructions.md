# Phase 3 – Backend-Synchronisation: Cursor-Agent Instruktionen

> **Ziel**: Backend an den Frontend-Contract anpassen, OHNE Frontend zu ändern
> **Referenz-Dokumente**: `docs/contract.md`, `docs/gaps.md`, `docs/models.md`, `docs/auth.md`
> **Stand**: 2026-02-20

---

## ⛔ ABSOLUTE REGELN

1. **KEIN FILE in `/src` ändern** — Frontend ist Read-Only
2. **KEIN globales Refactoring** — nur gezielt das ändern, was kaputt ist
3. **KEINE Prod-DB-Migrations** — nur dev/local
4. **Bestehende funktionierende Endpoints NICHT brechen**
5. **Patterns beibehalten** — wenn ein Modul X-Pattern nutzt, nutze es auch
6. **Contract-first** — Backend richtet sich nach `docs/contract.md`

---

## Architektur-Übersicht

```
backend/
├── src/
│   ├── main.ts                          # NestJS Bootstrap, GlobalPrefix '/api'
│   ├── app.module.ts                    # 53+ Module registriert
│   ├── prisma/prisma.service.ts         # Prisma Client
│   ├── common/
│   │   ├── mappers/response.mapper.ts   # ⚠️ ZENTRAL: Feld-Mapping Backend→Frontend
│   │   ├── dto/pagination.dto.ts        # Standard Pagination
│   │   ├── guards/                      # JwtAuthGuard, CompanyGuard, PermissionGuard
│   │   └── decorators/                  # @RequirePermissions, @GetUser, @GetCompanyId
│   └── modules/
│       ├── auth/                        # JWT + 2FA + Multi-Tenant
│       ├── customers/                   # Beispiel: CRUD + Stats + Contacts
│       ├── quotes/                      # Beispiel: CRUD + Convert + Stats
│       ├── invoices/                    # Beispiel: CRUD + Payment + Stats
│       └── ... (53 Module)
```

### Guard-Stack (jeder Controller)
```ts
@UseGuards(JwtAuthGuard, CompanyGuard, PermissionGuard)
@Controller('modulname')
export class ModulController {
  @Get()
  @RequirePermissions('modulname:read')
  findAll(@GetCompanyId() companyId: string, @Query() query: PaginationDto) {}

  @Post()
  @RequirePermissions('modulname:write')
  create(@GetCompanyId() companyId: string, @GetUser('id') userId: string, @Body() dto: CreateDto) {}

  @Delete(':id')
  @RequirePermissions('modulname:delete')
  remove(@Param('id') id: string, @GetCompanyId() companyId: string) {}
}
```

### Response-Mapper Pattern
```ts
// backend/src/common/mappers/response.mapper.ts
// ZENTRALE STELLE für alle Feld-Transformationen
// Backend DB-Felder → Frontend-erwartete Felder

// Beispiel: Quote
export function mapQuoteResponse(quote: any) {
  return {
    ...quote,
    issueDate: quote.date,      // DB: 'date' → Frontend: 'issueDate'
    total: Number(quote.total),  // Decimal → Number
    subtotal: Number(quote.subtotal),
    vatAmount: Number(quote.vatAmount),
    items: quote.items?.map(mapItemResponse),
  };
}
```

### Pagination-Standard (ALLE Listen-Endpoints)
```ts
// Frontend erwartet IMMER dieses Format:
{
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}
```

---

## TASK-LISTE (nach Priorität)

### PRIO 1: Response-Mapper Fixes (Kategorie A — 18 Module)

**Problem**: Frontend erwartet bestimmte Feldnamen, Backend liefert andere.

**Betroffene Datei**: `backend/src/common/mappers/response.mapper.ts`

| Modul | DB-Feld | Frontend erwartet | Fix |
|---|---|---|---|
| Invoice | `date` | `issueDate` | `issueDate: invoice.date` |
| Invoice | `totalAmount` | `total` | `total: Number(invoice.totalAmount)` |
| Invoice | — | `openAmount` | `openAmount: Number(totalAmount) - Number(paidAmount || 0)` |
| Invoice | — | `isOverdue` | `isOverdue: status !== 'PAID' && dueDate < new Date()` |
| Quote | `date` | `issueDate` | `issueDate: quote.date` |
| Order | `date` | `orderDate` | `orderDate: order.date` |
| DeliveryNote | `date` | `deliveryDate` | `deliveryDate: dn.date` |
| CreditNote | `date` | `issueDate` | `issueDate: cn.date` |
| Reminder | — | `totalAmount` | Berechnen: fee + interestAmount |
| ALL Decimal | `Decimal` | `number` | `Number(field)` für alle Geldbeträge |

**Vorgehen**:
1. Öffne `response.mapper.ts`
2. Prüfe JEDE map-Funktion gegen `docs/contract.md` Sektion des jeweiligen Moduls
3. Ergänze fehlende Felder, ändere KEINE bestehenden die bereits korrekt sind
4. Teste mit `curl` oder Postman

---

### PRIO 2: Stats-Endpoints abgleichen (Kategorie A — 18 Module)

**Problem**: Frontend erwartet spezifische Stats-Feldnamen, Backend liefert andere.

Prüfe jeden `/stats` oder `/statistics` Endpoint gegen `docs/contract.md`:

| Modul | Endpoint | Frontend erwartet |
|---|---|---|
| Customers | `GET /customers/stats` | `{ total, active, prospects, totalRevenue }` |
| Suppliers | `GET /suppliers/stats` | `{ total, active, newSuppliers, totalValue, avgRating }` |
| Products | `GET /products/stats` | `{ total, active, inactive, services, lowStock }` |
| Projects | `GET /projects/stats` | `{ total, active, completed, paused }` |
| Tasks | `GET /tasks/stats` | `{ total, todo, inProgress, done, overdue }` |
| Employees | `GET /employees/stats` | `{ totalEmployees, activeEmployees, newThisMonth, departmentBreakdown[] }` |
| Invoices | `GET /invoices/stats` | `{ total, paid, pending, overdue }` |
| Quotes | `GET /quotes/stats` | `{ total, draft, sent, confirmed, rejected }` |
| Orders | `GET /orders/stats` | `{ total, draft, sent, confirmed, cancelled, totalValue }` |
| DeliveryNotes | `GET /delivery-notes/stats` | `{ total, draft, shipped, delivered }` |
| TimeEntries | `GET /time-entries/stats` | `TimeEntryStats` |
| TimeEntries | `GET /time-entries/approval-stats` | `{ pending, approved, rejected }` |
| Payroll | `GET /payroll/stats` | `{ totalGross, totalNet, totalAHV, totalBVG, employeeCount }` |
| EmployeeContracts | `GET /employee-contracts/stats` | `{ total, active, expiring, expired, totalSalary }` |
| TravelExpenses | `GET /travel-expenses/stats` | `{ totalAmount, pendingCount, approvedCount, totalCount }` |
| Contracts | `GET /contracts/stats` | `{ totalContracts, activeContracts, expiringThisMonth, totalValue, monthlyRecurring }` |
| Marketing Campaigns | `GET /marketing/campaigns/stats` | `{ totalCampaigns, activeCampaigns, totalBudget, totalSpent }` |
| Marketing Leads | `GET /marketing/leads/stats` | `{ totalLeads, qualifiedLeads, conversionRate }` |

**Vorgehen pro Modul**:
1. Öffne `backend/src/modules/{modul}/{modul}.service.ts`
2. Finde die `getStats()` Methode
3. Vergleiche Return-Felder mit obiger Tabelle
4. Passe NUR die Feldnamen an, ändere NICHT die Queries
5. Falls Methode fehlt: erstelle sie nach dem Pattern der bestehenden Module

---

### PRIO 3: Fehlende Sub-Endpoints

**Problem**: Frontend ruft Endpoints auf, die im Backend nicht existieren oder anders geroutet sind.

#### 3a. Orders: PATCH statt PUT
```ts
// Frontend nutzt PATCH /orders/:id (NICHT PUT)
// Prüfe ob orders.controller.ts @Patch(':id') hat
// Falls nur @Put(':id') → füge @Patch(':id') hinzu (gleiche Logic)
```

#### 3b. Payslips als eigene Routes
```ts
// Frontend ruft direkt auf:
// GET /payslips
// GET /payslips/:id
// POST /payslips/:id/send
//
// Prüfe ob das PayrollModule diese Routes bedient
// Falls unter /payroll/payslips → eigenen PayslipsController erstellen
// ODER Route-Alias in payroll.controller.ts
```

#### 3c. Quotes: convert-to-invoice
```ts
// Frontend erwartet: POST /quotes/:id/convert-to-invoice
// Prüfe ob das im quotes.controller.ts existiert
// Die Service-Methode existiert bereits (convertToInvoice in quotes.service.ts)
// → nur Controller-Route prüfen/ergänzen
```

#### 3d. Orders: create-delivery-note
```ts
// Frontend: POST /orders/:id/create-delivery-note
// Prüfe ob Route existiert
```

#### 3e. Invoices: open-items
```ts
// Frontend: GET /invoices/open-items
// Muss VOR /:id Route registriert sein (sonst 'open-items' wird als :id interpretiert)
```

#### 3f. Bank Import: PATCH ignore
```ts
// Frontend: PATCH /bank-import/transactions/:id/ignore
// Prüfe ob Controller @Patch hat
```

---

### PRIO 4: Listen-Response-Struktur (Kategorie E)

**Problem**: Manche Endpoints liefern Array statt `{ data[], total, page, pageSize }`.

Prüfe JEDEN `findAll()` Endpoint:
- Muss `{ data: T[], total, page, pageSize, totalPages }` zurückgeben
- NICHT einfach ein Array `T[]`

**Ausnahmen** (Array ist OK laut Contract):
- `GET /company/team` → `TeamMember[]`
- `GET /finance/bank-accounts` → `BankAccount[]`
- `GET /documents/folders` → `Folder[]`
- `GET /bom/templates` → `Bom[]`
- `GET /employees/departments` → `string[]`

---

### PRIO 5: Enum/Status-Konflikte (Kategorie B)

| Entity | Frontend erwartet | Prüfen |
|---|---|---|
| Task.status | `TODO, IN_PROGRESS, DONE, CANCELLED` | Prisma enum hat alle? |
| Order | `DRAFT, SENT, CONFIRMED, CANCELLED` | DocumentStatus enum passt? |
| Employee.status | `ACTIVE, INACTIVE, TERMINATED, VACATION, SICK` | EmployeeStatus enum? |
| Invoice | `DRAFT, SENT, PAID, OVERDUE, CANCELLED` | OVERDUE ist computed, nicht in DB |

**OVERDUE-Logik**: Frontend erwartet `isOverdue` als berechnetes Feld, NICHT als DB-Status.

---

### PRIO 6: Fehlende Module

#### 6a. Inventory-Modul (KOMPLETT FEHLEND)

Frontend erwartet (`docs/contract.md` §58):
```
GET    /inventory          → PaginatedResponse<InventoryItem>
GET    /inventory/:id      → InventoryItem
PUT    /inventory/:id      → InventoryItem
POST   /inventory/:id/adjust   → void
POST   /inventory/:id/transfer → void
DELETE /inventory/:id      → void
```

**Erstelle**:
```
backend/src/modules/inventory/
├── inventory.module.ts
├── inventory.controller.ts
├── inventory.service.ts
└── dto/
    ├── update-inventory.dto.ts
    ├── adjust-stock.dto.ts
    └── transfer-stock.dto.ts
```

**Pattern kopieren** von einem ähnlichen Modul (z.B. products).

**Prisma**: Prüfe ob `Inventory` / `InventoryItem` Tabelle in `schema.prisma` existiert.
Falls nicht → Migration erstellen (NUR lokal!).

**app.module.ts**: `InventoryModule` importieren.

#### 6b. WithholdingTax re-aktivieren

```ts
// app.module.ts Zeile ~51:
// import { WithholdingTaxModule } from './modules/withholding-tax/withholding-tax.module';
// → Kommentar entfernen

// Problem: "Decimal type issues"
// Fix: In withholding-tax.service.ts alle Decimal-Felder mit Number() wrappen
// ODER Prisma Decimal → Float mapping in schema.prisma
```

Frontend erwartet (`docs/contract.md` §40):
```
GET    /withholding-tax                   → PaginatedResponse<QstEmployee>
GET    /withholding-tax/employee/:id      → QstEmployee
GET    /withholding-tax/statistics        → QstStatistics
GET    /withholding-tax/report/:year/:month → QstMonthlyReport
POST   /withholding-tax/employee          → QstEmployee
PUT    /withholding-tax/employee/:id      → QstEmployee
POST   /withholding-tax/calculate         → void
POST   /withholding-tax/reconciliation    → void
```

---

### PRIO 7: Query-Filter (Kategorie D)

| Modul | Fehlender Filter | Frontend nutzt |
|---|---|---|
| Users | `isActive` | `?isActive=true` |
| Users | `role` | `?role=ADMIN` |
| Invoices | `overdue` | `?overdue=true` |
| Invoices | `customerId` | `?customerId=xxx` |
| TimeEntries | `employeeId` | `?employeeId=xxx` (bei /all) |
| Products | `categoryId` | `?categoryId=xxx` |
| Products | `isService` | `?isService=true` |

**Vorgehen**: In `findAll()` des jeweiligen Service die Query-Parameter als `where`-Bedingung hinzufügen.

---

### PRIO 8: Company-Felder (Kategorie C)

Frontend erwartet diese Felder auf `GET /company`:
```ts
{ id, name, slug, legalName, street, zipCode, city, country, phone, email,
  website, vatNumber, iban, bic, bankName, logoUrl, qrIban,
  defaultCurrency, fiscalYearStart, timezone, status, createdAt, updatedAt }
```

Prüfe ob alle Felder in der Company-Tabelle existieren. Falls nicht → Migration (nur lokal).

---

### PRIO 9: Kalender-Response (Kategorie F)

Frontend erwartet: `{ data: CalendarEvent[], total }` (Standard-Pagination)
Prüfe ob Calendar-Controller das Standard-Format liefert.

---

## CHECKLISTE VOR JEDEM COMMIT

- [ ] `npm run build` im `/backend` Verzeichnis erfolgreich
- [ ] Kein File in `/src` geändert
- [ ] Neue Endpoints entsprechen exakt `docs/contract.md`
- [ ] Bestehende funktionierende Endpoints unverändert
- [ ] Alle Decimal-Felder werden mit `Number()` gewrappt
- [ ] Guard-Stack auf jedem neuen Controller
- [ ] `@RequirePermissions` auf jeder neuen Route
- [ ] Stats-Feldnamen exakt wie in der Tabelle oben

---

## SMOKE-TEST nach Implementierung

```bash
# Auth
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.ch","password":"test1234"}'

# Speichere TOKEN aus Response

# Stats-Endpoints (Stichproben)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/customers/stats
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/invoices/stats
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/quotes/stats
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/orders/stats

# Listen-Format prüfen (muss {data:[],total,page,pageSize} sein)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/customers?page=1&pageSize=5

# Inventory (neues Modul)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/inventory

# WithholdingTax (re-aktiviert)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/withholding-tax
```

---

## REIHENFOLGE DER ABARBEITUNG

1. **Response-Mapper** (`response.mapper.ts`) — alle Feld-Mappings korrigieren
2. **Stats-Endpoints** — Feldnamen in allen 18 Services anpassen
3. **Fehlende Sub-Endpoints** — Routes ergänzen (PATCH orders, payslips, etc.)
4. **Listen-Response-Format** — `{ data[], total }` sicherstellen
5. **Query-Filter** — fehlende Filter in findAll() ergänzen
6. **Inventory-Modul** — neu erstellen
7. **WithholdingTax** — re-aktivieren + Decimal-Fix
8. **Company-Felder** — Schema prüfen/ergänzen
9. **Smoke-Test** — alle Endpoints durchlaufen

**Pro Schritt**: Branch erstellen, testen, committen. KEIN Big-Bang.
