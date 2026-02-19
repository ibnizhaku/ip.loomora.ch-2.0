
# Aufträge – Frontend-Verbesserungen & Backend-Prompt für Cursor

## Übersicht der Änderungen

Es gibt 6 konkrete Probleme, die behoben werden müssen:

1. **Pflicht-Projekt** beim Auftrag erstellen (mit Toast-Meldung)
2. **Datum-Synchronisation** im PDF (Datum aus Formular → PDF-Vorschau und Download)
3. **3-Punkte-Dropdown** in OrderDetail: Duplizieren und Stornieren funktionieren nicht
4. **Lieferschein-Dialog** mit Positionsauswahl (statt direkte Weiterleitung auf neue Seite)
5. **Fortschrittsbalken-Synchronisation** zwischen Auftragsübersicht und Detailseite
6. **Lieferadresse** in OrderDetail anzeigen (ist schon im Formular vorhanden, aber fehlt in der Detailansicht)

---

## Technische Details

### 1. Pflicht-Projekt für Aufträge (DocumentForm.tsx)

In `handleSave()` ist bei type `"quote"` kein Projekt-Check vorhanden, und bei `"order"` auch nicht. Der Fix:

```
// In handleSave(), direkt nach dem Kunden-Check:
if ((type === "order" || type === "quote") && !selectedProjectId) {
  toast.error("Bitte wählen Sie ein Projekt aus");
  return;
}
```

