# 🔍 Loomora ERP — Frontend ↔ Backend Vergleichs-Checkliste

> Erstellt: 2026-02-12
> Zweck: Jedes Modul zeigt **was das Frontend erwartet** vs. **was das Backend liefert** — mit klaren ⚠️ MISMATCH Markierungen
> Quellen: Hook-Dateien (`src/hooks/`), Controller (`backend/src/modules/`), Services, DTOs

---

## 📖 Die 5 Bausteine der Kommunikation

| # | Baustein | Was ist das? | Beispiel |
|---|----------|-------------|----------|
| 1 | **API-Endpunkte** | "Türen" im Backend | `GET /api/invoices` |
| 2 | **API-Client** | Der "Bote" im Frontend | `src/lib/api.ts` ✅ fertig |
| 3 | **Hooks** | Frontend-Funktionen die Daten holen | `useInvoices()` |
| 4 | **Daten-Typen** | Der "Vertrag" — welche Felder? | `{ id, total, status }` |
| 5 | **Auth/Token** | Der "Ausweis" | `Bearer <token>` ✅ fertig |

---

## 📋 Globale Prüfpunkte

| Prüfpunkt | Frontend erwartet | Backend liefert | Status |
|-----------|------------------|-----------------|--------|
| Pagination | `{ data[], total, page, pageSize, totalPages }` | `createPaginatedResponse()` — prüfen ob `totalPages` enthalten | ⚠️ PRÜFEN |
| Auth Header | `Bearer <token>` | `JwtAuthGuard` | ✅ OK |
| Fehler-Format | `{ error, message }` | NestJS Default | ✅ OK |
| API-Prefix | Hooks rufen `/invoices` auf, `api.ts` fügt `/api` hinzu | Controller ohne Prefix, `app.setGlobalPrefix('api')` | ✅ OK |
| Feld-Mapping | camelCase erwartet | `response.mapper.ts` vorhanden | ✅ OK |

---

## 🏢 MODUL: Rechnungen (Invoices)

### Baustein 1: API-Endpunkte

| Frontend Hook | Methode | Pfad Frontend | Pfad Backend Controller | Status |
|--------------|---------|--------------|------------------------|--------|
| `useInvoices()` | GET | `/invoices` | `GET /invoices` | ✅ OK |
| `useInvoice(id)` | GET | `/invoices/:id` | `GET /invoices/:id` | ✅ OK |
| `useInvoiceStats()` | GET | `/invoices/stats` | `GET /invoices/stats` | ✅ OK |
| `useCreateInvoice()` | POST | `/invoices` | `POST /invoices` | ✅ OK |
| `useUpdateInvoice()` | PUT | `/invoices/:id` | `PUT /invoices/:id` | ✅ OK |
| `useDeleteInvoice()` | DELETE | `/invoices/:id` | `DELETE /invoices/:id` | ✅ OK |
| `useRecordPayment()` | POST | `/invoices/:id/payment` | `POST /invoices/:id/payment` | ✅ OK |
| `useSendInvoice()` | POST | `/invoices/:id/send` | `POST /invoices/:id/send` | ✅ OK |
| `useCancelInvoice()` | POST | `/invoices/:id/cancel` | `POST /invoices/:id/cancel` | ✅ OK |
| `useOpenItems()` | GET | `/invoices/open-items` | `GET /invoices/open-items` | ✅ OK |

### Baustein 4: Daten-Typen Vergleich

| Feld | Frontend (`use-invoices.ts`) | Frontend (`use-sales.ts`) | Backend Response | Status |
|------|----------------------------|--------------------------|-----------------|--------|
| `total` | ✅ `total: number` | ✅ `total: number` | Backend DB hat `totalAmount` → Mapper macht `total` | ✅ OK (via Mapper) |
| `paidAmount` | ✅ optional `paidAmount?: number` | ✅ `paidAmount: number` | ✅ vorhanden | ✅ OK |
| `openAmount` | ❌ nicht definiert | ✅ `openAmount?: number` | ✅ computed | ⚠️ MISMATCH — `use-invoices.ts` fehlt `openAmount` |
| `isOverdue` | ❌ nicht definiert | ✅ `isOverdue?: boolean` | ✅ computed | ⚠️ MISMATCH — `use-invoices.ts` fehlt `isOverdue` |
| `qrReference` | ❌ nicht definiert | ✅ `qrReference?: string` | ✅ vorhanden | ⚠️ MISMATCH — `use-invoices.ts` fehlt `qrReference` |
| `paidDate` | ❌ nicht definiert | ✅ `paidDate?: string` | ✅ vorhanden | ⚠️ MISMATCH |
| `position` (Item) | ❌ nicht in Item-Interface | ✅ `position: number` | ✅ Backend DTO hat `position` | ⚠️ MISMATCH |
| `vatRate` (Item) | ✅ `vatRate: number` | ❌ nicht vorhanden | ❌ Backend DTO hat nur globale Rate | ⚠️ MISMATCH |
| `discount` (Item) | ❌ nicht vorhanden | ✅ `discount?: number` | ✅ Backend DTO hat `discount` | ⚠️ MISMATCH |

