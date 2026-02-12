# 🔴 BINDENDE BACKEND-ANWEISUNGEN VON LOVABLE (Frontend-Lead)

> **Erstellt:** 12.02.2026
> **Zweck:** Cursor (Backend-Agent) muss alle Stats-Endpunkte so anpassen, dass die Response EXAKT den hier aufgeführten Frontend-Interfaces entspricht.
> **Regel:** Das Frontend wird NICHT geändert. Das Backend muss sich anpassen.
> **Quelle:** Direkt aus den Hook-Dateien in `src/hooks/` extrahiert.

---

## ANWEISUNG 1: Employee Stats
**Datei:** `src/hooks/use-employees.ts` (Zeile 39-44)
**Endpunkt:** `GET /api/employees/stats`

```typescript
// Backend MUSS genau diese Struktur liefern:
interface EmployeeStats {
  totalEmployees: number;    // Anzahl aller Mitarbeiter
  activeEmployees: number;   // Status = 'ACTIVE'
  newThisMonth: number;      // hireDate im aktuellen Monat
  departmentBreakdown: { department: string; count: number }[];
}
```

---

## ANWEISUNG 2: Time Entry Stats
**Datei:** `src/hooks/use-time-entries.ts` (Zeile 26-32)
**Endpunkt:** `GET /api/time-entries/stats`

```typescript
// Backend MUSS genau diese Struktur liefern:
interface TimeEntryStats {
  todayHours: number;       // Stunden (NICHT Minuten!) für heute
  weekHours: number;        // Stunden für aktuelle Woche
  monthHours: number;       // Stunden für aktuellen Monat
  billableHours: number;    // Summe aller billable=true Einträge in Stunden
  projectBreakdown: { projectId: string; projectName: string; hours: number }[];
}
```

**Zusätzlich:** `GET /api/time-entries/approval-stats` (Zeile 34-38)
```typescript
interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
}
```

---

## ANWEISUNG 3: Reminder Statistics
**Datei:** `src/hooks/use-reminders.ts` (Zeile 22-28)
**Endpunkt:** `GET /api/reminders/statistics` ⚠️ NICHT `/stats`!

```typescript
interface ReminderStatistics {
  totalReminders: number;
  pendingReminders: number;
  sentReminders: number;
  totalOutstanding: number;  // Summe aller offenen Beträge
  byLevel: { level: number; count: number; amount: number }[];
}
```

**Zusätzliche Endpunkte die existieren müssen:**
- `GET /api/reminders/overdue-invoices` — Liste überfälliger Rechnungen
- `POST /api/reminders/batch` — Body: `{ invoiceIds: string[], level?: number, fee?: number }`
- `POST /api/reminders/:id/send` — Body: `{ method: 'EMAIL' | 'PDF' | 'PRINT', recipientEmail?: string }`

---

## ANWEISUNG 4: Purchase Order Statistics
**Datei:** `src/hooks/use-purchase-orders.ts` (Zeile 51-59)
**Endpunkt:** `GET /api/purchase-orders/statistics` ⚠️ NICHT `/stats`!

```typescript
interface PurchaseOrderStatistics {
  totalOrders: number;
  draftOrders: number;
  sentOrders: number;
  confirmedOrders: number;
  receivedOrders: number;
  totalValue: number;
  pendingValue: number;     // ⚠️ Muss berechnet werden!
}
```

---

## ANWEISUNG 5: Purchase Invoice Statistics
**Datei:** `src/hooks/use-purchase-invoices.ts` (Zeile 57-66)
**Endpunkt:** `GET /api/purchase-invoices/statistics` ⚠️ NICHT `/stats`!

```typescript
interface PurchaseInvoiceStatistics {
  totalInvoices: number;
  pendingInvoices: number;
  approvedInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalValue: number;
  pendingValue: number;     // ⚠️ Muss berechnet werden!
  overdueValue: number;     // ⚠️ Muss berechnet werden!
}
```

**Zusätzliche Endpunkte:**
- `POST /api/purchase-invoices/extract-ocr` — Body: `{ documentUrl: string }` → Response: `OcrExtractedData`

