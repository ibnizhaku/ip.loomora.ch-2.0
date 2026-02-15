# Verwaltung – Vollständiger Modul-Audit

> Erstellt: 2026-02-15  
> Status: Analyse abgeschlossen  

---

## 📊 Gesamtübersicht

| Modul | Übersicht | Detail | Create | Edit | Routing OK | 3-Punkt-Menü OK | Mock-Daten |
|-------|:---------:|:------:|:------:|:----:|:----------:|:---------------:|:----------:|
| Zeiterfassung | ✅ | ❌ kein Detail | ✅ Dialog | ❌ | ⚠️ | ✅ | ⚠️ Teilweise |
| Einkauf (PO) | ✅ | ✅ | ✅ | ⚠️ Redirect | ✅ | ❌ | ⚠️ Detail=Mock |
| Einkaufsrechnungen | ✅ | ✅ | ✅ | ⚠️ Redirect | ✅ | ❌ | ⚠️ Teilweise |
| Lager | ✅ | ✅ | ✅ (→Products) | ❌ | ⚠️ | ✅ | ❌ Mock |
| Produkte | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ API |
| Stücklisten | ✅ | ✅ | ✅ | ❌ | ⚠️ | ✅ | ❌ Mock |
| Kalkulation | ✅ | ✅ | ✅ | ❌ | ⚠️ | ✅ | ❌ Mock |
| Produktion | ✅ | ✅ | ✅ | ❌ | ⚠️ | ✅ | ❌ Mock |
| QS-Prüfung | ✅ | ✅ | ✅ | ❌ | ⚠️ | ✅ | ❌ Mock |
| Service | ✅ | ✅ | ✅ | ❌ | ⚠️ | ✅ | ❌ Mock |
| Verträge | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ Teilweise |
| Dokumente | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ API |
| Berichte | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ API |

---

## 🔴 KRITISCH: Nicht-funktionale Buttons & Menüs

### Listenansichten – 3-Punkte-Menü

| Datei | Zeile | Menüpunkt | Problem | Fix |
|-------|-------|-----------|---------|-----|
| `PurchaseOrders.tsx` | 244 | Bearbeiten | Kein onClick | → `navigate(\`/purchase-orders/${order.id}/edit\`)` |
| `PurchaseOrders.tsx` | 245 | Stornieren | Kein onClick | → toast.info / Confirm-Dialog |
| `PurchaseInvoices.tsx` | 439-441 | Bearbeiten | Kein onClick | → `navigate(\`/purchase-invoices/${invoice.id}/edit\`)` |
| `Quotes.tsx` | 276 | Bearbeiten | Kein onClick | → `navigate(\`/quotes/${quote.id}/edit\`)` |
| `Quotes.tsx` | 277-278 | Duplizieren | Kein onClick | → toast + Logik |
| `Quotes.tsx` | 281-283 | Versenden | Kein onClick | → toast / E-Mail-Dialog |
| `Quotes.tsx` | 285-288 | In Rechnung umwandeln | Kein onClick | → navigate /invoices/new?quoteId= |
| `Products.tsx` | 367 | Bearbeiten | Navigiert zu Detail statt Edit | → `/products/${product.id}/edit` |
| `Contracts.tsx` | 450 | Bearbeiten | Navigiert zu Detail statt Edit | → `/contracts/${contract.id}/edit` |
| `Calculation.tsx` | 488 | Bearbeiten | Navigiert zu Detail statt Edit | → `/calculation/${calc.id}` (kein Edit-Route) |
| `Production.tsx` | 384 | Bearbeiten | Navigiert zu Detail statt Edit | → `/production/${order.id}` (kein Edit-Route) |
| `QualityControl.tsx` | 334 | Bearbeiten | Navigiert zu Detail statt Edit | → `/quality/${check.id}` (kein Edit-Route) |
| `BillOfMaterials.tsx` | 530 | Bearbeiten | handleEdit → Detail statt Edit | → `/bom/${bomId}` (kein Edit-Route) |
| `Service.tsx` | 524 | Bearbeiten | Navigiert zu Detail statt Edit | → `/service/${ticket.id}` (kein Edit-Route) |

### Detailseiten – 3-Punkte-Menü

