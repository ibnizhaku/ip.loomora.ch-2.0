# Loomora ERP – Vollständige Systemanalyse

**Datum:** 08.02.2026  
**Version:** 1.0  
**Zweck:** IST-SOLL-Vergleich und Transformations-Roadmap

---

## Executive Summary

Loomora ERP ist ein **umfangreiches, schweizer-konformes ERP-System** mit vollständiger Frontend- und Backend-Architektur. Das System befindet sich in einem fortgeschrittenen Entwicklungsstadium mit **~150 Frontend-Seiten**, **50 Backend-Modulen** und einem **Datenbankschema mit ~80+ Tabellen**.

### Kernaussagen:
- ✅ **Architektur:** Produktionsreif (NestJS + PostgreSQL + React/Vite)
- ✅ **Multi-Tenancy:** Vollständig implementiert (Subscription, Rollen, Company-Wechsel)
- ⚠️ **Datenintegrität:** Teilweise (Soft-Delete vs Hard-Delete inkonsistent)
- ⚠️ **Test-Coverage:** Nicht vorhanden
- 🔄 **Deployment:** Live auf app.loomora.ch via PM2/OpenLiteSpeed

---

## 1. IST-Stand – Systemanalyse

### 1.1 Architektur & Systemaufbau

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOOMORA ERP                                 │
├─────────────────────────────────────────────────────────────────────┤
│  FRONTEND (React/Vite/TypeScript)                                   │
│  ├── ~150 Pages (src/pages/)                                        │
│  ├── ~50 Custom Hooks (src/hooks/)                                  │
│  ├── shadcn/ui + Tailwind CSS                                       │
│  └── TanStack Query für Data Fetching                               │
├─────────────────────────────────────────────────────────────────────┤
│  BACKEND (NestJS/TypeScript)                                        │
│  ├── 50 Module (backend/src/modules/)                               │
│  ├── Prisma ORM v7 (PostgreSQL)                                     │
│  ├── JWT Auth mit Refresh Tokens                                    │
│  └── Multi-Tenant Guards (Company, Subscription, Permission)       │
├─────────────────────────────────────────────────────────────────────┤
│  INFRASTRUKTUR                                                      │
│  ├── Server: srv1174249 (/var/www/loomora)                          │
│  ├── PM2 Cluster Mode (4 Instanzen)                                 │
│  ├── OpenLiteSpeed (Reverse Proxy + Cache)                          │
│  └── PostgreSQL 16 (lokal)                                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Module nach Funktionsbereich

| Bereich | Module | Status |
|---------|--------|--------|
| **CORE / AUTH** | auth, users, company, subscriptions, invitations | ✅ Vollständig |
| **CRM** | customers, suppliers, leads, contacts, campaigns | ✅ Vollständig |
| **VERKAUF** | quotes, orders, invoices, credit-notes, delivery-notes | ✅ Vollständig |
| **EINKAUF** | purchase-orders, purchase-invoices, goods-receipts | ✅ Vollständig |
| **LAGER** | products, inventory (movements) | ✅ Vollständig |
| **FINANZEN** | finance (ChartOfAccounts, BankAccounts), payments, journal-entries | ✅ Vollständig |
| **BUCHHALTUNG** | vat-returns, cash-book, fixed-assets, budgets, cost-centers | ✅ Vollständig |
| **HR** | employees, absences, time-entries, training | ✅ Vollständig |
| **PROJEKTE** | projects, tasks, calendar | ✅ Vollständig |
| **PRODUKTION** | bom (Stücklisten), production-orders, calculations, quality-control | ✅ Vollständig |
| **SERVICE** | service-tickets | ✅ Vollständig |
| **E-COMMERCE** | ecommerce (shop, orders, reviews, discounts) | ✅ Vollständig |
| **MARKETING** | marketing (campaigns, leads), email-marketing | ✅ Vollständig |
| **HR SPEZIAL** | recruiting (jobs, candidates), contracts, gav-metallbau | ✅ Vollständig |
| **COMPLIANCE** | swissdec, withholding-tax, audit-log | ✅ Vollständig |
| **BANKING** | bank-import (camt.054), reminders | ✅ Vollständig |
| **DOKUMENTE** | documents (DMS mit Versionierung) | ✅ Vollständig |
| **REPORTING** | reports (17 Berichtstypen) | ✅ Vollständig |

