# Loomora — Vollständige technische IST-Zustand-Analyse
> Erstellt: 2026-02-18 | Basis: tatsächlich gelesener Quellcode, keine Annahmen

---

## 1️⃣ Grundstruktur — Alle beteiligten Entitäten

### Datenbankmodelle (Prisma Schema)

#### `User`
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String (cuid) | PK |
| `email` | String | Unique |
| `passwordHash` | String | bcrypt |
| `firstName` | String | |
| `lastName` | String | |
| `status` | `UserStatus` Enum | ACTIVE / PENDING / SUSPENDED / DELETED |
| `role` | `UserRole` Enum | **Legacy**: ADMIN / MANAGER / EMPLOYEE / READONLY |
| `isActive` | Boolean | **Legacy** — redundant zu `status` |
| `twoFactorEnabled` | Boolean | |
| `twoFactorSecret` | String? | |
| `companyId` | String? | **Legacy** FK → Company (direkte Relation, wird nicht mehr gesetzt) |
| `employeeId` | String? | Optional 1:1 → Employee |
| `lastLoginAt` | DateTime? | |
| `createdAt` / `updatedAt` | DateTime | |

**Relationen:**
- `memberships` → `UserCompanyMembership[]` (1:N)
- `refreshTokens` → `RefreshToken[]` (1:N, Cascade Delete)
- `company` → `Company?` (Legacy-Direktrelation via `companyId`)
- `employee` → `Employee?` (optionale 1:1 via `employeeId`)
- `auditLogs` → `AuditLog[]`
- `permissionOverrides` → `UserPermissionOverride[]`
- `invitationsSent` → `Invitation[]`

**Constraints:**
- `email` Unique
- `employeeId` Unique (falls gesetzt: 1:1)

---

#### `Company`
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String (cuid) | PK |
| `name` | String | |
| `slug` | String | Unique |
| `status` | `CompanyStatus` Enum | ACTIVE / PENDING / SUSPENDED / DELETED |
| `createdById` | String | FK → User |
| `createdAt` / `updatedAt` | DateTime | |

**Relationen:**
- `memberships` → `UserCompanyMembership[]`
- `roles` → `Role[]`
- `subscriptions` → `Subscription[]`
- `invitations` → `Invitation[]`
- `users` → `User[]` (Legacy-Direktrelation)

---

#### `Role`
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String (cuid) | PK |
| `companyId` | String | FK → Company (**rollengebunden**) |
| `name` | String | z.B. "Owner", "Admin", "Member" |
| `description` | String? | |
| `isSystemRole` | Boolean | Systemrollen sind nicht löschbar |
| `createdByUserId` | String? | |
| `createdAt` / `updatedAt` | DateTime | |

**Relationen:**
- `permissions` → `RolePermission[]` (1:N, Cascade Delete)
- `memberships` → `UserCompanyMembership[]`
- `company` → `Company`

**Constraints:**
- `@@unique([companyId, name])` — Rollenname unique pro Company

---

#### `RolePermission`
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String (cuid) | PK |
| `roleId` | String | FK → Role (Cascade Delete) |
| `module` | String | z.B. "invoices", "customers", "finance" |
| `permission` | String | "read" / "write" / "delete" / "admin" |

**Constraints:**
- `@@unique([roleId, module, permission])`
- `@@index([roleId])`

---

#### `UserCompanyMembership` ← Zentrale Verbindungstabelle
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | String | FK → User (Cascade Delete) |
| `companyId` | String | FK → Company (Cascade Delete) |
| `roleId` | String | FK → Role |
| `isOwner` | Boolean | Owner-Flag — bypass für alle Permissions |
| `isPrimary` | Boolean | Primäre Company für Auto-Select beim Login |
| `createdAt` / `updatedAt` | DateTime | |

**Constraints:**
- `@@unique([userId, companyId])` — **Ein User hat genau eine Rolle pro Company**
- `@@index([userId])`, `@@index([companyId])`, `@@index([roleId])`

---

#### `UserPermissionOverride`
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | String | FK → User |
| `companyId` | String | FK → Company |
| `module` | String | Betroffenes Modul |
| `canRead` | Boolean | |
| `canWrite` | Boolean | |
| `canDelete` | Boolean | |
| `createdAt` / `updatedAt` | DateTime | |

**Constraints:**
- `@@unique([userId, companyId, module])` — Max. 1 Override pro User+Company+Modul

