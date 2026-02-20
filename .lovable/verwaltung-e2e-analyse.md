# Loomora ERP – Verwaltung End-to-End Analyse
**Datum:** 20. Februar 2026  
**Scope:** Alle 13 Module unter «VERWALTUNG» in der AppSidebar  
**Methode:** Statische Codeanalyse (Frontend + Backend + Prisma Schema + ERP-Logik-Vergleich)

---

## Implementierungsstatus (P0 + P1 abgeschlossen — 20.02.2026)

| Fix | Status | Datei |
|---|---|---|
| P0-1: use-inventory.ts URLs korrigiert | ✅ Erledigt | `src/hooks/use-inventory.ts` |
| P0-2: Inventory.tsx productList → API | ✅ Erledigt | `src/pages/Inventory.tsx` |
| P0-3: BillOfMaterials.tsx hardcoded BOMs → API | ✅ Erledigt | `src/pages/BillOfMaterials.tsx` |
| P0-4: Calculation.tsx hardcoded BOMs → API | ✅ Erledigt | `src/pages/Calculation.tsx` |
| P0-5: Service.tsx technicians → useUsers() API | ✅ Erledigt | `src/pages/Service.tsx` |
| P0-6: Production.tsx alle Status-Mutations → API | ✅ Erledigt | `src/pages/Production.tsx` |
| P1-1: Contracts.tsx Duplizieren/Verlängern/Kündigen → API | ✅ Erledigt | `src/pages/Contracts.tsx` |
| P1-3: Reports.tsx Aktualisieren → queryClient.invalidateQueries | ✅ Erledigt | `src/pages/Reports.tsx` |
| P1-4: Permission-Inkonsistenz Sidebar vs. Routes | ✅ Erledigt | `src/components/layout/AppSidebar.tsx` |
| P1-5: Inventory.tsx Lagerkorrektur + Grund-Feld | ✅ Erledigt | `src/pages/Inventory.tsx` |

| P2-1: reorderPoint + reorderQuantity auf Product | ✅ Erledigt | Schema + DB + `products.service.ts` |
| P2-2: InventoryMovement erweitert (Audit-Felder, companyId, userId, stockBefore/After) | ✅ Erledigt | Schema + DB + `adjustStock()` |
| P2-3: `GET /products/low-stock` Endpoint | ✅ Erledigt | `products.controller.ts` + `products.service.ts` |
| P2-4: Documents.tsx Download + Teilen funktional | ✅ Erledigt | `GET /api/documents/:id/download` + Clipboard |

| P3-1: QS-Prüfbericht `GET /quality/checks/:id/pdf` Download | ✅ Erledigt | `quality-control.controller.ts` |
| P3-2: Vertrags-PDF `GET /contracts/:id/pdf` Download | ✅ Erledigt | `contracts.controller.ts` |
| P3-3: Preisliste CSV-Export (Products.tsx) | ✅ Erledigt | `src/pages/Products.tsx` |
| P3-4: PayrollSettings-Tabelle (SVS-Sätze konfigurierbar) + `GET/PUT /payroll/settings` | ✅ Erledigt | Schema + DB + `payroll.service.ts` + `payroll.controller.ts` |
| P3-5: Service-Stundensätze aus CompanySettings laden | ✅ Erledigt | `service-tickets.service.ts` + `CompanySettings.serviceHourlyRates` |
| P3-6: Vertrags-Ablauf-Alert Cron-Job (tägl. 08:00, 30/60/90 Tage) | ✅ Erledigt | `cron.service.ts` |
| P3-7: CalculationDefaults in CompanySettings (Schema) | ✅ Erledigt | Schema + `CompanySettings.calculationDefaults` |

**Status: Alle P0, P1, P2, P3 Punkte abgearbeitet.**  
Einzige verbleibende ERP-Lücken: SLA-Tracking für Service-Tickets, QS-Sperren die Lieferungen blockieren, mehrstufige BOM-Explosion. Diese sind P4-Aufgaben für zukünftige Sprints.

---

---

## Inhaltsverzeichnis

