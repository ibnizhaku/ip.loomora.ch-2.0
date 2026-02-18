import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Shield, Save, Eye, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useRole, useUpdateRole } from "@/hooks/use-roles";

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

function arrayToPerms(permsArray: string[]): PermState {
  const perms: PermState = {};
  permissionModules.forEach((m) => {
    perms[m.key] = {
      read: permsArray.includes(`${m.key}:read`) || permsArray.includes(`${m.key}:admin`),
      write: permsArray.includes(`${m.key}:write`) || permsArray.includes(`${m.key}:admin`),
      delete: permsArray.includes(`${m.key}:delete`) || permsArray.includes(`${m.key}:admin`),
      admin: permsArray.includes(`${m.key}:admin`),
    };
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

export default function RoleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: role, isLoading } = useRole(id || "");
  const updateRole = useUpdateRole();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<PermState>({});

  useEffect(() => {
    if (role) {
      setName(role.name || "");
      setDescription(role.description || "");
      setPermissions(arrayToPerms(role.permissions || []));
    }
  }, [role]);

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
    if (!id || !name.trim()) return;
    updateRole.mutate(
      { id, data: { name, description, permissions: permsToArray(permissions) } },
      { onSuccess: () => navigate(`/roles/${id}`) }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSystem = role?.isSystem || role?.type === "system";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(id ? `/roles/${id}` : "/roles")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Rolle bearbeiten
          </h1>
          <p className="text-muted-foreground">Berechtigungen und Details anpassen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Grunddaten</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSystem} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Beschreibung</Label>
                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={isSystem} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Berechtigungen</CardTitle>
              <CardDescription>Zugriffsrechte für die verschiedenen Module{isSystem ? " (Systemrolle – nicht bearbeitbar)" : ""}</CardDescription>
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
                    <div className="flex justify-center"><Checkbox checked={permissions[mod.key]?.read || false} onCheckedChange={() => togglePerm(mod.key, "read")} disabled={isSystem} /></div>
                     <div className="flex justify-center"><Checkbox checked={permissions[mod.key]?.write || false} onCheckedChange={() => togglePerm(mod.key, "write")} disabled={isSystem} /></div>
                     <div className="flex justify-center"><Checkbox checked={permissions[mod.key]?.write || false} onCheckedChange={() => togglePerm(mod.key, "write")} disabled={isSystem} title="Bearbeiten (entspricht Schreiben)" /></div>
                     <div className="flex justify-center"><Checkbox checked={permissions[mod.key]?.delete || false} onCheckedChange={() => togglePerm(mod.key, "delete")} disabled={isSystem} /></div>
                     <div className="flex justify-center"><Checkbox checked={permissions[mod.key]?.admin || false} onCheckedChange={() => togglePerm(mod.key, "admin")} disabled={isSystem} /></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">Aktionen</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!isSystem && (
                <Button className="w-full" onClick={handleSubmit} disabled={!name.trim() || updateRole.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateRole.isPending ? "Speichern..." : "Änderungen speichern"}
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate(id ? `/roles/${id}` : "/roles")}>
                Abbrechen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
