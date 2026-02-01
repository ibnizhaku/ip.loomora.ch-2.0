# Loomora ERP Backend

Fastify + Prisma Backend für das Loomora ERP System.

## 🚀 Schnellstart

### 1. Abhängigkeiten installieren

```bash
cd server
npm install
# oder
bun install
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

Bearbeite `.env` und setze die `DATABASE_URL`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/loomora?schema=public"
JWT_SECRET="dein-super-geheimer-key-mindestens-32-zeichen"
```

### 3. Datenbank initialisieren

```bash
# Prisma Client generieren
npm run db:generate

# Datenbank-Migration ausführen (erstellt alle Tabellen)
npm run db:migrate

# Seed-Daten einfügen (Demo-Firma, Admin-User, Beispieldaten)
npm run db:seed
```

### 4. Server starten

```bash
# Entwicklung (mit Hot-Reload)
npm run dev

# Produktion
npm run build
npm run start

# Mit PM2
pm2 start pm2.ecosystem.config.js
```

## 📁 Projektstruktur

```
server/
├── prisma/
│   ├── schema.prisma    # Datenbankschema (40+ Tabellen)
│   └── seed.ts          # Seed-Daten
├── src/
│   ├── index.ts         # Fastify App
│   └── routes/
│       ├── auth.ts      # Login, Register, JWT
│       ├── customers.ts # Kunden-CRUD
│       ├── products.ts  # Produkte + Lager
│       ├── quotes.ts    # Angebote
│       ├── orders.ts    # Aufträge + Konvertierung
│       ├── invoices.ts  # Rechnungen + Mahnungen
│       └── dashboard.ts # Statistiken
├── package.json
└── tsconfig.json
```

## 🔗 API Endpoints

### Authentifizierung
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrierung (neue Firma)
- `GET /api/auth/me` - Aktueller Benutzer
- `POST /api/auth/change-password` - Passwort ändern

### Kunden
- `GET /api/customers` - Liste (mit Suche, Paginierung)
- `GET /api/customers/:id` - Details
- `POST /api/customers` - Erstellen
- `PUT /api/customers/:id` - Aktualisieren
- `DELETE /api/customers/:id` - Löschen (Soft-Delete)

### Produkte
- `GET /api/products` - Liste
- `GET /api/products/:id` - Details
- `POST /api/products` - Erstellen
- `PUT /api/products/:id` - Aktualisieren
- `POST /api/products/:id/stock` - Lagerbewegung
- `DELETE /api/products/:id` - Löschen
- `GET /api/products/categories` - Kategorien

### Angebote
- `GET /api/quotes` - Liste
- `GET /api/quotes/:id` - Details
- `POST /api/quotes` - Erstellen
- `PATCH /api/quotes/:id/status` - Status ändern
- `POST /api/quotes/:id/convert-to-order` - In Auftrag konvertieren
- `DELETE /api/quotes/:id` - Löschen

### Aufträge
- `GET /api/orders` - Liste
- `GET /api/orders/:id` - Details
- `PATCH /api/orders/:id/status` - Status ändern
- `POST /api/orders/:id/create-delivery-note` - Lieferschein erstellen
- `POST /api/orders/:id/create-invoice` - Rechnung erstellen

### Rechnungen
- `GET /api/invoices` - Liste
- `GET /api/invoices/:id` - Details
- `PATCH /api/invoices/:id/status` - Status ändern
- `POST /api/invoices/:id/payments` - Zahlung erfassen
- `POST /api/invoices/:id/reminders` - Mahnung erstellen
- `POST /api/invoices/:id/credit-note` - Gutschrift erstellen
- `GET /api/invoices/overdue` - Überfällige Rechnungen
- `GET /api/invoices/stats` - Statistiken

### Dashboard
- `GET /api/dashboard/stats` - Übersicht
- `GET /api/dashboard/revenue-chart` - Umsatz (12 Monate)
- `GET /api/dashboard/top-customers` - Top Kunden
- `GET /api/dashboard/low-stock` - Niedriger Lagerbestand
- `GET /api/dashboard/upcoming` - Anstehende Aufgaben

## 🇨🇭 Schweizer Besonderheiten

- **QR-Rechnung**: Automatische QR-Referenz-Generierung (26-stellig mit Mod10)
- **MwSt-Sätze**: 8.1% (Standard), 2.6% (Reduziert), 3.8% (Sondersatz)
- **Nummernkreise**: AN-2024-0001, RE-2024-0001, etc.
- **KMU-Kontenrahmen**: 4-stellige Kontonummern
- **Mahnwesen**: 3-Stufen mit automatischer Gebühr

## 🔐 Login-Daten (nach Seed)

```
E-Mail: admin@loomora.ch
Passwort: admin123
```

## 🛠️ Nützliche Befehle

```bash
# Prisma Studio (Datenbank-GUI)
npm run db:studio

# Schema-Änderungen anwenden (ohne Migration)
npm run db:push

# TypeScript kompilieren
npm run build
```

## 📦 Deployment mit PM2

```bash
# Build
cd server && npm run build

# Starten
pm2 start ../pm2.ecosystem.config.js

# Status
pm2 status

# Logs
pm2 logs loomora-api
```
