# Final Vorgehen

# KONTEXT: Loomora ERP - Multi-Tenant NestJS Backend

Du arbeitest am Backend eines Schweizer Multi-Tenant ERP-Systems.

## TECH STACK
- **Backend**: NestJS (Verzeichnis `/backend`), Prisma 7, PostgreSQL
- **Frontend**: React + Vite + TanStack Query (Verzeichnis `/src`)
- **Server**: Linux srv1174249 unter `/var/www/loomora`
- **Webserver**: OpenLiteSpeed als Reverse-Proxy → Port 3001 (`/api`)
- **Auth**: JWT mit Access/Refresh Tokens, Multi-Tenant Company-Switching
- **DB-Config**: `prisma.config.ts` (nicht url in schema.prisma)

## ⛔ DESIGN & FRONTEND – NICHT ANFASSEN!

**Du darfst AUSSCHLIESSLICH Dateien im `/backend`-Verzeichnis bearbeiten.**

### VERBOTEN (absolut tabu):
- Jegliche Dateien in `/src` (Frontend, Components, Pages, Hooks, Styles)
- `index.css`, `tailwind.config.ts`, `vite.config.ts`, `index.html`
- Alles unter `src/components/`, `src/pages/`, `src/marketing/`, `src/hooks/`, `src/lib/`, `src/assets/`
- Layout, Design, Farben, Fonts, Animationen, CSS-Klassen
- React-Komponenten, Router, Context, UI-Logik

### ERLAUBT (nur diese Verzeichnisse):
- `backend/src/**` (Controller, Services, DTOs, Guards, Module)
- `backend/prisma/schema.prisma` (Schema-Änderungen)
- `backend/prisma/seed.ts` (Seed-Daten)
- `backend/package.json` (Backend-Dependencies)
- `backend/tsconfig.json`, `backend/nest-cli.json`
- Dateien in `docs/` (Dokumentation)

### FRONTEND-HOOKS NUR LESEN:
Die Dateien in `src/hooks/use-*.ts` dienen dir als **Referenz** um die erwartete API-Signatur zu verstehen.
**LIES sie, aber ÄNDERE sie NIEMALS.**

Wenn du feststellst, dass ein Frontend-Hook nicht zum Backend passt:
1. Passe das **Backend** an den Hook an (nicht umgekehrt!)
2. Dokumentiere Abweichungen in `docs/API_MISMATCHES.md`
3. Frag den User bevor du irgendetwas am Frontend änderst

### WARUM?
Das Frontend-Design (Branding, Layout, Animationen, Farben) wurde manuell perfektioniert.
Primärfarbe: #4610A3, Fonts: Sora/Inter/Space Grotesk, Glassmorphism, Glow-Effekte.
Jede unbeabsichtigte Änderung zerstört das visuelle Erscheinungsbild.

## MULTI-TENANT ARCHITEKTUR (KRITISCH!)
Jeder Request durchläuft diese Guard-Kette:
1. `JwtAuthGuard` → Token validieren
2. `CompanyGuard` → Company-Membership + Status ACTIVE prüfen
3. `SubscriptionGuard` → Abo-Status prüfen
4. `PermissionGuard` → Modul-Berechtigungen (`@RequirePermissions('module:read')`)
5. `PlanLimitsGuard` → Nutzungsgrenzen

**JEDE Datenbank-Query MUSS `companyId` als WHERE-Bedingung haben!**

