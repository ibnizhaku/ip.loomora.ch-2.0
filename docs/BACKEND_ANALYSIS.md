# Backend Module Analyse - Phase 1

**Analysiert:** 09.02.2026  
**Scope:** Kern-Module (Customers, Products, Invoices, Quotes, Orders, Projects, Tasks, Dashboard)

---

## ✅ Vollständig implementierte Module

### 1. **Customers** (`/modules/customers`)

| Endpoint | Methode | CompanyId-Filterung | Frontend-Hook |
|---|---|---|---|
| `GET /customers` | Pagination ✅ | ✅ | `useCustomers()` ✅ |
| `GET /customers/:id` | Single ✅ | ✅ | `useCustomer(id)` ✅ |
| `POST /customers` | Create ✅ | ✅ | `useCreateCustomer()` ✅ |
| `PUT /customers/:id` | Update ✅ | ✅ | `useUpdateCustomer()` ✅ |
| `DELETE /customers/:id` | Deactivate ✅ | ✅ | `useDeleteCustomer()` ✅ |

**Features:**
- ✅ JWT Guard vorhanden
- ✅ Alle Query-Parameter (search, sortBy, sortOrder)
- ✅ Response-Format matcht Frontend

**Fehlend:**
- ❌ **Stats-Endpoint** (`GET /customers/stats`) - Frontend berechnet client-side via `useCustomerStats()`

---

### 2. **Products** (`/modules/products`)

| Endpoint | Methode | CompanyId-Filterung | Frontend-Hook |
|---|---|---|---|
| `GET /products` | Pagination ✅ | ✅ | `useProducts()` ✅ |
| `GET /products/categories` | Categories ✅ | ✅ | `useProductCategories()` ✅ |
| `POST /products/categories` | Create Category ✅ | ✅ | `useCreateProductCategory()` ✅ |
| `GET /products/:id` | Single ✅ | ✅ | `useProduct(id)` ✅ |
| `POST /products` | Create ✅ | ✅ | `useCreateProduct()` ✅ |
| `PUT /products/:id` | Update ✅ | ✅ | `useUpdateProduct()` ✅ |
| `POST /products/:id/adjust-stock` | Adjust Stock ✅ | ✅ | `useAdjustStock()` ✅ |
| `DELETE /products/:id` | Deactivate ✅ | ✅ | `useDeleteProduct()` ✅ |

**Features:**
- ✅ Category-Management
- ✅ Stock-Adjustment-Endpoint
- ✅ Filter nach Category, isService

**Fehlend:**
- ❌ **Stats-Endpoint** (`GET /products/stats`) - Frontend berechnet client-side via `useProductStats()`

---

### 3. **Invoices** (`/modules/invoices`)

| Endpoint | Methode | CompanyId-Filterung | Frontend-Hook |
|---|---|---|---|
| `GET /invoices` | Pagination ✅ | ✅ | `useInvoices()` ✅ |
| `GET /invoices/open-items` | Open Items ✅ | ✅ | *(keine)* |
| `GET /invoices/:id` | Single ✅ | ✅ | `useInvoice(id)` ✅ |
| `POST /invoices` | Create ✅ | ✅ | `useCreateInvoice()` ✅ |
| `PUT /invoices/:id` | Update ✅ | ✅ | `useUpdateInvoice()` ✅ |
| `POST /invoices/:id/payment` | Record Payment ✅ | ✅ | *(manuell via UI)* |
| `POST /invoices/:id/send` | Mark Sent ✅ | ✅ | *(manuell via UI)* |
| `POST /invoices/:id/cancel` | Cancel ✅ | ✅ | *(manuell via UI)* |
| `DELETE /invoices/:id` | Delete ✅ | ✅ | `useDeleteInvoice()` ✅ |

**Features:**
- ✅ Payment-Recording
- ✅ Status-Flow (send, cancel)
- ✅ Open Items für Debitoren
- ✅ Filter nach Status, Customer, Overdue

**Fehlend:**
- ❌ **Stats-Endpoint** (`GET /invoices/stats`) - Frontend berechnet client-side via `useInvoiceStats()`

---

### 4. **Quotes** (`/modules/quotes`)

