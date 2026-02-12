# Loomora ERP – Cursor Master-Plan: Vollständige Funktionalität

> **Ziel**: Jedes Modul von Dashboard bis Unternehmen vollständig funktional machen. Keine Mock-Daten, keine toast.info-Platzhalter, keine hardcoded Werte.
>
> **REGEL**: Cursor darf NUR im `/backend` Verzeichnis und an `schema.prisma` arbeiten. `/src` (Frontend) ist READ-ONLY. Das Design darf nicht verändert werden. Frontend-Hooks in `src/hooks/` sind die verbindliche API-Signatur-Referenz.

---

## ÜBERSICHT: Was funktioniert und was nicht

### Legende
- ✅ = Vollständig funktional (API angebunden)
- ⚠️ = Teilweise funktional (API vorhanden, aber Lücken)
- ❌ = Nicht funktional (Mock-Daten oder komplett fehlendes Backend)

---

## PHASE 1: DASHBOARD (Index.tsx)

### Status: ⚠️ Teilweise funktional

**Was funktioniert:**
- KPI-Karten (Umsatz, Projekte, Kunden, Auslastung) → `GET /api/dashboard/stats` ✅
- Letzte Aktivitäten → `GET /api/dashboard/activity` ✅
- Aktive Projekte Widget → `GET /api/projects?status=ACTIVE` ✅
- Kalender Widget → `GET /api/calendar` ✅
- Quick Actions (Navigation) ✅

**Was nicht funktioniert:**
1. **`revenueChange` ist hardcoded "+12.5%"** in `dashboard.service.ts` Zeile 40
   - **Fix**: Berechne den tatsächlichen Umsatzvergleich zum Vormonat aus `Invoice`-Tabelle
   - Vergleiche `SUM(totalAmount WHERE status=PAID AND createdAt im aktuellen Monat)` vs. Vormonat
2. **`utilizationRate` ist hardcoded 87** in `dashboard.service.ts` Zeile 41
   - **Fix**: Berechne aus `TimeEntry`-Tabelle: `(gebuchte Stunden / verfügbare Stunden) * 100`

### Cursor-Prompt Phase 1:
```
KONTEXT: Du arbeitest am NestJS-Backend in /backend. Du darfst NICHT /src verändern.

AUFGABE: Mache die Dashboard-KPIs dynamisch in backend/src/modules/dashboard/dashboard.service.ts:

1. Zeile 40 `revenueChange`: Berechne den echten prozentualen Umsatzunterschied zwischen dem aktuellen und dem Vormonat. Nutze die Invoice-Tabelle (status=PAID). Formel: ((aktueller_Monat - vorheriger_Monat) / vorheriger_Monat * 100). Runde auf 1 Dezimalstelle. Gib '+X.X%' oder '-X.X%' zurück.

2. Zeile 41 `utilizationRate`: Berechne aus TimeEntry-Tabelle. Verfügbare Stunden = Anzahl aktiver Mitarbeiter * 8h * Arbeitstage im aktuellen Monat. Gebuchte Stunden = SUM(duration) aller TimeEntries im aktuellen Monat. Rate = (gebucht / verfügbar * 100), gerundet.

WICHTIG: Behalte die gleiche Response-Struktur bei. Das Frontend erwartet:
{ totalRevenue, openInvoices, activeProjects, customerCount, employeeCount, revenueChange, utilizationRate }
```

---

## PHASE 2: PROJEKTE (Projects.tsx, ProjectDetail.tsx, ProjectCreate.tsx, ProjectEdit.tsx)

### Status: ⚠️ Teilweise funktional

**Was funktioniert:**
- Liste mit Suche/Filter → `GET /api/projects` ✅
- Projekt-Stats → `GET /api/projects/stats` ✅
- Detail-Ansicht → `GET /api/projects/:id` ✅
- Erstellen → `POST /api/projects` ✅
- Löschen → `DELETE /api/projects/:id` ✅
- Status-Wechsel → `PUT /api/projects/:id` ✅
- Projekt-Dokumente → `GET /api/documents?projectId=X` ✅
- Datei-Upload → `POST /api/documents/upload` ✅

**Was nicht funktioniert:**
1. **Meilensteine sind hardcoded** in `ProjectDetail.tsx` Zeilen 208-212
   - Frontend zeigt immer 3 feste Phasen unabhängig vom Projekt
   - **Fix Backend**: Erstelle ein `ProjectMilestone` Prisma-Model und CRUD-Endpunkte
   - `GET /api/projects/:id/milestones`, `POST /api/projects/:id/milestones`
2. **Projekt-Chat** (`ProjectChat` Komponente) – Status unklar
   - Prüfe ob `GET /api/messages?projectId=X` funktioniert
3. **Team-Zuweisung** – `project.team` ist ein String-Array (zeigt nur Initialen)
   - Backend gibt `members` mit Employee-Daten zurück, aber das Array `team` wird nicht gefüllt
   - **Fix**: Der `/api/projects/:id` Endpunkt muss `team` als Array von Initialen zurückgeben ODER der Response-Mapper muss `members` in `team` umwandeln