Zusätzlich: Das Projekt-Dropdown im Sidebar bekommt für `order` und `quote` ein Pflicht-Label (kein „optional" mehr).

---

### 2. Datum-Synchronisation im PDF

**Problem in OrderDetail.tsx:** Das `pdfData`-Objekt nutzt `orderData.createdAt` (welches das formatierte Datum ist), aber das wird aus `formatDate()` bezogen welches bereits `toLocaleDateString()` aufgerufen hat – das PDF erwartet aber ein ISO-Datum.

**Fix in OrderDetail.tsx:**
```
// Direkt das rawOrder.orderDate oder rawOrder.date verwenden, nicht das formatierte
date: rawOrder?.orderDate || rawOrder?.date || rawOrder?.createdAt || new Date().toISOString(),
```

---

### 3. Duplizieren & Stornieren in OrderDetail.tsx

Aktuell zeigen beide Menüpunkte nur `toast.info(...)` – keine echte Aktion. 

**Fixes:**
- **Duplizieren:** Neuen Hook `useCreateOrder` aufrufen mit den aktuellen Bestelldaten (Items, Customer, Project), dann zu `/orders/${newOrder.id}` navigieren
- **Stornieren:** API-Aufruf `PATCH /orders/:id/status` mit `status: "CANCELLED"` via `useUpdateOrder` oder direktem API-Call, dann Query invalidieren

Konkret in `OrderDetail.tsx`:
```tsx
// Import hinzufügen
import { useCreateOrder, useUpdateOrder } from "@/hooks/use-sales";

// Hooks instanziieren
const createOrder = useCreateOrder();
const updateOrder = useUpdateOrder();

// handleDuplicate
const handleDuplicate = async () => {
  const dup = await createOrder.mutateAsync({
    customerId: rawOrder.customerId,
    projectId: rawOrder.projectId,
    notes: rawOrder.notes,
    orderDate: new Date().toISOString().split("T")[0],
    items: rawOrder.items.map((item: any, idx: number) => ({
      position: idx + 1,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
    })),
  });
  toast.success("Auftrag wurde dupliziert");
  navigate(`/orders/${dup.id}`);
};

// handleCancel
const handleCancel = async () => {
  if (!confirm("Auftrag wirklich stornieren?")) return;
  await updateOrder.mutateAsync({ id: id!, data: { status: "CANCELLED" } });
  toast.success("Auftrag wurde storniert");
};
```

---

### 4. Lieferschein-Dialog mit Positionsauswahl

**Ist-Zustand:** Klick auf „Lieferschein erstellen" → direkter API-Call `POST /delivery-notes/from-order/:id` → Weiterleitung.

**Soll-Zustand:** Klick → Popup-Dialog öffnet sich → alle Positionen des Auftrags werden mit Checkboxen angezeigt → User wählt welche Positionen geliefert werden sollen → Klick auf „Lieferschein erstellen" im Dialog → API-Call mit gewählten Positionen → Weiterleitung zur neuen Lieferschein-Detailseite.

**Neue Komponente `CreateDeliveryNoteDialog.tsx`:**
```tsx
// Props: open, onOpenChange, order (rawOrder), onCreated
// State: selectedItemIds (string[]) - alle vorselektiert
// UI: Dialog mit Tabelle der Positionen + Checkboxen
// Button: "Lieferschein erstellen" → POST /delivery-notes/from-order/:id mit body { itemIds: [...] }
```

Der bestehende Hook `useCreateDeliveryNoteFromOrder` wird erweitert, um `itemIds` im Body zu übergeben:
```ts
mutationFn: ({ orderId, itemIds }: { orderId: string; itemIds?: string[] }) => 
  api.post<DeliveryNote>(`/delivery-notes/from-order/${orderId}`, { itemIds }),
```

In `OrderDetail.tsx` wird der Dialog-State eingebaut:
```tsx
const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
// Button "Lieferschein erstellen" öffnet Dialog, kein direkter API-Call mehr
```

---

### 5. Fortschrittsbalken-Synchronisation

**Problem:** In `Orders.tsx` (`mapOrder` Funktion) wird der Progress so berechnet:
```ts
progress: s === "CONFIRMED" ? 50 : s === "CANCELLED" ? 0 : s === "DRAFT" ? 0 : 25,
// → CONFIRMED = 50%, SENT = 25%
```

In `OrderDetail.tsx` (`mapOrderToView` Funktion):
```ts
progress: order.status === "CONFIRMED" ? 100 : order.status === "SENT" ? 50 : 0,
// → CONFIRMED = 100%, SENT = 50%
```

**Fix:** Beide auf dieselbe Logik vereinheitlichen. Die sinnvollste Logik basierend auf dem ERP-Workflow:

```ts
// Einheitliche Funktion:
function getOrderProgress(status: string): number {
  switch (status) {
    case "DRAFT": return 10;
    case "SENT": return 33;
    case "CONFIRMED": return 66;
    case "CANCELLED": return 0;
    default: return 10;
  }
}
// 100% = alle Lieferscheine geliefert + Rechnung bezahlt (Phase 2)
```

Diese Funktion wird in beiden Dateien (`Orders.tsx` und `OrderDetail.tsx`) genutzt.

---

### 6. Lieferadresse in OrderDetail anzeigen

Die Lieferadresse (`deliveryAddress`) ist im `rawOrder` als JSON-Objekt vorhanden (bereits backend-seitig gespeichert). Sie muss in der Detailseite in der Sidebar angezeigt werden – analog zur Kunden-Karte.

In `mapOrderToView()`:
```ts
deliveryAddress: order.deliveryAddress || null,
```

In der Sidebar von `OrderDetail.tsx` nach der Kunden-Karte:
```tsx
{orderData.deliveryAddress && (
  <Card>
    <CardHeader><CardTitle className="text-base">Lieferadresse</CardTitle></CardHeader>
    <CardContent>
      <div className="flex items-start gap-2 text-sm">
        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div>
          {orderData.deliveryAddress.company && <p className="font-medium">{orderData.deliveryAddress.company}</p>}
          <p>{orderData.deliveryAddress.street}</p>
          <p>{orderData.deliveryAddress.zipCode} {orderData.deliveryAddress.city}</p>
          <p>{orderData.deliveryAddress.country}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

---

## Dateien, die geändert werden

| Datei | Änderung |
|---|---|
| `src/components/documents/DocumentForm.tsx` | Pflicht-Projekt-Validierung + Label anpassen |
| `src/pages/OrderDetail.tsx` | Datum-Fix, Duplizieren/Stornieren, Dialog-Integration, Lieferadresse |
| `src/pages/Orders.tsx` | Fortschritt-Logik vereinheitlichen |
| `src/hooks/use-delivery-notes.ts` | `useCreateDeliveryNoteFromOrder` mit `itemIds` erweitern |
| `src/components/documents/CreateDeliveryNoteDialog.tsx` | **Neue Datei** – Dialog mit Positionsauswahl |

---

## Backend Prompt für Cursor

```
BACKEND AUFGABEN – Aufträge & Lieferscheine

1. LIEFERSCHEIN AUS AUFTRAG MIT POSITIONSAUSWAHL
   Route: POST /delivery-notes/from-order/:orderId
   Body: { itemIds?: string[] }  // wenn leer → alle Positionen nehmen
   
   Logik in delivery-notes.service.ts:
   - Auftrag inkl. items laden
   - Wenn itemIds übergeben: nur diese items filtern
   - Lieferschein erstellen mit gefilterten items
   - Nummerierung: LS-{YEAR}-{counter.padStart(4, '0')}
   - company.deliveryCounter++ in $transaction
   - Response: Lieferschein mit items, customer, order included
   
   Prisma include im Response:
   {
     items: { orderBy: { position: 'asc' } },
     customer: true,
     order: { select: { id: true, number: true } }
   }

2. AUFTRAG DUPLIZIEREN
   Route: POST /orders/:id/duplicate
   
   Logik in orders.service.ts:
   - Original laden mit items
   - Neuen Auftrag erstellen mit:
     - status: 'DRAFT'
     - date: new Date()
     - customerId, projectId, notes vom Original
     - items mit gleichen Feldern, aber neu position vergeben
     - Nummerierung: AB-{YEAR}-{counter.padStart(4, '0')} via company.orderCounter++
   - AuditLog eintrag: action 'DUPLICATED', entityId = neue ID
   - Response: neuer Auftrag mit allen Relations

3. AUFTRAG STORNIEREN
   Route: PATCH /orders/:id/status
   Status: CANCELLED
   
   Prüfen ob Route bereits existiert in orders.ts (server/src/routes/orders.ts Zeile ~35).
   Wenn ja, sicherstellen dass CANCELLED erlaubt ist.
   Wenn nein, Route ergänzen.
   
   AuditLog Eintrag bei Stornierung.

4. PDF SERVICE – DATUM KORREKT ÜBERNEHMEN
   In pdf.service.ts:
   - Für Aufträge: date = order.date || order.orderDate (als ISO-String, nicht formatiert)
   - Formatierung zu de-CH erst beim Rendering: new Date(date).toLocaleDateString('de-CH', {...})
   - Titel für order type: 'AUFTRAGSBESTÄTIGUNG'

5. DELIVERY NOTE – ITEMIDS IN PAYLOAD AKZEPTIEREN
   Im delivery-notes-from-order Controller/Service:
   - Body-Validierung: itemIds ist optionales string[]
   - Wenn itemIds vorhanden: WHERE id IN itemIds beim item-Filter

DATEN-INTEGRITÄT:
- Alle neuen Routen: companyId aus request.user.companyId für Multi-Tenant-Sicherheit
- Alle Zähler (orderCounter, deliveryCounter) in $transaction atomar inkrementieren
- AuditLog für alle Status-Änderungen und Erstellungen
```

---

## Reihenfolge der Implementierung

1. `CreateDeliveryNoteDialog.tsx` erstellen (neue Komponente)
2. `use-delivery-notes.ts` erweitern (Hook-Änderung)
3. `OrderDetail.tsx` anpassen (Datum, Duplizieren, Stornieren, Dialog, Lieferadresse)
4. `Orders.tsx` Fortschritt vereinheitlichen
5. `DocumentForm.tsx` Pflicht-Projekt-Validierung
