# Loomora ERP – TODO Roadmap

**Server:** srv1174249 | **Domain:** app.loomora.ch  
**Stand:** 08.02.2026 – Aktualisiert

---

## 🔑 Test-Login Credentials

| Feld | Wert |
|------|------|
| **E-Mail** | `admin@loomora.ch` |
| **Passwort** | `admin123` |
| **Company** | Loomora Metallbau AG |
| **Rolle** | Owner (Vollzugriff) |

> **Server-Deployment:** Nach `git pull` ausführen: `cd /var/www/loomora/backend && npx prisma db seed`

---

## ✅ Mock-Daten Bereinigung (Abgeschlossen)

| Modul | Status | Details |
|-------|--------|---------|
| Header Notifications | ✅ | Mock-Daten entfernt |
| CRM (Customers) | ✅ | API-Hooks aktiv |
| CRM (Suppliers) | ✅ | API-Hooks + Hard-Delete |
| Products | ✅ | API-Hooks aktiv |
| Sales | ✅ | API-Hooks aktiv |
| Finance | ✅ | API-Hooks aktiv |

---

## 🔴 Phase 1: Kritisch (Diese Woche)

### 1.1 Server-Stabilität
- [ ] **PM2 Autostart einrichten**
  ```bash
  pm2 save
  pm2 startup
  ```

- [ ] **OLS Cache-Clearing automatisieren** (bei Deployments)

### 1.2 Datenintegrität
- [x] **Kunden: Hard-Delete statt Soft-Delete** ✅ Erledigt
- [x] **Lieferanten: Hard-Delete implementieren** ✅ Erledigt
- [ ] **Produkte: Hard-Delete implementieren**
- [ ] **Alle Module: Delete-Strategie vereinheitlichen**

### 1.3 CRM-Modul bereinigt ✅
- [x] **Kunden-Liste:** API verknüpft, keine Mock-Daten
- [x] **Kunden-Detail:** API verknüpft, echte Daten aus DB
- [x] **Kunden-Erstellen:** API verknüpft
- [x] **Lieferanten-Liste:** API verknüpft
- [x] **Lieferanten-Detail:** API verknüpft, echte Daten aus DB
- [x] **Lieferanten-Erstellen:** API verknüpft

### 1.4 Auth & Session
- [ ] **Login-Flow testen** (Company-Auswahl, Token-Refresh)
- [ ] **Session-Timeout prüfen** (15min Access, 7d Refresh)

---

## 🟡 Phase 2: Funktional (Nächste 2 Wochen)

### 2.1 CRUD-Operationen verifizieren
- [ ] **Kunden:** Erstellen, Bearbeiten, Löschen, Suchen
- [ ] **Lieferanten:** Erstellen, Bearbeiten, Löschen, Suchen
- [ ] **Produkte:** Erstellen, Bearbeiten, Löschen, Lagerbestand
- [ ] **Mitarbeiter:** Erstellen, Bearbeiten, Abwesenheiten

### 2.2 Verkaufsprozess (Quote → Order → Invoice)
- [ ] **Angebot erstellen** mit Positionen
- [ ] **Angebot → Auftrag konvertieren**
- [ ] **Lieferschein aus Auftrag erstellen**
- [ ] **Rechnung aus Auftrag erstellen**
- [ ] **QR-Rechnung Vorschau/PDF**
- [ ] **Zahlung erfassen** (Teilzahlung, Vollzahlung)

### 2.3 Einkaufsprozess
- [ ] **Bestellung erstellen**
- [ ] **Wareneingang buchen** (Lagerbestand erhöhen)
- [ ] **Eingangsrechnung erfassen**

### 2.4 Mahnwesen
- [ ] **Überfällige Rechnungen erkennen**
- [ ] **Mahnung erstellen** (5 Stufen)
- [ ] **Batch-Mahnlauf testen**

### 2.5 Finanzen
- [ ] **Kontenplan anzeigen**
- [ ] **Journalbuchung manuell erfassen**
- [ ] **Bilanz generieren**
- [ ] **GuV generieren**