### ⚠️ KRITISCH: Doppelte Hooks

| Problem | Details |
|---------|---------|
| **DUPLIKAT** | `use-invoices.ts` UND `use-sales.ts` definieren BEIDE `useInvoices`, `useInvoice`, `useCreateInvoice`, `useUpdateInvoice` |
| **Unterschiedliche Typen** | `use-invoices.ts` hat `status: 'DRAFT' \| 'SENT' \| 'PAID' \| 'OVERDUE' \| 'CANCELLED'`, `use-sales.ts` hat `status: string` |
| **Aktion nötig** | Konsolidieren zu einer einzigen Datei, oder klären welche benutzt wird |

### Stats-Vergleich

| Feld | Frontend erwartet (`useInvoiceStats`) | Backend liefert (`getStats`) | Status |
|------|--------------------------------------|------------------------------|--------|
| `total` | ✅ `total: number` | ✅ `total` (Summe aller Rechnungsbeträge) | ✅ OK |
| `paid` | ✅ `paid: number` | ✅ `paid` (Summe bezahlter) | ✅ OK |
| `pending` | ✅ `pending: number` | ✅ `pending` (Summe SENT) | ✅ OK |
| `overdue` | ✅ `overdue: number` | ✅ `overdue` (Summe überfällig) | ✅ OK |

---

## 📊 MODUL: Aufgaben (Tasks) ⚠️ KRITISCH

### Baustein 1: API-Endpunkte

| Frontend Hook | Methode | Pfad | Backend Controller | Status |
|--------------|---------|------|-------------------|--------|
| `useTasks()` | GET | `/tasks` | `GET /tasks` | ✅ OK |
| `useTask(id)` | GET | `/tasks/:id` | `GET /tasks/:id` | ✅ OK |
| `useTaskStats()` | GET | `/tasks/stats` | `GET /tasks/stats` | ✅ OK |
| `useCreateTask()` | POST | `/tasks` | `POST /tasks` | ✅ OK |
| `useUpdateTask()` | PUT | `/tasks/:id` | `PUT /tasks/:id` | ✅ OK |
| `useDeleteTask()` | DELETE | `/tasks/:id` | `DELETE /tasks/:id` | ✅ OK |
| ❌ Kein Hook | — | — | `GET /tasks/:id/subtasks` | ⚠️ FEHLT im Frontend |
| ❌ Kein Hook | — | — | `POST /tasks/:id/subtasks` | ⚠️ FEHLT im Frontend |
| ❌ Kein Hook | — | — | `PATCH /tasks/:id/subtasks/:subtaskId` | ⚠️ FEHLT im Frontend |
| ❌ Kein Hook | — | — | `DELETE /tasks/:id/subtasks/:subtaskId` | ⚠️ FEHLT im Frontend |
| ❌ Kein Hook | — | — | `GET /tasks/:id/comments` | ⚠️ FEHLT im Frontend |
| ❌ Kein Hook | — | — | `POST /tasks/:id/comments` | ⚠️ FEHLT im Frontend |
| ❌ Kein Hook | — | — | `DELETE /tasks/:id/comments/:commentId` | ⚠️ FEHLT im Frontend |
| ❌ Kein Hook | — | — | `GET /tasks/:id/attachments` | ⚠️ FEHLT im Frontend |
| ❌ Kein Hook | — | — | `POST /tasks/:id/attachments` | ⚠️ FEHLT im Frontend |
| ❌ Kein Hook | — | — | `DELETE /tasks/:id/attachments/:attachmentId` | ⚠️ FEHLT im Frontend |

