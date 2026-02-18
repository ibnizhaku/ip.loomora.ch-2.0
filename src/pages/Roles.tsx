import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoles, useDeleteRole } from "@/hooks/use-roles";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Plus,
  Shield,
  Users,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Lock,
  Key,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const modules = [
  { name: "Dashboard", key: "dashboard" },
  { name: "Projekte", key: "projects" },
  { name: "Aufgaben", key: "tasks" },
  { name: "CRM", key: "customers" },
  { name: "Verkauf", key: "sales" },
  { name: "Rechnungen", key: "invoices" },
  { name: "Finanzen", key: "finance" },
  { name: "Buchhaltung", key: "accounting" },
  { name: "HR", key: "hr" },
  { name: "Lohnbuchhaltung", key: "payroll" },
  { name: "Produktion", key: "production" },
  { name: "Lager", key: "inventory" },
  { name: "Qualität", key: "quality" },
  { name: "Berichte", key: "reports" },
  { name: "Einstellungen", key: "settings" },
];

export default function Roles() {
  const navigate = useNavigate();
  const { canWrite, canDelete } = usePermissions();
  const { data: apiData, isLoading } = useRoles();
  const deleteRole = useDeleteRole();
  const roles = apiData?.data || [];
  const [activeTab, setActiveTab] = useState("roles");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalUsers = roles.reduce((sum: number, r: any) => sum + (r.userCount || 0), 0);

  const handleDelete = () => {
    if (deleteId) {
      deleteRole.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Rollen & Berechtigungen
          </h1>
          <p className="text-muted-foreground">
            Zugriffsrechte und Benutzerrollen verwalten
          </p>
        </div>
        {canWrite('roles') && (
          <Button className="gap-2" onClick={() => navigate("/roles/new")}>
            <Plus className="h-4 w-4" />
            Neue Rolle
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rollen</p>
              <p className="text-2xl font-bold">{roles.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Users className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Benutzer</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Key className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Module</p>
              <p className="text-2xl font-bold">{modules.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Lock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">System-Rollen</p>
              <p className="text-2xl font-bold">
                {roles.filter((r: any) => r.isSystem || r.type === "system").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="roles">Rollen</TabsTrigger>
            <TabsTrigger value="matrix">Berechtigungsmatrix</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Role List */}
              <div className="space-y-3">
                {roles.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Noch keine Rollen vorhanden</p>
                  </div>
                )}
                {roles.map((role: any, index: number) => (
                  <div
                    key={role.id}
                    className={cn(
                      "rounded-xl border bg-card p-5 cursor-pointer transition-all animate-fade-in",
                      selectedRole === role.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          role.color || "bg-primary/10"
                        )}>
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{role.name}</h3>
                            {(role.isSystem || role.type === "system") && (
                              <Badge variant="outline" className="text-xs">System</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {role.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {role.userCount || 0} Benutzer
                          </p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/roles/${role.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </DropdownMenuItem>
                          {!(role.isSystem || role.type === "system") && (
                            <>
                              {canWrite('roles') && (
                                <DropdownMenuItem onClick={() => navigate(`/roles/${role.id}/edit`)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Bearbeiten
                                </DropdownMenuItem>
                              )}
                              {canDelete('roles') && (
                                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(role.id); }}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Löschen
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {/* Permission Details */}
              {selectedRole && (
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold mb-4">
                    Berechtigungen: {roles.find((r: any) => r.id === selectedRole)?.name}
                  </h3>
                  <div className="space-y-3">
                    {modules.map((module) => {
                      const role = roles.find((r: any) => r.id === selectedRole);
                      const perms = role?.permissions || [];
                      const hasFullAccess = perms.includes("*") ||
                        perms.includes(`${module.key}.*`) ||
                        perms.includes(`${module.key}:admin`);
                      const hasViewAccess = perms.includes(`${module.key}:read`) || hasFullAccess;
                      const hasWriteAccess = perms.includes(`${module.key}:write`) || hasFullAccess;
                      const hasDeleteAccess = perms.includes(`${module.key}:delete`) || hasFullAccess;

                      return (
                        <div
                          key={module.key}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <span>{module.name}</span>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Lesen</span>
                              {hasViewAccess ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground/30" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Schreiben</span>
                              {hasWriteAccess ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground/30" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Löschen</span>
                              {hasDeleteAccess ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground/30" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="matrix" className="mt-6">
            <div className="rounded-xl border border-border overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Modul</th>
                    {roles.map((role: any) => (
                      <th key={role.id} className="px-4 py-3 text-center text-sm font-medium">
                        {role.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map((module, i) => (
                    <tr key={module.key} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                      <td className="px-4 py-3 text-sm">{module.name}</td>
                      {roles.map((role: any) => {
                        const perms = role.permissions || [];
                        const hasAccess = perms.includes("*") ||
                          perms.includes(`${module.key}.*`) ||
                          perms.includes(`${module.key}:admin`) ||
                          perms.some((p: string) => p.startsWith(`${module.key}:`));
                        return (
                          <td key={role.id} className="px-4 py-3 text-center">
                            {hasAccess ? (
                              <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rolle löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Benutzer mit dieser Rolle verlieren ihre Berechtigungen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
