# Frontend-Audit: Vollständige Element-Status-Dokumentation

> **Erstellt:** 2026-02-12  
> **Zweck:** Systematische Überprüfung ALLER UI-Elemente auf echte Backend-Anbindung vs. Mock/Platzhalter  
> **Legende:**  
> ✅ = Echte Daten (Hook + API-Call vorhanden)  
> ⚠️ = Hook vorhanden, Backend-Endpoint muss verifiziert werden  
> ❌ = Mock-Daten / Nicht implementiert / Nur Frontend-Logik  
> 🔧 = Teilweise implementiert (z.B. client-seitige Stats statt Backend-Endpoint)  

---

## 1. Dashboard (`src/pages/Index.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Gesamtumsatz | Stat-Card | ✅ | `useDashboardStats()` → `GET /api/dashboard/stats` → `totalRevenue` |
| Aktive Projekte | Stat-Card | ✅ | `useDashboardStats()` → `activeProjects` |
| Kunden | Stat-Card | ✅ | `useDashboardStats()` → `customerCount` |
| Auslastung | Stat-Card | ⚠️ | `utilizationRate` – Backend-Berechnungslogik prüfen |
| Aktive Projekte Widget | Widget | ✅ | `ProjectsOverview` Komponente nutzt Backend-Hook |
| Schnellaktionen | Widget | ✅ | Rein navigatorisch – keine API nötig |
| Kalender Widget | Widget | ⚠️ | `CalendarWidget` – Datenquelle verifizieren |
| Letzte Aktivität | Widget | ✅ | `useRecentActivity()` → `GET /api/dashboard/activity` |

---

## 2. Projekte

### Projekte Liste (`src/pages/Projects.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neues Projekt Button | Button | ✅ | Navigation zu `/projects/new` |
| Suchfeld | Input | ✅ | `useProjects({ search })` mit Backend-Filter |
| Filter-Button/Popover | Filter | ✅ | Status & Priorität als Query-Parameter |
| Filter Status Checkboxen (Aktiv, Planung, Abgeschlossen) | Checkbox | ✅ | `status` Query-Parameter |
| Filter Priorität Checkboxen (Hoch, Mittel, Niedrig) | Checkbox | ✅ | `priority` Query-Parameter |
| Filter zurücksetzen | Button | ✅ | Frontend-Reset |
| Grid-Ansicht Toggle | Button | ✅ | Frontend-only |
| Listen-Ansicht Toggle | Button | ✅ | Frontend-only |
| Stat-Card Gesamt (klickbar) | Stat-Card | ✅ | `useProjectStats()` → `GET /api/projects/stats` |
| Stat-Card Aktiv (klickbar) | Stat-Card | ✅ | `useProjectStats()` |
| Stat-Card Abgeschlossen (klickbar) | Stat-Card | ✅ | `useProjectStats()` |
| Stat-Card Pausiert (klickbar) | Stat-Card | ✅ | `useProjectStats()` |
| Projekt-Karte (klickbar) | Card | ✅ | `useProjects()` Daten |
| Projekt-Aktionen: Details anzeigen | Dropdown-Item | ✅ | Navigation |
| Projekt-Aktionen: Bearbeiten | Dropdown-Item | ✅ | Navigation |
| Projekt-Aktionen: Löschen | Dropdown-Item | ✅ | `useDeleteProject()` |

### Projekt erstellen (`src/pages/ProjectCreate.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Projektname | Input | ✅ | `useCreateProject()` |
| Kunde auswählen | Dropdown | ⚠️ | Prüfen ob Kundenliste via `useCustomers()` geladen wird |
| Startdatum | Datepicker | ✅ | `startDate` Feld |
| Enddatum | Datepicker | ✅ | `endDate` Feld |
| Budget | Input | ✅ | `budget` Feld |
| Status | Dropdown | ✅ | Enum im Backend |
| Priorität | Dropdown | ✅ | Enum im Backend |
| Beschreibung | Textarea | ✅ | `description` Feld |
| Abbrechen | Button | ✅ | Navigation |
| Projekt anlegen | Button | ✅ | `useCreateProject().mutateAsync()` |

### Projektdetails (`src/pages/ProjectDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Tab: Aufgaben | Tab | ⚠️ | Tasks nach `projectId` filtern – Backend-Support prüfen |
| Tab: Team | Tab | ⚠️ | `members` Relation – Backend prüfen |
| Tab: Dokumente | Tab | ⚠️ | DMS mit `projectId` Filter |
| Tab: Budget | Tab | ⚠️ | `budget`/`spent` vorhanden, Detailberechnung prüfen |
| Tab: Zeiterfassung | Tab | ✅ | `useTimeEntries({ projectId })` Hook vorhanden |
| Tab: Chat | Tab | ✅ | `useMessages({ projectId })` → `GET /api/messages` |
| Tab: Timeline | Tab | ⚠️ | Meilensteine – Backend-Modell prüfen |
| Bearbeiten Button | Button | ✅ | `useUpdateProject()` |
| Löschen Button | Button | ✅ | `useDeleteProject()` |
| Status-Badge | Badge | ✅ | Aus `project.status` |
| Fortschrittsbalken | Progress | ✅ | Aus `project.progress` |

---

## 3. Aufgaben

### Aufgaben Liste (`src/pages/Tasks.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Aufgabe Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useTasks({ search })` |
| Filter Status | Dropdown | ✅ | `status` Query-Parameter |
| Filter Priorität | Dropdown | ✅ | `priority` Query-Parameter |
| Kanban-Column Offen | Column | ⚠️ | Frontend-Gruppierung – Drag&Drop Persistenz prüfen |
| Kanban-Column In Arbeit | Column | ⚠️ | Drag&Drop → `useUpdateTask()` Status-Update prüfen |
| Kanban-Column Erledigt | Column | ⚠️ | Drag&Drop Persistenz prüfen |
| Aufgaben-Karte | Card | ✅ | `useTasks()` Daten |
| Aufgaben-Aktionen | Dropdown | ✅ | CRUD via Hooks |

### Aufgabe erstellen (`src/pages/TaskCreate.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Titel | Input | ✅ | `useCreateTask()` |
| Projekt-Dropdown | Dropdown | ⚠️ | Projektliste laden prüfen |
| Beschreibung | Textarea | ✅ | `description` Feld |
| Priorität | Dropdown | ✅ | Enum im Hook |
| Fälligkeitsdatum | Datepicker | ✅ | `dueDate` Feld |
| Zuständiger | Dropdown | ✅ | Lädt Users via `api.get('/users')` |
| Abbrechen | Button | ✅ | Navigation |
| Aufgabe anlegen | Button | ✅ | `useCreateTask().mutateAsync()` |

### Aufgabendetails (`src/pages/TaskDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Status-Checkbox | Checkbox | ⚠️ | `useUpdateTask()` – Persistenz prüfen |
| Bearbeiten | Button | ✅ | `useUpdateTask()` |
| Löschen | Button | ✅ | `useDeleteTask()` |
| Subtasks/Checkliste | List | ❌ | **Kein Subtask-Modell** im Hook/Backend |
| Neuer Subtask Input | Input | ❌ | Kein Backend |
| Kommentar schreiben | Textarea | ❌ | **Kein Comment-Endpoint** |
| Kommentar senden | Button | ❌ | Kein Backend |
| Anhang hochladen | Upload | ❌ | **Kein Attachment-Endpoint** für Tasks |

---

## 4. Kunden

