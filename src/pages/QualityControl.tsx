import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Camera,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Trash2,
  Copy,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQualityChecks, useQualityStatistics, useDeleteQualityCheck } from "@/hooks/use-quality-control";

const typeStyles: Record<string, string> = {
  INCOMING: "bg-info/10 text-info",
  IN_PROCESS: "bg-primary/10 text-primary",
  FINAL: "bg-success/10 text-success",
  incoming: "bg-info/10 text-info",
  production: "bg-primary/10 text-primary",
  final: "bg-success/10 text-success",
  audit: "bg-purple-500/10 text-purple-600",
};

const typeLabels: Record<string, string> = {
  INCOMING: "Wareneingang",
  IN_PROCESS: "Produktion",
  FINAL: "Endabnahme",
  incoming: "Wareneingang",
  production: "Produktion",
  final: "Endabnahme",
  audit: "Audit",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-info/10 text-info",
  PASSED: "bg-success/10 text-success",
  FAILED: "bg-destructive/10 text-destructive",
  CONDITIONAL: "bg-warning/10 text-warning",
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-info/10 text-info",
  passed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  conditional: "bg-warning/10 text-warning",
};

const statusLabels: Record<string, string> = {
  PENDING: "Ausstehend",
  IN_PROGRESS: "In Prüfung",
  PASSED: "Bestanden",
  FAILED: "Nicht bestanden",
  CONDITIONAL: "Bedingt",
  pending: "Ausstehend",
  in_progress: "In Prüfung",
  passed: "Bestanden",
  failed: "Nicht bestanden",
  conditional: "Bedingt",
};

export default function QualityControl() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: checksData, isLoading } = useQualityChecks({ search: searchQuery || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
  const { data: stats } = useQualityStatistics();
  const deleteMutation = useDeleteQualityCheck();

  const checkList = (checksData as any)?.data || [];

  const totalChecks = (stats as any)?.totalChecks ?? checkList.length;
  const passedChecks = (stats as any)?.passedChecks ?? 0;
  const failedChecks = (stats as any)?.failedChecks ?? 0;
  const pendingChecks = (stats as any)?.pendingChecks ?? 0;

  const filteredChecks = checkList;

  const handleDelete = (e: React.MouseEvent, checkId: string) => {
    e.stopPropagation();
    deleteMutation.mutate(checkId, {
      onSuccess: () => toast.success("Prüfung erfolgreich gelöscht"),
      onError: () => toast.error("Fehler beim Löschen der Prüfung"),
    });
  };

  const handleExportPDF = (e: React.MouseEvent, check: any) => {
    e.stopPropagation();
    window.open(`/api/quality/checks/${check.id}/pdf`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Qualitätssicherung
          </h1>
          <p className="text-muted-foreground">
            Qualitätsprüfungen und Checklisten verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/quality/checklists")}>
            <FileText className="h-4 w-4" />
            Checklisten
          </Button>
          <Button className="gap-2" onClick={() => navigate("/quality/new")}>
            <Plus className="h-4 w-4" />
            Neue Prüfung
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-primary/50",
            statusFilter === "all" ? "border-primary ring-2 ring-primary/20" : "border-border"
          )}
          onClick={() => setStatusFilter("all")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prüfungen</p>
              <p className="text-2xl font-bold">{totalChecks}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-success/50",
            statusFilter === "PASSED" ? "border-success ring-2 ring-success/20" : "border-border"
          )}
          onClick={() => setStatusFilter("PASSED")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bestanden</p>
              <p className="text-2xl font-bold text-success">{passedChecks}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-destructive/50",
            statusFilter === "FAILED" ? "border-destructive ring-2 ring-destructive/20" : "border-border"
          )}
          onClick={() => setStatusFilter("FAILED")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nicht bestanden</p>
              <p className="text-2xl font-bold text-destructive">{failedChecks}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-warning/50",
            statusFilter === "PENDING" ? "border-warning ring-2 ring-warning/20" : "border-border"
          )}
          onClick={() => setStatusFilter("PENDING")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausstehend</p>
              <p className="text-2xl font-bold text-warning">{pendingChecks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Prüfung suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="PENDING">Ausstehend</SelectItem>
            <SelectItem value="IN_PROGRESS">In Prüfung</SelectItem>
            <SelectItem value="PASSED">Bestanden</SelectItem>
            <SelectItem value="FAILED">Nicht bestanden</SelectItem>
            <SelectItem value="CONDITIONAL">Bedingt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Check List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChecks.map((check: any, index: number) => {
            const title = check.checklist?.name || check.title || check.number || "Prüfung";
            const project = check.productionOrder?.name || check.productionOrder?.number || "-";
            const inspector = check.inspector ? `${check.inspector.firstName} ${check.inspector.lastName}` : "";
            const date = check.createdAt ? new Date(check.createdAt).toLocaleDateString("de-CH") : "";
            const results = check.results || [];
            const passedCount = results.filter((r: any) => r.passed).length;
            const failedCount = results.filter((r: any) => !r.passed).length;
            const totalCount = results.length || check.totalChecks || 0;
            const checkStatus = check.status || "PENDING";
            const checkType = check.type || "FINAL";

            return (
              <div
                key={check.id}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/quality/${check.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      checkStatus === "PASSED" ? "bg-success/10" :
                      checkStatus === "FAILED" ? "bg-destructive/10" :
                      "bg-muted"
                    )}>
                      {checkStatus === "PASSED" ? (
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      ) : checkStatus === "FAILED" ? (
                        <XCircle className="h-6 w-6 text-destructive" />
                      ) : (
                        <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{title}</h3>
                        <Badge className={typeStyles[checkType] || "bg-muted"}>
                          {typeLabels[checkType] || checkType}
                        </Badge>
                        <Badge className={statusStyles[checkStatus] || "bg-muted"}>
                          {statusLabels[checkStatus] || checkStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono">{check.number}</span>
                        {project !== "-" && <> • {project}</>}
                        {inspector && <> • {inspector}</>}
                        {date && <> • {date}</>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/quality/${check.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleExportPDF(e, check)}>
                          <Download className="h-4 w-4 mr-2" />
                          PDF exportieren
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, check.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {totalCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Prüfpunkte: {passedCount} bestanden, {failedCount} fehlgeschlagen
                      </span>
                      <span className="font-mono">
                        {passedCount + failedCount} / {totalCount}
                      </span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      <div
                        className="bg-success transition-all"
                        style={{ width: `${(passedCount / Math.max(totalCount, 1)) * 100}%` }}
                      />
                      <div
                        className="bg-destructive transition-all"
                        style={{ width: `${(failedCount / Math.max(totalCount, 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {check.notes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-warning flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {check.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {filteredChecks.length === 0 && (
            <div className="py-12 text-center text-muted-foreground rounded-xl border border-border bg-card">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Keine Prüfungen gefunden</p>
              <p className="text-sm">Passen Sie die Filter an oder erstellen Sie eine neue Prüfung</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
