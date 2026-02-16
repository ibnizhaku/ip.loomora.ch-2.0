# Verkauf-Modul – Vollständige Test-Checkliste & Analyse

> Erstellt: 2026-02-16  
> Modul: Verkauf (Angebote, Aufträge, Lieferscheine, Rechnungen, Gutschriften, Mahnwesen)  
> Status: 🔴 Kritisch – Viele Kernfunktionen nicht produktionsreif

---

## I. Gemeldete Fehler – Checkliste

### A. Angebote (`/quotes`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| A1 | ❌ Filter-Button funktioniert nicht | `Quotes.tsx:208` – Filter-Button ist nur ein Icon-Button ohne `onClick` oder Popover. Hat keine Filter-Logik. | 🔧 Fix nötig |
| A2 | ❌ Vorschau funktioniert nicht | `QuoteDetail.tsx:287` – PDFPreviewDialog nutzt lokale `jsPDF`-Generierung über `getSalesDocumentPDFDataUrl()`. Wenn die Firma-Daten hardcoded falsch sind, schlägt die Generierung fehl. | 🔧 Prüfen |
| A3 | ❌ Angebot in Auftrag umwandeln funktioniert nicht | `QuoteDetail.tsx:239-243` – `handleConvert()` ruft KEINEN API-Endpunkt auf! Es zeigt nur `toast.success("Auftrag wurde erstellt")` ohne tatsächliche API-Mutation. Der Hook `useConvertQuoteToOrder` existiert in `use-sales.ts:142` aber wird NICHT verwendet. | 🔴 Kritisch |
| A4 | ❌ Angebot in Rechnung umwandeln funktioniert nicht | `Quotes.tsx:285-288` – Navigiert zu `/invoices/new?quoteId=${quote.id}`, aber `InvoiceCreate.tsx` liest nur `customerId` aus den Suchparametern, NICHT `quoteId`. Die Positionen werden nicht übernommen. | 🔴 Kritisch |
| A5 | ❌ 3-Punkte-Menü funktioniert teilweise nicht | `Quotes.tsx:274-301` – Die Menüpunkte "Versenden" und "Duplizieren" zeigen nur `toast.info()` ohne echte Logik. | 🟡 Stub |

### B. Aufträge (`/orders`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| B1 | ❌ Rechnung senden nach Auftrag funktioniert nicht | `DocumentForm.tsx:342-345` – "Rechnung senden" Button ruft `handleSave(false)` auf, was den gleichen Code wie "Als Entwurf speichern" ausführt. Der `asDraft`-Parameter wird im Payload **nicht** verwendet – Status wird immer als DRAFT gesendet. | 🔴 Kritisch |
| B2 | ❌ Vorschau funktioniert nicht | `DocumentForm.tsx:338-340` – Vorschau-Button hat **keinen `onClick`-Handler**! Der Button ist komplett inaktiv. | 🔴 Kritisch |
| B3 | ❌ Projekte zeigen Mock-Daten | `DocumentForm.tsx:870-874` – Projektauswahl enthält hardcoded Mock-Werte: "E-Commerce Plattform", "Metallbau Projekt X", "CRM Integration" statt echte Projekte aus `/api/projects`. | 🔴 Kritisch |

### C. Lieferscheine (`/delivery-notes`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| C1 | ❌ "Neuer Lieferschein"-Button hat keinen onClick | `DeliveryNotes.tsx:131` – Der Button hat **keinen `onClick`-Handler**. Navigation zu `/delivery-notes/new` fehlt komplett. | 🔴 Kritisch |
| C2 | ❌ 3-Punkte-Menü Aktionen sind Stubs | `DeliveryNotes.tsx:278-288` – "Anzeigen", "Drucken", "Als PDF", "Sendung verfolgen" haben keine `onClick`-Handler oder `navigate()`-Aufrufe. | 🔴 Kritisch |
| C3 | ❌ Filter-Button ohne Funktion | `DeliveryNotes.tsx:202` – Wie bei Angeboten, nur ein Icon ohne Popover/Filter-Logik. | 🔧 Fix nötig |

