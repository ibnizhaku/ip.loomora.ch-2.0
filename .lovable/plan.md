
# Vollständige Analyse: Einkauf-Modul (Einkaufsrechnungen, Bestellungen, Wareneingänge)

## Zusammenfassung der Befunde

Nach vollständiger Analyse aller 6 betroffenen Seiten, der Routen in `app.tsx`, der Hooks und der Backend-Controller wurden **14 kritische Fehler und Inkonsistenzen** gefunden.

---

## 1. Routing & Navigation — Befunde

### 1.1 Routen in `app.tsx` — Status
```text
Route                              Seite               Status
/purchase-orders                   PurchaseOrders       OK
/purchase-orders/new               PurchaseOrderCreate  OK
/purchase-orders/:id               PurchaseOrderDetail  OK
/purchase-orders/:id/edit          PurchaseOrderEdit    OK (leitet weiter)
/purchase-invoices                 PurchaseInvoices     OK
/purchase-invoices/new             PurchaseInvoiceCreate OK
/purchase-invoices/:id             PurchaseInvoiceDetail OK
/purchase-invoices/:id/edit        PurchaseInvoiceEdit   OK (leitet weiter)
/goods-receipts                    GoodsReceipts         OK
/goods-receipts/new                GoodsReceiptCreate    OK
/goods-receipts/:id                GoodsReceiptDetail    OK
/goods-receipts/:id/edit           FEHLT — keine Route  FEHLER
```

**Fehler 1 (KRITISCH):** Keine Edit-Route für Wareneingänge. `GoodsReceiptDetail` hat keinen Edit-Weg, obwohl das Backend `PUT /goods-receipts/:id` unterstützt.

---

## 2. Navigation-Fehler in den Seiten

### 2.1 PurchaseOrderDetail.tsx — `handleDuplicate`
```text
navigate("/purchase-orders/create")  ← FALSCH
navigate("/purchase-orders/new")     ← RICHTIG
```
**Fehler 2:** Pfad `/purchase-orders/create` existiert nicht → führt zu 404.

### 2.2 PurchaseOrderDetail.tsx — `handleAssignInvoice`
```text
navigate("/purchase-invoices/create")  ← FALSCH
navigate("/purchase-invoices/new")     ← RICHTIG
```
Zusätzlich: Kein `purchaseOrderId` Query-Parameter wird übergeben. Der korrekte Aufruf müsste sein:
```text
navigate(`/purchase-invoices/new?purchaseOrderId=${id}`)
```
**Fehler 3:** Pfad falsch + fehlender Query-Parameter.

### 2.3 PurchaseOrders.tsx — Wareneingang-Button im Drei-Punkte-Menü
```text
navigate("/goods-receipts/new")  ← Kein purchaseOrderId!
```
Der korrekte Aufruf müsste sein:
```text
navigate(`/goods-receipts/new?purchaseOrderId=${order.id}`)
```
**Fehler 4:** `purchaseOrderId` wird nicht als Query-Parameter übergeben.

### 2.4 PurchaseInvoiceDetail.tsx — PDF-Download
```text
downloadPdf('invoices', id || '', ...)  ← Falsches Modul!
downloadPdf('purchase-invoices', id || '', ...)  ← RICHTIG
```
**Fehler 5:** PDF-Download ruft den Verkaufsrechnungs-Endpunkt auf, nicht den Einkaufsrechnungs-Endpunkt.

### 2.5 PurchaseInvoiceDetail.tsx — "Zahlung erfassen" Button
```text
onClick={() => toast.info("Zahlungserfassung wird geöffnet...")}
```
Dieser Button hat keine Funktion — er zeigt nur einen Toast. Es gibt keine Navigation zu einer Zahlungserfassungsseite oder einem Dialog.
**Fehler 6:** Toter Button ohne Funktion (Dead End).

### 2.6 PurchaseInvoiceDetail.tsx — Stornieren im Dropdown
```text
onClick={() => toast.info("Rechnung wird storniert...")}
```
Kein API-Aufruf, kein Dialog zur Bestätigung, keine Statusänderung.
**Fehler 7:** Stornieren-Aktion ohne Backend-Anbindung.

### 2.7 PurchaseInvoiceDetail.tsx — Zahlungsverlauf-Card
```text
<Button variant="outline" size="sm" className="mt-3">
  <CreditCard className="h-4 w-4 mr-2" />
  Zahlung erfassen
</Button>
```
Dieser Button hat kein `onClick`-Handler.
**Fehler 8:** Zweiter toter Button ohne `onClick`.

---

## 3. Daten & State-Inkonsistenzen

### 3.1 PurchaseInvoices.tsx — Lokaler State statt API
Die Liste verwendet `useState(initialInvoices)` für `handleApprove` und `handleReject`. Wenn Daten neu von der API geladen werden (z.B. nach Reload), sind die lokalen Statusänderungen verloren. Der `handleApprove`/`handleReject` sollte `useMutation` → `PUT /purchase-invoices/:id` verwenden.
**Fehler 9:** Status-Änderungen (Freigeben/Ablehnen) werden nur lokal im State gesetzt, nicht an die API gesendet.

