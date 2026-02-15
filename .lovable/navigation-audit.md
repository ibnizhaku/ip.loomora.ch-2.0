# 🔍 Loomora ERP — Navigation & Routing Audit

> Erstellt: 2026-02-15
> Zweck: Vollständige Analyse aller Routen, Navigationspfade, fehlende Seiten und Edge Cases

---

## 📋 LEGENDE

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | OK — Route existiert und ist korrekt verknüpft |
| ❌ | FEHLT — Route oder Seite existiert nicht |
| ⚠️ | PRÜFEN — Potenzielles Problem, manuell verifizieren |
| 🔴 | KRITISCH — Broken Navigation, Error Page beim Klicken |

---

## 1. FEHLENDE EDIT-ROUTEN (/:id/edit)

Die meisten Module haben Detail-Seiten, aber **keine Edit-Route**. Wenn ein "Bearbeiten"-Button auf der Detailseite existiert und zu `/:id/edit` navigiert, kommt eine Error- oder 404-Seite.

| Modul | List | Create | Detail | Edit | Status |
|-------|------|--------|--------|------|--------|
| **Projekte** | ✅ `/projects` | ✅ `/projects/new` | ✅ `/projects/:id` | ✅ `/projects/:id/edit` | ✅ OK |
| **Kunden** | ✅ `/customers` | ✅ `/customers/new` | ✅ `/customers/:id` | ✅ `/customers/:id/edit` | ✅ OK |
| **Rechnungen** | ✅ `/invoices` | ✅ `/invoices/new` | ✅ `/invoices/:id` | ✅ `/invoices/:id/edit` | ✅ OK |
| **Lieferscheine** | ✅ `/delivery-notes` | ✅ `/delivery-notes/new` | ✅ `/delivery-notes/:id` | ✅ `/delivery-notes/:id/edit` | ✅ OK |
| **Gutschriften** | ✅ `/credit-notes` | ✅ `/credit-notes/new` | ✅ `/credit-notes/:id` | ✅ `/credit-notes/:id/edit` | ✅ OK |
| **Lieferanten** | ✅ `/suppliers` | ✅ `/suppliers/new` | ✅ `/suppliers/:id` | ❌ FEHLT | 🔴 KRITISCH |
| **Angebote** | ✅ `/quotes` | ✅ `/quotes/new` | ✅ `/quotes/:id` | ❌ FEHLT | 🔴 KRITISCH |
| **Aufträge** | ✅ `/orders` | ✅ `/orders/new` | ✅ `/orders/:id` | ❌ FEHLT | 🔴 KRITISCH |
| **Aufgaben** | ✅ `/tasks` | ✅ `/tasks/new` | ✅ `/tasks/:id` | ❌ FEHLT | 🔴 KRITISCH |
| **Produkte** | ✅ `/products` | ✅ `/products/new` | ✅ `/products/:id` | ❌ FEHLT | 🔴 KRITISCH |
| **Bestellungen** | ✅ `/purchase-orders` | ✅ `/purchase-orders/new` | ✅ `/purchase-orders/:id` | ❌ FEHLT | 🔴 KRITISCH |
| **Eingangsrechnungen** | ✅ `/purchase-invoices` | ✅ `/purchase-invoices/new` | ✅ `/purchase-invoices/:id` | ❌ FEHLT | 🔴 KRITISCH |
| **Mitarbeiter** | ✅ `/hr` | ✅ `/hr/new` | ✅ `/hr/:id` | ❌ FEHLT | 🔴 KRITISCH |
| **Verträge** | ✅ `/contracts` | ✅ `/contracts/new` | ✅ `/contracts/:id` | ❌ FEHLT | 🔴 KRITISCH |
| **Bankkonten** | ✅ `/bank-accounts` | ✅ `/bank-accounts/new` | ✅ `/bank-accounts/:id` | ❌ FEHLT | ⚠️ |
| **Budgets** | ✅ `/budgets` | ✅ `/budgets/new` | ✅ `/budgets/:id` | ❌ FEHLT | ⚠️ |
| **Kostenstellen** | ✅ `/cost-centers` | ✅ `/cost-centers/new` | ✅ `/cost-centers/:id` | ❌ FEHLT | ⚠️ |
| **Anlagevermögen** | ✅ `/fixed-assets` | ✅ `/fixed-assets/new` | ✅ `/fixed-assets/:id` | ❌ FEHLT | ⚠️ |
| **Kampagnen** | ✅ `/campaigns` | ✅ `/campaigns/new` | ✅ `/campaigns/:id` | ❌ FEHLT | ⚠️ |
| **Leads** | ✅ `/leads` | ✅ `/leads/new` | ✅ `/leads/:id` | ❌ FEHLT | ⚠️ |
| **Rabatte** | ✅ `/discounts` | ✅ `/discounts/new` | ✅ `/discounts/:id` | ❌ FEHLT | ⚠️ |
| **Service-Tickets** | ✅ `/service` | ✅ `/service/new` | ✅ `/service/:id` | ❌ FEHLT | ⚠️ |
| **Produktion** | ✅ `/production` | ✅ `/production/new` | ✅ `/production/:id` | ❌ FEHLT | ⚠️ |
| **Stücklisten** | ✅ `/bom` | ✅ `/bom/new` | ✅ `/bom/:id` | ❌ FEHLT | ⚠️ |
| **Kalkulationen** | ✅ `/calculation` | ✅ `/calculation/new` | ✅ `/calculation/:id` | ❌ FEHLT | ⚠️ |
| **Schulungen** | ✅ `/training` | ✅ `/training/new` | ✅ `/training/:id` | ❌ FEHLT | ⚠️ |
| **Abwesenheiten** | ✅ `/absences` | ✅ `/absences/new` | ✅ `/absences/:id` | ❌ FEHLT | ⚠️ |
| **MA-Verträge** | ✅ `/employee-contracts` | ✅ `/employee-contracts/new` | ✅ `/employee-contracts/:id` | ❌ FEHLT | ⚠️ |
| **Benutzer** | ✅ `/users` | ✅ `/users/new` | ✅ `/users/:id` | ❌ FEHLT | ⚠️ |
| **Rollen** | ✅ `/roles` | — | ✅ `/roles/:id` | ❌ FEHLT | ⚠️ |