---

## ANWEISUNG 6: Payment Statistics
**Datei:** `src/hooks/use-payments.ts` (Zeile 26-31)
**Endpunkt:** `GET /api/payments/statistics` ⚠️ NICHT `/stats`!

```typescript
interface PaymentStatistics {
  totalIncoming: number;    // Summe INCOMING
  totalOutgoing: number;    // Summe OUTGOING
  pendingPayments: number;  // Anzahl Status=PENDING
  completedThisMonth: number; // Anzahl Status=COMPLETED im Monat
}
```

**Zusätzliche Endpunkte:**
- `GET /api/payments/match-qr/:qrReference` — QR-Referenz-Matching

---

## ANWEISUNG 7: Bank Import Statistics
**Datei:** `src/hooks/use-bank-import.ts` (Zeile 165-176)
**Endpunkt:** `GET /api/bank-import/statistics`

```typescript
interface BankImportStats {
  pendingTransactions: number;
  reconciledToday: number;
  totalImported: number;
  lastImportDate?: string;
}
```

**Zusätzliche Endpunkte:**
- `POST /api/bank-import/camt054` — Body: `{ bankAccountId: string, fileContent: string }`
- `GET /api/bank-import/transactions/:id/suggestions` — Reconciliation-Vorschläge
- `POST /api/bank-import/reconcile` — Body: `{ transactionId, invoiceId?, paymentId?, createPayment? }`
- `POST /api/bank-import/auto-reconcile` — Query: `?bankAccountId=...`
- `PATCH /api/bank-import/transactions/:id/ignore`

---

## ANWEISUNG 8: Service Ticket Statistics
**Datei:** `src/hooks/use-service-tickets.ts` (Zeile 41-47)
**Endpunkt:** `GET /api/service-tickets/statistics` ⚠️ NICHT `/stats`!

```typescript
interface ServiceStatistics {
  totalTickets: number;
  openTickets: number;
  scheduledTickets: number;
  completedThisMonth: number;
  averageResolutionTime: number;  // in Stunden
}
```

**Zusätzliche Endpunkte:**
- `GET /api/service-tickets/upcoming-maintenance?days=N`
- `GET /api/service-tickets/technician-availability/:technicianId?startDate=...&endDate=...`
- `POST /api/service-tickets/:id/report` — ServiceReport Body
- `POST /api/service-tickets/:id/schedule` — Body: `{ technicianId, scheduledDate, estimatedHours? }`

---

## ANWEISUNG 9: Production Statistics
**Datei:** `src/hooks/use-production-orders.ts` (Zeile 38-43)
**Endpunkt:** `GET /api/production-orders/statistics` ⚠️ NICHT `/stats`!

```typescript
interface ProductionStatistics {
  totalOrders: number;
  inProgress: number;
  completed: number;
  utilizationRate: number;  // 0-100 Prozent
}
```

**Zusätzliche Endpunkte:**
- `GET /api/production-orders/capacity?startDate=...&endDate=...`
- `POST /api/production-orders/:id/book-time` — Body: `{ operationId, hours, employeeId?, notes? }`
- `POST /api/production-orders/:id/operations/:operationId/complete`

---

## ANWEISUNG 10: Quality Statistics
**Datei:** `src/hooks/use-quality-control.ts` (Zeile 53-59)
**Endpunkt:** `GET /api/quality/checks/statistics` ⚠️ NICHT `/stats`!

```typescript
interface QualityStatistics {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  passRate: number;         // 0-100 Prozent
  pendingChecks: number;    // ⚠️ Muss berechnet werden!
}
```

---

## ANWEISUNG 11: Recruiting Stats
**Datei:** `src/hooks/use-recruiting.ts` (Zeile 282-294)
**Endpunkt:** `GET /api/recruiting/stats`

```typescript
interface RecruitingStats {
  openPositions: number;
  totalCandidates: number;
  interviewsThisWeek: number;
  averageTimeToHire: number;    // in Tagen
  offerAcceptanceRate: number;  // 0-100 Prozent
}
```

---

