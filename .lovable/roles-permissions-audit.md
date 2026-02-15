# Rollen & Berechtigungen – Systematische Analyse

## Datum: 15.02.2026

---

## 1. Zusammenfassung der gefundenen Probleme

### 🔴 Kritisch
| # | Problem | Status |
|---|---------|--------|
| 1 | **Kein `/api/roles` Endpoint** – Frontend fragte `/users` ab statt `/roles` | ⚠️ Backend fehlt |
| 2 | **Kein Roles-Modul im Backend** – Rollen nur als System-Rollen in Auth erstellt | ⚠️ Backend fehlt |
| 3 | **RoleDetail.tsx nutzte hardcodierte Mock-Daten** – Keine API-Anbindung | ✅ Frontend gefixt |
| 4 | **Kein `use-roles.ts` Hook** – Fehlende CRUD-Operationen | ✅ Frontend gefixt |

### 🟡 Navigation & Routing
| # | Problem | Status |
|---|---------|--------|
| 5 | **"Neue Rolle" Button ohne onClick** – Keine Navigation | ✅ Frontend gefixt |
| 6 | **Dropdown-Menü "Details" ohne navigate()** – Sackgasse | ✅ Frontend gefixt |
| 7 | **Dropdown-Menü "Bearbeiten" ohne navigate()** – Sackgasse | ✅ Frontend gefixt |
| 8 | **Dropdown-Menü "Löschen" ohne Funktion** – Kein Delete-Call | ✅ Frontend gefixt |
| 9 | **Route `/roles/new` fehlte** – Nicht in App.tsx registriert | ✅ Frontend gefixt |
| 10 | **Route `/roles/:id/edit` fehlte** – Nicht in App.tsx registriert | ✅ Frontend gefixt |
| 11 | **Seite `RoleCreate.tsx` fehlte komplett** | ✅ Frontend erstellt |
| 12 | **Seite `RoleEdit.tsx` fehlte komplett** | ✅ Frontend erstellt |

### 🟡 Daten & API
| # | Problem | Status |
|---|---------|--------|
| 13 | **Roles.tsx fragte `/users` ab** statt `/roles` | ✅ Frontend gefixt |
| 14 | **Permission-Format Mismatch** – Frontend nutzte `module.view`/`module.*`, Backend nutzt `module:read`/`module:admin` | ✅ Frontend gefixt |
| 15 | **Kein Lösch-Bestätigungsdialog** | ✅ Frontend gefixt |
| 16 | **Kein Ladezustand** auf Roles und RoleDetail | ✅ Frontend gefixt |
| 17 | **Kein Fehlerzustand** wenn Rolle nicht gefunden | ✅ Frontend gefixt |

### ℹ️ Terminologie: Quotes vs. Offer
`/quotes` ist der englische technische API-Pfad. Im deutschen UI wird konsistent **"Angebote"** angezeigt. Das ist Standard-Praxis: Backend-Endpoints verwenden englische Bezeichnungen, das Frontend übersetzt ins Deutsche.

---

## 2. Frontend-Änderungen (durchgeführt)

### Neue Dateien erstellt:
- `src/hooks/use-roles.ts` – Vollständiger CRUD-Hook (useRoles, useRole, useCreateRole, useUpdateRole, useDeleteRole)
- `src/pages/RoleCreate.tsx` – Neue Rolle erstellen mit Berechtigungsmatrix
- `src/pages/RoleEdit.tsx` – Rolle bearbeiten mit vorausgefüllten Daten

### Überarbeitete Dateien:
- `src/pages/Roles.tsx` – Komplett überarbeitet:
  - API-Anbindung über `useRoles()` statt `/users`
  - Navigation in Dropdown-Menü (Details → `/roles/:id`, Bearbeiten → `/roles/:id/edit`)
  - "Neue Rolle" Button → `/roles/new`
  - Lösch-Bestätigungsdialog
  - Ladezustand
  - Permission-Check nutzt `module:read`/`module:write`/`module:admin` Format
- `src/pages/RoleDetail.tsx` – Komplett überarbeitet:
  - Mock-Daten entfernt, `useRole(id)` API-Hook
  - Lösch-Bestätigungsdialog statt direkter Navigation
  - "Duplizieren" → `/roles/new`
  - "Bearbeiten" → `/roles/:id/edit`
  - Lade- und Fehlerzustände
  - Dynamic permission parsing aus `module:read/write/delete/admin` Array
