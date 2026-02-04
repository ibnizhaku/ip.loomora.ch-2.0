import { useState } from "react";
import {
  Search,
  History,
  User,
  FileText,
  Settings,
  Download,
  Calendar,
  Eye,
  Loader2,
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
import { useAuditLogs, useAuditLogStats, AuditLog as AuditLogType } from "@/hooks/use-audit-log";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const actionStyles: Record<string, string> = {
  CREATE: "bg-success/10 text-success",
  UPDATE: "bg-info/10 text-info",
  DELETE: "bg-destructive/10 text-destructive",
  LOGIN: "bg-primary/10 text-primary",
  LOGOUT: "bg-muted text-muted-foreground",
  EXPORT: "bg-warning/10 text-warning",
  VIEW: "bg-secondary text-secondary-foreground",
  APPROVE: "bg-success/10 text-success",
  REJECT: "bg-destructive/10 text-destructive",
  SEND: "bg-info/10 text-info",
  LOCK: "bg-warning/10 text-warning",
  UNLOCK: "bg-primary/10 text-primary",
  PRINT: "bg-secondary text-secondary-foreground",
};

const actionLabels: Record<string, string> = {
  CREATE: "Erstellt",
  UPDATE: "Geändert",
  DELETE: "Gelöscht",
  LOGIN: "Anmeldung",
  LOGOUT: "Abmeldung",
  EXPORT: "Export",
  VIEW: "Angesehen",
  APPROVE: "Genehmigt",
  REJECT: "Abgelehnt",
  SEND: "Gesendet",
  LOCK: "Gesperrt",
  UNLOCK: "Entsperrt",
  PRINT: "Gedruckt",
};

export default function AuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: logsData, isLoading } = useAuditLogs({
    page,
    pageSize: 20,
    search: searchQuery || undefined,
    action: actionFilter !== "all" ? actionFilter : undefined,
  });

  const { data: stats } = useAuditLogStats(30);

  const logs = logsData?.data || [];

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "dd.MM.yyyy HH:mm:ss", { locale: de });
    } catch {
      return timestamp;
    }
  };

  const getUserInitials = (user?: AuditLogType["user"]) => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "?";
  };

  const getUserName = (user?: AuditLogType["user"]) => {
    if (!user) return "System";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
  };

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
              <p className="text-sm text-muted-foreground">Einträge (Gesamt)</p>
              <p className="text-2xl font-bold">{stats?.totalEntries || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <FileText className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Heute</p>
              <p className="text-2xl font-bold">{stats?.todayEntries || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Settings className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Aktion</p>
              <p className="text-2xl font-bold">
                {stats?.topActions?.[0]?.action || "-"}
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
                {stats?.topUsers?.length || 0}
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
            <SelectItem value="CREATE">Erstellt</SelectItem>
            <SelectItem value="UPDATE">Geändert</SelectItem>
            <SelectItem value="DELETE">Gelöscht</SelectItem>
            <SelectItem value="LOGIN">Anmeldung</SelectItem>
            <SelectItem value="EXPORT">Export</SelectItem>
            <SelectItem value="VIEW">Angesehen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
            <span>Zeitstempel</span>
            <span>Benutzer</span>
            <span>Aktion</span>
            <span>Entität</span>
            <span>Details</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mb-4" />
            <p>Keine Audit-Einträge gefunden</p>
          </div>
        ) : (
          logs.map((entry, index) => (
            <div
              key={entry.id}
              className="px-4 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="grid grid-cols-5 gap-4 items-start">
                <span className="font-mono text-sm">{formatTimestamp(entry.timestamp)}</span>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {getUserInitials(entry.user)}
                  </div>
                  <span className="text-sm">{getUserName(entry.user)}</span>
                </div>
                <Badge className={actionStyles[entry.action] || "bg-muted text-muted-foreground"}>
                  {actionLabels[entry.action] || entry.action}
                </Badge>
                <div>
                  <span className="text-sm">{entry.entityType}</span>
                  {entry.entityId && (
                    <span className="text-xs text-muted-foreground ml-1 font-mono">
                      ({entry.entityId})
                    </span>
                  )}
                  {entry.entityName && (
                    <p className="text-xs text-muted-foreground">{entry.entityName}</p>
                  )}
                </div>
                <div>
                  {entry.changes && Object.keys(entry.changes).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(entry.changes).slice(0, 3).map(([field, change]) => (
                        <div key={field} className="text-xs">
                          <span className="text-muted-foreground">{field}: </span>
                          <span className="line-through text-destructive/70">{String(change.old)}</span>
                          <span className="mx-1">→</span>
                          <span className="text-success">{String(change.new)}</span>
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
          ))
        )}
      </div>

      {/* Pagination */}
      {logsData && logsData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Seite {logsData.page} von {logsData.totalPages} ({logsData.total} Einträge)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= logsData.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Weiter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