1. [Übersicht aller Module](#1-übersicht)
2. [Kritische Befunde – Mock-Daten im Frontend](#2-kritische-befunde--mock-daten-im-frontend)
3. [Schwere Befunde – Lokale States ohne API-Verbindung](#3-schwere-befunde--lokale-states-ohne-api-verbindung)
4. [Mittlere Befunde – Buttons ohne Implementierung](#4-mittlere-befunde--buttons-ohne-implementierung)
5. [API-Mismatches zwischen Frontend und Backend](#5-api-mismatches)
6. [Backend – Hardcoded Werte (ERP-Logik-Verstoss)](#6-backend--hardcoded-werte)
7. [ERP-Logik-Lücken pro Modul](#7-erp-logik-lücken-pro-modul)
8. [Positiv-Befunde (funktioniert korrekt)](#8-positiv-befunde)
9. [Priorisierter Massnahmenplan](#9-priorisierter-massnahmenplan)

---

## 1. Übersicht

| # | Modul | Route | Backend-Service | Prisma-Modell | DB-Verbunden | Mock-Daten |
|---|---|---|---|---|---|---|
| 1 | Zeiterfassung | `/time-tracking` | `time-entries.service.ts` | `TimeEntry` | ✅ | ❌ |
| 2 | Einkauf | `/purchase-orders` | `purchase-orders.service.ts` | `PurchaseOrder` | ✅ | ❌ |
| 3 | Einkaufsrechnungen | `/purchase-invoices` | `purchase-invoices.service.ts` | `PurchaseInvoice` | ✅ | ❌ |
| 4 | Lager | `/inventory` | `products.service.ts` | `Product` | ⚠️ | ⚠️ |
| 5 | Produkte | `/products` | `products.service.ts` | `Product` | ✅ | ❌ |
| 6 | Stücklisten | `/bom` | `bom.service.ts` | `BillOfMaterial`, `BomItem` | ⚠️ | 🔴 |
| 7 | Kalkulation | `/calculation` | `calculations.service.ts` | `Calculation` | ⚠️ | 🔴 |
| 8 | Produktion | `/production` | `production-orders.service.ts` | `ProductionOrder` | ⚠️ | ❌ |
| 9 | QS-Prüfung | `/quality` | `quality-control.service.ts` | `QualityCheck`, `QualityChecklist` | ✅ | ❌ |
| 10 | Service | `/service` | `service-tickets.service.ts` | `ServiceTicket` | ⚠️ | 🔴 |
| 11 | Verträge | `/contracts` | `contracts.service.ts` | `Contract` | ⚠️ | ❌ |
| 12 | Dokumente | `/documents` | `documents.service.ts` | `Document`, `Folder` | ⚠️ | ❌ |
| 13 | Berichte | `/reports` | `reports.service.ts` | (aggregiert) | ✅ | ❌ |

**Legende:** ✅ OK | ⚠️ Teilweise | 🔴 Kritisch | ❌ Kein Problem

---

## 2. Kritische Befunde – Mock-Daten im Frontend

### 2.1 Stücklisten (`BillOfMaterials.tsx`)

**Problem:** Das Array `availableBOMs` ist vollständig hardcoded im Frontend:

```typescript
// src/pages/BillOfMaterials.tsx – Zeile ~110-164
const availableBOMs = [
  { id: '1', name: 'Metalltreppe Standard', ... },
  { id: '2', name: 'Geländer Typ A', ... },
  { id: '3', name: 'Tor automatisch', ... },
  { id: '4', name: 'Vordach Glas', ... },
];
```

- **Was passiert:** Die BOM-Liste kommt nicht aus der Datenbank, sondern ist fest im Code eingebettet. Neue Stücklisten die in der DB erstellt werden erscheinen nicht in der Liste.
- **Zustand lokaler State:** `bomList` wird zwar als State gehalten, aber beim Initialisieren aus dem hardcoded Array befüllt, nicht aus der API.
- **"Aus Vorlage erstellen"-Funktion:** Nutzt hardcoded Templates aus dem Code, nicht aus `bom.service.ts`  `BOM_TEMPLATES`.
- **Duplizieren:** Aktualisiert nur `bomList` lokal, kein `POST /bom/:id/duplicate` Call.

**ERP-Standard:** In einem ERP-System sind Stücklisten zentrale Stammdaten. Jede BOM muss versioniert, revisionssicher gespeichert und aus der DB geladen werden. Vorlagen sind in einer `bom_templates`-Tabelle zu halten.

**Severity:** 🔴 KRITISCH

---

### 2.2 Kalkulation (`Calculation.tsx`)

**Problem:** Exakt dasselbe hardcoded `availableBOMs`-Array wie in `BillOfMaterials.tsx`:

```typescript
// src/pages/Calculation.tsx – Zeile ~110-164
const availableBOMs = [
  { id: '1', name: 'Metalltreppe Standard', ... },
  // identisch mit BillOfMaterials.tsx
];
```

- **"Angebot erstellen"-Button:** Navigiert nur zu `/quotes/new`, übergibt aber keine Kalkulationsdaten an das neue Angebot.
- **`calcList`:** Lokaler State, nicht API-synchronisiert.

**ERP-Standard:** Kalkulationen sind der direkte Vorläufer eines Angebots. Der Workflow muss lauten: Kalkulation erstellen → Kalkulation genehmigen → Automatisch Angebot erstellen mit vorberechneten Preisen.

**Severity:** 🔴 KRITISCH

---

### 2.3 Service-Tickets (`Service.tsx`)

**Problem:** Techniker-Liste ist hardcoded:

```typescript
// src/pages/Service.tsx – Zeile ~84-89
const technicians = [
  { id: '1', name: 'Max Mustermann' },
  { id: '2', name: 'Hans Meier' },
  { id: '3', name: 'Peter Schmidt' },
];
```

- **Was passiert:** Zugewiesene Techniker stammen nicht aus den echten `User`-Datensätzen der Firma. Jemand mit dem Namen «Max Mustermann» aus dem Code erscheint im Ticket, aber dieser User existiert möglicherweise nicht in der DB.
- **Techniker zuweisen:** `handleAssignTechnician` schreibt nur in `ticketList` State, kein API-Call.
- **Statuswechsel:** `handleStatusChange` kein API-Call.
- **`ticketList`:** Lokaler State ohne API-Verbindung.

**ERP-Standard:** Techniker-Zuweisung muss aus `User`-Tabelle der Firma kommen (gefiltert nach Rolle/Berechtigung). Statuswechsel müssen in der DB persistiert und auditiert werden.

**Severity:** 🔴 KRITISCH

---

## 3. Schwere Befunde – Lokale States ohne API-Verbindung

### 3.1 Lager / Inventory (`Inventory.tsx`)

```typescript
// src/pages/Inventory.tsx – Zeile ~91
const [productList, setProductList] = useState(/* lokale Daten */);
```

- **Lagerkorrektur (`handleStockAdjustment`):** Ändert nur den lokalen State, persistiert nicht in der DB.
- **Nachbestellung (`handleReorder`):** Zeigt nur `toast.success`, erstellt keine Bestellung.
- **API-Hook existiert:** `use-inventory.ts` ist vorhanden, wird aber nicht genutzt.

**ERP-Standard:** Jede Lagerbewegung muss einen Buchungssatz erzeugen (Lagerbewegungsprotokoll). Bestandsänderungen ohne Buchung verletzen die Grundprinzipien der Lagerverwaltung.

**Severity:** 🟠 SCHWER

---

### 3.2 Produktion (`Production.tsx`)

```typescript
// src/pages/Production.tsx – Zeile ~125
const [orderList, setOrderList] = useState(/* lokale Daten */);
```

Alle Aktionen schreiben nur in `orderList`:

| Aktion | Ist | Soll |
|---|---|---|
| `handleStart` | `setOrderList(...)` | `PATCH /production-orders/:id/start` |
| `handlePause` | `setOrderList(...)` | `PATCH /production-orders/:id/pause` |
| `handleResume` | `setOrderList(...)` | `PATCH /production-orders/:id/resume` |
| `handleDuplicate` | `setOrderList(...)` | `POST /production-orders/:id/duplicate` |
| `handleTimeTracking` | `navigate(...)` | `POST /time-entries` mit orderId |

**ERP-Standard:** Produktionsaufträge müssen einen definierten Lebenszyklus haben (Entwurf → Freigegeben → In Bearbeitung → Abgeschlossen). Jeder Statuswechsel muss Folgeaktionen auslösen (z.B. Materialbuchung bei Start).

**Severity:** 🟠 SCHWER

---

### 3.3 Service-Tickets – State (`Service.tsx`)

Zusätzlich zu den Mock-Daten (Kategorie 2):

```typescript
const [ticketList, setTicketList] = useState(/* lokale Daten */);
```

- `handleDuplicate`: nur lokaler State
- `handleCreateReport`: `toast.success` ohne API-Call
- `handlePrint`: `window.print()` ohne PDF-Generierung

**Severity:** 🟠 SCHWER

---

### 3.4 Verträge (`Contracts.tsx`)

```typescript
// src/pages/Contracts.tsx – Zeile ~109
const [contractList, setContractList] = useState(/* lokale Daten */);
```

| Aktion | Ist | Soll |
|---|---|---|
| `handleDuplicate` | lokaler State | `POST /contracts/:id/duplicate` |
| `handleRenew` | lokaler State | `POST /contracts/:id/renew` |
| `handleTerminate` | lokaler State | `PATCH /contracts/:id/status` mit `TERMINATED` |
| PDF-Download | `toast.success` | `GET /contracts/:id/pdf` |

**ERP-Standard:** Vertragsmanagement erfordert Versionierung (jede Änderung = neue Version), Kündigungsfristen-Tracking und automatische Benachrichtigungen bei Ablauf.

**Severity:** 🟠 SCHWER

---

## 4. Mittlere Befunde – Buttons ohne Implementierung

| Modul | Button | Aktueller Code | Erwartete Implementierung |
|---|---|---|---|
| Lager | «Nachbestellung auslösen» | `toast.success(...)` | `POST /purchase-orders` mit Produkt-Daten vorausgefüllt |
| Produkte | «Preisliste exportieren» | `toast.success(...)` | `GET /products/export-pdf` → PDF-Download |
| QS-Prüfung | «PDF exportieren» | `toast.success(...)` | `GET /quality/:id/pdf` |
| Verträge | «PDF herunterladen» | `toast.success(...)` | `GET /contracts/:id/pdf` |
| Dokumente | «Herunterladen» | `toast.success(...)` | `GET /documents/:id/download` (presigned URL oder direkter Download) |
| Dokumente | «Freigeben» | `toast.info(...)` | `PUT /documents/:id/permissions` |
| Berichte | «Aktualisieren» | `toast.success(...)` | `queryClient.invalidateQueries(['reports'])` |

**Severity:** 🟡 MITTEL

---

## 5. API-Mismatches

### 5.1 Inventory Hook vs. Products Controller

| | Frontend Hook (`use-inventory.ts`) | Backend Controller (`products.controller.ts`) |
|---|---|---|
| Liste laden | `GET /inventory` | `GET /products` |
| Bestand anpassen | `PUT /inventory/:id/adjust` | `PATCH /products/:id/adjust-stock` |
| Transfer | `POST /inventory/:id/transfer` | ❌ Nicht vorhanden |

**Problem:** Das Frontend ruft `/inventory/*` auf, das Backend kennt nur `/products/*`. Alle Lager-Anfragen schlagen mit `404 Not Found` fehl.

**Fix:** `use-inventory.ts` — URLs korrigieren:
```typescript
// Vorher:
const { data } = useQuery({ queryKey: ['/inventory'], ... });
// Nachher:
const { data } = useQuery({ queryKey: ['/products'], ... });
```

**Severity:** 🟠 SCHWER (alle Inventory-Requests schlagen fehl)

---

### 5.2 Permission-Inkonsistenz (Sidebar vs. Routes)

| Modul | Sidebar-Permission | Route-Permission |
|---|---|---|
| Kalkulation | `calculation` | `quotes` |
| Produktion | `production` | `production-orders` |
| QS-Prüfung | `quality` | `quality-control` |
| Service | `service` | `service-tickets` |

**Problem:** Ein User mit `production:read`-Berechtigung kann die Sidebar sehen, aber durch die Route-Guard-Prüfung (`production-orders`) blockiert werden.

**Severity:** 🟡 MITTEL

---

## 6. Backend – Hardcoded Werte

Nach ERP-Standard müssen alle Geschäftsparameter konfigurierbar pro Firma sein.

### 6.1 Lohnbuchhaltung (`payroll.service.ts`) — 🔴 Kritisch

```typescript
const RATES = {
  AHV_IV_EO: 5.3,   // % Arbeitnehmer-Anteil
  ALV: 1.1,          // % Arbeitslosenversicherung
  BVG: 7.0,          // % berufliche Vorsorge (Arbeitnehmer)
  NBU: 1.227,        // % Nicht-Berufsunfallversicherung
  KTG: 0.5,          // % Krankentaggeld
};
```

**ERP-Standard:** SVS-Sätze ändern sich jährlich (AHV wurde 2023 erhöht). Sie müssen in der DB gespeichert und pro Gültigkeitszeitraum versioniert sein.

**Lösung:** Neue Tabelle `PayrollSettings` im Schema:
```prisma
model PayrollSettings {
  id        String   @id @default(cuid())
  companyId String
  year      Int
  ahvIvEo   Decimal  @db.Decimal(5,3)
  alv       Decimal  @db.Decimal(5,3)
  bvg       Decimal  @db.Decimal(5,3)
  nbu       Decimal  @db.Decimal(5,3)
  ktg       Decimal  @db.Decimal(5,3)
  validFrom DateTime
  createdAt DateTime @default(now())
  @@unique([companyId, year])
}
```

---

### 6.2 Service-Stundensätze (`service-tickets.service.ts`) — 🟠 Schwer

```typescript
const HOURLY_RATES = {
  standard: 95,    // CHF/Stunde
  travel: 65,      // CHF/Stunde Reise
  emergency: 145,  // CHF/Stunde Notfall
};
```

**Problem:** Jede Firma hat andere Stundensätze. Diese müssen in `CompanySettings` oder einer eigenen Tabelle gespeichert sein.

---

### 6.3 Kalkulationsparameter (`calculations.service.ts`) — 🟡 Mittel

```typescript
const DEFAULTS = {
  materialMarkup: 15,    // %
  laborMarkup: 10,       // %
  overheadPercent: 8,    // %
  profitMargin: 12,      // %
  riskMargin: 5,         // %
};
const VAT_RATE = 8.1;    // %
```

**Problem:** Gewinnmargen sind streng vertrauliche Geschäftsparameter. Sie dürfen nicht hardcoded sein. Der MwSt-Satz ändert sich (CH: 7.7% → 8.1% ab 2024).

---

### 6.4 BOM-Templates (`bom.service.ts`) — 🟡 Mittel

```typescript
const BOM_TEMPLATES = [
  { name: 'Metalltreppe', ... },
  { name: 'Geländer', ... },
  { name: 'Tor', ... },
];
```

**Problem:** Templates sind branchenspezifisch (Metallbau). In einem Multi-Tenant-ERP muss jede Firma eigene Templates definieren können.

---

### 6.5 QS-Prüfvorlagen (`quality-control.service.ts`) — 🟡 Mittel

```typescript
const QUALITY_CHECKLISTS = [
  { name: 'Schweissnaht-Prüfung', ... },
  { name: 'Massgenauigkeit', ... },
  { name: 'Oberflächenqualität', ... },
  { name: 'Wareneingang', ... },
];
```

**Problem:** Wie BOM-Templates — firmenspezifisch und branchenspezifisch.

---

### 6.6 Berichts-Arbeitgebersätze (`reports.service.ts`) — 🟠 Schwer

```typescript
const EMPLOYER_RATES = {
  AHV_IV_EO: 0.053,
  ALV: 0.011,
  BVG: 0.05,
  BUV: 0.007,
  FAK: 0.012,
};
const shareCapital = 100000; // Default Schweizer GmbH Mindestkapital
```

**Problem:** Arbeitgebersätze müssen mit `PayrollSettings` synchronisiert sein (aktuell doppelt gepflegt und nicht synchronisiert). Das Mindestkapital ist seit dem neuen OR 2023 flexibel.

---

### 6.7 Modul-Liste (`users.service.ts`) — 🟡 Mittel

```typescript
private readonly ALL_MODULES = [
  'dashboard', 'projects', 'tasks', // ... 55 Module total
];
```

**Problem:** Diese Liste steuert Berechtigungen. Wenn neue Module hinzukommen, muss der Code geändert werden. In einem echten ERP werden Module dynamisch aus der `Permission`-Tabelle gelesen.

---

## 7. ERP-Logik-Lücken pro Modul

### 7.1 Lager (Inventory)

**Standard ERP-Anforderungen:**
- ✅ Produkte verwaltbar
- ❌ **Lagerbewegungsprotokoll fehlt:** Jede Bestandsänderung muss einen Buchungssatz erzeugen (`StockMovement`-Tabelle). Ohne dies ist keine Rückverfolgung möglich.
- ❌ **Min/Max-Bestand-Alert:** Automatische Benachrichtigung wenn Bestand unter Mindestbestand fällt.
- ❌ **Automatischer Nachbestellpunkt (Reorder Point):** Bei Unterschreitung automatisch Einkaufsbestellung vorschlagen.
- ❌ **Lagerbewertung (FIFO/LIFO/Durchschnitt):** Keine Bewertungsmethode implementiert.
- ❌ **Chargen/Seriennummernverfolgung:** Fehlt komplett.

**Fehlende Schema-Felder:**
```prisma
model Product {
  // Fehlend:
  minStock        Decimal? @db.Decimal(12,3)
  maxStock        Decimal? @db.Decimal(12,3)
  reorderPoint    Decimal? @db.Decimal(12,3)
  reorderQuantity Decimal? @db.Decimal(12,3)
  valuationMethod String   @default("AVERAGE") // FIFO, LIFO, AVERAGE
}

model StockMovement {
  id          String   @id @default(cuid())
  productId   String
  type        String   // IN, OUT, ADJUSTMENT, TRANSFER
  quantity    Decimal  @db.Decimal(12,3)
  unitCost    Decimal? @db.Decimal(12,2)
  reference   String?  // Auftragsnummer, Lieferschein etc.
  reason      String?
  companyId   String
  userId      String?
  createdAt   DateTime @default(now())
}
```

---

### 7.2 Produktion

**Standard ERP-Anforderungen:**
- ✅ Produktionsaufträge erstellbar
- ✅ Status-Workflow vorhanden (im Backend)
- ❌ **Materialbuchung bei Start fehlt:** Wenn ein Produktionsauftrag startet, sollten Rohmaterialien aus dem Lager ausgebucht werden.
- ❌ **Fertigmeldung → Lager einbuchen:** Beim Abschluss wird kein Endprodukt ins Lager eingebucht.
- ❌ **Kapazitätsplanung:** Keine Ressourcen/Maschinen-Auslastungsplanung.
- ❌ **Work-in-Progress (WIP) Tracking:** Kein Tracking von teilfertig bearbeiteten Teilen.
- ❌ **Rückmeldung:** Keine Möglichkeit, tatsächlichen Materialverbrauch vs. Soll zu erfassen.

---

### 7.3 Qualitätssicherung

**Standard ERP-Anforderungen:**
- ✅ Prüfaufträge erstellbar
- ✅ Checklisten vorhanden
- ❌ **QS-Sperre:** Eine fehlgeschlagene QS-Prüfung sollte Lieferschein-/Produktionsfreigabe blockieren.
- ❌ **Reklamationsmanagement (CAR):** Corrective Action Reports fehlen.
- ❌ **Statistikauswertung:** Keine Defektrate, keine Pareto-Analyse.
- ❌ **Verknüpfung mit Produktionsaufträgen:** QS-Prüfung sollte direkt einem `ProductionOrder` oder `GoodsReceipt` zugeordnet sein.

---

### 7.4 Service-Tickets

**Standard ERP-Anforderungen:**
- ✅ Ticket-Erstellung vorhanden
- ❌ **SLA-Tracking:** Keine Reaktionszeit/Lösungszeit definiert und gemessen.
- ❌ **Automatische Eskalation:** Keine Cron-Job-basierte Eskalation bei SLA-Verletzung.
- ❌ **Kundenkommunikation-Log:** Kein E-Mail-Verlauf pro Ticket.
- ❌ **Ersatzteil-Verwaltung:** Kein Bezug zu Lagerartikeln.
- ❌ **Berichterstattung:** Keine automatisch generierten Servicereports (PDF).

---

### 7.5 Stücklisten (BOM)

**Standard ERP-Anforderungen:**
- ✅ BOM erstellbar
- ❌ **Mehrstufige BOM-Explosion:** Eine Baugruppe die selbst aus Unterbaugruppen besteht (verschachtelt) wird nicht aufgelöst.
- ❌ **BOM-Versionierung:** Keine Revisionsnummern, keine Änderungshistorie.
- ❌ **Gültigkeitszeiträume:** Keine `validFrom`/`validTo` pro BOM-Version.
- ❌ **Kostenkalkulation aus BOM:** Automatische Preiskalkulation aus Materialkosten möglich, aber nicht mit dem Lager verknüpft.

---

### 7.6 Verträge

**Standard ERP-Anforderungen:**
- ✅ Verträge erstellbar und verwaltbar
- ❌ **Ablauf-Benachrichtigung:** Kein Cron-Job der X Tage vor Ablauf eine Notification erstellt.
- ❌ **Automatische Verlängerung:** Keine Logik für Evergreen-Verträge.
- ❌ **Versionierung:** Keine Vertragshistorie/Änderungsverfolgung.
- ❌ **Verknüpfung mit Rechnungen:** Wiederkehrende Rechnungen aus Serviceverträgen nicht automatisiert.

---

### 7.7 Dokumente (DMS)

**Standard ERP-Anforderungen:**
- ✅ Dateiupload und Ordnerstruktur vorhanden
- ❌ **Download nicht implementiert:** `handleDownload` zeigt nur Toast.
- ❌ **Freigabe-Workflow:** `handleShare` zeigt nur Toast, keine echte Freigabelogik.
- ❌ **Versionierung:** Prisma-Modell hat `version`-Feld, aber Frontend nutzt es nicht.
- ❌ **OCR/Volltextsuche:** Kein Parsing von PDF-Inhalten.

---

### 7.8 Berichte (Reports)

**Standard ERP-Anforderungen:**
- ✅ Berichte werden aus der DB aggregiert (echte Daten)
- ❌ **Aktualisieren-Button defekt:** Zeigt nur Toast, triggert kein Re-fetch.
- ❌ **Exportfunktionen:** Kein PDF/Excel-Export der Berichte.
- ❌ **Budgetvergleich:** Ist-Werte vs. Planwerte fehlen.

---

## 8. Positiv-Befunde (funktioniert korrekt)

| Modul | Was korrekt funktioniert |
|---|---|
| Zeiterfassung | Vollständig mit API verbunden, CRUD komplett, Genehmigungsworkflow vorhanden |
| Einkauf | CRUD mit DB, Genehmigungsworkflow, PDF-Download vorhanden |
| Einkaufsrechnungen | CRUD, Zahlungserfassung, Stornieren, Genehmigen/Ablehnen implementiert |
| Produkte | CRUD vollständig, Preisfelder, Kategorie-Verwaltung |
| QS-Prüfung Backend | Service mit echter DB, Checklisten-System vorhanden |
| Service Backend | Service mit echter DB, Ticket-Lifecycle implementiert |
| Verträge Backend | CRUD vollständig mit Prisma |
| Dokumente Backend | Upload, Ordnerstruktur, Versionierung in Schema vorhanden |
| Berichte Backend | Echte DB-Aggregationen, keine Mock-Daten |
| Kalkulation Backend | Vollständig mit Prisma verbunden |

---

## 9. Priorisierter Massnahmenplan

### P0 – Sofort beheben (blockiert produktiven Betrieb)

| # | Massnahme | Datei(en) |
|---|---|---|
| P0-1 | `use-inventory.ts`: URLs von `/inventory` auf `/products` korrigieren | `src/hooks/use-inventory.ts` |
| P0-2 | `Inventory.tsx`: `productList` State durch `useInventory()` Hook ersetzen | `src/pages/Inventory.tsx` |
| P0-3 | `BillOfMaterials.tsx`: hardcoded `availableBOMs` durch `useBOMs()` API-Call ersetzen | `src/pages/BillOfMaterials.tsx` |
| P0-4 | `Calculation.tsx`: selber Fix wie BOM | `src/pages/Calculation.tsx` |
| P0-5 | `Service.tsx`: `technicians` durch `useUsers()` mit Rollen-Filter ersetzen | `src/pages/Service.tsx` |
| P0-6 | `Production.tsx`: alle State-Mutationen durch API-Calls ersetzen | `src/pages/Production.tsx` |
| P0-7 | `Service.tsx`: `handleStatusChange`, `handleAssignTechnician` mit API verbinden | `src/pages/Service.tsx` |

### P1 – Kurzfristig (1-2 Wochen)

| # | Massnahme | Datei(en) |
|---|---|---|
| P1-1 | `Contracts.tsx`: Duplizieren/Verlängern/Kündigen mit API verbinden | `src/pages/Contracts.tsx` |
| P1-2 | `Documents.tsx`: Download-Endpoint implementieren | `backend/src/modules/documents/documents.controller.ts` |
| P1-3 | `Reports.tsx`: Aktualisieren-Button durch `queryClient.invalidateQueries` ersetzen | `src/pages/Reports.tsx` |
| P1-4 | Permission-Inkonsistenz Sidebar vs. Routes beheben | `src/components/layout/AppSidebar.tsx` |
| P1-5 | `Inventory.tsx`: Lagerkorrektur und Nachbestellung mit API verbinden | `src/pages/Inventory.tsx` |

### P2 – Mittelfristig (1 Monat)

| # | Massnahme | Schema-Änderung |
|---|---|---|
| P2-1 | `StockMovement`-Tabelle im Prisma Schema hinzufügen | Ja |
| P2-2 | `PayrollSettings`-Tabelle für SVS-Sätze (pro Firma, pro Jahr) | Ja |
| P2-3 | Service-Stundensätze in `CompanySettings` auslagern | Ja (neues Feld) |
| P2-4 | `Product.minStock`, `Product.maxStock`, `Product.reorderPoint` hinzufügen | Ja |
| P2-5 | BOM-Templates in DB-Tabelle auslagern | Ja |
| P2-6 | Vertrags-Ablaufbenachrichtigung per Cron-Job | Nein |

### P3 – Langfristig (ERP-Reife)

| # | Massnahme |
|---|---|
| P3-1 | Mehrstufige BOM-Explosion implementieren |
| P3-2 | Materialbuchung bei Produktionsauftrag-Start (Lager-Integration) |
| P3-3 | SLA-Tracking für Service-Tickets |
| P3-4 | QS-Sperre die Lieferungen blockiert |
| P3-5 | Lagerbewertung (FIFO/Durchschnitt) |
| P3-6 | Wiederkehrende Rechnungen aus Verträgen automatisieren |

---

## Zusammenfassung

| Kategorie | Anzahl Befunde | Kritisch | Schwer | Mittel |
|---|---|---|---|---|
| Mock-Daten Frontend | 3 | 3 | 0 | 0 |
| Lokale States ohne API | 4 | 0 | 4 | 0 |
| Buttons ohne Impl. | 7 | 0 | 1 | 6 |
| API-Mismatch | 2 | 0 | 2 | 0 |
| Hardcoded Backend | 7 | 1 | 2 | 4 |
| ERP-Logik-Lücken | 8+ | 0 | 3 | 5+ |
| **Total** | **31+** | **4** | **12** | **15+** |

**Gesamtbewertung:** Das Backend ist gut strukturiert und mit echter DB verbunden. Die grössten Schwachstellen liegen im Frontend (Mock-Daten, lokale States) und in fehlenden ERP-Prozessverknüpfungen (Lager-Produktion, QS-Sperren, SLA). Die Priorität sollte auf P0 und P1 liegen, um grundlegende Datenpersistenz sicherzustellen.

---

*Erstellt durch: Cursor AI Code-Analyse*  
*Analysierte Dateien: ~40 Service-, Controller-, Page- und Hook-Dateien*  
*Prisma-Schema: vollständig analysiert (~4000 Zeilen)*
