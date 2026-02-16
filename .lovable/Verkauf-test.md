# Verkauf-Modul – Vollständige Test-Checkliste & Analyse

> Erstellt: 2026-02-16  
> Modul: Verkauf (Angebote, Aufträge, Lieferscheine, Rechnungen, Gutschriften, Mahnwesen)  
> Status: 🟢 Frontend komplett – Backend-Prompts bereit für Cursor

---

## I. Gemeldete Fehler – Checkliste

### A. Angebote (`/quotes`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| A1 | ✅ Filter-Button funktioniert nicht | Popover mit Checkbox-Filtern implementiert | ✅ Erledigt |
| A2 | ✅ Vorschau funktioniert nicht | PDFPreviewDialog mit dynamischen Firmendaten via `useCompany` | ✅ Erledigt |
| A3 | ✅ Angebot in Auftrag umwandeln funktioniert nicht | `useConvertQuoteToOrder` Hook korrekt angebunden | ✅ Erledigt |
| A4 | ✅ Angebot in Rechnung umwandeln | Navigation mit Query-Parametern implementiert | ✅ Erledigt |
| A5 | ✅ 3-Punkte-Menü funktioniert | Aktionen mit echten Handlern verknüpft | ✅ Erledigt |

### B. Aufträge (`/orders`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| B1 | ✅ Rechnung senden nach Auftrag | `asDraft`-Parameter wird korrekt als Status DRAFT/SENT verarbeitet | ✅ Erledigt |
| B2 | ✅ Vorschau funktioniert | PDFPreviewDialog mit onClick-Handler implementiert | ✅ Erledigt |
| B3 | ✅ Projekte zeigen echte Daten | `useProjects` Hook ersetzt Mock-Daten | ✅ Erledigt |

### C. Lieferscheine (`/delivery-notes`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| C1 | ✅ "Neuer Lieferschein"-Button | onClick mit navigate implementiert | ✅ Erledigt |
| C2 | ✅ 3-Punkte-Menü Aktionen | navigate() und echte Handler verknüpft | ✅ Erledigt |
| C3 | ✅ Filter-Button | Popover mit Checkbox-Filtern implementiert | ✅ Erledigt |

### D. Rechnungen (`/invoices`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| D1 | ✅ Zahlung erfassen | `useRecordPayment` Hook mit Dialog implementiert | ✅ Erledigt |
| D2 | ✅ Mahnung erstellen | Navigation zu `/reminders/new?invoiceId=` implementiert | ✅ Erledigt |
| D3 | ✅ Vorschau funktioniert | Dynamische Firmendaten via `useCompany` | ✅ Erledigt |
| D4 | ✅ Drucken | Print-CSS `@media print` in index.css implementiert | ✅ Erledigt |
| D5 | ✅ 3-Punkte-Menü | E-Mail-Versand und Stornierung mit API-Calls | ✅ Erledigt |
| D6 | ✅ Rechnung erstellen – Vorschau | PDFPreviewDialog mit onClick | ✅ Erledigt |
| D7 | ✅ Rechnung erstellen – Senden | asDraft-Parameter korrekt verarbeitet | ✅ Erledigt |
| D8 | ⚠️ QR-Code nicht produktionsreif | Backend muss MOD10-Referenz generieren | 🔧 Backend |
| D9 | ✅ Mock-Projekte entfernt | `useProjects` Hook ersetzt Mock-Daten | ✅ Erledigt |
| D10 | ✅ Bankverbindung dynamisch | `useCompany` Hook für IBAN/Bank | ✅ Erledigt |
| D11 | ✅ Filter-Button | Popover mit Checkbox-Filtern implementiert | ✅ Erledigt |
| D12 | ✅ 3-Punkte-Menü Listenansicht | Handler für Download und E-Mail | ✅ Erledigt |

### E. Gutschriften (`/credit-notes`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| E1 | ✅ Vorschau funktioniert | PDFPreviewDialog implementiert mit Vorschau-Button | ✅ Erledigt |
| E2 | ✅ E-Mail-Versand korrigiert | `sendEmail('credit-notes', id)` korrekt | ✅ Erledigt |
| E3 | ✅ Speichern funktioniert | `useCreateCreditNote` Hook mit onSave implementiert | ✅ Erledigt |

### F. Mahnwesen (`/reminders`)

