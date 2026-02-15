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

interface ModuleEntry {
  key: string;
  label: string;
}

interface ModuleGroup {
  label: string;
  modules: ModuleEntry[];
}

const MODULE_GROUPS: ModuleGroup[] = [
  {
    label: "Hauptmenü",
    modules: [
      { key: "dashboard", label: "Dashboard" },
      { key: "projects", label: "Projekte" },
      { key: "tasks", label: "Aufgaben" },
      { key: "calendar", label: "Kalender" },
    ],
  },
  {
    label: "CRM",
    modules: [
      { key: "customers", label: "Kunden" },
      { key: "suppliers", label: "Lieferanten" },
    ],
  },
  {
    label: "Verkauf",
    modules: [
      { key: "quotes", label: "Angebote" },
      { key: "orders", label: "Aufträge" },
      { key: "delivery-notes", label: "Lieferscheine" },
      { key: "invoices", label: "Rechnungen" },
      { key: "credit-notes", label: "Gutschriften" },
      { key: "reminders", label: "Mahnwesen" },
    ],
  },
  {
    label: "Verwaltung",
    modules: [
      { key: "time-entries", label: "Zeiterfassung" },
      { key: "purchase-orders", label: "Einkauf" },
      { key: "purchase-invoices", label: "Einkaufsrechnungen" },
      { key: "inventory", label: "Lager" },
      { key: "products", label: "Produkte" },
      { key: "bom", label: "Stücklisten" },
      { key: "calculation", label: "Kalkulation" },
      { key: "production", label: "Produktion" },
      { key: "quality", label: "QS-Prüfung" },
      { key: "service", label: "Service" },
      { key: "contracts", label: "Verträge" },
      { key: "documents", label: "Dokumente" },
      { key: "reports", label: "Berichte" },
    ],
  },
  {
    label: "Buchhaltung",
    modules: [
      { key: "finance", label: "Controlling" },
      { key: "cash-book", label: "Kassenbuch" },
      { key: "cost-centers", label: "Kostenstellen" },
      { key: "budgets", label: "Budgets" },
      { key: "debtors", label: "Debitoren" },
      { key: "creditors", label: "Kreditoren" },
      { key: "bank-accounts", label: "Zahlungsverkehr" },
      { key: "chart-of-accounts", label: "Kontenplan" },
      { key: "journal-entries", label: "Buchungsjournal" },
      { key: "general-ledger", label: "Hauptbuch" },
      { key: "balance-sheet", label: "Bilanz & GuV" },
      { key: "vat-returns", label: "MWST-Abrechnung" },
      { key: "fixed-assets", label: "Anlagenbuchhaltung" },
    ],
  },
  {
    label: "Personal (HR)",
    modules: [
      { key: "employees", label: "Mitarbeiter" },
      { key: "employee-contracts", label: "Arbeitsverträge" },
      { key: "payroll", label: "Lohnabrechnung" },
      { key: "absences", label: "Abwesenheiten" },
      { key: "travel-expenses", label: "Reisekosten" },
      { key: "recruiting", label: "Recruiting" },
      { key: "training", label: "Schulungen" },
      { key: "departments", label: "Abteilungen" },
      { key: "orgchart", label: "Organigramm" },
    ],
  },
  {
    label: "Marketing",
    modules: [
      { key: "campaigns", label: "Kampagnen" },
      { key: "leads", label: "Leads" },
      { key: "email-marketing", label: "E-Mail Marketing" },
    ],
  },
  {
    label: "E-Commerce",
    modules: [
      { key: "shop", label: "Online-Shop" },
      { key: "discounts", label: "Rabatte" },
      { key: "reviews", label: "Bewertungen" },
    ],
  },
  {
    label: "Administration",
    modules: [
      { key: "users", label: "Benutzer" },
      { key: "roles", label: "Rollen" },
      { key: "company", label: "Unternehmen" },
      { key: "settings", label: "Einstellungen" },
    ],
  },
];

