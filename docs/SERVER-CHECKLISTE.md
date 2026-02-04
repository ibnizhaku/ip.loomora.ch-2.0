# 🖥️ Loomora ERP - Server-Checkliste

Diese Checkliste hilft dir, den Status aller Komponenten zu prüfen und Probleme zu beheben.

---

## 📋 Schnell-Check (alle Dienste)

```bash
# Alles auf einen Blick prüfen
echo "=== PostgreSQL ===" && sudo systemctl status postgresql --no-pager | head -5
echo "=== Backend ===" && pm2 status
echo "=== OpenLiteSpeed ===" && sudo systemctl status lsws --no-pager | head -5
```

---

## 1️⃣ PostgreSQL Datenbank

### Status prüfen
```bash
sudo systemctl status postgresql
```

### Starten / Stoppen / Neustarten
```bash
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql
```

### Autostart aktivieren
```bash
sudo systemctl enable postgresql
```

### Verbindung testen
```bash
psql -U postgres -c "SELECT version();"
# Oder mit spezifischer Datenbank:
psql -U postgres -d loomora_db -c "SELECT COUNT(*) FROM \"User\";"
```

### Logs prüfen
```bash
sudo tail -50 /var/log/postgresql/postgresql-*-main.log
```

**✅ Erwartetes Ergebnis:** `Active: active (running)`

---

## 2️⃣ Backend (Node.js/Fastify)

### Mit PM2 (empfohlen für Produktion)

#### Status prüfen
```bash
pm2 status
pm2 show loomora-backend
```

#### Starten
```bash
cd /pfad/zu/loomora/backend
pm2 start dist/main.js --name loomora-backend
```

#### Stoppen / Neustarten
```bash
pm2 stop loomora-backend
pm2 restart loomora-backend
```

#### Logs anzeigen
```bash
pm2 logs loomora-backend --lines 100
pm2 logs loomora-backend --err --lines 50  # Nur Fehler
```

#### Autostart bei Server-Neustart
```bash
pm2 startup
pm2 save
```

### Ohne PM2 (Entwicklung)

```bash
cd /pfad/zu/loomora/backend
npm run start:dev   # Entwicklung mit Hot-Reload
npm run start:prod  # Produktion
```

### API-Endpoint testen
```bash
curl http://localhost:3001/api/health
# Erwartete Antwort: {"status":"ok","timestamp":"..."}
```

**✅ Erwartetes Ergebnis:** PM2 zeigt `online` Status

---

## 3️⃣ OpenLiteSpeed Webserver

### Status prüfen
```bash
sudo systemctl status lsws
```

### Starten / Stoppen / Neustarten
```bash
sudo systemctl start lsws
sudo systemctl stop lsws
sudo systemctl restart lsws
```

### Konfiguration neu laden (ohne Neustart)
```bash
sudo /usr/local/lsws/bin/lswsctrl restart
```

### Logs prüfen
```bash
sudo tail -50 /usr/local/lsws/logs/error.log
sudo tail -50 /usr/local/lsws/logs/access.log
```

### SSL-Zertifikat prüfen
```bash
sudo certbot certificates
# Oder:
openssl s_client -connect loomora.ch:443 -servername loomora.ch 2>/dev/null | openssl x509 -noout -dates
```

**✅ Erwartetes Ergebnis:** `Active: active (running)`

---

## 4️⃣ Reverse Proxy prüfen

### Proxy-Weiterleitung testen
```bash
# Intern (sollte funktionieren)
curl http://localhost:3001/api/health

# Extern über Proxy (sollte auch funktionieren)
curl https://loomora.ch/api/health
```

### OpenLiteSpeed Proxy-Konfiguration
Die Konfiguration befindet sich in:
```
/usr/local/lsws/conf/vhosts/loomora/vhconf.conf
```

Wichtige Einstellung für `/api` Proxy:
```
context /api {
  type                    proxy
  handler                 localhost:3001
  addDefaultCharset       off
}
```

---

## 5️⃣ Datenbank-Migration

