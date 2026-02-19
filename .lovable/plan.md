
# QR-Rechnungs-System Finalisierung — Frontend

## Vollständige Analyse des IST-Zustands

### Was ist kaputt / fehlt:

**1. `src/pages/QRInvoice.tsx` — 100% Mock-Daten**
Die Seite enthält ein hartkodiertes `const qrInvoices: QRInvoiceListItem[]` Array mit 4 Fake-Rechnungen. Kein API-Aufruf. Keine Verbindung zu echten Invoices. KPI-Karten rechnen auf Mock-Daten. Button "QR-Rechnung erstellen" tut nichts. `handleGenerateQR` simuliert nur mit `setTimeout`. Die Creditor-Daten im `handleDownloadPDF` sind hartkodiert ("Loomora Metallbau AG", "Industriestrasse 15" etc.).

**2. Sidebar — `/qr-invoice` fehlt komplett**
In `AppSidebar.tsx` ist `/qr-invoice` nirgends eingetragen. Die Route existiert in `App.tsx` (Zeile 499), aber kein Menüpunkt führt dorthin. Logisch soll es unter `salesItems` nach "Rechnungen" stehen.

**3. InvoiceDetail — kein QR-Zahlteil im PDF**
`InvoiceDetail.tsx` nutzt `downloadSalesDocumentPDF` aus `sales-document.ts`. Das ist ein einfaches Dokument **ohne QR-Zahlteil**. Der `swiss-qr-invoice.ts` Generator wird **nie aufgerufen**. Es gibt keinen Code der `rawInvoice.qrReference` oder `rawInvoice.qrIban` liest und an den QR-Generator übergibt. Das `Invoice` Interface in `use-invoices.ts` hat kein `qrReference` Feld.

**4. `DocumentForm.tsx` — falscher Toggle**
Zeile 127: `const [useQrInvoice, setUseQrInvoice] = useState(true)` + Switch auf Zeile 1158. Laut Anforderung: Wenn Company IBAN vorhanden → QR automatisch aktiv. Toggle soll entfernt werden. Die `qrReference` State-Variable (Zeile 128) und das Input-Feld (Zeile 1177-1183) sollen ebenfalls entfernt werden — das Backend generiert die Referenz automatisch.

**5. IBAN-Herkunft**
`companyData?.iban` und `companyData?.qrIban` werden bereits in `DocumentForm.tsx` korrekt aus der Company geladen. In `InvoiceDetail.tsx` werden sie auch geladen, aber nie an den QR-Generator übergeben.

---

## Implementierungsplan

### Datei 1: `src/pages/QRInvoice.tsx` — Mock entfernen, API anbinden

**Kompletter Umbau:**

- Mock-Array `const qrInvoices` entfernen (Zeilen 70–146)
- Interface `QRInvoiceListItem` erweitern um `qrReference`, `qrIban`, `street`, `zipCode`, `city`, `country` der Kunden
- `useInvoices` Hook importieren und aufrufen
- `useCompany` Hook importieren (für Creditor-Daten im PDF)
- KPI-Karten auf echte API-Daten umstellen
- `handleDownloadPDF` anpassen: Creditor-Daten aus `companyData`, Debtor-Daten aus `invoice.customer`
- Wenn Rechnung kein `qrReference` hat → klarer Alert: "QR-Rechnung kann nicht generiert werden – Referenz fehlt. Bitte Backend prüfen."
- Wenn `companyData?.iban` fehlt → Alert: "IBAN nicht konfiguriert. Einstellungen → Firma → Bankverbindung"
- Status-Mapping: Invoice-Status (DRAFT/SENT/PAID/OVERDUE) → QR-Status (draft/sent/paid)
- Button "QR-Rechnung erstellen" → navigiert zu `/invoices/new`
- Button "PDF" → ruft `generateSwissQRInvoicePDF` mit echten Daten auf (nur wenn `qrReference` vorhanden)

**Neue Logik für `handleDownloadPDF`:**
```typescript
const handleDownloadPDF = async (invoice: RealInvoice) => {
  if (!invoice.qrReference) {
    toast.error("Keine QR-Referenz vorhanden. PDF kann nicht erstellt werden.");
    return;
  }
  if (!companyData?.iban && !companyData?.qrIban) {
    toast.error("IBAN fehlt. Bitte in Einstellungen → Firma konfigurieren.");
    return;
  }
  // ...build QRInvoiceData from real data...
};
```

---

### Datei 2: `src/components/layout/AppSidebar.tsx` — QR-Rechnung in Sidebar

In `salesItems` nach dem Eintrag "Rechnungen" (Zeile 159-165) einen neuen Eintrag hinzufügen:

```typescript
{
  title: "QR-Rechnungen",
  url: "/qr-invoice",
  icon: QrCode,  // Import hinzufügen
  keywords: ["qr", "iso20022", "swiss payment", "zahlteil"],
  permission: "invoices",
},
```

Import: `QrCode` von `lucide-react` hinzufügen (Zeile 56).

---

### Datei 3: `src/pages/InvoiceDetail.tsx` — QR-Zahlteil ins PDF

**Problem:** PDF nutzt `downloadSalesDocumentPDF` (kein Zahlteil). Wenn die Rechnung eine `qrReference` hat und die Company eine IBAN hat, soll das PDF den SIX-konformen Zahlteil enthalten.

**Lösung:** `handleDownloadPDF` aufteilen:

```typescript
const handleDownloadPDF = async () => {
  const rawInv = rawInvoice as any;
  const qrRef = rawInv?.qrReference;
  const hasIban = !!(companyData?.iban || companyData?.qrIban);

  if (qrRef && hasIban) {
    // Generiere QR-Rechnung PDF (swiss-qr-invoice.ts)
    const qrData: QRInvoiceData = {
      invoiceNumber: invoiceData.id,
      invoiceDate: invoiceData.createdAt,
      dueDate: invoiceData.dueDate,
      currency: "CHF",
      amount: invoiceData.total,
      vatRate: 8.1,
      vatAmount: invoiceData.tax,
      subtotal: invoiceData.subtotal,
      iban: companyData.iban || "",
      qrIban: companyData.qrIban || undefined,
      reference: qrRef,
      referenceType: companyData.qrIban ? "QRR" : "SCOR",
      additionalInfo: `Rechnung ${invoiceData.id}`,
      creditor: {
        name: companyData.name,
        street: companyData.street || "",
        postalCode: companyData.zipCode || "",
        city: companyData.city || "",
        country: "CH",
      },
      debtor: {
        name: rawInv?.customer?.companyName || rawInv?.customer?.name || "",
        street: rawInv?.customer?.street || "",
        postalCode: rawInv?.customer?.zipCode || "",
        city: rawInv?.customer?.city || "",
        country: "CH",
      },
      positions: invoiceData.positions.map((pos, idx) => ({
        position: idx + 1,
        description: pos.description,
        quantity: pos.quantity,
        unit: pos.unit,
        unitPrice: pos.price,
        total: pos.total,
      })),
      paymentTermDays: 30,
      orderNumber: invoiceData.order || undefined,
    };
    await generateSwissQRInvoicePDF(qrData);
    toast.success("QR-Rechnung PDF wird heruntergeladen");
  } else {
    // Fallback: normales PDF ohne Zahlteil
    downloadSalesDocumentPDF(pdfData, `Rechnung-${invoiceData.id}.pdf`);
    if (!hasIban) toast.warning("Kein Zahlteil: IBAN fehlt in Einstellungen → Firma");
    else if (!qrRef) toast.warning("Kein Zahlteil: QR-Referenz fehlt (wird vom Backend generiert)");
    else toast.success("PDF wird heruntergeladen");
  }
};
```

Import `generateSwissQRInvoicePDF` und `QRInvoiceData` aus `@/lib/pdf/swiss-qr-invoice` hinzufügen.

**Zusätzlich:** `Invoice` Interface in `use-invoices.ts` um `qrReference?: string` und `qrIban?: string` ergänzen, damit TypeScript keine Fehler wirft.

---

### Datei 4: `src/components/documents/DocumentForm.tsx` — Toggle entfernen

**Entfernen:**
- State `useQrInvoice` (Zeile 127)
- State `qrReference` (Zeile 128)  
- State `esrParticipant` (Zeile 129)
- Switch "QR-Rechnung" (Zeilen 1153-1159)
- Input "QR-Referenz" (Zeilen 1161-1184)
- Badge im Header (Zeilen 539-542, konditionell auf `useQrInvoice`)
- QR-Vorschau Block im Formular ist als Info-UI (Zeilen 996-1094) in Ordnung — er zeigt Bankdaten an. Dieser **bleibt**, weil er dem User zeigt "so wird die Zahlung aussehen". Aber er darf nicht mehr vom Toggle abhängig sein — stattdessen: anzeigen wenn `companyData?.iban` vorhanden.

**Neue Bedingung für QR-Vorschau:**
```tsx
// Vorher:
{isInvoice && useQrInvoice && (

// Nachher:
{isInvoice && (companyData?.iban || companyData?.qrIban) && (
```

**QR-IBAN Display im `companyBankAccount`-Block** (Zeile 1247-1251): bleibt unverändert, ist bereits korrekt.

---

### Datei 5: `src/hooks/use-invoices.ts` — Interface erweitern

```typescript
export interface Invoice {
  // ... bestehende Felder ...
  qrReference?: string;  // NEU: QR-Referenz aus Backend
  qrIban?: string;       // NEU: QR-IBAN aus Backend
}
```

---

## Dateien-Übersicht

| Datei | Änderungen |
|---|---|
| `src/pages/QRInvoice.tsx` | Mock-Array entfernen, `useInvoices` + `useCompany` anbinden, echte PDF-Generierung, Error-States |
| `src/components/layout/AppSidebar.tsx` | QrCode Icon importieren, "QR-Rechnungen" zu salesItems hinzufügen |
| `src/pages/InvoiceDetail.tsx` | `handleDownloadPDF` → QR-PDF wenn `qrReference` + IBAN vorhanden, sonst Fallback |
| `src/components/documents/DocumentForm.tsx` | `useQrInvoice` Toggle + `qrReference` Input entfernen, QR-Vorschau auf IBAN-Check umstellen |
| `src/hooks/use-invoices.ts` | `qrReference?` und `qrIban?` zum Invoice Interface hinzufügen |

## Was NICHT geändert wird

- `src/lib/pdf/swiss-qr-invoice.ts` — korrekt implementiert, keine Änderungen nötig
- `src/lib/pdf/sales-document.ts` — bleibt als Fallback für Dokumente ohne QR
- Backend — wird als separater Cursor-Prompt behandelt
- Bestehende `InvoiceDetail` UI/Layout — nur die `handleDownloadPDF` Logik ändert sich

## Danach: Cursor-Prompt für Backend

Nach der Frontend-Implementierung wird ein vollständiger Cursor-Prompt geliefert mit:
- `qrReference` automatisch generieren beim Erstellen jeder Rechnung (Backend)
- `qrIban` aus Company in Invoice-Response mitgeben
- `GET /invoices/:id` muss `qrReference` und `qrIban` im Response enthalten
- `GET /invoices` Liste muss `customer.street`, `customer.zipCode`, `customer.city`, `customer.country` inkludieren

