
# Vollständige technische Analyse: Loomora IST-Zustand

## Was geplant ist

Erstellen der Datei `.lovable/system-analyse-ist-zustand.md` — eine vollständige, technische IST-Zustand-Analyse aller implementierten Systeme: Datenmodelle, Auth, Guards, Permissions, Frontend-Logik, Sicherheit, Skalierung.

---

## Technische Details

### Vorgehensweise

Ich schreibe eine einzige vollständige `.md`-Datei mit allen 10 Analysebereichen, basierend auf dem tatsächlich gelesenen Code:

- `backend/prisma/schema.prisma` (alle Modelle und Relationen)
- `backend/src/modules/auth/auth.service.ts` (Login-Flow)
- `backend/src/modules/auth/services/membership.service.ts` (Permission-Auflösung)
- `backend/src/modules/auth/services/token.service.ts` (JWT-Generierung)
- `backend/src/modules/auth/strategies/jwt.strategy.ts` (Token-Validierung)
- `backend/src/modules/auth/guards/*.ts` (alle 5 Guards)
- `backend/src/modules/users/users.service.ts` (User-Management, Permission-Overrides)
- `backend/src/modules/users/users.controller.ts` (Endpoints)
- `src/contexts/AuthContext.tsx` (Frontend Auth-State)
- `src/hooks/use-permissions.ts` (Frontend Permission-Prüfung)
- `src/components/auth/PermissionGuard.tsx` (Frontend Guard-Komponente)

---

### Inhalt der Analyse-Datei (alle 10 Bereiche)

**1. Grundstruktur – Alle beteiligten Entitäten (IST)**

Folgende Modelle existieren:

| Modell | Schlüsselfelder |
|---|---|
| `User` | id, email, passwordHash, firstName, lastName, status (UserStatus), role (UserRole — Legacy-Enum), isActive (Legacy-Bool), twoFactorEnabled, companyId (Legacy-FK), employeeId (optional 1:1 zu Employee) |
| `Company` | id, name, slug (unique), status (CompanyStatus), createdById |
| `Role` | id, companyId (FK), name, isSystemRole, createdByUserId |
| `RolePermission` | id, roleId (FK Cascade), module (string), permission (string: read/write/delete/admin) |
| `UserCompanyMembership` | id, userId (FK Cascade), companyId (FK Cascade), roleId (FK), isOwner (bool), isPrimary (bool) — Unique: [userId, companyId] |
| `UserPermissionOverride` | id, userId, companyId, module, canRead, canWrite, canDelete — Unique: [userId, companyId, module] |
| `Subscription` | id, companyId, planId, status (SubscriptionStatus), billingCycle |
| `SubscriptionPlan` | id, name, priceMonthly, priceYearly, features (Json), limits (Json) |
| `RefreshToken` | id, userId (FK Cascade), tokenHash (unique), deviceInfo, ipAddress, expiresAt, revokedAt |
| `Invitation` | id, companyId, email, roleId, token (unique), status (InvitationStatus), expiresAt |
| `Employee` | eigenständiges Modell, via `User.employeeId` optional verknüpft |
| `AuditLog` | userId, action, module, companyId — verwendet für Login-Historie |
| `WebhookEvent` | externalEventId (unique), für Zahls.ch Idempotenz |

Doppel-Konzept: `User.role (UserRole Enum: ADMIN/MANAGER/EMPLOYEE/READONLY)` ist ein Legacy-Feld. Das echte Rollenmodell läuft über `UserCompanyMembership → Role`. Beide koexistieren im Code.

Ebenfalls doppelt: `User.isActive (bool)` und `User.status (UserStatus Enum)`. Der Service mappt beide: `status === 'PENDING' ? 'pending' : isActive ? 'active' : 'inactive'`.

**2. Beziehungen & Hierarchie (IST)**

```
Company (1)
├── UserCompanyMembership (N) ← Verbindungstabelle
│   ├── User (1) [global, nicht firmengebunden]
│   │   └── UserPermissionOverride (N) [pro User+Company+Module]
│   └── Role (1) [firmengebunden]
│       └── RolePermission (N) [module:permission Strings]
├── Subscription (N)
│   └── SubscriptionPlan (1)
├── Role (N) [alle Rollen der Company]
└── Invitation (N)

User (global)
├── companyId (Legacy-FK, optional, direkte Relation)
├── employeeId (optional 1:1 → Employee)
├── memberships (N:M → Companies via UserCompanyMembership)
└── refreshTokens (N)
```