### D. Rechnungen (`/invoices`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| D1 | ❌ Zahlung erfassen funktioniert nicht | `InvoiceDetail.tsx:223-225` – Button hat **keinen `onClick`-Handler**! Der Hook `useRecordPayment` existiert in `use-sales.ts:333` aber wird nicht verwendet. | 🔴 Kritisch |
| D2 | ❌ Mahnung erstellen funktioniert nicht | `InvoiceDetail.tsx:227-229` – Button hat **keinen `onClick`-Handler**! Navigation zu `/reminders/new?invoiceId=` fehlt. | 🔴 Kritisch |
| D3 | ❌ Vorschau funktioniert nicht auf Detailseite | Gleich wie A2 – `PDFPreviewDialog` nutzt lokal generiertes PDF. Die hardcoded Firma "Loomora Metallbau AG" (Zeile 160) ist falsch für Techloom. | 🔧 Backend-PDF verwenden |
| D4 | ❌ Drucken nimmt ganze Seite | `InvoiceDetail.tsx:239` – Nutzt `window.print()` ohne Print-CSS (`@media print`). Druckt die gesamte App inkl. Sidebar. | 🔧 Fix nötig |
| D5 | ❌ 3-Punkte-Menü funktioniert teilweise nicht | `InvoiceDetail.tsx:250-257` – "Per E-Mail senden" zeigt nur `toast.info()`. "Stornieren" zeigt nur `toast.info()`. Kein API-Call. | 🟡 Stub |
| D6 | ❌ Rechnung erstellen – Vorschau nicht funktional | `DocumentForm.tsx:338-340` – Vorschau-Button ohne `onClick`. | 🔴 Kritisch |
| D7 | ❌ Rechnung erstellen – Rechnung senden funktioniert nicht | Gleich wie B1 – `asDraft` Parameter wird ignoriert, Status immer DRAFT. | 🔴 Kritisch |
| D8 | ❌ QR-Code nicht produktionsreif | `DocumentForm.tsx:238-242` – `generateQrReference()` erzeugt eine zufällige Referenz, NICHT nach MOD10-Algorithmus. Die eigentliche QR-Referenz muss vom Backend generiert werden (wie in `server/src/routes/orders.ts:217-231`). | 🔴 Kritisch |
| D9 | ❌ Mock-Projekte statt echte Projekte | Gleich wie B3 – `DocumentForm.tsx:870-874`. | 🔴 Kritisch |
| D10 | ❌ Bankverbindung nicht korrekt | `DocumentForm.tsx:107-116` – Hardcoded als "Beispiel AG" mit Dummy-IBAN. `InvoiceDetail.tsx:107-110` – Hardcoded als "PostFinance AG" mit spezifischer IBAN. Muss dynamisch aus Company-Settings geladen werden. | 🔴 Kritisch |
| D11 | ❌ Filter-Button funktioniert nicht | `Invoices.tsx:211` – Filter-Button ohne Popover/Filter-Logik. | 🔧 Fix nötig |
| D12 | ❌ 3-Punkte-Menü Listenansicht teilweise Stubs | `Invoices.tsx:291-298` – "Herunterladen" und "Per E-Mail senden" haben keine `onClick`-Handler. | 🟡 Stub |

### E. Gutschriften (`/credit-notes`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| E1 | ❌ Vorschau funktioniert nicht | `CreditNoteDetail.tsx` hat **keinen PDFPreviewDialog** implementiert. Kein Vorschau-Button vorhanden. | 🔴 Fehlt |
| E2 | ❌ Rechnung senden funktioniert nicht | `CreditNoteDetail.tsx:133` – Ruft `sendEmail('invoices', id)` auf – nutzt **falschen Endpunkt** (`invoices` statt `credit-notes`). | 🔴 Kritisch |
| E3 | ❌ Als Entwurf speichern funktioniert nicht | `CreditNoteCreate.tsx:3-4` – Nutzt `<DocumentForm type="credit-note" />` **ohne `onSave`-Handler**! Der Save-Button fällt in den Legacy-Fallback (`console.log` auf Zeile 304) und navigiert zurück ohne zu speichern. | 🔴 Kritisch |