4. **"Duplizieren" Button** → `toast.info('Projekt duplizieren wird implementiert')`
   - **Fix**: Erstelle `POST /api/projects/:id/duplicate`

### Cursor-Prompt Phase 2:
```
KONTEXT: NestJS-Backend in /backend. /src ist READ-ONLY.

AUFGABEN:
1. Erstelle Prisma-Model `ProjectMilestone` (id, projectId, title, date, completed, position, companyId). Migration erstellen.
2. Erstelle CRUD-Endpunkte in projects.controller.ts:
   - GET /projects/:id/milestones
   - POST /projects/:id/milestones (body: { title, date })
   - PATCH /projects/:id/milestones/:milestoneId (body: { title?, date?, completed? })
   - DELETE /projects/:id/milestones/:milestoneId
3. Erstelle POST /projects/:id/duplicate – kopiert Projekt mit allen Positionen (ohne Tasks/Dokumente)
4. Stelle sicher, dass GET /projects/:id die `members` als Array mit employee-Daten zurückgibt:
   members: [{ employee: { id, firstName, lastName, position } }]
   UND ein `team` Array mit Initialen: ["AB", "CD"]

Das Frontend erwartet in src/hooks/use-projects.ts:
- project.members[].employee.firstName/lastName/position
- project.team[] (String-Array mit Initialen)
- project.tasks[].id/title/status/assignee
```

---

## PHASE 3: AUFGABEN / TASKS (Tasks.tsx, TaskDetail.tsx, TaskCreate.tsx)

### Status: ❌ KRITISCH – Mehrere Kernfunktionen defekt

**Was funktioniert:**
- Liste → `GET /api/tasks` ✅
- Stats → `GET /api/tasks/stats` ✅
- Erstellen → `POST /api/tasks` ✅
- Löschen → `DELETE /api/tasks/:id` ✅
- Status-Update → `PUT /api/tasks/:id` ✅

**KRITISCHE BUGS:**

### Bug 1: Task-Bearbeiten-Button tut nichts
- `TaskDetail.tsx` Zeile 193: Button `<Button variant="outline">Bearbeiten</Button>` hat keinen `onClick` Handler
- **Fix Frontend** (Lovable): Füge `onClick={() => navigate(/tasks/${id}/edit)}` hinzu
- **Fix Backend**: Stelle sicher, dass `PUT /api/tasks/:id` alle Felder akzeptiert (title, description, status, priority, assigneeId, projectId, dueDate, estimatedHours, tags)

### Bug 2: User-Dropdown zeigt "???" statt Namen
- `TaskCreate.tsx` Zeile 81-89: Ruft `GET /api/users` auf und erwartet `data[].firstName` und `data[].lastName`
- **Root Cause**: `users.service.ts findAll()` gibt möglicherweise nicht `firstName`/`lastName` als separate Felder zurück
- **Fix Backend**: Stelle sicher, dass `GET /api/users` folgende Struktur zurückgibt:
  ```json
  { "data": [{ "id": "...", "firstName": "Max", "lastName": "Muster", ... }] }
  ```

### Bug 3: Unteraufgaben werden nicht gespeichert/angezeigt
- `TaskCreate.tsx`: Subtasks werden im Frontend-State gehalten aber NICHT an die API gesendet (Zeile 168-188: `handleSubmit` sendet keine subtasks)
- `TaskDetail.tsx` Zeile 132: Erwartet `task.subtasks` Array vom Backend
- **Fix Backend**: 
  1. Controller-Routen existieren bereits in `tasks.controller.ts` (Zeilen 81-116)
  2. Prüfe, dass die Service-Methoden `getSubtasks`, `createSubtask`, `updateSubtask`, `deleteSubtask` korrekt funktionieren
  3. Stelle sicher, dass `GET /api/tasks/:id` das `subtasks` Array inkludiert (als Relation in Prisma)
- **Fix Frontend** (Lovable): `handleSubmit` in TaskCreate muss nach Task-Erstellung die Subtasks via `POST /api/tasks/:id/subtasks` erstellen

### Bug 4: Kommentare sind deaktiviert
- `TaskDetail.tsx` Zeile 286: "Kommentare sind noch nicht verfügbar"
- `TaskDetail.tsx` Zeile 297: Submit-Button ist `disabled`
- Controller-Routen existieren bereits (Zeilen 122-146)
- **Fix Backend**: Stelle sicher, dass die Comment-Methoden funktionieren
- **Fix Frontend** (Lovable): Kommentar-Formular funktional machen, Comment-Liste anzeigen

### Bug 5: Anhänge sind deaktiviert
- `TaskDetail.tsx` Zeile 427: "Keine Anhänge vorhanden" – keine Upload-Funktion
- Controller-Routen existieren (Zeilen 152-189)
- **Fix**: Wie bei Kommentaren – Frontend muss die API nutzen