### Kunden Liste (`src/pages/Customers.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Kunde Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useCustomers({ search })` |
| Filter-Button | Button | ⚠️ | Filter-Popover prüfen |
| Stat-Card Gesamt | Stat-Card | 🔧 | `useCustomerStats()` – client-seitig (pageSize:1000) |
| Stat-Card Aktiv | Stat-Card | 🔧 | Client-seitige Berechnung |
| Stat-Card Interessenten | Stat-Card | 🔧 | Client-seitige Berechnung |
| Stat-Card Umsatz | Stat-Card | 🔧 | Client-seitige Berechnung |
| Kunden-Zeile (klickbar) | Table-Row | ✅ | `useCustomers()` |
| Kunden-Aktionen | Dropdown | ✅ | CRUD via Hooks |

### Kunde erstellen (`src/pages/CustomerCreate.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Firma | Input | ✅ | `useCreateCustomer()` |
| Vorname | Input | ✅ | |
| Nachname | Input | ✅ | |
| E-Mail | Input | ✅ | |
| Telefon | Input | ✅ | |
| Strasse | Input | ✅ | |
| PLZ | Input | ✅ | |
| Ort | Input | ✅ | |
| UID-Nummer | Input | ✅ | |
| Abbrechen | Button | ✅ | Navigation |
| Kunde anlegen | Button | ✅ | Mutation |

### Kundendetails (`src/pages/CustomerDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Tab: Übersicht | Tab | ✅ | `useCustomer(id)` |
| Tab: Projekte | Tab | ⚠️ | Filter `useProjects({ customerId })` testen |
| Tab: Dokumente | Tab | ⚠️ | DMS-Filter nach Kunde testen |
| Tab: Rechnungen | Tab | ⚠️ | `useInvoices({ customerId })` testen |
| Tab: Verträge | Tab | ⚠️ | `useContracts({ customerId })` testen |
| Tab: Aktivitäten | Tab | ❌ | **Kein Activity-Log per Entity** |
| Bearbeiten | Button | ✅ | `useUpdateCustomer()` |
| Löschen | Button | ✅ | `useDeleteCustomer()` |

---

## 5. Angebote

### Angebote Liste (`src/pages/Quotes.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neues Angebot Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useQuotes({ search })` (via `use-sales.ts`) |
| Filter-Button | Button | ⚠️ | Filter-Popover prüfen |
| Stat-Card Gesamtwert | Stat-Card | ⚠️ | Prüfen ob Stats-Endpoint existiert |
| Stat-Card Angenommen | Stat-Card | ⚠️ | |
| Stat-Card Offen | Stat-Card | ⚠️ | |
| Stat-Card Conversion | Stat-Card | ⚠️ | |
| Angebots-Zeile (klickbar) | Table-Row | ✅ | `useQuotes()` |
| Angebots-Aktionen: Details | Dropdown-Item | ✅ | Navigation |
| Angebots-Aktionen: Duplizieren | Dropdown-Item | ⚠️ | Endpoint prüfen |
| Angebots-Aktionen: PDF | Dropdown-Item | ⚠️ | PDF-Generierung prüfen |
| Angebots-Aktionen: Löschen | Dropdown-Item | ⚠️ | Delete-Hook prüfen (nicht in use-sales.ts) |

### Angebot erstellen (`src/pages/QuoteCreate.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Kunde auswählen | Dropdown | ⚠️ | Kundenliste laden prüfen |
| Gültig bis | Datepicker | ✅ | `validUntil` Feld |
| Position hinzufügen | Button/Dialog | ⚠️ | Produkt-Auswahl via `useProducts()` prüfen |
| Produkt auswählen Dialog | Dialog | ⚠️ | |
| Positionsliste editierbar | Table | ✅ | Items-Array |
| Menge/Einzelpreis Inputs | Inputs | ✅ | |
| Position löschen | Button | ✅ | Frontend-Array |
| Notizen | Textarea | ✅ | `notes` Feld |
| Berechnungen (Zwischensumme, MwSt, Total) | Display | ✅ | Frontend-Berechnung |
| Als Entwurf speichern | Button | ✅ | `useCreateQuote()` mit Status DRAFT |
| Angebot senden | Button | ✅ | Status SENT |

### Angebotsdetails (`src/pages/QuoteDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| PDF herunterladen | Button | ⚠️ | PDF-Endpoint prüfen |
| Angebot senden | Button | ⚠️ | E-Mail-Endpoint prüfen |
| Duplizieren | Button | ⚠️ | Duplicate-Endpoint prüfen |
| In Auftrag umwandeln | Button | ✅ | `useConvertQuoteToOrder()` → `POST /quotes/:id/convert-to-order` |
| Status ändern Dialog | Dialog | ⚠️ | `useUpdateQuote()` mit Status-Feld |
| In Auftrag umwandeln Dialog | Dialog | ✅ | |
| Positionen | Table | ✅ | Aus `useQuote(id)` |
| Löschen | Button | ⚠️ | Delete-Hook prüfen |

---

## 6. Aufträge

### Aufträge Liste (`src/pages/Orders.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Auftrag Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useOrders({ search })` |
| Filter Status Checkboxen | Checkbox | ✅ | Query-Parameter |
| Filter Priorität Checkboxen | Checkbox | ⚠️ | Prüfen ob Backend `priority` bei Orders unterstützt |
| Stat-Card Gesamt | Stat-Card | ⚠️ | Stats-Endpoint prüfen |
| Stat-Card Aktiv | Stat-Card | ⚠️ | |
| Stat-Card Wert | Stat-Card | ⚠️ | |
| Stat-Card Versendet | Stat-Card | ⚠️ | |
| Auftrags-Zeile (klickbar) | Table-Row | ✅ | `useOrders()` |
| Auftrags-Aktionen: Details | Dropdown-Item | ✅ | Navigation |
| Auftrags-Aktionen: Lieferschein erstellen | Dropdown-Item | ✅ | `useCreateDeliveryNoteFromOrder()` |
| Auftrags-Aktionen: Rechnung erstellen | Dropdown-Item | ✅ | `useCreateInvoiceFromOrder()` |
| Auftrags-Aktionen: Löschen | Dropdown-Item | ⚠️ | Delete-Hook für Orders prüfen |

### Auftragsdetails (`src/pages/OrderDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Lieferschein erstellen | Button | ✅ | `useCreateDeliveryNoteFromOrder()` |
| Rechnung erstellen | Button | ✅ | `useCreateInvoiceFromOrder()` |
| Positionen | Table | ✅ | Aus `useOrder(id)` |
| Fortschrittsbalken | Progress | ⚠️ | Berechnung prüfen |
| Verknüpfte Dokumente (Lieferscheine, Rechnungen, Angebot) | Card | ⚠️ | Relationen prüfen |

---

## 7. Rechnungen

### Rechnungen Liste (`src/pages/Invoices.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Rechnung Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useInvoices({ search })` |
| Stat-Card Gesamt | Stat-Card | 🔧 | `useInvoiceStats()` – client-seitig (pageSize:1000) |
| Stat-Card Bezahlt | Stat-Card | 🔧 | Client-seitige Berechnung |
| Stat-Card Ausstehend | Stat-Card | 🔧 | Client-seitige Berechnung |
| Stat-Card Überfällig | Stat-Card | 🔧 | Client-seitige Berechnung |
| Rechnungs-Zeile (klickbar) | Table-Row | ✅ | `useInvoices()` |
| Rechnungs-Aktionen: Details | Dropdown-Item | ✅ | Navigation |
| Rechnungs-Aktionen: PDF | Dropdown-Item | ⚠️ | PDF-Generierung (jspdf client-seitig) |
| Rechnungs-Aktionen: Mahnung | Dropdown-Item | ✅ | `useCreateReminder()` |
| Rechnungs-Aktionen: Zahlung erfassen | Dropdown-Item | ✅ | `useRecordPayment()` |
| Rechnungs-Aktionen: Löschen | Dropdown-Item | ⚠️ | Delete prüfen |