### F. Mahnwesen (`/reminders`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| F1 | ❌ Mahnung erstellen Dialog funktioniert nicht | `Reminders.tsx:307` – "Mahnung erstellen" Button öffnet `setCreateDialogOpen(true)`, aber der **Create-Dialog ist nicht implementiert** – er existiert nur als State-Variable, kein Dialog-JSX vorhanden. | 🔴 Kritisch |
| F2 | ❌ "Mahnungen erstellen" bei überfälligen Rechnungen | `Reminders.tsx:344-346` – Ruft `handleCreateReminder(inv.id)` auf, was nur `toast.success()` zeigt, keinen API-Call. | 🔴 Kritisch |
| F3 | ❌ "Mahnen" Button bei "Überfällig ohne Mahnung" | `Reminders.tsx` – Die `overdueInvoices` sind **hardcoded Mock-Daten** (Zeile 93-96): "Tech Industries" und "Media Solutions". Der Hook `useOverdueInvoices` existiert aber wird nicht verwendet. | 🔴 Kritisch |
| F4 | ❌ Sammel-Mahnung funktioniert nicht | `Reminders.tsx:208-233` – `confirmBulkReminder()` simuliert nur den Versand mit `setTimeout` und aktualisiert nur den lokalen State, **kein API-Call**. | 🔴 Kritisch |
| F5 | ❌ Mahnungen-Daten sind teils Mock | `Reminders.tsx:126` – `useState<Reminder[]>(initialReminders)` initialisiert mit API-Daten, aber wird durch lokale State-Updates überschrieben. Re-fetching funktioniert nicht korrekt. | 🟡 Architektur |
| F6 | ❌ Keine Route für Mahnung-Erstellung | `App.tsx` hat keine Route `/reminders/new` oder `/reminders/create`. | 🔴 Fehlt |

---

## II. Systematische Analyse des Verkauf-Moduls

### 1. Warum heisst es "Quotes" und nicht "Offer"?

Im internationalen Geschäftskontext:
- **Quote** = Preisangebot/Kostenvoranschlag (B2B-Standard, z.B. "Request for Quote")
- **Offer** = Angebot (eher B2C oder rechtlich bindend)
- **Proposal** = Projektvorschlag (umfassender als ein Quote)

**Im Schweizer/DACH-Kontext** ist "Angebot" korrekt. Der technische Pfad `/quotes` ist internationaler Standard (z.B. SAP, Odoo, ERPNext verwenden alle "quotation/quote"). Die UI zeigt korrekt "Angebote".

**Empfehlung**: Pfad `/quotes` beibehalten (Backend-Standard), UI bleibt "Angebote" ✅

### 2. Navigation & Routing

| Route | Registriert? | Navigate korrekt? | Problem |
|-------|-------------|-------------------|---------|
| `/quotes` | ✅ | ✅ | – |
| `/quotes/new` | ✅ | ✅ | – |
| `/quotes/:id` | ✅ | ✅ | – |
| `/quotes/:id/edit` | ✅ | ✅ | – |
| `/orders` | ✅ | ✅ | – |
| `/orders/new` | ✅ | ✅ | – |
| `/orders/:id` | ✅ | ✅ | – |
| `/orders/:id/edit` | ✅ | ✅ | – |
| `/invoices` | ✅ | ✅ | – |
| `/invoices/new` | ✅ | ✅ | – |
| `/invoices/:id` | ✅ | ✅ | – |
| `/invoices/:id/edit` | ✅ | ✅ | – |
| `/delivery-notes` | ✅ | ❌ | "Neuer Lieferschein" Button fehlt onClick |
| `/delivery-notes/new` | ✅ | ⚠️ | Route existiert, Button navigiert nicht |
| `/delivery-notes/:id` | ✅ | ❌ | 3-Punkte "Anzeigen" fehlt navigate() |
| `/delivery-notes/:id/edit` | ✅ | – | Nicht verlinkt |
| `/credit-notes` | ✅ | ✅ | – |
| `/credit-notes/new` | ✅ | ✅ | Aber kein onSave! |
| `/credit-notes/:id` | ✅ | ✅ | – |
| `/credit-notes/:id/edit` | ✅ | – | Nicht verlinkt |
| `/reminders` | ✅ | ✅ | – |
| `/reminders/:id` | ✅ | ✅ | – |
| `/reminders/new` | ❌ | – | Route fehlt komplett |

### 3. Query-Parameter & Übergabewerte

