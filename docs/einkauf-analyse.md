# Vollständige Analyse: Einkauf-Modul
> Stand: 19.02.2026 | Analysiert von: Lovable AI

## Zusammenfassung
**14 kritische Fehler** wurden gefunden und **alle behoben** (Frontend). Backend-Fixes sind als Cursor-Prompts dokumentiert.

---

## Status aller Fixes

| # | Fehler | Datei | Status |
|---|--------|-------|--------|
| 1 | `/goods-receipts/:id/edit` Route fehlte | App.tsx | ✅ Behoben |
| 2 | `handleDuplicate` → `/purchase-orders/create` (404) | PurchaseOrderDetail.tsx | ✅ Behoben |
| 3 | `handleAssignInvoice` → falscher Pfad + fehlender `purchaseOrderId` | PurchaseOrderDetail.tsx | ✅ Behoben |
| 4 | Wareneingang-Button ohne `purchaseOrderId` Query-Param | PurchaseOrders.tsx | ✅ Behoben |
| 5 | PDF-Download auf falschem Endpunkt (`invoices` statt `purchase-invoices`) | PurchaseInvoiceDetail.tsx + api.ts | ✅ Behoben |
| 6 | "Zahlung erfassen" Button ohne Funktion (Toast-only) | PurchaseInvoiceDetail.tsx | ✅ Behoben (Dialog) |
| 7 | "Stornieren" ohne API-Aufruf + kein Bestätigungsdialog | PurchaseInvoiceDetail.tsx | ✅ Behoben (AlertDialog + API) |
| 8 | 2. "Zahlung erfassen" Button im Zahlungsverlauf ohne onClick | PurchaseInvoiceDetail.tsx | ✅ Behoben |
| 9 | Approve/Reject nur lokaler State, kein API-Aufruf | PurchaseInvoices.tsx | ✅ Behoben (useApprovePurchaseInvoice) |
| 10 | PDF-Import schreibt nur in lokalen State (verschwindet bei Reload) | PurchaseInvoices.tsx | ✅ Behoben (navigiert zu /new) |
| 11 | `purchaseOrderId` aus searchParams nicht ausgelesen | GoodsReceiptCreate.tsx | ✅ Behoben (useSearchParams) |
| 12 | GoodsReceiptDetail mit hardkodierten Mockdaten | GoodsReceiptDetail.tsx | ✅ Behoben (useGoodsReceipt Hook) |
| 13 | Lieferantenliste hardkodiert, supplierId Query-Param ignoriert | PurchaseInvoiceCreate.tsx | ✅ Behoben (useSuppliers Hook) |
| 14 | handleSubmit ohne API-Aufruf (toast.success only) | PurchaseInvoiceCreate.tsx | ✅ Behoben (useCreatePurchaseInvoice) |

---

## Detailbeschreibungen

### Fehler 1 — Fehlende Route `/goods-receipts/:id/edit`
**Problem:** Backend hat `PUT /goods-receipts/:id`, aber keine Edit-Route registriert.
**Fix:** Route in `App.tsx` hinzugefügt → nutzt `GoodsReceiptCreate` mit ID-Parameter.

### Fehler 2 — handleDuplicate in PurchaseOrderDetail
```tsx
// VORHER (404):
navigate("/purchase-orders/create");
// NACHHER (korrekt):
navigate("/purchase-orders/new");
```

### Fehler 3 — handleAssignInvoice in PurchaseOrderDetail
```tsx
// VORHER (404 + kein Context):
navigate("/purchase-invoices/create");
// NACHHER (korrekt + Context):
navigate(`/purchase-invoices/new?purchaseOrderId=${id}&supplierId=${orderData.supplier.id}`);
```

### Fehler 4 — Wareneingang-Button in PurchaseOrders Liste
```tsx
// VORHER (kein Context):
navigate("/goods-receipts/new")
// NACHHER (mit purchaseOrderId):
navigate(`/goods-receipts/new?purchaseOrderId=${order.id}`)
```

### Fehler 5 — PDF-Download falscher Endpunkt
```tsx
// VORHER (Verkaufsrechnungs-Endpunkt!):
downloadPdf('invoices', id, ...)
// NACHHER (korrekt):
downloadPdf('purchase-invoices', id, ...)
// + 'purchase-invoices' in downloadPdf Union-Type in api.ts ergänzt
```