### Bug 6: Zeiterfassung in Task-Detail nicht funktional
- `TaskDetail.tsx` Zeile 410: "Zeit buchen" Button hat keine Funktion
- **Fix**: Verlinke auf `/time-tracking?taskId=${id}` oder erstelle Modal

### Cursor-Prompt Phase 3:
```
KONTEXT: NestJS-Backend in /backend. /src ist READ-ONLY.

KRITISCHE AUFGABEN (höchste Priorität):

1. GET /api/users – Stelle sicher, dass die Response firstName und lastName als separate Felder enthält:
   { data: [{ id, firstName, lastName, email, role, status, ... }], total, page, pageSize }
   Prüfe users.service.ts findAll() – die select-Clause muss firstName und lastName enthalten.

2. GET /api/tasks/:id – Muss folgende Relations inkludieren:
   - subtasks: [{ id, title, isCompleted }]
   - comments: [{ id, content, createdAt, user: { id, firstName, lastName } }]
   - attachments: [{ id, name, fileUrl, fileSize, mimeType, createdAt }]
   - assignee: { id, firstName, lastName }
   - project: { id, name }
   - createdBy: { id, firstName, lastName }
   - tags: [{ id, name }]
   - timeEntries: [{ id, duration, description, date, user: { firstName, lastName } }]
   
   Prüfe tasks.service.ts findById() – erweitere die include/select Clause.

3. POST /api/tasks/:id/subtasks – Akzeptiert { title: string }, erstellt Subtask
4. PATCH /api/tasks/:id/subtasks/:subtaskId – Akzeptiert { title?, isCompleted? }
5. DELETE /api/tasks/:id/subtasks/:subtaskId
6. POST /api/tasks/:id/comments – Akzeptiert { content: string }
7. DELETE /api/tasks/:id/comments/:commentId
8. POST /api/tasks/:id/attachments – Multipart file upload
9. DELETE /api/tasks/:id/attachments/:attachmentId

WICHTIG: Die Controller-Routen existieren bereits in tasks.controller.ts!
Prüfe, ob die Service-Methoden korrekt implementiert sind und die Prisma-Models existieren.
Falls TaskSubtask, TaskComment, TaskAttachment Prisma-Models fehlen, erstelle sie:

model TaskSubtask {
  id          String   @id @default(uuid())
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  title       String
  isCompleted Boolean  @default(false)
  position    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TaskComment {
  id        String   @id @default(uuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  content   String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model TaskAttachment {
  id        String   @id @default(uuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  name      String
  fileUrl   String
  fileSize  Int
  mimeType  String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

---

## PHASE 4: RECHNUNGEN (Invoices.tsx, InvoiceDetail.tsx, InvoiceCreate.tsx)

### Status: ⚠️ Teilweise funktional

**Was funktioniert:**
- Liste → `GET /api/invoices` ✅
- Detail → `GET /api/invoices/:id` ✅
- Erstellen → `POST /api/invoices` ✅
- Löschen → `DELETE /api/invoices/:id` ✅
- PDF-Vorschau (Frontend jsPDF) ✅

**Was nicht funktioniert:**
1. **PDF hat hardcoded Firmendaten** – `InvoiceDetail.tsx` Zeilen 159-168:
   ```
   company: { name: "Loomora Metallbau AG", street: "Industriestrasse 15", ... }
   ```
   - **Fix**: PDF-Daten sollen aus `GET /api/company` kommen
   - **ACHTUNG**: Dies ist ein Frontend-Fix (Lovable), Backend muss nur sicherstellen, dass `/api/company` alle Felder liefert
2. **Bankdaten hardcoded** – Zeilen 108-110:
   ```
   bankDetails: { bank: "PostFinance AG", iban: "CH93...", bic: "POFICHBEXXX" }
   ```
   - **Fix**: Aus Company-Daten laden
3. **"Zahlung erfassen" Button** hat keine Funktion
   - Hook `useRecordPayment` existiert in `use-sales.ts` → `POST /api/invoices/:id/payment`
   - **Fix Backend**: Stelle sicher, dass dieser Endpunkt existiert und funktioniert
4. **"Mahnung erstellen" Button** hat keine Funktion
   - **Fix Backend**: Endpunkt `POST /api/invoices/:id/reminder` oder `POST /api/reminders`
5. **"Per E-Mail senden" Button** hat keine Funktion
   - Hook `useSendInvoice` existiert → `POST /api/invoices/:id/send`
   - **Fix Backend**: Endpunkt implementieren (SMTP aus CompanySettings)
6. **"Stornieren" Button** hat keine Funktion
   - Hook `useCancelInvoice` existiert → `POST /api/invoices/:id/cancel`
7. **Stats werden client-side berechnet** (Zeilen 117-124)
   - Hook `useInvoiceStats` existiert → `GET /api/invoices/stats`
   - **Fix Backend**: Implementiere `/api/invoices/stats` Endpunkt

### Cursor-Prompt Phase 4:
```
KONTEXT: NestJS-Backend in /backend. /src ist READ-ONLY.