| # | Problem | Ursache (Frontend-Analyse) | Status |
|---|---------|---------------------------|--------|
| F1 | ✅ Mahnung erstellen Dialog | Create-Dialog mit API-Anbindung implementiert | ✅ Erledigt |
| F2 | ✅ Mahnungen erstellen bei überfälligen | `useCreateReminder` Hook mit echtem API-Call | ✅ Erledigt |
| F3 | ✅ Mock-Daten entfernt | `useOverdueInvoices` Hook ersetzt hardcoded Daten | ✅ Erledigt |
| F4 | ✅ Sammel-Mahnung | `useCreateBatchReminders` Hook mit API-Call | ✅ Erledigt |
| F5 | ✅ Mahnungen-Daten aus API | React Query statt lokaler State | ✅ Erledigt |
| F6 | ⚠️ Keine separate Route | Mahnung wird über Dialog auf Reminders-Seite erstellt (kein `/reminders/new` nötig) | ✅ Design-Entscheidung |

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

### Fix 1: ✅ Filter-Buttons mit Popover versehen (Quotes, Invoices, DeliveryNotes)
**Dateien**: `Quotes.tsx`, `Invoices.tsx`, `DeliveryNotes.tsx`
- Filter-Button durch Popover mit Checkbox-Filtern ersetzt

### Fix 2: ✅ Angebot → Auftrag Konvertierung implementieren
**Datei**: `QuoteDetail.tsx`
- `useConvertQuoteToOrder` Hook angebunden

### Fix 3: ✅ DocumentForm – Vorschau-Button aktivieren
**Datei**: `DocumentForm.tsx`
- PDFPreviewDialog mit onClick-Handler implementiert

### Fix 4: ✅ DocumentForm – "Senden" vs "Entwurf" differenzieren
**Datei**: `DocumentForm.tsx`
- `asDraft`-Parameter korrekt als Status-Feld verarbeitet

### Fix 5: ✅ Mock-Projekte durch echte Projekte ersetzen
**Datei**: `DocumentForm.tsx`
- `useProjects` Hook ersetzt hardcoded SelectItems

### Fix 6: ✅ Lieferscheine – Button-Navigation und 3-Punkte-Menü fixen
**Datei**: `DeliveryNotes.tsx`
- navigate() und echte Handler verknüpft

### Fix 7: ✅ InvoiceDetail – Zahlung erfassen und Mahnung erstellen implementieren
**Datei**: `InvoiceDetail.tsx`
- Zahlung-Dialog mit `useRecordPayment`-Hook implementiert

### Fix 8: ✅ CreditNoteCreate – onSave Handler implementieren
**Datei**: `CreditNoteCreate.tsx`
- `useCreateCreditNote` Hook mit onSave implementiert

### Fix 9: ✅ Mahnwesen – Mock-Daten entfernen und API anbinden
**Datei**: `Reminders.tsx`
- `useOverdueInvoices`, `useCreateReminder`, `useCreateBatchReminders` Hooks angebunden

### Fix 10: ✅ CreditNoteDetail – E-Mail-Versand Endpunkt korrigieren
**Datei**: `CreditNoteDetail.tsx`
- `sendEmail('credit-notes', id)` korrigiert

### Fix 11: ✅ Bankverbindung dynamisch laden
**Dateien**: `DocumentForm.tsx`, `InvoiceDetail.tsx`
- `useCompany` Hook für dynamische Firmendaten

### Fix 12: ✅ Print-CSS hinzufügen
**Datei**: `src/index.css`
- `@media print` Regeln für sauberen Druck implementiert

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

### Phase 1 – ✅ Kritische Fixes (Blocker) — ERLEDIGT
1. ✅ DocumentForm: Vorschau-Button, Send vs Draft, Mock-Projekte entfernen
2. ✅ QuoteDetail: Konvertierung mit echtem API-Call
3. ✅ InvoiceDetail: Zahlung erfassen, Mahnung erstellen
4. ✅ CreditNoteCreate: onSave Handler
5. ✅ DeliveryNotes: Button-Navigation
6. ✅ Bankverbindung dynamisch laden

### Phase 2 – ✅ Wichtige Fixes — ERLEDIGT
7. ✅ Filter-Buttons mit Popover (Quotes, Invoices, DeliveryNotes)
8. ✅ Mahnwesen: Mock-Daten ersetzen, Create-Dialog, API-Anbindung
9. ✅ CreditNoteDetail: E-Mail-Endpunkt korrigieren
10. ✅ Print-CSS implementiert

### Phase 3 – ⚠️ Backend-abhängig
11. ✅ 3-Punkte-Menü Aktionen implementiert
12. ⚠️ Query-Parameter für kontextsensitive Erstellung → Backend muss Referenz-IDs verarbeiten
13. ⚠️ QR-Referenz vom Backend generieren lassen → MOD10-Algorithmus im Backend
