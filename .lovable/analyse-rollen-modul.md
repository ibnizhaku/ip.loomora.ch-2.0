# Analyse: Rollen-Modul – Vollständige Systemprüfung
**Erstellt:** 2026-02-18  
**Scope:** `/roles`, `/users`, `/users/:id`, Verknüpfungen Benutzer ↔ Mitarbeiter

---

## 1. Routing-Übersicht (App.tsx)

| Route | Komponente | Status |
|-------|-----------|--------|
| `/roles` | `Roles.tsx` | ✅ Registriert |
| `/roles/new` | `RoleCreate.tsx` | ✅ Registriert |
| `/roles/:id` | `RoleDetail.tsx` | ✅ Registriert |
| `/roles/:id/edit` | `RoleEdit.tsx` | ✅ Registriert |
| `/users` | `Users.tsx` | ✅ Registriert |
| `/users/new` | `UserCreate.tsx` | ✅ Registriert |
| `/users/:id` | `UserDetail.tsx` | ✅ Registriert |
| `/users/:id/edit` | `UserEdit.tsx` | ✅ Registriert |

**→ Alle Routen korrekt registriert. Keine fehlenden Routen.**

---

## 2. Gefundene Bugs & Fixes

### 🔴 BUG-01: Dupliziertes Checkbox-Binding in RoleEdit.tsx & RoleCreate.tsx

**Datei:** `src/pages/RoleEdit.tsx` (Zeile 161) und `src/pages/RoleCreate.tsx` (Zeile 140)

**Problem:** Die Spalte "Bearbeiten" zeigt denselben Wert wie "Erstellen" (`permissions[mod.key].write`). Das `write`-Flag wird zweimal gebunden. Es gibt kein separates `edit`-Feld im Backend – korrekt wäre, dass "Erstellen" und "Bearbeiten" beide `write` mappen, aber das ist UI-technisch verwirrend wenn beide Checkboxen dasselbe State-Feld spiegeln und nur eine reagiert auf Klicks.

**Fix:** ✅ Behoben – "Erstellen" und "Bearbeiten" beide an `write` binden aber mit korrektem `onCheckedChange`.

---

### 🔴 BUG-02: "Rolle ändern" im Users-Dropdown öffnet nur Toast

**Datei:** `src/pages/Users.tsx` (Zeile 401)

**Problem:**
```tsx
// VORHER (falsch):
<DropdownMenuItem onClick={() => toast.info("Rolle ändern - Dialog öffnen")}>
  Rolle ändern
</DropdownMenuItem>
```

**Fix:** ✅ Behoben – navigiert jetzt zu `/users/:id/edit`.

---

### 🔴 BUG-03: "Passwort zurücksetzen" in Users-Dropdown macht nur Toast

**Datei:** `src/pages/Users.tsx` (Zeile 404)

**Problem:**
```tsx
// VORHER (falsch):
<DropdownMenuItem onClick={() => toast.success("Passwort-Reset E-Mail gesendet")}>
```

**Fix:** ✅ Behoben – navigiert zu `/users/:id/edit` (Edit-Seite enthält Passwort-Reset).

---

### 🔴 BUG-04: "Deaktivieren" in Users-Dropdown macht nur Toast

**Datei:** `src/pages/Users.tsx` (Zeile 407-410)

**Problem:** Kein API-Call, nur Toast.

**Fix:** ✅ Behoben – navigiert zu `/users/:id/edit` für Status-Änderung.

---

### 🟡 BUG-05: "Duplizieren" in RoleDetail navigiert zu `/roles/new` ohne Daten

**Datei:** `src/pages/RoleDetail.tsx` (Zeile 124)

**Problem:** Button "Duplizieren" öffnet `/roles/new` ohne die Rolle als Template zu übergeben. Der Nutzer muss alles neu eingeben.

**Fix:** ✅ Behoben – navigiert zu `/roles/new?copyFrom=:id` mit Query-Parameter. RoleCreate liest diesen Parameter und lädt die Quelldaten.

---

### 🟡 BUG-06: Inkonsistente permissionModules Listen

**Dateien:** `RoleCreate.tsx`, `RoleEdit.tsx`, `RoleDetail.tsx` haben nur 14 Module, `UserPermissionsWidget.tsx` hat 55 Module.

**Problem:** Wenn eine Rolle mit 55-Modul-Berechtigungen gespeichert ist, werden in der Rollenansicht nur 14 davon angezeigt.

**Fix:** ✅ Behoben – alle Seiten auf vollständige Modulliste erweitert.

---

### 🟡 BUG-07: UserDetail – Login-Historie ist Hard-coded Mock-Daten

**Datei:** `src/pages/UserDetail.tsx` (Zeile 18-24)

**Problem:** Login-Daten sind statisch und zeigen nicht echte Daten.

**Status:** Benötigt Backend-Endpoint – siehe Cursor-Prompt #4.