AUFGABEN:
1. GET /api/invoices/stats – Implementiere: { total: number, paid: number, pending: number, overdue: number }
   total = SUM(totalAmount) aller Rechnungen, paid = SUM wo status=PAID, etc.

2. POST /api/invoices/:id/payment – Akzeptiert { amount, paymentDate?, reference? }
   - Erstellt Payment-Record
   - Aktualisiert Invoice.paidAmount
   - Setzt Status auf PAID wenn paidAmount >= totalAmount, sonst PARTIAL
   - Erstellt automatischen Journal-Entry (1020 Bank an 1100 Debitoren)

3. POST /api/invoices/:id/send – Setzt Status auf SENT, speichert sentAt Datum

4. POST /api/invoices/:id/cancel – Setzt Status auf CANCELLED, erstellt Storno-Buchung

5. Stelle sicher, dass GET /api/company alle Felder liefert:
   { name, legalName, street, zipCode, city, phone, email, website, vatNumber, iban, bic, bankName, logoUrl, qrIban }
```

---

## PHASE 5: ANGEBOTE (Quotes.tsx, QuoteDetail.tsx, QuoteCreate.tsx)

### Status: ⚠️ Teilweise funktional

**Was funktioniert:**
- CRUD via `use-sales.ts` hooks → `/api/quotes` ✅
- Konvertierung Angebot → Auftrag → `POST /api/quotes/:id/convert-to-order` ✅

**Was nicht funktioniert:**
1. **PDF hat hardcoded Firmendaten** – `QuoteDetail.tsx` Zeilen 181-189 (gleicher Bug wie Invoices)
2. **"Per E-Mail senden"** → `toast.info("E-Mail wird vorbereitet...")`
3. **"Nachfassen per E-Mail"** → `toast.info`

### Cursor-Prompt Phase 5:
```
Stelle sicher, dass folgende Endpunkte existieren und funktionieren:
1. POST /api/quotes/:id/send – Status auf SENT setzen
2. POST /api/quotes/:id/convert-to-order – Erstellt Order mit allen Items
3. GET /api/quotes/stats – { total, draft, sent, accepted, rejected }
```

---

## PHASE 6: AUFTRÄGE (Orders.tsx, OrderDetail.tsx, OrderCreate.tsx)

### Status: ⚠️ Teilweise funktional

**Was funktioniert:**
- CRUD via `use-sales.ts` hooks → `/api/orders` ✅
- Konvertierung Auftrag → Rechnung → `POST /api/orders/:id/create-invoice` ✅

**Was nicht funktioniert:**
1. **"Lieferschein erstellen"** – Prüfe ob Endpunkt existiert
2. **Auftrags-Status-Workflow** (DRAFT → CONFIRMED → IN_PROGRESS → DELIVERED → COMPLETED)

### Cursor-Prompt Phase 6:
```
1. POST /api/orders/:id/create-delivery-note – Erstellt DeliveryNote aus Order
2. POST /api/orders/:id/create-invoice – Prüfe Funktion
3. PATCH /api/orders/:id/status – Status-Transition validieren
```

---

## PHASE 7: LIEFERSCHEINE (DeliveryNotes.tsx, DeliveryNoteDetail.tsx)

### Status: ⚠️ 
- **PDF hat hardcoded Firmendaten** in `DeliveryNoteDetail.tsx` Zeilen 131-137
- CRUD grundsätzlich via API ✅

---

## PHASE 8: GUTSCHRIFTEN (CreditNotes.tsx, CreditNoteDetail.tsx)

### Status: ⚠️
- Prüfe ob CRUD-Endpunkte vollständig sind
- `POST /api/credit-notes` muss automatisch Storno-Buchung erstellen

---

## PHASE 9: KUNDEN (Customers.tsx, CustomerDetail.tsx, CustomerCreate.tsx)

### Status: ✅ Weitgehend funktional

**Was funktioniert:**
- CRUD → `/api/customers` ✅
- Stats → `/api/customers/stats` ✅
- Detail mit Projekten/Rechnungen/Kontakten ✅

**Was zu prüfen ist:**
1. `customer.projects` und `customer.invoices` – werden diese als Relations im `GET /api/customers/:id` mitgeliefert?
2. `customer.contacts` – Gibt es ein CustomerContact Prisma-Model?
3. **"Kontakt hinzufügen" Button** (`CustomerDetail.tsx` Zeile 401) – hat keine Funktion
   - **Fix**: CRUD für Customer-Kontakte: `POST /api/customers/:id/contacts`

### Cursor-Prompt Phase 9:
```
1. GET /api/customers/:id – Muss inkludieren: projects, invoices, contacts (als Relations)
2. POST /api/customers/:id/contacts – Akzeptiert { firstName, lastName, email, phone, position }
3. DELETE /api/customers/:id/contacts/:contactId
```

---

## PHASE 10: LIEFERANTEN (Suppliers.tsx, SupplierDetail.tsx, SupplierCreate.tsx)

### Status: ✅ Funktional
- CRUD → `/api/suppliers` ✅
- Stats → `/api/suppliers/stats` ✅

---

## PHASE 11: PRODUKTE (Products.tsx, ProductDetail.tsx, ProductCreate.tsx)

### Status: ⚠️
- CRUD via hooks ✅
- **Stats**: Prüfe ob `/api/products/stats` existiert

---

## PHASE 12: MITARBEITER / HR (HR.tsx, EmployeeDetail.tsx, EmployeeCreate.tsx)

### Status: ⚠️ Teilweise funktional

**Was funktioniert:**
- Liste → `GET /api/employees` ✅
- Stats → `GET /api/employees/stats` ✅
- Erstellen → `POST /api/employees` ✅

**Was nicht funktioniert:**
1. **EmployeeDetail.tsx** – "Bearbeiten" Button: `toast.info("Bearbeitungsmodus wird geladen...")`
   - Keine Edit-Route oder Edit-API-Aufruf
   - **Fix Backend**: PUT /api/employees/:id muss alle Felder akzeptieren
2. **"Gehaltsanpassung"** → navigiert zu `/payroll`, aber keine direkte Funktion
3. **Organigramm** (`Orgchart.tsx`) – prüfe ob Daten aus API kommen

---

## PHASE 13: ABWESENHEITEN (Absences.tsx, AbsenceDetail.tsx, AbsenceCreate.tsx)

### Status: ⚠️
- Hooks existieren in `use-absences.ts` → `/api/absences`
- Prüfe CRUD-Vollständigkeit

---

## PHASE 14: LOHN & GEHALT (Payroll.tsx, PayrollCreate.tsx, PayslipDetail.tsx)

### Status: ⚠️
- Prüfe ob Backend-Modul vollständig ist
- Swissdec-Integration → `use-swissdec.ts` existiert

---

## PHASE 15: ZEITERFASSUNG (TimeTracking.tsx)

### Status: ⚠️
- Hooks in `use-time-entries.ts` → `/api/time-entries`
- Prüfe CRUD

---

## PHASE 16: FINANZEN (Finance.tsx)

### Status: ❌ Hat Mock-Daten

**Was nicht funktioniert:**
1. **`monthlyData` ist hardcoded** – Zeilen 35-42 in `Finance.tsx`:
   ```js
   const monthlyData = [
     { month: "Aug", income: 85000, expense: 62000 },
     ...
   ];
   ```
   - **Fix Backend**: `GET /api/finance/monthly-summary` – Gibt monatliche Einnahmen/Ausgaben zurück
2. **Transaktionsliste** nutzt lokalen State statt API-Daten
   - `Finance.tsx` Zeile 53: `useState<Transaction[]>(initialTransactions)` – wird einmal geladen, danach lokal
3. **AddTransactionDialog** – Prüfe ob `POST /api/finance/transactions` existiert

### Cursor-Prompt Phase 16:
```
1. GET /api/finance/monthly-summary – Gibt Array zurück:
   [{ month: "Jan", income: number, expense: number }, ...]
   Berechne aus Invoice (income = PAID invoices) und PurchaseInvoice (expense = PAID purchase invoices), gruppiert nach Monat