- `src/App.tsx` – Neue Routen:
  - `/roles/new` → RoleCreate
  - `/roles/:id/edit` → RoleEdit

---

## 3. Backend-Prompts für Cursor

### Prompt 1: Roles-Modul erstellen

```
Erstelle ein neues NestJS-Modul `backend/src/modules/roles/` mit folgender Struktur:

Dateien:
- roles.module.ts
- roles.controller.ts
- roles.service.ts
- dto/role.dto.ts (CreateRoleDto, UpdateRoleDto)

Das Modul muss folgende Endpoints bereitstellen:

GET /api/roles
- Query-Params: page, pageSize, search
- Response: { data: Role[], total, page, pageSize, totalPages }
- Jede Rolle enthält: id, name, description, type ('system'|'custom'), isSystem, userCount, permissions (string[]), color, users (Array mit id, name, email, department), createdAt, updatedAt, createdBy
- userCount = Anzahl Memberships mit dieser roleId
- users = Die User-Daten aus den Memberships (JOIN über membership → user → employee)
- Scoping: Nur Rollen der aktuellen Company (user.companyId)

GET /api/roles/:id
- Response: Einzelne Rolle mit allen Feldern wie oben
- Inklusive users-Array mit allen zugewiesenen Benutzern
- Inklusive kontingent/verlauf falls gewünscht

POST /api/roles
- Body: { name: string, description?: string, permissions: string[] }
- Erstellt neue Custom-Rolle für die aktuelle Company
- type = 'custom', isSystem = false
- Validierung: name darf nicht leer sein, name muss unique pro Company sein
- permissions Format: ["customers:read", "customers:write", "invoices:admin", ...]

PUT /api/roles/:id
- Body: { name?: string, description?: string, permissions?: string[] }
- System-Rollen (isSystem=true) dürfen NICHT bearbeitet werden → 403 Forbidden
- Validierung: Rolle muss zur aktuellen Company gehören

DELETE /api/roles/:id
- System-Rollen dürfen NICHT gelöscht werden → 403 Forbidden
- Prüfe ob noch Memberships mit dieser Rolle existieren → ConflictException
- Alternativ: Benutzer auf Default-Rolle umhängen

Guards:
- @UseGuards(JwtAuthGuard) auf dem ganzen Controller
- @RequirePermissions('users:admin') für POST, PUT, DELETE
- @RequirePermissions('users:read') für GET

Prisma Schema benötigt:
- Die Role-Tabelle existiert vermutlich schon (wird in auth für System-Rollen genutzt)
- Stelle sicher dass die Role-Tabelle folgende Felder hat:
  - id, name, description, type (enum: SYSTEM, CUSTOM), permissions (Json), companyId, color, createdAt, updatedAt, createdById
- Falls nicht vorhanden, erstelle eine Migration

Das Modul muss im AppModule registriert werden.

Permission-Format im Backend:
- Speichere permissions als JSON-Array: ["customers:read", "customers:write", "customers:delete", "customers:admin"]
- Module: customers, suppliers, products, quotes, orders, invoices, payments, employees, projects, finance, documents, contracts, settings, users
- Stufen: read, write, delete, admin (admin = alle Rechte für das Modul)
```

### Prompt 2: System-Rollen mit Permissions befüllen

```
Stelle sicher, dass die bestehenden System-Rollen (Owner, Admin, Mitarbeiter) korrekte permissions-Arrays haben:

Owner-Rolle:
- Alle Module mit :admin → ["customers:admin", "suppliers:admin", "products:admin", ...]

Admin-Rolle:
- Alle Module mit :admin (gleich wie Owner, aber isOwner=false)

Mitarbeiter-Rolle:
- Basis-Leserechte: ["customers:read", "products:read", "projects:read", "documents:read"]

Falls die System-Rollen noch keine permissions haben, erstelle eine Migration/Seed die diese befüllt.
```

### Prompt 3: ResponseMapper für Rollen