### Rechnungsdetails (`src/pages/InvoiceDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| PDF herunterladen | Button | ⚠️ | Client-seitige jspdf oder Backend-Endpoint? |
| QR-Rechnung | Button | ⚠️ | `QRInvoice.tsx` existiert, qrcode Lib installiert |
| Rechnung senden | Button | ✅ | `useSendInvoice()` → `POST /invoices/:id/send` |
| Zahlung erfassen Dialog | Dialog | ✅ | `useRecordPayment()` → `POST /invoices/:id/payment` |
| Zahlung erfassen: Betrag, Datum, Zahlungsart, Referenz | Inputs | ✅ | |
| Positionen | Table | ✅ | Aus `useInvoice(id)` |
| Zahlungsinformationen | Card | ⚠️ | `paidAmount`, `openAmount` Backend-Berechnung prüfen |

---

## 8. Lieferscheine

### Lieferscheine Liste (`src/pages/DeliveryNotes.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Lieferschein Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useDeliveryNotes({ search })` |
| Stat-Card Gesamt | Stat-Card | ⚠️ | Kein dedizierter Stats-Endpoint im Hook |
| Stat-Card Unterwegs | Stat-Card | ⚠️ | Frontend-Berechnung? |
| Stat-Card Zugestellt | Stat-Card | ⚠️ | |
| Stat-Card Vorbereitet | Stat-Card | ⚠️ | |
| Lieferschein-Zeile (klickbar) | Table-Row | ✅ | `useDeliveryNotes()` |

### Lieferscheindetails (`src/pages/DeliveryNoteDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Tracking-Nummer | Input | ✅ | `trackingNumber` in `useUpdateDeliveryNote()` |
| Versanddienstleister | Dropdown | ✅ | `carrier` Feld |
| Positionen | Table | ✅ | Aus `useDeliveryNote(id)` |
| Lieferadresse | Display | ✅ | `deliveryAddress` Feld |
| PDF generieren | Button | ⚠️ | Endpoint prüfen |

---

## 9. Verträge

### Verträge Liste (`src/pages/Contracts.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Vertrag Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useContracts({ search })` |
| Filter Typ | Popover | ⚠️ | Backend-Filter prüfen |
| Filter Auto-Verlängerung | Checkbox | ⚠️ | Backend-Filter prüfen |
| Stat-Card Gesamt (klickbar) | Stat-Card | ✅ | `useContractStats()` → `GET /api/contracts/stats` |
| Stat-Card Aktiv (klickbar) | Stat-Card | ✅ | |
| Stat-Card Laufend aus (klickbar) | Stat-Card | ✅ | |
| Stat-Card Wert | Stat-Card | ✅ | |
| Auslaufende Verträge Alert | Alert | ✅ | `useExpiringContracts()` → `GET /api/contracts/expiring` |
| Vertrags-Zeile (klickbar) | Table-Row | ✅ | `useContracts()` |
| Vertrags-Aktionen: Details | Dropdown-Item | ✅ | Navigation |
| Vertrags-Aktionen: Verlängern | Dropdown-Item | ✅ | `useRenewContract()` |
| Vertrags-Aktionen: Kündigen | Dropdown-Item | ✅ | `useTerminateContract()` |
| Vertrags-Aktionen: Duplizieren | Dropdown-Item | ⚠️ | Kein Duplicate-Hook |
| Vertrags-Aktionen: Löschen | Dropdown-Item | ✅ | `useDeleteContract()` |

### Vertrag erstellen (`src/pages/ContractCreate.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Vertragsbezeichnung | Input | ❌ | **BUILD-ERROR**: `name` not in `Partial<Contract>` – Mapping prüfen (sollte `title` sein) |
| Kunde | Dropdown | ⚠️ | Kundenliste laden |
| Vertragsart | Dropdown | ✅ | `type` Feld |
| Vertragswert | Input | ✅ | `value` Feld |
| Startdatum | Datepicker | ✅ | `startDate` Feld |
| Enddatum | Datepicker | ✅ | `endDate` Feld |
| Kündigungsfrist | Dropdown | ✅ | `noticePeriodDays` Feld |
| Automatische Verlängerung | Switch | ✅ | `autoRenew` Feld |
| Beschreibung | Textarea | ✅ | `description` Feld |
| Abbrechen | Button | ✅ | Navigation |
| Vertrag anlegen | Button | ✅ | `useCreateContract()` |

### Vertragsdetails (`src/pages/ContractDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Verlängern Button/Dialog | Button | ✅ | `useRenewContract()` → `POST /contracts/:id/renew` |
| Kündigen Button/Dialog | Button | ✅ | `useTerminateContract()` → `POST /contracts/:id/terminate` |
| Verlängerungs-Dialog (Laufzeit, Enddatum, Preis) | Dialog | ✅ | |
| Kündigungs-Dialog (Datum, Grund, Notizen) | Dialog | ✅ | |
| Tab: Übersicht | Tab | ✅ | `useContract(id)` |
| Tab: Leistungen | Tab | ⚠️ | Backend-Modell prüfen |
| Tab: Zahlungen | Tab | ⚠️ | Zahlungs-Relation prüfen |
| Tab: Dokumente | Tab | ⚠️ | DMS-Verknüpfung prüfen |
| Tab: Historie | Tab | ✅ | `renewalHistory` Array |
| Laufzeit-Fortschritt | Progress | ✅ | Frontend-Berechnung |

---

## 10. Zahlungen

### Zahlungen Liste (`src/pages/Payments.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Zahlung erfassen Button | Button | ✅ | Navigation/Dialog |
| Bank-Sync Button | Button | ✅ | `useImportCamt054()` → camt.054 Import vorhanden |
| Stat-Card Eingänge | Stat-Card | ✅ | `usePaymentStatistics()` → `GET /api/payments/statistics` |
| Stat-Card Ausgänge | Stat-Card | ✅ | |
| Stat-Card Saldo | Stat-Card | ✅ | |
| Stat-Card Nicht zugeordnet | Stat-Card | ✅ | `pendingPayments` |
| Tab: Alle | Tab | ✅ | `usePayments()` |
| Tab: Eingänge | Tab | ✅ | `usePayments({ type: 'INCOMING' })` |
| Tab: Ausgänge | Tab | ✅ | `usePayments({ type: 'OUTGOING' })` |
| Tab: Nicht zugeordnet | Tab | ⚠️ | Prüfen ob `status` Filter funktioniert |
| Suchfeld | Input | ✅ | `usePayments({ search })` |
| Zahlungs-Karte (klickbar) | Card | ✅ | `usePayments()` |
| Zuordnen Button | Button | ✅ | `useReconcilePayment()` → `POST /payments/:id/reconcile` |
| Zahlungs-Aktionen | Dropdown | ✅ | CRUD Hooks |

### Zahlungsdetails (`src/pages/PaymentDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Betrag Card | Card | ✅ | Aus `usePayment(id)` |
| Empfänger Card | Card | ✅ | customer/supplier Relation |
| Absender Card | Card | ✅ | |
| Zugehörige Rechnungen | Table | ⚠️ | `invoiceId`/`purchaseInvoiceId` Relation prüfen |
| Metadaten | Display | ✅ | |
| Beleg anzeigen | Button | ❌ | **Kein File-Attachment für Payments** |

---

## 11. Kalender (`src/pages/Calendar.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Termin Button | Button | ✅ | Dialog |
| Heute Button | Button | ✅ | Frontend-Navigation |
| Vorheriger/Nächster Monat | Buttons | ✅ | Frontend-Navigation |
| Monatsansicht (klickbar) | Calendar-View | ✅ | `useCalendarEvents({ startDate, endDate })` |
| Event-Card (klickbar) | Card | ✅ | Aus `useCalendarEvents()` |
| Terminliste | List | ✅ | Gefiltert nach Tag |
| **BUILD-ERROR** | TypeScript | ❌ | `attendee` possibly null (Zeile 546/550) |