2. GET /api/finance – Gibt Transaktionsliste zurück (letzte 50)
3. POST /api/finance/transactions – Erstellt neue Transaktion
```

---

## PHASE 17: BUCHHALTUNG (ChartOfAccounts, JournalEntries, GeneralLedger, etc.)

### Status: ⚠️
- Hooks existieren für: `use-journal-entries.ts`, `use-cash-book.ts`, `use-finance.ts`
- Module im Backend vorhanden: `journal-entries`, `cash-book`
- Prüfe Vollständigkeit aller CRUD-Operationen

---

## PHASE 18: DEBITOREN & KREDITOREN (Debtors.tsx, Creditors.tsx, OpenItems.tsx)

### Status: ⚠️
- Hooks nutzen `use-sales.ts` → `/api/invoices/open-items`
- Prüfe ob Backend-Endpunkte existieren

---

## PHASE 19: EINKAUF (PurchaseOrders, PurchaseInvoices, GoodsReceipts)

### Status: ⚠️
- Hooks existieren: `use-purchase-orders.ts`, `use-purchase-invoices.ts`, `use-goods-receipts.ts`
- **PurchaseOrderCreate.tsx** hat `toast.info("E-Mail an ... wird gesendet (Simulation)...")` – Simulation statt echtem Versand
- **Fix**: `POST /api/purchase-orders/:id/send`

---

## PHASE 20: MAHNWESEN (Reminders.tsx, ReminderDetail.tsx)

### Status: ⚠️
- Hook `use-reminders.ts` existiert
- **Hardcoded Firmen-Adresse** in `Reminders.tsx` Zeile 774: "Musterstrasse 1, 8000 Zürich, CHE-123.456.789"
- **Fix**: Aus Company-Daten laden

---

## PHASE 21: VERTRÄGE (Contracts.tsx, ContractDetail.tsx, ContractCreate.tsx)

### Status: ⚠️ Teilweise funktional

**Was funktioniert:**
- CRUD → `/api/contracts` ✅
- Stats → `/api/contracts/stats` ✅
- Verlängerung → `POST /api/contracts/:id/renew` ✅
- Kündigung → `POST /api/contracts/:id/terminate` ✅

**Was nicht funktioniert:**
1. **"Duplizieren"** → kein Endpunkt
2. **"PDF Export"** → `toast.info("PDF wird generiert...")`
3. **"Erinnerung setzen"** → `toast.info("Erinnerung wird erstellt...")`

---

## PHASE 22: KALENDER (Calendar.tsx)

### Status: ✅ Weitgehend funktional
- CRUD via `use-calendar.ts` → `/api/calendar` ✅
- Bearbeiten, Duplizieren, Löschen ✅

---

## PHASE 23: DOKUMENTE / DMS (Documents.tsx, DocumentDetail.tsx, FolderDetail.tsx)

### Status: ✅ Weitgehend funktional
- Hooks in `use-documents.ts` – vollständiges CRUD ✅
- Ordner-Hierarchie ✅
- Upload ✅
- **"Freigabe-Funktion"** → `toast.info("Freigabe-Funktion ist noch nicht verfügbar")`
  - **Fix Backend**: `POST /api/documents/:id/share`

---

## PHASE 24: MARKETING (Campaigns, Leads, EmailMarketing)

### Status: ❌ Teilweise Mock-Daten

1. **LeadDetail.tsx** – Zeilen 21-24: Hardcoded Lead-Daten ("Industriestrasse 45, 8005 Zürich")
   - **Fix**: Muss dynamisch aus `GET /api/marketing/leads/:id` kommen
2. **Recruiting.tsx** – Hat hardcoded Applicant-Daten und Interview-Daten
   - Prüfe ob Backend-Module vollständig sind

---

## PHASE 25: SERVICE-TICKETS (Service.tsx, ServiceDetail.tsx, ServiceCreate.tsx)

### Status: ❌ Mock-Daten

1. **ServiceDetail.tsx** – Zeilen 28-31: Hardcoded Ticket-Daten
   - **Fix**: `GET /api/service-tickets/:id` muss alle Felder liefern
2. **Kommentar-System** – lokaler State statt API
3. **Zeitbuchung** – lokaler State statt API
4. **Techniker-Zuweisung** – prüfe API

---

## PHASE 26: QUALITÄTSKONTROLLE (QualityControl.tsx, QualityCheckDetail.tsx)

### Status: ⚠️
- Hooks in `use-quality-control.ts` existieren
- Prüfe CRUD-Vollständigkeit

---

## PHASE 27: PRODUKTION (Production.tsx, ProductionDetail.tsx, BillOfMaterials.tsx)

### Status: ⚠️
- Hooks in `use-production-orders.ts`, `use-bom.ts` existieren
- Prüfe CRUD-Vollständigkeit
- BOM → Werkstattauftrag Konvertierung prüfen

---

## PHASE 28: LAGER / INVENTAR (Inventory.tsx, InventoryItemDetail.tsx)

### Status: ⚠️
- Prüfe ob Backend-Modul existiert (kein separates Modul in /backend/src/modules/ sichtbar)
- Möglicherweise in `products` integriert

---

## PHASE 29: BUDGETS (Budgets.tsx, BudgetDetail.tsx, BudgetCreate.tsx)

### Status: ⚠️
- Hooks in `use-budgets.ts` existieren → `/api/budgets`
- Prüfe CRUD

---

## PHASE 30: KOSTENSTELLEN (CostCenters.tsx, CostCenterDetail.tsx)

### Status: ⚠️
- Hooks in `use-cost-centers.ts` existieren → `/api/cost-centers`
- Prüfe CRUD

---

## PHASE 31: ANLAGEN (FixedAssets.tsx, FixedAssetDetail.tsx)

### Status: ⚠️
- Hooks in `use-fixed-assets.ts` existieren → `/api/fixed-assets`
- Prüfe CRUD

---

## PHASE 32: MWST (VatReturns.tsx, VatReturnDetail.tsx)

### Status: ⚠️
- Hooks in `use-vat-returns.ts` existieren → `/api/vat-returns`

---

## PHASE 33: QUELLENSTEUER (WithholdingTax.tsx)

### Status: ⚠️
- Hooks in `use-withholding-tax.ts` existieren → `/api/withholding-tax`

---

## PHASE 34: BANKKONTEN & IMPORT (BankAccounts.tsx, BankImport.tsx)

### Status: ⚠️
- Hooks in `use-bank-import.ts` existieren
- Prüfe CAMT.054 Import-Funktion

---

## PHASE 35: BERICHTE (Reports.tsx)

### Status: ⚠️
- Hooks in `use-reports.ts` existieren
- Report-Generator Dialog nutzt `jsPDF` clientseitig
- Firmendaten in PDF hardcoded: `ReportGeneratorDialog.tsx` Zeile 123: "Loomora Metallbau AG"
- **Fix**: Aus Company-Daten laden

---

## PHASE 36: BENUTZER & ROLLEN (Users.tsx, UserDetail.tsx, Roles.tsx)

### Status: ⚠️ Teilweise funktional
- CRUD via `use-users.ts` → `/api/users` ✅
- **Bug**: Users-API muss `firstName` und `lastName` separat zurückgeben (nicht nur `name`)

---

## PHASE 37: AUDIT-LOG (AuditLog.tsx, AuditLogDetail.tsx)

### Status: ⚠️
- Hooks in `use-audit-log.ts` existieren → `/api/audit-log`
- Prüfe ob alle Modul-Aktionen geloggt werden

---

## PHASE 38: E-COMMERCE / SHOP (Shop.tsx)

### Status: ⚠️
- Hooks in `use-ecommerce.ts` existieren
- Shop-Einstellungen verweisen auf Settings-Seite

---

## PHASE 39: TRAINING (Training.tsx, TrainingDetail.tsx)

### Status: ⚠️
- Hooks in `use-training.ts` existieren → `/api/training`

---

## PHASE 40: REISEKOSTEN (TravelExpenses.tsx, TravelExpenseDetail.tsx)

### Status: ⚠️
- Prüfe ob Backend-Modul existiert

---

## PHASE 41: KALKULATIONEN (Calculation.tsx, CalculationDetail.tsx)

### Status: ⚠️
- Hooks in `use-calculations.ts` existieren → `/api/calculations`

---

## PHASE 42: SEPA-ZAHLUNGEN (SepaPayments.tsx)

### Status: ⚠️
- Prüfe ob ISO 20022 Pain.001 Export funktioniert

---

## PHASE 43: EINSTELLUNGEN (Settings.tsx) – 3017 Zeilen!

### Status: ❌ KOMPLETT Frontend-Shell – KEIN Backend

**Das ist die grösste Baustelle.** Die gesamte Settings-Seite (3017 Zeilen, 18 Tabs) nutzt nur lokalen `useState` und `toast.success("Gespeichert")` ohne jegliche API-Aufrufe.

**Was alles hardcoded/mockdata ist:**
1. **Profil-Tab** – Nutzt lokalen State, keine API
2. **E-Mail-Tab** – SMTP-Konfiguration nur visuell, Zeilen 397-403: "Loomora Metallbau AG", "info@loomora.ch"
3. **API & Webhooks** – Hardcoded API-Keys, keine echte Generierung
4. **Dokumente** – Nummernkreise hardcoded (Zeilen 93-99)
5. **Shop** – Nur visuell
6. **Automatisierung** – Nur visuell
7. **Backup & Export** – Nur visuell
8. **Audit & Compliance** – Nur visuell
9. **Sicherheit** – Nur visuell
10. **Benachrichtigungen** – Nur visuell
11. **Kalender & Kontakte (CalDAV/CardDAV)** – Nur visuell
12. **Sozialversicherungen** – Separate Komponente, prüfe API
13. **Spesenregelungen** – Separate Komponente, nutzt lokalen State
14. **Abwesenheits-Workflows** – Separate Komponente, prüfe API

### Cursor-Prompt Phase 43:
```
KONTEXT: NestJS-Backend in /backend. /src ist READ-ONLY.
Das Settings-Backend-Modul existiert bereits in backend/src/modules/settings/