### 1.3 Datenbankschema (Prisma)

**Schema-Umfang:** ~3.900 Zeilen, ~80+ Modelle

**Kern-Entitäten:**
```
Company (Multi-Tenant Root)
├── User (mit Memberships für Multi-Company)
├── Customer / Supplier / Contact / Lead
├── Product / ProductCategory / InventoryMovement
├── Quote → Order → DeliveryNote → Invoice
├── PurchaseOrder → PurchaseInvoice → GoodsReceipt
├── Project → Task → TimeEntry
├── Employee → Absence → Training → Contract
├── Invoice → Payment → Reminder
├── ChartOfAccount → JournalEntry
├── BankAccount → BankTransaction
├── CostCenter → Budget
├── BOM → ProductionOrder → QualityCheck
├── Campaign → Lead → LeadActivity
├── ServiceTicket
├── Subscription → SubscriptionPlan
├── Role → RolePermission → UserCompanyMembership
└── AuditLog, Folder, DMSDocument
```

### 1.4 API-Kommunikation

**Muster:**
```typescript
// Frontend Hook (TanStack Query)
useCustomers({ search, pageSize }) → GET /api/customers?search=...&pageSize=...

// API Response Format (paginiert)
{
  data: Customer[],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}
```

**Authentifizierung:**
- JWT Access Token (15min Gültigkeit)
- Refresh Token (7 Tage)
- Auto-Refresh bei 401

**Guard-Kette (Backend):**
1. JwtAuthGuard → Token-Validierung
2. CompanyGuard → Tenant-Zugehörigkeit + Status prüfen
3. SubscriptionGuard → Abo aktiv?
4. PermissionGuard → Modulrechte (RBAC)
5. PlanLimitsGuard → Nutzungsobergrenzen

### 1.5 Benutzer-Flows (Real implementiert)

| Flow | Route | Backend Endpoint | Status |
|------|-------|------------------|--------|
| Login | /login → /select-company → /dashboard | POST /auth/login | ✅ |
| Kunden anlegen | /customers → /customers/new | POST /customers | ✅ |
| Angebot → Auftrag | /quotes/:id → "Konvertieren" | POST /quotes/:id/convert-to-order | ✅ |
| Rechnung erstellen | /orders/:id → "Rechnung erstellen" | POST /orders/:id/create-invoice | ✅ |
| Zahlung erfassen | /invoices/:id → "Zahlung" | POST /invoices/:id/payment | ✅ |
| Mahnung senden | /reminders → Batch-Workflow | POST /reminders/batch | ✅ |
| Zeit buchen | /time-tracking | POST /time-entries | ✅ |
| Mitarbeiter einladen | /settings → Team | POST /invitations | ✅ |

---

## 2. Funktionsprüfung (Realverhalten)

### 2.1 Vollständig funktional ✅

| Funktion | Request | Datenbank-Aktion |
|----------|---------|------------------|
| Kunde erstellen | POST /customers | INSERT customer |
| Kunde aktualisieren | PUT /customers/:id | UPDATE customer |
| Angebot konvertieren | POST /quotes/:id/convert-to-order | INSERT order + order_items |
| Rechnung mit QR-Referenz | POST /invoices | INSERT + QR-Referenz generiert |
| Zahlung verbuchen | POST /invoices/:id/payment | UPDATE invoice (paidAmount, status) |
| Mahnung erstellen | POST /reminders | INSERT reminder |
| Zeiterfassung | POST /time-entries | INSERT time_entry |
| Abwesenheit beantragen | POST /absences | INSERT absence (status: PENDING) |