Der eingeloggte User kommt via `@CurrentUser()` Decorator:
```typescript
@CurrentUser() user: CurrentUserPayload
// user.userId, user.companyId, user.permissions, user.isOwner
PRISMA SCHEMA
Das Schema hat ~3900 Zeilen mit ~80 Models. Lies backend/prisma/schema.prisma vollständig.

FRONTEND API-MUSTER
Alle Frontend-Hooks in src/hooks/ nutzen dieses Pattern:


// GET (paginiert): api.get<PaginatedResponse<T>>('/endpoint?page=1&pageSize=10&search=...')
// GET (einzeln): api.get<T>('/endpoint/:id')
// POST: api.post<T>('/endpoint', data)
// PUT: api.put<T>('/endpoint/:id', data)
// DELETE: api.delete('/endpoint/:id')
Pagination-Antwort: { data: T[], total: number, page: number, pageSize: number, totalPages: number }

RESPONSE MAPPER
Backend nutzt backend/src/common/mappers/response.mapper.ts um Prisma-Feldnamen an Frontend-Erwartungen anzupassen (z.B. totalAmount → total, date → issueDate).

REGELN
Immer companyId filtern – Keine Query ohne Tenant-Isolation
Guards anwenden: @UseGuards(JwtAuthGuard, CompanyGuard, SubscriptionGuard, PermissionGuard)
Permissions dekorieren: @RequirePermissions('modulname:read|write|delete')
Response-Format: Muss exakt zum Frontend-Hook passen
Nummern-Generierung: Counter auf Company-Model incrementen (wie in projects.service.ts)
Decimal-Felder: Immer Number() wrappen in Responses
Schweizer Standards: CHF, MwSt 8.1%/2.6%/3.8%, QR-Rechnung, OR-Buchhaltung
IMPLEMENTIERUNGSPLAN (Phasen)
Phase 1: Server analysieren & bestehende Module prüfen
Analysiere zuerst den Server (/var/www/loomora) und prüfe ob CRUD vollständig ist und Response-Format zum Frontend passt:

Modul	Backend-Pfad	Frontend-Hook (nur lesen!)	Endpoints prüfen
Customers	/modules/customers	src/hooks/use-customers.ts	GET/POST/PUT/DELETE + Stats
Suppliers	/modules/suppliers	src/hooks/use-suppliers.ts	GET/POST/PUT/DELETE
Products	/modules/products	src/hooks/use-products.ts	GET/POST/PUT/DELETE + Categories
Invoices	/modules/invoices	src/hooks/use-invoices.ts	GET/POST/PUT/DELETE + Items + Stats
Quotes	/modules/quotes	src/hooks/use-sales.ts	GET/POST/PUT/DELETE + Items
Orders	/modules/orders	src/hooks/use-sales.ts	GET/POST/PUT/DELETE + Items
Projects	/modules/projects	src/hooks/use-projects.ts	GET/POST/PUT/DELETE + Stats + Members
Employees	/modules/employees	src/hooks/use-employees.ts	GET/POST/PUT/DELETE + Stats + Departments
Tasks	/modules/tasks	src/hooks/use-tasks.ts	GET/POST/PUT/DELETE + Tags + Subtasks
Time Entries	/modules/time-entries	src/hooks/use-time-entries.ts	GET/POST/PUT/DELETE
Dashboard	/modules/dashboard	src/hooks/use-dashboard.ts	GET Stats/KPIs
Vorgehen pro Modul:

Lies den Frontend-Hook → verstehe erwartete API-Signatur
Lies den Backend-Controller + Service → vergleiche
Füge fehlende Endpoints hinzu
Prüfe Response-Mapping (Decimal→Number, Datum→ISO-String, Relations→Include)
Teste mit curl vom Server
Phase 2: Fehlende Module implementieren
Diese Frontend-Hooks existieren, aber Backend-Module könnten unvollständig sein:

Modul	Frontend-Hook (nur lesen!)	Backend nötig
Credit Notes	use-credit-notes.ts	CRUD + Items + Status-Flow
Delivery Notes	use-delivery-notes.ts	CRUD + Items + Status (DRAFT→SHIPPED→DELIVERED)
Purchase Orders	use-purchase-orders.ts	CRUD + Items + Supplier-Relation
Purchase Invoices	use-purchase-invoices.ts	CRUD + PDF Upload + Matching
Goods Receipts	use-goods-receipts.ts	CRUD + Items + Quality-Check
Payments	use-payments.ts	CRUD + Invoice/PurchaseInvoice Matching
Reminders	use-reminders.ts	CRUD + Mahngebühren + Status-Flow
Journal Entries	use-journal-entries.ts	CRUD + Lines (Soll/Haben) + Posting
Contracts	use-contracts.ts	CRUD + Renewal + Status-Flow
Calendar	use-calendar.ts	CRUD + Attendees + Reminders
Absences	use-absences.ts	CRUD + Approval-Flow
Bank Import	use-bank-import.ts	camt.054 Parse + Auto-Matching
Cash Book	use-cash-book.ts	CRUD + Closings + Register
Fixed Assets	use-fixed-assets.ts	CRUD + Depreciation-Berechnung
Budgets	use-budgets.ts	CRUD + Lines + Account-Relation
Cost Centers	use-cost-centers.ts	CRUD + Hierarchie
VAT Returns	use-vat-returns.ts	CRUD + Berechnung + ESTV-Form 050
BOM	use-bom.ts	CRUD + Items + Template-System
Production Orders	use-production-orders.ts	CRUD + Operations + Status-Flow
Calculations	use-calculations.ts	CRUD + Items + Markup-Logik
Quality Control	use-quality-control.ts	Checklisten + Checks + Results
Service Tickets	use-service-tickets.ts	CRUD + Reports + Assignment
Training	use-training.ts	CRUD + Participants + Certificates
Marketing/Campaigns	use-marketing.ts	CRUD + Leads + Activities
Recruiting	use-recruiting.ts	Jobs + Candidates + Interviews
E-Commerce	use-ecommerce.ts	Shop Orders + Reviews + Discounts
Swissdec	use-swissdec.ts	Submissions + Declarations + XML
Withholding Tax	use-withholding-tax.ts	QST Employee Data + Berechnung
Documents (DMS)	use-documents.ts	Folders + Upload + Versioning
Reports	use-reports.ts	Bilanz, ER, Offene Posten, etc.
Audit Log	use-audit-log.ts	Read-Only Log + 10J Retention
Finance Overview	use-finance.ts	Accounts + BankAccounts + BalanceSheet + PnL
Phase 3: Cross-Modul-Relationen & Business Logic
Nachdem CRUD steht, diese Verknüpfungen implementieren:

Angebot → Auftrag → Rechnung Flow: Quote bestätigen → Order erstellen → Invoice generieren
Bestellung → Wareneingang → Einkaufsrechnung: PO → GoodsReceipt → PurchaseInvoice
Rechnung → Zahlung → Mahnung: Auto-Overdue-Check, Teilzahlungen, Mahnlauf
Zeiterfassung → Rechnung: Billable Hours summieren → Invoice Items generieren
Projekt → Budget-Tracking: Spent aus TimeEntries + PurchaseOrders berechnen
BOM → Kalkulation → Angebot: Stückliste kalkulieren → Quote generieren
Produktion → Lager: ProductionOrder abschliessen → Inventory-Movement
Bank-Import → Auto-Matching: QR-Referenz matchen → Payment erstellen → Invoice PAID setzen
Journalbuchungen: Bei Invoice/Payment automatische Buchungssätze (Soll/Haben)
Lohnabrechnung → Buchung: Payslip finalisieren → Journal Entries
Phase 4: Infrastruktur & DevOps
Migration ausführen: npx prisma migrate deploy
Seed erweitern: Testdaten für alle Module
PM2 Neustart: pm2 restart all
OLS Cache leeren: /tmp/lshttpd/_reconfigure
Fehlerbehandlung: Konsistente Error-Responses mit HTTP-Status-Codes
Rate Limiting: Login/Register Endpoints absichern
File Upload: Multer für Dokumente/Belege konfigurieren
CHECKLISTE PRO MODUL
 Controller mit korrekten Guards & Permissions
 Service mit companyId-Filterung
 DTOs mit class-validator
 Response-Mapping passend zum Frontend-Hook
 Nummern-Auto-Generierung (Counter auf Company)
 Decimal → Number Konvertierung
 Relations via Prisma include
 Pagination mit createPaginatedResponse()
 Error Handling (NotFoundException, ForbiddenException)
 Module Registration in app.module.ts