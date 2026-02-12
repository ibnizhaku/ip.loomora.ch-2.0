# Frontend-Audit: Element-Status-Dokumentation

> **Erstellt:** 2026-02-12  
> **Zweck:** Systematische Überprüfung aller UI-Elemente auf echte Backend-Anbindung vs. Mock/Platzhalter  
> **Legende:**  
> ✅ = Echte Daten (Backend-Hook vorhanden + API-Call)  
> ⚠️ = Hook vorhanden, aber Backend-Endpoint ggf. nicht implementiert/getestet  
> ❌ = Mock-Daten / Nicht implementiert / Nur Frontend-Logik  
> 🔧 = Teilweise implementiert  

---

## 1. Dashboard (`src/pages/Index.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Gesamtumsatz | Stat-Card | ✅ | `useDashboardStats()` → `GET /api/dashboard/stats` → `totalRevenue` |
| Aktive Projekte | Stat-Card | ✅ | `useDashboardStats()` → `activeProjects` |
| Kunden | Stat-Card | ✅ | `useDashboardStats()` → `customerCount` |
| Auslastung | Stat-Card | ⚠️ | `useDashboardStats()` → `utilizationRate` – Hook vorhanden, aber Backend berechnet ggf. statisch |
| Aktive Projekte Widget | Widget | ✅ | `ProjectsOverview` Komponente – nutzt eigenen Hook |
| Schnellaktionen | Widget | ✅ | Rein navigatorisch (Links zu /projects/new, etc.) – keine API nötig |
| Kalender Widget | Widget | ⚠️ | `CalendarWidget` – muss geprüft werden ob echte Events geladen werden |
| Letzte Aktivität | Widget | ✅ | `useRecentActivity()` → `GET /api/dashboard/activity` |

**Cursor-Aufgabe:** Prüfen ob `utilizationRate` im Backend korrekt berechnet wird. Kalender-Widget auf echte Datenquelle prüfen.

---

## 2. Projekte (`src/pages/Projects.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neues Projekt Button | Button | ✅ | Navigation zu `/projects/new` |
| Suchfeld | Input | ✅ | `useProjects({ search })` mit Backend-Filter |
| Filter-Button/Popover | Filter | ✅ | Status & Priorität als Query-Parameter |
| Filter Status Checkboxen | Checkbox | ✅ | Werden als `status` Parameter gesendet |
| Filter Priorität Checkboxen | Checkbox | ✅ | Werden als `priority` Parameter gesendet |
| Filter zurücksetzen | Button | ✅ | Frontend-Reset der Filter-State |
| Grid/Listen-Ansicht | Toggle | ✅ | Rein Frontend-Logik (kein Backend nötig) |
| Stat-Cards (Gesamt, Aktiv, etc.) | Stat-Card | ✅ | `useProjectStats()` → `GET /api/projects/stats` |
| Projekt-Karte | Card | ✅ | Daten aus `useProjects()` |
| Projekt-Aktionen Dropdown | Dropdown | ✅ | Details/Bearbeiten = Navigation, Löschen = `useDeleteProject()` |

### Projekt erstellen (`src/pages/ProjectCreate.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Projektname | Input | ✅ | Wird an `useCreateProject()` gesendet |
| Kunde auswählen | Dropdown | ⚠️ | Muss prüfen ob Kunden-Liste geladen wird |
| Start-/Enddatum | Datepicker | ✅ | Felder im Hook vorhanden |
| Budget | Input | ✅ | `budget` Feld vorhanden |
| Status/Priorität | Dropdown | ✅ | Enum-Werte im Backend |
| Beschreibung | Textarea | ✅ | `description` Feld vorhanden |
| Projekt anlegen Button | Button | ✅ | `useCreateProject().mutateAsync()` |

### Projektdetails (`src/pages/ProjectDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Tab: Aufgaben | Tab | ⚠️ | Muss prüfen ob Tasks nach `projectId` gefiltert werden |
| Tab: Team | Tab | ⚠️ | `members` Feld im Interface, aber Backend-Relation prüfen |
| Tab: Dokumente | Tab | ⚠️ | DMS-Integration mit `projectId` Filter nötig |
| Tab: Budget | Tab | ⚠️ | `budget`/`spent` Felder vorhanden, Detailberechnung prüfen |
| Tab: Zeiterfassung | Tab | ⚠️ | `use-time-entries.ts` existiert, Projekt-Filter prüfen |
| Tab: Chat | Tab | ❌ | Kein Chat-Backend/Hook erkennbar |
| Tab: Timeline | Tab | ⚠️ | Meilensteine – Backend-Modell prüfen |
| Bearbeiten/Löschen | Buttons | ✅ | `useUpdateProject()` / `useDeleteProject()` |
| Status-Badge | Badge | ✅ | Aus `project.status` |
| Fortschrittsbalken | Progress | ✅ | Aus `project.progress` |