### Prisma Migrationen ausführen
```bash
cd /pfad/zu/loomora/backend

# Entwicklung (erstellt Migration + führt aus)
npx prisma migrate dev

# Produktion (führt nur aus)
npx prisma migrate deploy

# Status prüfen
npx prisma migrate status
```

### Datenbank zurücksetzen (⚠️ VORSICHT - löscht alle Daten!)
```bash
npx prisma migrate reset
```

### Seed-Daten laden
```bash
npx prisma db seed
```

---

## 6️⃣ Umgebungsvariablen prüfen

### Backend (.env im backend/ Ordner)
```bash
cat /pfad/zu/loomora/backend/.env
```

Erforderliche Variablen:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/loomora_db"
JWT_SECRET="dein-sicherer-geheimer-schluessel"
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN="https://loomora.ch"
```

### Frontend (.env im Root-Ordner)
```env
VITE_API_URL=https://loomora.ch/api
```

---

## 7️⃣ Häufige Probleme & Lösungen

### Problem: "Connection refused" bei API-Aufrufen
```bash
# 1. Prüfen ob Backend läuft
pm2 status

# 2. Prüfen ob Port 3001 belegt ist
sudo lsof -i :3001
sudo netstat -tlnp | grep 3001

# 3. Backend neu starten
pm2 restart loomora-backend
```

### Problem: Datenbank-Verbindungsfehler
```bash
# 1. PostgreSQL läuft?
sudo systemctl status postgresql

# 2. Verbindung testen
psql -U postgres -h localhost -d loomora_db

# 3. DATABASE_URL in .env prüfen
```

### Problem: SSL-Zertifikat abgelaufen
```bash
# Zertifikat erneuern
sudo certbot renew

# OpenLiteSpeed neu starten
sudo systemctl restart lsws
```

### Problem: "502 Bad Gateway"
```bash
# Backend läuft nicht oder Proxy falsch konfiguriert
pm2 logs loomora-backend --lines 50
curl http://localhost:3001/api/health
```

---

## 8️⃣ Vollständiger Neustart (Reihenfolge wichtig!)

```bash
# 1. Datenbank
sudo systemctl restart postgresql
sleep 5

# 2. Backend
pm2 restart loomora-backend
sleep 3

# 3. Webserver
sudo systemctl restart lsws

# 4. Alles prüfen
echo "=== Status Check ===" 
curl -s http://localhost:3001/api/health && echo " ✅ Backend OK" || echo " ❌ Backend FEHLER"
curl -s https://loomora.ch/api/health && echo " ✅ Proxy OK" || echo " ❌ Proxy FEHLER"
```

---

## 9️⃣ PM2 Ecosystem File (empfohlen)

Erstelle `/pfad/zu/loomora/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'loomora-backend',
    cwd: './backend',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Dann starten mit:
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔟 Monitoring & Wartung

### Tägliche Checks
```bash
# Schnellcheck
pm2 status && curl -s http://localhost:3001/api/health
```

### Wöchentliche Checks
```bash
# Logs rotieren
pm2 flush

# Disk-Space prüfen
df -h

# Datenbank-Grösse prüfen
psql -U postgres -d loomora_db -c "SELECT pg_size_pretty(pg_database_size('loomora_db'));"
```

### Backup (täglich empfohlen)
```bash
# Datenbank-Backup
pg_dump -U postgres loomora_db > /backups/loomora_$(date +%Y%m%d).sql

# Mit Kompression
pg_dump -U postgres loomora_db | gzip > /backups/loomora_$(date +%Y%m%d).sql.gz
```

---

## ✅ Finale Checkliste

| Komponente | Befehl | Erwartetes Ergebnis |
|------------|--------|---------------------|
| PostgreSQL | `sudo systemctl status postgresql` | `active (running)` |
| Backend | `pm2 status` | `online` |
| OpenLiteSpeed | `sudo systemctl status lsws` | `active (running)` |
| API intern | `curl localhost:3001/api/health` | `{"status":"ok"...}` |
| API extern | `curl https://loomora.ch/api/health` | `{"status":"ok"...}` |
| SSL | `curl -I https://loomora.ch` | `HTTP/2 200` |

---

**Erstellt für Loomora ERP** | Letzte Aktualisierung: Februar 2026
