# Verkauf-Ergänzung: Status, Änderungen & Backend-Prompt

## 1. Ursprüngliche Anforderungen und Status

### ✅ = Erledigt (Frontend) | ⏳ = Wartet auf Backend | ❌ = Offen

---

### 1. Angebote (Quotes)

| # | Punkt | Status | Details |
|---|-------|--------|---------|
| 1.1 | Projekt-Pflicht bei Erstellung | ✅ | `DocumentForm.tsx` Z.390-393: Validierung vorhanden |
| 1.2 | Projekt auf Detailseite anzeigen | ✅⏳ | `QuoteDetail.tsx` Z.124: `project: quote.project?.name` — Mapping vorhanden, **wartet auf Backend** |
| 1.3 | Projekt im PDF erwähnen | ✅⏳ | `pdfData.projectNumber` wird befüllt — **wartet auf Backend** |
| 1.4 | User/Ersteller anzeigen | ✅⏳ | `QuoteDetail.tsx` Z.202: `createdByUser` aus rawQuote extrahiert, in Sidebar angezeigt. PDF: `createdBy` Feld in `SalesDocumentData` hinzugefügt, wird in `sales-document.ts` Z.214-216 gerendert. **Wartet auf Backend** für `createdByUser`-Relation |
| 1.5 | Verlauf aus API laden (nicht lokal) | ✅⏳ | `QuoteDetail.tsx` Z.162: `useEntityHistory("quote", id)` — Hook in `use-audit-log.ts` implementiert. **Wartet auf Backend** AuditLog-Daten |
| 1.6 | Drucken via PDF (nicht window.print) | ✅ | `QuoteDetail.tsx` Z.396-413: `getSalesDocumentPDFBlobUrl` → neues Fenster → `printWindow.print()` |
| 1.7 | Quotes-Liste: Projekt-Spalte befüllen | ✅⏳ | `Quotes.tsx` Z.91: `project: raw.project?.name`, Spalte zeigt Wert. **Wartet auf Backend** |

---

### 2. Aufträge (Orders)

| # | Punkt | Status | Details |
|---|-------|--------|---------|
| 2.1 | Projekt-Pflicht bei Erstellung | ✅ | `DocumentForm.tsx` Z.395-398: Validierung vorhanden |
| 2.2 | Zuweisung (User) bei Neuer Auftrag | ✅ | `OrderDetail.tsx` hat bereits `assignedUsers` Unterstützung im Mapping (Z.124). `DocumentForm.tsx` hat kein eigenes UI-Feld dafür — Zuweisung erfolgt über OrderDetail nach Erstellung |
| 2.3 | Verlauf/Aktivität mit User | ✅⏳ | `OrderDetail.tsx` nutzt bereits lokalen Activity-Log aus Order-Daten. Vollständiger AuditLog **wartet auf Backend** |
| 2.4 | User im PDF | ✅⏳ | `createdBy` Feld in `SalesDocumentData` vorhanden. **Wartet auf Backend** für User-Daten |
| 2.5 | Projekt im PDF | ✅⏳ | `projectNumber` im Mapping vorhanden. **Wartet auf Backend** |
| 2.6 | Orders-Liste: Projekt-Spalte | ✅⏳ | `Orders.tsx` Z.109: `project: raw.project?.name`. Spalte vorhanden. **Wartet auf Backend** |

---

### 3. Lieferscheine (Delivery Notes)

| # | Punkt | Status | Details |
|---|-------|--------|---------|
| 3.1 | Kunde zeigt falschen Namen | ✅⏳ | `DeliveryNotes.tsx` Z.99: `raw.customer?.companyName \|\| raw.customer?.name`. **Wartet auf Backend** für `companyName` |
| 3.2 | Lieferadresse wird nicht angezeigt | ✅ | Z.86-88: `deliveryAddress`-Objekt wird zu String formatiert (company, street, zipCode+city). Fallback auf `shippingAddress` |
| 3.3 | Tracking entfernen | ✅ | Tracking-Spalte, `carrier`, `trackingNumber` komplett entfernt aus Tabelle und Cards |
| 3.4 | Projekt und Ersteller statt Tracking | ✅⏳ | Z.101-102: `project: raw.project?.name`, `createdBy: userName`. Neue Spalten "Projekt" (Z.376) und "Erstellt von" (Z.379) in Tabelle. **Wartet auf Backend** |