---

## 3. Aufgaben (`src/pages/Tasks.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Aufgabe Button | Button | ✅ | Navigation zu `/tasks/new` |
| Suchfeld | Input | ✅ | `useTasks({ search })` |
| Filter Status/Priorität | Dropdown | ✅ | Query-Parameter an Backend |
| Kanban-Columns | Columns | ⚠️ | Frontend-Gruppierung nach Status, Drag&Drop-Persistenz prüfen |
| Aufgaben-Karte | Card | ✅ | Daten aus `useTasks()` |
| Aufgaben-Aktionen | Dropdown | ✅ | CRUD via Hooks |

### Aufgabe erstellen (`src/pages/TaskCreate.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Titel, Beschreibung | Input/Textarea | ✅ | `useCreateTask()` |
| Projekt-Dropdown | Dropdown | ⚠️ | Prüfen ob Projektliste geladen wird |
| Priorität | Dropdown | ✅ | Enum im Hook |
| Fälligkeitsdatum | Datepicker | ✅ | `dueDate` Feld |
| Zuständiger | Dropdown | ✅ | Lädt Users via `api.get('/users')` |

### Aufgabendetails (`src/pages/TaskDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Status-Checkbox | Checkbox | ⚠️ | `useUpdateTask()` – Persistenz prüfen |
| Subtasks/Checkliste | List | ❌ | Kein Subtask-Modell im Hook erkennbar |
| Kommentare | Textarea/List | ❌ | Kein Kommentar-Endpoint im Hook |
| Anhang Upload | Upload | ❌ | Kein Attachment-Endpoint im Task-Hook |

---

## 4. Kunden (`src/pages/Customers.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Kunde Button | Button | ✅ | Navigation zu `/customers/new` |
| Suchfeld | Input | ✅ | `useCustomers({ search })` |
| Stat-Cards | Stats | 🔧 | `useCustomerStats()` – berechnet client-seitig aus allen Kunden (pageSize: 1000), kein dedizierter Stats-Endpoint |
| Kunden-Zeile | Table-Row | ✅ | Daten aus `useCustomers()` |
| Kunden-Aktionen | Dropdown | ✅ | CRUD via Hooks |

### Kunde erstellen (`src/pages/CustomerCreate.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Alle Eingabefelder | Inputs | ✅ | `useCreateCustomer()` → `POST /api/customers` |
| Kunde anlegen Button | Button | ✅ | Mutation vorhanden |

### Kundendetails (`src/pages/CustomerDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Tab: Übersicht | Tab | ✅ | `useCustomer(id)` |
| Tab: Projekte | Tab | ⚠️ | Filter `useProjects({ customerId })` – prüfen |
| Tab: Dokumente | Tab | ⚠️ | DMS-Filter nach Kunde – prüfen |
| Tab: Rechnungen | Tab | ⚠️ | `useInvoices({ customerId })` – prüfen |
| Tab: Verträge | Tab | ⚠️ | `useContracts({ customerId })` – prüfen |
| Tab: Aktivitäten | Tab | ❌ | Kein Activity-Log per Kunde im Hook |

---

## 5. Angebote (`src/pages/Quotes.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neues Angebot Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useQuotes({ search })` |
| Stat-Cards | Stats | ⚠️ | Prüfen ob dedizierter Stats-Endpoint existiert oder client-seitig |
| Angebots-Zeile | Table-Row | ✅ | `useQuotes()` |
| Angebots-Aktionen | Dropdown | ✅ | CRUD + Duplizieren Hooks |

### Angebot erstellen (`src/pages/QuoteCreate.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Kunde auswählen | Dropdown | ⚠️ | Kundenliste laden prüfen |
| Positionen hinzufügen | Dialog/Table | ⚠️ | Produkt-Auswahl-Dialog – `useProducts()` prüfen |
| Positionsliste editierbar | Table | ✅ | Items-Array in `useCreateQuote()` |
| Berechnungen (MwSt, Total) | Display | ✅ | Frontend-Berechnung |
| Als Entwurf / Senden | Buttons | ✅ | Status-Feld in Mutation |

