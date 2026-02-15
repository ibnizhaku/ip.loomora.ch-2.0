import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  Shield,
  Users,
  Lock,
  Eye,
  Pencil,
  Plus,
  Settings,
} from "lucide-react";

const roleData = {
  id: "ROLE-003",
  name: "Projektleiter",
  description: "Kann Projekte verwalten, Aufträge erstellen und Team-Mitglieder koordinieren. Eingeschränkter Zugriff auf Finanzdaten.",
  type: "custom" as "system" | "custom", // system, custom
  status: "active" as const,
  createdAt: "2023-06-15",
  createdBy: "Admin",
  modifiedAt: "2024-01-10",
  userCount: 5,
  users: [
    { id: "USR-001", name: "Thomas Meier", email: "t.meier@firma.ch", department: "Produktion" },
    { id: "USR-002", name: "Sandra Keller", email: "s.keller@firma.ch", department: "Vertrieb" },
    { id: "USR-003", name: "Marco Weber", email: "m.weber@firma.ch", department: "Technik" },
  ],
  permissions: {
    projects: { view: true, create: true, edit: true, delete: false },
    customers: { view: true, create: true, edit: true, delete: false },
    orders: { view: true, create: true, edit: true, delete: false },
    invoices: { view: true, create: false, edit: false, delete: false },
    finance: { view: false, create: false, edit: false, delete: false },
    hr: { view: false, create: false, edit: false, delete: false },
    inventory: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
  },
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return { label: "Aktiv", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "inactive":
      return { label: "Inaktiv", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-800" };
  }
};

const permissionLabels: Record<string, string> = {
  projects: "Projekte",
  customers: "Kunden",
  orders: "Aufträge",
  invoices: "Rechnungen",
  finance: "Finanzen",
  hr: "Personal",
  inventory: "Lager",
  reports: "Berichte",
  settings: "Einstellungen",
  users: "Benutzer",
};

export default function RoleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const statusConfig = getStatusConfig(roleData.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/roles")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">{roleData.name}</h1>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
              {roleData.type === "system" && (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  System
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {roleData.userCount} Benutzer mit dieser Rolle
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/roles/${id}/edit`)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplizieren
          </Button>
          {roleData.type !== "system" && (
            <>
              <Button variant="outline" onClick={() => navigate(`/roles/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
              <Button variant="outline" className="text-red-600" onClick={() => { navigate("/roles"); }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Beschreibung */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">{roleData.description}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Berechtigungen */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Berechtigungen
              </CardTitle>
              <CardDescription>
                Zugriffsrechte für die verschiedenen Module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Header */}
                <div className="grid grid-cols-5 gap-4 py-3 px-4 bg-muted/50 rounded-lg font-medium text-sm">
                  <div>Modul</div>
                  <div className="text-center">
                    <Eye className="h-4 w-4 mx-auto" />
                    <span className="text-xs">Lesen</span>
                  </div>
                  <div className="text-center">
                    <Plus className="h-4 w-4 mx-auto" />
                    <span className="text-xs">Erstellen</span>
                  </div>
                  <div className="text-center">
                    <Pencil className="h-4 w-4 mx-auto" />
                    <span className="text-xs">Bearbeiten</span>
                  </div>
                  <div className="text-center">
                    <Trash2 className="h-4 w-4 mx-auto" />
                    <span className="text-xs">Löschen</span>
                  </div>
                </div>

                {/* Permission rows */}
                {Object.entries(roleData.permissions).map(([module, perms]) => (
                  <div key={module} className="grid grid-cols-5 gap-4 py-3 px-4 border-b last:border-0">
                    <div className="font-medium">{permissionLabels[module]}</div>
                    <div className="flex justify-center">
                      <Checkbox checked={perms.view} disabled />
                    </div>
                    <div className="flex justify-center">
                      <Checkbox checked={perms.create} disabled />
                    </div>
                    <div className="flex justify-center">
                      <Checkbox checked={perms.edit} disabled />
                    </div>
                    <div className="flex justify-center">
                      <Checkbox checked={perms.delete} disabled />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Benutzer mit dieser Rolle */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Benutzer
                </CardTitle>
                <Badge variant="secondary">{roleData.userCount}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {roleData.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.department}</p>
                  </div>
                </div>
              ))}
              <Separator />
              <Button variant="outline" className="w-full" onClick={() => navigate("/users")}>
                <Users className="h-4 w-4 mr-2" />
                Alle Benutzer
              </Button>
            </CardContent>
          </Card>

          {/* Informationen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Informationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Typ</p>
                <p className="font-medium capitalize">{roleData.type === "system" ? "Systemrolle" : "Benutzerdefiniert"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Erstellt von</p>
                <p className="font-medium">{roleData.createdBy}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Erstellt am</p>
                <p className="font-medium">{new Date(roleData.createdAt).toLocaleDateString("de-CH")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Letzte Änderung</p>
                <p className="font-medium">{new Date(roleData.modifiedAt).toLocaleDateString("de-CH")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ähnliche Rollen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ähnliche Rollen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Mitarbeiter
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Teamleiter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