---

#### `Subscription`
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String (cuid) | PK |
| `companyId` | String | FK → Company |
| `planId` | String | FK → SubscriptionPlan |
| `status` | `SubscriptionStatus` Enum | ACTIVE / PAST_DUE / CANCELLED / TRIALING / PENDING |
| `billingCycle` | String | "monthly" / "yearly" |
| `externalId` | String? | Externe Zahlungsanbieter-ID |
| `currentPeriodStart/End` | DateTime? | |
| `cancelAt` / `cancelledAt` | DateTime? | |

---

#### `SubscriptionPlan`
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String (cuid) | PK |
| `name` | String | Unique |
| `priceMonthly` | Float | |
| `priceYearly` | Float | |
| `features` | Json | Feature-Flags als JSON |
| `limits` | Json | max_users, max_projects, max_employees etc. |
| `isActive` | Boolean | |

---

#### `RefreshToken`
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String (cuid) | PK |
| `userId` | String | FK → User (Cascade Delete) |
| `tokenHash` | String | Unique — bcrypt-gehashter Token |
| `deviceInfo` | String? | User-Agent |
| `ipAddress` | String? | |
| `expiresAt` | DateTime | 7 Tage ab Ausstellung |
| `revokedAt` | DateTime? | Null = aktiv |
| `createdAt` | DateTime | |

---

#### `Invitation`
| Feld | Typ | Bemerkung |
|---|---|---|
| `id` | String (cuid) | PK |
| `companyId` | String | FK → Company |
| `email` | String | Eingeladene E-Mail |
| `roleId` | String | FK → Role |
| `token` | String | Unique — sicherer Random-Token |
| `status` | `InvitationStatus` Enum | PENDING / ACCEPTED / EXPIRED / CANCELLED |
| `expiresAt` | DateTime | |
| `invitedByUserId` | String? | FK → User |

---

#### `Employee`
- Eigenständiges HR-Modell, **nicht Teil des Auth-Systems**
- Verknüpfung mit User via `User.employeeId` (optional, 1:1)
- Enthält: Personalnummer, Abteilung, Position, Vertragsdetails, etc.
- **Wichtig:** Die Verknüpfung ist optional und manuell — ein Employee-Datensatz kann ohne User-Account existieren und umgekehrt

---

#### `AuditLog`
| Feld | Bemerkung |
|---|---|
| `userId` | Ausführender User |
| `action` | z.B. "USER_LOGIN", "PERMISSION_CHANGED" |
| `module` | Betroffenes Modul |
| `companyId` | Company-Kontext |
| `details` | Json — Payload |
| `ipAddress` | |
| `createdAt` | |

---

#### `WebhookEvent`
- `externalEventId` (Unique) — Idempotenz-Schutz für externe Zahlungsevents (Zahls.ch)

---

### ⚠️ Doppelkonzepte / Legacy-Felder

| Doppelkonzept | Legacy-Feld | Neues Feld | Status |
|---|---|---|---|
| Rollenmodell | `User.role (UserRole Enum)` | `UserCompanyMembership → Role` | Beide aktiv im Code |
| User-Status | `User.isActive (Boolean)` | `User.status (UserStatus Enum)` | Beide aktiv, unterschiedlich geprüft |
| Company-Zuordnung | `User.companyId (Legacy-FK)` | `UserCompanyMembership` | Legacy wird bei Registrierung noch gesetzt |
| Person-Konzept | `Employee` (HR) | `User` (Auth) | Optionale Verknüpfung, keine erzwungene Konsistenz |

---

## 2️⃣ Beziehungen & Hierarchie

### Strukturdiagramm (tatsächlich implementiert)

```
Company (1)
├── UserCompanyMembership (N)   ← Haupt-Verbindungstabelle
│   ├── userId → User (global, firmenunabhängig)
│   │   ├── UserPermissionOverride[] (pro User+Company+Module)
│   │   ├── RefreshToken[]
│   │   └── Employee? (optionale 1:1-Verknüpfung)
│   ├── roleId → Role (firmengebunden)
│   │   └── RolePermission[] (module:permission Strings)
│   ├── isOwner: bool
│   └── isPrimary: bool
│
├── Role[] (alle Rollen der Company, incl. Systemrollen)
│   └── RolePermission[] (Cascade Delete)
│
├── Subscription[] (N)
│   └── SubscriptionPlan (1)
│
└── Invitation[]
```