### Angebotsdetails (`src/pages/QuoteDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| PDF herunterladen | Button | ⚠️ | Prüfen ob PDF-Endpoint existiert |
| Angebot senden | Button | ⚠️ | E-Mail-Endpoint prüfen |
| Duplizieren | Button | ⚠️ | Prüfen ob Duplicate-Endpoint existiert |
| In Auftrag umwandeln | Button | ✅ | `useConvertQuoteToOrder()` → `POST /quotes/:id/convert-to-order` |
| Status ändern Dialog | Dialog | ⚠️ | `useUpdateQuote()` mit Status-Feld |
| Positionen | Table | ✅ | Aus `useQuote(id)` |

---

## 6. Aufträge (`src/pages/Orders.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Auftrag Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useOrders({ search })` |
| Stat-Cards | Stats | ⚠️ | Prüfen ob Backend-Stats-Endpoint existiert |
| Auftrags-Zeile | Table-Row | ✅ | `useOrders()` |
| Auftrags-Aktionen | Dropdown | ✅ | CRUD Hooks |

### Auftragsdetails (`src/pages/OrderDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Lieferschein erstellen | Button | ✅ | `useCreateDeliveryNoteFromOrder()` |
| Rechnung erstellen | Button | ✅ | `useCreateInvoiceFromOrder()` |
| Positionen | Table | ✅ | Aus `useOrder(id)` |
| Fortschrittsbalken | Progress | ⚠️ | Berechnung prüfen |
| Verknüpfte Dokumente | Card | ⚠️ | Relationen (Lieferscheine, Rechnungen, Angebot) prüfen |

---

## 7. Rechnungen (`src/pages/Invoices.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Rechnung Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useInvoices({ search })` |
| Stat-Cards | Stats | 🔧 | `useInvoiceStats()` – berechnet client-seitig (pageSize: 1000) |
| Rechnungs-Zeile | Table-Row | ✅ | `useInvoices()` |
| Rechnungs-Aktionen | Dropdown | ✅ | CRUD + spezielle Hooks |

### Rechnungsdetails (`src/pages/InvoiceDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| PDF herunterladen | Button | ⚠️ | PDF-Generierung prüfen (jspdf installiert) |
| QR-Rechnung | Button | ⚠️ | QR-Code Seite existiert (`QRInvoice.tsx`), Endpoint prüfen |
| Rechnung senden | Button | ✅ | `useSendInvoice()` → `POST /invoices/:id/send` |
| Zahlung erfassen | Dialog | ✅ | `useRecordPayment()` → `POST /invoices/:id/payment` |
| Positionen | Table | ✅ | Aus `useInvoice(id)` |
| Zahlungsinformationen | Card | ⚠️ | `paidAmount`, `openAmount` – Backend-Berechnung prüfen |

---

## 8. Lieferscheine (`src/pages/DeliveryNotes.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Lieferschein Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useDeliveryNotes({ search })` |
| Stat-Cards | Stats | ⚠️ | Kein dedizierter Stats-Endpoint im Hook – prüfen ob Frontend berechnet |
| Lieferschein-Zeile | Table-Row | ✅ | `useDeliveryNotes()` |

### Lieferscheindetails (`src/pages/DeliveryNoteDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Tracking-Nummer | Input | ✅ | `trackingNumber` in `useUpdateDeliveryNote()` |
| Versanddienstleister | Dropdown | ✅ | `carrier` Feld |
| Positionen | Table | ✅ | Aus `useDeliveryNote(id)` |
| Lieferadresse | Display | ✅ | `deliveryAddress` Feld |
| PDF generieren | Button | ⚠️ | Prüfen ob PDF-Endpoint existiert |

---

## 9. Verträge (`src/pages/Contracts.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Vertrag Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useContracts({ search })` |
| Filter Typ/Auto-Verlängerung | Popover | ⚠️ | Prüfen ob Backend Filter unterstützt |
| Stat-Cards | Stats | ✅ | `useContractStats()` → `GET /api/contracts/stats` |
| Auslaufende Verträge Alert | Alert | ✅ | `useExpiringContracts()` → `GET /api/contracts/expiring` |
| Vertrags-Zeile | Table-Row | ✅ | `useContracts()` |
| Vertrags-Aktionen | Dropdown | ✅ | CRUD + Verlängern/Kündigen |

### Vertrag erstellen (`src/pages/ContractCreate.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Alle Felder | Inputs/Selects | ✅ | `useCreateContract()` |
| ⚠️ Build-Error | TypeScript | ❌ | `'name' does not exist in type 'Partial<Contract>'` – Feld-Mapping falsch |