- User ist **global** (nicht firmengebunden). Ein User kann n Companies angehören.
- Firmenzuordnung via `UserCompanyMembership`, Unique Constraint [userId, companyId].
- Ein User hat **eine Rolle pro Company** (nicht mehrere — Unique Constraint erzwingt das).
- Rollen sind **firmengebunden** (`companyId` FK in Role).
- Permissions sind **rollengebunden** (RolePermission) + **user-individual** (UserPermissionOverride).

**3. Authentifizierung — vollständiger Login-Flow (IST)**

Ablauf in `auth.service.ts`:

1. User per Email suchen → bcrypt.compare(password, passwordHash)
2. `user.status` prüfen: SUSPENDED → 403, DELETED → 401, PENDING → 403
3. 2FA aktiv? → TempToken (type: `two_factor_pending`) zurückgeben
4. `membershipService.getActiveCompaniesForUser()` — nur Companies mit `status: ACTIVE` + Subscription in `[ACTIVE, PAST_DUE]`
5. `user.lastLoginAt` aktualisieren
6. Fallunterscheidung:
   - 0 aktive Companies → ForbiddenException
   - 1 aktive Company → `generateFullLoginResponse()`
   - N Companies + isPrimary gesetzt → automatisch primäre Company
   - N Companies ohne Primary → TempToken (type: `company_selection`)

In `generateFullLoginResponse()`:
- `membershipService.validateMembership()` — lädt Rolle + Permissions + UserPermissionOverrides
- Permission-Expansion: broad Keys (`invoices`, `finance`, `employees`, `settings`) → granulare Kinder-Module
- Override-Anwendung: UserPermissionOverride ersetzt Rollen-Permission für das betreffende Modul
- JWT-Payload: `{sub, email, activeCompanyId, roleId, permissions[], isOwner}`
- Access Token (15min), Refresh Token (7d, Hash in DB gespeichert)

**JWT enthält:**
- userId, email, activeCompanyId, roleId
- vollständiges `permissions[]`-Array (alle erweiterten String-Permissions: z.B. `["invoices:read", "invoices:write", "customers:read", ...]`)
- `isOwner: boolean`

Permissions werden **beim Login** vollständig berechnet und **in den Token eingebettet**. Bei jeder Anfrage werden sie aus dem Token gelesen — nicht erneut aus DB geladen (Ausnahme: `/auth/me` lädt sie frisch via `getFreshPermissions()`).

**4. Autorisierung — Zugriffskontrolle (IST)**

**Guard-Stack** (in Reihenfolge, manuell pro Endpoint konfiguriert):

| Guard | Was geprüft wird | DB-Zugriff |
|---|---|---|
| `JwtAuthGuard` | JWT-Signatur + Ablauf, User-Status (ACTIVE), activeCompanyId vorhanden | Ja (User + Role) |
| `CompanyGuard` | Company.status === 'ACTIVE', UserCompanyMembership vorhanden | Ja (2 Queries) |
| `SubscriptionGuard` | Subscription.status in [ACTIVE, PAST_DUE, CANCELLED] | Ja |
| `PermissionGuard` | `user.permissions[]` aus JWT enthält required Permission; isOwner bypass | Nein (nur JWT) |
| `PlanLimitsGuard` | Count-Query gegen Plan-Limits (max_users, max_projects etc.) | Ja |

**Kritisch:** `PermissionGuard` prüft Permissions **nur aus dem JWT**, nicht frisch aus der DB.

**Verwendung in Controllern:**
- `UsersController`: Nur `JwtAuthGuard` — kein CompanyGuard, kein SubscriptionGuard, kein PermissionGuard auf Controller-Ebene
- `InvitationsController`: Voller Stack `JwtAuthGuard, CompanyGuard, SubscriptionGuard, PermissionGuard, PlanLimitsGuard`
- `SubscriptionsController`: Mixed — einige Endpoints ohne SubscriptionGuard
- Die meisten Business-Controller (`customers`, `invoices`, `employees` etc.): Nur `JwtAuthGuard`

