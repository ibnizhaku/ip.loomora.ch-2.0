
# Umfassender Fix-Plan: Verkaufsbelege, Gutschriften und Mahnwesen

Dieser Plan adressiert systematisch alle gemeldeten Probleme in 6 Modulen. Die Umsetzung erfolgt in der angegebenen Reihenfolge.

---

## 1. Angebote (Quotes)

### 1.1 Projekt-Pflicht bei Erstellung
- `DocumentForm.tsx` hat bereits eine Validierung (Zeile 390-393): `if (type === "quote" && !selectedProjectId)` -- diese funktioniert
- **Problem**: Das Projekt wird zwar im Payload als `projectId` gesendet, aber nach der Erstellung nicht in der API-Response zurueckgeliefert
- **Fix Backend (Cursor)**: `quotes.service.ts` muss `project: { select: { id, number, name } }` in `findOne()` und `create()` inkludieren

### 1.2 Projekt auf Detailseite anzeigen
- `QuoteDetail.tsx` Zeile 123: `project: quote.project?.name || ""` -- Mapping existiert bereits
- Zeile 344: `<p className="text-muted-foreground">{quoteData.project}</p>` -- Anzeige existiert
- **Problem**: Backend liefert `project` nicht mit -> Fix im Backend (siehe 1.1)

### 1.3 Projekt im PDF erwaehnen
- `QuoteDetail.tsx` Zeile 211: `projectNumber: quoteData.project` -- wird bereits an PDF uebergeben
- **Fix**: Funktioniert automatisch sobald Backend das Projekt liefert

### 1.4 User/Ersteller anzeigen
- **Fix QuoteDetail.tsx**: Neues Feld `createdBy` aus `rawQuote` extrahieren und in Sidebar-Card "Details" anzeigen
- **Fix PDF**: `pdfData` um `createdBy`-Feld erweitern, in `sales-document.ts` rendern
- **Fix Backend (Cursor)**: `createdBy` (User-Relation) in Response inkludieren

### 1.5 Verlauf wird nach Bearbeitung geloescht
- **Ursache**: `historyEntries` ist ein lokaler `useState` (Zeile 160) -- bei Seitenreload/Navigation geht alles verloren
- **Fix**: Verlauf aus Backend laden (AuditLog) statt lokal zu speichern. Hook `useAuditLog` oder `useActivities` mit Filter `entityType=quote, entityId=id` nutzen. Falls kein solcher Endpoint existiert -> Cursor-Prompt fuer Backend

### 1.6 Drucken-Dropdown zeigt falsch an
- Zeile 393-396: `<DropdownMenuItem onClick={() => window.print()}>Drucken</DropdownMenuItem>`
- **Fix**: Aendern zu PDF-basiertem Druck (wie bei InvoiceDetail): `getSalesDocumentPDFBlobUrl(pdfData)` in neuem Fenster oeffnen mit `printWindow.print()`

### 1.7 Quotes-Liste: Projekt-Spalte zeigt nur "–"
- `Quotes.tsx` Zeile 433-435: Spalte "Projekt" zeigt hardcoded `–`
- **Fix**: `QuoteRaw`-Interface um `project?: { name: string }` erweitern, `mapQuote` anpassen, Spalte mit `raw.project?.name || '–'` fuellen

---

## 2. Auftraege (Orders)

### 2.1 Projekt-Pflicht bei Erstellung
- `DocumentForm.tsx` Zeile 395-398 hat bereits: `if (type === "order" && !selectedProjectId)` -- funktioniert
- **Fix Backend**: `projectId` bei `create()` speichern und in Responses inkludieren

### 2.2 Zuweisung (User) bei Neuer Auftrag
- `OrderCreate.tsx` nutzt `DocumentForm` -- dieses hat kein User-Zuweisungsfeld
- **Fix**: `DocumentForm.tsx` fuer `type === "order"` ein Benutzer-Auswahl-Feld hinzufuegen (`assignedUsers`), analog zur Projektauswahl

### 2.3 Verlauf/Aktivitaet mit User
- Gleicher Fix wie bei Angeboten: AuditLog/Activities aus Backend laden statt lokal