### Vertragsdetails (`src/pages/ContractDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Verlängern | Button/Dialog | ✅ | `useRenewContract()` → `POST /contracts/:id/renew` |
| Kündigen | Button/Dialog | ✅ | `useTerminateContract()` → `POST /contracts/:id/terminate` |
| Tabs (Übersicht, Leistungen, etc.) | Tabs | ⚠️ | Prüfen welche Tabs echte Daten laden |
| Laufzeit-Fortschritt | Progress | ✅ | Frontend-Berechnung aus Start-/Enddatum |

---

## 10. Zahlungen (`src/pages/Payments.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Zahlung erfassen Button | Button | ✅ | Navigation/Dialog |
| Bank-Sync Button | Button | ⚠️ | `use-bank-import.ts` existiert, Funktionalität prüfen |
| Stat-Cards | Stats | ✅ | `usePaymentStatistics()` → `GET /api/payments/statistics` |
| Tabs (Alle, Eingänge, etc.) | Tabs | ✅ | `usePayments({ type })` Filter |
| Suchfeld | Input | ✅ | `usePayments({ search })` |
| Zahlungs-Karte | Card | ✅ | `usePayments()` |
| Zuordnen Button | Button | ✅ | `useReconcilePayment()` → `POST /payments/:id/reconcile` |

### Zahlungsdetails (`src/pages/PaymentDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Betrag/Empfänger/Absender | Cards | ✅ | Aus `usePayment(id)` |
| Zugehörige Rechnungen | Table | ⚠️ | Relation `invoiceId`/`purchaseInvoiceId` prüfen |
| Beleg anzeigen | Button | ❌ | Kein File-Storage-Endpoint für Belege erkennbar |

---

## 11. Kalender (`src/pages/Calendar.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Termin Button | Button | ✅ | Dialog |
| Navigation (Heute, Vor/Zurück) | Buttons | ✅ | Frontend-Logik |
| Monatsansicht | Calendar | ✅ | `useCalendarEvents({ startDate, endDate })` |
| Event-Card/Terminliste | Cards/List | ✅ | Aus `useCalendarEvents()` |

### Termin erstellen

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Titel, Datum, Zeit, Typ | Inputs | ✅ | `useCreateCalendarEvent()` |
| Beschreibung | Textarea | ✅ | `description` Feld |
| ⚠️ Build-Error | TypeScript | ❌ | `'attendee' is possibly 'null'` – Null-Check fehlt |

---

## 12. Dokumente (`src/pages/Documents.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Hochladen Button | Button | ✅ | `useUploadDocument()` → multipart upload |
| Neuer Ordner | Button | ✅ | `useCreateFolder()` |
| Ordnerstruktur | Tree-View | ✅ | `useFolderTree()` mit `buildFolderTree()` |
| Suchfeld | Input | ✅ | `useDMSDocuments({ search })` |
| Filter Typ | Dropdown | ⚠️ | Frontend-Filter oder Backend prüfen |
| Datei-Karten | Grid | ✅ | `useDMSDocuments()` |
| Datei-Aktionen | Dropdown | ✅ | Öffnen, Umbenennen, Verschieben (`useMoveDocument`), Löschen |
| Drag-Drop Upload | Zone | ✅ | `react-dropzone` installiert |

### Dokumentdetails (`src/pages/DocumentDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Herunterladen | Button | ⚠️ | `fileUrl` vorhanden, Download-Logik prüfen |
| Teilen | Button | ❌ | Kein Sharing-Endpoint |
| Vorschau | Preview | ⚠️ | Abhängig von Dateityp |
| Tab: Versionen | Tab | ✅ | `versions` Array + `useUploadNewVersion()` |
| Tab: Verknüpfungen | Tab | ⚠️ | `linkedEntityType`/`linkedEntityId` – Auflösung prüfen |

---

## 13. Einstellungen (`src/pages/Settings.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Tab: Unternehmen | Tab | ❌ | **3017 Zeilen!** Kein `use-settings.ts` Hook – vermutlich komplett Mock/Frontend-only |
| Tab: Lokalisierung | Tab | ❌ | Kein Backend-Endpoint |
| Tab: Währung | Tab | ❌ | Kein Backend-Endpoint |
| Tab: E-Mail (SMTP) | Tab | ❌ | Kein Backend-Endpoint |
| Tab: API | Tab | ❌ | Kein Backend-Endpoint |
| Tab: Sicherheit | Tab | ❌ | Kein Backend-Endpoint |
| Speichern Button | Button | ❌ | Kein Backend-Mutation |