## ANWEISUNG 12: Training Stats
**Datei:** `src/hooks/use-training.ts` (Zeile 183-196)
**Endpunkt:** `GET /api/training/stats`

```typescript
interface TrainingStats {
  totalTrainings: number;
  upcomingTrainings: number;
  completedThisYear: number;
  totalParticipants: number;
  averageRating: number;    // 1-5 Skala
  totalCost: number;        // ⚠️ ACHTUNG: Frontend sagt `totalCost`, NICHT `totalCosts`
}
```

---

## ANWEISUNG 13: E-Commerce Stats (2 Endpunkte!)
**Datei:** `src/hooks/use-ecommerce.ts` (Zeile 310-325)
**Endpunkte:** `GET /api/ecommerce/orders/stats` + `GET /api/ecommerce/reviews/stats`

```typescript
// Endpunkt 1: GET /api/ecommerce/orders/stats
interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// Endpunkt 2: GET /api/ecommerce/reviews/stats
interface ReviewStats {
  pendingReviews: number;
  averageRating: number;
  activeDiscounts?: number;
}
```

---

## ANWEISUNG 14: Fixed Asset Statistics
**Datei:** `src/hooks/use-fixed-assets.ts` (Zeile 27-32)
**Endpunkt:** `GET /api/fixed-assets/statistics` ⚠️ NICHT `/stats`!

```typescript
interface FixedAssetStatistics {
  totalAssets: number;
  totalValue: number;
  totalDepreciation: number;
  categoryBreakdown: { category: string; count: number; value: number }[];
}
```

---

## ANWEISUNG 15: Marketing Stats (2 Endpunkte!)
**Datei:** `src/hooks/use-marketing.ts` (Zeile 314-328)
**Endpunkte:** `GET /api/marketing/campaigns/stats` + `GET /api/marketing/leads/stats`

```typescript
// Endpunkt 1: GET /api/marketing/campaigns/stats
interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalBudget: number;
  totalSpent: number;
}

// Endpunkt 2: GET /api/marketing/leads/stats
interface LeadStats {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;   // 0-100 Prozent
}
```

---

## ANWEISUNG 16: Document Statistics
**Datei:** `src/hooks/use-documents.ts` (Zeile 277-289)
**Endpunkt:** `GET /api/documents/statistics`

```typescript
interface DocumentStats {
  totalDocuments: number;
  totalFolders: number;
  totalSize: number;         // in Bytes
  recentUploads: number;     // ⚠️ Muss berechnet werden (z.B. letzte 7 Tage)
  archivedDocuments: number; // ⚠️ Muss berechnet werden
}
```

---

## ANWEISUNG 17: Audit Log Statistics
**Datei:** `src/hooks/use-audit-log.ts` (Zeile 100-114)
**Endpunkt:** `GET /api/audit-log/statistics?days=N`

```typescript
interface AuditLogStats {
  totalEntries: number;
  todayEntries: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
  topEntities: Array<{ entityType: string; count: number }>;
}
```

---

## ANWEISUNG 18: Task Stats
**Datei:** `src/hooks/use-tasks.ts` (Zeile 41-47)
**Endpunkt:** `GET /api/tasks/stats`

```typescript
interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;  // ⚠️ MUSS berechnet werden: status != 'DONE' && dueDate < today
}
```

**⚠️ Task Status-Enum:** Frontend nutzt `'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'`. Backend hat `REVIEW` statt `CANCELLED`. **Entscheidung:** Backend soll BEIDE Status unterstützen (`REVIEW` + `CANCELLED`). Frontend bekommt was es erwartet.

---

## ANWEISUNG 19: Calendar Events
**Datei:** `src/hooks/use-calendar.ts` (Zeile 4-19)
**Endpunkte:** `GET /api/calendar`, `GET /api/calendar/:id`, `POST /api/calendar`, `PUT /api/calendar/:id`, `DELETE /api/calendar/:id`