### 2.4 User im PDF
- Bearbeiter/Ersteller in `pdfData` aufnehmen und in `sales-document.ts` rendern

### 2.5 Projekt im PDF
- Bereits im Mapping vorhanden (`projectNumber`), funktioniert sobald Backend das Projekt liefert

### 2.6 Orders-Liste: Projekt-Spalte fehlt
- `Orders.tsx`: Kein Projekt in `OrderRaw` Interface
- **Fix**: `project?: { name: string }` hinzufuegen, `mapOrder` erweitern, neue Spalte nach "Kunde" einfuegen

---

## 3. Lieferscheine (Delivery Notes)

### 3.1 Kunde zeigt falschen Namen
- `DeliveryNotes.tsx` Zeile 87: `client: raw.customer?.companyName || raw.customer?.name`
- **Problem**: Backend liefert `companyName` nicht oder falsch gemappt
- **Fix Backend (Cursor)**: `customer: { select: { id, name, companyName } }` inkludieren, Response-Mapper pruefen

### 3.2 Lieferadresse wird nicht angezeigt
- Zeile 97: `address: raw.shippingAddress || "–"`
- **Problem**: Backend liefert `shippingAddress` nicht (evtl. als `deliveryAddress` Objekt)
- **Fix**: Mapping anpassen -- `deliveryAddress`-Objekt zu String formatieren falls es ein Objekt ist

### 3.3 Tracking entfernen
- Tabelle Zeile 366: `Tracking`-Spalte entfernen
- Cards: `trackingNumber`-Anzeige entfernen
- Interface: `carrier` und `trackingNumber` entfernen

### 3.4 Projekt und Ersteller statt Tracking
- Neue Spalte "Projekt" nach Kunde
- Neue Spalte "Erstellt von" (wo Tracking war)
- `DeliveryNoteRaw`: `project?: { name: string }`, `createdByUser?: { name: string }` hinzufuegen

---

## 4. Rechnungen (Invoices)

### 4.1 Projekt-Pflicht bei Erstellung
- `DocumentForm.tsx`: Validierung fuer `type === "invoice"` hinzufuegen (analog zu quote/order)

### 4.2 Ersteller anzeigen (Detail + Liste)
- **InvoiceDetail.tsx**: `createdBy` User in Sidebar anzeigen
- **Invoices.tsx**: Neue Spalte "Erstellt von"

### 4.3 Lieferadresse in Liste
- **Invoices.tsx**: Neue Spalte "Lieferadresse" -- wenn gleich wie Rechnungsadresse: "Gleich wie RE-Adresse"
- Vergleich: `invoice.deliveryAddress` vs. `invoice.customer.street + city`

### 4.4 Verlauf auf Detailseite
- **InvoiceDetail.tsx**: History-Card hinzufuegen (aus AuditLog/Activities laden, wie bei Angeboten)

### 4.5 Drucken-Button: QR-PDF nutzen
- `InvoiceDetail.tsx` Zeile 365-377: `handlePrint` nutzt `getSalesDocumentPDFBlobUrl(pdfData)` (1 Seite)
- **Fix**: Wenn QR-Daten verfuegbar, `generateSwissQRInvoicePDFDataUrl` nutzen statt `getSalesDocumentPDFBlobUrl`

### 4.6 E-Mail senden -> Status automatisch aktualisieren
- **InvoiceDetail.tsx**: Nach erfolgreichem E-Mail-Versand via `SendEmailModal` -> `sendInvoiceAction.mutateAsync(id)` aufrufen um Status auf SENT zu setzen
- `SendEmailModal` hat ein `onSuccess`-Callback oder man nutzt `onClose` mit Erfolgs-Flag

---

## 5. Gutschriften (Credit Notes)

### 5.1 Komplette Analyse
**Aktueller Stand:**
- `CreditNoteCreate.tsx`: Nutzt `DocumentForm` mit `type="credit-note"` -- grundsaetzlich funktional
- `CreditNoteDetail.tsx`: API-angebunden ueber `useCreditNote(id)`, zeigt Positionen, Kunde, PDF
- `CreditNotes.tsx` (Liste): API-angebunden ueber `/credit-notes`
- Hooks in `use-credit-notes.ts`: CRUD + `createFromInvoice` vorhanden