| Parameter | Von | Nach | Funktioniert? |
|-----------|-----|------|---------------|
| `customerId` | OrderDetail | `/invoices/new` | ✅ Wird von DocumentForm gelesen |
| `customerId` | OrderDetail | `/delivery-notes/new` | ✅ |
| `orderId` | OrderDetail | `/invoices/new` | ⚠️ Wird in URL gesetzt aber DocumentForm liest es NICHT |
| `orderId` | OrderDetail | `/delivery-notes/new` | ⚠️ Wird in URL gesetzt aber DocumentForm liest es NICHT |
| `quoteId` | Quotes 3-Punkte | `/invoices/new` | ⚠️ Wird in URL gesetzt aber InvoiceCreate liest es NICHT |
| `invoiceId` | InvoiceDetail | `/credit-notes/new` | ⚠️ Wird in URL gesetzt aber CreditNoteCreate liest es NICHT |

### 4. Fehlende Seiten/Schritte

- ❌ Kein Create-Dialog für Mahnungen (nur State-Variable, kein JSX)
- ❌ Keine Zahlungserfassungs-Dialog auf der Rechnungs-Detailseite
- ❌ Kein Konvertierungs-API-Call bei Angebot → Auftrag
- ❌ Keine Edit-Route-Verlinkung für Lieferscheine und Gutschriften in den 3-Punkte-Menüs

### 5. UI/UX-Flow Probleme

- **Sackgassen**: Lieferschein-Listenansicht hat keinen funktionierenden "Neuer Lieferschein" Button
- **Buttons ohne Funktion**: Vorschau-Button in DocumentForm, Zahlung erfassen, Mahnung erstellen auf InvoiceDetail
- **Mock-Daten in Produktion**: Projekte im DocumentForm, Überfällige Rechnungen im Mahnwesen
- **Inkonsistente PDF-Generierung**: Detail-Seiten nutzen lokale jsPDF, Backend hat eigene PDF-Generierung via `downloadPdf()`

### 6. Edge Cases

- ❌ Hardcoded Firmendaten ("Loomora Metallbau AG", "Beispiel AG") statt dynamisch aus Company-Settings
- ❌ `window.print()` ohne Print-Stylesheet
- ❌ QR-Referenz-Generierung nicht MOD10-konform

---

## III. Zusammenfassung der Frontend-Fixes

### Fix 1: Filter-Buttons mit Popover versehen (Quotes, Invoices, DeliveryNotes)
**Dateien**: `Quotes.tsx`, `Invoices.tsx`, `DeliveryNotes.tsx`
- Filter-Button durch Popover mit Checkbox-Filtern ersetzen (wie in `Orders.tsx` bereits implementiert)

### Fix 2: Angebot → Auftrag Konvertierung implementieren
**Datei**: `QuoteDetail.tsx`
- `useConvertQuoteToOrder` Hook aus `use-sales.ts` importieren und in `handleConvert()` verwenden
- Nach erfolgreicher Konvertierung zur neuen Auftrags-Detailseite navigieren

### Fix 3: DocumentForm – Vorschau-Button aktivieren
**Datei**: `DocumentForm.tsx`
- PDFPreviewDialog importieren und mit den aktuellen Formulardaten verknüpfen

### Fix 4: DocumentForm – "Senden" vs "Entwurf" differenzieren
**Datei**: `DocumentForm.tsx`
- `asDraft`-Parameter im Payload als Status-Feld verwenden (DRAFT vs SENT)

### Fix 5: Mock-Projekte durch echte Projekte ersetzen
**Datei**: `DocumentForm.tsx`
- `useProjects` Hook importieren und die hardcoded SelectItems durch API-Daten ersetzen

### Fix 6: Lieferscheine – Button-Navigation und 3-Punkte-Menü fixen
**Datei**: `DeliveryNotes.tsx`
- `onClick={() => navigate("/delivery-notes/new")}` zum "Neuer Lieferschein" Button hinzufügen
- 3-Punkte-Menü Aktionen mit `navigate()` und echten Handlern verknüpfen

### Fix 7: InvoiceDetail – Zahlung erfassen und Mahnung erstellen implementieren
**Datei**: `InvoiceDetail.tsx`
- Zahlung-Button: Dialog mit Betrag/Datum/Referenz-Eingabe und `useRecordPayment`-Hook
- Mahnung-Button: Navigation zu `/reminders/new?invoiceId=${id}` oder Inline-Dialog mit `useCreateReminder`