### Kernaussagen

| Frage | Antwort |
|---|---|
| User global oder firmengebunden? | **Global** — User existiert unabhängig von Companies |
| Firmenzuordnung? | Via `UserCompanyMembership` (Verbindungstabelle) |
| Membership-Tabelle? | Ja: `UserCompanyMembership` |
| User in mehreren Firmen? | Ja — keine Beschränkung |
| User mit mehreren Rollen pro Firma? | **Nein** — `@@unique([userId, companyId])` erzwingt genau eine Rolle |
| Rolle global oder firmenbezogen? | **Firmenbezogen** — `Role.companyId` FK |
| Permissions global oder rollenbasiert? | **Rollenbasiert** (RolePermission) + **user-individual** (UserPermissionOverride) |

---

## 3️⃣ Authentifizierung — Login-Prozess (IST)

### Vollständiger Flow (`auth.service.ts → login()`)

```
1. User per email suchen (Prisma)
2. user.status prüfen:
   - SUSPENDED → ForbiddenException (403)
   - DELETED   → UnauthorizedException (401)
   - PENDING   → ForbiddenException (403, "Account noch nicht aktiviert")
3. bcrypt.compare(password, user.passwordHash)
4. 2FA aktiviert? → TempToken (type: 'two_factor_pending') zurückgeben → Abbruch
5. getActiveCompaniesForUser(userId):
   - Nur Companies mit status:'ACTIVE'
   - Nur Companies mit Subscription in ['ACTIVE', 'PAST_DUE']
6. user.lastLoginAt aktualisieren
7. Fallunterscheidung:
   a) 0 aktive Companies → ForbiddenException
   b) 1 aktive Company   → generateFullLoginResponse(userId, companyId)
   c) N Companies + isPrimary gesetzt → generateFullLoginResponse(userId, primaryCompanyId)
   d) N Companies ohne Primary → TempToken (type: 'company_selection') + availableCompanies[]
```

### `generateFullLoginResponse()` — vollständig

```
1. membershipService.validateMembership(userId, companyId):
   a) Membership laden (include: company.subscriptions, role.permissions)
   b) Permission-Expansion (PARENT_MAP):
      - "invoices"  → quotes, orders, delivery-notes, invoices, credit-notes, reminders
      - "finance"   → finance, cash-book, cost-centers, budgets, debtors, creditors,
                      bank-accounts, chart-of-accounts, journal-entries, general-ledger,
                      balance-sheet, vat-returns, fixed-assets
      - "employees" → employees, employee-contracts, payroll, absences, travel-expenses,
                      recruiting, training, departments, orgchart
      - "settings"  → users, roles, company, settings
   c) Jede RolePermission "admin" → expandiert zu [read, write, delete, admin]
   d) UserPermissionOverride laden (für userId+companyId)
   e) Override ersetzt Rollen-Permission für das betreffende Modul vollständig

2. tokenService.generateAccessToken(payload):
   Payload: { sub: userId, email, activeCompanyId, roleId, permissions[], isOwner }
   Expiry: 15 Minuten

3. tokenService.generateRefreshToken(userId):
   - Zufälligen Token generieren
   - bcrypt-Hash in RefreshToken-Tabelle speichern (Expiry: 7 Tage)
   - Alten Device-Token revoken (optional, bei erneutem Login)

4. Response: { accessToken, refreshToken, user, activeCompany }
```

### Was im JWT steht

```json
{
  "sub": "userId",
  "email": "user@example.com",
  "activeCompanyId": "companyId",
  "roleId": "roleId",
  "permissions": ["invoices:read", "invoices:write", "customers:read", "finance:read", ...],
  "isOwner": false,
  "iat": 1700000000,
  "exp": 1700000900
}
```

**Permissions werden beim Login einmal vollständig berechnet und im Token gespeichert.**  
Bei jeder API-Anfrage werden sie aus dem Token gelesen — **nicht erneut aus der DB geladen** (Ausnahme: `/auth/me`).

---

## 4️⃣ Autorisierung — Zugriffskontrolle (IST)

### Guard-Stack