### Termin erstellen

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Titel | Input | ✅ | `useCreateCalendarEvent()` |
| Datum | Datepicker | ✅ | |
| Startzeit | Timepicker | ✅ | `startDate` |
| Endzeit | Timepicker | ✅ | `endDate` |
| Typ | Dropdown | ✅ | `type` Feld |
| Beschreibung | Textarea | ✅ | `description` Feld |
| Abbrechen | Button | ✅ | |
| Termin anlegen | Button | ✅ | `useCreateCalendarEvent().mutateAsync()` |

---

## 12. Dokumente

### Dokumente Liste (`src/pages/Documents.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Hochladen Button | Button | ✅ | `useUploadDocument()` → multipart upload |
| Neuer Ordner | Button | ✅ | `useCreateFolder()` |
| Ordnerstruktur (Tree-View) | Tree-View | ✅ | `useFolderTree()` mit `buildFolderTree()` |
| Suchfeld | Input | ✅ | `useDMSDocuments({ search })` |
| Filter Typ | Dropdown | ⚠️ | Frontend-Filter oder Backend prüfen |
| Datei-Karten (Grid) | Grid | ✅ | `useDMSDocuments()` |
| Datei-Aktionen: Öffnen | Dropdown-Item | ⚠️ | `fileUrl` direkt |
| Datei-Aktionen: Herunterladen | Dropdown-Item | ⚠️ | Download-Logik prüfen |
| Datei-Aktionen: Umbenennen | Dropdown-Item | ✅ | `useUpdateDocument()` |
| Datei-Aktionen: Verschieben | Dropdown-Item | ✅ | `useMoveDocument()` |
| Datei-Aktionen: Löschen | Dropdown-Item | ✅ | `useDeleteDocument()` |
| Drag-Drop Upload | Zone | ✅ | `react-dropzone` installiert |

### Upload-Dialog

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Datei auswählen | File-Input | ✅ | |
| Drop-Zone | Drag-Drop | ✅ | |
| Ordner | Dropdown | ✅ | `folderId` |
| Tags | Tag-Input | ⚠️ | Tags im Backend prüfen |
| Beschreibung | Textarea | ✅ | `description` |
| Hochladen | Button | ✅ | `useUploadDocument()` |
| Upload-Fortschritt | Progress-Bar | ⚠️ | Frontend Progress prüfen |

### Dokumentdetails (`src/pages/DocumentDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Herunterladen | Button | ⚠️ | `fileUrl` vorhanden |
| Teilen | Button | ❌ | **Kein Sharing-Endpoint** |
| Dateivorschau | Preview | ⚠️ | Abhängig von Dateityp |
| Tab: Details | Tab | ✅ | Metadaten aus `useDMSDocument(id)` |
| Tab: Versionen | Tab | ✅ | `versions` Array + `useUploadNewVersion()` |
| Tab: Verknüpfungen | Tab | ⚠️ | `linkedEntityType`/`linkedEntityId` Auflösung prüfen |

---

## 13. Produkte & Lager

### Produkte (`src/pages/Products.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neues Produkt Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useProducts({ search })` |
| Filter Kategorie | Dropdown | ✅ | `useProductCategories()` |
| Stat-Cards | Stats | 🔧 | `useProductStats()` – client-seitig (pageSize:1000) |
| Produkt-Karte/Zeile | Card/Row | ✅ | `useProducts()` |
| CRUD Aktionen | Buttons | ✅ | Alle Hooks vorhanden |

### Produktdetails (`src/pages/ProductDetail.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Bestandsanpassung | Button | ✅ | `useAdjustStock()` → `POST /products/:id/adjust-stock` |
| Kategorien | Display | ✅ | `useProductCategories()` |

### Inventar (`src/pages/Inventory.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Bestandsübersicht | Display | ⚠️ | Prüfen ob eigener Inventory-Endpoint oder Products |
| Low-Stock Warnung | Alert | 🔧 | `useProductStats()` berechnet `lowStock` client-seitig |

---

## 14. Lieferanten

### Lieferanten Liste (`src/pages/Suppliers.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Lieferant Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useSuppliers({ search })` |
| Stat-Cards | Stats | 🔧 | `useSupplierStats()` – client-seitig (pageSize:1000) |
| Lieferanten-Zeile | Table-Row | ✅ | `useSuppliers()` |
| CRUD Aktionen | Buttons | ✅ | Alle Hooks vorhanden |

---

## 15. Einkauf

### Bestellungen (`src/pages/PurchaseOrders.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Bestellung Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `usePurchaseOrders({ search })` |
| Stat-Cards | Stats | ✅ | `usePurchaseOrderStatistics()` → `GET /api/purchase-orders/statistics` |
| Bestellungs-Zeile | Table-Row | ✅ | `usePurchaseOrders()` |
| CRUD Aktionen | Buttons | ✅ | Alle Hooks + `useSendPurchaseOrder()` |
| **BUILD-ERROR** | TypeScript | ❌ | `entry.user` possibly null (PurchaseOrderDetail.tsx:638) |

### Eingangsrechnungen (`src/pages/PurchaseInvoices.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Eingangsrechnung Button | Button | ✅ | Navigation |
| PDF-Import (OCR) | Button | ✅ | `useExtractOcrData()` → `POST /purchase-invoices/extract-ocr` |
| Stat-Cards | Stats | ✅ | `usePurchaseInvoiceStatistics()` → `GET /api/purchase-invoices/statistics` |
| Eingangsrechnung-Zeile | Table-Row | ✅ | `usePurchaseInvoices()` |
| Aus Bestellung erstellen | Button | ✅ | `useCreatePurchaseInvoiceFromOrder()` |
| Genehmigen | Button | ✅ | `useApprovePurchaseInvoice()` |
| **BUILD-ERROR** | TypeScript | ❌ | `entry.user` possibly null (PurchaseInvoiceDetail.tsx:241) |

---

## 16. Produktion

### Produktion (`src/pages/Production.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Werkstattauftrag Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useProductionOrders({ search })` |
| Stat-Cards | Stats | ✅ | `useProductionStatistics()` → `GET /api/production-orders/statistics` |
| Kapazitätsübersicht | Display | ✅ | `useCapacityOverview()` |
| Werkstattauftrags-Zeile | Table-Row | ✅ | `useProductionOrders()` |
| Zeitbuchung | Button | ✅ | `useBookProductionTime()` |
| Operation abschliessen | Button | ✅ | `useCompleteProductionOperation()` |
| **BUILD-ERROR** | TypeScript | ❌ | `m` possibly null (Production.tsx:434) |

### Stücklisten (BOM) (`src/pages/BillOfMaterials.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Stückliste Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useBoms({ search })` |
| BOM-Liste | Table | ✅ | `useBoms()` |
| Vorlagen | Display | ✅ | `useBomTemplates()` |
| Duplizieren | Button | ✅ | `useDuplicateBom()` |
| CRUD | Buttons | ✅ | Alle Hooks vorhanden |

### Kalkulation (`src/pages/Calculation.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Hooks vorhanden | - | ✅ | `use-calculations.ts` existiert |
| Detailberechnung | - | ⚠️ | Backend-Logik prüfen |

---

## 17. Qualitätskontrolle

### QK (`src/pages/QualityControl.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Prüfung Button | Button | ✅ | Navigation |
| Stat-Cards | Stats | ✅ | `useQualityStatistics()` → `GET /api/quality/checks/statistics` |
| Prüfungs-Liste | Table | ✅ | `useQualityChecks()` |
| Prüfung abschliessen | Button | ✅ | `useCompleteQualityCheck()` |
| CRUD | Buttons | ✅ | Alle Hooks vorhanden |

