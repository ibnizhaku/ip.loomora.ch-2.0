
# PDF-Anhang überall sicherstellen + Cursor Prompt

## Analyse: Aktueller Stand

Nach vollständiger Code-Prüfung ergibt sich folgendes Bild:

### Bereits korrekt implementiert (documentData wird übergeben):
- `DeliveryNoteDetail.tsx` — Referenz-Implementation, funktioniert
- `InvoiceDetail.tsx` — bereits mit `documentData={pdfData}`
- `QuoteDetail.tsx` — bereits mit `documentData={pdfData}`
- `CreditNoteDetail.tsx` — bereits mit `documentData={pdfData}`

### Fehlende / unvollständige Implementierungen:

**1. `OrderDetail.tsx` — SendEmailModal fehlt komplett**
- Seite hat bereits `pdfData` (SalesDocumentData, type: `'order'`)
- Es gibt einen PDF-Vorschau-Dialog mit `documentData={pdfData}`
- Aber kein "Per E-Mail" Button und kein `SendEmailModal` ist eingebunden

**2. `ReminderDetail.tsx` — kein Frontend-PDF, kein `documentData`**
- Mahnungen haben keinen Frontend-PDF-Generator (kein jsPDF-basiertes Template)
- Es wird `downloadPdf('reminders', id)` genutzt = Backend-generiertes PDF
- Der `SendEmailModal` ist eingebunden, aber ohne `documentData`
- Backend-Fallback via `documentType="reminder"` + `documentId` ist bereits implementiert — die Mahnung wird vom Backend generiert und angehängt (funktioniert bereits per Fallback)

**3. List-Pages (`Quotes.tsx`, `Invoices.tsx`, `CreditNotes.tsx`) — kein `documentData` möglich**
- Diese Seiten zeigen nur eine Zeile pro Dokument (kein vollständiger Datensatz)
- `pdfData` (mit allen Positionen, Kundeninfos, Firmeninfos) ist dort nicht verfügbar
- Backend-Fallback bleibt aktiv — diese Seiten senden bereits `documentType` + `documentId`
- Kein Handlungsbedarf für jetzt (PDF wird via Backend-Fallback angehängt)

---

## Implementierungsplan

### Schritt 1: OrderDetail.tsx — E-Mail Button + SendEmailModal hinzufügen

In `src/pages/OrderDetail.tsx`:
- `useState` für `emailModalOpen` hinzufügen
- Import von `SendEmailModal` ergänzen
- "Per E-Mail" Button in den Header-Bereich einfügen (neben PDF/Druck-Buttons)
- `SendEmailModal` am Ende der JSX-Struktur einbinden mit `documentData={pdfData}`

```text
Button → onClick={() => setEmailModalOpen(true)}
  <Mail className="mr-2 h-4 w-4" />
  Per E-Mail

<SendEmailModal
  open={emailModalOpen}
  onClose={() => setEmailModalOpen(false)}
  documentType="order"
  documentId={orderData.id}
  documentNumber={orderData.id}
  defaultRecipient={orderData.customer?.email}
  documentData={pdfData}
/>
```

### Schritt 2: ReminderDetail.tsx — Backend-Fallback verifizieren (kein Frontend-PDF nötig)

Der SendEmailModal sendet bereits `documentType="reminder"` + `documentId`. Das Backend-`mail.service.ts` hat einen Fallback, der `generateReminderPdf()` aufruft. Dies funktioniert bereits — kein `documentData` nötig, da es kein jsPDF-Template für Mahnungen gibt.

Einzige Anpassung: Sicherstellen dass im `SendEmailModal` der Text "Das Dokument wird automatisch als PDF-Anhang beigefügt" korrekt angezeigt wird, auch wenn `documentData` nicht gesetzt ist (Backend-Fallback-Modus).

### Schritt 3: Hinweistext in SendEmailModal verbessern

Aktuell zeigt der Modal den Attachment-Hinweis nur wenn `documentData` vorhanden. Für Reminder (Backend-Fallback) soll trotzdem angezeigt werden, dass ein PDF angehängt wird.