### 2.2 Teilweise implementiert ⚠️

| Funktion | Problem | Empfehlung |
|----------|---------|------------|
| **Kunde löschen** | Soft-Delete (isActive=false), aber Liste zeigt alle | ✅ FIX EINGEREICHT (Hard Delete) |
| **E-Mail-Versand** | UI vorhanden, Backend-Service Placeholder | SMTP-Integration benötigt |
| **PDF-Export** | Frontend-seitig (jspdf), keine Server-Generierung | Server-PDF für QR-Rechnung |
| **Bank-Import** | camt.054 Parser vorhanden, Abgleich manuell | Auto-Matching implementieren |
| **Swissdec-Export** | XML-Generator vorhanden, keine SFTP-Übertragung | Produktions-Zertifikat nötig |

### 2.3 Nur UI / Placeholder 🔴

| Funktion | Status | Was fehlt |
|----------|--------|-----------|
| **Stripe/Zahls.ch Integration** | externalIds in Schema, kein Webhook | Zahlungsanbieter anbinden |
| **E-Mail-Marketing-Versand** | UI vorhanden | Mailgun/SendGrid Integration |
| **OCR für Einkaufsrechnungen** | Endpoint existiert, kein OCR-Service | OCR-API (z.B. Google Vision) |
| **TWINT-Zahlung (Shop)** | In shopSettings erwähnt | Payment Gateway fehlt |

### 2.4 Technische Schulden

1. **Inkonsistente Delete-Strategie:** Manche Module Soft-Delete, andere Hard-Delete
2. **Fehlende Transaktionen:** Einige kritische Multi-Table-Operationen ohne $transaction
3. **Keine Tests:** Weder Unit- noch E2E-Tests vorhanden
4. **Fehlende Audit-Logs:** AuditLog-Modul existiert, wird aber nicht durchgehend genutzt
5. **Duplikate in Schemas:** Teilweise redundante Felder (z.B. `role` in User UND in Membership)

---

## 3. SOLL-Stand – ERP-System (Referenzmodell)

### 3.1 Kernfunktionen eines vollwertigen ERP

| Bereich | Mindestanforderung | Loomora IST |
|---------|-------------------|-------------|
| **Stammdaten** | Kunden, Lieferanten, Produkte, Mitarbeiter | ✅ Vollständig |
| **Verkauf** | Angebot → Auftrag → Lieferschein → Rechnung | ✅ Vollständig |
| **Einkauf** | Bestellung → Wareneingang → Rechnung | ✅ Vollständig |
| **Lager** | Bestand, Bewegungen, Mindestbestand-Warnungen | ✅ Vollständig |
| **Finanzen** | Kontenplan, Journalbuchungen, Bilanz, GuV | ✅ Vollständig |
| **Debitoren** | Offene Posten, Mahnwesen, Zahlungsabgleich | ✅ Vollständig |
| **Kreditoren** | Eingangsrechnungen, Zahlungsläufe | ✅ Teilweise (Zahllauf fehlt) |
| **HR** | Mitarbeiter, Abwesenheiten, Zeiterfassung | ✅ Vollständig |
| **Lohn** | Lohnabrechnung, Sozialversicherungen | ✅ Vollständig (GAV-konform) |
| **Produktion** | Stücklisten, Fertigungsaufträge | ✅ Vollständig |
| **Qualität** | Checklisten, Prüfprotokolle | ✅ Vollständig |
| **Service** | Tickets, Wartungsverträge | ✅ Vollständig |
| **CRM** | Leads, Kampagnen, Pipeline | ✅ Vollständig |
| **Reporting** | Standard-Berichte, Export (PDF/CSV) | ✅ Vollständig |
| **Compliance** | Revisionssichere Logs, Aufbewahrungspflicht | ⚠️ Teilweise |
| **Integrationen** | Bank (ISO 20022), Steuer, E-Mail | ⚠️ Teilweise |