### Checklisten (`src/pages/QualityChecklists.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Checklisten-Liste | Table | ✅ | `useQualityChecklists()` |
| Vorlagen | Display | ✅ | `useChecklistTemplates()` |
| CRUD | Buttons | ✅ | Alle Hooks vorhanden |

---

## 18. Service-Tickets

### Service (`src/pages/Service.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neues Ticket Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useServiceTickets({ search })` |
| Stat-Cards | Stats | ✅ | `useServiceStatistics()` → `GET /api/service-tickets/statistics` |
| Tickets-Liste | Table | ✅ | `useServiceTickets()` |
| Techniker zuweisen | Button | ✅ | `useScheduleTechnician()` |
| Service-Bericht | Button | ✅ | `useAddServiceReport()` |
| Wartungsplanung | Display | ✅ | `useUpcomingMaintenance()` |
| Techniker-Verfügbarkeit | Display | ✅ | `useTechnicianAvailability()` |
| CRUD | Buttons | ✅ | Alle Hooks vorhanden |

---

## 19. Mahnwesen

### Mahnungen (`src/pages/Reminders.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Mahnung Button | Button | ✅ | `useCreateReminder()` |
| Sammelmahnungen | Button | ✅ | `useCreateBatchReminders()` |
| Stat-Cards | Stats | ✅ | `useReminderStatistics()` → `GET /api/reminders/statistics` |
| Überfällige Rechnungen | Display | ✅ | `useOverdueInvoices()` |
| Mahnung senden | Button | ✅ | `useSendReminder()` |
| **BUILD-ERRORS** | TypeScript | ❌ | 10+ Null-Check Fehler (customer, invoice possibly null) |

---

## 20. Gutschriften

### Gutschriften (`src/pages/CreditNotes.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Gutschrift Button | Button | ✅ | Navigation |
| Gutschrift aus Rechnung | Button | ✅ | `useCreateCreditNoteFromInvoice()` |
| Gutschrift-Liste | Table | ✅ | `useCreditNotes()` |
| CRUD | Buttons | ✅ | Alle Hooks vorhanden |

---

## 21. Buchhaltung / Finanzen

### Kontenplan (`src/pages/ChartOfAccounts.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Konten-Liste | Table | ✅ | `useAccounts()` → `GET /api/finance/accounts` |
| Konto erstellen | Button | ✅ | `useCreateAccount()` |
| CRUD | Buttons | ✅ | |

### Journalbuchungen (`src/pages/JournalEntries.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neue Buchung Button | Button | ✅ | Navigation |
| Buchungs-Liste | Table | ✅ | `useJournalEntries()` |
| Buchung buchen | Button | ✅ | `usePostJournalEntry()` |
| Stornierung | Button | ✅ | `useReverseJournalEntry()` |
| Saldenliste | Display | ✅ | `useTrialBalance()` |
| Kontosaldo | Display | ✅ | `useAccountBalance()` |

### Bilanz (`src/pages/BalanceSheet.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Bilanz-Report | Display | ✅ | `useBalanceSheet()` → `GET /api/finance/balance-sheet` |

### Bankkonten (`src/pages/BankAccounts.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Bankkonto-Liste | Table | ✅ | `useBankAccounts()` → `GET /api/finance/bank-accounts` |
| CRUD | Buttons | ✅ | |

### Bank-Import (`src/pages/BankImport.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| camt.054 Import | Upload | ✅ | `useImportCamt054()` |
| Transaktionen-Liste | Table | ✅ | `useBankTransactions()` |
| Zuordnungsvorschläge | Display | ✅ | `useReconciliationSuggestions()` |
| Auto-Zuordnung | Button | ✅ | `useAutoReconcile()` |
| Import-Statistiken | Stats | ✅ | `useBankImportStats()` |

### Debitoren (`src/pages/Debtors.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Offene Posten | Display | ✅ | `useOpenItems()` |
| **BUILD-ERROR** | TypeScript | ❌ | `invoice.debtor` possibly null (Zeile 412) |

### Kreditoren (`src/pages/Creditors.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Offene Lieferantenrechnungen | Display | ✅ | Via `usePurchaseInvoices()` |
| **BUILD-ERROR** | TypeScript | ❌ | `bill.creditor` possibly null (Zeile 392) |

### Anlagevermögen (`src/pages/FixedAssets.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Anlagen-Liste | Table | ✅ | `useFixedAssets()` |
| Statistiken | Stats | ✅ | `useFixedAssetStatistics()` |
| Abschreibung-Schedule | Display | ✅ | `useDepreciationSchedule()` |
| Abschreibung ausführen | Button | ✅ | `useRunDepreciation()` |
| Anlage ausbuchen | Button | ✅ | `useDisposeFixedAsset()` |

### Kostenstellen (`src/pages/CostCenters.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Kostenstellen-Liste | Table | ✅ | `use-cost-centers.ts` vorhanden |
| CRUD | Buttons | ✅ | |

### Kassenbuch (`src/pages/CashBook.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Kassenbuch | Display | ✅ | `use-cash-book.ts` vorhanden |

### MWST-Abrechnungen (`src/pages/VatReturns.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| MWST-Abrechnungen | Display | ✅ | `use-vat-returns.ts` vorhanden |

### Budgets (`src/pages/Budgets.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Budget-Liste | Table | ✅ | `use-budgets.ts` vorhanden |
| CRUD | Buttons | ✅ | |

---

## 22. Marketing

### Kampagnen (`src/pages/Campaigns.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Kampagnen-Liste | Table | ✅ | `useCampaigns()` → `GET /api/marketing/campaigns` |
| Stats | Stats | ✅ | `useMarketingStats()` – kombiniert Campaign + Lead Stats |
| CRUD | Buttons | ✅ | Alle Hooks vorhanden |

### Leads (`src/pages/Leads.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Leads-Liste | Table | ✅ | `useLeads()` → `GET /api/marketing/leads` |
| Lead-Aktivitäten | Display | ✅ | `useLeadActivities()` |
| Lead konvertieren | Button | ✅ | `useConvertLead()` |
| CRUD | Buttons | ✅ | Alle Hooks vorhanden |

### E-Mail-Marketing (`src/pages/EmailMarketing.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| E-Mail-Kampagnen | Table | ✅ | `useEmailCampaigns()` |
| Kampagne senden | Button | ✅ | `useSendEmailCampaign()` |

---

## 23. HR / Personal

### Mitarbeiter (`src/pages/HR.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Mitarbeiter-Liste | Table | ✅ | `useEmployees()` → `GET /api/employees` |
| Stats | Stats | ✅ | `useEmployeeStats()` → `GET /api/employees/stats` |
| Abteilungen | Display | ✅ | `useDepartments()` |
| CRUD | Buttons | ✅ | Alle Hooks vorhanden |

### Abwesenheiten (`src/pages/Absences.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Abwesenheiten-Liste | Table | ✅ | `useAbsences()` |
| CRUD | Buttons | ✅ | Alle Hooks vorhanden |

### Lohnbuchhaltung (`src/pages/Payroll.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Lohn-Übersicht | Display | ⚠️ | Prüfen welche Hooks genutzt werden |
| GAV Metallbau | Display | ✅ | `use-gav-metallbau.ts` vorhanden |
| Quellensteuer | Display | ✅ | `use-withholding-tax.ts` vorhanden |
| Swissdec | Display | ✅ | `use-swissdec.ts` vorhanden |

### Abteilungen (`src/pages/Departments.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Abteilungen-Liste | Table | ✅ | `useDepartments()` |
| CRUD | Buttons | ✅ | |