| Guard | Datei | Was wird geprüft | DB-Zugriff |
|---|---|---|---|
| `JwtAuthGuard` | `jwt-auth.guard.ts` | JWT-Signatur, Ablauf, dann `JwtStrategy.validate()` | **Ja** — User + Role aus DB |
| `CompanyGuard` | `company.guard.ts` | Company.status ACTIVE, Membership vorhanden | **Ja** — 2 separate Queries |
| `SubscriptionGuard` | `subscription.guard.ts` | Subscription.status in [ACTIVE, PAST_DUE, CANCELLED] | **Ja** |
| `PermissionGuard` | `permission.guard.ts` | `user.permissions[]` aus JWT-Payload; isOwner bypass | **Nein** — nur JWT |
| `PlanLimitsGuard` | `plan-limits.guard.ts` | Count vs. Plan-Limit (max_users, max_projects etc.) | **Ja** |

### `JwtStrategy.validate()` — was wirklich passiert

```typescript
// jwt.strategy.ts — jede authentifizierte Anfrage:
1. JWT dekodieren und Signatur prüfen (Passport)
2. user = prisma.user.findUnique({ where: { id: payload.sub }, include: { role: true } })
3. if (!user || user.status !== 'ACTIVE') → UnauthorizedException
   // ⚠️ NICHT geprüft: user.isActive — nur user.status
4. if (!payload.activeCompanyId) → UnauthorizedException
5. Request mit user + payload anreichern (req.user = {...})
```

### Decorator: `@RequirePermissions()`

```typescript
// Verwendung an Controllern/Methoden:
@RequirePermissions('invoices:write')
// → PermissionGuard liest req.user.permissions[] aus JWT
// → prüft ob 'invoices:write' enthalten ist
// → isOwner === true → immer erlaubt
```

### Tatsächliche Guard-Verwendung in Controllern

| Controller | Guards | Permission-Check |
|---|---|---|
| `AuthController` | Keine (public) | — |
| `UsersController` | Nur `JwtAuthGuard` | Kein PermissionGuard |
| `InvitationsController` | Voller Stack (alle 5 Guards) | ✅ `users:write` |
| `SubscriptionsController` | Mixed — teils kein SubscriptionGuard | ✅ `settings:admin` (teilweise) |
| `RolesController` | `JwtAuthGuard` + `CompanyGuard` | Teilweise |
| `CustomersController` | Nur `JwtAuthGuard` | ❌ Kein PermissionGuard |
| `InvoicesController` | Nur `JwtAuthGuard` | ❌ Kein PermissionGuard |
| `EmployeesController` | Nur `JwtAuthGuard` | ❌ Kein PermissionGuard |
| `FinanceController` | Nur `JwtAuthGuard` | ❌ Kein PermissionGuard |
| `ProjectsController` | Nur `JwtAuthGuard` | ❌ Kein PermissionGuard |
| ~55 weitere Controller | Nur `JwtAuthGuard` | ❌ Kein PermissionGuard |

### Frontend-Seite

```
AuthContext.tsx
└── state.activeCompany.permissions[] (beim Login befüllt, im Memory gehalten)
    ↓
usePermissions() Hook
├── hasPermission(permission: string): boolean
│   → isOwner → true
│   → permissions.includes('*') → true
│   → permissions.includes(permission)
├── canAccessModule(module) → hasPermission(`${module}:read`)
├── canWrite(module) → hasPermission(`${module}:write`)
└── canDelete(module) → hasPermission(`${module}:delete`)
    ↓
<PermissionGuard module="..." action="...">
└── rendert children ODER AccessDenied-UI
    ↓
AppSidebar
└── filtert Navigationspunkte via canAccessModule()
    → nur UI-Hiding, kein echter Schutz
```

---

## 5️⃣ Verhalten bei Entzug von Berechtigungen

### Szenarien-Matrix

