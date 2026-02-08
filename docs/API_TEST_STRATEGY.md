# API-Teststrategie für Loomora ERP

**Version:** 1.0  
**Datum:** 2026-02-08  
**Ziel-API:** `https://app.loomora.ch/api`

---

## Inhaltsverzeichnis

1. [Smoke Testing](#1-smoke-testing)
2. [Functional Testing](#2-functional-testing)
3. [Integration Testing](#3-integration-testing)
4. [UI–API Testing](#4-ui-api-testing)
5. [Load Testing](#5-load-testing)
6. [Stress Testing](#6-stress-testing)
7. [Security Testing](#7-security-testing)
8. [Automatisierung & CI/CD](#8-automatisierung--cicd)

---

## 1. Smoke Testing

**Zweck:** Schnelle Überprüfung, ob die API grundsätzlich erreichbar ist und Basisfunktionen arbeiten.

### Testfälle

| # | Ziel | Input | Expected Result |
|---|------|-------|-----------------|
| S-01 | Health-Check Endpunkt | `GET /api/health` | Status 200, `{ status: "ok" }` |
| S-02 | API-Root erreichbar | `GET /api` | Status 200 oder 404 (kein 5xx) |
| S-03 | Auth-Endpunkt verfügbar | `POST /api/auth/login` (leer) | Status 400/401 (nicht 5xx) |
| S-04 | Datenbank-Konnektivität | `GET /api/customers?page=1&pageSize=1` | Status 200 mit Daten-Array |
| S-05 | OpenAPI/Swagger Docs | `GET /api/docs` | Status 200, HTML-Response |

### Beispiel-Requests

```bash
# S-01: Health Check
curl -X GET "https://app.loomora.ch/api/health" \
  -H "Accept: application/json"

# S-02: API-Root
curl -I "https://app.loomora.ch/api"

# S-03: Auth-Endpunkt Smoke
curl -X POST "https://app.loomora.ch/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{}'

# S-04: Datenbank-Konnektivität (mit Auth)
curl -X GET "https://app.loomora.ch/api/customers?page=1&pageSize=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Automatisierung

```yaml
# GitHub Actions Smoke Test
smoke-test:
  runs-on: ubuntu-latest
  steps:
    - name: Health Check
      run: |
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.loomora.ch/api/health)
        if [ "$STATUS" != "200" ]; then exit 1; fi
```

---

## 2. Functional Testing

**Zweck:** Verifizierung aller Endpunkte gemäß API-Spezifikation (CRUD-Operationen).

### 2.1 Authentication Module

| # | Ziel | Method | Endpoint | Input | Expected Result |
|---|------|--------|----------|-------|-----------------|
| F-AUTH-01 | Login erfolgreich | POST | `/auth/login` | Valide Credentials | 200, `{ accessToken, refreshToken, user }` |
| F-AUTH-02 | Login ungültig | POST | `/auth/login` | Falsches PW | 401, `{ error: "Ungültige Anmeldedaten" }` |
| F-AUTH-03 | Login ohne Daten | POST | `/auth/login` | `{}` | 400, Validation Error |
| F-AUTH-04 | Token Refresh | POST | `/auth/refresh` | Valid refreshToken | 200, Neue Tokens |
| F-AUTH-05 | Token Refresh ungültig | POST | `/auth/refresh` | Expired Token | 401, Unauthorized |
| F-AUTH-06 | Registrierung | POST | `/auth/register` | Neue Company-Daten | 201, User + Company erstellt |
| F-AUTH-07 | Doppelte E-Mail | POST | `/auth/register` | Existierende E-Mail | 409, Conflict |
| F-AUTH-08 | Current User | GET | `/auth/me` | Valid Token | 200, User-Objekt |
| F-AUTH-09 | Logout | POST | `/auth/logout` | Valid Token | 204, No Content |

```bash
# F-AUTH-01: Erfolgreicher Login
curl -X POST "https://app.loomora.ch/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@loomora.ch",
    "password": "SecurePass123!"
  }'

# F-AUTH-04: Token Refresh
curl -X POST "https://app.loomora.ch/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'

# F-AUTH-08: Current User abrufen
curl -X GET "https://app.loomora.ch/api/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 2.2 Customers Module (CRM)

| # | Ziel | Method | Endpoint | Input | Expected Result |
|---|------|--------|----------|-------|-----------------|
| F-CUST-01 | Liste abrufen | GET | `/customers` | Token + Query | 200, Paginated Array |
| F-CUST-02 | Einzeln abrufen | GET | `/customers/:id` | Valid ID | 200, Customer-Objekt |
| F-CUST-03 | Nicht gefunden | GET | `/customers/:id` | Invalid ID | 404, Not Found |
| F-CUST-04 | Erstellen | POST | `/customers` | Customer-Daten | 201, Neuer Kunde |
| F-CUST-05 | Erstellen ohne Name | POST | `/customers` | `{}` | 400, Validation Error |
| F-CUST-06 | Aktualisieren | PUT | `/customers/:id` | Partial Update | 200, Updated Customer |
| F-CUST-07 | Löschen | DELETE | `/customers/:id` | Valid ID | 204, No Content |
| F-CUST-08 | Suche | GET | `/customers?search=xyz` | Suchbegriff | 200, Gefilterte Liste |
| F-CUST-09 | Pagination | GET | `/customers?page=2&pageSize=10` | Page Params | 200, Seite 2 mit 10 Items |

```bash
# F-CUST-01: Kunden-Liste
curl -X GET "https://app.loomora.ch/api/customers?page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"

# F-CUST-04: Kunde erstellen
curl -X POST "https://app.loomora.ch/api/customers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Muster AG",
    "email": "info@muster.ch",
    "phone": "+41 44 123 45 67",
    "street": "Bahnhofstrasse 1",
    "zipCode": "8001",
    "city": "Zürich",
    "country": "CH",
    "paymentTermDays": 30
  }'

# F-CUST-06: Kunde aktualisieren
curl -X PUT "https://app.loomora.ch/api/customers/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentTermDays": 45,
    "discount": 5
  }'

# F-CUST-07: Kunde löschen
curl -X DELETE "https://app.loomora.ch/api/customers/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer $TOKEN"
```

### 2.3 Suppliers Module

| # | Ziel | Method | Endpoint | Input | Expected Result |
|---|------|--------|----------|-------|-----------------|
| F-SUPP-01 | Liste abrufen | GET | `/suppliers` | Token | 200, Paginated Array |
| F-SUPP-02 | Einzeln abrufen | GET | `/suppliers/:id` | Valid ID | 200, Supplier-Objekt |
| F-SUPP-03 | Erstellen | POST | `/suppliers` | Supplier-Daten | 201, Neuer Lieferant |
| F-SUPP-04 | Aktualisieren | PUT | `/suppliers/:id` | Partial Update | 200, Updated Supplier |
| F-SUPP-05 | Löschen (Hard) | DELETE | `/suppliers/:id` | Valid ID | 204, No Content |
| F-SUPP-06 | Rating setzen | PUT | `/suppliers/:id` | Rating 1-5 | 200, Rating gespeichert |

```bash
# F-SUPP-03: Lieferant erstellen
curl -X POST "https://app.loomora.ch/api/suppliers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Parts GmbH",
    "email": "einkauf@techparts.ch",
    "iban": "CH93 0076 2011 6238 5295 7",
    "paymentTermDays": 30,
    "rating": 4
  }'
```

### 2.4 Products Module

| # | Ziel | Method | Endpoint | Input | Expected Result |
|---|------|--------|----------|-------|-----------------|
| F-PROD-01 | Liste abrufen | GET | `/products` | Token + Query | 200, Paginated Array |
| F-PROD-02 | Nach Kategorie | GET | `/products?categoryId=x` | Kategorie-ID | 200, Gefilterte Produkte |
| F-PROD-03 | Erstellen | POST | `/products` | Product-Daten | 201, Neues Produkt |
| F-PROD-04 | Lagerbestand prüfen | GET | `/products/:id` | Valid ID | 200, inkl. stockQuantity |
| F-PROD-05 | Stock Update | PUT | `/products/:id/stock` | Quantity-Delta | 200, Updated Stock |
| F-PROD-06 | Low Stock Alert | GET | `/products?lowStock=true` | Filter | 200, Products < minStock |

```bash
# F-PROD-03: Produkt erstellen
curl -X POST "https://app.loomora.ch/api/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell XPS 15",
    "sku": "DELL-XPS-15-2026",
    "purchasePrice": 1200.00,
    "salePrice": 1899.00,
    "vatRate": "STANDARD",
    "stockQuantity": 25,
    "minStock": 5,
    "unit": "Stk",
    "categoryId": "uuid-kategorie"
  }'
```

### 2.5 Sales Module (Quotes, Orders, Invoices)

| # | Ziel | Method | Endpoint | Input | Expected Result |
|---|------|--------|----------|-------|-----------------|
| F-QUOTE-01 | Angebot erstellen | POST | `/quotes` | Quote-Daten | 201, Neues Angebot |
| F-QUOTE-02 | Status ändern | POST | `/quotes/:id/accept` | Valid ID | 200, Status = ACCEPTED |
| F-QUOTE-03 | PDF generieren | GET | `/quotes/:id/pdf` | Valid ID | 200, application/pdf |
| F-ORDER-01 | Auftrag aus Angebot | POST | `/orders/from-quote/:id` | Quote-ID | 201, Neuer Auftrag |
| F-ORDER-02 | Lieferschein | POST | `/orders/:id/delivery-note` | Order-ID | 200, Delivery Note erstellt |
| F-INV-01 | Rechnung erstellen | POST | `/invoices` | Invoice-Daten | 201, Neue Rechnung |
| F-INV-02 | Zahlung buchen | POST | `/invoices/:id/payment` | Payment-Daten | 200, Zahlung verbucht |
| F-INV-03 | Mahnung senden | POST | `/invoices/:id/reminder` | Reminder-Level | 200, Reminder erstellt |

```bash
# F-QUOTE-01: Angebot erstellen
curl -X POST "https://app.loomora.ch/api/quotes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid-kunde",
    "validUntil": "2026-03-08",
    "items": [
      {
        "productId": "uuid-produkt",
        "quantity": 2,
        "unitPrice": 1899.00,
        "discount": 10
      }
    ],
    "notes": "Gültig 30 Tage"
  }'

# F-INV-02: Zahlung buchen
curl -X POST "https://app.loomora.ch/api/invoices/uuid-rechnung/payment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.00,
    "paymentDate": "2026-02-08",
    "paymentMethod": "BANK_TRANSFER",
    "reference": "QRR-12345678"
  }'
```

### 2.6 Financial Module (Journal Entries, Accounts)

| # | Ziel | Method | Endpoint | Input | Expected Result |
|---|------|--------|----------|-------|-----------------|
| F-JE-01 | Buchung erstellen | POST | `/journal-entries` | Entry-Daten | 201, Draft-Buchung |
| F-JE-02 | Buchung verbuchen | POST | `/journal-entries/:id/post` | Entry-ID | 200, Status = POSTED |
| F-JE-03 | Saldenliste | GET | `/journal-entries/trial-balance` | Datumsbereich | 200, Balance Sheet |
| F-JE-04 | Stornobuchung | POST | `/journal-entries/:id/reverse` | Entry-ID | 201, Reversal erstellt |

```bash
# F-JE-01: Manuelle Buchung
curl -X POST "https://app.loomora.ch/api/journal-entries" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-02-08",
    "description": "Miete Februar 2026",
    "lines": [
      { "accountId": "uuid-aufwand-miete", "debit": 2500.00, "credit": 0 },
      { "accountId": "uuid-bank", "debit": 0, "credit": 2500.00 }
    ]
  }'

# F-JE-03: Saldenliste
curl -X GET "https://app.loomora.ch/api/journal-entries/trial-balance?startDate=2026-01-01&endDate=2026-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. Integration Testing

**Zweck:** Testen der API im Zusammenspiel mit Datenbank und externen Services.

### Testfälle

| # | Ziel | Szenario | Expected Result |
|---|------|----------|-----------------|
| I-01 | DB-Transaktion | Kunde + Rechnung in einer TX erstellen | Beide oder keiner erstellt |
| I-02 | Cascade Delete | Kunde löschen mit Rechnungen | 400, "Hat offene Rechnungen" |
| I-03 | Foreign Key | Produkt mit ungültiger Kategorie | 400, FK-Violation |
| I-04 | Unique Constraint | Doppelte SKU erstellen | 409, Duplicate Entry |
| I-05 | Company Isolation | User A sieht Daten von Company B | 403/404, Kein Zugriff |
| I-06 | Nummer-Generator | 2 Rechnungen parallel erstellen | Eindeutige Nummern |
| I-07 | Stock Consistency | Gleichzeitige Stock-Updates | Korrekter Endbestand |

### Beispiel: Multi-Tenant Isolation

```bash
# Token für Company A
TOKEN_A="eyJhbGciOi..."

# Token für Company B  
TOKEN_B="eyJhbGciOi..."

# Kunde von Company A abrufen mit Token B (sollte 404 sein)
curl -X GET "https://app.loomora.ch/api/customers/kunde-von-company-a" \
  -H "Authorization: Bearer $TOKEN_B"
# Expected: 404 Not Found
```

### Beispiel: Transaktionale Integrität

```bash
# Auftrag erstellen sollte Stock reservieren
curl -X POST "https://app.loomora.ch/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid",
    "items": [{ "productId": "uuid", "quantity": 10 }]
  }'

# Prüfen ob Stock reduziert wurde
curl -X GET "https://app.loomora.ch/api/products/uuid" \
  -H "Authorization: Bearer $TOKEN"
# Expected: reservedStock += 10
```

---

## 4. UI–API Testing

**Zweck:** Validierung der Interaktion zwischen Frontend und Backend.

### Testfälle

| # | UI-Aktion | API-Call | Validation |
|---|-----------|----------|------------|
| U-01 | Login-Form Submit | `POST /auth/login` | Token in localStorage, Redirect zu /dashboard |
| U-02 | Kunde erstellen Dialog | `POST /customers` | Toaster "Erfolgreich", Liste aktualisiert |
| U-03 | Tabellen-Pagination | `GET /customers?page=2` | Korrekte Seite angezeigt |
| U-04 | Suche in Kundenliste | `GET /customers?search=xyz` | Gefilterte Ergebnisse |
| U-05 | Löschen mit Confirm | `DELETE /customers/:id` | Dialog → API-Call → Refresh |
| U-06 | PDF-Download Button | `GET /invoices/:id/pdf` | PDF öffnet sich/Download |
| U-07 | Form Validation | Kein API-Call | Frontend-Fehlermeldungen |
| U-08 | Optimistic Update | `PUT /customers/:id` | UI sofort, Rollback bei Fehler |

### Playwright Test-Beispiel

```typescript
// tests/e2e/customer-crud.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Customer CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@loomora.ch');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create customer', async ({ page }) => {
    await page.goto('/customers');
    await page.click('text=Neuer Kunde');
    
    await page.fill('[name="name"]', 'Test AG');
    await page.fill('[name="email"]', 'test@example.ch');
    
    // Intercept API call
    const [response] = await Promise.all([
      page.waitForResponse(resp => 
        resp.url().includes('/api/customers') && 
        resp.request().method() === 'POST'
      ),
      page.click('button:has-text("Speichern")')
    ]);
    
    expect(response.status()).toBe(201);
    await expect(page.locator('text=Test AG')).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/customers');
    await page.click('text=Neuer Kunde');
    await page.click('button:has-text("Speichern")');
    
    await expect(page.locator('text=Name ist erforderlich')).toBeVisible();
  });
});
```

### API-Mock für Offline-Testing

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/customers', () => {
    return HttpResponse.json({
      data: [
        { id: '1', name: 'Mock AG', email: 'mock@test.ch' }
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1
    });
  }),
  
  http.post('/api/customers', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 'new-uuid', ...body }, { status: 201 });
  }),
];
```

---

## 5. Load Testing

**Zweck:** Simulation von erwartetem Traffic zur Performance-Validierung.

### Metriken & Zielwerte

| Metrik | Zielwert | Kritischer Wert |
|--------|----------|-----------------|
| Response Time (P50) | < 200ms | > 500ms |
| Response Time (P95) | < 500ms | > 1000ms |
| Response Time (P99) | < 1000ms | > 2000ms |
| Throughput | > 100 req/s | < 50 req/s |
| Error Rate | < 0.1% | > 1% |
| CPU Usage | < 70% | > 90% |
| Memory Usage | < 80% | > 95% |

### Szenarien

| Szenario | VUs | Dauer | Ramp-Up | Description |
|----------|-----|-------|---------|-------------|
| Baseline | 10 | 5min | 1min | Normale Last |
| Peak | 50 | 10min | 2min | Spitzenzeiten |
| Endurance | 30 | 60min | 5min | Dauerlast |

### k6 Load Test Script

```javascript
// tests/load/api-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');

export const options = {
  stages: [
    { duration: '2m', target: 20 },  // Ramp-up
    { duration: '5m', target: 50 },  // Peak load
    { duration: '2m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = 'https://app.loomora.ch/api';

export function setup() {
  // Login und Token holen
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'loadtest@loomora.ch',
    password: 'LoadTest123!',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  return { token: loginRes.json('accessToken') };
}

export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Scenario 1: Dashboard laden
  const dashboardRes = http.get(`${BASE_URL}/dashboard/stats`, { headers });
  check(dashboardRes, {
    'dashboard status 200': (r) => r.status === 200,
    'dashboard < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(dashboardRes.status !== 200);
  
  sleep(1);

  // Scenario 2: Kundenliste
  const customersRes = http.get(`${BASE_URL}/customers?page=1&pageSize=20`, { headers });
  check(customersRes, {
    'customers status 200': (r) => r.status === 200,
    'customers has data': (r) => r.json('data').length >= 0,
  });
  
  sleep(1);

  // Scenario 3: Einzelnen Kunden abrufen (Random)
  const customerId = 'some-uuid'; // In real test: from customer list
  const customerRes = http.get(`${BASE_URL}/customers/${customerId}`, { headers });
  check(customerRes, {
    'customer status 200/404': (r) => [200, 404].includes(r.status),
  });
  
  sleep(2);

  // Scenario 4: Suche
  const searchRes = http.get(`${BASE_URL}/customers?search=test`, { headers });
  check(searchRes, {
    'search status 200': (r) => r.status === 200,
  });
  
  sleep(1);
}

export function teardown(data) {
  // Cleanup if needed
}
```

### Ausführung

```bash
# k6 installieren
brew install k6  # oder: winget install k6

# Test ausführen
k6 run tests/load/api-load-test.js

# Mit Report
k6 run --out json=results.json tests/load/api-load-test.js
```

---

## 6. Stress Testing

**Zweck:** Verhalten bei extremer Last und Failure-Handling testen.

### Szenarien

| Szenario | VUs | Beschreibung |
|----------|-----|--------------|
| Spike Test | 0→200→0 | Plötzlicher Traffic-Anstieg |
| Breaking Point | +10 VU/min | Bis zum Failure erhöhen |
| Soak Test | 50 VU, 4h | Langzeit-Stabilität |

### k6 Stress Test

```javascript
// tests/stress/spike-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Warm-up
    { duration: '1m', target: 200 },   // Spike!
    { duration: '3m', target: 200 },   // Halten
    { duration: '10s', target: 0 },    // Down
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],  // 10% Error-Toleranz bei Stress
    http_req_duration: ['p(95)<2000'],
  },
};

export default function() {
  const res = http.get('https://app.loomora.ch/api/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
}
```

### Erwartetes Failure-Handling

| Situation | Erwartetes Verhalten |
|-----------|---------------------|
| DB Connection Pool erschöpft | 503, Retry nach X Sekunden |
| Memory Limit erreicht | Graceful Degradation, keine Crashes |
| Rate Limit erreicht | 429 Too Many Requests |
| CPU > 100% | Queue-basierte Verarbeitung |
| Timeout | 504 Gateway Timeout |

### Recovery-Test

```bash
# 1. Stress-Last starten
k6 run --vus 100 --duration 5m stress-test.js &

# 2. API-Server neu starten (simuliert Crash)
ssh server "pm2 restart loomora-api"

# 3. Recovery-Zeit messen
while true; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.loomora.ch/api/health)
  if [ "$STATUS" == "200" ]; then
    echo "Recovered at $(date)"
    break
  fi
  sleep 1
done
```

---

## 7. Security Testing

**Zweck:** Identifikation von Sicherheitsrisiken gemäß OWASP API Security Top 10.

### 7.1 Authentication & Authorization

| # | Test | Methode | Expected |
|---|------|---------|----------|
| SEC-01 | Ohne Token | Request ohne Auth-Header | 401 |
| SEC-02 | Ungültiger Token | Manipulierter JWT | 401 |
| SEC-03 | Abgelaufener Token | Expired JWT | 401 |
| SEC-04 | Horizontal Privilege | User A auf Daten von User B | 403/404 |
| SEC-05 | Vertical Privilege | User greift auf Admin-Route | 403 |
| SEC-06 | Token im Response | Login Response | Keine sensiblen Daten |

```bash
# SEC-01: Ohne Token
curl -X GET "https://app.loomora.ch/api/customers" \
  -H "Content-Type: application/json"
# Expected: 401 Unauthorized

# SEC-02: Manipulierter Token
curl -X GET "https://app.loomora.ch/api/customers" \
  -H "Authorization: Bearer invalid.token.here"
# Expected: 401

# SEC-04: Horizontal Privilege Escalation
# Als User A versuchen, Kunde von Company B zu lesen
curl -X GET "https://app.loomora.ch/api/customers/company-b-customer-id" \
  -H "Authorization: Bearer $USER_A_TOKEN"
# Expected: 404 Not Found (nicht 403, um Existenz nicht zu leaken)
```

### 7.2 Input Validation & Injection

| # | Test | Payload | Expected |
|---|------|---------|----------|
| SEC-10 | SQL Injection | `name': DROP TABLE--` | 400, kein DB-Fehler |
| SEC-11 | NoSQL Injection | `{"$gt": ""}` | 400, Validation Error |
| SEC-12 | XSS in Response | `<script>alert(1)</script>` | Escaped im Response |
| SEC-13 | Path Traversal | `../../etc/passwd` | 400, Invalid Path |
| SEC-14 | Command Injection | `; rm -rf /` | 400, Sanitized |
| SEC-15 | SSRF | `url=http://localhost` | 400, Blocked |

```bash
# SEC-10: SQL Injection Test
curl -X POST "https://app.loomora.ch/api/customers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test'\'' OR 1=1 --",
    "email": "test@test.ch"
  }'
# Expected: 400 oder 201 mit escaped name

# SEC-12: XSS Test
curl -X POST "https://app.loomora.ch/api/customers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(document.cookie)</script>",
    "notes": "<img src=x onerror=alert(1)>"
  }'
# Dann abrufen und prüfen ob escaped
```

### 7.3 Rate Limiting & DoS Protection

| # | Test | Aktion | Expected |
|---|------|--------|----------|
| SEC-20 | Login Rate Limit | 10 Fehlversuche/min | 429 nach 5 Versuchen |
| SEC-21 | API Rate Limit | 1000 req/min | 429 nach Limit |
| SEC-22 | Payload Size | 10MB Body | 413 Payload Too Large |
| SEC-23 | Slow Loris | Langsame Verbindung | Timeout nach 30s |

```bash
# SEC-20: Brute Force Test
for i in {1..10}; do
  curl -X POST "https://app.loomora.ch/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.ch","password":"wrong'$i'"}'
  echo "Attempt $i"
done
# Expected: 429 nach ~5 Versuchen

# SEC-22: Large Payload
dd if=/dev/zero bs=1M count=10 | base64 > large.txt
curl -X POST "https://app.loomora.ch/api/customers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"notes\": \"$(cat large.txt)\"}"
# Expected: 413 Payload Too Large
```

### 7.4 OWASP API Security Top 10 Checklist

| # | Vulnerability | Status | Test |
|---|--------------|--------|------|
| API1 | Broken Object Level Authorization | ⬜ | SEC-04 |
| API2 | Broken Authentication | ⬜ | SEC-01 bis SEC-06 |
| API3 | Broken Object Property Level Authorization | ⬜ | Mass Assignment Test |
| API4 | Unrestricted Resource Consumption | ⬜ | SEC-20 bis SEC-23 |
| API5 | Broken Function Level Authorization | ⬜ | SEC-05 |
| API6 | Unrestricted Access to Sensitive Business Flows | ⬜ | Business Logic Tests |
| API7 | Server Side Request Forgery | ⬜ | SEC-15 |
| API8 | Security Misconfiguration | ⬜ | Header Analysis |
| API9 | Improper Inventory Management | ⬜ | Endpoint Discovery |
| API10 | Unsafe Consumption of APIs | ⬜ | Third-Party Integration Tests |

### Security Headers Check

```bash
curl -I "https://app.loomora.ch/api/health"

# Expected Headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000
# Content-Security-Policy: default-src 'self'
# X-XSS-Protection: 1; mode=block
```

---

## 8. Automatisierung & CI/CD

### Empfohlene Tools

| Kategorie | Tool | Zweck |
|-----------|------|-------|
| Unit/Integration | Vitest, Jest | Backend Unit Tests |
| E2E | Playwright | UI + API Testing |
| Load | k6, Artillery | Performance Testing |
| Security | OWASP ZAP, Nuclei | Vulnerability Scanning |
| API Contract | Dredd, Spectral | OpenAPI Validation |
| Monitoring | Prometheus, Grafana | Production Metrics |

### GitHub Actions Pipeline

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - name: Health Check
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.API_URL }}/health)
          if [ "$STATUS" != "200" ]; then exit 1; fi

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test

  integration-tests:
    runs-on: ubuntu-latest
    needs: smoke-test
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bunx prisma migrate deploy
      - run: bun test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  load-test:
    runs-on: ubuntu-latest
    needs: e2e-tests
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load/api-load-test.js
          flags: --out json=results.json
      - uses: actions/upload-artifact@v4
        with:
          name: k6-results
          path: results.json

  security-scan:
    runs-on: ubuntu-latest
    needs: smoke-test
    steps:
      - uses: zaproxy/action-baseline@v0.10.0
        with:
          target: ${{ secrets.API_URL }}
          rules_file_name: '.zap/rules.tsv'
