# Analyse: Benutzer-Modul – Vollständige Systemprüfung
**Erstellt:** 2026-02-18  
**Scope:** `/users`, `/users/new`, `/users/:id`, `/users/:id/edit` + Verknüpfungen Benutzer ↔ Rolle ↔ Mitarbeiter

---

## 1. Routing-Übersicht (App.tsx)

| Route | Komponente | Status |
|-------|-----------|--------|
| `/users` | `Users.tsx` | ✅ Registriert |
| `/users/new` | `UserCreate.tsx` | ✅ Registriert |
| `/users/:id` | `UserDetail.tsx` | ✅ Registriert |
| `/users/:id/edit` | `UserEdit.tsx` | ✅ Registriert |

**→ Alle User-Routen korrekt registriert. Keine fehlenden Routen.**

---

## 2. Gefundene Bugs & Fixes

---

### 🔴 BUG-01: UserDetail – "Passwort zurücksetzen" Button ist nur Toast (kein API-Call)

**Datei:** `src/pages/UserDetail.tsx` (Zeile 84-88 & 236)

**Problem:**
```tsx
// VORHER (falsch):
const handleResetPassword = () => {
  toast.success("Passwort-Reset E-Mail gesendet", { ... });
};
```
Der Button im Header AND im Sicherheits-Card ruft nur `toast.success()` auf – kein echter API-Call, kein Backend-Request.

**Fix:** ✅ Behoben – navigiert zu `/users/:id/edit` (Passwort-Reset Card ist dort direkt verfügbar).

---

### 🔴 BUG-02: UserDetail – twoFactorEnabled State nicht mit userData synchronisiert

**Datei:** `src/pages/UserDetail.tsx` (Zeile 50)

**Problem:**
```tsx
// VORHER (falsch):
const [twoFactorEnabled, setTwoFactorEnabled] = useState(userData?.twoFactor ?? false);
```
`useState()` wird nur beim ersten Render evaluiert. Wenn `userData` noch `undefined` ist (weil der API-Call noch läuft), wird der State immer `false` initialisiert – auch nachdem die Daten geladen sind.

**Fix:** ✅ Behoben – `useEffect` synchronisiert `twoFactorEnabled` wenn `userData` sich ändert.

---

### 🔴 BUG-03: UserDetail – Login-Historie zeigt statische Mock-Daten

**Datei:** `src/pages/UserDetail.tsx` (Zeile 18-24)

**Problem:**
```tsx
const loginHistorie = [
  { datum: "29.01.2024 08:15", ip: "85.195.xxx.xxx", ... },
  // Komplett hardcoded Mock-Daten aus Januar 2024
];
```
Jeder Benutzer sieht dieselben fiktiven Einträge. Kein Backend-Endpoint wird aufgerufen.

**Fix:** ✅ `useLoginHistory(id)` Hook erstellt der echten Endpoint `GET /users/:id/login-history` aufruft. Mit Lade- und Leer-Zustand.

---

### 🔴 BUG-04: UserEdit – EmployeeLinkCard: "Mitarbeiter zuweisen" Select hat keinen onValueChange Handler

**Datei:** `src/pages/UserEdit.tsx` (Zeile 285-296)

**Problem:**
```tsx
// VORHER (falsch):
<Select>
  <SelectTrigger className="w-[250px]">
    <SelectValue placeholder="Mitarbeiter zuweisen..." />
  </SelectTrigger>
  <SelectContent>
    {employees.map((emp) => (
      <SelectItem key={emp.id} value={emp.id}>...
```
Das `<Select>` hat **keinen `onValueChange` Handler** – die Auswahl eines Mitarbeiters hat keinerlei Effekt. Kein API-Call, keine State-Änderung.

**Fix:** ✅ Behoben – `onValueChange` ruft `PUT /users/:id` mit `employeeId` auf via `useUpdateUser`.

---

### 🟡 BUG-05: UserDetail – Header zeigt rohe `id` statt sinnvoller Info