### 3.2 Schweizer Spezialfunktionen

| Funktion | Anforderung | Loomora IST |
|----------|-------------|-------------|
| **QR-Rechnung** | ISO 20022, Swiss QR-Code | ✅ Implementiert |
| **MwSt-Abrechnung** | ESTV 050, eCH-0217 XML | ✅ Implementiert |
| **Swissdec** | ELM/XML Lohnmeldung | ✅ Generator vorhanden |
| **camt.054** | Bank-Avis Import | ✅ Parser vorhanden |
| **KMU-Kontenplan** | 4-stellige Konten | ✅ Implementiert |
| **GAV Metallbau** | Mindestlöhne, Zuschläge | ✅ Implementiert |

---

## 4. GAP-Analyse (IST vs. SOLL)

### 4.1 Vollständig vorhanden ✅

- Stammdatenverwaltung (Kunden, Lieferanten, Produkte, Mitarbeiter)
- Kompletter Verkaufsprozess (Quote → Order → Delivery → Invoice)
- Kompletter Einkaufsprozess (PO → Receipt → Invoice)
- Lagerverwaltung mit Bestandsführung
- Finanzbuchhaltung (KMU-Kontenrahmen)
- HR mit Zeiterfassung und Abwesenheiten
- Lohnbuchhaltung (GAV-konform)
- Produktion mit Stücklisten
- Multi-Tenant mit Subscription Management
- Rollenbasierte Zugriffskontrolle (RBAC)
- Swiss QR-Rechnung

### 4.2 Teilweise vorhanden ⚠️

| Funktion | IST | SOLL | Aufwand |
|----------|-----|------|---------|
| **E-Mail-Versand** | UI + Struktur | Echte SMTP-Anbindung | 2-4h |
| **PDF-Generation** | Client-seitig | Server-seitig mit Templates | 8-16h |
| **Bank-Abgleich** | Manuell | Auto-Matching | 16-24h |
| **Audit-Logging** | Modul existiert | Durchgehend aktiv | 4-8h |
| **Zahllauf (Kreditoren)** | - | SEPA/ISO 20022 pain.001 | 16-24h |

### 4.3 Fehlt komplett 🔴

| Funktion | Priorität | Aufwand | Beschreibung |
|----------|-----------|---------|--------------|
| **Payment Gateway** | HOCH | 24-40h | Stripe/Zahls.ch für Subscriptions |
| **E-Mail-Service** | MITTEL | 8-16h | SendGrid/Mailgun Integration |
| **OCR-Service** | NIEDRIG | 16-24h | Automatische Rechnungserfassung |
| **Test-Suite** | HOCH | 40-80h | Unit + E2E Tests |
| **Monitoring** | MITTEL | 8-16h | Error Tracking, APM |

---

## 5. Daten & Prozesse

### 5.1 Datenstruktur-Bewertung

| Kriterium | Bewertung | Anmerkung |
|-----------|-----------|-----------|
| **ERP-fähig** | ✅ Ja | Schema deckt alle ERP-Bereiche ab |
| **Multi-Tenant-isoliert** | ✅ Ja | companyId konsequent auf allen Tabellen |
| **Historisierbar** | ⚠️ Teilweise | Keine separate History-Tabelle, aber AuditLog |
| **Erweiterbar** | ✅ Ja | Saubere Modularität, JSON-Felder für Settings |
| **Normalisiert** | ✅ Ja | 3NF mit sinnvollen Denormalisierungen |

### 5.2 Fehlende Entitäten (für vollständiges ERP)

- `PaymentRun` (Sammel-Zahlungsläufe)
- `FiscalYear` (Geschäftsjahre mit Lock-Status)
- `DocumentTemplate` (PDF-Vorlagen)
- `EmailLog` (gesendete E-Mails)

### 5.3 Prozesslogik-Status