### 3.2 PurchaseInvoices.tsx — PDF-Import schreibt nur in lokalen State
`handleImportInvoice` erstellt eine neue Invoice mit `Date.now()` als ID und `setInvoices(prev => [...])`, ohne die API anzusprechen.
**Fehler 10:** Importierte Rechnungen existieren nur im Browser-Speicher, gehen bei Reload verloren.

### 3.3 GoodsReceiptCreate.tsx — Kein Query-Parameter ausgelesen
```text
// searchParams werden nicht gelesen!
const [searchParams] = useSearchParams();  // FEHLT
```
Obwohl `PurchaseOrderDetail` mit `navigate(\`/goods-receipts/new?purchaseOrderId=${id}\`)` navigiert, liest `GoodsReceiptCreate` den Parameter `purchaseOrderId` nicht aus und befüllt die Bestellung nicht vor.
**Fehler 11:** Kontextsensitive Vorbefüllung funktioniert nicht.

### 3.4 GoodsReceiptDetail.tsx — Nur Mockdaten
```text
const receiptData = { id: "WE-2024-001", ... }  // Hartkodiert!
```
Die Detailseite zeigt immer dieselben Testdaten, unabhängig von der `:id` in der URL. Kein API-Hook.
**Fehler 12:** Detailseite ist nicht mit dem Backend verbunden.

### 3.5 PurchaseInvoiceCreate.tsx — Lieferantenliste ist hartkodiert
```text
<SelectItem value="1">Software AG</SelectItem>
<SelectItem value="2">Office Supplies GmbH</SelectItem>
```
Die Lieferanten werden nicht per `useSuppliers()` Hook von der API geladen. Der `defaultSupplierId` aus dem Query-Parameter wird in `formData.supplier` gespeichert, aber das Dropdown liest es nicht.
**Fehler 13:** Lieferantenliste ist hartkodiert, Query-Parameter `supplierId` wird nicht in das Dropdown übernommen.

### 3.6 PurchaseInvoiceCreate.tsx — `handleSubmit` ohne API-Aufruf
```text
const handleSubmit = () => {
  toast.success("Rechnung erfolgreich erfasst");
  navigate("/purchase-invoices");
};
```
Kein `useCreatePurchaseInvoice()` Mutation-Aufruf. Formularfelder (Inputs ohne `value`/`onChange`) sind auch nicht an den State gebunden.
**Fehler 14:** Erstellungsformular speichert nichts in der Datenbank.

---

## 4. Fehlende UX-Flows

- **Wareneingang bearbeiten:** Es gibt keinen Edit-Button im `GoodsReceiptDetail`, keine Edit-Route und keine Edit-Seite.
- **Zahlungserfassung bei Einkaufsrechnungen:** Kein echter Dialog oder Navigation.
- **Approve/Reject Workflow in der Liste:** Nur lokale State-Mutation, kein API-Aufruf.

---

## Geplante Frontend-Fixes (was ich ändern werde)

### Fix 1 — PurchaseOrderDetail.tsx
- `handleDuplicate`: `navigate("/purchase-orders/create")` → `navigate("/purchase-orders/new")`
- `handleAssignInvoice`: `navigate("/purchase-invoices/create")` → `navigate(\`/purchase-invoices/new?purchaseOrderId=${id}\`)`

### Fix 2 — PurchaseOrders.tsx
- Wareneingang-Button: `navigate("/goods-receipts/new")` → `navigate(\`/goods-receipts/new?purchaseOrderId=${order.id}\`)`

### Fix 3 — PurchaseInvoiceDetail.tsx
- `downloadPdf('invoices', ...)` → `downloadPdf('purchase-invoices', ...)`
- "Zahlung erfassen" Buttons: Navigation zu `/payments/new?purchaseInvoiceId=${id}` oder Dialog
- "Stornieren": `useUpdatePurchaseInvoice` Mutation mit Status `CANCELLED` + Bestätigungs-AlertDialog

### Fix 4 — PurchaseInvoices.tsx
- `handleApprove` / `handleReject`: Ersetzen durch `useUpdatePurchaseInvoice` oder `useApprovePurchaseInvoice` Mutation
- `handleImportInvoice`: Muss `useCreatePurchaseInvoice` aufrufen

### Fix 5 — PurchaseInvoiceCreate.tsx
- Lieferantenliste durch `useSuppliers()` Hook ersetzen
- `supplierId` Query-Parameter korrekt in Dropdown-Defaultwert übernehmen
- Alle Input-Felder mit State verbinden
- `handleSubmit` mit `useCreatePurchaseInvoice` verbinden und Items-Array übergeben

### Fix 6 — GoodsReceiptCreate.tsx
- `useSearchParams()` einbinden und `purchaseOrderId` auslesen
- Bestellung aus API laden und Positionen vorbefüllen