---

### 4. Rechnungen (Invoices)

| # | Punkt | Status | Details |
|---|-------|--------|---------|
| 4.1 | Projekt-Pflicht bei Erstellung | ✅ | `DocumentForm.tsx` Z.400-403: Validierung hinzugefügt |
| 4.2 | Ersteller anzeigen (Detail + Liste) | ✅⏳ | `Invoices.tsx`: Spalte "Erstellt von" (Z.396). `InvoiceDetail.tsx`: AuditLog zeigt User. **Wartet auf Backend** für `createdByUser` |
| 4.3 | Lieferadresse in Liste | ✅ | `Invoices.tsx`: Spalte "Lieferadresse" (Z.395). Vergleichslogik: zeigt "Gleich wie RE-Adresse" wenn identisch |
| 4.4 | Verlauf auf Detailseite | ✅⏳ | `InvoiceDetail.tsx` Z.154: `useEntityHistory("invoice", id)`. Verlauf-Card Z.600-622 rendert AuditLog. **Wartet auf Backend** |
| 4.5 | Drucken-Button: QR-PDF nutzen | ✅ | `InvoiceDetail.tsx` Z.367-390: `handlePrint` prüft QR-Daten, nutzt `generateSwissQRInvoicePDFDataUrl` wenn verfügbar, sonst Fallback auf `getSalesDocumentPDFBlobUrl` |
| 4.6 | E-Mail senden → Status auf SENT | ✅ | `SendEmailModal.tsx`: `onSuccess` Callback hinzugefügt. `InvoiceDetail.tsx`: nach Email-Versand wird `sendInvoiceAction.mutateAsync(id)` aufgerufen |

---

### 5. Gutschriften (Credit Notes)

| # | Punkt | Status | Details |
|---|-------|--------|---------|
| 5.1 | PDF-Type auf `'credit-note'` | ✅ | `CreditNoteDetail.tsx` Z.112: `type: 'credit-note'` (vorher fälschlich `'invoice'`) |
| 5.2 | PDF-Titel "Gutschrift" | ✅ | `sales-document.ts` Z.86: `'credit-note': { de: 'Gutschrift' }` — eigener Dokumenttyp |
| 5.3 | Stornieren funktional | ✅ | Z.198-206: `api.put('/credit-notes/${id}', { status: 'CANCELLED' })` mit Toast und Navigation |
| 5.4 | Duplizieren funktional | ✅ | Z.194-197: `navigate('/credit-notes/new?invoiceId=...')` |
| 5.5 | Firmenname priorisieren | ✅⏳ | Z.90: `cn.customer?.companyName \|\| cn.customer?.name`. **Wartet auf Backend** für `companyName` im Customer-Objekt |
| 5.6 | Verlauf-Card (AuditLog) | ❌ | Noch nicht implementiert — `CreditNoteDetail.tsx` hat keinen `useEntityHistory` Aufruf |

---

### 6. Mahnwesen (Reminders)