**Datei:** `src/pages/UserDetail.tsx` (Zeile 127)

**Problem:**
```tsx
<p className="text-muted-foreground">{id} {userEmployeeNumber && `• ${userEmployeeNumber}`}</p>
```
Die rohe UUID (z.B. `cmls3jjxl...`) wird direkt unter dem Namen angezeigt. Das ist nicht benutzerfreundlich.

**Fix:** ✅ Behoben – zeigt `E-Mail • Mitarbeiter-Nr.` statt der rohen ID.

---

### 🟡 BUG-06: Users.tsx – "Deaktivieren" im Dropdown sollte direkten API-Call machen

**Datei:** `src/pages/Users.tsx` (Zeile 407-410)

**Problem:** "Deaktivieren" navigiert zur Edit-Seite statt direkt den Status zu toggeln.

**Fix:** ✅ Behoben – direkter `useUpdateUser`-Call mit `isActive: false` + Bestätigungs-Dialog.

---

### 🟡 BUG-07: Users.tsx – "Passwort zurücksetzen" im Dropdown navigiert zu Edit-Seite statt direkt

**Status:** Akzeptierbar – Edit-Seite enthält Passwort-Card. Keine Änderung nötig.  
**Optional:** Tab-Parameter `?tab=password` könnte hinzugefügt werden, erfordert aber Tab-State in UserEdit.

---

### 🟡 BUG-08: UserDetail – Benutzer ↔ Mitarbeiter Link existiert, aber Mitarbeiter → Benutzer Link fehlt

**Datei:** `src/pages/EmployeeDetail.tsx`

**Problem:** In der UserDetail-Seite gibt es `<Link to={/hr/employees/${userEmployeeId}}>`. Aber in `EmployeeDetail.tsx` gibt es keinen umgekehrten Link zu `/users/:userId`.