### Baustein 4: Daten-Typen Vergleich

| Feld | Frontend (`use-tasks.ts`) | Backend DTO/Service | Status |
|------|--------------------------|---------------------|--------|
| `status` | `'TODO' \| 'IN_PROGRESS' \| 'DONE' \| 'CANCELLED'` | `'TODO' \| 'IN_PROGRESS' \| 'REVIEW' \| 'DONE'` | ⚠️ **MISMATCH** — Frontend hat `CANCELLED`, Backend hat `REVIEW` |
| `completedAt` | ✅ `completedAt?: string` | ❌ nicht in DTO/Service | ⚠️ MISMATCH |
| `parentId` | ✅ `parentId?: string` | ❌ nicht in DTO — Backend nutzt separate `subtasks` Tabelle | ⚠️ MISMATCH — unterschiedliches Konzept |
| `comments[]` | ✅ als Relation definiert | ✅ Backend liefert bei `findById` | ✅ OK (aber kein CRUD-Hook) |
| `attachments[]` | ✅ als Relation definiert | ✅ Backend liefert bei `findById` | ✅ OK (aber kein CRUD-Hook) |
| `subtasks[]` | ✅ als `Task[]` definiert | ❌ Backend hat eigenes `Subtask` Modell (nicht Task) | ⚠️ **MISMATCH** — Frontend erwartet `Task[]`, Backend liefert `Subtask[]` mit `{ id, title, isCompleted }` |
| `estimatedHours` | ❌ nicht im Interface | ✅ Backend DTO hat `estimatedHours` | ⚠️ MISMATCH |

### Stats-Vergleich

| Feld | Frontend erwartet (`useTaskStats`) | Backend liefert (`getStats`) | Status |
|------|-----------------------------------|------------------------------|--------|
| `total` | ✅ | ✅ | ✅ OK |
| `todo` | ✅ | ✅ | ✅ OK |
| `inProgress` | ✅ | ✅ | ✅ OK |
| `done` | ✅ | ✅ | ✅ OK |
| `overdue` | ✅ erwartet | ❌ **NICHT geliefert** | ⚠️ **MISMATCH** |
| `review` | ❌ nicht erwartet | ✅ Backend liefert `review` | ⚠️ **MISMATCH** |

---

## 📦 MODUL: Produkte (Products)

### Baustein 1: API-Endpunkte

| Frontend Hook | Methode | Pfad | Backend Controller | Status |
|--------------|---------|------|-------------------|--------|
| `useProducts()` | GET | `/products` | `GET /products` | ✅ OK |
| `useProduct(id)` | GET | `/products/:id` | `GET /products/:id` | ✅ OK |
| `useProductStats()` | GET | `/products/stats` | `GET /products/stats` | ✅ OK |
| `useCreateProduct()` | POST | `/products` | `POST /products` | ✅ OK |
| `useUpdateProduct()` | PUT | `/products/:id` | `PUT /products/:id` | ✅ OK |
| `useDeleteProduct()` | DELETE | `/products/:id` | `DELETE /products/:id` | ✅ OK |
| `useAdjustStock()` | POST | `/products/:id/adjust-stock` | `POST /products/:id/adjust-stock` | ✅ OK |
| `useProductCategories()` | GET | `/products/categories` | `GET /products/categories` | ✅ OK |
| `useCreateProductCategory()` | POST | `/products/categories` | `POST /products/categories` | ✅ OK |

### Stats-Vergleich

| Feld | Frontend erwartet | Backend liefert | Status |
|------|------------------|-----------------|--------|
| `total` | ✅ | ✅ | ✅ OK |
| `active` | ✅ | ✅ | ✅ OK |
| `inactive` | ✅ | ✅ | ✅ OK |
| `services` | ✅ | ✅ | ✅ OK |
| `lowStock` | ✅ | ⚠️ Nicht explizit in getStats sichtbar — prüfen | ⚠️ PRÜFEN |

### Baustein 4: Daten-Typen