---

## 2. FEHLENDE DETAIL-ROUTEN

| Modul | Route existiert? | Problem |
|-------|-----------------|---------|
| **Abteilungen** | ❌ `/departments/:id` FEHLT | Detail-Seite nicht erreichbar, nur Create vorhanden |
| **Lohnabrechnung** | ❌ `/payroll/:id` FEHLT | Nur `/payroll` und `/payroll/new`, kein Detail |
| **Wareneingang** | ✅ `/goods-receipts/:id` | OK |
| **Lager** | ✅ `/inventory/:id` | OK |
| **Kassabuch** | ❌ `/cash-book/:id` FEHLT | Nur `/cash-book` und `/cash-book/new` |
| **SEPA** | ✅ `/sepa-payments/:id` | OK |
| **MwSt-Meldungen** | ✅ `/vat-returns/:id` | OK |

---

## 3. MODULE OHNE CREATE-ROUTE

| Modul | List-Route | Create? | Problem |
|-------|-----------|---------|---------|
| **Zahlungen** | `/payments` | ❌ FEHLT `/payments/new` | Kein Button für neue Zahlung? |
| **Mahnungen** | `/reminders` | ❌ FEHLT `/reminders/new` | Mahnungen werden evtl. automatisch erstellt |
| **Lager/Inventar** | `/inventory` | ❌ FEHLT `/inventory/new` | Inventar wird über Produkte gesteuert |
| **Bewertungen** | `/reviews` | ❌ FEHLT `/reviews/new` | E-Commerce Reviews kommen extern |
| **Rollen** | `/roles` | ❌ FEHLT `/roles/new` | ⚠️ PRÜFEN ob Rollen-Erstellung nötig |

---

## 4. KONTEXTSENSITIVE NAVIGATION (Query-Parameter)

