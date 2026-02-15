# 🔍 Loomora ERP — Vollständiger Navigations- & Routing-Audit (Modul für Modul)

> Erstellt: 2026-02-15
> Zweck: Detaillierte Modul-für-Modul-Analyse aller Routen, Navigationen, Datenquellen und Edge Cases

---

## 📋 LEGENDE

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | OK — Korrekt implementiert |
| ❌ | FEHLT — Nicht vorhanden |
| ⚠️ | PRÜFEN — Mock-Daten oder inkomplete Logik |
| 🔴 | KRITISCH — Broken Navigation / Funktionalität |
| 🟡 | MOCK — Seite nutzt hardcodierte Testdaten statt API |

---

## GLOBALE INFRASTRUKTUR

| Prüfpunkt | Status | Details |
|-----------|--------|---------|
| 404-Seite | ✅ | `NotFound` bei `path="*"` |
| Error Boundary | ✅ | `PageErrorBoundary` in `ProtectedLayout` |
| Auth Guard | ✅ | `ProtectedRoute` wrapper auf allen geschützten Routen |
| API Client | ✅ | Zentraler `api.ts` mit Token-Refresh |
| Token Refresh | ✅ | `userId` aus Body entfernt, nutzt JWT `sub` |

---

# 📦 MODULE IM DETAIL

---

