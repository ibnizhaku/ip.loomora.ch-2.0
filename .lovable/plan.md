
# Aufträge – 4 Probleme beheben + Cursor Backend-Prompt

## Problemanalyse

### Problem 1: PDF Lieferadresse fehlt (OrderDetail)
In `OrderDetail.tsx` (Zeile 163–199) wird das `pdfData`-Objekt zusammengebaut, aber `deliveryAddress` wird **nicht übergeben** – obwohl `orderData.deliveryAddress` bereits in `mapOrderToView()` korrekt aus dem Backend gemappt wird. Einfacher Fix: `deliveryAddress` aus `rawOrder` in `pdfData` eintragen.

### Problem 2: Kunde "Ändern" funktioniert nicht
Analyse des Codes zeigt: Der Dialog öffnet sich (Zeile 577–630), aber wenn ein Kunde aus der Liste gewählt wird (Zeile 606–609), wird `setSelectedCustomer(customer)` aufgerufen. Das `customer`-Objekt aus der API hat `companyName` als primären Namen – aber `selectedCustomer.name` (Zeile 639) zeigt möglicherweise keinen Wert weil das API-Objekt nur `companyName` hat, kein `name`. Der Anzeigebereich nutzt `selectedCustomer.name`, das API-Objekt aber hat `companyName`.

**Fix:** Beim Auswählen eines Kunden aus dem Dialog, `name` auf `companyName || name` setzen:
```tsx
setSelectedCustomer({
  ...customer,
  name: (customer as any).companyName || customer.name,
});
```

### Problem 3: z.Hd. im PDF + Firmenname
In `OrderDetail.tsx` wird `contact: orderData.customer.contact` gesetzt (Zeile 180). `orderData.customer.contact` enthält `companyName || contactPerson` (Zeile 89). Das wird im PDF als `z.Hd. [companyName]` angezeigt, was falsch ist.

**Fix in `OrderDetail.tsx`:**
- `customer.name` → `rawOrder.customer?.companyName || rawOrder.customer?.name`
- `contact` → leer lassen (`""`) damit kein z.Hd. erscheint

**Fix in `DocumentForm.tsx` pdfPreviewData:**
- `name: selectedCustomer?.companyName || selectedCustomer?.name` (Priorität auf companyName)
- `contact: ""` (bereits leer, bleibt so)

### Problem 4: 409 Conflict beim Lieferschein erstellen
Der 409-Fehler kommt aus Prisma `P2002` (Unique Constraint). Das Backend-`deliveryCounter` hat einen Race Condition oder der Counter wird bei `createFromOrder` nicht korrekt inkrementiert. Dies ist ein **reines Backend-Problem** → geht in den Cursor-Prompt.

**Frontend-Verbesserung:** Bessere Fehlermeldung im `CreateDeliveryNoteDialog` anzeigen wenn 409 kommt.

---

## Technische Änderungen

### Datei 1: `src/pages/OrderDetail.tsx`

**pdfData Lieferadresse (Zeile 163–199):**
```ts
// Neu: deliveryAddress hinzufügen
deliveryAddress: rawOrder.deliveryAddress ? {
  company: rawOrder.deliveryAddress.company,
  street: rawOrder.deliveryAddress.street,
  zipCode: rawOrder.deliveryAddress.zipCode,
  city: rawOrder.deliveryAddress.city,
  country: rawOrder.deliveryAddress.country,
} : undefined,
```

**customer.name & contact im pdfData:**
```ts
customer: {
  name: (rawOrder as any)?.customer?.companyName || orderData.customer.name,
  contact: "",   // leer → kein "z.Hd." im PDF
  street: ...,
  ...
},
```

### Datei 2: `src/components/documents/DocumentForm.tsx`

**Kundenauswahl im Dialog (Zeile 606–609):**
```tsx
onClick={() => {
  setSelectedCustomer({
    ...customer,
    name: (customer as any).companyName || customer.name,
  });
  setCustomerDialogOpen(false);
}}
```

**pdfPreviewData customer.name (Zeile 495–503):**
```ts
customer: {
  name: selectedCustomer?.companyName || selectedCustomer?.name || "—",
  contact: "",  // bereits leer
  ...
},
```

### Datei 3: `src/components/documents/CreateDeliveryNoteDialog.tsx`

**Bessere Fehlerbehandlung bei 409:**
```tsx
} catch (err: any) {
  if (err?.status === 409 || err?.response?.status === 409) {
    toast.error("Lieferschein konnte nicht erstellt werden – bitte Backend überprüfen (Konfliktnummer)");
  } else {
    toast.error("Fehler beim Erstellen des Lieferscheins");
  }
}
```