| Datei | Zeile | Menüpunkt | Problem | Fix |
|-------|-------|-----------|---------|-----|
| `DeliveryNoteDetail.tsx` | 212 | Bearbeiten | Kein onClick | → `navigate(\`/delivery-notes/${id}/edit\`)` |
| `DeliveryNoteDetail.tsx` | 213 | Duplizieren | Kein onClick | → toast.info |
| `DeliveryNoteDetail.tsx` | 214 | Sendungsverfolgung | Kein onClick | → toast.info |
| `InvoiceDetail.tsx` | 249-250 | Per E-Mail senden | Kein onClick | → toast / Dialog |
| `InvoiceDetail.tsx` | 253 | Gutschrift erstellen | Kein onClick | → navigate /credit-notes/new?invoiceId= |
| `InvoiceDetail.tsx` | 254 | Duplizieren | Kein onClick | → toast.info |
| `InvoiceDetail.tsx` | 255 | Stornieren | Kein onClick | → Confirm-Dialog |
| `CreditNoteDetail.tsx` | 108 | Duplizieren | Kein onClick | → toast.info |
| `CreditNoteDetail.tsx` | 109 | Stornieren | Kein onClick | → Confirm-Dialog |
| `PurchaseInvoiceDetail.tsx` | 130 | Bestellung anzeigen | Kein onClick | → navigate /purchase-orders/:id |
| `PurchaseInvoiceDetail.tsx` | 131 | Stornieren | Kein onClick | → Confirm-Dialog |
| `OrderDetail.tsx` | 235 | Stornieren | Kein onClick | → Confirm-Dialog |
| `TaskDetail.tsx` | 365 | Duplizieren | Kein onClick | → toast.info |

---

## 🟡 FEHLENDE EDIT-ROUTEN in App.tsx

Folgende Module haben keinen eigenen Edit-Route registriert:

| Route | Status | Lösung |
|-------|--------|--------|
| `/bom/:id/edit` | ❌ Fehlt | Inline-Edit auf Detail oder eigene Seite |
| `/calculation/:id/edit` | ❌ Fehlt | Inline-Edit auf Detail oder eigene Seite |
| `/production/:id/edit` | ❌ Fehlt | Inline-Edit auf Detail oder eigene Seite |
| `/quality/:id/edit` | ❌ Fehlt | Inline-Edit auf Detail oder eigene Seite |
| `/service/:id/edit` | ❌ Fehlt | Inline-Edit auf Detail oder eigene Seite |
| `/inventory/:id/edit` | ❌ Fehlt | Inline-Edit auf Detail oder eigene Seite |
| `/goods-receipts/:id/edit` | ❌ Fehlt | Inline-Edit auf Detail oder eigene Seite |

→ **Entscheidung**: Diese Module nutzen derzeit Inline-Editing auf der Detailseite. Der "Bearbeiten"-Button im 3-Punkt-Menü soll daher zur Detailseite navigieren.

---

## 🔵 MOCK-DATEN IN DETAIL-SEITEN

| Detailseite | Mock-Daten | API-Hook vorhanden? |
|-------------|:----------:|:-------------------:|
| `CalculationDetail.tsx` | ✅ komplett Mock | Teilweise |
| `ProductionDetail.tsx` | ✅ komplett Mock | Teilweise |
| `QualityCheckDetail.tsx` | ✅ komplett Mock | Teilweise |
| `ServiceDetail.tsx` | ✅ komplett Mock | Teilweise |
| `BOMDetail.tsx` | ✅ komplett Mock | Teilweise |
| `InventoryItemDetail.tsx` | ✅ komplett Mock | ❌ |
| `PurchaseOrderDetail.tsx` | ⚠️ Teilweise Mock | ✅ |

---

## 📋 Modul-spezifische Tiefenanalyse

### 🕒 Zeiterfassung
- ✅ Tages-/Wochenansicht, Timer, manuelle Eingabe
- ✅ Filter nach Mitarbeiter/Projekt
- ✅ Freigabeprozess (Pending/Approved/Rejected)
- ✅ PDF-Export pro Mitarbeiter
- ⚠️ Monatliche Überstundenberechnung hardcoded (22 Arbeitstage)
- ⚠️ Keine eigene Detailseite pro Eintrag
- ❌ Keine Verknüpfung zu Produktion/Service-Tickets

### 🛒 Einkauf (Purchase Orders)
- ✅ Übersicht mit Status-Filter
- ✅ Detail mit Send/Receive-Workflow
- ✅ Wareneingang-Button → `/goods-receipts/new`
- ❌ Stats hardcoded (nicht API)
- ❌ "Bearbeiten" im 3-Punkt-Menü ohne onClick
- ❌ "Stornieren" im 3-Punkt-Menü ohne onClick
- ⚠️ Edit-Seite ist Redirect zu Detail

### 🧾 Einkaufsrechnungen
- ✅ Übersicht mit KPI-Cards
- ✅ PDF-Import mit OCR-Simulation
- ✅ Inline-Approve/Reject-Buttons
- ✅ Delete via API-Mutation
- ❌ "Bearbeiten" im 3-Punkt-Menü ohne onClick
- ⚠️ Edit-Seite ist Redirect zu Detail