| Szenario | Technische Auswirkung | Sofort wirksam? | Wie? |
|---|---|---|---|
| **Rolle eines Users geändert** | JWT-Permissions veraltet; neue Permissions erst nach Re-Auth / switchCompany | ❌ Nein | JWT läuft nach max. 15min ab |
| **Permission-Override gesetzt** | JWT veraltet; `/auth/me` aktualisiert UI-State, aber nicht JWT-Permissions | ❌ Für API | `/auth/me` aktualisiert UI |
| **Membership gelöscht** | `CompanyGuard` prüft DB → wirkt sofort **wo CompanyGuard eingesetzt ist** | ✅ Teilweise | CompanyGuard (nur ~2 Controller) |
| **User deaktiviert (`isActive=false`)** | `jwt.strategy.ts` prüft nur `user.status` nicht `user.isActive` → Token bleibt gültig | ❌ Nein | Nur nach Token-Ablauf |
| **User gesperrt (`status=SUSPENDED`)** | `jwt.strategy.ts` prüft `user.status !== 'ACTIVE'` → sofort blockiert | ✅ Ja | JwtStrategy |
| **User gelöscht (`status=DELETED`)** | Login blockiert, aber aktives JWT bleibt bis Ablauf gültig | ⚠️ Verzögert | Token-Ablauf |
| **Sessions revoken** | RefreshTokens gelöscht → kein Token-Renewal; aktives Access Token max. 15min gültig | ⚠️ Verzögert | RefreshToken-Revocation |
| **Subscription gekündigt** | `SubscriptionGuard` blockiert — **nur dort wo eingesetzt** (~2 Controller) | ✅ Teilweise | SubscriptionGuard |

### Kategorisierung der Schutzebenen

```
UI-Hide (schwächste Ebene):
└── AppSidebar filtert Navigationspunkte via canAccessModule()
    → Kein Schutz: direkte URL funktioniert trotzdem

Client-Side-Condition (keine echte Sperre):
└── <PermissionGuard> rendert "Zugriff verweigert" im Browser
    → Kein Schutz: API-Call direkt via Postman funktioniert trotzdem

Token-basierte Validierung (max. 15min veraltet):
└── PermissionGuard prüft JWT-Permissions
    → Schützt API-Endpoints wo @RequirePermissions() gesetzt
    → Nur ~2 von ~60 Controllern sind betroffen

Server-Side-Validation (sofort, DB-basiert):
└── JwtAuthGuard → user.status prüfen (sofort bei SUSPENDED/DELETED)
└── CompanyGuard → Membership + Company.status (sofort)
    → Aber: CompanyGuard nur in ~2 Controllern aktiv
```

---

## 6️⃣ Konsistenzanalyse

### Inkonsistenz 1: Doppeltes Rollenmodell

```
User.role (UserRole Enum: ADMIN/MANAGER/EMPLOYEE/READONLY)
  ↕ beide existieren parallel
UserCompanyMembership.roleId → Role (dynamisch, firmengebunden)
```
- `users.service.ts` mappt beide: gibt bei API-Response sowohl das Enum als auch den Role-Namen zurück
- Bei Erstellung neuer Users wird `User.role` noch gesetzt (Legacy)
- Tatsächliche Zugriffskontrolle läuft über `Role`, nicht über `User.role`

### Inkonsistenz 2: Doppeltes Status-Feld

```
User.status (UserStatus Enum: ACTIVE/PENDING/SUSPENDED/DELETED)
  ↕ redundant
User.isActive (Boolean: true/false)
```
- `users.service.ts` mappt: `status === 'PENDING' ? 'pending' : isActive ? 'active' : 'inactive'`
- `jwt.strategy.ts` prüft **nur** `user.status !== 'ACTIVE'`
- `user.isActive = false` bei `user.status = 'ACTIVE'` → JWT bleibt gültig!
- Deaktivierung via UI setzt `isActive=false`, ändert aber möglicherweise nicht `status`

### Inkonsistenz 3: Guard-Anwendung

```
~60 Controller im System
├── ~2 Controller: Voller Guard-Stack
├── ~3 Controller: JwtAuthGuard + CompanyGuard
└── ~55 Controller: Nur JwtAuthGuard
```
- Resultat: Die meisten Business-Endpoints sind nur gegen nicht-authentifizierte Anfragen geschützt

### Inkonsistenz 4: Backend-Permission-Prüfung fehlt

```
PermissionGuard + @RequirePermissions():
├── invitations/* → ✅ users:write geprüft
├── subscriptions/* → ✅ settings:admin teilweise geprüft
└── customers/invoices/employees/finance/projects/... → ❌ Keine Permission-Prüfung
```
- Ein authentifizierter User mit gültigem JWT kann alle Business-Endpoints unabhängig von seiner Rolle nutzen

### Inkonsistenz 5: User ↔ Employee Dopplung

```
User (Auth-System)    Employee (HR-System)
     ↕ optional, manuell verknüpft
     User.employeeId → Employee.id
```
- Verknüpfung existiert, ist aber optional
- Kein erzwungener Sync: Employee-Datensatz kann ohne User existieren
- User kann ohne Employee-Datensatz existieren
- Name/Email werden nicht synchronisiert