---

## 🟢 Phase 3: Integrationen (Monat 2)

### 3.1 E-Mail-Versand (SMTP)
- [ ] **SMTP-Konfiguration in .env**
  ```env
  SMTP_HOST=smtp.example.ch
  SMTP_PORT=587
  SMTP_USER=...
  SMTP_PASS=...
  SMTP_FROM=noreply@loomora.ch
  ```
- [ ] **E-Mail-Service im Backend implementieren**
- [ ] **Rechnungsversand per E-Mail**
- [ ] **Mahnungsversand per E-Mail**

### 3.2 PDF-Generierung (Server-seitig)
- [ ] **Puppeteer oder PDFKit installieren**
- [ ] **Rechnung-PDF mit QR-Code**
- [ ] **Angebot-PDF**
- [ ] **Lieferschein-PDF**
- [ ] **Mahnung-PDF**

### 3.3 Bank-Integration (camt.054)
- [ ] **camt.054 Upload-Funktion testen**
- [ ] **Auto-Matching mit QR-Referenz**
- [ ] **Manuelle Zuordnung bei Nicht-Match**

### 3.4 Zahls.ch / Stripe (Subscriptions)
- [ ] **API-Keys in .env konfigurieren**
  ```env
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- [ ] **Webhook-Endpoint aktivieren**
- [ ] **Checkout-Flow testen**
- [ ] **Subscription-Status-Sync**

---

## 🔵 Phase 4: Compliance & Reporting (Monat 3)

### 4.1 Audit-Logging
- [ ] **AuditLog bei allen CRUD-Operationen**
- [ ] **AuditLog-Ansicht im Frontend**
- [ ] **Export für Revision**

### 4.2 MwSt-Abrechnung
- [ ] **Perioden-Auswahl (Quartal)**
- [ ] **Automatische Berechnung**
- [ ] **eCH-0217 XML Export**

### 4.3 Swissdec (Lohnmeldung)
- [ ] **Jahres-Lohnausweis generieren**
- [ ] **XML-Export testen**
- [ ] **Validierung gegen XSD**

### 4.4 Reports
- [ ] **Offene Posten (Debitoren)**
- [ ] **Offene Posten (Kreditoren)**
- [ ] **Umsatzstatistik**
- [ ] **Projektrentabilität**
- [ ] **Lohnjournal**

---

## ⚪ Phase 5: Nice-to-Have (Monat 4+)

### 5.1 Automatisierungen
- [ ] **Automatische Mahnung bei Fälligkeit**
- [ ] **Lagerbestand-Warnung bei Mindestbestand**
- [ ] **Erinnerung bei auslaufenden Verträgen**

### 5.2 OCR für Eingangsrechnungen
- [ ] **OCR-Service anbinden (Google Vision)**
- [ ] **Automatische Datenextraktion**

### 5.3 Mobile Optimierung
- [ ] **Responsive Anpassungen**
- [ ] **PWA-Manifest**

### 5.4 Tests
- [ ] **Unit-Tests für kritische Services**
- [ ] **E2E-Tests für Hauptworkflows**

---

## 📋 Aktuelle Priorität

**Jetzt abarbeiten (in dieser Reihenfolge):**

| # | Aufgabe | Status |
|---|---------|--------|
| 1 | PM2 Autostart | ⏳ |
| 2 | Delete-Strategie für alle Module | ⏳ |
| 3 | Verkaufsprozess End-to-End testen | ⏳ |
| 4 | Einkaufsprozess testen | ⏳ |
| 5 | Mahnwesen testen | ⏳ |

---

## 🛠️ Befehle für Server

```bash
# Deployment
cd /var/www/loomora
git pull origin main
cd backend && npm run build
pm2 restart loomora-api --update-env

# Cache leeren
rm -rf /tmp/lshttpd/cache/*
systemctl restart lshttpd

# Logs prüfen
pm2 logs loomora-api --lines 100

# DB-Migration (falls Schema geändert)
cd /var/www/loomora/backend
npx prisma migrate deploy
```