### Rekrutierung (`src/pages/Recruiting.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Stellenausschreibungen | Table | ✅ | `useJobPostings()` |
| Kandidaten-Pipeline (Kanban) | Display | ✅ | `useCandidatePipeline()` |
| Bewerber-Liste | Table | ✅ | `useCandidates()` |
| Interview planen | Button | ✅ | `useCreateInterview()` |
| Einstellen | Button | ✅ | `useHireCandidate()` |
| Stelle veröffentlichen | Button | ✅ | `usePublishJobPosting()` |
| Stats | Stats | ✅ | `useRecruitingStats()` |

### Weiterbildung (`src/pages/Training.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Schulungen-Liste | Table | ✅ | `useTrainings()` |
| Teilnehmer-Verwaltung | Buttons | ✅ | `useRegisterForTraining()`, `useRemoveParticipant()` |
| Schulung abschliessen | Button | ✅ | `useMarkTrainingComplete()` |
| Stats | Stats | ✅ | `useTrainingStats()` |
| Kommende Schulungen | Display | ✅ | `useUpcomingTrainings()` |
| Mitarbeiter-Schulungen | Display | ✅ | `useEmployeeTrainings()` |
| Report generieren | Button | ✅ | `useGenerateTrainingReport()` |

---

## 24. Online-Shop / E-Commerce

### Shop (`src/pages/Shop.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Shop-Bestellungen | Table | ✅ | `useShopOrders()` → `GET /api/ecommerce/orders` |
| Bestellung stornieren | Button | ✅ | `useCancelShopOrder()` |
| Status ändern | Button | ✅ | `useUpdateShopOrderStatus()` |
| Stats | Stats | ✅ | `useEcommerceStats()` |

### Rabatte (`src/pages/Discounts.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Rabatt-Liste | Table | ✅ | `useDiscounts()` |
| Code validieren | Button | ✅ | `useValidateDiscountCode()` |
| CRUD | Buttons | ✅ | |
| **BUILD-ERROR** | TypeScript | ❌ | `usage.customer` possibly null (DiscountDetail.tsx:260) |

### Bewertungen (`src/pages/Reviews.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Bewertungen-Liste | Table | ✅ | `useReviews()` |
| Bewertung genehmigen | Button | ✅ | `useApproveReview()` |
| Antworten | Button | ✅ | `useRespondToReview()` |

---

## 25. Zeiterfassung (`src/pages/TimeTracking.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Zeiteinträge-Liste | Table | ✅ | `useTimeEntries()` |
| Alle Einträge (Admin) | Table | ✅ | `useAllTimeEntries()` |
| Stats | Stats | ✅ | `useTimeEntryStats()` → `GET /api/time-entries/stats` |
| Genehmigung | Button | ✅ | `useApproveTimeEntries()` |
| Genehmigungsstatistik | Stats | ✅ | `useApprovalStats()` |
| CRUD | Buttons | ✅ | |

---

## 26. Berichte / Reporting (`src/pages/Reports.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Verfügbare Berichte | Display | 🔧 | `useAvailableReports()` – Fallback auf statische Daten |
| Report generieren | Button | ✅ | `useGenerateReport()` → `POST /api/reports/generate` |
| Erfolgsrechnung | Report | ✅ | `useProfitLossReport()` |
| Bilanz | Report | ✅ | `useBalanceSheetReport()` |
| Lohnauswertung | Report | ✅ | `usePayrollSummaryReport()` |
| GAV Compliance | Report | ✅ | `useGavComplianceReport()` |
| Projektrentabilität | Report | ✅ | `useProjectProfitabilityReport()` |
| Offene Posten | Report | ✅ | `useOpenItemsReport()` |
| Budget-Vergleich | Report | ✅ | `useBudgetComparisonReport()` |
| Verkaufsanalyse | Report | ✅ | `useSalesAnalysisReport()` |
| Quellensteuer | Report | ✅ | `useWithholdingTaxReport()` |

---

## 27. Nachrichten / Chat

### Messages (`use-messages.ts`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Projekt-Chat | Chat | ✅ | `useMessages({ projectId })` → `GET /api/messages` |
| Task-Chat | Chat | ✅ | `useMessages({ taskId })` |
| Nachricht senden | Button | ✅ | `useSendMessage()` → `POST /api/messages` |

---

## 28. Einstellungen (`src/pages/Settings.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Tab: Unternehmen | Tab | ❌ | **3017 Zeilen!** Kein `use-settings.ts` – komplett Frontend-Shell |
| Tab: Lokalisierung | Tab | ❌ | Kein Backend-Endpoint |
| Tab: Währung | Tab | ❌ | Kein Backend-Endpoint |
| Tab: E-Mail (SMTP) | Tab | ❌ | Kein Backend-Endpoint |
| Tab: API | Tab | ❌ | Kein Backend-Endpoint |
| Tab: Sicherheit | Tab | ❌ | Kein Backend-Endpoint |
| Änderungen speichern | Button | ❌ | Keine Mutation |

---

## 29. Benutzer (`src/pages/Users.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Neuer Benutzer Button | Button | ✅ | Navigation |
| Suchfeld | Input | ✅ | `useUsers({ search })` |
| Filter Rolle | Dropdown | ✅ | `useUsers({ role })` |
| Benutzer-Zeile (klickbar) | Table-Row | ✅ | `useUsers()` |
| Benutzer-Aktionen: Details | Dropdown-Item | ✅ | Navigation |
| Benutzer-Aktionen: Bearbeiten | Dropdown-Item | ✅ | `useUpdateUser()` |
| Benutzer-Aktionen: Deaktivieren | Dropdown-Item | ✅ | `useUpdateUser({ isActive: false })` |
| Benutzer-Aktionen: Löschen | Dropdown-Item | ✅ | `useDeleteUser()` |

---

## 30. Login / Auth (`src/pages/AuthPage.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| E-Mail Input | Input | ✅ | `AuthContext.login()` |
| Passwort Input | Input | ✅ | `AuthContext.login()` |
| Angemeldet bleiben | Checkbox | ⚠️ | Token-Persistenz prüfen |
| Passwort vergessen | Link | ⚠️ | Reset-Endpoint prüfen |
| Anmelden Button | Button | ✅ | `POST /api/auth/login` |
| Registrieren Link | Link | ✅ | Wechselt zu Register-Form |

---

## 31. Unternehmensprofil (`src/pages/Company.tsx`)

| Element | Typ | Status | Bemerkung |
|---------|-----|--------|-----------|
| Firmendaten-Formular | Form | ✅ | `useCompany()` + `useUpdateCompany()` |
| Stat-Card Mitarbeiter | Stat-Card | ❌ | Zeigt immer "—" – kein Endpoint |
| Stat-Card Gegründet | Stat-Card | ✅ | Aus `company.createdAt` |
| Stat-Card Projekte | Stat-Card | ✅ | `useDashboardStats().activeProjects` |
| Stat-Card Kunden | Stat-Card | ✅ | `useDashboardStats().customerCount` |
| Führungsteam | List | ✅ | `useCompanyTeam()` |
| Mitglied hinzufügen | Dialog | ✅ | `useAddTeamMember()` |
| Mitglied entfernen | Button | ✅ | `useRemoveTeamMember()` |
| Logo-Upload | Button | ❌ | **Kein Upload-Endpoint** |
| Unternehmensbeschreibung | Textarea | ❌ | **Feld fehlt im Prisma-Modell** |
| Land/Country | Display | ❌ | Kein Eingabefeld, Fallback "CH" |

---

## Zusammenfassung

### 🔴 Komplett fehlend (kein Backend)