### Fehler 6-8 — Zahlung erfassen & Stornieren ohne Funktion
- **Stornieren:** AlertDialog + `useUpdatePurchaseInvoice({ status: 'CANCELLED' })` implementiert
- **Zahlung erfassen:** Vollständiger Dialog mit Betrag, Datum, Zahlungsart (BANK_TRANSFER / DIRECT_DEBIT / CASH)

### Fehler 9 — Approve/Reject nur lokaler State
```tsx
// VORHER (verschwindet bei Reload):
setInvoices(prev => prev.map(inv => inv.id === id ? {...inv, status: "approved"} : inv));
// NACHHER (persistiert in DB):
approveMutation.mutate({ id, data: {} });        // Approve
updateMutation.mutate({ id, data: { status: "DRAFT" } }); // Reject
```

### Fehler 11 — GoodsReceiptCreate ohne Query-Parameter
```tsx
// NACHHER: purchaseOrderId aus URL → Bestellung laden → Positionen vorbefüllen
const purchaseOrderId = searchParams.get("purchaseOrderId") || "";
const { data: poData } = usePurchaseOrder(purchaseOrderId);
useEffect(() => {
  if (poData?.items) setItems(poData.items.map(...));
}, [poData]);
```

### Fehler 13-14 — PurchaseInvoiceCreate komplett refaktoriert
- Lieferanten via `useSuppliers()` geladen
- `supplierId` und `purchaseOrderId` aus URL-Params korrekt übernommen  
- Alle Formularfelder an State gebunden
- `useCreatePurchaseInvoice()` beim Submit aufgerufen
- Positions-Tabelle mit Menge/Preis/Einheit und Live-Totals

---

## Cursor Backend-Prompts

### Prompt 1 — Zahlungserfassung (POST /purchase-invoices/:id/record-payment)

```
In backend/src/modules/purchase-invoices/purchase-invoices.service.ts, add method:

async recordPayment(id: string, companyId: string, dto: RecordPaymentDto) {
  const invoice = await this.prisma.purchaseInvoice.findFirst({
    where: { id, companyId },
  });
  if (!invoice) throw new NotFoundException('Invoice not found');
  if (invoice.status === 'CANCELLED') throw new BadRequestException('Cannot pay cancelled invoice');

  const payment = await this.prisma.$transaction(async (tx) => {
    const newPayment = await tx.payment.create({
      data: {
        purchaseInvoiceId: id,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        method: dto.method,
        bankAccountId: dto.bankAccountId,
        note: dto.note,
        companyId,
      }
    });
    const paidAmount = Number(invoice.paidAmount) + dto.amount;
    const newStatus = paidAmount >= Number(invoice.total) ? 'PAID' : invoice.status;
    await tx.purchaseInvoice.update({
      where: { id },
      data: { paidAmount, status: newStatus, paidDate: newStatus === 'PAID' ? new Date() : undefined },
    });
    return newPayment;
  });
  return payment;
}

Add DTO in dto/purchase-invoice.dto.ts:
class RecordPaymentDto {
  @IsNumber() amount: number;
  @IsDateString() paymentDate: string;
  @IsEnum(['BANK_TRANSFER', 'DIRECT_DEBIT', 'CASH']) method: string;
  @IsOptional() @IsString() bankAccountId?: string;
  @IsOptional() @IsString() note?: string;
}

Add in purchase-invoices.controller.ts:
@Post(':id/record-payment')
@RequirePermissions('purchase-invoices:write')
@ApiOperation({ summary: 'Record a payment for purchase invoice' })
recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto, @CurrentUser() user: any) {
  return this.purchaseInvoicesService.recordPayment(id, user.companyId, dto);
}
```

### Prompt 2 — Stornieren mit Audit-Trail (POST /purchase-invoices/:id/cancel)

```
In purchase-invoices.service.ts, add method:

async cancel(id: string, companyId: string, reason?: string) {
  const invoice = await this.prisma.purchaseInvoice.findFirst({ where: { id, companyId } });
  if (!invoice) throw new NotFoundException('Invoice not found');
  if (['CANCELLED', 'PAID'].includes(invoice.status)) {
    throw new BadRequestException(`Cannot cancel invoice with status ${invoice.status}`);
  }
  return this.prisma.purchaseInvoice.update({
    where: { id },
    data: { status: 'CANCELLED', cancellationReason: reason, cancelledAt: new Date() },
  });
}

Note: schema.prisma may need: cancellationReason String? and cancelledAt DateTime?

Add in controller:
@Post(':id/cancel')
@RequirePermissions('purchase-invoices:write')
cancel(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: any) {
  return this.purchaseInvoicesService.cancel(id, user.companyId, reason);
}
```