```text
Wenn documentData vorhanden:
  → "Lieferschein-LS-001.pdf wird als Anhang beigefügt"

Wenn documentData NICHT vorhanden aber documentType & documentId:
  → "Das Dokument wird automatisch als PDF-Anhang beigefügt"
```

---

## Cursor Prompt für das Backend

```
In backend/src/modules/mail/mail.service.ts, verify and fix the reminder PDF fallback:

The sendMail() method has two code paths:
1. If pdfBase64 + pdfFilename are provided → use Frontend PDF (already works for invoices, quotes, delivery notes, credit notes, orders)
2. If documentId + documentType are provided → generate PDF via generateDocumentPdf() (fallback for reminders)

Ensure the case 'reminder' in generateDocumentPdf() calls this.pdfService.generateReminderPdf(doc) correctly and returns a proper Buffer. The doc must include: invoice (with customer and items).

Check that PdfService.generateReminderPdf() exists and accepts a reminder object with nested invoice.customer data.

If PdfService.generateReminderPdf() does not exist or is incomplete, implement it following the same pattern as generateInvoicePdf().
```

---

## Dateien die geändert werden

| Datei | Änderung |
|---|---|
| `src/pages/OrderDetail.tsx` | `useState emailModalOpen`, Mail-Button, `SendEmailModal` mit `documentData={pdfData}` |
| `src/components/email/SendEmailModal.tsx` | Hinweistext auch bei Backend-Fallback (ohne documentData) anzeigen |
| `src/pages/ReminderDetail.tsx` | Kein Frontend-PDF möglich → bleibt bei Backend-Fallback, kein `documentData` |

---

## Cursor Prompt (vollständig, zum Kopieren)

Dieser Prompt soll an Cursor übergeben werden nachdem die Frontend-Änderungen implementiert sind:

---

**CURSOR PROMPT:**

In `backend/src/modules/mail/mail.service.ts` und `backend/src/common/services/pdf.service.ts`, prüfe und vervollständige den PDF-Anhang-Fallback für Mahnungen (reminder):

**Aufgabe 1 — mail.service.ts:**
Die `sendMail()`-Methode hat zwei Pfade:
- Pfad A: `pdfBase64` + `pdfFilename` vorhanden → Frontend-PDF wird als Buffer direkt verwendet (funktioniert für Rechnungen, Angebote, Lieferscheine, Aufträge, Gutschriften)
- Pfad B: `documentType` + `documentId` vorhanden → Backend generiert PDF via `generateDocumentPdf()` (Fallback für Mahnungen)

Sicherstellen dass in `generateDocumentPdf()` der `case 'reminder'` korrekt funktioniert:
- `prisma.reminder.findFirst()` mit `include: { invoice: { include: { customer: true, items: true } } }` aufrufen
- `this.pdfService.generateReminderPdf(doc)` aufrufen
- Den Dateinamen als `Mahnung-${doc.number}.pdf` zurückgeben

**Aufgabe 2 — pdf.service.ts:**
Prüfe ob `generateReminderPdf()` in `PdfService` existiert und vollständig implementiert ist. Die Methode muss:
- Ein Reminder-Objekt mit `invoice.customer` und `invoice.items` entgegennehmen
- Ein professionelles PDF mit Mahnstufe, Fälligkeitsdatum, offener Betrag, Mahngebühr, Verzugszins und Gesamtforderung enthalten
- Als `Promise<Buffer>` zurückgeben

Falls `generateReminderPdf()` nicht existiert oder unvollständig ist, implementiere es vollständig nach dem gleichen Muster wie `generateInvoicePdf()`.

**Aufgabe 3 — Verifizierung:**
Stelle sicher dass alle 5 Dokumenttypen (invoice, quote, order, delivery-note, credit-note) korrekt den Pfad A (Frontend-PDF Base64) nehmen wenn `pdfBase64` vorhanden ist, und dass Pfad B (Backend-Fallback) nur für `reminder` aktiv ist.