### Fix 8: CreditNoteCreate – onSave Handler implementieren
**Datei**: `CreditNoteCreate.tsx`
- Gleich wie `QuoteCreate.tsx` Pattern: `useCreateCreditNote` Hook verwenden

### Fix 9: Mahnwesen – Mock-Daten entfernen und API anbinden
**Datei**: `Reminders.tsx`
- `overdueInvoices` durch `useOverdueInvoices` Hook ersetzen
- `useCreateReminder` und `useCreateBatchReminders` Hooks für echte API-Calls verwenden
- Create-Dialog JSX implementieren

### Fix 10: CreditNoteDetail – E-Mail-Versand Endpunkt korrigieren
**Datei**: `CreditNoteDetail.tsx`
- `sendEmail('invoices', id)` → `sendEmail('credit-notes', id)` ändern

### Fix 11: Bankverbindung dynamisch laden
**Dateien**: `DocumentForm.tsx`, `InvoiceDetail.tsx`
- Firmendaten aus `useCompany` Hook laden statt hardcoded

### Fix 12: Print-CSS hinzufügen
**Datei**: `src/index.css`
- `@media print` Regeln hinzufügen die Sidebar, Header etc. ausblenden

---

## IV. Cursor Backend-Prompts

### Prompt 1: Angebot in Auftrag/Rechnung konvertieren
```
Das Frontend ruft folgende API-Endpunkte auf die funktionieren müssen:

1. POST /api/quotes/:id/convert-to-order
   - Prüfe ob der Endpunkt existiert und korrekt implementiert ist
   - Er muss den Quote-Status auf CONFIRMED setzen
   - Einen neuen Order mit allen Positionen erstellen
   - Die Order-ID im Response zurückgeben

2. POST /api/quotes/:id/send  
   - Prüfe ob dieser Endpunkt existiert
   - Er muss den Status von DRAFT auf SENT setzen

Status: Der Endpunkt in server/src/routes/quotes.ts (Zeile 212-286) existiert bereits.
Prüfe ob er auch im NestJS-Backend (backend/src/modules/quotes/) korrekt implementiert ist.
```

### Prompt 2: Rechnung – Zahlung erfassen
```
Das Frontend ruft POST /api/invoices/:id/payment auf mit Body:
{
  "amount": number,
  "paymentDate": "YYYY-MM-DD" (optional),
  "reference": string (optional)
}

Stelle sicher dass:
1. Der Endpunkt existiert und eine Zahlung in der payments-Tabelle erstellt
2. Der Invoice paidAmount aktualisiert wird
3. Bei vollständiger Bezahlung der Status auf PAID gesetzt wird
4. Bei Teilzahlung der Status auf PARTIAL gesetzt wird
```

### Prompt 3: Rechnung senden
```
Das Frontend ruft POST /api/invoices/:id/send auf.

Stelle sicher dass:
1. Der Endpunkt den Status von DRAFT auf SENT setzt
2. Das issueDate gesetzt wird falls noch nicht vorhanden
3. Eine E-Mail an den Kunden gesendet wird (falls E-Mail-Service konfiguriert)
```

### Prompt 4: Mahnung erstellen
```
Das Frontend ruft folgende Endpunkte auf:

1. POST /api/reminders
   Body: { invoiceId: string, level?: number, fee?: number, dueDate?: string, notes?: string }
   
2. POST /api/reminders/batch
   Body: { invoiceIds: string[], level?: number, fee?: number }

3. GET /api/reminders/overdue-invoices
   Gibt alle überfälligen Rechnungen zurück die noch keine Mahnung haben.

4. POST /api/reminders/:id/send
   Body: { method: 'EMAIL' | 'PDF' | 'PRINT', recipientEmail?: string }

Stelle sicher dass alle 4 Endpunkte implementiert sind und korrekt funktionieren.
Mahngebühren nach Schweizer Standard:
- 1. Mahnung: CHF 0
- 2. Mahnung: CHF 20
- 3. Mahnung: CHF 30
- 4. Mahnung: CHF 50
- Inkasso: CHF 100
```