**Fix:** → Backend muss `userId` im Employee-Response zurückgeben (Cursor-Prompt #3).

---

## 3. Navigation & Workflow-Analyse

### Benutzer-Modul Flow (vollständig):

```
/users (Liste)
  ├── [Klick auf Zeile]      → /users/:id ✅
  ├── [⋮ > Profil anzeigen]  → /users/:id ✅
  ├── [⋮ > Rolle ändern]     → /users/:id/edit ✅ (vorher: Toast)
  ├── [⋮ > Passwort reset]   → /users/:id/edit ✅ (vorher: Toast)
  ├── [⋮ > Deaktivieren]     → PATCH /users/:id {isActive: false} ✅ (vorher: Toast→Edit)
  ├── [⋮ > Löschen]          → confirm() → DELETE /users/:id ✅
  └── [+ Benutzer erstellen] → /users/new ✅

/users/new (Erstellen)
  ├── [← Zurück]             → /users ✅
  ├── Passwort: manuell      → POST /users {password} ✅
  ├── Passwort: E-Mail       → POST /users {sendInvite: true} ✅
  ├── Mitarbeiter anlegen     → POST /users {createEmployee: true} ✅
  └── [Erstellen]            → /users ✅

/users/:id (Detail)
  ├── [← Zurück]             → /users ✅
  ├── [Bearbeiten]           → /users/:id/edit ✅
  ├── [Passwort zurücksetzen]→ /users/:id/edit ✅ (vorher: Toast only)
  ├── [2FA Toggle]           → TwoFactorSetupDialog ✅
  ├── [2FA zurücksetzen]     → DELETE /users/:id/2fa ✅
  ├── [Sitzungen beenden]    → Toast only ⚠️ (kein Backend-Endpoint)
  ├── [HR-Mitarbeiter Link]  → /hr/employees/:id ✅
  ├── Login-Historie         → statisch ❌ FIXED → GET /users/:id/login-history
  └── [Berechtigungen]       → UserPermissionsWidget (55 Module) ✅

/users/:id/edit (Bearbeiten)
  ├── [← Zurück]             → /users/:id ✅
  ├── Persönliche Daten      → PUT /users/:id ✅
  ├── Rolle ändern           → Dropdown aus GET /roles ✅
  ├── Status (Aktiv/Inaktiv) → PUT /users/:id ✅
  ├── Mitarbeiter verknüpfen → Select OHNE Handler ❌ FIXED → PUT /users/:id {employeeId}
  ├── Mitarbeiter HR-Link     → /hr/employees/:id ✅
  ├── Passwort ändern        → PUT /users/:id/password ✅
  └── [Speichern]            → /users/:id ✅
```

---

## 4. Verknüpfungen Benutzer ↔ Rolle ↔ Mitarbeiter

| Verknüpfung | Frontend | Backend | Status |
|-------------|----------|---------|--------|
| Benutzer → Rolle (anzeigen) | UserDetail: Badge + `roleName` | `GET /users/:id` gibt `roleName` zurück | ✅ |
| Benutzer → Rolle (ändern) | UserEdit: Dropdown aus allen Rollen | `PUT /users/:id` mit `role` (roleId) | ✅ |
| Rolle → Benutzer (Liste) | RoleDetail: users[] | `GET /roles/:id` includes memberships | ✅ |
| Benutzer → Mitarbeiter (Link) | UserDetail: Link zu `/hr/employees/:id` | `employeeId` im User-Response | ✅ |
| Benutzer → Mitarbeiter (zuweisen) | UserEdit: Select OHNE onValueChange | `PUT /users/:id {employeeId}` | ❌ FIXED |
| Mitarbeiter → Benutzer | EmployeeDetail: kein Link zu `/users/:id` | `userId` nicht im Employee-Response | ❌ Backend |
| 2FA Admin-Reset | UserDetail: Button → DELETE /users/:id/2fa | Endpoint vorhanden | ✅ |
| Sitzungen beenden | UserDetail: Button → Toast only | Kein Endpoint | ⚠️ |

---

## 5. Edge Cases & Fehlerzustände

| Szenario | Status |
|----------|--------|
| Benutzer nicht gefunden (`/users/invalid-id`) | ✅ "Benutzer nicht gefunden" + Link zurück |
| Lade-Zustand UserDetail | ✅ Text "Laden..." |
| Lade-Zustand UserEdit | ✅ Loader2 Spinner |
| Lade-Zustand UserCreate | ✅ Button disabled + Text "Wird erstellt..." |
| Ungültige E-Mail in UserCreate | ✅ HTML type="email" Validierung |
| Passwort < 8 Zeichen | ✅ Inline-Fehlermeldung |
| Passwörter stimmen nicht überein | ✅ Inline-Fehlermeldung |
| Benutzer ohne Mitarbeiter-Verknüpfung | ✅ "Kein Mitarbeiter verknüpft" + Select |
| Benutzer mit Mitarbeiter-Verknüpfung | ✅ Badge + HR-Profil öffnen Button |
| Owner-Benutzer löschen | ⚠️ Kein Schutz im Frontend (Backend muss prüfen) |
| Sich selbst deaktivieren | ⚠️ Kein Schutz im Frontend |

---

## 6. Cursor-Prompts für Backend-Fixes

---

### 🔧 Cursor-Prompt #1: GET /users/:id/login-history Endpoint

```
In backend/src/modules/users/users.controller.ts, the endpoint already exists:

@Get(':id/login-history')
getLoginHistory(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
  return this.usersService.getLoginHistory(id, user.companyId);
}

In backend/src/modules/users/users.service.ts, implement getLoginHistory():

async getLoginHistory(userId: string, companyId: string) {
  // Verify user belongs to company
  const membership = await this.prisma.companyMembership.findFirst({
    where: { userId, companyId }
  });
  if (!membership) throw new NotFoundException('Benutzer nicht gefunden');

  // Query AuditLog for login events
  const logs = await this.prisma.auditLog.findMany({
    where: {
      userId,
      companyId,
      action: { in: ['LOGIN_SUCCESS', 'LOGIN_FAILED', 'login', 'login_failed'] }
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      action: true,
      createdAt: true,
      ipAddress: true,
      userAgent: true,
      metadata: true,
    }
  });

  return logs.map(log => ({
    id: log.id,
    datum: log.createdAt.toLocaleString('de-CH'),
    ip: log.ipAddress || 'Unbekannt',
    geraet: log.userAgent || 'Unbekannt',
    ort: (log.metadata as any)?.location || undefined,
    status: (log.action === 'LOGIN_SUCCESS' || log.action === 'login') ? 'erfolgreich' : 'fehlgeschlagen',
  }));
}
```

---

### 🔧 Cursor-Prompt #2: PUT /users/:id – employeeId verknüpfen

```
In backend/src/modules/users/dto/user.dto.ts, add to UpdateUserDto:

@ApiPropertyOptional({ description: 'ID des verknüpften Mitarbeiters' })
@IsString()
@IsOptional()
employeeId?: string;

In backend/src/modules/users/users.service.ts, update the update() method.
When employeeId is provided, update the Employee record to set userId:

async update(userId: string, companyId: string, dto: UpdateUserDto) {
  // ... existing logic ...
  
  if (dto.employeeId !== undefined) {
    // Verify employee belongs to company
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, companyId }
    });
    if (!employee) throw new BadRequestException('Mitarbeiter nicht gefunden');
    
    // Set userId on employee
    await this.prisma.employee.update({
      where: { id: dto.employeeId },
      data: { userId }
    });
  }
  
  // ... rest of update ...
}

Also ensure GET /users/:id returns the linked employeeId and employeeNumber:

In findById(), include employee relation:
memberships: {
  where: { companyId },
  include: {
    role: { select: { id: true, name: true } },
    user: {
      include: {
        employee: {
          select: { id: true, employeeNumber: true }
        }
      }
    }
  }
}

In the response mapping:
employeeId: membership?.user?.employee?.id || null,
employeeNumber: membership?.user?.employee?.employeeNumber || null,
```

---

### 🔧 Cursor-Prompt #3: EmployeeDetail – userId zurückgeben für Benutzer-Link

```
In backend/src/modules/employees/employees.service.ts, in the findById() method:

When mapping the employee response, include the linked userId:

In the Prisma query, add:
include: {
  ...
  user: {
    select: { id: true, firstName: true, lastName: true, email: true }
  }
}

In the response mapping:
{
  ...
  userId: employee.user?.id || null,
  userName: employee.user ? `${employee.user.firstName} ${employee.user.lastName}`.trim() : null,
  userEmail: employee.user?.email || null,
}

This allows EmployeeDetail.tsx to display a link to /users/:userId and show
that this employee has an associated user account.
```

---

### 🔧 Cursor-Prompt #4: POST /users – Schutz gegen Self-Deactivation und Owner-Löschung

```
In backend/src/modules/users/users.service.ts:

1. In the update() method, add protection against self-deactivation:
async update(userId: string, companyId: string, dto: UpdateUserDto, requestingUserId: string) {
  if (dto.isActive === false && userId === requestingUserId) {
    throw new ForbiddenException('Sie können sich nicht selbst deaktivieren');
  }
  // ... rest of update ...
}

2. In the delete() method, add protection against deleting the last owner:
async delete(userId: string, companyId: string, requestingUserId: string) {
  if (userId === requestingUserId) {
    throw new ForbiddenException('Sie können Ihren eigenen Account nicht löschen');
  }
  
  // Check if user is the only owner
  const membership = await this.prisma.companyMembership.findFirst({
    where: { userId, companyId }
  });
  if (membership?.isOwner) {
    const ownerCount = await this.prisma.companyMembership.count({
      where: { companyId, isOwner: true }
    });
    if (ownerCount <= 1) {
      throw new ForbiddenException('Der letzte Owner kann nicht gelöscht werden');
    }
  }
  // ... rest of delete ...
}

3. Pass requestingUserId from controller:
In users.controller.ts, update the calls:
update(@CurrentUser() user: CurrentUserPayload, ...) {
  return this.usersService.update(id, user.companyId, dto, user.userId);
}
remove(@CurrentUser() user: CurrentUserPayload, ...) {
  return this.usersService.delete(id, user.companyId, user.userId);
}
```

---

### 🔧 Cursor-Prompt #5: POST/DELETE /users/:id/sessions – Sitzungen beenden

```
Add a new endpoint to invalidate all active sessions for a user.

In backend/src/modules/users/users.controller.ts:

@Delete(':id/sessions')
@ApiOperation({ summary: 'Invalidate all active sessions for a user' })
endSessions(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
  return this.usersService.endSessions(id, user.companyId);
}

In backend/src/modules/users/users.service.ts:

async endSessions(userId: string, companyId: string) {
  // Option A: If using JWT with refresh tokens stored in DB:
  await this.prisma.refreshToken.deleteMany({
    where: { userId }
  });
  
  // Option B: If using a session blacklist / token version:
  await this.prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: { increment: 1 } }  // Increment invalidates all existing JWTs
  });
  
  return { success: true, message: 'Alle Sitzungen wurden beendet' };
}

Also add tokenVersion to JWT payload validation in the JWT strategy:
In backend/src/modules/auth/strategies/jwt.strategy.ts, validate tokenVersion matches.
```

---

### 🔧 Cursor-Prompt #6: GET /users – roleName in Listenansicht zurückgeben

```
In backend/src/modules/users/users.service.ts, in the findAll() method:

The list endpoint must return roleName for each user so the Users.tsx table
can display the correct custom role name instead of falling back to generic labels.

In the Prisma query for findAll(), include:
memberships: {
  where: { companyId },
  include: {
    role: { select: { id: true, name: true } }
  }
}

In the mapping function:
{
  id: user.id,
  name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  email: user.email,
  role: membership?.role?.name?.toLowerCase() || 'user',
  roleName: membership?.role?.name || null,
  roleId: membership?.roleId || null,
  status: user.isActive ? 'active' : 'inactive',
  lastLogin: user.lastLoginAt?.toLocaleString('de-CH') || '–',
  twoFactor: user.twoFactorEnabled || false,
  isOwner: membership?.isOwner || false,
  phone: user.phone || null,
  createdAt: user.createdAt?.toLocaleDateString('de-CH') || null,
}
```

---

## 7. Zusammenfassung

| Kategorie | Befund |
|-----------|--------|
| Routing | ✅ Vollständig & korrekt (4 Routen) |
| Navigation (Buttons) | ⚠️ 2 Buttons nur Toast → gefixt |
| Query-Parameter | ✅ Korrekt übergeben |
| State-Synchronisation | ❌ twoFactor State falsch → gefixt |
| Mock-Daten | ❌ Login-Historie statisch → Hook erstellt |
| Fehlerzustände | ✅ Gut abgedeckt |
| Ladezeiten | ✅ Loader überall vorhanden |
| EmployeeLinkCard | ❌ Select ohne Handler → gefixt |
| Header-Anzeige | ⚠️ Rohe UUID → gefixt (E-Mail + MA-Nr.) |
| Sicherheit | ⚠️ Self-Delete/Deactivate nicht geschützt → Backend-Prompt |
| Benutzer ↔ Rolle | ✅ Bidirektional vorhanden |
| Benutzer ↔ Mitarbeiter | ⚠️ Zuweisung funktionslos → gefixt |
| Mitarbeiter → Benutzer | ❌ Kein Rücklink → Backend-Prompt |
| Frontend-Bugs gefixt | 5 Bugs behoben |
| Cursor-Prompts für Backend | 6 Prompts erstellt |
