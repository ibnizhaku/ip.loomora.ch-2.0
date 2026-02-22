# Loomora ERP – Codebase-Analyse & Strukturbericht

## 1. Routes-Inventar (App.tsx)

| Pfad | Komponente | Permission |
|------|------------|------------|
| `/` | Index | — |
| `/activity` | Activity | — |
| `/login` | AuthPage | public |
| `/register` | AuthPage | public |
| `/select-company` | SelectCompany | public |
| **Projekte** | | |
| `/projects` | Projects | projects |
| `/projects/new` | ProjectCreate | — |
| `/projects/:id` | ProjectDetail | — |
| `/projects/:id/edit` | ProjectEdit | — |
| **Aufgaben** | | |
| `/tasks` | Tasks | tasks |
| `/tasks/new` | TaskCreate | — |
| `/tasks/:id` | TaskDetail | — |
| `/tasks/:id/edit` | TaskEdit | — |
| **CRM** | | |
| `/customers` | Customers | customers |
| `/customers/new` | CustomerCreate | — |
| `/customers/:id` | CustomerDetail | — |
| `/customers/:id/edit` | CustomerEdit | — |
| `/suppliers` | Suppliers | suppliers |
| `/suppliers/new` | SupplierCreate | — |
| `/suppliers/:id` | SupplierDetail | — |
| `/suppliers/:id/edit` | SupplierEdit | — |
| **Verkauf** | | |
| `/quotes` | Quotes | invoices |
| `/quotes/new` | QuoteCreate | — |
| `/quotes/:id` | QuoteDetail | — |
| `/quotes/:id/edit` | QuoteEdit | — |
| `/orders` | Orders | invoices |
| `/orders/new` | OrderCreate | — |
| `/orders/:id` | OrderDetail | — |
| `/orders/:id/edit` | OrderEdit | — |
| `/invoices` | Invoices | invoices |
| `/invoices/new` | InvoiceCreate | — |
| `/invoices/:id` | InvoiceDetail | — |
| `/invoices/:id/edit` | InvoiceEdit | — |
| `/delivery-notes` | DeliveryNotes | invoices |
| `/delivery-notes/new` | DeliveryNoteCreate | — |
| `/delivery-notes/:id` | DeliveryNoteDetail | — |
| `/delivery-notes/:id/edit` | DeliveryNoteEdit | — |
| `/credit-notes` | CreditNotes | invoices |
| `/credit-notes/new` | CreditNoteCreate | — |
| `/credit-notes/:id` | CreditNoteDetail | — |
| `/credit-notes/:id/edit` | CreditNoteEdit | — |
| `/reminders` | Reminders | invoices |
| `/reminders/:id` | ReminderDetail | — |
| **Einkauf & Lager** | | |
| `/purchase-orders` | PurchaseOrders | purchase-orders |
| `/purchase-orders/new` | PurchaseOrderCreate | — |
| `/purchase-orders/:id` | PurchaseOrderDetail | — |
| `/purchase-orders/:id/edit` | PurchaseOrderEdit | — |
| `/purchase-invoices` | PurchaseInvoices | purchase-invoices |
| `/purchase-invoices/new` | PurchaseInvoiceCreate | — |
| `/purchase-invoices/:id` | PurchaseInvoiceDetail | — |
| `/purchase-invoices/:id/edit` | PurchaseInvoiceEdit | — |
| `/inventory` | Inventory | products |
| `/inventory/:id` | InventoryItemDetail | — |
| `/goods-receipts` | GoodsReceipts | goods-receipts |
| `/goods-receipts/new` | GoodsReceiptCreate | — |
| `/goods-receipts/:id` | GoodsReceiptDetail | — |
| `/goods-receipts/:id/edit` | GoodsReceiptCreate | — |
| **Finanzen & Buchhaltung** | | |
| `/finance` | Finance | finance |
| `/chart-of-accounts` | ChartOfAccounts | finance |
| `/chart-of-accounts/new` | ChartOfAccountCreate | — |
| `/chart-of-accounts/:id` | ChartOfAccountDetail | — |
| `/journal-entries` | JournalEntries | journal-entries |
| `/journal-entries/new` | JournalEntryCreate | journal-entries (write) |
| `/journal-entries/:id` | JournalEntryDetail | — |
| `/general-ledger` | GeneralLedger | finance |
| `/general-ledger/:id` | GeneralLedgerDetail | — |
| `/open-items` | OpenItems | finance |
| `/debtors` | Debtors | finance |
| `/creditors` | Creditors | finance |
| `/balance-sheet` | BalanceSheet | finance |
| `/vat-returns` | VatReturns | vat-returns |
| `/vat-returns/:id` | VatReturnDetail | — |
| `/fixed-assets` | FixedAssets | fixed-assets |
| `/fixed-assets/new` | FixedAssetCreate | — |
| `/fixed-assets/:id` | FixedAssetDetail | — |
| `/cash-book` | CashBook | cash-book |
| `/cash-book/new` | CashBookCreate | — |
| `/cash-book/:id` | CashBookDetail | — |
| `/bank-accounts` | BankAccounts | finance |
| `/bank-accounts/new` | BankAccountCreate | — |
| `/bank-accounts/:id` | BankAccountDetail | — |
| `/sepa-payments` | SepaPayments | payments |
| `/sepa-payments/new` | PaymentCreate | payments (write) |
| `/sepa-payments/:id` | SepaPaymentDetail | — |
| `/cost-centers` | CostCenters | cost-centers |
| `/cost-centers/new` | CostCenterCreate | — |
| `/cost-centers/:id` | CostCenterDetail | — |
| `/budgets` | Budgets | budgets |
| `/budgets/new` | BudgetCreate | — |
| `/budgets/:id` | BudgetDetail | — |
| `/contracts` | Contracts | contracts |
| `/contracts/new` | ContractCreate | — |
| `/contracts/:id` | ContractDetail | — |
| `/contracts/:id/edit` | ContractEdit | — |
| `/payments` | Payments | payments |
| `/payments/:id` | PaymentDetail | — |
| **Stammdaten** | | |
| `/products` | Products | products |
| `/products/new` | ProductCreate | — |
| `/products/:id` | ProductDetail | — |
| `/products/:id/edit` | ProductEdit | — |
| **Marketing, HR, Admin, Produktion, etc.** | | |
| (weitere ~90 Routen siehe App.tsx) | | |