---

## Dateien die geändert werden

| Datei | Änderung |
|---|---|
| `src/pages/OrderDetail.tsx` | Lieferadresse in pdfData; z.Hd. entfernen; companyName priorisieren |
| `src/components/documents/DocumentForm.tsx` | Kundenauswahl mit companyName; pdfPreviewData customer.name fix |
| `src/components/documents/CreateDeliveryNoteDialog.tsx` | Bessere Fehlermeldung bei 409 |

---

## Cursor Backend-Prompt (nach den Frontend-Fixes)

```
BACKEND FIX – 409 Conflict beim Lieferschein aus Auftrag erstellen

PROBLEM:
POST /api/delivery-notes/from-order/:orderId gibt 409 Conflict zurück.
Der Fehler kommt aus Prisma P2002 (Unique Constraint Violation).
Verdacht: deliveryCounter wird nicht atomar inkrementiert oder die Lieferschein-Nummer
ist nicht unique im Datenbankschema.

BITTE PRÜFEN UND FIXEN:

1. UNIQUE CONSTRAINT AUF DELIVERY NOTE NUMBER
   In schema.prisma: Prüfe ob `number` im DeliveryNote Model ein unique constraint hat.
   Falls ja: Sicherstellen dass der Nummernkreis (LS-YEAR-COUNTER) wirklich unique ist.
   
   Die Transaktion in createFromOrder muss ZWINGEND so aussehen:
   ```
   return this.prisma.$transaction(async (tx) => {
     // ZUERST counter inkrementieren
     const company = await tx.company.update({
       where: { id: companyId },
       data: { deliveryCounter: { increment: 1 } },
       select: { deliveryCounter: true },
     });
     
     const number = `LS-${new Date().getFullYear()}-${String(company.deliveryCounter).padStart(4, '0')}`;
     
     // DANN Lieferschein erstellen mit der neuen Nummer
     const deliveryNote = await tx.deliveryNote.create({
       data: { number, ... }
     });
   });
   ```

2. ITEMIDS BODY PARSING
   Der Frontend sendet: POST /delivery-notes/from-order/:orderId mit Body { itemIds: ["id1", "id2"] }
   
   Sicherstellen dass der Controller den Body korrekt liest:
   ```typescript
   @Post('from-order/:orderId')
   createFromOrder(
     @Param('orderId') orderId: string,
     @Body() body: { itemIds?: string[] },
     @CurrentUser() user: any,
   ) {
     return this.deliveryNotesService.createFromOrder(
       orderId, 
       user.companyId, 
       user.userId, 
       body?.itemIds
     );
   }
   ```
   
   WICHTIG: @Body() muss vorhanden sein. Falls die Route nur @Param hat, kommen itemIds nie an.

3. SERVICE LOGIK createFromOrder
   In delivery-notes.service.ts:
   - Wenn itemIds übergeben: FILTER order.items WHERE item.id IN itemIds
   - Wenn itemIds leer oder undefined: ALLE order.items nehmen
   - selectedItems.length === 0 → BadRequestException werfen
   
   Aktuelle Implementierung prüfen ob der itemIds-Filter korrekt funktioniert:
   ```typescript
   const selectedItems = itemIds && itemIds.length > 0
     ? order.items.filter((item) => itemIds.includes(item.id))
     : order.items;
   ```

4. RACE CONDITION VERMEIDEN
   Falls mehrere gleichzeitige Requests kommen können:
   Sicherstellen dass company.update mit { deliveryCounter: { increment: 1 } }
   innerhalb der gleichen $transaction wie das deliveryNote.create läuft.
   Niemals erst counter lesen, dann erhöhen – immer atomares increment.

5. FEHLERLOGGING
   In global-exception.filter.ts ist P2002 bereits als 409 gemappt.
   Füge einen detaillierten Log hinzu damit klar ist WELCHES Feld den Konflikt auslöst:
   ```typescript
   case 'P2002':
     const field = exception.meta?.target?.[0] || 'unbekannt';
     message = `Eintrag existiert bereits (Feld: ${field})`;
   ```

ERWARTETES ERGEBNIS:
- POST /delivery-notes/from-order/:orderId mit { itemIds: ["id1"] } → 201 Created
- Lieferschein hat eindeutige Nummer LS-2026-XXXX
- Weiterleitung zu /delivery-notes/:newId funktioniert
```