| Prozess | Vollständig | Automatisiert |
|---------|-------------|---------------|
| Quote → Order → Invoice | ✅ | ⚠️ Manuell |
| Mahnstufen-Eskalation | ✅ | 🔴 Manuell |
| Lagerbestand-Update bei Lieferung | ✅ | ✅ Automatisch |
| Buchungssatz bei Zahlung | ⚠️ | 🔴 Nicht implementiert |
| Swissdec-Meldung | ✅ | 🔴 Manuell |

---

## 6. Handlungsempfehlungen & Roadmap

### Phase 1: Kurzfristig (1-2 Wochen) – Quick Wins

| # | Aufgabe | Aufwand | Priorität |
|---|---------|---------|-----------|
| 1 | ✅ Hard-Delete für Kunden implementieren | 1h | ERLEDIGT |
| 2 | Audit-Logging durchgehend aktivieren | 4h | HOCH |
| 3 | Konsistente Delete-Strategie (Hard vs. Soft) | 4h | HOCH |
| 4 | PM2 Autostart einrichten (pm2 save && pm2 startup) | 0.5h | HOCH |
| 5 | Fehlerbehandlung im Frontend verbessern | 4h | MITTEL |

### Phase 2: Mittelfristig (1-2 Monate) – Produktionsreife

| # | Aufgabe | Aufwand | Priorität |
|---|---------|---------|-----------|
| 6 | E-Mail-Service (SMTP via SendGrid/Mailgun) | 8h | HOCH |
| 7 | PDF-Generation Server-seitig (Puppeteer/PDFKit) | 16h | HOCH |
| 8 | Stripe/Zahls.ch Webhook für Subscriptions | 24h | HOCH |
| 9 | Automatischer Bank-Abgleich (camt.054 Matching) | 16h | MITTEL |
| 10 | Test-Suite (Vitest + Playwright) | 40h | MITTEL |

### Phase 3: Langfristig (3-6 Monate) – Enterprise-Features

| # | Aufgabe | Aufwand | Priorität |
|---|---------|---------|-----------|
| 11 | SEPA Zahllauf (pain.001 Export) | 24h | MITTEL |
| 12 | Automatische Buchungssätze (Journal) | 32h | MITTEL |
| 13 | OCR für Eingangsrechnungen | 24h | NIEDRIG |
| 14 | Mobile App (React Native) | 160h | NIEDRIG |
| 15 | Multi-Currency Support | 40h | NIEDRIG |

---

## 7. Zusammenfassung

### Stärken
- **Vollständiges Datenmodell:** Schema deckt ERP-Standardfunktionen ab
- **Multi-Tenant-Ready:** Robuste Company/Subscription/Role-Architektur
- **Schweizer Konformität:** QR-Rechnung, MwSt, Swissdec, GAV
- **Moderne Technologie:** NestJS, Prisma 7, React, TypeScript
- **Produktionsumgebung:** Live auf eigener Infrastruktur

### Schwächen
- **Fehlende Integrationen:** E-Mail, Payment, OCR nicht produktiv
- **Keine Tests:** Hohes Risiko bei Änderungen
- **Inkonsistenzen:** Delete-Verhalten, Audit-Nutzung
- **Dokumentation:** Technisch vorhanden, fachlich lückenhaft

### Gesamtbewertung

| Kriterium | Score | Max |
|-----------|-------|-----|
| Architektur | 9/10 | Exzellent |
| Funktionsumfang | 8/10 | Umfassend |
| Datenmodell | 9/10 | ERP-vollständig |
| Produktionsreife | 6/10 | Integrationen fehlen |
| Testabdeckung | 1/10 | Kritisch |
| **Gesamt** | **7/10** | **Gutes Fundament** |

---

**Fazit:** Loomora ERP ist architektonisch solide und funktional umfassend. Die Hauptlücken liegen bei externen Integrationen (E-Mail, Payment, Bank) und der fehlenden Test-Suite. Mit den empfohlenen Quick Wins und der Phase-2-Roadmap kann das System innerhalb von 1-2 Monaten produktionsreif für Endkunden werden.