### 📦 Lager (Inventory)
- ✅ Bestandsanzeige mit Min-Stock-Progress
- ✅ Stock-Adjustment-Dialog
- ✅ Nachbestell-Button → PurchaseOrders
- ✅ Delete via API
- ❌ Navigiert zu `/inventory/:id` (eigene Detail), nicht `/products/:id`
- ❌ Keine Edit-Route

### 🏷 Produkte
- ✅ API-Anbindung komplett (Hooks)
- ✅ Grid-/Listenansicht
- ✅ Kategorie-Filter, Status-Filter
- ✅ Preisliste-Dialog
- ❌ "Bearbeiten" im 3-Punkt-Menü → Detail statt Edit

### 🧩 Stücklisten (BOM)
- ✅ Collapsible-Ansicht mit verschachtelten Positionen
- ✅ Vorlagen-System (5 Metallbau-Templates)
- ✅ Kalkulation-Button → `/calculation/new` mit sessionStorage
- ✅ Duplizieren funktional
- ❌ Bearbeiten → Detail (kein Edit-Route)
- ❌ Mock-Daten in BOMDetail

### 💰 Kalkulation
- ✅ Status-Workflow (Entwurf → Kalkuliert → Freigegeben)
- ✅ BOM-Import-Dialog
- ✅ Angebot-erstellen-Button → `/quotes/new`
- ✅ Duplizieren funktional
- ❌ Mock-Daten in CalculationDetail
- ❌ Keine Simulation (nur statische Anzeige)

### 🏭 Produktion
- ✅ Start/Pause/Resume-Buttons funktional
- ✅ Status-Filter, Prioritäts-Badges
- ✅ Zeit-Erfassung-Button
- ✅ Duplizieren funktional
- ❌ Mock-Daten in ProductionDetail
- ❌ Keine Materialreservierung
- ❌ Keine QS-Verknüpfung im Flow

### 🔍 QS-Prüfung
- ✅ Prüfprotokolle mit Prüfpunkten
- ✅ Checklisten-Dialog, Foto-Upload-Dialog
- ✅ Bewertungs-Score
- ✅ PDF-Export
- ❌ Mock-Daten in QualityCheckDetail
- ⚠️ Keine direkte Verknüpfung zu Produktionsauftrag

### 🛠 Service
- ✅ Vollständiger Ticket-Workflow
- ✅ Techniker-Zuweisung, Status-Änderung
- ✅ Zeiterfassung-Dialog, Rapport-Dialog
- ✅ Wartungsplan-Dialog, Abschluss-Dialog
- ✅ AlertDialog für Löschen
- ❌ Mock-Daten in ServiceDetail
- ⚠️ Hardcoded Techniker-Liste

### 📑 Verträge
- ✅ API-Anbindung (Query)
- ✅ Typ-/Status-/Auto-Renewal-Filter
- ✅ Verlängern/Kündigen-Aktionen
- ✅ Edit-Route existiert (`/contracts/:id/edit`)
- ❌ "Bearbeiten" im 3-Punkt-Menü → Detail statt Edit

### 📂 Dokumente
- ✅ API-Anbindung über DMS-Hooks
- ✅ Ordner-Hierarchie, Upload-Dialog
- ✅ Vorschau-Route
- ✅ Grid-/Listenansicht
- ✅ Delete via API

### 📊 Berichte
- ✅ Kategorisierte Report-Übersicht
- ✅ Report-Generator-Dialog
- ✅ Export-Dialog (PDF/Excel)
- ✅ API-Anbindung für GAV/Open-Items
- ⚠️ Kein eigener Detail-View pro Report
- ❌ Keine Echtzeit-Daten für alle Reports

---

## 🔄 Prozessübergreifende Flows

### Produkt → Stückliste → Kalkulation → Produktion → QS → Lager
| Schritt | Status | Navigation |
|---------|--------|------------|
| Produkt anlegen | ✅ | `/products/new` |
| Stückliste erstellen | ✅ | `/bom/new` |
| Kalkulation aus BOM | ✅ | Via sessionStorage → `/calculation/new` |
| Produktionsauftrag | ✅ | `/production/new` |
| QS-Prüfung | ⚠️ | Manuell `/quality/new`, keine Auto-Verknüpfung |
| Lager-Buchung | ⚠️ | Manuell, keine Auto-Update nach Produktion |

### Einkauf → Lager → Kalkulation
| Schritt | Status | Navigation |
|---------|--------|------------|
| Bestellung erstellen | ✅ | `/purchase-orders/new` |
| Wareneingang | ✅ | `/goods-receipts/new` |
| Lager-Update | ❌ | Kein automatischer Bestandsupdate |
| Kalkulation-Materialkosten | ❌ | Keine Live-Lagerpreise |