AUFGABEN:
1. Erweitere das CompanySettings Prisma-Model um ALLE fehlenden Felder:

model CompanySettings {
  id                    String   @id @default(uuid())
  companyId             String   @unique
  company               Company  @relation(fields: [companyId], references: [id])
  
  // SMTP
  smtpHost              String?
  smtpPort              Int?     @default(587)
  smtpUser              String?
  smtpPassword          String?
  smtpEncryption        String?  @default("TLS")
  senderName            String?
  senderEmail           String?
  
  // Dokumente
  invoicePrefix         String?  @default("RE-")
  quotePrefix           String?  @default("AN-")
  orderPrefix           String?  @default("AU-")
  deliveryNotePrefix    String?  @default("LS-")
  creditNotePrefix      String?  @default("GS-")
  purchaseOrderPrefix   String?  @default("BE-")
  logoPosition          String?  @default("top-left")
  headerColor           String?  @default("#1a1a2e")
  footerLeft            String?
  footerRight           String?
  enableQrInvoice       Boolean  @default(true)
  enablePdfA            Boolean  @default(true)
  defaultPaymentTerms   Int?     @default(30)
  
  // Lokalisierung
  language              String?  @default("de-CH")
  currency              String?  @default("CHF")
  dateFormat            String?  @default("DD.MM.YYYY")
  timezone              String?  @default("Europe/Zurich")
  
  // Benachrichtigungen
  emailNotifications    Boolean  @default(true)
  invoiceReminders      Boolean  @default(true)
  projectUpdates        Boolean  @default(true)
  
  // Sicherheit
  twoFactorRequired     Boolean  @default(false)
  sessionTimeout        Int?     @default(480)
  passwordMinLength     Int?     @default(8)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

2. Erweitere settings.service.ts mit GET und PUT für alle Felder
3. Erstelle settings.controller.ts Endpunkte:
   - GET /api/settings → Gibt alle Settings zurück
   - PUT /api/settings → Aktualisiert Settings
   - POST /api/settings/test-smtp → Testet SMTP-Verbindung
   - POST /api/settings/generate-api-key → Generiert neuen API-Key
```

---

## PHASE 44: UNTERNEHMEN (Company.tsx, CompanyEdit.tsx)

### Status: ✅ Weitgehend funktional

**Was funktioniert:**
- Firmendaten laden → `GET /api/company` ✅
- Firmendaten speichern → `PUT /api/company` ✅
- Logo-Upload → `POST /api/company/logo` ✅
- Team-Members → `GET/POST/DELETE /api/company/team` ✅
- Dashboard-Stats Integration ✅

**Was zu prüfen:**
1. `CompanyEdit.tsx` – Placeholder "CHE-123.456.789" in Input-Feldern (ist nur Placeholder, OK)
2. Stelle sicher, dass `GET /api/company` das Feld `description` zurückgibt

---

## GLOBALE PROBLEME (Über alle Module hinweg)

### Problem 1: Hardcoded Firmendaten in PDFs
**Betroffene Dateien (18 Stück):**
- `src/pages/InvoiceDetail.tsx` – "Loomora Metallbau AG"
- `src/pages/QuoteDetail.tsx` – "Loomora Metallbau AG"
- `src/pages/DeliveryNoteDetail.tsx` – "Loomora Metallbau AG"
- `src/pages/QRInvoice.tsx` – "Loomora Metallbau AG"
- `src/pages/Reminders.tsx` – "Musterstrasse 1"
- `src/lib/pdf/swiss-qr-invoice.ts` – "Loomora Metallbau AG"
- `src/lib/pdf/purchase-order-pdf.ts` – "einkauf@loomora.ch"
- `src/components/reports/ReportGeneratorDialog.tsx` – "Loomora Metallbau AG"

**Fix (Lovable/Frontend)**:
- Alle diese Dateien müssen die Company-Daten aus `useCompany()` Hook laden statt hardcoded
- Das Backend muss nur sicherstellen, dass `GET /api/company` alle nötigen Felder liefert

### Problem 2: toast.info Platzhalter (38 Dateien)
Viele Buttons zeigen nur `toast.info("wird implementiert")` statt echte Aktionen auszuführen.
- **Fix**: Die meisten Backend-Endpunkte existieren bereits. Die Frontend-Buttons müssen die korrekten API-Hooks aufrufen.

### Problem 3: Settings komplett ohne Backend (3017 Zeilen)
- Größte Einzelbaustelle
- Alle 18 Tabs nutzen nur lokalen State

---

## PRIORITÄTS-REIHENFOLGE FÜR CURSOR

### Höchste Priorität (Breaking Bugs):
1. **Phase 3**: Tasks – User-Dropdown "???", Subtasks, Comments, Attachments
2. **Phase 1**: Dashboard – dynamische KPIs

### Hohe Priorität (Kern-Geschäftslogik):
3. **Phase 4**: Invoices – Zahlung erfassen, Status-Workflow
4. **Phase 5**: Quotes – Senden, Konvertierung
5. **Phase 6**: Orders – Status-Workflow
6. **Phase 16**: Finance – Mock-Daten entfernen
7. **Phase 9**: Customers – Kontakte CRUD

### Mittlere Priorität (Vollständigkeit):
8. **Phase 2**: Projects – Meilensteine, Duplizieren
9. **Phase 12**: HR – Employee Edit
10. **Phase 19**: Einkauf – PO senden
11. **Phase 25**: Service-Tickets – Mock-Daten
12. **Phase 24**: Marketing/Leads – Mock-Daten

### Niedrigere Priorität (Nice-to-have):
13. **Phase 43**: Settings – Komplett-Integration
14. **Phase 23**: DMS – Sharing
15. **Globales Problem 1**: Firmendaten in PDFs (Frontend-Fix)

---

## VALIDIERUNGSPLAN

Nach jeder Phase führt Cursor folgende Checks durch:
1. `npx prisma migrate dev` – Schema-Änderungen
2. `npm run build` – Keine TypeScript-Fehler
3. API-Test mit curl/Postman für jeden neuen Endpunkt
4. Prüfe, dass bestehende Endpunkte nicht gebrochen sind

---

*Erstellt am: 12.02.2026*
*Letzte Analyse: Vollständige Durchsicht aller 160+ Frontend-Dateien und 50+ Backend-Module*