**Probleme:**
- `CreditNoteDetail.tsx` Zeile 112: `type: 'invoice'` statt `'credit-note'` im PDF -- falsche Bezeichnung im generierten PDF
- Stornieren/Duplizieren sind nur Toasts ohne echte API-Aufrufe (Zeile 194-195)
- Kein Verlauf/Aktivitaet
- `customer.name` statt `companyName` priorisiert (Zeile 89)
- PDF zeigt keinen Gutschrifts-Titel (nutzt Invoice-Template)

### 5.2 Fixes
- PDF-Type auf `'credit-note'` aendern und in `sales-document.ts` als eigenen Typ unterstuetzen (Titel "Gutschrift")
- Stornieren: `useUpdateCreditNote` mit `{ status: 'CANCELLED' }` aufrufen
- Duplizieren: Navigation zu `/credit-notes/new?invoiceId=...`
- Firmenname priorisieren: `cn.customer?.companyName || cn.customer?.name`
- Verlauf-Card hinzufuegen (AuditLog)

---

## 6. Mahnwesen (Reminders)

### 6.1 Detailpage: Schuldner nicht angezeigt
- `ReminderDetail.tsx` Zeile 62: `r.customer?.name` -- Backend liefert evtl. nested `invoice.customer` statt `customer`
- **Fix**: Fallback: `r.invoice?.customer?.companyName || r.invoice?.customer?.name || r.customer?.name`

### 6.2 Create-Dialog: Keine ueberfaelligen Rechnungen
- `Reminders.tsx` Zeile 1232: Nutzt `overdueInvoices` Array
- **Problem**: Backend `/reminders/overdue-invoices` liefert keine Daten (Filter zu restriktiv)
- **Fix Backend (Cursor)**: Overdue-Filter pruefen -- muss Rechnungen mit Status SENT/OVERDUE und `dueDate < today` liefern, nur solche ausschliessen die eine aktive Mahnung (status != CANCELLED) haben

### 6.3 Sammelmahnung: E-Mail-Anbindung
- `confirmBulkReminder` (Zeile 307-322) simuliert nur mit `setTimeout` -- keine echte E-Mail
- **Fix**: Fuer jeden selektierten Reminder `useSendReminder` aufrufen mit `method: 'EMAIL'`
- `SendEmailModal` oeffnen oder direkt ueber API senden

### 6.4 PDF-Download aus 3-Punkte-Menue
- Zeile 576/709: `toast.success("PDF wird heruntergeladen...")` -- nur Toast, kein Download
- **Fix**: `downloadPdf('reminders', reminder.id, ...)` aufrufen (wie in ReminderDetail)

### 6.5 Mahnung versenden (3-Punkte)
- `handleSendNextReminder` (Zeile 339-352): Nutzt `api.put` statt `SendEmailModal`
- **Fix**: `SendEmailModal` oeffnen mit Reminder-Daten

### 6.6 "Anrufen" entfernen
- Zeile 720-723: `DropdownMenuItem` mit "Anrufen" entfernen

### 6.7 Zahlungsfrist verlaengern
- `handleExtendDeadline` (Zeile 360-362): Nur Toast, nicht funktional
- **Fix**: Dialog mit neuem Datum oeffnen, `useUpdateReminder` mit neuem `dueDate` aufrufen

### 6.8 An Inkasso uebergeben
- `handleTransferToCollection` (Zeile 364-371): Setzt Level auf 5 via API -- funktioniert
- Evtl. zusaetzlich Status auf einen speziellen Wert setzen

### 6.9 Anzeigen (3-Punkte)
- Navigiert korrekt zu `/reminders/${reminder.id}` -- Problem ist die Detailseite selbst (siehe 6.1)

### 6.10 "Ueberfaellig ohne Mahnung" Tab
- Zeile 755-811: Nutzt `overdueInvoices` -- gleicher Fix wie 6.2