### Inkonsistenz 6: Legacy `User.companyId`

```
User.companyId (Legacy FK → Company)
```
- Wird bei Registrierung noch gesetzt
- Wird bei Einladungs-Flow nicht mehr gesetzt
- Services verwenden `activeCompanyId` aus JWT, nicht `User.companyId`
- Datenbankfeld existiert, wird aber nicht für Zugriffskontrolle genutzt

### Inkonsistenz 7: `/auth/me` Permission-Refresh

```
/auth/me → lädt frische Permissions aus DB
         → gibt sie als JSON zurück
         → Frontend speichert in AuthContext.state (Memory)
         → JWT-Permissions bleiben veraltet
```
- Resultat: Frontend-UI zeigt neue Permissions (nach `/auth/me`)
- Backend PermissionGuard prüft weiterhin alte JWT-Permissions
- Divergenz zwischen UI-State und tatsächlichem API-Schutz

---

## 7️⃣ Sicherheitsanalyse

### Stärken

| Bereich | Implementierung |
|---|---|
| Passwort-Hashing | bcrypt mit Standard-Salt-Rounds |
| Refresh Token Sicherheit | tokenHash (bcrypt) in DB gespeichert, nicht der Token selbst |
| Token-Rotation | Alter RefreshToken wird bei Erneuerung revoked |
| Rate-Limiting | Login: 5/15min, Register: 3/h (`@nestjs/throttler`) |
| 2FA | TOTP implementiert, TempToken-Flow korrekt |
| isOwner-Bypass | Korrekt in PermissionGuard implementiert |
| Self-Protection | User kann sich nicht selbst löschen/sperren |
| Owner-Protection | Owner-Membership kann nicht gelöscht werden |
| Session-Management | RefreshToken-Liste pro User, Revocation möglich |

### Schwachstellen (kritisch nach Schweregrad)

#### 🔴 KRITISCH: Fehlende Backend-Permission-Prüfung

```
Problem: ~55 von ~60 Controllern haben keine @RequirePermissions() Dekoratoren
Auswirkung: Jeder authentifizierte User mit gültigem JWT kann:
  - Rechnungen erstellen/löschen (ohne invoices:write)
  - Kundendaten manipulieren (ohne customers:write)
  - Mitarbeiterdaten einsehen (ohne employees:read)
  - Finanzdaten abrufen (ohne finance:read)
Angreifbarkeit: via Postman / direkte API-Calls
Schutz aktuell: Nur Frontend-UI-Hiding
```

#### 🔴 KRITISCH: User-Deaktivierung blockiert JWT nicht

```
Problem: user.isActive=false wird in jwt.strategy.ts nicht geprüft
         Nur user.status !== 'ACTIVE' wird geprüft
Auswirkung: Deaktivierter User kann bis Token-Ablauf (max. 15min) weiter API-Calls machen
Bedingung: Wenn users.service deactivateUser() isActive=false setzt aber status=ACTIVE lässt
Fix: jwt.strategy.ts muss auch user.isActive prüfen ODER deactivateUser() muss status setzen
```

#### 🟡 MITTEL: Access Token nicht sofort invalidierbar

```
Problem: revokeSessions() löscht nur RefreshTokens
Auswirkung: Aktives Access Token bleibt max. 15min nach Revocation gültig
Begrenzt durch: 15min Ablaufzeit
Kein Fix ohne: Token-Blacklist (Redis) oder DB-Check bei jeder Anfrage
```

#### 🟡 MITTEL: CompanyGuard in den meisten Controllern nicht eingesetzt

```
Problem: Services filtern zwar nach companyId aus JWT-Claim
         Aber companyId-Claim wird nicht DB-verifiziert (kein CompanyGuard)
Auswirkung: Wenn JWT-Claim manipulierbar wäre → Cross-Tenant-Zugriff möglich
Aktuelle Absicherung: JWT-Signatur schützt gegen Manipulation des Claims
Risiko: Gering (wegen JWT-Signatur), aber Architektur vertraut JWT zu stark
```

#### 🟡 MITTEL: `/auth/getMyCompanies` nicht implementiert

```
// Tatsächlicher Code:
async getMyCompanies() {
  // TODO: Implement
  return [];
}
Auswirkung: Company-Switcher im Frontend zeigt keine verfügbaren Companies
```