---

### 🟡 BUG-08: RoleDetail – Benutzer-Avatar zeigt keine HR-Verknüpfung

**Datei:** `src/pages/RoleDetail.tsx` (Zeile 232)

**Problem:** Benutzer in der Rollenliste werden mit `navigate('/users/:id')` verlinkt ✅. Aber der angezeigte `user.department` kommt aus dem Backend nicht zurück (Backend mapRole gibt kein `department` zurück).

**Fix:** Backend-seitig – siehe Cursor-Prompt #2.

---

## 3. Navigation & Workflow-Analyse

### Rollen-Modul Flow:

```
/roles (Liste)
  ├── [Klick auf Rolle]     → selectedRole State (inline Preview) ✅
  ├── [⋮ > Details]         → /roles/:id ✅
  ├── [⋮ > Bearbeiten]      → /roles/:id/edit ✅  
  ├── [⋮ > Löschen]         → AlertDialog → DELETE /roles/:id ✅
  └── [+ Neue Rolle]        → /roles/new ✅

/roles/:id (Detail)
  ├── [← Zurück]            → /roles ✅
  ├── [Bearbeiten]          → /roles/:id/edit ✅
  ├── [Duplizieren]         → /roles/new (ohne Daten) ⚠️ FIXED → /roles/new?copyFrom=:id
  ├── [Löschen]             → AlertDialog → DELETE → /roles ✅
  └── [Benutzer klicken]    → /users/:id ✅

/roles/new (Erstellen)
  └── [Speichern]           → /roles ✅

/roles/:id/edit (Bearbeiten)
  └── [Speichern]           → /roles/:id ✅
```

### Benutzer-Modul Flow:

```
/users (Liste)
  ├── [Zeile klicken]       → /users/:id ✅
  ├── [⋮ > Profil anzeigen] → /users/:id ✅
  ├── [⋮ > Rolle ändern]    → toast.info() ❌ FIXED → /users/:id/edit
  ├── [⋮ > Passwort reset]  → toast.success() ❌ FIXED → /users/:id/edit
  ├── [⋮ > Deaktivieren]    → toast.warning() ❌ FIXED → /users/:id/edit
  └── [+ Benutzer erstellen]→ /users/new ✅

/users/:id (Detail)
  ├── [← Zurück]            → /users ✅
  ├── [Bearbeiten]          → /users/:id/edit ✅
  ├── [Passwort zurücksetzen] → toast only ⚠️ (kein API Call)
  ├── [HR-Mitarbeiter Link] → /hr/employees/:id ✅
  └── [Berechtigungen]      → UserPermissionsWidget (55 Module) ✅
```

---

## 4. Verknüpfungen Benutzer ↔ Rolle ↔ Mitarbeiter

| Verknüpfung | Frontend | Backend | Status |
|-------------|----------|---------|--------|
| Benutzer → Rolle (anzeigen) | UserDetail zeigt `role` + `roleName` | `GET /users/:id` gibt `roleName` zurück | ✅ |
| Benutzer → Rolle (ändern) | UserEdit: Dropdown mit allen Rollen | `PUT /users/:id` mit `roleId` | ✅ |
| Rolle → Benutzer (Liste) | RoleDetail zeigt `role.users` | `GET /roles/:id` include memberships | ✅ |
| Benutzer → Mitarbeiter | UserDetail: Link zu `/hr/employees/:id` | `employeeId` im User-Response | ✅ |
| Mitarbeiter → Benutzer | EmployeeDetail: sollte Link zu `/users/:id` zeigen | Unklar | ⚠️ |
| Rolle.department in RoleDetail | `user.department` angezeigt | Backend gibt kein `department` | ❌ |

---

## 5. Edge Cases & Fehlerzustände

| Szenario | Status |
|----------|--------|
| Rolle nicht gefunden (`/roles/invalid-id`) | ✅ "Rolle nicht gefunden" + Zurück-Button |
| System-Rolle bearbeiten | ✅ Felder disabled, kein Speichern-Button |
| System-Rolle löschen | ✅ ⋮-Menü zeigt Löschen nur für custom Rollen |
| Rolle mit aktiven Usern löschen | ✅ Backend gibt 409 zurück, `toast.error` wird ausgelöst |
| Benutzer nicht gefunden | ✅ "Benutzer nicht gefunden" + Link zurück |
| Lade-Zustand | ✅ Loader2 Spinner in Detail + Edit |
| Leere Rollenliste | ✅ Leerzustand mit Icon |

---

## 6. Cursor-Prompts für Backend-Fixes

---

### 🔧 Cursor-Prompt #1: department in RoleDetail-Benutzer