```typescript
// Backend MUSS diese Struktur liefern (NICHT date + startTime separat!):
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: string;
  startDate: string;      // ⚠️ ISO DateTime — NICHT `date` + `startTime`
  endDate: string;        // ⚠️ ISO DateTime — NICHT `date` + `endTime`
  allDay: boolean;        // ⚠️ NICHT `isAllDay`
  location?: string;
  projectId?: string;     // ⚠️ MUSS in Response enthalten sein
  customerId?: string;
  employeeId?: string;    // ⚠️ MUSS in Response enthalten sein
  color?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}
```

---

## ANWEISUNG 20: Supplier Stats
**Datei:** `src/hooks/use-suppliers.ts` (Zeile 86-99)
**Endpunkt:** `GET /api/suppliers/stats`

```typescript
interface SupplierStats {
  total: number;
  active: number;
  newSuppliers: number;
  totalValue: number;
  avgRating: number;
}
```

---

## ANWEISUNG 21: Quote Stats
**Datei:** `src/hooks/use-sales.ts` (Zeile 176-181)
**Endpunkt:** `GET /api/quotes/stats`

```typescript
interface QuoteStats {
  total: number;      // ⚠️ ANZAHL der Angebote, NICHT CHF-Summe!
  draft: number;
  sent: number;
  confirmed: number;
  rejected: number;   // Status CANCELLED zählen als rejected
}
```

---

## ANWEISUNG 22: Order Stats
**Datei:** `src/hooks/use-sales.ts` (Zeile 193-197)
**Endpunkt:** `GET /api/orders/stats`

```typescript
interface OrderStats {
  total: number;      // Anzahl
  draft: number;
  sent: number;
  confirmed: number;
  cancelled: number;
  totalValue: number; // CHF-Summe
}
```

---

## ANWEISUNG 23: Invoice Stats
**Datei:** `src/hooks/use-invoices.ts` (Zeile 126-138)
**Endpunkt:** `GET /api/invoices/stats`

```typescript
interface InvoiceStats {
  total: number;    // CHF-Summe aller Rechnungsbeträge
  paid: number;     // CHF-Summe bezahlt
  pending: number;  // CHF-Summe SENT
  overdue: number;  // CHF-Summe überfällig
}
```

---

## ANWEISUNG 24: User Query-Filter
**Datei:** `src/hooks/use-users.ts` (Zeile 51-56)
**Endpunkt:** `GET /api/users`

```
Query-Parameter die das Backend unterstützen MUSS:
- page: number
- pageSize: number
- search: string    → Suche in firstName, lastName, email
- role: string      → ⚠️ Filter nach Rolle (wird aktuell ignoriert!)
- isActive: boolean → ⚠️ Filter nach aktiv/inaktiv (wird aktuell ignoriert!)
```

---

## ANWEISUNG 25-27: Listen-Responses mit items[]
**Endpunkte:** `GET /api/invoices`, `GET /api/quotes`, `GET /api/orders`

Die Listenansicht muss `items[]` als Array enthalten, NICHT nur `_count.items`.
Das Frontend hat `items: InvoiceItem[]` im Interface und nutzt es.

---

## ANWEISUNG 28: Company Schema-Felder
Die folgenden Felder müssen im Company-Response verfügbar sein:
- `qrIban: string` — Für Swiss QR-Rechnungen
- `defaultCurrency: string` — Standard-Währung (z.B. 'CHF')
- `fiscalYearStart: number` — Monat 1-12

---

## 📌 ZUSAMMENFASSUNG: PFAD-KONVENTION