#### 🟢 GERING: AuditLog nicht bei Login geschrieben

```
Problem: Login schreibt lastLoginAt, aber keinen AuditLog-Eintrag
Auswirkung: Login-Historie in users.service basiert auf AuditLog → immer leer
Die UI zeigt Login-Aktivität, die nie geschrieben wird
```

---

## 8️⃣ Skalierungsanalyse

### Performance nach Company-Anzahl

| Szenario | Bewertung | Risiken |
|---|---|---|
| 1 Company | ✅ Optimal | Keine |
| 50 Companies | ✅ Gut | Keine kritischen |
| 500 Companies | ⚠️ Risiken | Mehrere Performance-Punkte |

### Indexe (vorhanden)

```prisma
UserCompanyMembership: @@index([userId]), @@index([companyId]), @@index([roleId])
RolePermission:        @@index([roleId])
RefreshToken:          @@index([userId])
Subscription:          @@index([companyId])
AuditLog:              @@index([userId]), @@index([companyId])
```

### Performance-Risiken bei 500+ Companies

#### Risiko 1: `getActiveCompaniesForUser()` beim Login

```typescript
// Für jeden Login:
prisma.userCompanyMembership.findMany({
  where: { userId, company: { status: 'ACTIVE', subscriptions: { some: { status: [...] } } } },
  include: { company: { include: { subscriptions: { take: 1 } } }, role: true }
})
// Bei 500 Companies pro User: nested Include über alle Memberships
// Kein Pagination — lädt alles
```

#### Risiko 2: `validateMembership()` bei Login / switchCompany

```typescript
// 1 Query mit tiefen Nested-Includes:
prisma.userCompanyMembership.findUnique({
  include: {
    company: { include: { subscriptions: { include: { plan: true } } } },
    role: { include: { permissions: true } }  // alle RolePermissions
  }
})
// + Separater Query: UserPermissionOverride.findMany()
// 2 DB-Roundtrips bei jeder Company-Auswahl
```

#### Risiko 3: `CompanyGuard` — 2 Queries pro Request

```typescript
// Wo CompanyGuard aktiv ist (aktuell ~2 Controller):
Query 1: company = prisma.company.findUnique(...)
Query 2: membership = prisma.userCompanyMembership.findUnique(...)
// Bei hohem Traffic: signifikante DB-Last
// Empfehlung: Zusammenführen oder Redis-Caching
```

### N+1 Analyse

| Bereich | N+1 Risiko | Bewertung |
|---|---|---|
| Permission-Expansion (PARENT_MAP) | Nein — rein In-Memory | ✅ |
| `validateMembership()` | Nein — Prisma-Include (1 Query + 1) | ✅ |
| `getActiveCompaniesForUser()` | Nein — 1 Query mit Includes | ✅ |
| `CompanyGuard` | Nein — 2 feste Queries | ⚠️ Redundant |
| `getLoginHistory()` | Nein — simples AuditLog-Query (limit 20) | ✅ |

---

## 9️⃣ Tatsächlich implementiertes Zugriffskonzept

### Konzept-Mapping

| Ebene | Konzept | Tatsächlicher IST-Zustand |
|---|---|---|
| **Design-Intention** | Multi-Tenant RBAC mit individuellem Override | Ja — konzeptionell korrekt designed |
| **Frontend-Sichtbarkeit** | RBAC vollständig | ✅ Funktioniert (Sidebar + PermissionGuard) |
| **Token-Inhalt** | RBAC im JWT | ✅ Permissions vollständig im JWT |
| **API-Schutz** | RBAC via Guards | ❌ Nur ~2 von ~60 Controllern |
| **Hybrid-Element** | UserPermissionOverride | ✅ Funktioniert korrekt |
| **Policy-basiert** | Objekt-Ownership | ❌ Nicht implementiert |
| **Attribute-based** | Ressourcen-spezifische Rechte | ❌ Nicht implementiert |

### Fazit: Das System ist

```
Frontend: Vollständiges RBAC ✅
JWT-Layer: RBAC mit Hybrid-Override ✅
Backend-API: De-facto nur AuthN (wer eingeloggt ist, darf alles) ⚠️
```

---

## 🔟 Gesamtzusammenfassung