### Prompt 5: Gutschrift erstellen und senden
```
Das Frontend ruft folgende Endpunkte auf:

1. POST /api/credit-notes
   Body: { customerId, invoiceId?, items: [...], reason?, notes? }
   
2. POST /api/credit-notes/from-invoice/:invoiceId?reason=...
   Erstellt automatisch eine Gutschrift aus einer bestehenden Rechnung.

3. POST /api/credit-notes/:id/send (E-Mail-Versand)

Stelle sicher dass:
- Gutschriften korrekt mit Rechnungen verknüpft werden
- Der Gutschriftsbetrag den offenen Rechnungsbetrag reduziert
- Die Nummerierung GS-YYYY-NNNN verwendet
```

### Prompt 6: Lieferschein erstellen
```
Das Frontend ruft POST /api/delivery-notes auf mit Body:
{
  "customerId": string,
  "orderId"?: string,
  "deliveryDate": "YYYY-MM-DD",
  "deliveryAddress"?: string,
  "carrier"?: string,
  "notes"?: string,
  "items": [{ "description": string, "quantity": number, "unit": string }]
}

Zusätzlich: POST /api/delivery-notes/from-order/:orderId
Erstellt automatisch einen Lieferschein aus einem Auftrag mit allen Positionen.

Stelle sicher dass beide Endpunkte implementiert sind.
Nummerierung: LS-YYYY-NNNN
```

### Prompt 7: Firmendaten-Endpunkt für dynamische Bankverbindung
```
GET /api/company muss folgende Felder zurückgeben:
{
  "name": string,
  "street": string,
  "zipCode": string,
  "city": string,
  "phone": string,
  "email": string,
  "vatNumber": string,
  "iban": string,
  "qrIban": string,
  "bic": string,
  "bank": string
}

Das Frontend nutzt diese Daten für:
- PDF-Generierung (Absender)
- QR-Rechnung (IBAN/QR-IBAN)
- Bankverbindungsanzeige auf Rechnungen

Prüfe ob alle Felder in der Company-Tabelle vorhanden sind und korrekt zurückgegeben werden.
```

### Prompt 8: Rechnung – Status-Flow prüfen
```
Prüfe den kompletten Status-Flow für Rechnungen:
DRAFT → SENT → PAID (oder OVERDUE → PAID)
DRAFT → SENT → PARTIAL → PAID
DRAFT → CANCELLED

Stelle sicher dass:
1. Überfällige Rechnungen automatisch auf OVERDUE gesetzt werden (Cronjob oder bei Abfrage)
2. Der Status PARTIAL korrekt gesetzt wird bei Teilzahlungen
3. Stornierung nur bei DRAFT oder SENT möglich ist
```

### Prompt 9: Query-Parameter für kontextsensitive Erstellung
```
Die folgenden Erstellungsformulare empfangen Query-Parameter die im Backend verarbeitet werden müssen:

1. /invoices/new?orderId=xxx&customerId=yyy
   → Invoice sollte orderId referenzieren, Positionen aus Order übernehmen

2. /invoices/new?quoteId=xxx
   → Invoice sollte quoteId referenzieren, Positionen aus Quote übernehmen

3. /delivery-notes/new?orderId=xxx&customerId=yyy
   → DeliveryNote sollte orderId referenzieren

4. /credit-notes/new?invoiceId=xxx
   → CreditNote sollte invoiceId referenzieren, Positionen aus Invoice übernehmen

Prüfe ob die Backend-Endpunkte diese Referenz-IDs korrekt verarbeiten und speichern.
```

---

## V. Priorisierte Reihenfolge

### Phase 1 – Kritische Fixes (Blocker)
1. ✅ DocumentForm: Vorschau-Button, Send vs Draft, Mock-Projekte entfernen
2. ✅ QuoteDetail: Konvertierung mit echtem API-Call
3. ✅ InvoiceDetail: Zahlung erfassen, Mahnung erstellen
4. ✅ CreditNoteCreate: onSave Handler
5. ✅ DeliveryNotes: Button-Navigation
6. ✅ Bankverbindung dynamisch laden

### Phase 2 – Wichtige Fixes
7. Filter-Buttons mit Popover (Quotes, Invoices, DeliveryNotes)
8. Mahnwesen: Mock-Daten ersetzen, Create-Dialog, API-Anbindung
9. CreditNoteDetail: E-Mail-Endpunkt korrigieren
10. Print-CSS implementieren

### Phase 3 – Polishing
11. 3-Punkte-Menü Stubs implementieren (Duplizieren, Versenden)
12. Query-Parameter für kontextsensitive Erstellung
13. QR-Referenz vom Backend generieren lassen
