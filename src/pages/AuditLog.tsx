import { useState } from "react";
import {
  Search,
  History,
  User,
  FileText,
  Settings,
  Download,
  Filter,
  Calendar,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: "create" | "update" | "delete" | "login" | "logout" | "export" | "view";
  module: string;
  entity: string;
  entityId?: string;
  changes?: { field: string; oldValue: string; newValue: string }[];
  ipAddress: string;
}

const auditEntries: AuditEntry[] = [
  {
    id: "1",
    timestamp: "31.01.2024 16:45:23",
    user: "Max Keller",
    action: "update",
    module: "Rechnungen",
    entity: "Rechnung",
    entityId: "RE-2024-0156",
    changes: [
      { field: "Status", oldValue: "Offen", newValue: "Bezahlt" },
    ],
    ipAddress: "192.168.1.105",
  },
  {
    id: "2",
    timestamp: "31.01.2024 16:30:12",
    user: "Anna Meier",
    action: "create",
    module: "Angebote",
    entity: "Angebot",
    entityId: "AN-2024-0089",
    ipAddress: "192.168.1.112",
  },
  {
    id: "3",
    timestamp: "31.01.2024 15:22:45",
    user: "Thomas Brunner",
    action: "export",
    module: "Berichte",
    entity: "Umsatzbericht Q4/2023",
    ipAddress: "192.168.1.108",
  },
  {
    id: "4",
    timestamp: "31.01.2024 14:15:33",
    user: "Max Keller",
    action: "update",
    module: "Mitarbeiter",
    entity: "Mitarbeiter",
    entityId: "EMP-005",
    changes: [
      { field: "Lohnklasse", oldValue: "F", newValue: "E" },
      { field: "Bruttolohn", oldValue: "850", newValue: "5100" },
    ],
    ipAddress: "192.168.1.105",
  },
  {
    id: "5",
    timestamp: "31.01.2024 09:45:00",
    user: "System",
    action: "create",
    module: "Swissdec",
    entity: "Lohnmeldung Januar 2024",
    ipAddress: "127.0.0.1",
  },
  {
    id: "6",
    timestamp: "31.01.2024 08:30:15",
    user: "Max Keller",
    action: "login",
    module: "System",
    entity: "Anmeldung",
    ipAddress: "192.168.1.105",
  },
  {
    id: "7",
    timestamp: "30.01.2024 17:55:42",
    user: "Lisa Weber",
    action: "delete",
    module: "Dokumente",
    entity: "Dokument",
    entityId: "DOC-2023-456",
    ipAddress: "192.168.1.115",
  },
];

const actionStyles = {
  create: "bg-success/10 text-success",
  update: "bg-info/10 text-info",
  delete: "bg-destructive/10 text-destructive",
  login: "bg-primary/10 text-primary",
  logout: "bg-muted text-muted-foreground",
  export: "bg-warning/10 text-warning",
  view: "bg-secondary text-secondary-foreground",
};

const actionLabels = {
  create: "Erstellt",
  update: "Geändert",
  delete: "Gelöscht",
  login: "Anmeldung",
  logout: "Abmeldung",
  export: "Export",
  view: "Angesehen",
};

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

  const modules = [...new Set(auditEntries.map((e) => e.module))];

  const filteredEntries = auditEntries.filter((entry) => {
    const matchesSearch =
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.entityId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesAction = actionFilter === "all" || entry.action === actionFilter;
    const matchesModule = moduleFilter === "all" || entry.module === moduleFilter;
    return matchesSearch && matchesAction && matchesModule;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Audit-Log
          </h1>
          <p className="text-muted-foreground">
            Aktivitätsverlauf und Änderungsprotokoll
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Zeitraum
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Einträge (Heute)</p>
              <p className="text-2xl font-bold">{auditEntries.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <FileText className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Erstellt</p>
              <p className="text-2xl font-bold">
                {auditEntries.filter((e) => e.action === "create").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Settings className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Geändert</p>
              <p className="text-2xl font-bold">
                {auditEntries.filter((e) => e.action === "update").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <User className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Benutzer</p>
              <p className="text-2xl font-bold">
                {new Set(auditEntries.map((e) => e.user)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Benutzer, Entität suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Aktion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Aktionen</SelectItem>
            <SelectItem value="create">Erstellt</SelectItem>
            <SelectItem value="update">Geändert</SelectItem>
            <SelectItem value="delete">Gelöscht</SelectItem>
            <SelectItem value="login">Anmeldung</SelectItem>
            <SelectItem value="export">Export</SelectItem>
          </SelectContent>
        </Select>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Modul" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Module</SelectItem>
            {modules.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
            <span>Zeitstempel</span>
            <span>Benutzer</span>
            <span>Aktion</span>
            <span>Modul</span>
            <span>Entität</span>
            <span>Details</span>
          </div>
        </div>

        {filteredEntries.map((entry, index) => (
          <div
            key={entry.id}
            className="px-4 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div className="grid grid-cols-6 gap-4 items-start">
              <span className="font-mono text-sm">{entry.timestamp}</span>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {entry.user.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className="text-sm">{entry.user}</span>
              </div>
              <Badge className={actionStyles[entry.action]}>
                {actionLabels[entry.action]}
              </Badge>
              <span className="text-sm">{entry.module}</span>
              <div>
                <span className="text-sm">{entry.entity}</span>
                {entry.entityId && (
                  <span className="text-xs text-muted-foreground ml-1 font-mono">
                    ({entry.entityId})
                  </span>
                )}
              </div>
              <div>
                {entry.changes ? (
                  <div className="space-y-1">
                    {entry.changes.map((change, i) => (
                      <div key={i} className="text-xs">
                        <span className="text-muted-foreground">{change.field}: </span>
                        <span className="line-through text-destructive/70">{change.oldValue}</span>
                        <span className="mx-1">→</span>
                        <span className="text-success">{change.newValue}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