| # | Punkt | Status | Details |
|---|-------|--------|---------|
| 6.1 | Detailpage: Schuldner anzeigen | ✅⏳ | `ReminderDetail.tsx` Z.64: Fallback-Kette `r.invoice?.customer?.companyName \|\| r.invoice?.customer?.name \|\| r.customer?.companyName \|\| r.customer?.name`. **Wartet auf Backend** |
| 6.2 | Create-Dialog: Überfällige Rechnungen | ⏳ | **Rein Backend-Problem**: `/reminders/overdue-invoices` Filter zu restriktiv |
| 6.3 | Sammelmahnung: E-Mail-Anbindung | ✅ | `Reminders.tsx` Z.313-334: `confirmBulkReminder` nutzt `sendReminderMutation.mutateAsync` statt `setTimeout` |
| 6.4 | PDF-Download aus 3-Punkte-Menü | ✅ | Z.596 (Cards) und Z.735 (Table): `downloadPdf("reminders", reminder.id, ...)` |
| 6.5 | Mahnung versenden (3-Punkte) | ✅ | Z.351-353: `handleSendNextReminder` setzt `emailReminderTarget` → öffnet `SendEmailModal` |
| 6.6 | "Anrufen" entfernen | ✅ | Entfernt aus Card- und Table-Dropdowns |
| 6.7 | Zahlungsfrist verlängern | ✅ | Z.360-380: Dialog mit Datumsauswahl, `useUpdateReminder` mit `{ dueDate: extendDate }` |
| 6.8 | An Inkasso übergeben | ✅ | Setzt Level auf 5 via API — funktioniert |
| 6.9 | Anzeigen (3-Punkte) | ✅ | Navigiert zu `/reminders/${reminder.id}` |
| 6.10 | "Überfällig ohne Mahnung" Tab | ✅⏳ | Z.777-820: Tab vorhanden, nutzt `overdueInvoices`. **Wartet auf Backend** Fix des Overdue-Filters |
| 6.11 | Mahnverlauf Tab | ✅⏳ | Z.110-180: `HistoryTab` nutzt `useReminders` mit Status SENT/PAID/CANCELLED. **Wartet auf Backend** für Relationen |
| 6.12 | Projekt speichern bei Mahnung | ⏳ | **Rein Backend**: Projekt-ID der verknüpften Rechnung automatisch übernehmen |
| 6.13 | Verlauf auf Detailpage | ✅⏳ | `ReminderDetail.tsx` Z.34: `useEntityHistory("reminder", id)` — **Wartet auf Backend** AuditLog-Daten |
| 6.14 | Ersteller in Liste | ✅⏳ | `Reminders.tsx` Z.706-708: Spalte "Erstellt von" mit `createdByUser`. **Wartet auf Backend** |
| 6.15 | Verknüpfte Rechnung: Klick | ✅⏳ | `ReminderDetail.tsx` Z.140: `Link to={'/invoices/${r.invoice.id}'}`. **Wartet auf Backend** für vollständige `invoice`-Relation |

---

## 2. Zusammenfassung der Frontend-Änderungen

### Geänderte Dateien

| Datei | Änderungen |
|---|---|
| `src/lib/pdf/sales-document.ts` | `credit-note` als Dokumenttyp, `createdBy` Feld in Interface + Rendering |
| `src/hooks/use-audit-log.ts` | `useEntityHistory(entityType, entityId)` Hook für AuditLog pro Entity |
| `src/components/documents/DocumentForm.tsx` | Projekt-Pflicht für Invoice (Z.400-403) |
| `src/components/email/SendEmailModal.tsx` | `onSuccess` Callback-Prop hinzugefügt |
| `src/pages/QuoteDetail.tsx` | AuditLog-Verlauf, PDF-Druck, createdBy-Anzeige |
| `src/pages/Quotes.tsx` | Projekt-Spalte aus `raw.project?.name`, createdBy-Mapping |
| `src/pages/Orders.tsx` | Projekt-Spalte aus `raw.project?.name` |
| `src/pages/OrderDetail.tsx` | (bereits vorhanden: Projekt-Sidebar, assignedUsers) |
| `src/pages/DeliveryNotes.tsx` | Tracking entfernt, Projekt+Ersteller Spalten, Lieferadresse-Fix |
| `src/pages/Invoices.tsx` | Ersteller-Spalte, Lieferadresse-Spalte, Projekt in Cards |
| `src/pages/InvoiceDetail.tsx` | AuditLog-Verlauf, QR-PDF Druck, E-Mail→Status-Update |
| `src/pages/CreditNoteDetail.tsx` | PDF-Typ `credit-note`, Stornieren/Duplizieren funktional, companyName |
| `src/pages/Reminders.tsx` | PDF-Download, Sammelmahnung via API, "Anrufen" entfernt, Zahlungsfrist-Dialog, Ersteller-Spalte |
| `src/pages/ReminderDetail.tsx` | Schuldner-Fallback, AuditLog-Verlauf, SendEmailModal |

---

## 3. Backend Cursor-Prompt

> **Anweisung für Cursor (Backend/NestJS):** Folgende Änderungen müssen im Backend durchgeführt werden, damit die Frontend-Fixes vollständig funktionieren.

### 3.1 Alle Belegtypen: `createdByUser` Relation inkludieren

In **allen** Service-Dateien (`quotes.service.ts`, `orders.service.ts`, `invoices.service.ts`, `delivery-notes.service.ts`, `credit-notes.service.ts`, `reminders.service.ts`) muss bei `findAll()`, `findOne()` und `create()` die User-Relation inkludiert werden:

