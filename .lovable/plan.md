
# ISO 20022 QR-Rechnung — Vollständige SIX-konforme Korrektur

## Audit-Ergebnisse: Gefundene Fehler

### 1. QR Payload (`buildQRCodeData`) — 2 Fehler

**Fehler A — Falsche Anzahl AV-Zeilen (Trailer):**
Die SIX-Spezifikation verlangt exakt **zwei** Alternative-Procedure-Zeilen (`AV1` und `AV2`). Aktuell wird nur **eine** leere Zeile angehängt.

```
Aktuell (falsch):    Soll (SIX-konform):
...                  ...
EPD                  EPD
""  ← nur 1          ""  ← AV1 (leer wenn nicht genutzt)
                     ""  ← AV2 (leer wenn nicht genutzt)
```

**Fehler B — Kein Trailing Newline Handling:**
`lines.join("\n")` ist korrekt. Aber: Wenn `amount` null oder 0 ist, muss trotzdem `"0.00"` oder `""` (leer, nicht "0.00") eingetragen werden. SIX-Spec: Bei leerem Betrag muss das Feld komplett leer bleiben (kein Wert), nicht "0.00".

---

### 2. Swiss Cross — Falsche Positionierung

Das Swiss Cross wird mit `size = QR_CODE_SIZE = 46mm` berechnet. Die Darstellung ist dadurch inkorrekt skaliert. Laut SIX-Spezifikation:

- Swiss Cross: exakt **7×7mm**
- Weißes Quadrat darum: exakt **6×6mm** weiß gefüllt
- Positioniert **exakt zentriert** auf dem QR-Code

Die aktuelle `drawSwissCross(doc, qrX, qrY, QR_CODE_SIZE)` Funktion übergibt `size=46` und berechnet alles relativ dazu — dies ergibt falsche Dimensionen.

**Korrekte SIX-Maße:**
```
Schweizer Kreuz gesamt:     7.0 × 7.0 mm
Weißes Quadrat (Hintergrund): 6.0 × 6.0 mm  (1mm Abstand zum Rand)
Rotes Quadrat:              4.8 × 4.8 mm
Weißes Kreuz (Vertikalarm): 1.0 × 2.8 mm  (zentriert im roten Quadrat)
Weißes Kreuz (Horizontalarm): 2.8 × 1.0 mm
```

---

### 3. PDF Layout — Falsche X-Koordinaten

```
RECEIPT_WIDTH = 62mm  ← korrekt (SIX-Spec)
paymentX = RECEIPT_WIDTH + 5 = 67mm  ← FALSCH (+5mm Lücke)
```

Laut SIX-Spec beginnt der Zahlteil **direkt bei 62mm**, kein zusätzlicher Abstand. Alle Texte im Zahlteil (IBAN, Kreditor, Betrag, Referenz etc.) müssen ab `x = 67mm` beginnen (5mm innerer Abstand vom Trennstrich). Das ergibt:
- Trennstrich: x = 62mm
- Inhalte Zahlteil: x = 67mm (5mm Abstand) ✅ — tatsächlich korrekt nach Spec

**Echter Fehler**: Der QR-Code selbst (`qrX = paymentX = 67mm`) liegt korrekt. Aber der "Zahlbar durch"-Block auf der rechten Seite:
```
debtorX = paymentX + 80 = 147mm
```
Der Zahlteil endet bei `62 + 148 = 210mm`. `debtorX = 147mm` → Textbereich nur 63mm breit → kann Inhalt abschneiden. Sollte `debtorX = 130mm` sein für ausreichend Platz.

---

### 4. Backend `pdf.service.ts` — Komplett defekter QR-Payload

Zeile 126 (Backend) ist vollständig falsch:

```typescript
// FALSCH — escaped \n statt echten Zeilenumbrüchen:
const qrData = `SPC\\n0200\\n1\\nCH4431999123000889012\\nK\\n...`;
```

Probleme:
- `\\n` erzeugt literale Backslash-n-Zeichen, keine Zeilenumbrüche
- Adresstyp `K` (kombiniert) statt `S` (strukturiert)
- IBAN hardcoded (`CH4431999123000889012`)
- Debitordaten falsch strukturiert (nur 4 Felder statt 7)
- Kein `EPD` + AV-Zeilen