| Endpoint | Methode | CompanyId-Filterung | Frontend-Hook |
|---|---|---|---|
| `GET /quotes` | Pagination ✅ | ✅ | `useQuotes()` ✅ |
| `GET /quotes/:id` | Single ✅ | ✅ | `useQuote(id)` ✅ |
| `POST /quotes` | Create ✅ | ✅ | `useCreateQuote()` ✅ |
| `PUT /quotes/:id` | Update ✅ | ✅ | `useUpdateQuote()` ✅ |
| `POST /quotes/:id/convert-to-order` | Convert ✅ | ✅ | *(manuell via UI)* |
| `DELETE /quotes/:id` | Delete ✅ | ✅ | `useDeleteQuote()` ✅ |

**Features:**
- ✅ Convert-to-Order Flow
- ✅ Filter nach Status, Customer

**Fehlend:**
- Keine kritischen Endpoints

---

### 5. **Orders** (`/modules/orders`)

| Endpoint | Methode | CompanyId-Filterung | Frontend-Hook |
|---|---|---|---|
| `GET /orders` | Pagination ✅ | ✅ | `useOrders()` ✅ |
| `GET /orders/:id` | Single ✅ | ✅ | `useOrder(id)` ✅ |
| `POST /orders` | Create ✅ | ✅ | `useCreateOrder()` ✅ |
| `PUT /orders/:id` | Update ✅ | ✅ | `useUpdateOrder()` ✅ |
| `POST /orders/:id/create-invoice` | Create Invoice ✅ | ✅ | *(manuell via UI)* |
| `DELETE /orders/:id` | Delete ✅ | ✅ | `useDeleteOrder()` ✅ |

**Features:**
- ✅ Create-Invoice Flow
- ✅ Filter nach Status, Customer

**Fehlend:**
- Keine kritischen Endpoints

---

### 6. **Projects** (`/modules/projects`)

| Endpoint | Methode | CompanyId-Filterung | Frontend-Hook |
|---|---|---|---|
| `GET /projects` | Pagination ✅ | ✅ | `useProjects()` ✅ |
| `GET /projects/stats` | **Stats ✅** | ✅ | `useProjectStats()` ✅ |
| `GET /projects/:id` | Single ✅ | ✅ | `useProject(id)` ✅ |
| `POST /projects` | Create ✅ | ✅ | `useCreateProject()` ✅ |
| `PUT /projects/:id` | Update ✅ | ✅ | `useUpdateProject()` ✅ |
| `DELETE /projects/:id` | Delete ✅ | ✅ | `useDeleteProject()` ✅ |

**Features:**
- ✅ **Stats-Endpoint vorhanden** (total, active, completed, paused)
- ✅ Filter nach Status, Priority, Customer, Manager
- ✅ Vollständig implementiert

**Fehlend:**
- ❌ Members-Management (`POST /projects/:id/members`, `DELETE /projects/:id/members/:memberId`)

---

### 7. **Tasks** (`/modules/tasks`)

| Endpoint | Methode | CompanyId-Filterung | Frontend-Hook |
|---|---|---|---|
| `GET /tasks` | Pagination ✅ | ✅ | `useTasks()` ✅ |
| `GET /tasks/stats` | **Stats ✅** | ✅ | `useTaskStats()` ✅ |
| `GET /tasks/:id` | Single ✅ | ✅ | `useTask(id)` ✅ |
| `POST /tasks` | Create ✅ | ✅ | `useCreateTask()` ✅ |
| `PUT /tasks/:id` | Update ✅ | ✅ | `useUpdateTask()` ✅ |
| `DELETE /tasks/:id` | Delete ✅ | ✅ | `useDeleteTask()` ✅ |

**Features:**
- ✅ **Stats-Endpoint vorhanden** (total, todo, inProgress, done, overdue)
- ✅ Filter nach Status, Priority, Project, Assignee
- ✅ Tags-Support im Schema

**Fehlend:**
- ❌ **Subtasks** (`GET /tasks/:id/subtasks`, `POST /tasks/:id/subtasks`)
- ❌ **Comments** (`GET /tasks/:id/comments`, `POST /tasks/:id/comments`) - **BEREITS IMPLEMENTIERT als `/messages?taskId=...`**

---

### 8. **Dashboard** (`/modules/dashboard`)

| Endpoint | Methode | CompanyId-Filterung | Frontend-Hook |
|---|---|---|---|
| `GET /dashboard/stats` | **KPIs ✅** | ✅ | `useDashboardStats()` ✅ |
| `GET /dashboard/activity` | Activity ✅ | ✅ | `useRecentActivity()` ✅ |

**Features:**
- ✅ Vollständig server-seitig berechnet
- ✅ KPIs: totalRevenue, openInvoices, activeProjects, customerCount, revenueChange, utilizationRate