**Cursor-Aufgabe (hoch):** Settings komplett auf Backend umstellen oder einzelne Tabs priorisieren.

---

## 14. Benutzer (`src/pages/Users.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Benutzer Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useUsers({ search })` |
| Filter Rolle | Dropdown | ✅ | `useUsers({ role })` |
| Benutzer-Zeile | Table-Row | ✅ | `useUsers()` |
| Benutzer-Aktionen | Dropdown | ✅ | CRUD via `useCreateUser`, `useUpdateUser`, `useDeleteUser` |

---

## 15. Login/Auth (`src/pages/AuthPage.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| E-Mail Input | Input | ✅ | `AuthContext.login()` |
| Passwort Input | Input | ✅ | `AuthContext.login()` |
| Anmelden Button | Button | ✅ | `POST /api/auth/login` |
| Registrieren | Link/Form | ✅ | `POST /api/auth/register` |
| Passwort vergessen | Link | ⚠️ | Prüfen ob Reset-Endpoint existiert |
| Angemeldet bleiben | Checkbox | ⚠️ | Prüfen ob Token-Persistenz implementiert |

---

## Zusammenfassung: Kritische Lücken

### 🔴 Komplett fehlend (Backend-Endpoints fehlen)
1. **Settings** – Alle Tabs (Lokalisierung, Währung, E-Mail, API, Sicherheit) = pure Frontend-Shell
2. **Aufgaben: Subtasks** – Kein Subtask-Modell
3. **Aufgaben: Kommentare** – Kein Comment-Endpoint
4. **Aufgaben: Anhänge** – Kein Attachment-Endpoint
5. **Kunden: Aktivitäten-Tab** – Kein Activity-Log per Entity
6. **Dokumente: Teilen** – Kein Sharing-Mechanismus
7. **Zahlungen: Beleg anzeigen** – Kein File-Attachment für Payments
8. **Company: Logo-Upload** – Kein Upload-Endpoint
9. **Company: Description** – Feld fehlt im Prisma-Modell

### 🟡 Teilweise / Prüfung nötig (Backend ggf. vorhanden)
1. **Dashboard: Auslastung** – Berechnungslogik prüfen
2. **Kalender-Widget auf Dashboard** – Datenquelle prüfen
3. **Alle PDF-Generierungen** – Endpoints prüfen (jspdf ist client-seitig installiert)
4. **E-Mail-Versand** (Angebote, Rechnungen senden) – SMTP-Config prüfen
5. **Kundendetails: Relationen-Tabs** – Filter nach `customerId` testen
6. **Angebote: Duplizieren** – Endpoint prüfen
7. **Bank-Sync** – `use-bank-import.ts` Funktionalität prüfen
8. **Projekt-Chat** – Kein erkennbares Chat-Backend
9. **Projekt-Timeline/Meilensteine** – Backend-Modell prüfen

### 🔴 Build-Errors (TypeScript)
1. `Calendar.tsx:546` – `attendee` possibly null
2. `ContractCreate.tsx:47` – `name` not in `Partial<Contract>`
3. `Creditors.tsx:392` – `bill.creditor` possibly null
4. `Debtors.tsx:412` – `invoice.debtor` possibly null
5. `DiscountDetail.tsx:260` – `usage.customer` possibly null
6. `Production.tsx:434` – `m` possibly null
7. `PurchaseInvoiceDetail.tsx:241` – `entry.user` possibly null
8. `PurchaseOrderDetail.tsx:638` – `entry.user` possibly null
9. `Reminders.tsx` – Multiple null-check errors (10+ Stellen)

### 🟡 Stats-Berechnung suboptimal
- `useCustomerStats()` lädt alle Kunden (pageSize: 1000) und berechnet client-seitig → **Backend-Stats-Endpoint nötig**
- `useInvoiceStats()` lädt alle Rechnungen (pageSize: 1000) und berechnet client-seitig → **Backend-Stats-Endpoint nötig**

---

## Cursor-Prompt Reihenfolge (Empfehlung)

1. **Zuerst:** TypeScript Build-Errors fixen (Null-Checks, Type-Mismatches)
2. **Dann:** Fehlende Backend-Stats-Endpoints (`/customers/stats`, `/invoices/stats`)
3. **Dann:** Company-Ergänzungen (description, logo-upload, country)
4. **Dann:** Settings-Backend aufbauen (Tab für Tab)
5. **Dann:** Fehlende Relationen (Subtasks, Kommentare, Activity-Log)
6. **Zuletzt:** PDF-Generierung, E-Mail-Versand, Bank-Sync validieren
