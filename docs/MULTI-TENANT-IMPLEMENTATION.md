# Multi-Tenant SaaS Architektur - Implementierungsübersicht

## 🚀 Status: Backend-Grundstruktur implementiert

### Was wurde erstellt:

---

## 1. Datenbank-Schema (Prisma)

### Neue Enums hinzugefügt:
- `UserStatus`: PENDING, ACTIVE, SUSPENDED, DELETED
- `CompanyStatus`: PENDING_PAYMENT, ACTIVE, SUSPENDED, CANCELLED
- `SubscriptionStatus`: PENDING, ACTIVE, PAST_DUE, CANCELLED, EXPIRED
- `InvitationStatus`: PENDING, ACCEPTED, EXPIRED, REVOKED
- `BillingCycle`: MONTHLY, YEARLY

### Neue Tabellen:
| Tabelle | Zweck |
|---------|-------|
| `subscription_plans` | Verfügbare Abo-Pläne (Basic, Pro, Enterprise) |
| `subscriptions` | Aktive Abos pro Company |
| `roles` | Custom Roles pro Company |
| `role_permissions` | Berechtigungsmatrix (module:permission) |
| `user_company_memberships` | User ↔ Company M:N Zuordnung |
| `invitations` | E-Mail-Einladungen |
| `refresh_tokens` | Token-Management mit Revocation |
| `webhook_events` | Idempotenz-Log für Zahls.ch |

### Erweiterte Tabellen:
- `Company`: + status, slug, createdById
- `User`: + status (ersetzt isActive), M:N Relations

---

## 2. Auth-System

### Neue Services:
- `TokenService`: Access/Refresh Token Generierung & Validierung
- `MembershipService`: Company-Zuordnung & Permissions

### Login-Flow:
1. User/Passwort validieren
2. User-Status prüfen (ACTIVE erforderlich)
3. Aktive Companies mit gültiger Subscription laden
4. Bei 1 Company → direkte Tokens
5. Bei mehreren → Company-Auswahl erforderlich

### Neue Endpoints:
| Endpoint | Beschreibung |
|----------|-------------|
| `POST /auth/login` | Login (Multi-Tenant) |
| `POST /auth/register` | Registrierung + Company |
| `POST /auth/select-company` | Company nach Login wählen |
| `POST /auth/switch-company` | Company wechseln |
| `POST /auth/refresh` | Token erneuern |
| `POST /auth/logout` | Logout (aktuelles Gerät) |
| `POST /auth/logout-all` | Logout (alle Geräte) |
| `GET /auth/me` | Aktueller User + Company |

### JWT Payload:
```typescript
{
  sub: userId,
  email: string,
  activeCompanyId: string,
  roleId: string,
  permissions: string[],
  isOwner: boolean
}
```

---

## 3. Middleware/Guards

| Guard | Reihenfolge | Prüft |
|-------|-------------|-------|
| `JwtAuthGuard` | 1 | Token-Validierung |
| `CompanyGuard` | 2 | Company-Membership |
| `SubscriptionGuard` | 3 | Abo-Status |
| `PermissionGuard` | 4 | Modul-Berechtigungen |
| `PlanLimitsGuard` | 5 | Plan-Limits (max_users etc.) |

### Verwendung:
```typescript
@UseGuards(JwtAuthGuard, CompanyGuard, SubscriptionGuard, PermissionGuard)
@RequirePermissions('customers:write')
async createCustomer() { ... }
```

---

## 4. Subscription-Modul

### Endpoints:
| Endpoint | Beschreibung | Auth |
|----------|-------------|------|
| `GET /subscriptions/plans` | Alle Pläne | Öffentlich |
| `GET /subscriptions/status` | Aktueller Abo-Status | Auth |
| `POST /subscriptions/checkout` | Checkout starten | Auth |
| `POST /subscriptions/change-plan` | Plan wechseln | Owner/Admin |
| `POST /subscriptions/cancel` | Kündigen | Owner |
| `POST /subscriptions/reactivate` | Reaktivieren | Owner |
| `POST /subscriptions/webhook` | Zahls.ch Webhooks | Signatur |
| `GET /subscriptions/config-status` | Zahls.ch Konfiguration | Auth |

### Webhook-Events (vorbereitet):
- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## 5. Einladungs-System

### Endpoints:
| Endpoint | Beschreibung |
|----------|-------------|
| `GET /invitations/validate/:token` | Einladung prüfen |
| `POST /invitations/accept` | Einladung annehmen |
| `GET /invitations` | Alle Company-Einladungen |
| `POST /invitations/invite` | User einladen |
| `POST /invitations/create-direct` | User direkt erstellen |
| `DELETE /invitations/:id` | Einladung widerrufen |

---

## ⚠️ Was noch fehlt / WICHTIG!

### Zahls.ch Konfiguration (NICHT AKTIV)
- [ ] `ZAHLS_API_KEY` in .env
- [ ] `ZAHLS_WEBHOOK_SECRET` in .env
- [ ] Webhook-URL bei Zahls.ch registrieren
- [ ] Produkte/Preise in Zahls.ch erstellen
- [ ] `externalProductId`, `externalPriceIdMonthly`, `externalPriceIdYearly` in subscription_plans

### Prisma Migration
```bash
cd backend
npx prisma migrate dev --name multi-tenant-auth
npx prisma generate
```

### Environment Variables
```env
# Zahls.ch (später hinzufügen)
ZAHLS_API_KEY=
ZAHLS_WEBHOOK_SECRET=

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### Seed-Daten
```bash
# subscription_plans erstellen
npx prisma db seed
```

---

## 🔒 Sicherheitshinweise

1. **Webhook-Signatur**: Immer validieren!
2. **Rate-Limiting**: Für Login/Register implementieren
3. **Password Policy**: Minimum 8 Zeichen (bereits implementiert)
4. **Token-Rotation**: Bei jedem Refresh neuer Token
5. **Revocation**: Alle Tokens bei "Logout All" ungültig

---

## 📋 Nächste Schritte

1. **Prisma Migration ausführen**
2. **Seed-Daten für Plans erstellen**
3. **Frontend Auth-Context anpassen**
4. **Company-Switching UI bauen**
5. **Zahls.ch Account einrichten**
6. **Webhook-URL registrieren**
7. **Test-Zahlungen durchführen**

---

## 🚨 ERINNERUNG

> **Zahls.ch ist NICHT konfiguriert!**
> 
> Das System startet alle neuen Companies mit `status: PENDING_PAYMENT`.
> Kein Login möglich bis:
> 1. Zahls.ch API-Keys gesetzt sind
> 2. Webhook funktioniert
> 3. Erste Zahlung erfolgreich

**Vor Go-Live muss Zahls.ch vollständig eingerichtet werden!**