### Bereits implementiert ✅
| Von | Nach | Parameter | Status |
|-----|------|-----------|--------|
| Kunden-Detail | `/quotes/new` | `?customerId=` | ✅ OK |
| Kunden-Detail | `/invoices/new` | `?customerId=` | ✅ OK |
| Kunden-Detail | `/orders/new` | `?customerId=` | ✅ OK |
| Kunden-Detail | `/projects/new` | `?customerId=` | ✅ OK |
| Kunden-Detail | `/delivery-notes/new` | `?customerId=` | ✅ OK |

### Fehlend ❌
| Von | Nach | Erwarteter Parameter | Status |
|-----|------|---------------------|--------|
| Lieferanten-Detail | `/purchase-orders/new` | `?supplierId=` | ❌ FEHLT |
| Lieferanten-Detail | `/purchase-invoices/new` | `?supplierId=` | ❌ FEHLT |
| Projekt-Detail | `/tasks/new` | `?projectId=` | ❌ PRÜFEN |
| Projekt-Detail | `/invoices/new` | `?projectId=&customerId=` | ❌ PRÜFEN |
| Projekt-Detail | `/time-tracking` | `?projectId=` | ❌ PRÜFEN |
| Produkt-Detail | `/bom/new` | `?productId=` | ❌ PRÜFEN |
| Produkt-Detail | `/inventory/:id` | automatisch | ⚠️ PRÜFEN |

---

## 5. NAVIGATION OHNE ZIEL (Sackgassen)

### Potenzielle Probleme auf Detail-Seiten

| Seite | Aktion / Button | Erwartetes Ziel | Problem |
|-------|----------------|-----------------|---------|
| **SupplierDetail** | "Bearbeiten" | `/suppliers/:id/edit` | ❌ Route fehlt |
| **QuoteDetail** | "Bearbeiten" | `/quotes/:id/edit` | ❌ Route fehlt |
| **OrderDetail** | "Bearbeiten" | `/orders/:id/edit` | ❌ Route fehlt |
| **TaskDetail** | "Bearbeiten" | `/tasks/:id/edit` | ❌ Route fehlt |
| **ProductDetail** | "Bearbeiten" | `/products/:id/edit` | ❌ Route fehlt |
| **EmployeeDetail** | "Bearbeiten" | `/hr/:id/edit` | ❌ Route fehlt |
| **ContractDetail** | "Bearbeiten" | `/contracts/:id/edit` | ❌ Route fehlt |
| **PurchaseOrderDetail** | "Bearbeiten" | `/purchase-orders/:id/edit` | ❌ Route fehlt |
| **PurchaseInvoiceDetail** | "Bearbeiten" | `/purchase-invoices/:id/edit` | ❌ Route fehlt |

---

## 6. EDGE CASES & ERROR HANDLING

| Prüfpunkt | Status | Details |
|-----------|--------|---------|
| 404-Seite | ✅ | `NotFound` Component bei `path="*"` |
| Error Boundary | ✅ | `PageErrorBoundary` in `ProtectedLayout` |
| Auth Guard | ✅ | `ProtectedRoute` wrapper |
| Ungültige IDs | ⚠️ | Hooks zeigen Fehler, aber UI-Feedback prüfen |
| Leere Listen | ⚠️ | Empty States in Listenseiten prüfen |
| Loading States | ⚠️ | Skeleton/Spinner pro Seite prüfen |

---

## 7. ROUTING-INKONSISTENZEN

| Problem | Details |
|---------|---------|
| HR-Pfad | Mitarbeiter unter `/hr/:id` statt `/employees/:id` — inkonsistent mit REST-Konvention |
| Quality Sub-Routen | `/quality/checklists` als verschachtelte Route — OK aber unüblich |
| Recruiting Detail | `/recruiting/:id` zeigt `CandidateDetail` — semantisch verwirrend (Job vs. Candidate) |

---

# 🔧 ZUSAMMENFASSUNG

| Kategorie | Anzahl | Schwere |
|-----------|--------|---------|
| Fehlende Edit-Routen | **~25 Module** | 🔴 9 KRITISCH, 16 MITTEL |
| Fehlende Detail-Routen | **3** | 🟡 MITTEL |
| Fehlende Create-Routen | **5** | 🟡 MITTEL (teils absichtlich) |
| Fehlende Query-Params | **~7** | 🟡 MITTEL |
| Sackgassen-Buttons | **~9** | 🔴 KRITISCH |
| Routing-Inkonsistenzen | **3** | 🟡 NIEDRIG |