Der Backend-Service muss die **gleiche Payload-Logik** wie das Frontend verwenden — entweder durch Extraktion in eine shared utility oder durch Reimplementierung der korrekten Sequenz.

---

### 5. IBAN-Anzeige im Empfangsschein — Falsch

Im Empfangsschein und Zahlteil wird immer `data.iban` gedruckt. Aber: Wenn `referenceType === "QRR"` und `qrIban` vorhanden ist, **muss die QR-IBAN gedruckt werden** (nicht die normale IBAN), da die Zahlung über die QR-IBAN abgewickelt wird.

```
Aktuell: doc.text(formatIBAN(data.iban), ...)  ← immer normale IBAN
Soll:    doc.text(formatIBAN(effectiveIban), ...)  ← QR-IBAN wenn QRR
```

---

### 6. `QRInvoice.tsx` — Hardcodierte Debtor-Adressdaten

```typescript
debtor: {
  name: invoice.customer,
  street: "Kundenstrasse 1",  // ← HARDCODED PLACEHOLDER
  postalCode: "8000",          // ← HARDCODED PLACEHOLDER  
  city: "Zürich",              // ← HARDCODED PLACEHOLDER
  country: "CH",
},
```

Die Kundenadressen müssen aus der Datenbank geladen werden.

---

## Implementierungsplan

### Datei 1: `src/lib/pdf/swiss-qr-invoice.ts`

**Änderung 1.1 — `buildQRCodeData`: Zweite AV-Zeile hinzufügen**

```typescript
// Trailer
lines.push("EPD");
lines.push(""); // AV1 (leer)
lines.push(""); // AV2 (leer)  ← NEU
```

**Änderung 1.2 — `buildQRCodeData`: Betrag-Handling**

Wenn `amount === 0` oder nicht angegeben, muss das Feld leer sein (SIX-Spec erlaubt offene Rechnungen ohne Betrag):

```typescript
// Payment Amount
if (data.amount > 0) {
  lines.push(data.amount.toFixed(2));
} else {
  lines.push(""); // Offener Betrag
}
lines.push(data.currency);
```

**Änderung 1.3 — `drawSwissCross`: Exakte SIX-Maße**

```typescript
function drawSwissCross(doc: jsPDF, centerX: number, centerY: number): void {
  // Weißes Hintergrundquadrat: 6×6mm
  doc.setFillColor(255, 255, 255);
  doc.rect(centerX - 3, centerY - 3, 6, 6, "F");
  
  // Rotes Quadrat: 4.8×4.8mm  
  doc.setFillColor(220, 0, 0); // SIX-Rot: #DC0000
  doc.rect(centerX - 2.4, centerY - 2.4, 4.8, 4.8, "F");
  
  // Weißes Kreuz — Vertikalarm: 1.0×2.8mm
  doc.setFillColor(255, 255, 255);
  doc.rect(centerX - 0.5, centerY - 1.4, 1.0, 2.8, "F");
  
  // Weißes Kreuz — Horizontalarm: 2.8×1.0mm
  doc.rect(centerX - 1.4, centerY - 0.5, 2.8, 1.0, "F");
}
```

Aufruf anpassen:
```typescript
// Vorher:
drawSwissCross(doc, qrX, qrY, QR_CODE_SIZE);

// Nachher (Mittelpunkt des QR-Codes):
drawSwissCross(doc, qrX + QR_CODE_SIZE / 2, qrY + QR_CODE_SIZE / 2);
```

**Änderung 1.4 — IBAN-Anzeige: QR-IBAN wenn QRR**

```typescript
// Vorher:
doc.text(formatIBAN(data.iban), receiptX, receiptY);

// Nachher:
const displayIban = (data.referenceType === "QRR" && data.qrIban)
  ? data.qrIban
  : data.iban;
doc.text(formatIBAN(displayIban), receiptX, receiptY);
```

Diese Korrektur an **beiden Stellen** anwenden (Empfangsschein + Zahlteil).

**Änderung 1.5 — `debtorX` Anpassung**

