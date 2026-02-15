import { useState, useEffect } from "react";
import { Shield, Save, Eye, Edit2, Trash2, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUserPermissions, useUpdateUserPermissions, type UserPermission } from "@/hooks/use-users";
import { cn } from "@/lib/utils";

interface ModuleGroup {
  label: string;
  modules: string[];
}

const MODULE_GROUPS: ModuleGroup[] = [
  {
    label: "Hauptmenü",
    modules: ["dashboard", "projects", "tasks", "calendar"],
  },
  {
    label: "CRM",
    modules: ["customers"],
  },
  {
    label: "Verkauf",
    modules: ["invoices"],
  },
  {
    label: "Verwaltung",
    modules: ["time-entries", "purchase-orders", "inventory", "products", "bom", "calculation", "production", "quality", "service", "contracts", "documents", "reports"],
  },
  {
    label: "Buchhaltung",
    modules: ["finance"],
  },
  {
    label: "Personal (HR)",
    modules: ["employees"],
  },
  {
    label: "Marketing",
    modules: ["marketing"],
  },
  {
    label: "E-Commerce",
    modules: ["ecommerce"],
  },
  {
    label: "Administration",
    modules: ["settings"],
  },
];

// Human-readable labels for module keys
const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projekte",
  tasks: "Aufgaben",
  calendar: "Kalender",
  customers: "Kunden & Lieferanten",
  invoices: "Angebote, Aufträge & Rechnungen",
  "time-entries": "Zeiterfassung",
  "purchase-orders": "Einkauf",
  inventory: "Lager",
  products: "Produkte",
  bom: "Stücklisten",
  calculation: "Kalkulation",
  production: "Produktion",
  quality: "QS-Prüfung",
  service: "Service",
  contracts: "Verträge",
  documents: "Dokumente",
  reports: "Berichte",
  finance: "Buchhaltung & Controlling",
  employees: "Personal & HR",
  marketing: "Marketing",
  ecommerce: "E-Commerce",
  settings: "Einstellungen & Benutzer",
};

const ALL_MODULES = MODULE_GROUPS.flatMap((g) => g.modules);

interface Props {
  userId: string;
  userName: string;
}

export default function UserPermissionsWidget({ userId, userName }: Props) {
  const { data: permData, isLoading } = useUserPermissions(userId);
  const updatePermissions = useUpdateUserPermissions();

  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Sync API data into local state
  useEffect(() => {
    if (permData?.permissions) {
      setPermissions(permData.permissions);
      setHasChanges(false);
    }
  }, [permData]);

  // Build display permissions: merge API data with all known modules
  const displayPermissions: UserPermission[] = ALL_MODULES.map((mod) => {
    const existing = permissions.find((p) => p.module === mod);
    return existing || { module: mod, read: false, write: false, delete: false, source: "role" as const };
  });

  const handleChange = (module: string, type: "read" | "write" | "delete", value: boolean) => {
    const updatePerm = (p: UserPermission): UserPermission => {
      if (p.module !== module) return p;
      if (type === "read" && !value) return { ...p, read: false, write: false, delete: false, source: "override" as const };
      if (type === "write" && value) return { ...p, read: true, write: true, source: "override" as const };
      if (type === "delete" && value) return { ...p, read: true, write: true, delete: true, source: "override" as const };
      if (type === "write" && !value) return { ...p, write: false, delete: false, source: "override" as const };
      return { ...p, [type]: value, source: "override" as const };
    };

    // If module exists in state, update it; otherwise add it
    setPermissions((prev) => {
      const exists = prev.some((p) => p.module === module);
      if (exists) return prev.map(updatePerm);
      const newPerm: UserPermission = { module, read: false, write: false, delete: false, source: "role" as const };
      return [...prev, updatePerm(newPerm)];
    });
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

  const getGroupSummary = (modules: string[]) => {
    const perms = modules.map((m) => displayPermissions.find((p) => p.module === m)!);
    const allFull = perms.every((p) => p.delete);
    const allNone = perms.every((p) => !p.read);
    const hasOverride = perms.some((p) => p.source === "override");
    if (allFull) return { label: "Vollzugriff", color: "bg-success/10 text-success" };
    if (allNone) return { label: "Kein Zugriff", color: "bg-muted text-muted-foreground" };
    return { label: "Teilweise", color: hasOverride ? "bg-accent text-accent-foreground" : "bg-warning/10 text-warning" };
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
      <CardContent className="space-y-1">
        <TooltipProvider>
          {MODULE_GROUPS.map((group) => {
            const isOpen = openGroups[group.label] ?? false;
            const groupSummary = getGroupSummary(group.modules);
            const groupPerms = group.modules.map((m) => displayPermissions.find((p) => p.module === m)!);

            return (
              <Collapsible key={group.label} open={isOpen} onOpenChange={() => toggleGroup(group.label)}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                    <span className="font-medium text-sm">{group.label}</span>
                    <span className="text-xs text-muted-foreground">({group.modules.length} Module)</span>
                  </div>
                  <Badge className={groupSummary.color}>{groupSummary.label}</Badge>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-2 border-l-2 border-border pl-2 mt-1 mb-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Modul</TableHead>
                          <TableHead className="text-center w-24">
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 mx-auto">
                                <Eye className="h-3.5 w-3.5" /> Lesen
                              </TooltipTrigger>
                              <TooltipContent>Daten ansehen und lesen</TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className="text-center w-24">
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 mx-auto">
                                <Edit2 className="h-3.5 w-3.5" /> Schreiben
                              </TooltipTrigger>
                              <TooltipContent>Daten erstellen und bearbeiten</TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className="text-center w-24">
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 mx-auto">
                                <Trash2 className="h-3.5 w-3.5" /> Löschen
                              </TooltipTrigger>
                              <TooltipContent>Daten unwiderruflich löschen</TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className="text-right w-32">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupPerms.map((p) => {
                          const summary = getSummary(p);
                          return (
                            <TableRow key={p.module} className={p.source === "override" ? "bg-accent/30" : ""}>
                              <TableCell className="font-medium text-sm">
                                {MODULE_LABELS[p.module] || p.module}
                                {p.source === "override" && (
                                  <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">Override</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch checked={p.read} onCheckedChange={(v) => handleChange(p.module, "read", v)} disabled={isLoading} />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch checked={p.write} onCheckedChange={(v) => handleChange(p.module, "write", v)} disabled={isLoading || !p.read} />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch checked={p.delete} onCheckedChange={(v) => handleChange(p.module, "delete", v)} disabled={isLoading || !p.write} />
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge className={summary.color}>{summary.label}</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