const ALL_MODULE_KEYS = MODULE_GROUPS.flatMap((g) => g.modules.map((m) => m.key));

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

  useEffect(() => {
    if (permData?.permissions) {
      setPermissions(permData.permissions);
      setHasChanges(false);
    }
  }, [permData]);

  const getPermForModule = (key: string): UserPermission => {
    return permissions.find((p) => p.module === key) || { module: key, read: false, write: false, delete: false, source: "role" as const };
  };

  const handleChange = (module: string, type: "read" | "write" | "delete", value: boolean) => {
    const updatePerm = (p: UserPermission): UserPermission => {
      if (p.module !== module) return p;
      if (type === "read" && !value) return { ...p, read: false, write: false, delete: false, source: "override" as const };
      if (type === "write" && value) return { ...p, read: true, write: true, source: "override" as const };
      if (type === "delete" && value) return { ...p, read: true, write: true, delete: true, source: "override" as const };
      if (type === "write" && !value) return { ...p, write: false, delete: false, source: "override" as const };
      return { ...p, [type]: value, source: "override" as const };
    };

    setPermissions((prev) => {
      const exists = prev.some((p) => p.module === module);
      if (exists) return prev.map(updatePerm);
      const newPerm: UserPermission = { module, read: false, write: false, delete: false, source: "role" as const };
      return [...prev, updatePerm(newPerm)];
    });
    setHasChanges(true);
  };

  const handleGroupToggleAll = (modules: ModuleEntry[], enable: boolean) => {
    setPermissions((prev) => {
      let updated = [...prev];
      for (const mod of modules) {
        const idx = updated.findIndex((p) => p.module === mod.key);
        const newPerm: UserPermission = enable
          ? { module: mod.key, read: true, write: true, delete: true, source: "override" as const }
          : { module: mod.key, read: false, write: false, delete: false, source: "override" as const };
        if (idx >= 0) {
          updated[idx] = newPerm;
        } else {
          updated.push(newPerm);
        }
      }
      return updated;
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

  const getGroupSummary = (modules: ModuleEntry[]) => {
    const perms = modules.map((m) => getPermForModule(m.key));
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
                <span className="ml-2 text-xs">({ALL_MODULE_KEYS.length} Module)</span>
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
            const allFull = group.modules.every((m) => getPermForModule(m.key).delete);

            return (
              <Collapsible key={group.label} open={isOpen} onOpenChange={() => toggleGroup(group.label)}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                    <span className="font-medium text-sm">{group.label}</span>
                    <span className="text-xs text-muted-foreground">({group.modules.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={groupSummary.color}>{groupSummary.label}</Badge>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-2 border-l-2 border-border pl-2 mt-1 mb-2">
                    {/* Group quick actions */}
                    <div className="flex items-center gap-2 px-4 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); handleGroupToggleAll(group.modules, true); }}
                      >
                        Alle aktivieren
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); handleGroupToggleAll(group.modules, false); }}
                      >
                        Alle deaktivieren
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Modul</TableHead>
                          <TableHead className="text-center w-20">
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 mx-auto">
                                <Eye className="h-3.5 w-3.5" /> Lesen
                              </TooltipTrigger>
                              <TooltipContent>Daten ansehen</TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className="text-center w-20">
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 mx-auto">
                                <Edit2 className="h-3.5 w-3.5" /> Schreiben
                              </TooltipTrigger>
                              <TooltipContent>Daten bearbeiten</TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className="text-center w-20">
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 mx-auto">
                                <Trash2 className="h-3.5 w-3.5" /> Löschen
                              </TooltipTrigger>
                              <TooltipContent>Daten löschen</TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className="text-right w-28">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.modules.map((mod) => {
                          const p = getPermForModule(mod.key);
                          const summary = getSummary(p);
                          return (
                            <TableRow key={mod.key} className={p.source === "override" ? "bg-accent/30" : ""}>
                              <TableCell className="font-medium text-sm">
                                {mod.label}
                                {p.source === "override" && (
                                  <Badge variant="outline" className="ml-2 text-[10px] px-1 py-0">Override</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch checked={p.read} onCheckedChange={(v) => handleChange(mod.key, "read", v)} disabled={isLoading} />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch checked={p.write} onCheckedChange={(v) => handleChange(mod.key, "write", v)} disabled={isLoading || !p.read} />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch checked={p.delete} onCheckedChange={(v) => handleChange(mod.key, "delete", v)} disabled={isLoading || !p.write} />
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
