import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Shield, Save, Eye, Plus, Pencil, Trash2 } from "lucide-react";
import { useCreateRole } from "@/hooks/use-roles";

const permissionModules = [
  { key: "customers", label: "Kunden" },
  { key: "suppliers", label: "Lieferanten" },
  { key: "products", label: "Produkte" },
  { key: "quotes", label: "Angebote" },
  { key: "orders", label: "Aufträge" },
  { key: "invoices", label: "Rechnungen" },
  { key: "payments", label: "Zahlungen" },
  { key: "employees", label: "Mitarbeiter" },
  { key: "projects", label: "Projekte" },
  { key: "finance", label: "Finanzen" },
  { key: "documents", label: "Dokumente" },
  { key: "contracts", label: "Verträge" },
  { key: "settings", label: "Einstellungen" },
  { key: "users", label: "Benutzer" },
];

type PermState = Record<string, { read: boolean; write: boolean; delete: boolean; admin: boolean }>;

function buildInitialPerms(): PermState {
  const perms: PermState = {};
  permissionModules.forEach((m) => {
    perms[m.key] = { read: false, write: false, delete: false, admin: false };
  });
  return perms;
}

function permsToArray(perms: PermState): string[] {
  const result: string[] = [];
  Object.entries(perms).forEach(([mod, p]) => {
    if (p.admin) {
      result.push(`${mod}:read`, `${mod}:write`, `${mod}:delete`, `${mod}:admin`);
    } else {
      if (p.read) result.push(`${mod}:read`);
      if (p.write) result.push(`${mod}:write`);
      if (p.delete) result.push(`${mod}:delete`);
    }
  });
  return result;
}

export default function RoleCreate() {
  const navigate = useNavigate();
  const createRole = useCreateRole();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<PermState>(buildInitialPerms);

  const togglePerm = (mod: string, type: "read" | "write" | "delete" | "admin") => {
    setPermissions((prev) => {
      const updated = { ...prev, [mod]: { ...prev[mod] } };
      if (type === "admin") {
        const newVal = !updated[mod].admin;
        updated[mod] = { read: newVal, write: newVal, delete: newVal, admin: newVal };
      } else {
        updated[mod][type] = !updated[mod][type];
        if (type === "write" && updated[mod].write) updated[mod].read = true;
        if (type === "delete" && updated[mod].delete) { updated[mod].read = true; updated[mod].write = true; }
        if (updated[mod].read && updated[mod].write && updated[mod].delete) updated[mod].admin = true;
        else updated[mod].admin = false;
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    createRole.mutate(
      { name, description, permissions: permsToArray(permissions) },
      { onSuccess: () => navigate("/roles") }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/roles")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Neue Rolle erstellen
          </h1>
          <p className="text-muted-foreground">Definieren Sie Name, Beschreibung und Berechtigungen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Grunddaten */}
          <Card>
            <CardHeader>
              <CardTitle>Grunddaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Projektleiter" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Beschreibung</Label>
                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beschreiben Sie die Rolle..." rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Berechtigungsmatrix */}
          <Card>
            <CardHeader>
              <CardTitle>Berechtigungen</CardTitle>
              <CardDescription>Zugriffsrechte für die verschiedenen Module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="grid grid-cols-6 gap-4 py-3 px-4 bg-muted/50 rounded-lg font-medium text-sm">
                  <div>Modul</div>
                  <div className="text-center"><Eye className="h-4 w-4 mx-auto" /><span className="text-xs">Lesen</span></div>
                  <div className="text-center"><Plus className="h-4 w-4 mx-auto" /><span className="text-xs">Erstellen</span></div>
                  <div className="text-center"><Pencil className="h-4 w-4 mx-auto" /><span className="text-xs">Bearbeiten</span></div>
                  <div className="text-center"><Trash2 className="h-4 w-4 mx-auto" /><span className="text-xs">Löschen</span></div>
                  <div className="text-center"><Shield className="h-4 w-4 mx-auto" /><span className="text-xs">Admin</span></div>
                </div>
                {permissionModules.map((mod) => (
                  <div key={mod.key} className="grid grid-cols-6 gap-4 py-3 px-4 border-b last:border-0">
                    <div className="font-medium">{mod.label}</div>
                    <div className="flex justify-center"><Checkbox checked={permissions[mod.key].read} onCheckedChange={() => togglePerm(mod.key, "read")} /></div>
                    <div className="flex justify-center"><Checkbox checked={permissions[mod.key].write} onCheckedChange={() => togglePerm(mod.key, "write")} /></div>
                    <div className="flex justify-center"><Checkbox checked={permissions[mod.key].write} onCheckedChange={() => togglePerm(mod.key, "write")} /></div>
                    <div className="flex justify-center"><Checkbox checked={permissions[mod.key].delete} onCheckedChange={() => togglePerm(mod.key, "delete")} /></div>
                    <div className="flex justify-center"><Checkbox checked={permissions[mod.key].admin} onCheckedChange={() => togglePerm(mod.key, "admin")} /></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleSubmit} disabled={!name.trim() || createRole.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createRole.isPending ? "Speichern..." : "Rolle erstellen"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/roles")}>
                Abbrechen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