1. **Settings** – Alle 6 Tabs (Lokalisierung, Währung, E-Mail, API, Sicherheit, Shop) = pure Frontend-Shell
2. **Task-Subtasks** – Kein Subtask-Modell
3. **Task-Kommentare** – Kein Comment-Endpoint
4. **Task-Anhänge** – Kein Attachment-Endpoint
5. **Kunden-Aktivitäten-Tab** – Kein Activity-Log per Entity
6. **Dokument-Teilen** – Kein Sharing-Mechanismus
7. **Zahlungen-Beleg** – Kein File-Attachment für Payments
8. **Company-Logo-Upload** – Kein Upload-Endpoint
9. **Company-Description** – Prisma-Feld fehlt
10. **Company-Mitarbeiterzahl** – Stat zeigt "—"

### 🟡 Client-seitige Stats (sollten Backend-Endpoints werden)

1. `useCustomerStats()` – lädt alle Kunden (pageSize:1000)
2. `useInvoiceStats()` – lädt alle Rechnungen (pageSize:1000)
3. `useProductStats()` – lädt alle Produkte (pageSize:1000)
4. `useSupplierStats()` – lädt alle Lieferanten (pageSize:1000)

### 🔴 Build-Errors (TypeScript)

| Datei | Zeile(n) | Fehler |
|-------|----------|--------|
| Calendar.tsx | 546, 550 | `attendee` possibly null |
| ContractCreate.tsx | 47 | `name` not in `Partial<Contract>` (sollte `title` sein) |
| Creditors.tsx | 392 | `bill.creditor` possibly null |
| Debtors.tsx | 412 | `invoice.debtor` possibly null |
| DiscountDetail.tsx | 260 | `usage.customer` possibly null |
| Production.tsx | 434 | `m` possibly null |
| PurchaseInvoiceDetail.tsx | 241 | `entry.user` possibly null |
| PurchaseOrderDetail.tsx | 638 | `entry.user` possibly null |
| Reminders.tsx | 561, 653-654, 754, 779, 809, 1015 | Multiple null-checks (customer, invoice) |

### ⚠️ Prüfung nötig (Backend vorhanden, Funktion nicht getestet)

1. Alle PDF-Generierungen (jspdf client-seitig)
2. E-Mail-Versand (Angebote, Rechnungen, Mahnungen)
3. Drag&Drop Persistenz bei Kanban (Tasks)
4. Kundendetails: Relations-Tabs (Projekte, Rechnungen, Verträge)
5. Passwort-Reset Flow
6. Projekt-Chat tatsächliche Funktion
7. Projekt-Timeline/Meilensteine

---

## Cursor-Prompts (Kopierbar)

> **WICHTIG:** Jeder Prompt ist einzeln an Cursor zu übergeben. Reihenfolge einhalten.
> **REGEL FÜR ALLE PROMPTS:** NUR Dateien in `/src` ändern. KEIN Backend (`/backend`), KEINE `schema.prisma`, KEIN `package.json`. Design (JSX-Struktur, CSS, Tailwind-Klassen) darf NICHT verändert werden.

---

### 🔧 Phase 1: TypeScript Build-Errors fixen

```
**Aufgabe:** Behebe alle TypeScript Build-Errors in den folgenden Dateien. NUR Null-Checks und Type-Mismatches fixen. KEIN Design, KEIN JSX, KEIN CSS ändern. NUR `/src` Dateien anfassen – KEIN Backend.

**Regeln:**
- Verwende Optional Chaining (?.) und Nullish Coalescing (?? "") für null-checks
- KEIN Design ändern – gleiche Ausgabe wie vorher
- KEIN Backend-Code anfassen

**Fehler und Fixes:**

1. **src/pages/ContractCreate.tsx Zeile 47:**
   - Fehler: `'name' does not exist in type 'Partial<Contract>'`
   - Fix: Ändere `name: title` zu `title: title` (oder kurz `title,`)
   - Das Interface `Contract` in `src/hooks/use-contracts.ts` hat das Feld `title`, nicht `name`

2. **src/pages/Calendar.tsx Zeile 546, 550:**
   - Fehler: `'attendee' is possibly 'null'`
   - Fix: Füge Null-Guards hinzu:
     - Zeile 546: `attendee?.id || attendee?.name` → schon mit `?.` aber TypeScript braucht expliziten Guard
     - Lösung: `key={typeof attendee === 'object' && attendee ? attendee.id || attendee.name : String(attendee)}`
     - Zeile 550: gleicher Pattern für `attendee?.name?.[0]` → `(attendee && typeof attendee === 'object') ? (attendee.name?.[0] || attendee.email?.[0] || '?') : (String(attendee)?.[0] || '?')`

3. **src/pages/Creditors.tsx Zeile 392:**
   - Fehler: `'bill.creditor' is possibly 'null'`
   - Fix: `typeof bill.creditor === 'object' && bill.creditor ? bill.creditor.name || bill.creditor.companyName : (bill.creditor || "")`

4. **src/pages/Debtors.tsx Zeile 412:**
   - Fehler: `'invoice.debtor' is possibly 'null'`
   - Fix: `typeof invoice.debtor === 'object' && invoice.debtor ? invoice.debtor.name || invoice.debtor.companyName : (invoice.debtor || "")`

5. **src/pages/DiscountDetail.tsx Zeile 260:**
   - Fehler: `'usage.customer' is possibly 'null'`
   - Fix: `typeof usage.customer === 'object' && usage.customer ? usage.customer.name || usage.customer.companyName : (usage.customer || "")`

6. **src/pages/Production.tsx Zeile 434:**
   - Fehler: `'m' is possibly 'null'`
   - Fix: `order.assignedTeam.filter(Boolean).map(m => typeof m === 'object' && m ? m.name || m.firstName : String(m || "")).join(", ")`

7. **src/pages/PurchaseInvoiceDetail.tsx Zeile 241:**
   - Fehler: `'entry.user' is possibly 'null'`
   - Fix: `typeof entry.user === 'object' && entry.user ? entry.user.name || entry.user.email : (entry.user || "")`

8. **src/pages/PurchaseOrderDetail.tsx Zeile 638:**
   - Fehler: `'entry.user' is possibly 'null'`
   - Fix: `typeof entry.user === 'object' && entry.user ? entry.user.name || entry.user.email : (entry.user || "")`

9. **src/pages/Reminders.tsx – MEHRERE STELLEN:**
   - Zeile 561: `invoice.customer` → `typeof invoice.customer === 'object' && invoice.customer ? invoice.customer.name || invoice.customer.companyName : (invoice.customer || "")`
   - Zeile 653: `r.customer` → gleicher Pattern
   - Zeile 654: `r.invoice` → `typeof r.invoice === 'object' && r.invoice ? r.invoice.number || r.invoice.id : (r.invoice || "")`
   - Zeile 754: `r.customer` → gleicher Pattern wie 653
   - Zeile 779: `selectedReminderData[0]?.customer` → mit Guard: `const firstReminder = selectedReminderData[0]; const customerName = firstReminder && typeof firstReminder.customer === 'object' && firstReminder.customer ? firstReminder.customer.name || firstReminder.customer.companyName : (firstReminder?.customer || "");` – dann `customerName` verwenden
   - Zeile 809: `selectedReminderData[0]?.invoice` → gleicher Pattern: Variable vorher extrahieren
   - Zeile 1015: `invoice.customer` → gleicher Pattern wie 561

**Nach dem Fix:** `npx tsc --noEmit` ausführen und sicherstellen, dass KEINE Build-Errors mehr vorhanden sind.
```

---

### 🔧 Phase 2: Dedizierte Stats-Endpoints (Backend)

