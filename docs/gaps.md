# Loomora ERP – Gap Report (Frontend vs. Backend)

> Vergleich: Frontend-Hooks (src/hooks/) vs. Backend-Module (backend/src/modules/)
> **Stand**: 2026-02-20

## Phase 0 – Stack-Erkennung

| Eigenschaft | Wert |
|---|---|
| Framework | **NICHT Next.js** — React + Vite (Frontend), NestJS (Backend) |
| Router | React Router DOM (Pages Router Pattern) |
| ORM | Prisma (schema.prisma, 4429 Zeilen) |
| DB | PostgreSQL |
| Backend-Verzeichnis | `/backend` (NestJS, primär) |
| Altes Backend | `/server` (Fastify, Legacy, nicht im Einsatz) |
| API-Prefix | `/api` (global prefix in main.ts) |
| Auth | JWT (Passport Strategy) |
| Multi-Tenant | companyId in allen Tabellen |
| Deployment | PM2, app.loomora.ch |

## Modul-Abgleich

### ✅ Backend-Module vorhanden (53 Module in app.module.ts)

Alle 53 Module aus `backend/src/modules/` sind in `app.module.ts` registriert. Die Frage ist: **liefern sie die vom Frontend erwarteten Responses?**

### ⚠️ Bekannte Mismatch-Kategorien (aus Memory)

Laut `.lovable/full-system-checklist.md` gibt es **33 identifizierte Mismatches** in 7 Kategorien:

| Kategorie | Beschreibung | Anzahl |
|---|---|---|
| A | Stats-Feldnamen (Frontend erwartet z.B. `total`, Backend liefert `totalAmount`) | 18 |
| B | Enum/Status-Konflikte (z.B. Task Status CANCELLED vs. nicht vorhanden) | ~3 |
| C | Fehlende Schema-Felder (Company) | ~2 |
| D | Fehlende Query-Filter (Users `isActive`, `role`) | ~2 |
| E | Listen-Response-Struktur (fehlende `data[]` Wrapper) | ~3 |
| F | Kalender-Response-Struktur | ~1 |
| G | Supplier Stats | ~1 |

### 🔴 Kritische Gaps

#### 1. WithholdingTax-Modul deaktiviert
```ts
// app.module.ts Zeile 51:
// import { WithholdingTaxModule } from './modules/withholding-tax/withholding-tax.module';
// Disabled: Decimal type issues
```
Frontend erwartet aber 8 Endpoints unter `/withholding-tax/*`.

#### 2. Inventory-Modul fehlt im Backend
Frontend hat `use-inventory.ts` mit Endpoints unter `/inventory/*`.
Backend hat **kein** Inventory-Modul in app.module.ts.
→ **Endpoints fehlen komplett**: GET/PUT/POST/DELETE `/inventory/*`

#### 3. Payslips als eigener Controller?
Frontend ruft `/payslips/:id` und `/payslips` direkt auf (nicht unter `/payroll/payslips`).
→ Prüfen ob Backend separate Payslip-Routen hat oder ob sie unter PayrollModule laufen.

#### 4. Response-Mapper-Konsistenz
Backend nutzt `response.mapper.ts` zur Transformation. Mögliche Diskrepanzen:
- `date` → `issueDate` bei Invoices
- `totalAmount` → `total`
- Stats-Felder Mismatch

### 🟡 Potenzielle Risiken

| Bereich | Risiko |
|---|---|
| PDF-Generierung | Frontend erwartet Binary-Blob von `GET /:type/:id/pdf` — Backend muss PDFs generieren |
| E-Mail-Versand | Frontend ruft `POST /:type/:id/send` — Backend braucht SMTP/Mailer |
| OCR | `/purchase-invoices/extract-ocr` — Backend braucht OCR-Service |
| Bank Import | `/bank-import/camt054` — XML-Parsing nötig |
| Swissdec | XML-Generierung + Validierung |
| File Upload | `/documents/upload` als multipart — Backend braucht File-Storage |

### 🟢 Quick Wins (vermutlich funktionierend)

Module die einfaches CRUD + Stats sind und bereits im Backend existieren:
- Customers, Suppliers, Products
- Projects, Tasks, Employees
- Dashboard
- Departments, Absences
- Calendar

### Backend-Dateien die NICHT gelesen werden dürfen (Frontend-Schutz)

Gemäss Memory: `/src` ist Read-Only für Backend-Agent. Lovable darf nur `/backend` und `schema.prisma` ändern.

## Empfohlene Vorgehensweise

1. **Stats-Endpoints abgleichen** — 18 Module mit Feldnamen-Mismatch
2. **WithholdingTax aktivieren** — Decimal-Issue lösen
3. **Inventory-Modul erstellen** — komplett fehlend
4. **Response-Mapper prüfen** — für alle Module
5. **Pagination-Wrapper** — alle Listen müssen `{ data[], total, page, pageSize }` liefern
