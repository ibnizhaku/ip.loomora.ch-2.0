# Loomora ERP Backend

Produktionsreifes NestJS Backend für Loomora ERP - Swiss-compliant mit PostgreSQL.

## Schnellstart

### Voraussetzungen
- Docker & Docker Compose
- Node.js 20+ (für lokale Entwicklung)

### Mit Docker starten (empfohlen)

```bash
cd backend

# .env erstellen
cp .env.example .env
# JWT_SECRET in .env anpassen!

# Container starten
docker-compose up -d

# Logs prüfen
docker-compose logs -f backend
```

Das Backend ist dann erreichbar unter:
- API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/api/docs

### Lokale Entwicklung

```bash
cd backend

# Dependencies installieren
npm install

# .env erstellen und anpassen
cp .env.example .env

# Datenbank starten (nur PostgreSQL)
docker-compose up -d postgres

# Prisma Client generieren
npm run db:generate

# Migrationen ausführen
npm run db:migrate

# Seed-Daten laden (optional)
npm run db:seed

# Development Server starten
npm run start:dev
```

## Umgebungsvariablen

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Server Port | `3001` |
| `JWT_SECRET` | JWT Signing Key (min. 32 Zeichen!) | `your-super-secret-key...` |
| `CORS_ORIGIN` | Erlaubte Origins (komma-separiert) | `http://localhost:5173` |

## API Module (Phase 1: HR + Projekte)

| Modul | Endpoint | Beschreibung |
|-------|----------|--------------|
| Auth | `/api/auth` | Login, Register, Refresh, Logout |
| Users | `/api/users` | Benutzerverwaltung |
| Company | `/api/company` | Firmenprofil |
| Projects | `/api/projects` | Projektverwaltung |
| Tasks | `/api/tasks` | Aufgabenverwaltung |
| Time Entries | `/api/time-entries` | Zeiterfassung |
| Calendar | `/api/calendar` | Kalender/Termine |
| Employees | `/api/employees` | Personalverwaltung |
| Absences | `/api/absences` | Abwesenheiten |
| Dashboard | `/api/dashboard` | KPIs (read-only, server-berechnet) |

## Deployment auf eigenem Server

```bash
# 1. Repository klonen
git clone <repo-url>
cd loomora/backend

# 2. .env für Produktion erstellen
cp .env.example .env
nano .env  # JWT_SECRET und DATABASE_URL anpassen!

# 3. Mit Docker Compose starten
docker-compose up -d --build

# 4. Logs prüfen
docker-compose logs -f
```

## Datenbank-Befehle

```bash
# Prisma Studio (GUI für DB)
npm run db:studio

# Neue Migration erstellen
npm run db:migrate

# Migration in Produktion deployen
npm run db:migrate:prod

# Schema pushen (ohne Migration)
npm run db:push
```

## Architektur

```
backend/
├── src/
│   ├── common/           # Gemeinsame DTOs, Decorators
│   ├── modules/          # Feature-Module
│   │   ├── auth/         # Authentifizierung (JWT)
│   │   ├── projects/     # Projekte
│   │   ├── tasks/        # Aufgaben
│   │   ├── employees/    # Personal
│   │   └── ...
│   ├── prisma/           # Prisma Service
│   ├── app.module.ts     # Root Module
│   └── main.ts           # Bootstrap
├── prisma/
│   ├── schema.prisma     # Datenbank-Schema
│   └── seed.ts           # Seed-Daten
├── docker-compose.yml    # Container-Konfiguration
└── Dockerfile            # Production Build
```

## Nächste Schritte (Phase 2+)

- [ ] CRM Module (Customers, Suppliers)
- [ ] Sales Module (Quotes, Orders, Invoices)
- [ ] Finance Module (Accounting, Payments)
- [ ] Production Module (BOM, Quality)