| Feld | Frontend (`types/api.ts`) | Backend | Status |
|------|--------------------------|---------|--------|
| `sku` | ✅ | ✅ | ✅ OK |
| `salePrice` | ✅ | ✅ | ✅ OK |
| `purchasePrice` | ✅ | ✅ | ✅ OK |
| `stockQuantity` | ✅ | ✅ | ✅ OK |
| `margin` | ✅ computed | ❌ Backend berechnet nicht | ⚠️ MISMATCH — Frontend erwartet `margin`, Backend liefert es nicht |
| `availableStock` | ✅ computed | ❌ Backend berechnet nicht | ⚠️ MISMATCH |

---

## 💼 MODUL: Kunden (Customers)

### Baustein 1: API-Endpunkte

| Frontend Hook | Methode | Pfad | Backend | Status |
|--------------|---------|------|---------|--------|
| `useCustomers()` | GET | `/customers` | ✅ | ✅ OK |
| `useCustomer(id)` | GET | `/customers/:id` | ✅ | ✅ OK |
| `useCustomerStats()` | GET | `/customers/stats` | ✅ | ✅ OK |
| `useCreateCustomer()` | POST | `/customers` | ✅ | ✅ OK |
| `useUpdateCustomer()` | PUT | `/customers/:id` | ✅ | ✅ OK |
| `useDeleteCustomer()` | DELETE | `/customers/:id` | ✅ | ✅ OK |
| `useCustomerContacts()` | GET | `/customers/:id/contacts` | ✅ | ✅ OK |
| `useCreateCustomerContact()` | POST | `/customers/:id/contacts` | ✅ | ✅ OK |
| `useUpdateCustomerContact()` | PUT | `/customers/:id/contacts/:contactId` | ✅ | ✅ OK |
| `useDeleteCustomerContact()` | DELETE | `/customers/:id/contacts/:contactId` | ✅ | ✅ OK |

### Stats-Vergleich

| Feld | Frontend erwartet | Backend liefert | Status |
|------|------------------|-----------------|--------|
| `total` | ✅ | ✅ | ✅ OK |
| `active` | ✅ | ✅ | ✅ OK |
| `prospects` | ✅ | ✅ | ✅ OK |
| `totalRevenue` | ✅ | ✅ | ✅ OK |

---

## 💼 MODUL: Lieferanten (Suppliers)

### Stats-Vergleich

| Feld | Frontend erwartet | Backend liefert | Status |
|------|------------------|-----------------|--------|
| `total` | ✅ | ✅ | ✅ OK |
| `active` | ✅ | ✅ | ✅ OK |
| `newSuppliers` | ✅ | ✅ | ✅ OK |
| `totalValue` | ✅ | ✅ | ✅ OK |
| `avgRating` | ✅ | ✅ (hardcoded 0) | ⚠️ Dummy-Wert |

---

## 👥 MODUL: Mitarbeiter (Employees) ⚠️

### Stats-Vergleich

| Feld | Frontend erwartet (`EmployeeStats`) | Backend liefert | Status |
|------|--------------------------------------|-----------------|--------|
| `totalEmployees` | ✅ | ❌ Backend liefert `total` | ⚠️ **MISMATCH** — Feldname |
| `activeEmployees` | ✅ | ❌ Backend liefert `active` | ⚠️ **MISMATCH** — Feldname |
| `newThisMonth` | ✅ | ❌ Backend liefert `vacation` und `sick` stattdessen | ⚠️ **MISMATCH** — komplett anderes Format |
| `departmentBreakdown[]` | ✅ | ❌ nicht vorhanden | ⚠️ **MISMATCH** — fehlt komplett |

---

## 💰 MODUL: Angebote (Quotes)

### Stats-Vergleich

| Feld | Frontend erwartet (`useQuoteStats`) | Backend liefert | Status |
|------|-------------------------------------|-----------------|--------|
| `total` | ✅ | ✅ (aber als Summe in CHF, nicht Anzahl!) | ⚠️ **MISMATCH** — Frontend meint Anzahl, Backend liefert CHF-Summe |
| `draft` | ✅ | ✅ | ✅ OK |
| `sent` | ✅ | ✅ | ✅ OK |
| `confirmed` | ✅ | ✅ | ✅ OK |
| `rejected` | ✅ | ❌ Backend zählt `CANCELLED` statt `REJECTED` | ⚠️ **MISMATCH** — `rejected` count zählt `CANCELLED` Status |

---

## 📦 MODUL: Aufträge (Orders)

### Stats-Vergleich