---

# 📌 PRIORITÄTS-REIHENFOLGE

### Phase 1: Kritische Edit-Routen (Lovable — Frontend)
Erstelle Edit-Seiten und registriere Routen für:
1. Lieferanten (`/suppliers/:id/edit`)
2. Angebote (`/quotes/:id/edit`)
3. Aufträge (`/orders/:id/edit`)
4. Aufgaben (`/tasks/:id/edit`)
5. Produkte (`/products/:id/edit`)
6. Bestellungen (`/purchase-orders/:id/edit`)
7. Eingangsrechnungen (`/purchase-invoices/:id/edit`)
8. Mitarbeiter (`/hr/:id/edit`)
9. Verträge (`/contracts/:id/edit`)

### Phase 2: Fehlende Detail-Routen (Lovable — Frontend)
- `/departments/:id`
- `/payroll/:id`
- `/cash-book/:id`

### Phase 3: Kontextsensitive Navigation (Lovable — Frontend)
- Lieferanten-Detail → Bestellungen/Eingangsrechnungen mit `?supplierId=`
- Projekt-Detail → Tasks/Rechnungen mit `?projectId=`

### Phase 4: Edge Case Handling (Lovable — Frontend)
- Loading/Error States überall prüfen
- Empty States für leere Listen
- Ungültige URL-Parameter abfangen

---

# 🤖 CURSOR-PROMPT (Backend)

```
Cursor-Aufgabe: Backend-Routing & Endpunkt-Validierung

Prüfe und stelle sicher, dass für ALLE folgenden Module die vollständigen CRUD-Endpunkte im Backend existieren und korrekt funktionieren:

1. **PUT-Endpunkte (Update)** für:
   - PUT /suppliers/:id
   - PUT /quotes/:id
   - PUT /orders/:id
   - PUT /tasks/:id
   - PUT /products/:id
   - PUT /purchase-orders/:id
   - PUT /purchase-invoices/:id
   - PUT /employees/:id (bzw. HR)
   - PUT /contracts/:id
   - PUT /bank-accounts/:id
   - PUT /budgets/:id
   - PUT /cost-centers/:id
   - PUT /fixed-assets/:id
   - PUT /campaigns/:id
   - PUT /leads/:id
   - PUT /discounts/:id
   - PUT /service/:id (Service-Tickets)
   - PUT /production/:id
   - PUT /bom/:id
   - PUT /calculation/:id
   - PUT /training/:id
   - PUT /absences/:id
   - PUT /employee-contracts/:id
   - PUT /users/:id
   - PUT /roles/:id

   Für jeden Endpunkt prüfe:
   - DTO ist vollständig und hat alle Felder die das Frontend senden könnte
   - Validierung ist korrekt
   - Service-Methode existiert und funktioniert
   - Prisma-Query ist korrekt (update mit richtigen Feldern)

2. **Fehlende Detail-Endpunkte:**
   - GET /departments/:id — existiert der Endpunkt? Wenn nicht, erstellen
   - GET /payroll/:id — existiert der Endpunkt?
   - GET /cash-book/:id — existiert der Endpunkt?

3. **Query-Parameter-Support:**
   - POST /purchase-orders — muss `supplierId` im Body akzeptieren
   - POST /purchase-invoices — muss `supplierId` im Body akzeptieren
   - POST /tasks — muss `projectId` im Body akzeptieren
   - POST /invoices — muss `projectId` UND `customerId` im Body akzeptieren

4. **Validierung:**
   - Stelle sicher, dass alle Update-DTOs `PartialType()` von den Create-DTOs verwenden
   - Stelle sicher, dass ungültige IDs korrekte 404-Responses liefern
   - Stelle sicher, dass Auth-Guards auf allen Endpunkten aktiv sind

**WICHTIG:** Kein Frontend-Code (`/src`) ändern. Nur `/backend` Verzeichnis bearbeiten.
```

