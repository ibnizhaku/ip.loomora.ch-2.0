import { useState, useEffect } from "react";
import { Shield, Save, Eye, Edit2, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserPermissions, useUpdateUserPermissions, type UserPermission } from "@/hooks/use-users";

// Fallback modules when API hasn't responded yet
const ALL_MODULES = [
  "Dashboard", "Projekte", "Aufgaben", "Zeiterfassung", "Produktion",
  "Stücklisten", "Kunden", "Rechnungen", "Buchhaltung", "Personal", "Einstellungen",
];

interface Props {
  userId: string;
  userName: string;
}

export default function UserPermissionsWidget({ userId, userName }: Props) {
  const { data: permData, isLoading } = useUserPermissions(userId);
  const updatePermissions = useUpdateUserPermissions();

  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync API data into local state
  useEffect(() => {
    if (permData?.permissions) {
      setPermissions(permData.permissions);
      setHasChanges(false);
    }
  }, [permData]);

  const handleChange = (module: string, type: "read" | "write" | "delete", value: boolean) => {
    setPermissions(prev => prev.map(p => {
      if (p.module !== module) return p;

      // Cascading logic
      if (type === "read" && !value) {
        return { ...p, read: false, write: false, delete: false, source: "override" as const };
      }
      if (type === "write" && value) {
        return { ...p, read: true, write: true, source: "override" as const };
      }
      if (type === "delete" && value) {
        return { ...p, read: true, write: true, delete: true, source: "override" as const };
      }
      if (type === "write" && !value) {
        return { ...p, write: false, delete: false, source: "override" as const };
      }

      return { ...p, [type]: value, source: "override" as const };
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updatePermissions.mutate({ userId, permissions });
    setHasChanges(false);
  };

  const handleReset = () => {
    if (permData?.permissions) {
      setPermissions(permData.permissions);
      setHasChanges(false);
    }
  };

  const getSummary = (p: UserPermission) => {
    if (p.delete) return { label: "Vollzugriff", color: "bg-success/10 text-success" };
    if (p.write) return { label: "Lesen & Schreiben", color: "bg-info/10 text-info" };
    if (p.read) return { label: "Nur Lesen", color: "bg-warning/10 text-warning" };
    return { label: "Kein Zugriff", color: "bg-muted text-muted-foreground" };
  };

  // Show fallback structure while loading
  const displayPermissions = permissions.length > 0
    ? permissions
    : ALL_MODULES.map(m => ({ module: m, read: false, write: false, delete: false, source: "role" as const }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Berechtigungen</CardTitle>
              <CardDescription>
                Zugriffsrechte für {userName} verwalten
                {permData?.roleName && (
                  <span className="ml-1">
                    • Rolle: <Badge variant="outline" className="ml-1">{permData.roleName}</Badge>
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Zurücksetzen
                </Button>
                <Button size="sm" onClick={handleSave} disabled={updatePermissions.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Speichern
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modul</TableHead>
                <TableHead className="text-center">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 mx-auto">
                      <Eye className="h-4 w-4" />
                      Lesen
                    </TooltipTrigger>
                    <TooltipContent>Daten ansehen und lesen</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-center">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 mx-auto">
                      <Edit2 className="h-4 w-4" />
                      Schreiben
                    </TooltipTrigger>
                    <TooltipContent>Daten erstellen und bearbeiten</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-center">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 mx-auto">
                      <Trash2 className="h-4 w-4" />
                      Löschen
                    </TooltipTrigger>
                    <TooltipContent>Daten unwiderruflich löschen</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-right">Zusammenfassung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayPermissions.map((p) => {
                const summary = getSummary(p);
                return (
                  <TableRow key={p.module} className={p.source === "override" ? "bg-accent/30" : ""}>
                    <TableCell className="font-medium">
                      {p.module}
                      {p.source === "override" && (
                        <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">Override</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={p.read}
                        onCheckedChange={(v) => handleChange(p.module, "read", v)}
                        disabled={isLoading}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={p.write}
                        onCheckedChange={(v) => handleChange(p.module, "write", v)}
                        disabled={isLoading || !p.read}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={p.delete}
                        onCheckedChange={(v) => handleChange(p.module, "delete", v)}
                        disabled={isLoading || !p.write}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={summary.color}>{summary.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
