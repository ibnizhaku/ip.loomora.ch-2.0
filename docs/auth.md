# Loomora ERP – Auth & Session Dokumentation

## Stack

| Komponente | Technologie |
|---|---|
| Backend | NestJS + Passport JWT Strategy |
| Token-Typ | JWT (Access + Refresh) |
| Speicherung | `localStorage` |
| Multi-Tenant | Company-Switching ohne Re-Login |

## Token-Speicherung

```
localStorage.auth_token      → JWT Access Token
localStorage.refresh_token   → JWT Refresh Token
localStorage.auth_user       → JSON { id, email, firstName, lastName, role, companyId, companyName }
localStorage.auth_company    → aktive Company (JSON)
localStorage.auth_companies  → verfügbare Companies (JSON Array)
```

## Login-Flow

1. `POST /api/auth/login` mit `{ email, password }`
2. Backend antwortet mit `{ accessToken, refreshToken, user: AuthUser }`
3. Falls 2FA aktiv: Backend antwortet mit `{ requires2FA: true, tempToken }`
   → Frontend zeigt 2FA-Dialog
   → `POST /api/auth/2fa/authenticate` mit `{ tempToken, code }`
   → Backend antwortet mit voller `AuthResponse` inkl. `activeCompany`, `availableCompanies`
4. `api.setAuth(response)` speichert Tokens in localStorage

## Registrierung

1. `POST /api/auth/register` mit `{ email, password, firstName, lastName, companyName }`
2. Backend erstellt User + Company + Subscription
3. Antwortet mit `AuthResponse`

## Token-Refresh (Proaktiv + Reaktiv)

**Proaktiv** (in `api.request()`):
- Vor jedem Request wird geprüft ob Token in <60s abläuft
- Falls ja: `POST /api/auth/refresh` mit `{ refreshToken }`
- Body enthält **keine userId** (Backend liest `sub` aus JWT)
- Neuer Token wird sofort gesetzt

**Reaktiv**:
- Falls trotzdem 401 kommt → einmaliger Refresh-Versuch
- Falls Refresh fehlschlägt → `clearAuth()` + Redirect zu `/login`

## Logout

1. `POST /api/auth/logout` (best-effort, Fehler ignoriert)
2. `api.clearAuth()` löscht alle localStorage-Keys

## Request-Authorisierung

Jeder Request enthält:
```
Authorization: Bearer <accessToken>
```

## Multi-Tenant

- User kann mehreren Companies angehören (UserCompanyMembership)
- Nach Login: Frontend bekommt `activeCompany` + `availableCompanies`
- Company-Switch: Ändert `auth_company` ohne Re-Login
- Backend validiert bei jedem Request: `companyId` aus JWT/Header → Membership + Subscription-Status

## Berechtigungen

- `usePermissions()` prüft clientseitig: `permissions[]` aus `activeCompany`
- Format: `"module:action"` z.B. `"invoices:read"`, `"finance:write"`
- Owner hat immer vollen Zugriff
- Backend: 3-Guard-Stack (JwtAuthGuard → CompanyGuard → PermissionGuard)
- Jede Route: `@RequirePermissions('module:action')`

## 2FA

| Endpoint | Beschreibung |
|---|---|
| `POST /auth/2fa/setup` | QR-Code + Secret generieren |
| `POST /auth/2fa/verify` | Code verifizieren → 2FA aktivieren |
| `POST /auth/2fa/authenticate` | Login-2FA mit tempToken |
| `POST /auth/2fa/disable` | 2FA deaktivieren |
| `POST /auth/2fa/admin-reset/:userId` | Admin-Reset |
| `GET /auth/2fa/status` | Status abfragen |