| Feld | Frontend erwartet (`useOrderStats`) | Backend liefert | Status |
|------|-------------------------------------|-----------------|--------|
| `total` | ✅ (Anzahl) | ✅ (Anzahl) | ✅ OK |
| `draft` | ✅ | ✅ | ✅ OK |
| `sent` | ✅ | ✅ | ✅ OK |
| `confirmed` | ✅ | ✅ | ✅ OK |
| `cancelled` | ✅ | ✅ | ✅ OK |
| `totalValue` | ✅ | ✅ | ✅ OK |

---

## 📊 MODUL: Projekte (Projects)

### Baustein 1: API-Endpunkte

| Frontend Hook | Methode | Pfad | Backend | Status |
|--------------|---------|------|---------|--------|
| `useProjects()` | GET | `/projects` | ✅ | ✅ OK |
| `useProject(id)` | GET | `/projects/:id` | ✅ | ✅ OK |
| `useProjectStats()` | GET | `/projects/stats` | ✅ | ✅ OK |
| `useCreateProject()` | POST | `/projects` | ✅ | ✅ OK |
| `useUpdateProject()` | PUT | `/projects/:id` | ✅ | ✅ OK |
| `useDeleteProject()` | DELETE | `/projects/:id` | ✅ | ✅ OK |
| `useDuplicateProject()` | POST | `/projects/:id/duplicate` | ✅ | ✅ OK |

### Stats-Vergleich

| Feld | Frontend erwartet | Backend liefert | Status |
|------|------------------|-----------------|--------|
| `total` | ✅ | ✅ | ✅ OK |
| `active` | ✅ | ✅ | ✅ OK |
| `completed` | ✅ | ✅ | ✅ OK |
| `paused` | ✅ | ✅ | ✅ OK |

---

## 📝 MODUL: Lieferscheine (Delivery Notes)

### Stats-Vergleich

| Feld | Frontend erwartet | Backend liefert | Status |
|------|------------------|-----------------|--------|
| `total` | ✅ | ✅ | ✅ OK |
| `draft` | ✅ | ✅ | ✅ OK |
| `shipped` | ✅ | ✅ | ✅ OK |
| `delivered` | ✅ | ✅ | ✅ OK |

---

## 📝 MODUL: Verträge (Contracts)

### Endpunkte — alle ✅ OK
- CRUD ✅, `/contracts/:id/renew` ✅, `/contracts/:id/terminate` ✅, `/contracts/expiring` ✅, `/contracts/stats` ✅, `/contracts/:id/duplicate` ✅

---

## 📁 MODUL: Dokumente (Documents/DMS)

### Endpunkte — alle ✅ OK
- Ordner CRUD ✅, Dokument Upload/CRUD ✅, Versioning ✅, Archivierung ✅, Move ✅, Share ✅, Statistics ✅

---

## 💵 MODUL: Buchhaltung (Finance)

### Endpunkte — alle ✅ OK
- Accounts CRUD ✅, Bank Accounts ✅, Balance Sheet ✅, Income Statement ✅, Monthly Summary ✅

---

## ⏱ MODUL: Zeiterfassung (Time Entries)

### Endpunkte — alle ✅ OK
- CRUD ✅, Stats ✅, Approval ✅, All entries ✅

---

## ⚙️ MODUL: Einstellungen (Settings)

### Endpunkte — alle ✅ OK
- GET/PUT Settings ✅, SMTP Test ✅, API Key Generation ✅

---

# 🚨 ZUSAMMENFASSUNG: ALLE 33 BESTÄTIGTEN MISMATCHES (Cursor-Audit 12.02.2026)

> **Quelle:** Cursor-Backend-Analyse aller Controller, Services und DTOs
> **Status:** Alle 33 Punkte vom Backend-Agent bestätigt. Kein Frontend-Code wird angefasst.

---

## A. Stats-Feldnamen-Mismatches — 18 Module

