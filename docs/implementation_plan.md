# Loomora ERP – Implementation Plan

> **Ziel**: Backend vervollständigen, damit das Frontend OHNE Änderungen funktioniert
> **Prinzip**: Contract-First, minimal-invasiv, keine Prod-DB-Änderungen

## Vorbedingungen

- [x] Phase 0: Stack erkannt (NestJS, Prisma, PostgreSQL)
- [x] Phase 1A: API Contract extrahiert → `docs/contract.md` (58 Module, ~350 Endpoints)
- [x] Phase 1B: Datenmodelle dokumentiert → `docs/models.md`
- [x] Phase 1C: Auth-Flow dokumentiert → `docs/auth.md`
- [x] Phase 1D: Gap Report erstellt → `docs/gaps.md`
- [ ] Phase 2: Dieser Plan
- [ ] Phase 3: Implementierung (STOPP – wartet auf Freigabe)

## No-Break Contract

Diese Dinge werden **NICHT geändert**:
- Kein File in `/src` wird angefasst
- Keine Umbenennung von Endpoints
- Keine Änderung der Pagination-Struktur
- Keine Änderung des Auth-Flows
- Keine Prod-DB-Migrations
- Kein Framework-Wechsel (bleibt NestJS + Prisma)

## Implementierungsreihenfolge

### Priorität 1: Auth & Core (existiert, Abgleich nötig)

| # | Modul | Status | Aktion |
|---|---|---|---|
| 1 | Auth | ✅ existiert | Abgleich: Login/Register/Refresh/2FA Response-Format |
| 2 | Company | ✅ existiert | Abgleich: GET/PUT `/company` Felder |
| 3 | Settings | ✅ existiert | Abgleich: CompanySettings Felder |
| 4 | Users | ✅ existiert | Abgleich: User-Format, Permissions-Endpoint |
| 5 | Roles | ✅ existiert | Abgleich: Role-Format |

### Priorität 2: Sales-Pipeline

| # | Modul | Status | Aktion |
|---|---|---|---|
| 6 | Customers | ✅ existiert | Stats-Felder prüfen, Contacts-Sub-Endpoints |
| 7 | Products | ✅ existiert | adjust-stock, categories, Stats |
| 8 | Quotes | ✅ existiert | convert-to-order, send, Stats |
| 9 | Orders | ✅ existiert | PATCH (nicht PUT!), create-invoice, create-delivery-note, Stats |
| 10 | Invoices | ✅ existiert | payment, send, cancel, open-items, Stats |
| 11 | DeliveryNotes | ✅ existiert | from-order, Stats |
| 12 | CreditNotes | ✅ existiert | from-invoice |
| 13 | Reminders | ✅ existiert | batch, send, statistics, overdue-invoices |

### Priorität 3: Purchase

| # | Modul | Status | Aktion |
|---|---|---|---|
| 14 | Suppliers | ✅ existiert | Stats-Felder prüfen |
| 15 | PurchaseOrders | ✅ existiert | send, statistics |
| 16 | PurchaseInvoices | ✅ existiert | from-purchase-order, extract-ocr, approve, statistics |
| 17 | GoodsReceipts | ✅ existiert | quality-check, statistics, pending |

### Priorität 4: HR

| # | Modul | Status | Aktion |
|---|---|---|---|
| 18 | Employees | ✅ existiert | Stats, departments-Endpoint |
| 19 | Departments | ✅ existiert | CRUD |
| 20 | Absences | ✅ existiert | CRUD |
| 21 | TimeEntries | ✅ existiert | all, stats, approval-stats, approve |
| 22 | EmployeeContracts | ✅ existiert | stats, renew, terminate |
| 23 | Payroll | ✅ existiert | complete, stats, payslips |
| 24 | TravelExpenses | ✅ existiert | approve, reject, mark-paid, stats |
| 25 | Swissdec | ✅ existiert | validate, submit, certificate, statistics |
| 26 | GavMetallbau | ✅ existiert | settings, compliance, calculate-salary |

### Priorität 5: Finance

