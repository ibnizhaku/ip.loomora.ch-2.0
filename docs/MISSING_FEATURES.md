# Fehlende Backend-Features - Phase 2B Analyse

**Analysiert:** 11.02.2026  
**Scope:** 31 Priority-Module  
**Methodik:** Backend-Controller vs. Frontend-Hooks Vergleich

---

## 📊 Executive Summary

| Status | Anzahl Module | Details |
|---|---|---|
| ✅ **Vollständig** | 25 Module | Alle Endpoints vorhanden, Frontend matcht Backend |
| ⚠️ **HIGH Priority** | 1 Modul | Fehlende Endpoints (404-Risiko) |
| 🟡 **MEDIUM Priority** | 4 Module | Query-Param-Mismatches, fehlende optionale Hooks |
| 🟢 **LOW Priority** | 1 Modul | Nur Hinweise, keine Fixes nötig |

---

## 🚨 HIGH PRIORITY - Sofort fixen (404-Risiko)

### **Bank-Import** (`/modules/bank-import`)

| Frontend-Hook Methode | Erwarteter Endpoint | Backend Status | Priorität |
|---|---|---|---|
| `useBankTransaction(id)` | `GET /bank-import/transactions/:id` | ❌ **FEHLT** | **HIGH** |
| `useAutoReconcile()` | `POST /bank-import/auto-reconcile` | ❌ **FEHLT** | **HIGH** |

**Impact:**
- Frontend kann einzelne Bank-Transaktionen nicht laden (Detail-Seite crasht)
- Auto-Reconcile-Feature nicht nutzbar

**Fix-Aufwand:** ~20 Minuten  
**Action:** Sofort implementieren (siehe unten)

---

## 🟡 MEDIUM PRIORITY - Query-Param & Hook-Mismatches

### **Marketing** (`/modules/marketing`)

| Issue | Backend | Frontend | Priorität |
|---|---|---|---|
| **Leads Query-Params** | `status`, `source` | `assignedToId`, `campaignId` | MEDIUM |
| **Email Campaigns Hooks** | CRUD vorhanden | Nur `useEmailCampaigns`, `useCreateEmailCampaign`, `useSendEmailCampaign` | MEDIUM |

**Fehlende Frontend-Hooks** (Backend existiert):
- `useEmailCampaign(id)` → `GET /marketing/email-campaigns/:id`
- `useUpdateEmailCampaign()` → `PUT /marketing/email-campaigns/:id`
- `useDeleteEmailCampaign()` → `DELETE /marketing/email-campaigns/:id`

**Fix-Optionen:**
1. Backend erweitern: Leads-Query um `assignedToId`, `campaignId` ergänzen
2. **ODER:** Frontend-Hooks anpassen (später, wenn Frontend-Änderungen erlaubt)

**Fix-Aufwand:** ~15 Minuten Backend + später Frontend  
**Action:** Backend Query-Params ergänzen

---

### **E-Commerce** (`/modules/ecommerce`)

| Issue | Backend | Frontend | Priorität |
|---|---|---|---|
| **Reviews Query-Params** | `status`, `productId` | `isApproved` | MEDIUM |
| **Shop Order Create** | `POST /ecommerce/orders` | Kein `useCreateShopOrder` Hook | MEDIUM |

**Fix-Optionen:**
1. Backend `isApproved` als Alias für `status=APPROVED` akzeptieren
2. **ODER:** Frontend später anpassen

**Fix-Aufwand:** ~10 Minuten  
**Action:** Backend Query-Param-Alias hinzufügen

---

### **Time-Entries** (`/modules/time-entries`)

| Issue | Details | Priorität |
|---|---|---|
| **employeeId Scope** | Backend: User-scoped (GET `/`) vs. Admin-scoped (GET `/all`). Frontend sendet `employeeId` in Query. | MEDIUM |

**Hinweis:**
- Backend `findAll()` ist auf den eingeloggten User beschränkt
- Backend `findAllEmployees()` (Route `/all`) zeigt alle Time-Entries der Company
- Frontend `useTimeEntries({ employeeId })` könnte erwarten, dass `employeeId` als Filter funktioniert

**Fix-Optionen:**
1. Backend `/` um `employeeId`-Filter ergänzen (für Admins)
2. **ODER:** Frontend nutzt `/all` für Admin-Views

**Fix-Aufwand:** ~10 Minuten  
**Action:** Backend Query-Param ergänzen oder Doku klären

---

### **Absences** (`/modules/absences`)

| Issue | Details | Priorität |
|---|---|---|
| **Query-Params** | Backend nutzt `AbsenceQueryDto`, Frontend sendet `employeeId`, `type`, `status`, `startDate`, `endDate` | MEDIUM |

**Action:** DTO-Definition prüfen und verifizieren, dass alle Frontend-Params akzeptiert werden

---

## 🟢 LOW PRIORITY - Hinweise (kein Fix nötig)

### **Recruiting** (`/modules/recruiting`)

**Hinweis:** Keine `GET /recruiting/interviews` Endpoint. Interviews werden via Relations geladen (`job.interviews`). Design-Entscheidung, kein Fehler.

---

### **Training** (`/modules/training`)

**Hinweis:** Route-Ordering prüfen (`GET /employee/:employeeId` muss vor `GET /:id` stehen). Aktuell korrekt.

---

### **VAT Returns** (`/modules/vat-returns`)

**Hinweis:** Route-Ordering prüfen (`GET /summary/:year` vor `GET /:id`). Aktuell korrekt.

---

## ✅ Vollständig implementierte Module (25)

Diese Module haben **keine fehlenden Features**:

- ✅ delivery-notes
- ✅ credit-notes
- ✅ contracts
- ✅ payments
- ✅ purchase-orders
- ✅ purchase-invoices
- ✅ goods-receipts
- ✅ cash-book
- ✅ fixed-assets
- ✅ budgets
- ✅ cost-centers
- ✅ bom
- ✅ production-orders
- ✅ calculations
- ✅ quality-control
- ✅ service-tickets
- ✅ calendar
- ✅ reports
- ✅ audit-log
- ✅ finance
- ✅ journal-entries
- ✅ reminders
- ✅ swissdec
- ✅ withholding-tax
- ✅ **+ Customers, Products, Invoices** (Stats jetzt vorhanden)

---

## 🎯 Umsetzungsplan

### **Sofort (HIGH):**
1. ✅ **Stats-Endpoints** (Customers, Products, Invoices) - **BEREITS ERLEDIGT**
2. ⏳ **Bank-Import** - 2 fehlende Endpoints implementieren

### **Danach (MEDIUM):**
3. Marketing - Query-Params ergänzen
4. E-Commerce - Query-Param-Alias
5. Time-Entries - employeeId-Filter
6. Absences - DTO-Prüfung

### **Optional (LOW):**
7. Route-Orderings verifizieren
8. Frontend-Hooks ergänzen (später, wenn Frontend-Änderungen erlaubt)

---

**Geschätzter Gesamt-Aufwand für HIGH + MEDIUM:** ~1-2 Stunden