### Vollständige Architektur

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  AuthContext → usePermissions → PermissionGuard     │
│  AppSidebar filtert via canAccessModule()           │
│  Schutz: UI-Only, kein echter API-Schutz           │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP + Bearer JWT
┌──────────────────────▼──────────────────────────────┐
│                   BACKEND (NestJS)                   │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │           Guard-Pipeline                     │    │
│  │  JwtAuthGuard → CompanyGuard* →             │    │
│  │  SubscriptionGuard* → PermissionGuard* →    │    │
│  │  PlanLimitsGuard*                           │    │
│  │  (* = nur in ~2 Controllern aktiv)          │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ~60 Controller                                      │
│  ├── ~2 Controller: Voller Schutz                   │
│  └── ~58 Controller: Nur JWT-Auth                   │
└──────────────────────┬──────────────────────────────┘
                       │ Prisma ORM
┌──────────────────────▼──────────────────────────────┐
│                  PostgreSQL                          │
│  User / Company / UserCompanyMembership / Role      │
│  RolePermission / UserPermissionOverride            │
│  Subscription / RefreshToken / AuditLog             │
└─────────────────────────────────────────────────────┘
```

### Bewertungsmatrix

| Kriterium | Bewertung | Details |
|---|---|---|
| **Sicherheitsniveau** | 🟡 Mittel | Frontend-RBAC vollständig; Backend-API fast ungeschützt |
| **Logische Klarheit** | 🟡 Mittel | Doppelkonzepte (role/isActive) reduzieren Klarheit |
| **Architektur-Konsistenz** | 🟠 Niedrig | Guards inkonsistent angewendet |
| **Komplexitätsgrad** | 🟡 Hoch | Multi-Tenant + Override-System + Legacy-Felder |
| **Wartbarkeit** | 🟡 Mittel | Gut strukturiert, aber Legacy-Debt vorhanden |
| **Erweiterbarkeit** | 🟢 Gut | PARENT_MAP-System gut erweiterbar |
| **Skalierbarkeit** | 🟡 Mittel | Indexe vorhanden, aber 500+ Company-Szenarien riskant |
| **Datenbankdesign** | 🟢 Gut | Normalisiert, Unique-Constraints korrekt |

### Schwachstellen (priorisiert)

| Priorität | Schwachstelle | Impact |
|---|---|---|
| 🔴 P0 | Fehlende Backend-Permission-Guards auf ~58 Controllern | Kritisch |
| 🔴 P0 | `isActive=false` blockiert JWT nicht (nur `status=SUSPENDED`) | Kritisch |
| 🟡 P1 | Access Token nicht invalidierbar nach Session-Revocation | Mittel |
| 🟡 P1 | `/auth/getMyCompanies` nicht implementiert (TODO) | Mittel |
| 🟡 P1 | CompanyGuard in den meisten Business-Controllern fehlt | Mittel |
| 🟢 P2 | AuditLog bei Login wird nicht geschrieben | Gering |
| 🟢 P2 | Legacy `User.role` Enum koexistiert mit Role-System | Gering |
| 🟢 P2 | `User.companyId` Legacy-FK wird nicht mehr konsistent gesetzt | Gering |

### Technische Risiken

1. **Cross-Tenant-Datenzugriff** (theoretisch): Services filtern nach `companyId` aus JWT-Claim. Ohne CompanyGuard (DB-Verifikation) vertraut das System vollständig der JWT-Signatur. Kein konkretes Angriffsszenario, aber Architektur-Risiko.

2. **Permission-Drift**: Wenn Permissions geändert werden, divergieren JWT-State (bis 15min) und DB-State. Für kritische Operationen ist dies relevant.

3. **isActive/status Inkonsistenz**: Zwei Wege zum gleichen Ziel (User deaktivieren) mit unterschiedlichem Sicherheitsverhalten — Fehlerquelle für zukünftige Entwicklung.

4. **Wachsender PARENT_MAP**: Die Expansion-Map in `membership.service.ts` muss manuell gepflegt werden. Bei 100+ Modulen wird dies unübersichtlich.

---

*Analyse-Basis: Quellcode-Lesung von prisma/schema.prisma, auth.service.ts, membership.service.ts, token.service.ts, jwt.strategy.ts, alle 5 Guards, users.service.ts, users.controller.ts, AuthContext.tsx, use-permissions.ts, PermissionGuard.tsx — Stand: 2026-02-18*