---

## 2. Sidebar → Route Mapping (AppSidebar.tsx)

| Gruppe | Nav-Item | URL | Sub-Items |
|--------|----------|-----|-----------|
| **Hauptmenü** | Dashboard | `/` | — |
| | Projekte | `/projects` | — |
| | Aufgaben | `/tasks` | — |
| | Kalender | `/calendar` | — |
| **CRM** | Kunden | `/customers` | — |
| | Lieferanten | `/suppliers` | — |
| **Verkauf** | Angebote | `/quotes` | — |
| | Aufträge | `/orders` | — |
| | Lieferscheine | `/delivery-notes` | — |
| | Rechnungen | `/invoices` | — |
| | QR-Rechnungen | `/qr-invoice` | — |
| | Gutschriften | `/credit-notes` | — |
| | Mahnwesen | `/reminders` | — |
| **Verwaltung** | Zeiterfassung | `/time-tracking` | — |
| | Einkauf | `/purchase-orders` | — |
| | Einkaufsrechnungen | `/purchase-invoices` | — |
| | Lager | `/inventory` | — |
| | Produkte | `/products` | — |
| | Stücklisten | `/bom` | — |
| | Kalkulation | `/calculation` | — |
| | Produktion | `/production` | — |
| | QS-Prüfung | `/quality` | — |
| | Service | `/service` | — |
| | Verträge | `/contracts` | — |
| | Dokumente | `/documents` | — |
| | Berichte | `/reports` | — |
| **Buchhaltung** | Controlling | `/finance` | Kassenbuch, Kostenstellen, Budgets |
| | Debitoren | `/debtors` | — |
| | Kreditoren | `/creditors` | — |
| | Zahlungsverkehr | `/bank-accounts` | Bankkonten, SEPA-Zahlungen |
| | Finanzbuchhaltung | `/chart-of-accounts` | Kontenplan, Buchungsjournal, Hauptbuch, Offene Posten |
| | Abschlüsse | `/balance-sheet` | Bilanz & GuV, MWST, Anlagenbuchhaltung |
| **Personal (HR)** | Mitarbeiter | `/hr` | — |
| | Arbeitsverträge | `/employee-contracts` | — |
| | Lohnabrechnung CHF | `/payroll` | — |
| | Abwesenheiten | `/absences` | — |
| | Reisekosten | `/travel-expenses` | — |
| | Recruiting | `/recruiting` | — |
| | Schulungen | `/training` | — |
| | Abteilungen | `/departments` | — |
| | Organigramm | `/orgchart` | — |
| **Marketing** | Kampagnen | `/campaigns` | — |
| | Leads | `/leads` | — |
| | E-Mail Marketing | `/email-marketing` | — |
| **E-Commerce** | Online-Shop | `/shop` | — |
| | Rabatte | `/discounts` | — |
| | Bewertungen | `/reviews` | — |
| **Administration** | Benutzer | `/users` | — |
| | Rollen | `/roles` | — |
| | Unternehmen | `/company` | — |
| | Einstellungen | `/settings` | — |
| **Footer** | Hilfe & Support | `/help` | — |