| # | Modul | Frontend erwartet | Backend liefert | Schwere |
|---|-------|-------------------|-----------------|---------|
| 1 | **Employee Stats** | `totalEmployees`, `activeEmployees`, `newThisMonth`, `departmentBreakdown[]` | `total`, `active`, `onLeave`, `newHires` | 🔴 KRITISCH |
| 2 | **Time Entry Stats** | `todayHours`, `weekHours`, `monthHours`, `billableHours`, `projectBreakdown[]` | `totalHours`, `billableHours`, `weekHours`, `topProjects` | 🔴 KRITISCH |
| 3 | **Reminder Stats** | `totalReminders`, `pendingReminders`, `sentReminders`, `totalOutstanding`, `byLevel[]` | `total`, `pending`, `sent`, `totalAmount` | 🔴 KRITISCH |
| 4 | **Purchase Order Stats** | `totalOrders`, `draftOrders`, `sentOrders`, `confirmedOrders`, `receivedOrders`, `totalValue`, `pendingValue` | `total`, `draft`, `sent`, `confirmed`, `received`, `totalValue` | 🔴 KRITISCH |
| 5 | **Purchase Invoice Stats** | `totalInvoices`, `pendingInvoices`, `approvedInvoices`, `paidInvoices`, `overdueInvoices`, `totalValue`, `pendingValue`, `overdueValue` | `total`, `pending`, `approved`, `paid`, `overdue`, `totalValue` | 🔴 KRITISCH |
| 6 | **Payment Stats** | `totalIncoming`, `totalOutgoing`, `pendingPayments`, `completedThisMonth` | `total`, `incoming`, `outgoing`, `pending` | 🔴 KRITISCH |
| 7 | **Bank Import Stats** | `pendingTransactions`, `reconciledToday`, `totalImported`, `lastImportDate` | `total`, `pending`, `reconciled`, `lastImport` | 🔴 KRITISCH |
| 8 | **Service Ticket Stats** | `totalTickets`, `openTickets`, `scheduledTickets`, `completedThisMonth`, `averageResolutionTime` | `total`, `open`, `scheduled`, `completed` | 🔴 KRITISCH |
| 9 | **Production Stats** | `totalOrders`, `inProgress`, `completed`, `utilizationRate` | `total`, `planned`, `inProgress`, `completed` | 🔴 KRITISCH |
| 10 | **Quality Stats** | `totalChecks`, `passedChecks`, `failedChecks`, `passRate`, `pendingChecks` | `total`, `passed`, `failed`, `passRate` | 🔴 KRITISCH |
| 11 | **Recruiting Stats** | `openPositions`, `totalCandidates`, `interviewsThisWeek`, `averageTimeToHire`, `offerAcceptanceRate` | `openJobs`, `candidates`, `interviews`, `hires` | 🔴 KRITISCH |
| 12 | **Training Stats** | `totalTrainings`, `upcomingTrainings`, `completedThisYear`, `totalParticipants`, `averageRating`, `totalCosts` | `total`, `upcoming`, `completed`, `participants` | 🔴 KRITISCH |
| 13 | **E-Commerce Stats** | `totalRevenue`, `averageOrderValue`, `pendingReviews`, `activeDiscounts` | `monthlyRevenue` (kein rename), kein `averageOrderValue`, `pending` statt `pendingReviews`, kein `activeDiscounts` | 🔴 KRITISCH |
| 14 | **Fixed Asset Stats** | `totalAssets`, `totalValue`, `totalDepreciation`, `categoryBreakdown[]` | `total`, `activeValue`, `depreciation`, `categories` | 🔴 KRITISCH |
| 15 | **Marketing Stats** | `totalCampaigns`, `activeCampaigns`, `totalBudget`, `totalSpent`, `totalLeads`, `qualifiedLeads`, `conversionRate` | Feldnamen müssen angepasst werden | 🔴 KRITISCH |
| 16 | **Document Stats** | `totalDocuments`, `totalFolders`, `totalSize`, `recentUploads`, `archivedDocuments` | `totalDocuments`, `totalSize`, `totalSizeFormatted`, `byMimeType` — 3 Felder fehlen | 🔴 KRITISCH |
| 17 | **Audit Log Stats** | `totalEntries`, `todayEntries`, `topActions`, `topUsers`, `topEntities` | `totalLogs`, `period`, `byAction`, `byModule`, `topUsers` — komplett andere Namen | 🔴 KRITISCH |
| 18 | **Task Stats** | `total`, `todo`, `inProgress`, `done`, `overdue` | `total`, `todo`, `inProgress`, `review`, `done` — `overdue` fehlt | 🔴 KRITISCH |

---

## B. Enum/Status-Mismatch — 1