```
In backend/src/modules/roles/roles.service.ts, update the mapRole() method.

In the users mapping inside mapRole(), the memberships include the user but no department info.
Add department to the user select in the findAll() and findById() Prisma queries:

In the memberships include, change the user select to also include their department via employee:

memberships: {
  include: {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employee: {           // <-- add this
          select: {
            department: {
              select: { name: true }
            }
          }
        }
      }
    }
  }
}

Then in mapRole(), update the users mapping:
const users = (role.memberships || []).map((m: any) => ({
  id: m.user.id,
  name: `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim(),
  email: m.user.email || '',
  department: m.user.employee?.department?.name || undefined,  // <-- add this
}));
```

---

### 🔧 Cursor-Prompt #2: GET /users/:id soll roleName vollständig zurückgeben

```
In backend/src/modules/users/users.service.ts, in the findById() method:

Ensure that when mapping the user response, the roleName is included correctly.
The membership query should include the role name:

memberships: {
  where: { companyId },
  include: { 
    role: { select: { id: true, name: true } }
  }
}

In the response mapping, include:
{
  ...
  roleId: membership?.roleId,
  roleName: membership?.role?.name || null,
  role: membership?.role?.name?.toLowerCase() || 'user',
}

This ensures UserDetail and Users list display the correct custom role name.
```

---

### 🔧 Cursor-Prompt #3: GET /roles/:id soll createdBy als User-Name liefern

```
In backend/src/modules/roles/roles.service.ts:

Currently createdBy is hardcoded as 'System' for system roles and undefined for custom roles.

Add a createdByUser relation to the Role model if not present:
- In prisma/schema.prisma, add: createdByUserId String? and relation to User

Or alternatively, query the first membership with isOwner=true for the company
and return their name as createdBy for custom roles.

In mapRole(), change:
createdBy: role.isSystemRole ? 'System' : undefined,

To:
createdBy: role.isSystemRole ? 'System' : (role.createdByUser ? `${role.createdByUser.firstName} ${role.createdByUser.lastName}`.trim() : undefined),
```

---

### 🔧 Cursor-Prompt #4: Login-Historie Endpoint

```
Create a new endpoint in backend/src/modules/users/users.controller.ts:

@Get(':id/login-history')
@ApiOperation({ summary: 'Get login history for user' })
getLoginHistory(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
  return this.usersService.getLoginHistory(id, user.companyId);
}

In backend/src/modules/users/users.service.ts, add:

async getLoginHistory(userId: string, companyId: string) {
  // Query AuditLog table for login events for this user
  const logs = await this.prisma.auditLog.findMany({
    where: {
      userId,
      companyId,
      action: { in: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] }
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
    gerät: log.userAgent || 'Unbekannt',
    status: log.action === 'LOGIN_SUCCESS' ? 'erfolgreich' : 'fehlgeschlagen',
  }));
}
```

---

### 🔧 Cursor-Prompt #5: Rollen-Duplikation mit Quelldaten

```
The frontend will call GET /roles/:id when duplicating (via ?copyFrom=id query param).
No backend changes needed – the existing GET /roles/:id endpoint returns all data
including permissions which the frontend uses to pre-fill the create form.

This is already handled by the useRole() hook in the frontend.
```

---

### 🔧 Cursor-Prompt #6: Password-Reset API Endpoint

```
In backend/src/modules/users/users.controller.ts, ensure this endpoint exists:

@Put(':id/password')
@ApiOperation({ summary: 'Reset user password by admin' })
resetPassword(
  @Param('id') id: string,
  @Body() body: { password: string },
  @CurrentUser() user: CurrentUserPayload,
) {
  return this.usersService.resetPassword(id, user.companyId, body.password);
}

In backend/src/modules/users/users.service.ts:

async resetPassword(userId: string, companyId: string, newPassword: string) {
  // Verify user belongs to company
  const membership = await this.prisma.companyMembership.findFirst({
    where: { userId, companyId }
  });
  if (!membership) throw new NotFoundException('Benutzer nicht gefunden');
  
  const hashed = await bcrypt.hash(newPassword, 12);
  await this.prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashed }
  });
  
  return { success: true };
}
```

---

## 7. Zusammenfassung

| Kategorie | Befund |
|-----------|--------|
| Routing | ✅ Vollständig & korrekt |
| Navigation (Buttons) | ⚠️ 3 Buttons nur Toast → gefixt |
| Query-Parameter | ⚠️ Duplikation ohne copyFrom → gefixt |
| Fehlerzustände | ✅ Gut abgedeckt |
| Ladezeiten | ✅ Loader überall vorhanden |
| Backend-Verknüpfungen | ⚠️ department fehlt, login-history statisch |
| Benutzer ↔ Rolle | ✅ Bidirektional vorhanden |
| Benutzer ↔ Mitarbeiter | ✅ Link vorhanden |
| Checkpoint-Bugs | 4 Frontend-Bugs gefixt |
| Cursor-Prompts für Backend | 5 Prompts erstellt |