### Service → Zeiterfassung → Bericht
| Schritt | Status | Navigation |
|---------|--------|------------|
| Service-Ticket | ✅ | `/service/new` |
| Zeit erfassen | ✅ | Dialog in ServiceDetail |
| Bericht generieren | ⚠️ | Reports-Seite, aber kein Service-spezifischer Report |

---

## ✅ Verbesserungsvorschläge (priorisiert)

### 🔴 Kritisch (sofort)
1. **Alle non-funktionalen DropdownMenuItems fixen** – 25+ Menüpunkte ohne onClick
2. **"Bearbeiten"-Buttons korrekt routen** – Zu Edit-Seite wenn vorhanden, sonst Detail

### 🟡 Wichtig (bald)
3. **Mock-Daten ersetzen** in 7 Detailseiten durch API-Hooks
4. **Stats-Cards** in PurchaseOrders von hardcoded auf API umstellen
5. **Prozessübergreifende Verknüpfungen** (QS ↔ Produktion, Lager ↔ Wareneingang)

### 🟢 Optional (später)
6. Edit-Seiten für BOM, Kalkulation, Produktion, QS, Service erstellen
7. Echtzeit-Materialpreise in Kalkulation
8. Auto-Bestandsupdate nach Wareneingang/Produktion
9. Service-Report in Reports-Modul
10. Zeiterfassung-Verknüpfung zu Produktion/Service

---

## 🖥 Cursor Backend-Prompt

```
Bitte überprüfe und ergänze die Backend-Endpoints für folgende Module:

1. FEHLENDE STATS-ENDPOINTS:
   - GET /purchase-orders/stats → { totalOrders, openOrders, monthlyVolume, topSupplier }
   - GET /bom/stats → { total, active, draft, totalValue }
   - GET /production/stats → { total, inProgress, completed, planned }
   - GET /quality-checks/stats → { total, passed, failed, conditional }
   - GET /service/stats → { total, open, urgent, completedMTD }

2. FEHLENDE DETAIL-RELATIONEN:
   - GET /production/:id → include: bom, project, workers, materials, qualityChecks
   - GET /quality-checks/:id → include: production, checklist, photos, defects
   - GET /service/:id → include: customer, product, timeEntries, activities
   - GET /bom/:id → include: items (nested), product, project

3. PROZESS-ENDPUNKTE:
   - POST /production/:id/complete → Status + QS-Prüfung + Lager-Buchung
   - POST /goods-receipts/:id/confirm → Bestand aktualisieren
   - POST /quality-checks/:id/complete → Status + Produktionsauftrag-Update

4. SICHERSTELLEN:
   - Alle GET /:id Endpoints geben Relationen zurück
   - Alle PUT /:id Endpoints akzeptieren partielle Updates
   - Pagination über page/pageSize Parameter
```

## 🎨 Lovable Frontend-Prompt

```
Fixe alle nicht-funktionalen Buttons und 3-Punkte-Menüs in den Verwaltungs-Modulen:

PHASE 1 - Broken DropdownMenuItems in Listenansichten:
- PurchaseOrders.tsx: "Bearbeiten" → navigate(`/purchase-orders/${order.id}/edit`)
- PurchaseOrders.tsx: "Stornieren" → toast.info("Bestellung wird storniert...")
- PurchaseInvoices.tsx: "Bearbeiten" → navigate(`/purchase-invoices/${invoice.id}/edit`)
- Quotes.tsx: "Bearbeiten" → navigate(`/quotes/${quote.id}/edit`)
- Quotes.tsx: "Duplizieren" → toast.info("Angebot wird dupliziert...")
- Quotes.tsx: "Versenden" → toast.info("Angebot wird versendet...")
- Quotes.tsx: "In Rechnung umwandeln" → navigate(`/invoices/new?quoteId=${quote.id}`)
- Products.tsx: "Bearbeiten" → navigate(`/products/${product.id}/edit`)
- Contracts.tsx: "Bearbeiten" → navigate(`/contracts/${contract.id}/edit`)

PHASE 2 - Broken DropdownMenuItems in Detailseiten:
- DeliveryNoteDetail: Bearbeiten, Duplizieren, Sendungsverfolgung
- InvoiceDetail: E-Mail senden, Gutschrift erstellen, Duplizieren, Stornieren
- CreditNoteDetail: Duplizieren, Stornieren
- PurchaseInvoiceDetail: Bestellung anzeigen, Stornieren
- OrderDetail: Stornieren
- TaskDetail: Duplizieren

PHASE 3 - Mock-Daten ersetzen:
- CalculationDetail, ProductionDetail, QualityCheckDetail, ServiceDetail, BOMDetail, InventoryItemDetail
```