---

## 3. Formulare mit Plain-Text-Inputs (benötigen searchable Selects)

| Datei | Feld | Aktueller Typ | Vorgeschlagenes API/Hook |
|-------|------|---------------|--------------------------|
| **FixedAssetCreate.tsx** | Lieferant (supplier) | `Input` (Freitext) | `useSuppliers` → Searchable Select |
| **FixedAssetCreate.tsx** | Rechnungsnummer (invoiceNumber) | `Input` (Freitext) | `usePurchaseInvoices` → Search & Select (oder Link zu Einkaufsrechnung) |
| **GoodsReceiptCreate.tsx** | Bestellnummer (purchaseOrderId) | `Input` (Freitext-ID) | `usePurchaseOrders` → Searchable Select nach Bestellnr./Lieferant |
| **PaymentCreate.tsx** | Rechnung (invoiceId) | Nur via URL-Param, **kein UI** | `useInvoices` → Searchable Select für eingehende Zahlungen |
| **PaymentCreate.tsx** | Einkaufsrechnung (purchaseInvoiceId) | Nur via URL-Param, **kein UI** | `usePurchaseInvoices` → Searchable Select für ausgehende Zahlungen |
| **PurchaseInvoiceCreate.tsx** | Bezug Bestellung (purchaseOrderId) | `Input disabled` wenn aus URL | Wenn leer: Searchable Select `usePurchaseOrders` anbieten |
| **CashBookCreate.tsx** | Kostenstelle (costCenter) | Hardcoded `Select` | `/cost-centers` API → dynamischer Select |
| **JournalEntryCreate.tsx** | Beleg/Referenz (reference) | `Input` | Optional: Suche nach Rechnung/Beleg → Link setzen |
| **BOMCreate.tsx** | Produkt-Positionen | `Input` für Artikel | `useProducts` → Searchable Select pro Position |
| **ProductionCreate.tsx** | Diverse Referenzen | `Input` | Je nach Feld: Produkte, Aufträge, Stücklisten aus API laden |

### Bereits gut umgesetzt (API-basiert)

- **DocumentForm** (Quote, Invoice, Order, DeliveryNote, CreditNote, PurchaseOrder): Kunde (Dialog mit Suche), Produkte (Dialog mit Suche), Projekt (Select)
- **PurchaseOrderCreate**: Lieferant (Command/Popover), Produkte (API)
- **PurchaseInvoiceCreate**: Lieferant (Select), optional Bestellung
- **PaymentCreate**: Kunde, Lieferant, Bankkonto (Select)
- **CalculationCreate**: Kunde (Select)
- **ContractCreate**: Kunde (Select)
- **EmployeeContractCreate**: Mitarbeiter (Select)

---

## 4. API-Nutzung

### Hooks & Endpoints (ausgewählt)

| Hook / Modul | Typische Endpoints | Verwendung (Seiten) |
|--------------|--------------------|----------------------|
| `use-customers` | `/customers` | DocumentForm, ContractCreate, PaymentCreate, CalculationCreate |
| `use-suppliers` | `/suppliers` | PurchaseOrderCreate, PurchaseInvoiceCreate, ProductCreate, PaymentCreate |
| `use-products` | `/products` | DocumentForm, PurchaseOrderCreate, BOMCreate |
| `use-projects` | `/projects` | DocumentForm, PurchaseOrderCreate, PurchaseInvoiceCreate |
| `use-invoices` | `/invoices` | InvoiceCreate, InvoiceDetail, Invoices |
| `use-sales` (quotes, orders) | `/quotes`, `/orders` | QuoteCreate, OrderCreate, DocumentForm |
| `use-purchase-orders` | `/purchase-orders` | PurchaseOrderCreate, GoodsReceiptCreate |
| `use-purchase-invoices` | `/purchase-invoices` | PurchaseInvoiceCreate |
| `use-payments` | `/payments` | PaymentCreate |
| `use-journal-entries` | `/journal-entries` | JournalEntryCreate |
| `use-finance` | `/finance/accounts` | JournalEntryCreate |
| `use-cash-book` | `/cash-book/registers` | CashBookCreate |
| `use-cost-centers` | `/cost-centers` | (CashBookCreate nutzt aktuell hardcodierte Liste) |
| `use-employees` | `/employees` | EmployeeContractCreate, AbsenceCreate |

### Fehlende / potenzielle API-Anbindungen