## 1. PROJEKTE (`/projects`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/projects` | ✅ | ✅ `Projects.tsx` | ✅ API | ✅ |
| `/projects/new` | ✅ | ✅ `ProjectCreate.tsx` | ✅ API | ✅ |
| `/projects/:id` | ✅ | ✅ `ProjectDetail.tsx` | ✅ API | ✅ |
| `/projects/:id/edit` | ✅ | ✅ `ProjectEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- ✅ "Bearbeiten" Button → `navigate(\`/projects/${id}/edit\`)`
- ✅ Zurück-Button → `/projects`
- ❌ "Neue Aufgabe" Button fehlt → sollte zu `/tasks/new?projectId=${id}` navigieren
- ❌ "Neue Rechnung" Button fehlt → sollte zu `/invoices/new?projectId=${id}&customerId=...` navigieren

**Query-Parameter:**
- ✅ `ProjectCreate` liest `customerId` aus Query-Params

---

## 2. KUNDEN (`/customers`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/customers` | ✅ | ✅ `Customers.tsx` | ✅ API | ✅ |
| `/customers/new` | ✅ | ✅ `CustomerCreate.tsx` | ✅ API | ✅ |
| `/customers/:id` | ✅ | ✅ `CustomerDetail.tsx` | ✅ API | ✅ |
| `/customers/:id/edit` | ✅ | ✅ `CustomerEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- ✅ "Bearbeiten" Button → `navigate(\`/customers/${id}/edit\`)`
- ✅ Kontextsensitive Links: Angebot, Rechnung, Auftrag, Projekt, Lieferschein mit `?customerId=`
- ✅ Zurück-Button → `/customers`

---

## 3. LIEFERANTEN (`/suppliers`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/suppliers` | ✅ | ✅ `Suppliers.tsx` | ✅ API | ✅ |
| `/suppliers/new` | ✅ | ✅ `SupplierCreate.tsx` | ✅ API | ✅ |
| `/suppliers/:id` | ✅ | ✅ `SupplierDetail.tsx` | ✅ API | ✅ |
| `/suppliers/:id/edit` | ✅ | ✅ `SupplierEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- ✅ "Bearbeiten" Button → `navigate(\`/suppliers/${id}/edit\`)`
- ✅ "Bestellung erstellen" → `navigate(\`/purchase-orders/new?supplierId=${id}\`)`
- ❌ "Eingangsrechnung erstellen" Button fehlt → sollte zu `/purchase-invoices/new?supplierId=${id}` navigieren
- ✅ Dropdown: E-Mail senden, Löschen
- ✅ Zurück-Button → `/suppliers`

---

## 4. ANGEBOTE (`/quotes`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/quotes` | ✅ | ✅ `Quotes.tsx` | ✅ API | ✅ |
| `/quotes/new` | ✅ | ✅ `QuoteCreate.tsx` | ✅ API | ✅ |
| `/quotes/:id` | ✅ | ✅ `QuoteDetail.tsx` | ✅ API | ✅ |
| `/quotes/:id/edit` | ✅ | ✅ `QuoteEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- ✅ "Bearbeiten" im Dropdown → `navigate(\`/quotes/${id}/edit\`)`
- ✅ "In Auftrag umwandeln" Button vorhanden
- ⚠️ "In Auftrag umwandeln" nutzt lokalen State statt API-Call
- ⚠️ "Duplizieren" nutzt nur Toast, kein API-Call
- ⚠️ "Löschen" nutzt nur Toast + Navigate, kein API-Call
- ✅ Query-Parameter: `customerId` wird in `QuoteCreate` gelesen

---

## 5. AUFTRÄGE (`/orders`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/orders` | ✅ | ✅ `Orders.tsx` | ✅ API | ✅ |
| `/orders/new` | ✅ | ✅ `OrderCreate.tsx` | ✅ API | ✅ |
| `/orders/:id` | ✅ | ✅ `OrderDetail.tsx` | ✅ API | ✅ |
| `/orders/:id/edit` | ✅ | ✅ `OrderEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- ✅ "Bearbeiten" im Dropdown → `navigate(\`/orders/${id}/edit\`)`
- ⚠️ "Lieferschein erstellen" Button vorhanden, aber KEINE `onClick`-Logik → sollte zu `/delivery-notes/new?orderId=${id}` navigieren
- ⚠️ "Rechnung erstellen" Button vorhanden, aber KEINE `onClick`-Logik → sollte zu `/invoices/new?orderId=${id}` navigieren
- ⚠️ "Drucken" Button ohne Logik
- ⚠️ "Duplizieren" im Dropdown ohne Logik
- ✅ Link zum Angebot → `/quotes/${quoteId}`
- ✅ Link zum Kunden → `/customers/${customerId}`
- ✅ Links zu Lieferscheinen → `/delivery-notes/${id}`

---

## 6. RECHNUNGEN (`/invoices`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/invoices` | ✅ | ✅ `Invoices.tsx` | ✅ API | ✅ |
| `/invoices/new` | ✅ | ✅ `InvoiceCreate.tsx` | ✅ API | ✅ |
| `/invoices/:id` | ✅ | ✅ `InvoiceDetail.tsx` | ✅ API | ✅ |
| `/invoices/:id/edit` | ✅ | ✅ `InvoiceEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- ⚠️ Kein "Bearbeiten"-Button sichtbar in Dropdown → PRÜFEN
- ✅ PDF Vorschau & Download funktional
- ✅ Link zum Kunden
- ❌ Kein `navigate` → InvoiceDetail nutzt `useNavigate` nicht für Edit

---

## 7. LIEFERSCHEINE (`/delivery-notes`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/delivery-notes` | ✅ | ✅ | ✅ API | ✅ |
| `/delivery-notes/new` | ✅ | ✅ | ✅ API | ✅ |
| `/delivery-notes/:id` | ✅ | ✅ `DeliveryNoteDetail.tsx` | ✅ API | ✅ |
| `/delivery-notes/:id/edit` | ✅ | ✅ `DeliveryNoteEdit.tsx` | ✅ API | ✅ |

---

## 8. GUTSCHRIFTEN (`/credit-notes`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/credit-notes` | ✅ | ✅ | ✅ API | ✅ |
| `/credit-notes/new` | ✅ | ✅ | ✅ API | ✅ |
| `/credit-notes/:id` | ✅ | ✅ `CreditNoteDetail.tsx` | 🟡 MOCK | ⚠️ |
| `/credit-notes/:id/edit` | ✅ | ✅ `CreditNoteEdit.tsx` | ✅ API | ✅ |

**Problem:** `CreditNoteDetail.tsx` nutzt hardcodierte `creditNoteData` statt API-Hook.

---

## 9. MAHNUNGEN (`/reminders`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/reminders` | ✅ | ✅ `Reminders.tsx` | ? | ⚠️ |
| `/reminders/new` | ❌ FEHLT | ❌ | - | ⚠️ |
| `/reminders/:id` | ✅ | ✅ `ReminderDetail.tsx` | 🟡 MOCK | ⚠️ |

**Problem:** `ReminderDetail` nutzt hardcodierte `mahnungData`. Keine Create-Route (ggf. bewusst).

---

## 10. BESTELLUNGEN (`/purchase-orders`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/purchase-orders` | ✅ | ✅ | ✅ API | ✅ |
| `/purchase-orders/new` | ✅ | ✅ | ✅ API | ✅ |
| `/purchase-orders/:id` | ✅ | ✅ `PurchaseOrderDetail.tsx` | 🟡 MOCK+API | ⚠️ |
| `/purchase-orders/:id/edit` | ✅ | ✅ `PurchaseOrderEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- ✅ "Bearbeiten" → `navigate(\`/purchase-orders/${id}/edit\`)`
- ⚠️ Seite nutzt `initialPurchaseOrderData` als Fallback (Mix aus Mock und API)
- ❌ `PurchaseOrderCreate` liest `supplierId` aus Query-Params NICHT → muss implementiert werden

---

## 11. EINGANGSRECHNUNGEN (`/purchase-invoices`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/purchase-invoices` | ✅ | ✅ | ✅ API | ✅ |
| `/purchase-invoices/new` | ✅ | ✅ | ✅ API | ✅ |
| `/purchase-invoices/:id` | ✅ | ✅ `PurchaseInvoiceDetail.tsx` | 🟡 MOCK | 🔴 |
| `/purchase-invoices/:id/edit` | ✅ | ✅ `PurchaseInvoiceEdit.tsx` | ✅ API | ✅ |

**Probleme:**
- 🔴 `PurchaseInvoiceDetail` nutzt komplett hardcodierte `purchaseInvoiceData` — KEINE API-Anbindung
- 🔴 `PurchaseInvoiceDetail` importiert NICHT `useNavigate` — "Bearbeiten" im Dropdown hat KEINE navigate-Logik
- ❌ `PurchaseInvoiceCreate` liest `supplierId` aus Query-Params NICHT

---

## 12. WARENEINGANG (`/goods-receipts`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/goods-receipts` | ✅ | ✅ | ✅ API | ✅ |
| `/goods-receipts/new` | ✅ | ✅ | ✅ API | ✅ |
| `/goods-receipts/:id` | ✅ | ✅ `GoodsReceiptDetail.tsx` | 🟡 MOCK | ⚠️ |

---

## 13. PRODUKTE (`/products`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/products` | ✅ | ✅ | ✅ API | ✅ |
| `/products/new` | ✅ | ✅ | ✅ API | ✅ |
| `/products/:id` | ✅ | ✅ `ProductDetail.tsx` | ✅ API | ✅ |
| `/products/:id/edit` | ✅ | ✅ `ProductEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- ✅ "Bearbeiten" Button → `navigate(\`/products/${id}/edit\`)`
- ⚠️ Dropdown: "Duplizieren", "Statistiken", "Deaktivieren" — alle ohne Logik
- ⚠️ "Wareneingang" Button ohne navigate-Logik

---

## 14. LAGER / INVENTAR (`/inventory`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/inventory` | ✅ | ✅ | ? | ⚠️ |
| `/inventory/new` | ❌ FEHLT | ❌ | - | ⚠️ (absichtlich) |
| `/inventory/:id` | ✅ | ✅ `InventoryItemDetail.tsx` | ? | ⚠️ |

---

## 15. AUFGABEN (`/tasks`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/tasks` | ✅ | ✅ | ✅ API | ✅ |
| `/tasks/new` | ✅ | ✅ `TaskCreate.tsx` | ✅ API | ✅ |
| `/tasks/:id` | ✅ | ✅ `TaskDetail.tsx` | ✅ API | ✅ |
| `/tasks/:id/edit` | ✅ | ✅ `TaskEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- ✅ "Bearbeiten" Button öffnet INLINE-Dialog (nicht navigate) → OK, eigene Logik
- ✅ Status-Änderung via Dropdown
- ✅ Kommentare, Unteraufgaben, Zeiterfassung, Anhänge — alles API-angebunden
- ❌ `TaskCreate` liest `projectId` aus Query-Params NICHT

---

## 16. MITARBEITER / HR (`/hr`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/hr` | ✅ | ✅ | ✅ API | ✅ |
| `/hr/new` | ✅ | ✅ `EmployeeCreate.tsx` | ✅ API | ✅ |
| `/hr/:id` | ✅ | ✅ `EmployeeDetail.tsx` | ✅ API | ✅ |
| `/hr/:id/edit` | ✅ | ✅ `EmployeeEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- 🔴 "Bearbeiten" Button ruft `handleEdit()` auf → zeigt nur `toast.info("Bearbeitungsmodus wird geladen...")` mit Kommentar `// In real app: navigate(\`/hr/${id}/edit\`)` → **ROUTE EXISTIERT ABER NAVIGATION FEHLT!**
- ❌ Edit-Navigation muss von Toast auf echtes `navigate(\`/hr/${id}/edit\`)` geändert werden

---

## 17. MITARBEITERVERTRÄGE (`/employee-contracts`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/employee-contracts` | ✅ | ✅ | ? | ⚠️ |
| `/employee-contracts/new` | ✅ | ✅ | ? | ⚠️ |
| `/employee-contracts/:id` | ✅ | ✅ `EmployeeContractDetail.tsx` | ? | ⚠️ |
| `/employee-contracts/:id/edit` | ❌ FEHLT | ❌ | - | ⚠️ |

---

## 18. LOHNABRECHNUNG (`/payroll`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/payroll` | ✅ | ✅ | ? | ⚠️ |
| `/payroll/new` | ✅ | ✅ `PayrollCreate.tsx` | ? | ⚠️ |
| `/payroll/:id` | ❌ FEHLT | ❌ | - | 🔴 |
| `/payslips/:id` | ✅ | ✅ `PayslipDetail.tsx` | 🟡 MOCK | ⚠️ |

**Problem:** Payroll hat keine Detail-Route. Payslip existiert aber nutzt Mock-Daten.

---

## 19. ABWESENHEITEN (`/absences`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/absences` | ✅ | ✅ | ? | ⚠️ |
| `/absences/new` | ✅ | ✅ | ? | ⚠️ |
| `/absences/:id` | ✅ | ✅ `AbsenceDetail.tsx` | 🟡 MOCK | ⚠️ |
| `/absences/:id/edit` | ❌ FEHLT | ❌ | - | ⚠️ |

---

## 20. ABTEILUNGEN (`/departments`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/departments` | ✅ | ✅ | ? | ⚠️ |
| `/departments/new` | ✅ | ✅ `DepartmentCreate.tsx` | ? | ⚠️ |
| `/departments/:id` | ❌ FEHLT | ❌ | - | 🔴 |

---

## 21. RECRUITING (`/recruiting`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/recruiting` | ✅ | ✅ | ? | ⚠️ |
| `/recruiting/new` | ✅ | ✅ `JobPostingCreate.tsx` | ? | ⚠️ |
| `/recruiting/:id` | ✅ | ✅ `CandidateDetail.tsx` | 🟡 MOCK | ⚠️ |

**Inkonsistenz:** Route heisst `/recruiting/:id` aber zeigt `CandidateDetail` — semantisch verwirrend.

---

## 22. SCHULUNGEN (`/training`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/training` | ✅ | ✅ | ? | ⚠️ |
| `/training/new` | ✅ | ✅ | ? | ⚠️ |
| `/training/:id` | ✅ | ✅ `TrainingDetail.tsx` | 🟡 MOCK | ⚠️ |
| `/training/:id/edit` | ❌ FEHLT | ❌ | - | ⚠️ |

**Navigation:** "Bearbeiten" Button öffnet INLINE-Dialog (kein navigate) — OK falls gewünscht.

---

## 23. VERTRÄGE (`/contracts`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/contracts` | ✅ | ✅ | ✅ API | ✅ |
| `/contracts/new` | ✅ | ✅ | ✅ API | ✅ |
| `/contracts/:id` | ✅ | ✅ `ContractDetail.tsx` | ✅ API | ✅ |
| `/contracts/:id/edit` | ✅ | ✅ `ContractEdit.tsx` | ✅ API | ✅ |

**Navigation auf Detail:**
- ⚠️ "Bearbeiten" Button öffnet INLINE-Dialog statt `navigate(\`/contracts/${id}/edit\`)` — Route existiert aber wird nicht genutzt
- ✅ Dropdown-Menü mit diversen Aktionen

---

## 24. ZAHLUNGEN (`/payments`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/payments` | ✅ | ✅ | ? | ⚠️ |
| `/payments/new` | ❌ FEHLT | ❌ | - | ⚠️ |
| `/payments/:id` | ✅ | ✅ `PaymentDetail.tsx` | ? | ⚠️ |

---

## 25. FINANZEN & BUCHHALTUNG

### Kontenplan (`/chart-of-accounts`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/chart-of-accounts` | ✅ | ? |
| `/chart-of-accounts/new` | ✅ | ? |
| `/chart-of-accounts/:id` | ✅ `ChartOfAccountDetail.tsx` | ? |

### Buchungsjournal (`/journal-entries`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/journal-entries` | ✅ | ? |
| `/journal-entries/:id` | ✅ `JournalEntryDetail.tsx` | 🟡 MOCK |

### Hauptbuch (`/general-ledger`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/general-ledger` | ✅ | ? |
| `/general-ledger/:id` | ✅ `GeneralLedgerDetail.tsx` | 🟡 MOCK |

### Offene Posten (`/open-items`)
| Route | Status |
|-------|--------|
| `/open-items` | ✅ |

### Bilanz (`/balance-sheet`)
| Route | Status |
|-------|--------|
| `/balance-sheet` | ✅ |

### MwSt-Meldungen (`/vat-returns`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/vat-returns` | ✅ | ? |
| `/vat-returns/:id` | ✅ `VatReturnDetail.tsx` | 🟡 MOCK |

### Anlagevermögen (`/fixed-assets`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/fixed-assets` | ✅ | ? |
| `/fixed-assets/new` | ✅ | ? |
| `/fixed-assets/:id` | ✅ `FixedAssetDetail.tsx` | 🟡 MOCK |
| `/fixed-assets/:id/edit` | ❌ FEHLT | - |

**Navigation:** "Bearbeiten" Button ohne onClick-Logik.

### Kassabuch (`/cash-book`)
| Route | Status |
|-------|--------|
| `/cash-book` | ✅ |
| `/cash-book/new` | ✅ |
| `/cash-book/:id` | ❌ FEHLT | 🔴 |

### Bankkonten (`/bank-accounts`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/bank-accounts` | ✅ | ? |
| `/bank-accounts/new` | ✅ | ? |
| `/bank-accounts/:id` | ✅ `BankAccountDetail.tsx` | 🟡 MOCK |
| `/bank-accounts/:id/edit` | ❌ FEHLT | - |

### SEPA-Zahlungen (`/sepa-payments`)
| Route | Status |
|-------|--------|
| `/sepa-payments` | ✅ |
| `/sepa-payments/:id` | ✅ `SepaPaymentDetail.tsx` | ? |

### Kostenstellen (`/cost-centers`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/cost-centers` | ✅ | ? |
| `/cost-centers/new` | ✅ | ? |
| `/cost-centers/:id` | ✅ `CostCenterDetail.tsx` | ? |
| `/cost-centers/:id/edit` | ❌ FEHLT | - |

### Budgets (`/budgets`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/budgets` | ✅ | ? |
| `/budgets/new` | ✅ | ? |
| `/budgets/:id` | ✅ `BudgetDetail.tsx` | 🟡 MOCK |
| `/budgets/:id/edit` | ❌ FEHLT | - |

---

## 26. MARKETING

### Kampagnen (`/campaigns`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/campaigns` | ✅ | ? |
| `/campaigns/new` | ✅ | ? |
| `/campaigns/:id` | ✅ `CampaignDetail.tsx` | 🟡 MOCK |
| `/campaigns/:id/edit` | ❌ FEHLT | - |

### Leads (`/leads`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/leads` | ✅ | ? |
| `/leads/new` | ✅ | ? |
| `/leads/:id` | ✅ `LeadDetail.tsx` | 🟡 MOCK |
| `/leads/:id/edit` | ❌ FEHLT | - |

### E-Mail Marketing (`/email-marketing`)
| Route | Status |
|-------|--------|
| `/email-marketing` | ✅ |
| `/email-marketing/new` | ✅ `EmailCreate.tsx` |

---

## 27. E-COMMERCE

### Shop (`/shop`)
| Route | Status |
|-------|--------|
| `/shop` | ✅ |

### Rabatte (`/discounts`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/discounts` | ✅ | ? |
| `/discounts/new` | ✅ | ? |
| `/discounts/:id` | ✅ `DiscountDetail.tsx` | 🟡 MOCK |
| `/discounts/:id/edit` | ❌ FEHLT | - |

**Navigation:** "Bearbeiten" Button ohne onClick-Logik.

### Bewertungen (`/reviews`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/reviews` | ✅ | ? |
| `/reviews/new` | ❌ FEHLT | - (absichtlich) |
| `/reviews/:id` | ✅ `ReviewDetail.tsx` | ? |

---

## 28. PRODUKTION

### Stücklisten (`/bom`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/bom` | ✅ | ? |
| `/bom/new` | ✅ | ? |
| `/bom/:id` | ✅ `BOMDetail.tsx` | 🟡 MOCK |
| `/bom/:id/edit` | ❌ FEHLT | - |

### Kalkulationen (`/calculation`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/calculation` | ✅ | ? |
| `/calculation/new` | ✅ | ? |
| `/calculation/:id` | ✅ `CalculationDetail.tsx` | 🟡 MOCK |
| `/calculation/:id/edit` | ❌ FEHLT | - |

### Produktionsaufträge (`/production`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/production` | ✅ | ? |
| `/production/new` | ✅ | ? |
| `/production/:id` | ✅ `ProductionDetail.tsx` | ? |
| `/production/:id/edit` | ❌ FEHLT | - |

---

## 29. SERVICE (`/service`)

| Route | Registriert | Seite existiert | Datenquelle | Status |
|-------|------------|-----------------|-------------|--------|
| `/service` | ✅ | ✅ | ? | ⚠️ |
| `/service/new` | ✅ | ✅ | ? | ⚠️ |
| `/service/:id` | ✅ | ✅ `ServiceDetail.tsx` | 🟡 MOCK | ⚠️ |
| `/service/:id/edit` | ❌ FEHLT | ❌ | - | ⚠️ |

**Navigation:** "Bearbeiten" öffnet INLINE-Dialog (kein navigate).

---

## 30. QUALITÄTSKONTROLLE (`/quality`)

| Route | Registriert | Seite existiert | Status |
|-------|------------|-----------------|--------|
| `/quality` | ✅ | ✅ `QualityControl.tsx` | ✅ |
| `/quality/new` | ✅ | ✅ `QualityCheckCreate.tsx` | ✅ |
| `/quality/:id` | ✅ | ✅ `QualityCheckDetail.tsx` | ✅ |
| `/quality/checklists` | ✅ | ✅ `QualityChecklists.tsx` | ✅ |
| `/quality/checklists/new` | ✅ | ✅ `QualityChecklistCreate.tsx` | ✅ |
| `/quality/checklists/:id` | ✅ | ✅ `QualityChecklistDetail.tsx` | ✅ |

---

## 31. ADMINISTRATION

### Benutzer (`/users`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/users` | ✅ | ✅ API |
| `/users/new` | ✅ | ✅ API |
| `/users/:id` | ✅ `UserDetail.tsx` | ✅ API |
| `/users/:id/edit` | ❌ FEHLT | - |

**Navigation:** "Bearbeiten" Button öffnet INLINE-Dialog — OK.

### Rollen (`/roles`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/roles` | ✅ | ? |
| `/roles/new` | ❌ FEHLT | - |
| `/roles/:id` | ✅ `RoleDetail.tsx` | ? |

**Navigation:** "Bearbeiten" Button ohne onClick-Logik.

### Firma (`/company`)
| Route | Status |
|-------|--------|
| `/company` | ✅ |
| `/company/edit` | ✅ |

### Einstellungen (`/settings`)
| Route | Status |
|-------|--------|
| `/settings` | ✅ |

### Audit-Log (`/audit-log`)
| Route | Status |
|-------|--------|
| `/audit-log` | ✅ |
| `/audit-log/:id` | ✅ `AuditLogDetail.tsx` |

### Benachrichtigungen (`/notifications`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/notifications` | ✅ | ✅ API |
| `/notifications/:id` | ✅ `NotificationDetail.tsx` | 🟡 MOCK |

---

## 32. WEITERE MODULE

### Zeiterfassung (`/time-tracking`)
| Route | Status |
|-------|--------|
| `/time-tracking` | ✅ |

### Kalender (`/calendar`)
| Route | Status |
|-------|--------|
| `/calendar` | ✅ API |

### Reisekosten (`/travel-expenses`)
| Route | Status | Datenquelle |
|-------|--------|-------------|
| `/travel-expenses` | ✅ | ? |
| `/travel-expenses/new` | ✅ | ? |
| `/travel-expenses/:id` | ✅ `TravelExpenseDetail.tsx` | 🟡 MOCK |

### Organigramm (`/orgchart`)
| Route | Status |
|-------|--------|
| `/orgchart` | ✅ |

### Dokumente (`/documents`)
| Route | Status |
|-------|--------|
| `/documents` | ✅ |
| `/documents/new` | ✅ `DocumentUpload.tsx` |
| `/documents/:id` | ✅ `DocumentDetail.tsx` |
| `/documents/:id/preview` | ✅ `DocumentPreview.tsx` |
| `/folders/:id` | ✅ `FolderDetail.tsx` |

### Spezial-Tools
| Route | Status |
|-------|--------|
| `/qr-invoice` | ✅ |
| `/bank-import` | ✅ |
| `/swissdec` | ✅ |
| `/withholding-tax` | ✅ |
| `/reports` | ✅ |
| `/finance` | ✅ |
| `/debtors` | ✅ |
| `/creditors` | ✅ |

---

# 📊 ZUSAMMENFASSUNG

## Detail-Seiten mit MOCK-Daten (kein API-Hook)

| Modul | Seite | Mock-Variable |
|-------|-------|---------------|
| Gutschriften | `CreditNoteDetail.tsx` | `creditNoteData` |
| Eingangsrechnungen | `PurchaseInvoiceDetail.tsx` | `purchaseInvoiceData` |
| Mahnungen | `ReminderDetail.tsx` | `mahnungData` |
| Wareneingang | `GoodsReceiptDetail.tsx` | `receiptData` |
| Buchungsjournal | `JournalEntryDetail.tsx` | `buchungData` |
| Hauptbuch | `GeneralLedgerDetail.tsx` | `ledgerData` |
| MwSt-Meldungen | `VatReturnDetail.tsx` | `vatReturnData` |
| Anlagevermögen | `FixedAssetDetail.tsx` | `assetData` |
| Bankkonten | `BankAccountDetail.tsx` | `bankAccountData` |
| Budgets | `BudgetDetail.tsx` | `budgetData` |
| Kampagnen | `CampaignDetail.tsx` | `campaignData` |
| Leads | `LeadDetail.tsx` | `leadData` |
| Rabatte | `DiscountDetail.tsx` | (Mock) |
| Stücklisten | `BOMDetail.tsx` | `bomData` |
| Kalkulationen | `CalculationDetail.tsx` | `kalkulationData` |
| Service-Tickets | `ServiceDetail.tsx` | `initialServiceData` |
| Schulungen | `TrainingDetail.tsx` | (Mock) |
| Abwesenheiten | `AbsenceDetail.tsx` | `abwesenheitData` |
| Recruiting | `CandidateDetail.tsx` | `kandidatData` |
| Lohnabrechnungen | `PayslipDetail.tsx` | `payslipData` |
| Reisekosten | `TravelExpenseDetail.tsx` | `initialSpesenData` |
| Benachrichtigungen | `NotificationDetail.tsx` | `notificationData` |
| Bestellungen (PO) | `PurchaseOrderDetail.tsx` | `initialPurchaseOrderData` |

**Total: 23 Detail-Seiten mit Mock-Daten**

## Fehlende Edit-Routen

| Modul | Route fehlt |
|-------|-------------|
| Mitarbeiterverträge | `/employee-contracts/:id/edit` |
| Abwesenheiten | `/absences/:id/edit` |
| Schulungen | `/training/:id/edit` |
| Bankkonten | `/bank-accounts/:id/edit` |
| Budgets | `/budgets/:id/edit` |
| Kostenstellen | `/cost-centers/:id/edit` |
| Anlagevermögen | `/fixed-assets/:id/edit` |
| Kampagnen | `/campaigns/:id/edit` |
| Leads | `/leads/:id/edit` |
| Rabatte | `/discounts/:id/edit` |
| Service-Tickets | `/service/:id/edit` |
| Produktion | `/production/:id/edit` |
| Stücklisten | `/bom/:id/edit` |
| Kalkulationen | `/calculation/:id/edit` |
| Benutzer | `/users/:id/edit` |
| Rollen | `/roles/:id/edit` |

**Total: 16 fehlende Edit-Routen**

## Fehlende Detail-Routen

| Modul | Route fehlt |
|-------|-------------|
| Abteilungen | `/departments/:id` |
| Lohnabrechnung | `/payroll/:id` |
| Kassabuch | `/cash-book/:id` |

## Broken Navigation (Buttons ohne Funktion)

| Seite | Button | Problem |
|-------|--------|---------|
| `EmployeeDetail` | "Bearbeiten" | Zeigt nur Toast statt navigate → 🔴 |
| `ContractDetail` | "Bearbeiten" | Öffnet Inline-Dialog statt navigate zu existierender Edit-Route |
| `OrderDetail` | "Lieferschein erstellen" | Kein onClick |
| `OrderDetail` | "Rechnung erstellen" | Kein onClick |
| `OrderDetail` | "Duplizieren" | Kein onClick |
| `PurchaseInvoiceDetail` | "Bearbeiten" | Kein navigate |
| `FixedAssetDetail` | "Bearbeiten" | Kein onClick |
| `DiscountDetail` | "Bearbeiten" | Kein onClick |
| `RoleDetail` | "Bearbeiten" | Kein onClick |

## Fehlende Query-Parameter-Unterstützung

| Von → Nach | Parameter | Status |
|------------|-----------|--------|
| Lieferant → Bestellung | `supplierId` | ❌ `PurchaseOrderCreate` liest nicht |
| Lieferant → Eingangsrechnung | `supplierId` | ❌ `PurchaseInvoiceCreate` liest nicht |
| Projekt → Aufgabe | `projectId` | ❌ `TaskCreate` liest nicht |
| Projekt → Rechnung | `projectId+customerId` | ❌ Nicht implementiert |
| Auftrag → Lieferschein | `orderId` | ❌ Button ohne Logik |
| Auftrag → Rechnung | `orderId` | ❌ Button ohne Logik |

---

# 📌 PRIORITÄTS-REIHENFOLGE FÜR FRONTEND (Lovable)

### Phase 1: Kritische Navigation-Fixes
1. `EmployeeDetail` → "Bearbeiten" auf `navigate(\`/hr/${id}/edit\`)` ändern
2. `OrderDetail` → "Lieferschein erstellen" Button mit `navigate(\`/delivery-notes/new?orderId=${id}\`)` verbinden
3. `OrderDetail` → "Rechnung erstellen" Button mit `navigate(\`/invoices/new?orderId=${id}\`)` verbinden
4. `PurchaseInvoiceDetail` → Komplett auf API umbauen + navigate zu Edit
5. `ContractDetail` → "Bearbeiten" auf navigate zu `/contracts/:id/edit` umstellen (Route existiert!)

### Phase 2: Query-Parameter in Create-Seiten
1. `PurchaseOrderCreate` → `supplierId` aus URL lesen
2. `PurchaseInvoiceCreate` → `supplierId` aus URL lesen
3. `TaskCreate` → `projectId` aus URL lesen

### Phase 3: Fehlende Detail-Seiten
1. `DepartmentDetail` → `/departments/:id`
2. `PayrollDetail` → `/payroll/:id`
3. `CashBookDetail` → `/cash-book/:id`

### Phase 4: Mock-Daten durch API ersetzen (23 Seiten)
Priorität nach Nutzung:
1. CreditNoteDetail, PurchaseOrderDetail, ReminderDetail
2. GoodsReceiptDetail, BankAccountDetail, BudgetDetail
3. Alle weiteren

---

# 🤖 CURSOR-PROMPT (Backend)

```
Cursor-Aufgabe: Backend CRUD-Vollständigkeit sicherstellen

Stelle sicher, dass für ALLE folgenden Module die vollständigen CRUD-Endpunkte korrekt funktionieren.

## 1. PUT-Endpunkte (Update) — Pflicht für alle Module mit Edit-Seite

Bereits existierende Edit-Seiten (Frontend):
- PUT /api/suppliers/:id
- PUT /api/quotes/:id  
- PUT /api/orders/:id
- PUT /api/tasks/:id
- PUT /api/products/:id
- PUT /api/purchase-orders/:id
- PUT /api/purchase-invoices/:id
- PUT /api/employees/:id
- PUT /api/contracts/:id
- PUT /api/invoices/:id
- PUT /api/delivery-notes/:id
- PUT /api/credit-notes/:id
- PUT /api/projects/:id
- PUT /api/customers/:id

Für jeden Endpunkt prüfe:
- DTO ist vollständig (PartialType von CreateDTO)
- Validierung korrekt
- Service-Methode existiert
- Prisma-Query korrekt

## 2. Fehlende GET-Detail-Endpunkte

Prüfe ob diese existieren und korrekte Daten liefern:
- GET /api/departments/:id (inkl. Mitarbeiterliste)
- GET /api/payroll/:id (Lohnabrechnungsdetails)
- GET /api/cash-book/:id (Kassabuch-Eintrag)

## 3. Detail-Endpunkte die ALLE Relationen includen müssen

- GET /api/purchase-orders/:id → muss supplier, items includen
- GET /api/purchase-invoices/:id → muss supplier, items includen  
- GET /api/credit-notes/:id → muss customer, items includen
- GET /api/goods-receipts/:id → muss supplier, items includen
- GET /api/reminders/:id → muss customer, invoice includen

## 4. Query-Parameter-Support in POST-Endpunkten

Alle POST-Endpunkte müssen folgende optionale Body-Felder akzeptieren:
- POST /api/purchase-orders → `supplierId` im Body
- POST /api/purchase-invoices → `supplierId` im Body
- POST /api/tasks → `projectId` im Body
- POST /api/invoices → `projectId` UND `customerId` im Body
- POST /api/delivery-notes → `orderId` im Body

## 5. Validierung

- Alle Update-DTOs nutzen `PartialType()` von CreateDTOs
- Ungültige IDs liefern korrekte 404-Responses
- Auth-Guards auf allen Endpunkten aktiv
- Company-Tenant-Filter auf allen Queries

**WICHTIG:** Kein Frontend-Code ändern. Nur `/backend` Verzeichnis.
```

---

# 🎨 LOVABLE-PROMPT (Frontend)

```
Lovable-Aufgabe: Frontend Navigation & Datenanbindung komplett machen

## Schritt 1: Kritische Navigation-Fixes (SOFORT)

### 1.1 EmployeeDetail.tsx — Bearbeiten-Button fixen
Die `handleEdit()` Funktion zeigt nur einen Toast. Ändere sie zu:
navigate(`/hr/${id}/edit`)

### 1.2 OrderDetail.tsx — Buttons verbinden
- "Lieferschein erstellen" Button → onClick: navigate(`/delivery-notes/new?orderId=${id}&customerId=${orderData.customer.id}`)
- "Rechnung erstellen" Button → onClick: navigate(`/invoices/new?orderId=${id}&customerId=${orderData.customer.id}`)

### 1.3 ContractDetail.tsx — Edit-Navigation
"Bearbeiten" Button soll navigate(`/contracts/${id}/edit`) statt Inline-Dialog nutzen (Route existiert bereits!)

### 1.4 PurchaseInvoiceDetail.tsx — Bearbeiten-Link
- Importiere `useNavigate`
- "Bearbeiten" im Dropdown → onClick: navigate(`/purchase-invoices/${id}/edit`)

## Schritt 2: Query-Parameter in Create-Seiten

### 2.1 PurchaseOrderCreate.tsx
- `useSearchParams` hinzufügen
- `supplierId` aus URL lesen und als Default setzen

### 2.2 PurchaseInvoiceCreate.tsx
- `useSearchParams` hinzufügen
- `supplierId` aus URL lesen und als Default setzen

### 2.3 TaskCreate.tsx
- `useSearchParams` hinzufügen
- `projectId` aus URL lesen und als Default setzen

## Schritt 3: Fehlende Detail-Seiten erstellen

### 3.1 DepartmentDetail.tsx → `/departments/:id`
- Nutze `useQuery` mit `/departments/${id}`
- Zeige Abteilungsinformationen und Mitarbeiterliste

### 3.2 PayrollDetail.tsx → `/payroll/:id`
- Nutze `useQuery` mit `/payroll/${id}`

### 3.3 CashBookDetail.tsx → `/cash-book/:id`
- Nutze `useQuery` mit `/cash-book/${id}`

Registriere alle 3 neuen Routen in App.tsx.

## Schritt 4: Buttons ohne Funktion fixen

Auf jeder Detail-Seite: Prüfe ob "Bearbeiten", "Duplizieren", "Löschen" Buttons eine onClick-Logik haben.
Falls nicht → füge sie hinzu (navigate oder API-Call).

## REGELN:
- Jede neue/geänderte Seite muss Daten via API-Hook laden
- Kein CSS/Design ändern
- Bestehende Hooks aus /src/hooks/ verwenden
- Keine Mock-Daten in neuen Seiten
```