---

# 🎨 LOVABLE-PROMPT (Frontend)

```
Lovable-Aufgabe: Frontend Navigation & Edit-Seiten komplett machen

Arbeite die folgenden Punkte NACHEINANDER ab. Überspringe NICHTS.

## Schritt 1: Edit-Seiten erstellen (9 kritische Module)

Für JEDES der folgenden Module:
1. Erstelle eine `[Modul]Edit.tsx` Seite in `/src/pages/`
2. Die Seite lädt die bestehenden Daten via `use[Modul](id)` Hook
3. Zeigt ein vorausgefülltes Formular (gleich wie Create, aber mit bestehenden Werten)
4. Speichert über `useUpdate[Modul]()` Hook
5. Registriere die Route `/[modul]/:id/edit` in `App.tsx`

Module (in dieser Reihenfolge):
1. SupplierEdit → `/suppliers/:id/edit`
2. QuoteEdit → `/quotes/:id/edit`
3. OrderEdit → `/orders/:id/edit`
4. TaskEdit → `/tasks/:id/edit`
5. ProductEdit → `/products/:id/edit`
6. PurchaseOrderEdit → `/purchase-orders/:id/edit`
7. PurchaseInvoiceEdit → `/purchase-invoices/:id/edit`
8. EmployeeEdit → `/hr/:id/edit`
9. ContractEdit → `/contracts/:id/edit`

## Schritt 2: Fehlende Detail-Seiten (3 Module)

1. DepartmentDetail → `/departments/:id` — zeige Abteilungsinfos und Mitarbeiterliste
2. PayrollDetail → `/payroll/:id` — zeige Lohnabrechnungsdetails
3. CashBookDetail → `/cash-book/:id` — zeige Kassabuch-Eintrag

## Schritt 3: Kontextsensitive Navigation erweitern

Auf der **Lieferanten-Detailseite** (`SupplierDetail.tsx`):
- "Neue Bestellung" Button → `navigate('/purchase-orders/new?supplierId=${id}')`
- "Neue Eingangsrechnung" Button → `navigate('/purchase-invoices/new?supplierId=${id}')`
- "Bearbeiten" Button → `navigate('/suppliers/${id}/edit')`
- Kontakt-Dialog implementieren (wie bei CustomerDetail)

Auf der **Projekt-Detailseite** (`ProjectDetail.tsx`):
- "Neue Aufgabe" Button → `navigate('/tasks/new?projectId=${id}')`
- "Neue Rechnung" Button → `navigate('/invoices/new?projectId=${id}&customerId=${project.customerId}')`

Die Ziel-Create-Seiten müssen den Query-Parameter auslesen und vorauswählen:
- `PurchaseOrderCreate.tsx` → `supplierId` aus URL lesen
- `PurchaseInvoiceCreate.tsx` → `supplierId` aus URL lesen
- `TaskCreate.tsx` → `projectId` aus URL lesen

## Schritt 4: Detail-Seiten — Bearbeiten-Buttons prüfen

Gehe durch JEDE Detail-Seite und prüfe:
- Hat die Seite einen "Bearbeiten" Button?
- Navigiert er zu `/${modul}/${id}/edit`?
- Existiert die Route?

Falls ein Bearbeiten-Button fehlt oder die Route nicht existiert → ergänze beides.

## Schritt 5: Drei-Punkte-Menüs auf Detail-Seiten

Prüfe auf JEDER Detail-Seite:
- Sind Aktionen im Dropdown-Menü korrekt verknüpft?
- Funktionieren "Duplizieren", "Löschen", "Status ändern" etc.?
- Navigieren kontextsensitive Links (z.B. "Rechnung erstellen" auf Auftragsdetail) mit korrekten Query-Params?

## WICHTIG:
- Erstelle KEINE leeren Platzhalter-Seiten
- Jede Edit-Seite muss Daten laden und speichern können
- Benutze die bestehenden Hooks aus `/src/hooks/`
- Behalte das bestehende Design und CSS bei
- Teste jeden navigate()-Aufruf mental auf Korrektheit
```