**Inkonsistenz:** Die meisten der ~60 Controller verwenden **nur JwtAuthGuard**. CompanyGuard + SubscriptionGuard + PermissionGuard werden nur bei Invitations und Subscriptions konsequent eingesetzt.

**Frontend-Seite:**
- `usePermissions()` Hook liest `activeCompany.permissions[]` aus dem in-memory AuthContext-State (der beim Login befüllt wurde)
- `<PermissionGuard module="..." action="...">` rendert entweder Inhalt oder "Zugriff verweigert"-UI
- `AppSidebar` filtert Navigationspunkte via `canAccessModule()` — nur UI-Hiding, kein serverseitiger Schutz dahinter für die meisten Module

**5. Verhalten bei Entzug von Berechtigungen (IST)**

| Szenario | Was technisch passiert |
|---|---|
| Rolle wird geändert | Neue Permissions gelten erst beim nächsten Login (neues JWT) oder bei `switchCompany`/`selectCompany` |
| Permission-Override gesetzt | Gleich — JWT ist veraltet, erst nach Re-Auth wirksam. `/auth/me` lädt frische Permissions für UI, aber nicht für Backend-Checks |
| Membership gelöscht | Wirkt sofort bei nächster Anfrage durch `CompanyGuard` (DB-Check) — aber nur wo CompanyGuard gesetzt ist |
| User deaktiviert (`isActive=false`) | `JwtAuthGuard → jwt.strategy.ts` prüft `user.status === 'ACTIVE'`. ABER: `isActive=false` ändert nicht `user.status`. Das Mapping im Service gibt `isActive=false` als `'inactive'` zurück, aber die DB hat `status=ACTIVE`. Token bleibt gültig bis Ablauf. |
| User gesperrt (`status=SUSPENDED`) | `JwtStrategy.validate()` prüft `user.status !== 'ACTIVE'` → UnauthorizedException sofort |
| Sitzungen beendet (revoke-sessions) | RefreshTokens werden gelöscht → kein Token-Renewal möglich. Aktives Access Token (max. 15min) bleibt noch gültig |

**Kategorisierung:**
- **UI-Hide:** Sidebar-Filtering via `canAccessModule()` — nur clientseitig, kein Backend-Schutz
- **Client-Side-Condition:** `<PermissionGuard>` — rendert Fehlermeldung, keine echte Sperre
- **Token-basierte Validierung (veraltet):** `PermissionGuard` prüft JWT-Permissions — max. 15min veraltet
- **Server-Side-Validation (sofort):** `JwtAuthGuard` (User-Status), `CompanyGuard` (Membership) — aber nur dort wo eingesetzt

**6. Konsistenzanalyse (IST)**

**Inkonsistenzen:**
1. **Doppeltes Rollenmodell:** `User.role (UserRole Enum)` und `UserCompanyMembership → Role`. Service mappt beide fallback-mäßig.
2. **Doppeltes Status-Feld:** `User.isActive (bool)` + `User.status (UserStatus Enum)`. Deaktivierung via `isActive=false` blockiert JWT nicht sofort.
3. **Guard-Anwendung inconsistent:** ~60 Controller, aber nur ~2 nutzen den vollen Guard-Stack. Die meisten prüfen nur JWT.
4. **Permission-Prüfung im Backend:** Nur `invitations`, `subscriptions` (change-plan, cancel) nutzen `@RequirePermissions()`. Alle anderen Business-Endpoints (Rechnungen erstellen, Kunden löschen etc.) haben **keine Backend-Permission-Prüfung**.
5. **User↔Employee Dopplung:** Ein Benutzer kann als `User` und separat als `Employee` existieren ohne Verknüpfung. Verknüpfung ist optional und manuell.
6. **Legacy companyId auf User:** `User.companyId` ist ein direkter FK auf Company (Legacy), der beim Erstellen neuer User nicht mehr gesetzt wird. Bei Registrierung wird er noch gesetzt.
7. **`/auth/me` Permission-Refresh:** Diese Endpoint lädt frische Permissions und gibt sie zurück — aber das Frontend speichert sie im AuthContext-State, nicht als neues JWT. Dadurch divergieren JWT-Permissions und UI-State potenziell.

**7. Sicherheitsanalyse (IST)**