### Prompt 3 — GoodsReceipt mit vollständigen Relationen (findOne include)

```
In goods-receipts.service.ts, update findOne() include:

include: {
  purchaseOrder: {
    select: {
      id: true,
      number: true,
      supplierId: true,
      supplier: { select: { id: true, name: true, companyName: true } },
      items: {
        select: {
          id: true,
          productId: true,
          description: true,
          quantity: true,
          unit: true,
          unitPrice: true,
          delivered: true,
        }
      }
    }
  },
  supplier: { select: { id: true, name: true, companyName: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true } }
    }
  }
}

Also in findAll(), add: purchaseOrder: { select: { id: true, number: true } }, supplier: { select: { id: true, name: true } }
```

### Prompt 4 — GoodsReceipt Update/Edit Endpoint

```
In goods-receipts.service.ts, ensure update() method:
1. Validates receipt belongs to companyId
2. Only allows edit if status is 'DRAFT'  
3. Accepts: receiptDate, deliveryNoteNumber, notes, items (receivedQuantity updates)
4. Recalculates totals after item update

Schema may need: deliveryNoteNumber String?

In goods-receipts.controller.ts, the existing PUT /:id should work. Verify it includes:
@Put(':id')
@RequirePermissions('goods-receipts:write')
update(@Param('id') id: string, @Body() dto: UpdateGoodsReceiptDto, @CurrentUser() user: any) {
  return this.goodsReceiptsService.update(id, user.companyId, dto);
}
```

### Prompt 5 — Approve/Reject Endpunkte in purchase-invoices

```
Current controller has POST /:id/approve with ApproveInvoiceDto. Verify:

approve() in service:
- Validates status is 'PENDING' (throw BadRequestException otherwise)
- Sets status to 'APPROVED'
- Saves approvedAt: new Date() and approvedById: userId (needs field in schema)
- Returns updated invoice

Add reject endpoint:
@Post(':id/reject')
@RequirePermissions('purchase-invoices:write')
reject(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: any) {
  return this.purchaseInvoicesService.reject(id, user.companyId, reason);
}

reject() in service:
- Validates status is 'PENDING'
- Sets status back to 'DRAFT'
- Saves rejectionNote: reason, rejectedAt: new Date()
- Returns updated invoice

Note: Frontend currently calls PUT /:id with { status: 'DRAFT' } for reject.
Align backend to accept this OR add dedicated /reject endpoint.
```

### Prompt 6 — downloadPdf Endpunkt für Einkaufsrechnungen

```
Ensure purchase-invoices.controller.ts has:

@Get(':id/pdf')
@RequirePermissions('purchase-invoices:read')
async getPdf(@Param('id') id: string, @CurrentUser() user: any, @Res() res: Response) {
  const pdfBuffer = await this.purchaseInvoicesService.generatePdf(id, user.companyId);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="Einkaufsrechnung-${id}.pdf"`,
  });
  res.send(pdfBuffer);
}

The service method should use a PDF generation library (e.g. @nestjs/serve-static + pdfmake or puppeteer).
```

---

## Routing-Übersicht nach allen Fixes

```
Route                              Seite                  Status
/purchase-orders                   PurchaseOrders          ✅ OK
/purchase-orders/new               PurchaseOrderCreate     ✅ OK
/purchase-orders/:id               PurchaseOrderDetail     ✅ OK (navigate fixiert)
/purchase-orders/:id/edit          PurchaseOrderEdit       ✅ OK
/purchase-invoices                 PurchaseInvoices        ✅ OK (API Mutations)
/purchase-invoices/new             PurchaseInvoiceCreate   ✅ OK (Supplier Hook + API)
/purchase-invoices/:id             PurchaseInvoiceDetail   ✅ OK (PDF + Stornieren + Zahlung)
/purchase-invoices/:id/edit        PurchaseInvoiceEdit     ✅ OK
/goods-receipts                    GoodsReceipts           ✅ OK
/goods-receipts/new                GoodsReceiptCreate      ✅ OK (Query-Param + API)
/goods-receipts/:id                GoodsReceiptDetail      ✅ OK (useGoodsReceipt Hook)
/goods-receipts/:id/edit           GoodsReceiptCreate      ✅ NEU hinzugefügt
```
