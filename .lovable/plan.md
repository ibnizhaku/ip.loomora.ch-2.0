
# Workflow-Verbesserungen: Angebote

## Problem-Analyse

### Problem 1: "Angebot senden" Button — schlechte UX
**Aktuell:** In `DocumentForm.tsx` gibt es einen Button "Angebot senden" (sendLabel), der das Angebot direkt mit Status `SENT` speichert. Es ist nicht intuitiv — der Benutzer erwartet, dass "senden" das Angebot per E-Mail verschickt.

**Empfehlung:** Zwei separate Buttons im Header:
- `Als Entwurf speichern` (bleibt gleich)
- `Angebot erstellen` → speichert als DRAFT und navigiert zur Detailseite (wo E-Mail, PDF etc. dann verfügbar sind)
- Auf der **Detailseite** (QuoteDetail.tsx) gibt es bereits einen eigenen "Per E-Mail senden" Button

Alternativ: Den "Angebot senden" Button umbenennen in "Angebot erstellen" (Status DRAFT → direkt zur Detailansicht). Der Benutzer kann dann von der Detailansicht aus per E-Mail senden.

**Gewählt: Saubere Lösung** — Button "Angebot senden" wird zu "Angebot erstellen" umbenannt und speichert als `DRAFT`. Danach öffnet ein kleines **After-Save-Dialog** mit zwei Optionen:
- "PDF anzeigen" → öffnet Vorschau auf Detailseite
- "Per E-Mail senden" → öffnet direkt E-Mail Modal auf Detailseite

Da die Detailseite alle Daten neu lädt (API), ist das der sauberste Weg. Der Button navigiert zur Detailseite mit einem `?action=email` oder `?action=preview` Query-Parameter, den QuoteDetail.tsx dann auswertet und den entsprechenden Dialog automatisch öffnet.

---

### Problem 2: PDF — Firma und Name falsche Reihenfolge
**Datei:** `src/lib/pdf/sales-document.ts`, Zeilen 136–153

**Aktuell:**
```
data.customer.name      ← steht ganz oben (z.B. "Max Muster")
data.customer.contact   ← steht darunter (z.B. "Muster AG")
```

**Problem:** In `QuoteDetail.tsx` wird das `customer`-Objekt so gebaut:
```typescript
customer: {
  name: quoteData.customer.name,       // = "Muster AG" (Firmenname aus mapQuoteToView)
  contact: quoteData.customer.contact, // = contactPerson oder companyName
  ...
}
```

Aber in `mapQuoteToView`:
```typescript
name: quote.customer?.name || "Unbekannt",      // Personenname
contact: quote.customer?.contactPerson || quote.customer?.companyName || "",
```

Das Problem ist: `name` enthält den Personennamen und `contact` den Firmennamen. Im PDF wird `name` zuerst gedruckt, dann `contact`. Die korrekte Reihenfolge für Schweizer Geschäftspost:
```
Firma / Unternehmensname  ← zuerst
z.Hd. Kontaktperson      ← darunter (optional)
```

**Fix:** In `sales-document.ts` im Adressblock zuerst prüfen ob `contact` ein Firmenname ist und `name` ein Personenname, dann entsprechend umkehren. Einfacher: Im PDF-Generator prüfen ob `contact` gesetzt ist und dann `contact` zuerst, `name` darunter anzeigen.

**Noch einfacher und robuster:** In allen Detailseiten (QuoteDetail, InvoiceDetail, etc.) das `pdfData.customer`-Objekt so befüllen, dass `name` immer die Firma ist und `contact` der Personenname — was bereits der Fall ist bei Firmenkunden. Das Problem liegt in `mapQuoteToView` wo:

```typescript
name: quote.customer?.name || "Unbekannt",
contact: quote.customer?.contactPerson || quote.customer?.companyName || "",
```

`quote.customer.name` ist der Personenname (z.B. "Hans Muster"), `companyName` wäre "Muster AG". Der Fix in `mapQuoteToView`:

```typescript
// Firma hat Vorrang
name: quote.customer?.companyName || quote.customer?.name || "Unbekannt",
contact: quote.customer?.companyName 
  ? (quote.customer?.contactPerson || quote.customer?.name || "")
  : (quote.customer?.contactPerson || ""),
```

Und in `sales-document.ts` zusätzlich sicherstellen, dass `contact` mit "z.Hd." Präfix angezeigt wird wenn vorhanden:

```typescript
// Zeile 142-145 aktuell:
if (data.customer.contact) {
  yPos += 5;
  doc.text(data.customer.contact, margin, yPos);
}
```

Bleibt gleich, aber `contact` enthält jetzt den Personennamen.

---

### Problem 3: "Per E-Mail" Button in Vorschau funktioniert nicht
**Datei:** `src/components/documents/PDFPreviewDialog.tsx`, Zeile 91-98

**Problem:** `handleEmail` prüft ob `onSendEmail` übergeben wurde. Wenn nicht, zeigt es nur `toast.info("E-Mail-Versand wird vorbereitet...")` — kein tatsächlicher E-Mail Dialog.

**In QuoteDetail.tsx** (Zeile 780):
```tsx
<PDFPreviewDialog 
  open={showPDFPreview} 
  onOpenChange={setShowPDFPreview} 
  documentData={pdfData} 
  title={`Angebot ${quoteData.id}`} 
/>
```

**`onSendEmail` prop fehlt!** Der Fix ist einfach: `onSendEmail` übergeben:

```tsx
<PDFPreviewDialog
  open={showPDFPreview}
  onOpenChange={setShowPDFPreview}
  documentData={pdfData}
  title={`Angebot ${quoteData.id}`}
  onSendEmail={() => setEmailModalOpen(true)}  // ← NEU
/>
```

Diese Korrektur muss auch bei **InvoiceDetail**, **OrderDetail**, **DeliveryNoteDetail**, **CreditNoteDetail** geprüft und ggf. ergänzt werden.

---

## Implementierungsplan

### Schritt 1: "Per E-Mail" Button in Vorschau reparieren (alle Detailseiten)

In folgenden Dateien `onSendEmail` prop zum `PDFPreviewDialog` hinzufügen:
- `src/pages/QuoteDetail.tsx` — fehlt
- `src/pages/InvoiceDetail.tsx` — prüfen
- `src/pages/OrderDetail.tsx` — prüfen
- `src/pages/DeliveryNoteDetail.tsx` — prüfen
- `src/pages/CreditNoteDetail.tsx` — prüfen

Änderung jeweils:
```tsx
<PDFPreviewDialog
  open={showPDFPreview}
  onOpenChange={setShowPDFPreview}
  documentData={pdfData}
  title="..."
  onSendEmail={() => setEmailModalOpen(true)}  // ← hinzufügen
/>
```

### Schritt 2: Firma/Name Reihenfolge im PDF korrigieren

**Datei: `src/pages/QuoteDetail.tsx`** — `mapQuoteToView` anpassen:

```typescript
// Zeile 113-115 aktuell:
customer: {
  id: quote.customer?.id,
  name: quote.customer?.name || "Unbekannt",
  contact: quote.customer?.contactPerson || quote.customer?.companyName || "",
```

**Fix:**
```typescript
customer: {
  id: quote.customer?.id,
  name: quote.customer?.companyName || quote.customer?.name || "Unbekannt",
  contact: quote.customer?.companyName
    ? (quote.customer?.name && quote.customer.name !== quote.customer.companyName
        ? quote.customer.name
        : (quote.customer?.contactPerson || ""))
    : (quote.customer?.contactPerson || ""),
```

**Datei: `src/lib/pdf/sales-document.ts`** — Adressblock anpassen, damit `contact` als "z.Hd." Zeile angezeigt wird:

```typescript
// Vorher (Zeile 142-145):
if (data.customer.contact) {
  yPos += 5;
  doc.text(data.customer.contact, margin, yPos);
}

// Nachher:
if (data.customer.contact) {
  yPos += 5;
  doc.text(`z.Hd. ${data.customer.contact}`, margin, yPos);
}
```

Aber nur wenn `contact` kein Firmenname ist (d.h. wenn `name` bereits der Firmenname ist). Da wir den Fix in mapQuoteToView machen, enthält `contact` jetzt immer den Personennamen → "z.Hd." Präfix ist korrekt.

### Schritt 3: "Angebot senden" Button-Label und Workflow anpassen

**Datei: `src/components/documents/DocumentForm.tsx`**

Nur für `type === "quote"`: Den "Angebot senden" Button umbenennen in "Angebot erstellen & senden" und einen **Post-Save-Dialog** hinzufügen. Der Dialog erscheint nach erfolgreichem Speichern mit zwei Aktionen:

```text
Nach dem Speichern → Dialog öffnet sich:
┌─────────────────────────────────────────┐
│  Angebot wurde erstellt                 │
│                                         │
│  [📄 PDF Vorschau]  [✉️ Per E-Mail senden] │
│              [Zur Detailansicht]        │
└─────────────────────────────────────────┘
```

Technisch: Nach `navigate(`${backPath}/${result.id}`)` wird der Benutzer zur Detailseite navigiert. Um den E-Mail Dialog direkt zu öffnen, wird `?sendEmail=1` als Query-Parameter übergeben, den QuoteDetail.tsx auswertet.

**Einfachere Variante (empfohlen):** Den Button nur umbenennen von "Angebot senden" → "Angebot erstellen" und den Status auf `DRAFT` setzen (nicht `SENT`). Der Benutzer sieht dann auf der Detailseite klar die Aktionen "Per E-Mail senden" und "PDF anzeigen". Kein extra Dialog nötig.

In `typeConfig`:
```typescript
quote: { title: ..., backPath: "/quotes", sendLabel: "Angebot erstellen" },
```

Und in `handleSave`:
```typescript
status: asDraft ? "DRAFT" : (isDeliveryNote ? "SHIPPED" : "SENT"),
```

→ Nur für Angebote: Immer `DRAFT` als Initialstatus setzen (da Angebote erst "SENT" werden wenn sie per E-Mail versendet werden).

---

## Dateien-Übersicht

| Datei | Änderung |
|---|---|
| `src/pages/QuoteDetail.tsx` | `mapQuoteToView` Firma/Name-Logik korrigieren + `onSendEmail` zu PDFPreviewDialog |
| `src/lib/pdf/sales-document.ts` | `contact` mit "z.Hd." Präfix anzeigen |
| `src/pages/InvoiceDetail.tsx` | `onSendEmail` zu PDFPreviewDialog |
| `src/pages/OrderDetail.tsx` | `onSendEmail` zu PDFPreviewDialog |
| `src/pages/DeliveryNoteDetail.tsx` | `onSendEmail` zu PDFPreviewDialog |
| `src/pages/CreditNoteDetail.tsx` | `onSendEmail` zu PDFPreviewDialog |
| `src/components/documents/DocumentForm.tsx` | Button-Label "Angebot erstellen" + DRAFT-Status für Angebote |