```
**Aufgabe:** Erstelle dedizierte Stats-Endpoints, damit das Frontend nicht mehr alle Datensätze laden muss (aktuell pageSize:1000).

**NUR Backend-Dateien ändern (`/backend`).** Frontend-Hooks bleiben unverändert.

**Zu erstellen:**

1. **GET /api/customers/stats** → Response: `{ total, active, inactive, prospects, totalRevenue }`
2. **GET /api/invoices/stats** → Response: `{ total, totalValue, paid, paidValue, outstanding, outstandingValue, overdue, overdueValue }`
3. **GET /api/products/stats** → Response: `{ total, active, inactive, lowStock, totalValue }`
4. **GET /api/suppliers/stats** → Response: `{ total, active, totalPurchaseVolume }`

**Vorgehen pro Endpoint:**
- Neuen Controller-Method mit `@Get('stats')` erstellen
- Service-Method mit Prisma `count()` und `aggregate()` Queries
- KEINE Frontend-Dateien ändern – das Frontend wird später angepasst

**Referenz Frontend-Hooks (NUR LESEN, NICHT ÄNDERN):**
- `src/hooks/use-customers.ts` → `useCustomerStats()`
- `src/hooks/use-invoices.ts` → `useInvoiceStats()`
- `src/hooks/use-products.ts` → `useProductStats()`
- `src/hooks/use-suppliers.ts` → `useSupplierStats()`
```

---

### 🔧 Phase 3: Company-Ergänzungen (Backend)

```
**Aufgabe:** Fehlende Felder und Endpoints für die Company-Seite implementieren.

**NUR `/backend` und `schema.prisma` ändern. KEIN Frontend.**

1. **Prisma-Schema (`schema.prisma`):**
   - Feld `description String?` zum Model `Company` hinzufügen
   - Migration: `npx prisma migrate dev --name add-company-description`

2. **UpdateCompanyDto (`backend/src/modules/company/dto/`):**
   - `description?: string` hinzufügen
   - `country?: string` sicherstellen

3. **GET /api/dashboard/stats:**
   - Feld `employeeCount` hinzufügen: `await prisma.companyTeamMember.count({ where: { companyId } })`

4. **POST /api/company/logo:**
   - Multipart/form-data Endpoint
   - Speichert Datei in `/uploads/logos/`
   - Aktualisiert `company.logoUrl`
   - Response: aktualisierte Company

**Referenz Frontend-Hooks (NUR LESEN):**
- `src/hooks/use-company.ts` → `useCompany()`, `useUpdateCompany()`
- `src/hooks/use-dashboard.ts` → `useDashboardStats()`
```

---

### 🔧 Phase 4: Settings-Backend (6 Tabs)

```
**Aufgabe:** Backend für alle 6 Settings-Tabs implementieren. Aktuell ist die Settings-Seite reine Frontend-Shell ohne Backend-Anbindung.

**NUR `/backend` und `schema.prisma` ändern. KEIN Frontend.**

**Prisma-Schema – Neues Model `CompanySettings`:**
```prisma
model CompanySettings {
  id          String   @id @default(uuid())
  companyId   String   @unique
  company     Company  @relation(fields: [companyId], references: [id])
  
  // Lokalisierung
  language    String   @default("de")
  timezone    String   @default("Europe/Zurich")
  dateFormat  String   @default("DD.MM.YYYY")
  
  // Währung
  currency       String  @default("CHF")
  exchangeRates  Json?
  
  // E-Mail/SMTP
  smtpHost     String?
  smtpPort     Int?
  smtpUser     String?
  smtpPassword String?
  smtpFrom     String?
  smtpFromName String?
  smtpSsl      Boolean @default(true)
  
  // Sicherheit
  twoFactorEnabled    Boolean @default(false)
  sessionTimeoutMin   Int     @default(480)
  passwordMinLength   Int     @default(8)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Endpoints:**
- `GET /api/settings` → Gibt CompanySettings zurück
- `PUT /api/settings` → Aktualisiert CompanySettings
- `POST /api/settings/smtp/test` → Sendet Test-E-Mail
- `GET /api/settings/api-keys` → Liste API-Keys
- `POST /api/settings/api-keys` → Neuen API-Key erstellen
- `DELETE /api/settings/api-keys/:id` → API-Key löschen

**Referenz Frontend (NUR LESEN):**
- `src/pages/Settings.tsx` – 3017 Zeilen, enthält alle Tab-Formulare
- Hooks müssen eventuell noch erstellt werden: `src/hooks/use-settings.ts`
```

---

### 🔧 Phase 5: Task-Features (Subtasks, Kommentare, Anhänge)

```
**Aufgabe:** Fehlende Task-Sub-Features im Backend implementieren.

**NUR `/backend` und `schema.prisma` ändern. KEIN Frontend.**

**Prisma-Schema – Neue Models:**

```prisma
model TaskSubtask {
  id        String   @id @default(uuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  title     String
  completed Boolean  @default(false)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TaskComment {
  id        String   @id @default(uuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TaskAttachment {
  id        String   @id @default(uuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  fileName  String
  fileUrl   String
  fileSize  Int
  mimeType  String
  uploadedById String
  uploadedBy   User  @relation(fields: [uploadedById], references: [id])
  createdAt DateTime @default(now())
}
```

**Endpoints:**
- `GET /api/tasks/:id/subtasks` → Liste Subtasks
- `POST /api/tasks/:id/subtasks` → Erstelle Subtask
- `PATCH /api/tasks/:id/subtasks/:subtaskId` → Toggle completed / Update title
- `DELETE /api/tasks/:id/subtasks/:subtaskId` → Lösche Subtask

- `GET /api/tasks/:id/comments` → Liste Kommentare
- `POST /api/tasks/:id/comments` → Erstelle Kommentar
- `DELETE /api/tasks/:id/comments/:commentId` → Lösche Kommentar

- `GET /api/tasks/:id/attachments` → Liste Anhänge
- `POST /api/tasks/:id/attachments` → Upload Anhang (multipart)
- `DELETE /api/tasks/:id/attachments/:attachmentId` → Lösche Anhang + Datei

**Referenz Frontend (NUR LESEN):**
- `src/pages/TaskDetail.tsx` – enthält UI für Subtasks, Kommentare, Anhänge
- `src/hooks/use-tasks.ts` – bestehende Task-Hooks
```

---

### 🔧 Phase 6: Frontend-Hooks für Stats anpassen

```
**Aufgabe:** Nach Phase 2 (Stats-Endpoints) die Frontend-Hooks umstellen, damit sie die neuen dedizierten Endpoints nutzen statt alle Daten zu laden.

**NUR `/src/hooks/` ändern. KEIN Design, KEIN JSX, KEIN CSS.**

**Dateien:**
1. `src/hooks/use-customers.ts` → `useCustomerStats()` auf `GET /api/customers/stats` umstellen (statt pageSize:1000)
2. `src/hooks/use-invoices.ts` → `useInvoiceStats()` auf `GET /api/invoices/stats` umstellen
3. `src/hooks/use-products.ts` → `useProductStats()` auf `GET /api/products/stats` umstellen
4. `src/hooks/use-suppliers.ts` → `useSupplierStats()` auf `GET /api/suppliers/stats` umstellen

**Pattern:**
```ts
export function useCustomerStats() {
  return useQuery({
    queryKey: ['customers', 'stats'],
    queryFn: () => api.get('/customers/stats').then(r => r.data),
  });
}
```

**WICHTIG:** Die Response-Typen müssen exakt die gleichen Felder liefern wie die bisherige client-seitige Berechnung, damit das Frontend ohne Änderung funktioniert.
```

---

### Phasen-Reihenfolge

| Phase | Wer | Was | Abhängigkeit |
|-------|-----|-----|-------------|
| 1 | Cursor | Build-Errors fixen (nur `/src`) | Keine |
| 2 | Cursor | Stats-Endpoints Backend | Keine |
| 3 | Cursor | Company-Backend | Keine |
| 4 | Cursor | Settings-Backend | Keine |
| 5 | Cursor | Task-Features Backend | Keine |
| 6 | Cursor | Frontend-Hooks Stats | Phase 2 muss fertig sein |
