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

# 🚨 ZUSAMMENFASSUNG: ALLE BEKANNTEN MISMATCHES

| # | Modul | Problem | Schwere | Aktion |
|---|-------|---------|---------|--------|
| 1 | **Tasks** | Status-Enum: Frontend `CANCELLED` ≠ Backend `REVIEW` | 🔴 KRITISCH | Backend oder Frontend anpassen |
| 2 | **Tasks** | Frontend-Stats erwarten `overdue`, Backend liefert `review` | 🔴 KRITISCH | Backend `overdue` berechnen |
| 3 | **Tasks** | Subtask-Typ: Frontend erwartet `Task[]`, Backend liefert `Subtask[]` mit `{ id, title, isCompleted }` | 🔴 KRITISCH | Frontend-Interface anpassen |
| 4 | **Tasks** | 10 Sub-Resource-Hooks fehlen im Frontend (Subtasks, Comments, Attachments CRUD) | 🔴 KRITISCH | Hooks erstellen |
| 5 | **Tasks** | `estimatedHours` fehlt im Frontend-Interface | 🟡 MITTEL | Interface erweitern |
| 6 | **Tasks** | `completedAt` im Frontend, nicht im Backend | 🟡 MITTEL | Backend-Feld hinzufügen |
| 7 | **Invoices** | **Doppelte Hooks** in `use-invoices.ts` und `use-sales.ts` | 🟡 MITTEL | Konsolidieren |
| 8 | **Invoices** | `use-invoices.ts` fehlt `openAmount`, `isOverdue`, `qrReference`, `paidDate` | 🟡 MITTEL | Interface erweitern |
| 9 | **Invoices** | Item-Interface unterschiedlich: `vatRate` vs `discount` vs `position` | 🟡 MITTEL | Vereinheitlichen |
| 10 | **Employees** | Stats-Feldnamen: Frontend `totalEmployees`/`activeEmployees` ≠ Backend `total`/`active` | 🔴 KRITISCH | Mapper oder Feldnamen angleichen |
| 11 | **Employees** | Frontend erwartet `newThisMonth` + `departmentBreakdown[]`, Backend liefert `vacation`/`sick` | 🔴 KRITISCH | Backend anpassen |
| 12 | **Quotes** | Stats `total` Semantik: Frontend=Anzahl, Backend=CHF-Summe | 🔴 KRITISCH | Backend umbenennen |
| 13 | **Quotes** | Frontend erwartet `rejected` count, Backend zählt `CANCELLED` | 🟡 MITTEL | Status-Mapping klären |
| 14 | **Products** | `margin` + `availableStock` computed Fields fehlen im Backend | 🟡 MITTEL | Backend berechnen |
| 15 | **Products** | `lowStock` in Stats — prüfen ob Backend es liefert | 🟡 MITTEL | Backend prüfen |
| 16 | **Suppliers** | `avgRating` ist hardcoded `0` | 🟢 NIEDRIG | Später implementieren |
| 17 | **Pagination** | `totalPages` in Frontend-Types, Backend evtl. nicht | 🟡 MITTEL | `createPaginatedResponse` prüfen |

---

## 📌 PRIORITÄTS-REIHENFOLGE FÜR FIXES

### Sofort (🔴 KRITISCH)
1. Tasks Status-Enum synchronisieren
2. Tasks Stats `overdue` hinzufügen
3. Tasks Sub-Resource Hooks im Frontend erstellen
4. Employee Stats Feldnamen angleichen
5. Quote Stats `total` = Anzahl (nicht CHF)

### Bald (🟡 MITTEL)
6. Invoice-Hooks konsolidieren
7. Task Interface für Subtask-Typ korrigieren
8. Pagination `totalPages` sicherstellen
9. Product computed fields

### Später (🟢 NIEDRIG)
10. Supplier Rating implementieren