```typescript
// In jedem Prisma-Query (findMany, findFirst, create) ergänzen:
include: {
  // ... bestehende includes ...
  createdByUser: {
    select: { id: true, firstName: true, lastName: true, name: true, email: true }
  },
}
```

### 3.2 Quotes, Orders, Invoices: `project` Relation inkludieren

```typescript
// quotes.service.ts, orders.service.ts, invoices.service.ts
include: {
  // ... bestehende includes ...
  project: {
    select: { id: true, number: true, name: true }
  },
}
```

### 3.3 Credit Notes: `customer.companyName` sicherstellen

```typescript
// credit-notes.service.ts
include: {
  customer: {
    select: { id: true, name: true, companyName: true, email: true, phone: true, contactPerson: true, street: true, zipCode: true, city: true }
  },
}
```

### 3.4 Reminders: `invoice.customer` nested inkludieren

```typescript
// reminders.service.ts
include: {
  invoice: {
    include: {
      customer: {
        select: { id: true, name: true, companyName: true, email: true, phone: true }
      }
    }
  },
  customer: {
    select: { id: true, name: true, companyName: true }
  },
  createdByUser: {
    select: { id: true, firstName: true, lastName: true, name: true }
  },
}
```

### 3.5 `/reminders/overdue-invoices` Filter-Fix

Der Endpoint liefert aktuell keine Daten. Der Filter muss angepasst werden:

```typescript
// reminders.service.ts - getOverdueInvoices()
const overdueInvoices = await this.prisma.invoice.findMany({
  where: {
    companyId,
    status: { in: ['SENT', 'OVERDUE'] },
    dueDate: { lt: new Date() },
    // Nur Rechnungen OHNE aktive Mahnung
    reminders: {
      none: {
        status: { not: 'CANCELLED' }
      }
    }
  },
  include: {
    customer: {
      select: { id: true, name: true, companyName: true }
    }
  }
});
```

### 3.6 AuditLog: Entity-History Endpoint

Der Endpoint `GET /audit-log/entity/:entityType/:entityId` existiert bereits im Controller (Z.70-78). Sicherstellen dass:

1. Der `AuditLogService.getEntityHistory()` korrekt nach `entityType` und `entityId` filtert
2. Die User-Relation (`user: { firstName, lastName }`) inkludiert wird
3. Die Response ein Array von AuditLog-Entries zurückgibt (nicht paginiert)
4. Die Permission `settings:read` eventuell zu locker oder zu strikt ist — prüfen ob Beleg-Besitzer auch Zugriff haben sollten

### 3.7 Delivery Notes: `customer.companyName` + `deliveryAddress` sicherstellen

```typescript
// delivery-notes.service.ts
include: {
  customer: {
    select: { id: true, name: true, companyName: true }
  },
  order: {
    select: { id: true, number: true }
  },
  project: {
    select: { id: true, name: true }
  },
  createdByUser: {
    select: { id: true, firstName: true, lastName: true, name: true }
  },
}
```

Das `deliveryAddress`-Feld muss als JSON-Objekt mit `{ company, street, zipCode, city }` gespeichert und zurückgegeben werden (nicht als flacher String).

### 3.8 Reminders: Projekt automatisch von Rechnung übernehmen

```typescript
// reminders.service.ts - create()
async create(data: CreateReminderDto, companyId: string) {
  // Projekt-ID der verknüpften Rechnung automatisch setzen
  const invoice = await this.prisma.invoice.findUnique({
    where: { id: data.invoiceId },
    select: { projectId: true }
  });
  
  return this.prisma.reminder.create({
    data: {
      ...data,
      companyId,
      projectId: invoice?.projectId || null,
    },
    include: { /* ... wie oben */ }
  });
}
```

---

## 4. Noch offene Frontend-Punkte

| # | Punkt | Beschreibung |
|---|-------|-------------|
| 5.6 | Gutschrift: Verlauf-Card | `CreditNoteDetail.tsx` fehlt `useEntityHistory("credit-note", id)` und die Verlauf-Card UI |
| 2.2 | Order: User-Zuweisung in DocumentForm | `DocumentForm.tsx` hat kein Benutzer-Auswahl-Feld für `type === "order"`. Zuweisung geht aktuell nur über OrderDetail |