```typescript
// Vorher:
const debtorX = paymentX + 80; // = 147mm → zu knapp am Rand

// Nachher:
const debtorX = paymentX + 75; // = 130mm → 80mm Restbreite bis 210mm
```

**Änderung 1.6 — `buildQRCodeData` als Export**

Die Funktion wird von `private` zu `export` geändert, damit das Backend sie künftig nutzen kann (Phase 5).

---

### Datei 2: `backend/src/common/services/pdf.service.ts`

**Änderung 2.1 — Korrekter QR-Payload-Generator**

Die defekte Zeile 126 wird durch eine korrekte Implementierung ersetzt, die der SIX-Spezifikation entspricht:

```typescript
// Korrekter QR-Payload (echte \n, Adresstyp S, strukturiert)
const effectiveIban = invoice.qrIban 
  ? invoice.qrIban.replace(/\s/g, '')
  : (invoice.iban || '').replace(/\s/g, '');

const qrLines = [
  'SPC',
  '0200',
  '1',
  effectiveIban,
  'S',
  (invoice.company?.name || '').substring(0, 70),
  (invoice.company?.street || '').substring(0, 70),
  (invoice.company?.buildingNumber || ''),
  (invoice.company?.zip || '').substring(0, 16),
  (invoice.company?.city || '').substring(0, 35),
  (invoice.company?.country || 'CH'),
  '', '', '', '', '', '', '', // Ultimate Creditor (7 leer)
  Number(invoice.totalAmount || 0).toFixed(2),
  'CHF',
  'S',
  (invoice.customer?.companyName || invoice.customer?.name || '').substring(0, 70),
  (invoice.customer?.street || ''),
  '',
  (invoice.customer?.zip || '').substring(0, 16),
  (invoice.customer?.city || '').substring(0, 35),
  (invoice.customer?.country || 'CH'),
  'QRR',
  (invoice.qrReference || '').replace(/\s/g, ''),
  (invoice.additionalInfo || '').substring(0, 140),
  'EPD',
  '', // AV1
  '', // AV2
];
const qrData = qrLines.join('\n');
```

---

### Datei 3: `src/pages/QRInvoice.tsx`

**Änderung 3.1 — API-Daten für Debtor aus Datenbank laden**

Den `handleDownloadPDF` Handler so anpassen, dass echte Kundendaten aus dem API-Response verwendet werden (sofern die `QRInvoiceListItem`-Schnittstelle die Adressfelder enthält).

Die `QRInvoiceListItem` Schnittstelle wird erweitert um:
```typescript
customerStreet?: string;
customerPostalCode?: string;
customerCity?: string;
customerCountry?: string;
```

Und der API-Call wird entsprechend angepasst.

---

## Dateien-Übersicht

| Datei | Änderungen |
|---|---|
| `src/lib/pdf/swiss-qr-invoice.ts` | AV2-Zeile, Swiss Cross exakte Maße, QR-IBAN Anzeige, debtorX, buildQRCodeData export, Betrag-Handling |
| `backend/src/common/services/pdf.service.ts` | QR-Payload komplett korrigiert (echte \\n, Adresstyp S, strukturiert, EPD+AV1+AV2) |
| `src/pages/QRInvoice.tsx` | Debtor-Adressdaten aus DB, Schnittstelle erweitert |

---

## Zusammenfassung: Was NICHT geändert wird

- QR-Code Fehlerkorrektur `"M"` ✅ (korrekt laut SIX)
- `margin: 0` beim QR-Code ✅ (korrekt, Ruhezone wird durch PDF-Layout sichergestellt)
- `RECEIPT_WIDTH = 62` ✅ (korrekt)
- `PAYMENT_PART_HEIGHT = 105` ✅ (korrekt)
- `QR_CODE_SIZE = 46` ✅ (korrekt)
- `perfY = 297 - 105 = 192` ✅ (korrekt)
- Trennstrich-Logik ✅ (korrekt)
- Mod10-Algorithmus für `generateQRReference` ✅ (korrekt implementiert)
- `isQRIBAN` IID-Prüfung 30000–31999 ✅ (korrekt)