| Modul | Frontend ruft auf | Backend MUSS haben |
|-------|------------------|--------------------|
| Employees | `/employees/stats` | `/stats` |
| Time Entries | `/time-entries/stats` | `/stats` |
| Reminders | `/reminders/statistics` | `/statistics` |
| Purchase Orders | `/purchase-orders/statistics` | `/statistics` |
| Purchase Invoices | `/purchase-invoices/statistics` | `/statistics` |
| Payments | `/payments/statistics` | `/statistics` |
| Bank Import | `/bank-import/statistics` | `/statistics` |
| Service Tickets | `/service-tickets/statistics` | `/statistics` |
| Production | `/production-orders/statistics` | `/statistics` |
| Quality | `/quality/checks/statistics` | `/statistics` |
| Recruiting | `/recruiting/stats` | `/stats` |
| Training | `/training/stats` | `/stats` |
| E-Commerce Orders | `/ecommerce/orders/stats` | `/stats` |
| E-Commerce Reviews | `/ecommerce/reviews/stats` | `/stats` |
| Fixed Assets | `/fixed-assets/statistics` | `/statistics` |
| Marketing Campaigns | `/marketing/campaigns/stats` | `/stats` |
| Marketing Leads | `/marketing/leads/stats` | `/stats` |
| Documents | `/documents/statistics` | `/statistics` |
| Audit Log | `/audit-log/statistics` | `/statistics` |
| Tasks | `/tasks/stats` | `/stats` |
| Suppliers | `/suppliers/stats` | `/stats` |
| Quotes | `/quotes/stats` | `/stats` |
| Orders | `/orders/stats` | `/stats` |
| Invoices | `/invoices/stats` | `/stats` |
| Calendar | `/calendar` | CRUD Endpunkte |

---

## ✅ CHECKLISTE FÜR CURSOR

- [ ] Employee Stats: Felder umbenennen auf `totalEmployees`, `activeEmployees`, `newThisMonth`, `departmentBreakdown[]`
- [ ] Time Entry Stats: Felder umbenennen + Minuten → Stunden konvertieren + `projectBreakdown` statt `weekBreakdown`
- [ ] Time Entry Approval Stats: Endpunkt `/time-entries/approval-stats` erstellen
- [ ] Reminder Statistics: Pfad `/statistics` + Felder `totalReminders`, `pendingReminders`, `sentReminders`, `totalOutstanding`, `byLevel[]`
- [ ] Purchase Order Statistics: Pfad `/statistics` + Felder wie oben + `pendingValue` berechnen
- [ ] Purchase Invoice Statistics: Pfad `/statistics` + alle 8 Felder + `pendingValue`/`overdueValue` berechnen
- [ ] Payment Statistics: Pfad `/statistics` + Felder `totalIncoming`, `totalOutgoing`, `pendingPayments`, `completedThisMonth`
- [ ] Bank Import Statistics: Felder `pendingTransactions`, `reconciledToday`, `totalImported`, `lastImportDate`
- [ ] Service Ticket Statistics: Pfad `/statistics` + 5 Felder inkl. `averageResolutionTime`
- [ ] Production Statistics: Pfad `/statistics` + `utilizationRate` berechnen
- [ ] Quality Statistics: Pfad `/statistics` + `pendingChecks` berechnen
- [ ] Recruiting Stats: Felder `openPositions`, `totalCandidates`, `interviewsThisWeek`, `averageTimeToHire`, `offerAcceptanceRate`
- [ ] Training Stats: 6 Felder inkl. `totalCost` (NICHT `totalCosts`)
- [ ] E-Commerce: 2 separate Stats-Endpunkte mit exakten Feldnamen
- [ ] Fixed Asset Statistics: Pfad `/statistics` + `categoryBreakdown[]`
- [ ] Marketing: 2 separate Stats-Endpunkte
- [ ] Document Statistics: 5 Felder inkl. `recentUploads` + `archivedDocuments`
- [ ] Audit Log Statistics: 5 Felder mit `topActions`, `topUsers`, `topEntities` Arrays
- [ ] Task Stats: `overdue` berechnen, `review` kann bleiben aber `overdue` MUSS dazu
- [ ] Task Status: `CANCELLED` als zusätzlichen Status im Enum aufnehmen
- [ ] Calendar: Response-Felder `startDate`/`endDate`/`allDay`/`projectId`/`employeeId` korrekt mappen
- [ ] Quote Stats: `total` = ANZAHL, nicht CHF-Summe
- [ ] User Filter: `role` und `isActive` Query-Params implementieren
- [ ] Listen: Invoices/Quotes/Orders müssen `items[]` in der Listenansicht enthalten
- [ ] Company: `qrIban`, `defaultCurrency`, `fiscalYearStart` Felder hinzufügen