| # | Modul | Status | Aktion |
|---|---|---|---|
| 27 | Finance | ✅ existiert | accounts, bank-accounts, balance-sheet, income-statement |
| 28 | JournalEntries | ✅ existiert | post, reverse, trial-balance, account-balance |
| 29 | CostCenters | ✅ existiert | hierarchy, report |
| 30 | Budgets | ✅ existiert | comparison, approve, activate |
| 31 | CashBook | ✅ existiert | registers, transactions, daily-summary, closing |
| 32 | VatReturns | ✅ existiert | calculate, submit, export-xml, summary |
| 33 | FixedAssets | ✅ existiert | depreciation-schedule, run-depreciation, dispose, statistics |
| 34 | Payments | ✅ existiert | statistics, match-qr, reconcile |

### Priorität 6: Production & Service

| # | Modul | Status | Aktion |
|---|---|---|---|
| 35 | Bom | ✅ existiert | templates, duplicate |
| 36 | ProductionOrders | ✅ existiert | book-time, complete-operation, statistics, capacity |
| 37 | Calculations | ✅ existiert | transfer-to-quote |
| 38 | QualityControl | ✅ existiert | checklists, checks, complete, templates, statistics |
| 39 | ServiceTickets | ✅ existiert | report, schedule, statistics, upcoming-maintenance |

### Priorität 7: Erweiterte Module

| # | Modul | Status | Aktion |
|---|---|---|---|
| 40 | Calendar | ✅ existiert | CRUD mit speziellen Filtern |
| 41 | Tasks | ✅ existiert | Stats |
| 42 | Projects | ✅ existiert | members, milestones, activity, duplicate, Stats |
| 43 | Reports | ✅ existiert | available, generate + 10 Spezial-Reports |
| 44 | Marketing | ✅ existiert | campaigns, leads, activities, convert, email-campaigns |
| 45 | Ecommerce | ✅ existiert | orders, discounts, reviews |
| 46 | Contracts | ✅ existiert | renew, terminate, duplicate, expiring, stats |
| 47 | Recruiting | ✅ existiert | jobs, candidates, pipeline, interviews, stats |
| 48 | Training | ✅ existiert | participants, complete, stats, upcoming, employee |
| 49 | BankImport | ✅ existiert | camt054, reconcile, auto-reconcile, suggestions |
| 50 | Documents | ✅ existiert | folders, upload, versions, archive, move, share, statistics |
| 51 | Messages | ✅ existiert | CRUD |
| 52 | Notifications | ✅ existiert | unread-count, read, read-all |
| 53 | AuditLog | ✅ existiert | entity, statistics, export |

### Priorität 8: Fehlende Module

| # | Modul | Status | Aktion |
|---|---|---|---|
| 54 | **Inventory** | 🔴 FEHLT | Neues Modul erstellen |
| 55 | **WithholdingTax** | 🔴 DEAKTIVIERT | Decimal-Issue fixen, re-aktivieren |
| 56 | Mail | ✅ existiert | account, test |
| 57 | CompanyTeam | ✅ existiert (in Company) | team sub-routes |

## DIFF-Checkliste

### Neue Dateien (nur bei fehlenden Modulen)

```
backend/src/modules/inventory/             → neues Modul (Controller, Service, Module, DTOs)
```

### Minimal geänderte Dateien

```
backend/src/app.module.ts                 → Inventory importieren, WithholdingTax re-aktivieren
backend/src/modules/*/controller.ts        → Response-Format an Frontend anpassen (Stats etc.)
backend/src/modules/*/service.ts          → Fehlende Sub-Endpoints implementieren
backend/src/common/mappers/response.mapper.ts → Feldnamen-Mapping korrigieren
```

### Unangetastet

```
src/**/*                                  → KEIN FRONTEND-CHANGE
backend/prisma/schema.prisma             → NUR wenn absolut nötig für fehlende Tabellen
backend/src/main.ts                       → bleibt
backend/src/prisma/*                      → bleibt
backend/src/common/*                      → bleibt (ausser Mapper-Fix)
backend/src/modules/auth/*               → bleibt (ausser Response-Format-Fix)
```

## ⛔ PHASE 2 ENDE — STOPP

**Noch kein Code implementiert. Nur Dokumentation erstellt.**

Nächster Schritt: Phase 3 (Implementierung) — NUR auf Freigabe.

Für Phase 3 gilt:
1. Alle Änderungen NUR im `/backend` Verzeichnis
2. Cursor-Agent auf dem Server führt die Implementierung durch
3. Lovable erstellt nur die Instruktionen/Dokumentation