### 6.11 Mahnverlauf Tab
- `HistoryTab` (Zeile 106-179): Nutzt `useReminders({ status: "SENT" })` etc.
- **Problem**: Backend liefert bei Status-Filter keine Daten oder `customer`/`invoice` Relationen fehlen
- **Fix**: Kommaseparierten Status-Filter nutzen: `useReminders({ status: "SENT,PAID,CANCELLED" })` statt drei separate Queries
- Backend muss Relationen inkludieren (bereits im Cursor-Prompt)

### 6.12 Projekt speichern bei Mahnung
- Aktuell wird kein `projectId` bei Mahnung-Erstellung gespeichert
- **Fix Backend**: Projekt-ID der verknuepften Rechnung automatisch uebernehmen

### 6.13 Verlauf auf Detailpage
- `ReminderDetail.tsx` hat keinen Verlauf
- **Fix**: History-Card hinzufuegen (AuditLog oder Aktivitaeten aus Backend)

### 6.14 Ersteller in Liste
- `Reminders.tsx` Liste: Neue Spalte "Erstellt von" hinzufuegen

### 6.15 Verknuepfte Rechnung: Klick funktioniert
- `ReminderDetail.tsx` Zeile 138: `<Link to={'/invoices/${r.invoice.id}'}` -- existiert bereits
- **Problem**: `r.invoice.id` ist evtl. undefined wenn Backend die Relation nicht inkludiert
- **Fix Backend**: `invoice` Relation vollstaendig inkludieren

---

## Technischer Abschnitt

### Dateien die geaendert werden

| Datei | Aenderungen |
|---|---|
| `src/components/documents/DocumentForm.tsx` | Projekt-Pflicht fuer Invoice, User-Zuweisung fuer Order |
| `src/pages/QuoteDetail.tsx` | Verlauf aus API, Drucken via PDF, User-Anzeige |
| `src/pages/Quotes.tsx` | Projekt-Spalte in Liste befuellen |
| `src/pages/OrderCreate.tsx` | (minimal) |
| `src/pages/Orders.tsx` | Projekt-Spalte hinzufuegen |
| `src/pages/OrderDetail.tsx` | Verlauf aus API, User im PDF |
| `src/pages/DeliveryNotes.tsx` | Tracking entfernen, Projekt+Ersteller hinzufuegen, Lieferadresse-Fix |
| `src/pages/Invoices.tsx` | Ersteller-Spalte, Lieferadresse-Spalte |
| `src/pages/InvoiceDetail.tsx` | Verlauf, Drucken mit QR-PDF, E-Mail->Status-Update |
| `src/pages/CreditNotes.tsx` | (minimal) |
| `src/pages/CreditNoteDetail.tsx` | PDF-Typ fix, Stornieren/Duplizieren funktional, companyName |
| `src/pages/Reminders.tsx` | PDF-Download, E-Mail-Anbindung, Anrufen entfernen, Zahlungsfrist-Dialog, History-Tab Fix, Ersteller-Spalte |
| `src/pages/ReminderDetail.tsx` | Schuldner-Fix, Verlauf, Projekt |
| `src/lib/pdf/sales-document.ts` | `credit-note` Typ, `createdBy` Feld |

### Backend Cursor-Prompt (zusammengefasst)

Fuer alle Module muessen die Backend-Responses erweitert werden um:
1. `project: { id, number, name }` -- bei Quotes, Orders, Invoices
2. `createdByUser: { id, name }` -- bei allen Belegtypen
3. `invoice.customer` (nested) -- bei Reminders
4. `/reminders/overdue-invoices` Filter-Fix
5. AuditLog/Activity-Endpoint pro Entity (falls nicht vorhanden)
6. `credit-notes` Response mit `companyName` im Customer-Objekt

### Reihenfolge der Implementierung

1. Gemeinsame Basis: `sales-document.ts` (credit-note Typ, createdBy)
2. Angebote (Quotes)
3. Auftraege (Orders)
4. Lieferscheine (Delivery Notes)
5. Rechnungen (Invoices)
6. Gutschriften (Credit Notes)
7. Mahnwesen (Reminders)