| Seite / Formular | Erwarteter Endpoint | Status |
|------------------|---------------------|--------|
| CashBookCreate (Kostenstellen) | `/cost-centers` | Hardcoded, API nicht genutzt |
| FixedAssetCreate | `/suppliers`, `/purchase-invoices` | Kein API-Call |
| GoodsReceiptCreate | `/purchase-orders` (Search) | Nur usePurchaseOrder(id), keine Liste zum Suchen |
| PaymentCreate (Rechnung verknüpfen) | `/invoices`, `/purchase-invoices` | Keine UI zum Auswählen |

---

## 5. Fehlende / kaputte Links & Routes

| Problem | Ort | Beschreibung |
|---------|-----|--------------|
| **Route fehlt** | Register.tsx | `navigate("/payment-pending")` – Route existiert nicht in App.tsx |
| **Doppelte Route** | App.tsx | `/payslips/:id` und `/payroll/payslip/:id` zeigen beide auf PayslipDetail (OK) |
| **Gefahr Kollision** | App.tsx | `/hr/:id` könnte mit `/hr/new` kollidieren; `new` wird zuerst gematcht (OK) |

### Vorschlag für `/payment-pending`

- Route in App.tsx hinzufügen:  
  `<Route path="/payment-pending" element={<ProtectedLayout><PaymentPending /></ProtectedLayout>} />`
- Oder stattdessen z.B. `/select-company` oder eine Info-Seite für „Zahlung ausstehend“ nutzen

---

## 6. Entity-Beziehungen (Schema-basiert)

### Verkauf (Customer → … → Invoice)

```
Customer
  ├── Quote (customerId, projectId?)
  │     └── QuoteItem
  ├── Order (customerId, quoteId?, projectId?)
  │     └── OrderItem
  ├── DeliveryNote (customerId, orderId, projectId?)
  ├── Invoice (customerId, orderId?, projectId?)
  │     └── InvoiceItem
  ├── Reminder (invoiceId, projectId?)
  ├── CreditNote (customerId, invoiceId?, projectId?)
  └── Contract (customerId)
```

### Einkauf (Supplier → … → PurchaseInvoice)

```
Supplier
  ├── PurchaseOrder (supplierId, projectId?)
  │     └── GoodsReceipt (purchaseOrderId)
  └── PurchaseInvoice (supplierId, purchaseOrderId?)
```

### Zahlungen

```
Payment
  ├── invoiceId? (Verkaufsrechnung)
  ├── purchaseInvoiceId? (Einkaufsrechnung)
  ├── customerId?
  ├── supplierId?
  └── bankAccountId?
```

### Projekte

```
Project
  ├── Quote, Order, DeliveryNote, Invoice, CreditNote
  ├── PurchaseOrder, PurchaseInvoice
  ├── TimeEntry, Task
  └── Contract
```

### Produkte

```
Product
  ├── supplierId? (Lieferant)
  ├── BOM (Stücklisten)
  └── Positionen in Quotes, Orders, Invoices, PurchaseOrders
```

---

## 7. Prioritätenliste für Fixes

| Prio | Aufgabe | Begründung |
|------|---------|------------|
| 1 | Route `/payment-pending` hinzufügen oder Register-Flow anpassen | Registrierung endet aktuell auf nicht existierender Route |
| 2 | PaymentCreate: UI für Rechnung/Einkaufsrechnung | invoiceId und purchaseInvoiceId nur via URL, Nutzer können Zahlungen nicht manuell verknüpfen |
| 3 | GoodsReceiptCreate: Bestellung als Searchable Select | Freitext-ID fehleranfällig und schlecht bedienbar |
| 4 | FixedAssetCreate: Lieferant & Rechnung als Selects | Datenqualität und Verknüpfung zu Lieferanten/Rechnungen |
| 5 | CashBookCreate: Kostenstellen aus API | Aktuell hardcodiert, keine Synchronisation mit CostCenters |
| 6 | PurchaseInvoiceCreate: optionale Bestellung auswählbar | Wenn keine URL, soll Bestellung aus Liste wählbar sein |
| 7 | Sidebar: Lieferanten-Permission | Lieferanten nutzt `permission: "customers"` – sollte `"suppliers"` sein |
| 8 | BOMCreate: Produkte als Searchable Select | Konsistenz mit anderen Formularen |
| 9 | DocumentForm: Projekt optional machen? | Projekt ist aktuell Pflicht – evtl. für einfache Rechnungen optional |

---

## 8. Kurzüberblick

- Ca. 120+ Routen in App.tsx
- Sidebar mit 9 Gruppen, teilweise Untermenüs
- DocumentForm, PurchaseOrderCreate, PaymentCreate etc. nutzen bereits sinnvolle API-Selects
- Kritische Lücken: `payment-pending`-Route, PaymentCreate ohne Rechnungs-UI, GoodsReceiptCreate ohne Bestellungs-Suche
- Entity-Beziehungen sind im Prisma-Schema klar abgebildet und entsprechen typischen ERP-Flows
