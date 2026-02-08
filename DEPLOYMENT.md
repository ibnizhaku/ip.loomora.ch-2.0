# Loomora Deployment Guide

## Server Information

- **Server**: srv1174249
- **Domain**: app.loomora.ch
- **Project Path**: `/var/www/loomora`
- **Backend Port**: 3001 (PM2 process: `loomora-api`)
- **Web Server**: OpenLiteSpeed (Reverse Proxy `/api` → 127.0.0.1:3001)

## Directory Structure

```
/var/www/loomora/
├── backend/           # NestJS Backend (TypeScript, Prisma)
│   ├── prisma/        # Database schema & migrations
│   ├── src/           # Backend source code
│   └── dist/          # Compiled backend
├── dist/              # Built frontend (Vite output)
├── src/               # Frontend source code (React, Vite)
├── public/            # Static assets
└── node_modules/      # Dependencies
```

## Database

- **Type**: PostgreSQL
- **Name**: loomora
- **Host**: 127.0.0.1:5432
- **ORM**: Prisma

## Deployment Steps

### 1. Pull Latest Code

```bash
cd /var/www/loomora
git pull origin main
```

### 2. Install Dependencies (if package.json changed)

```bash
# Frontend
npm install
# or: bun install

# Backend
cd backend
npm install
# or: bun install
cd ..
```

### 3. Build Frontend

```bash
npm run build
# or: bun run build
```

This creates/updates the `dist/` folder which OpenLiteSpeed serves.

### 4. Database Migrations (if schema changed)

```bash
cd backend
npx prisma db push
# or for production: npx prisma migrate deploy
cd ..
```

### 5. Restart Backend

```bash
pm2 restart loomora-api
```

### 6. Verify

- Frontend: Visit https://app.loomora.ch
- Backend: `curl https://app.loomora.ch/api/health`
- Logs: `pm2 logs loomora-api`

## Quick Full Redeploy

```bash
cd /var/www/loomora
git pull origin main
npm install
npm run build
cd backend
npm install
npx prisma db push
cd ..
pm2 restart loomora-api
```

## Demo Credentials

- **Email**: admin@loomora.ch
- **Password**: admin123

## Useful Commands

```bash
# Check backend status
pm2 status

# View backend logs
pm2 logs loomora-api

# Restart backend
pm2 restart loomora-api

# Reseed database (WARNING: resets data)
cd backend
npx prisma db push --force-reset
npx prisma db seed
```

## Environment

- Frontend API calls go to `/api` (relative path)
- OpenLiteSpeed proxies `/api/*` to backend on port 3001
- SPA routing: all non-API/non-file requests → index.html