| # | Problem | Schwere |
|---|---------|---------|
| 19 | **Task Status:** Frontend hat `CANCELLED`, Backend hat `REVIEW` — gegenseitig unbekannt | 🔴 KRITISCH |

---

## C. Fehlende Schema-Felder — 3

| # | Feld | Status | Schwere |
|---|------|--------|---------|
| 20 | `Company.qrIban` | Im Customer-Model, nicht in Company | 🟡 MITTEL |
| 21 | `Company.defaultCurrency` | In CompanySettings als `currency`, nicht in Company | 🟡 MITTEL |
| 22 | `Company.fiscalYearStart` | Nirgendwo im Schema | 🟡 MITTEL |

---

## D. Fehlende Query-Filter — 2

| # | Problem | Schwere |
|---|---------|---------|
| 23 | **Users:** `role` Filter — Frontend sendet, Backend ignoriert | 🟡 MITTEL |
| 24 | **Users:** `isActive` Filter — Frontend sendet, Backend ignoriert | 🟡 MITTEL |

---

## E. Listen-Response-Mismatches — 3

| # | Problem | Schwere |
|---|---------|---------|
| 25 | **Invoices List:** `items[]` fehlt (nur `_count.items`) | 🟡 MITTEL |
| 26 | **Quotes List:** `items[]` fehlt (nur `_count.items`) | 🟡 MITTEL |
| 27 | **Orders List:** `items[]` fehlt (nur `_count.items`) | 🟡 MITTEL |

---

## F. Calendar Response-Struktur — 5

| # | Frontend erwartet | Backend liefert | Problem | Schwere |
|---|-------------------|-----------------|---------|---------|
| 28 | `startDate` | `date` + `startTime` | Struktur-Mismatch | 🔴 KRITISCH |
| 29 | `endDate` | `date` + `endTime` | Struktur-Mismatch | 🔴 KRITISCH |
| 30 | `allDay` | `isAllDay` | Feldname-Mismatch | 🔴 KRITISCH |
| 31 | `projectId` | — | Fehlt in Response | 🟡 MITTEL |
| 32 | `employeeId` | — | Fehlt in Response | 🟡 MITTEL |

---

## G. Supplier Stats — 1

| # | Problem | Schwere |
|---|---------|---------|
| 33 | Frontend erwartet `total`, `active`, `newSuppliers`, `totalValue`, `avgRating` — Backend-Feldnamen ungeprüft | ⚠️ PRÜFEN |

---

## ✅ WAS KORREKT IST (kein Handlungsbedarf)

- Alle 40+ Module existieren im Backend
- Alle 360+ CRUD-Routen sind registriert
- Dashboard Stats, Project Stats — korrekt synchron
- Auth, Company, Contracts, Credit Notes, Reminders, Documents CRUD — vollständig
- Journal Entries, BOM, Absences, Payments, Budgets, Cost Centers, etc. — alle Routen vorhanden
- Pagination `{ data[], total, page, pageSize }` — konsistent

---

## 📌 PRIORITÄTS-REIHENFOLGE FÜR BACKEND-FIXES

### Phase 1: Stats-Feldnamen angleichen (18 Module) → Cursor
Alle Stats-Endpunkte müssen die Feldnamen liefern, die das Frontend erwartet. Kein Frontend-Code wird geändert.

### Phase 2: Enum/Status synchronisieren (1 Mismatch) → Cursor
Task-Status `REVIEW` im Backend beibehalten UND `overdue`-Berechnung hinzufügen. Frontend erhält `CANCELLED` → muss evtl. angepasst werden.

### Phase 3: Calendar-Struktur fixen (5 Felder) → Cursor
Backend muss `startDate`, `endDate`, `allDay`, `projectId`, `employeeId` in der Response liefern.

### Phase 4: Schema-Felder + Filter (5 Punkte) → Cursor
`qrIban`, `defaultCurrency`, `fiscalYearStart` in Company-Schema. User-Filter für `role` und `isActive`.

### Phase 5: Listen-Responses erweitern (3 Punkte) → Cursor
Invoices/Quotes/Orders Listen müssen `items[]` inkludieren statt nur `_count`.

### Phase 6: Supplier Stats verifizieren (1 Punkt) → Cursor
Feldnamen prüfen und ggf. anpassen.
