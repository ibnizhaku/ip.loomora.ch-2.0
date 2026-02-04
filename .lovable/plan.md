
# Plan: Dashboard Quick Actions funktional machen

## Übersicht
Die vier Schnellaktions-Buttons auf dem Dashboard sollen zu den entsprechenden Erstellungsseiten navigieren.

## Ziel-Routen

| Button | Zielseite |
|--------|-----------|
| Neues Projekt | `/projects/new` |
| Neue Rechnung | `/invoices/new` |
| Neuer Kunde | `/customers/new` |
| Zeit erfassen | `/time-tracking` |

## Änderungen

### Datei: `src/components/dashboard/QuickActions.tsx`

1. **Import hinzufügen**
   - `useNavigate` von `react-router-dom` importieren

2. **Interface erweitern**
   - `path: string` zum `QuickAction`-Interface hinzufügen

3. **Actions-Array aktualisieren**
   - Jeder Action die entsprechende Route zuweisen:
     - Neues Projekt → `/projects/new`
     - Neue Rechnung → `/invoices/new`  
     - Neuer Kunde → `/customers/new`
     - Zeit erfassen → `/time-tracking`

4. **Button mit onClick versehen**
   - `onClick={() => navigate(action.path)}` zu jedem Button hinzufügen

## Technische Details

```typescript
// Neuer Import
import { useNavigate } from "react-router-dom";

// Erweitertes Interface
interface QuickAction {
  title: string;
  description: string;
  icon: typeof Plus;
  color: string;
  bgColor: string;
  path: string;  // NEU
}

// Actions mit Pfaden
const actions: QuickAction[] = [
  {
    title: "Neues Projekt",
    // ...
    path: "/projects/new",
  },
  // ...
];

// In der Komponente
const navigate = useNavigate();

// Button mit onClick
<button onClick={() => navigate(action.path)} ...>
```

## Ergebnis
Nach der Implementierung navigiert jeder Quick-Action-Button direkt zur entsprechenden Erstellungsseite oder Funktion.