```
Stelle sicher, dass der Roles-Controller die Response korrekt mapped:

Für die Liste (GET /roles):
{
  data: [
    {
      id: "...",
      name: "Owner",
      description: "Vollzugriff auf alle Module",
      type: "system",
      isSystem: true,
      userCount: 2,
      permissions: ["customers:admin", ...],
      color: "bg-primary/10",
      users: [
        { id: "...", name: "Max Muster", email: "max@firma.ch", department: "IT" }
      ],
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      createdBy: "System"
    }
  ],
  total: 3,
  page: 1,
  pageSize: 10,
  totalPages: 1
}

Felder die gemapped werden müssen:
- isSystem = type === 'SYSTEM'
- userCount = _count.memberships oder manuell zählen
- users = memberships.map(m => ({ id: m.user.id, name: m.user.firstName + ' ' + m.user.lastName, email: m.user.email, department: m.user.employee?.department }))
- color = basierend auf type: SYSTEM → "bg-primary/10", CUSTOM → "bg-accent/10"
```

### Prompt 4: Permission Guard Kompatibilität

```
Der bestehende PermissionGuard (backend/src/modules/auth/guards/permission.guard.ts) prüft bereits permissions aus dem JWT-Token.

Stelle sicher, dass beim Token-Refresh und Login die permissions korrekt aus der Role-Tabelle geladen werden:

1. In TokenService/MembershipService: Lade role.permissions (JSON) und packe sie ins JWT
2. Beim Company-Switch: Lade die neue Role und deren permissions
3. Format im JWT muss sein: permissions: ["customers:read", "customers:write", ...]

Prüfe auch, dass die JwtStrategy die permissions korrekt aus dem Token extrahiert und in request.user setzt.
```

---

## 4. Vollständigkeits-Checkliste

| Bereich | Status |
|---------|--------|
| Route `/roles` registriert | ✅ |
| Route `/roles/new` registriert | ✅ |
| Route `/roles/:id` registriert | ✅ |
| Route `/roles/:id/edit` registriert | ✅ |
| Hook `useRoles()` – Liste | ✅ |
| Hook `useRole(id)` – Detail | ✅ |
| Hook `useCreateRole()` – Erstellen | ✅ |
| Hook `useUpdateRole()` – Bearbeiten | ✅ |
| Hook `useDeleteRole()` – Löschen | ✅ |
| "Neue Rolle" Button → `/roles/new` | ✅ |
| Dropdown "Details" → `/roles/:id` | ✅ |
| Dropdown "Bearbeiten" → `/roles/:id/edit` | ✅ |
| Dropdown "Löschen" → Bestätigungsdialog | ✅ |
| Zurück-Navigation auf allen Seiten | ✅ |
| Ladezustand (Spinner) | ✅ |
| Fehlerzustand (404) | ✅ |
| System-Rollen Schutz (nicht editierbar/löschbar) | ✅ |
| Permission-Format `module:read/write/delete/admin` | ✅ |
| Backend API `/api/roles` | ⚠️ Cursor-Prompt bereit |
| Backend Roles-Modul | ⚠️ Cursor-Prompt bereit |
| Backend System-Rollen Seed | ⚠️ Cursor-Prompt bereit |

---

## 5. User-Flow Übersicht

```
/roles (Liste)
  ├── "Neue Rolle" → /roles/new → POST /api/roles → Redirect /roles
  ├── Klick auf Rolle → selectedRole (Sidebar-Vorschau)
  ├── ⋮ Details → /roles/:id
  ├── ⋮ Bearbeiten → /roles/:id/edit
  └── ⋮ Löschen → Bestätigungsdialog → DELETE /api/roles/:id

/roles/:id (Detail)
  ├── "Bearbeiten" → /roles/:id/edit
  ├── "Duplizieren" → /roles/new
  ├── "Löschen" → Bestätigungsdialog → DELETE → Redirect /roles
  ├── Benutzer-Klick → /users/:userId
  └── ← Zurück → /roles

/roles/:id/edit (Bearbeiten)
  ├── "Speichern" → PUT /api/roles/:id → Redirect /roles/:id
  └── "Abbrechen" → /roles/:id

/roles/new (Erstellen)
  ├── "Erstellen" → POST /api/roles → Redirect /roles
  └── "Abbrechen" → /roles
```