**Fehlend:**
- Keine

---

## ⚠️ Fehlende Endpoints (Priorität HOCH)

### **Stats-Endpoints für KPI-Seiten**

Die folgenden Seiten berechnen Stats **client-side** (ineffizient bei großen Datenmengen):

| Modul | Fehlender Endpoint | Frontend berechnet |
|---|---|---|
| **Customers** | `GET /customers/stats` | total, active, prospects, totalRevenue |
| **Products** | `GET /products/stats` | total, active, inactive, services, lowStock |
| **Invoices** | `GET /invoices/stats` | total, paid, pending, overdue |

**Empfehlung:** Stats-Endpoints auf Backend implementieren (wie bei Projects/Tasks/Dashboard).

---

### **Subtasks & Comments** (bereits teilweise gelöst)

| Feature | Status | Lösung |
|---|---|---|
| **Task Comments** | ✅ Implementiert | `/messages?taskId=...` (Messages-Modul) |
| **Subtasks** | ❌ Fehlt | Schema hat keine Subtask-Relation |

**Empfehlung:** Subtasks können via `parentTaskId` im Task-Schema implementiert werden (Self-Relation).

---

## 📊 Module-Übersicht (43 Backend-Module gefunden)

```
✅ Vollständig: customers, products, invoices, quotes, orders, projects, tasks, dashboard
✅ Vorhanden: delivery-notes, credit-notes, contracts, payments, suppliers
✅ Vorhanden: employees, time-entries, calendar, documents, messages
✅ Vorhanden: purchase-orders, purchase-invoices, goods-receipts
✅ Vorhanden: bom, calculations, production-orders, quality-control
✅ Vorhanden: service-tickets, training, recruiting, marketing
✅ Vorhanden: budgets, cost-centers, fixed-assets, cash-book, journal-entries
✅ Vorhanden: vat-returns, swissdec, withholding-tax, bank-import
✅ Vorhanden: audit-log, reports, ecommerce, subscriptions
✅ Vorhanden: users, company, auth, health, invitations, absences, reminders
✅ Vorhanden: gav-metallbau (Schweizer Metallbau-GAV spezifisch)
```

**Total: 43+ Backend-Module**

---

## 🎯 Nächste Schritte (Empfehlung)

### **Phase 2A: Stats-Endpoints hinzufügen (Quick Wins)**

1. **Customers Stats** (`GET /customers/stats`)
2. **Products Stats** (`GET /products/stats`)
3. **Invoices Stats** (`GET /invoices/stats`)

**Aufwand:** ~30 Minuten pro Modul  
**Benefit:** Performance-Verbesserung, Server-seitige Aggregation

---

### **Phase 2B: Fehlende Sub-Features analysieren**

Für jedes der 43 Module prüfen:
- [ ] Sind alle Relationen included? (customer, project, items, etc.)
- [ ] Ist Decimal → Number Konvertierung korrekt?
- [ ] Funktioniert Nummern-Auto-Generierung?
- [ ] Sind Status-Flows vollständig? (z.B. Invoice: DRAFT → SENT → PAID)
- [ ] Gibt es fehlende Action-Endpoints? (send, cancel, approve, etc.)

**Aufwand:** ~2-3 Stunden  
**Output:** Vollständiger Feature-Completeness-Report

---

### **Phase 3: Business-Logic-Flows testen**

Cross-Modul-Verknüpfungen:
- [ ] Quote → Order → Invoice Flow
- [ ] PurchaseOrder → GoodsReceipt → PurchaseInvoice
- [ ] TimeEntry → Invoice (Billable Hours)
- [ ] BankImport → Payment-Matching
- [ ] Invoice → Journal Entry (Buchhaltung)

---

## 🔐 Multi-Tenant Compliance Check

**Alle geprüften Controller verwenden:**
- ✅ `@UseGuards(JwtAuthGuard)`
- ✅ `@CurrentUser() user: CurrentUserPayload`
- ✅ `user.companyId` in Service-Calls

**Status:** ✅ **Multi-Tenant-Isolation korrekt implementiert**

---

## 📝 Notizen

- Response-Mapper (`backend/src/common/mappers/response.mapper.ts`) wird verwendet
- Pagination via `PaginationDto` und `createPaginatedResponse()`
- Nummern-Generierung über Company-Counter (Beispiel: `projects.service.ts`)
- Prisma-Decimal-Felder werden als `Number()` konvertiert (wichtig!)
