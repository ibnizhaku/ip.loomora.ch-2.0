# Cursor Prompt: User Permissions API Endpoints

## Kontext
Das Frontend hat ein Berechtigungs-Widget auf der User-Detailseite (`/users/:id`), das individuelle Permissions pro User anzeigt und speichert. Die Permissions basieren auf der zugewiesenen Rolle, können aber pro User überschrieben werden ("Overrides").

## Frontend-Erwartungen

### 1. GET `/api/users/:id/permissions`

**Response-Format:**
```json
{
  "roleId": "uuid-der-rolle",
  "roleName": "Administrator",
  "permissions": [
    {
      "module": "Dashboard",
      "read": true,
      "write": true,
      "delete": false,
      "source": "role"
    },
    {
      "module": "Projekte",
      "read": true,
      "write": true,
      "delete": true,
      "source": "override"
    }
  ]
}
```

**Logik:**
1. Lade die Rolle des Users (aus `companyMembership` oder `userRole`-Tabelle)
2. Lade die Default-Permissions dieser Rolle (aus `rolePermissions`-Tabelle)
3. Lade eventuelle User-Overrides (aus `userPermissionOverrides`-Tabelle)
4. Merge: Override-Werte überschreiben Rollen-Defaults. `source` = `"role"` wenn Default, `"override"` wenn überschrieben.

**Module die unterstützt werden müssen:**
- Dashboard, Projekte, Aufgaben, Zeiterfassung, Produktion, Stücklisten
- Kunden, Rechnungen, Buchhaltung, Personal, Einstellungen

### 2. PUT `/api/users/:id/permissions`

**Request-Body:**
```json
{
  "permissions": [
    {
      "module": "Projekte",
      "read": true,
      "write": true,
      "delete": true,
      "source": "override"
    }
  ]
}
```

**Logik:**
1. Nur Einträge mit `source: "override"` werden in die `userPermissionOverrides`-Tabelle geschrieben
2. Einträge die identisch mit dem Rollen-Default sind, sollen ENTFERNT werden (kein unnötiger Override)
3. Company-Scoping beachten (User muss zur gleichen Company gehören)

## Benötigte Datenbank-Tabellen

### `role_permissions` (falls nicht vorhanden)
```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  module VARCHAR(100) NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  UNIQUE(role_id, module)
);
```

### `user_permission_overrides`
```sql
CREATE TABLE user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  module VARCHAR(100) NOT NULL,
  can_read BOOLEAN DEFAULT false,
  can_write BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, company_id, module)
);
```

## Zusammenfassung
- GET: Rolle + Overrides mergen → Array zurückgeben
- PUT: Nur Overrides speichern, unnötige Overrides cleanen
- Company-Scoping ist Pflicht
- Module-Liste ist fix (11 Module)