```

### Pre-Commit Hook

```bash
#!/bin/bash
# .husky/pre-push

# Run smoke tests before push
echo "Running API smoke tests..."
curl -s -f https://app.loomora.ch/api/health > /dev/null || {
  echo "API health check failed!"
  exit 1
}

# Run unit tests
bun test || exit 1
```

### Test-Daten Management

```typescript
// tests/fixtures/test-data.ts
export const testCustomer = {
  name: 'E2E Test AG',
  email: `e2e-${Date.now()}@test.ch`,
  phone: '+41 44 000 00 00',
};

export async function seedTestData(prisma: PrismaClient) {
  await prisma.customer.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      name: `Test Customer ${i}`,
      email: `test${i}@example.ch`,
      companyId: 'test-company-id',
    })),
  });
}

export async function cleanupTestData(prisma: PrismaClient) {
  await prisma.customer.deleteMany({
    where: { email: { contains: '@test.ch' } },
  });
}
```

---

## Anhang: Quick Reference

### Wichtige Endpunkte

```
Auth:        POST /api/auth/login, /register, /refresh, /logout
             GET  /api/auth/me

Customers:   GET  /api/customers
             POST /api/customers
             GET  /api/customers/:id
             PUT  /api/customers/:id
             DELETE /api/customers/:id

Suppliers:   GET  /api/suppliers
             POST /api/suppliers
             GET  /api/suppliers/:id
             PUT  /api/suppliers/:id
             DELETE /api/suppliers/:id

Products:    GET  /api/products
             POST /api/products
             GET  /api/products/:id
             PUT  /api/products/:id

Quotes:      GET  /api/quotes
             POST /api/quotes
             POST /api/quotes/:id/accept

Orders:      GET  /api/orders
             POST /api/orders
             POST /api/orders/from-quote/:id

Invoices:    GET  /api/invoices
             POST /api/invoices
             POST /api/invoices/:id/payment
             POST /api/invoices/:id/send
```

### Test-Accounts (Staging)

```
Admin:     admin@loomora.test / AdminTest123!
User:      user@loomora.test / UserTest123!
Readonly:  readonly@loomora.test / ReadOnly123!
LoadTest:  loadtest@loomora.test / LoadTest123!
```

---

**Dokument-Status:** Draft  
**Nächste Review:** Vor Release  
**Verantwortlich:** QA Team