### Fix 7 — GoodsReceiptDetail.tsx
- Mockdaten entfernen
- `useQuery` für `/goods-receipts/:id` hinzufügen
- Lade- und Fehlerzustand implementieren
- Link zur zugehörigen Bestellung mit korrekter Navigation

### Fix 8 — App.tsx
- Route `/goods-receipts/:id/edit` hinzufügen (falls GoodsReceiptEdit-Seite erstellt wird)

---

## Technische Details

### Dateien die geändert werden

| Datei | Art der Änderung |
|---|---|
| `src/pages/PurchaseOrderDetail.tsx` | navigate-Pfade korrigieren |
| `src/pages/PurchaseOrders.tsx` | Query-Parameter beim Wareneingang-Button hinzufügen |
| `src/pages/PurchaseInvoiceDetail.tsx` | PDF-Endpoint, Stornieren-API, Zahlung-Dialog |
| `src/pages/PurchaseInvoices.tsx` | Approve/Reject mit API verbinden, Import mit API verbinden |
| `src/pages/PurchaseInvoiceCreate.tsx` | Supplier-Hook, State, API-Submit |
| `src/pages/GoodsReceiptCreate.tsx` | Query-Parameter auslesen, Vorbefüllung |
| `src/pages/GoodsReceiptDetail.tsx` | Mockdaten durch API-Hook ersetzen |
| `docs/einkauf-analyse.md` | Neue Analyse-Datei erstellen |

---

## Cursor Backend-Prompts (nach der Frontend-Implementierung ausführen)

### Prompt 1 — Zahlungserfassung für Einkaufsrechnungen
```
In purchase-invoices.service.ts, add a method `recordPayment(id, companyId, dto)` that:
1. Finds the PurchaseInvoice and validates it belongs to the company
2. Creates a Payment record linked to the invoice (paymentDate, amount, method, bankAccountId)
3. Updates paidAmount on the invoice (paidAmount += dto.amount)
4. If paidAmount >= total, sets status to 'PAID' and sets paidDate
5. Returns the updated invoice with payment history

Add a new DTO `RecordPaymentDto`:
- amount: number (required)
- paymentDate: string (ISO date, required)
- method: 'BANK_TRANSFER' | 'DIRECT_DEBIT' | 'CASH' (required)
- bankAccountId?: string (optional)
- note?: string (optional)

Add endpoint in purchase-invoices.controller.ts:
POST /purchase-invoices/:id/record-payment
@RequirePermissions('purchase-invoices:write')
```

### Prompt 2 — Stornieren mit Audit-Trail
```
In purchase-invoices.service.ts, add a method `cancel(id, companyId, reason?)` that:
1. Validates the invoice status is not already CANCELLED or PAID
2. Sets status to CANCELLED, stores cancellationReason and cancelledAt
3. If there is a linked purchaseOrderId, does NOT reverse the PurchaseOrder status automatically
4. Returns the updated invoice

Add endpoint in purchase-invoices.controller.ts:
POST /purchase-invoices/:id/cancel
Body: { reason?: string }
@RequirePermissions('purchase-invoices:write')
```

### Prompt 3 — GoodsReceipt mit purchaseOrderId Vorbefüllung
```
In goods-receipts.service.ts, ensure that findOne and findAll include:
- purchaseOrder: { select: { id: true, number: true, supplierId: true, supplier: { select: { id: true, name: true, companyName: true } }, items: true } }

In goods-receipts.controller.ts, the GET /goods-receipts/:id endpoint must return:
- All items with productId, description, quantity, unit, unitPrice
- The linked purchaseOrder with supplier info and all order items

Also ensure GET /purchase-orders/:id returns all items with their current delivery quantities so GoodsReceiptCreate can compute "alreadyDelivered" per item.
```

### Prompt 4 — GoodsReceipt Status-Update + Edit Endpoint
```
In goods-receipts.controller.ts, add:
PUT /goods-receipts/:id (update items, note, receiptDate)
@RequirePermissions('goods-receipts:write')

In goods-receipts.service.ts, update() method must:
1. Validate status is DRAFT (only draft can be edited)
2. Allow updating: receiptDate, supplierDeliveryNote, warehouseId, items (quantity received)
3. Recalculate totalReceived per item

Also register the route in app.tsx as: /goods-receipts/:id/edit
```

### Prompt 5 — Approve/Reject Endpunkte für Einkaufsrechnungen
```
Ensure purchase-invoices.controller.ts has these endpoints:
1. POST /purchase-invoices/:id/approve — sets status APPROVED, saves approvedAt and approvedBy (userId)
2. POST /purchase-invoices/:id/reject — sets status DRAFT (returns to draft for correction), saves rejectionReason

In purchase-invoices.service.ts:
- approve(id, companyId, dto): validates status is PENDING, sets APPROVED
- reject(id, companyId, reason): validates status is PENDING, sets DRAFT + stores rejectionNote

These are already partially defined in ApproveInvoiceDto — make sure the controller wires them correctly.
```