**Stärken:**
- Refresh Token: bcrypt-gehashed in DB gespeichert, Revocation implementiert
- Rate-Limiting: Login (5/15min), Register (3/h) via `@nestjs/throttler`
- Token-Rotation bei Refresh: alter Token wird revoked
- isOwner-Bypass in PermissionGuard korrekt implementiert
- Self-Deletion-Protection und Owner-Deletion-Protection implementiert

**Schwachstellen:**
1. **Kritisch: Fehlende Backend-Permission-Prüfung auf ~58 von ~60 Controllern.** Jeder authentifizierte User kann (mit gültigem JWT + Membership) alle Business-Endpoints aufrufen, unabhängig von seiner Rolle/Permission. Beispiel: Ein `Member` ohne invoice:write kann via Postman/API dennoch Rechnungen erstellen.
2. **User-Deaktivierung via `isActive=false` blockiert nicht sofort.** `jwt.strategy.ts` prüft nur `user.status !== 'ACTIVE'`, nicht `user.isActive`. Ein deaktivierter User (isActive=false, status=ACTIVE) kann bis zum Token-Ablauf (15min) weiter agieren.
3. **Active Access Token nicht invalidierbar.** `revokeSessions()` löscht nur RefreshTokens. Das aktive 15-Minuten Access Token kann nicht zurückgerufen werden.
4. **CompanyGuard ist in den meisten Controllern nicht eingesetzt.** Ein User könnte über den companyId im JWT-Claim auf Daten anderer Companies zugreifen, sofern die Services nicht selbst mit companyId filtern. Die Services filtern zwar mit `companyId` aus `user.companyId` — aber das Vertrauen liegt am JWT-Claim, nicht am DB-verifizierten Membership.
5. **`/auth/getMyCompanies`-Endpoint ist nicht implementiert** (gibt leeres Array zurück — `// TODO: Implement`).
6. **AuditLog-basierte Login-Historie schreibt nur bei explizitem Audit-Log-Eintrag.** Der Login-Flow selbst schreibt keinen AuditLog — nur `lastLoginAt`.

**8. Skalierungsanalyse (IST)**

- **1 Company:** Reibungslos. Alle Queries sind nach `companyId` gefiltert und indexiert.
- **50 Companies:** Kein Problem. Alle relevanten Felder sind per `@@index` abgedeckt (userId, companyId, status, roleId).
- **500 Companies:** Risiken:
  - `validateMembership()` lädt Subscription + Role + alle RolePermissions + alle UserPermissionOverrides. Bei breiten Rollen und vielen Overrides: mehrere DB-Roundtrips pro Request.
  - `getActiveCompaniesForUser()` lädt für jeden Login alle Memberships eines Users mit nested Company + Subscriptions — bei 500 Companies pro User problematisch.
  - `CompanyGuard` macht 2 separate DB-Queries pro Request (company lookup + membership lookup) wo es eingesetzt wird.

**N+1 Risiken:**
- Permission-Expansion via PARENT_MAP: In-Memory, kein N+1.
- `validateMembership()`: 1 Query (Prisma-Include), aber mit tiefen Nested-Includes.
- `getLoginHistory()`: Einfache AuditLog-Query, begrenzt auf 20 Einträge — unkritisch.

**9. Tatsächlich implementiertes Zugriffskonzept**

Das System ist konzeptionell als **Multi-Tenant RBAC mit individuellem Permission-Override** designed, aber in der Praxis nur **teilweise als RBAC** implementiert:

- **Vollständig RBAC:** Frontend-Sichtbarkeit (Sidebar, PermissionGuard-Komponente)
- **Teilweise RBAC:** Token-Inhalt (Permissions im JWT), `/auth/me` Refresh
- **Nicht RBAC:** ~58 Business-Controller haben keine Backend-Permission-Prüfung
- **Hybrid-Element:** UserPermissionOverride erlaubt individuelle Abweichungen von der Rollen-Matrix
- **Kein Policy-basiertes System:** Es gibt keine Objekt-Ownership-Prüfung (z.B. "nur eigene Dokumente bearbeiten")

---

## Dateien, die geändert/erstellt werden

| Datei | Aktion |
|---|---|
| `.lovable/system-analyse-ist-zustand.md` | Neu erstellen — vollständige IST-Analyse |

Keine Änderungen am produktiven Code.
