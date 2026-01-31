import { useState } from "react";
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

interface QualityCheck {
  id: string;
  number: string;
  title: string;
  project: string;
  type: "incoming" | "production" | "final" | "audit";
  status: "pending" | "in_progress" | "passed" | "failed" | "conditional";
  inspector: string;
  date: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  photos: number;
  notes?: string;
}

const checks: QualityCheck[] = [
  {
    id: "1",
    number: "QS-2024-001",
    title: "Endabnahme Metalltreppe",
    project: "PRJ-2024-015",
    type: "final",
    status: "passed",
    inspector: "M. Keller",
    date: "28.01.2024",
    totalChecks: 24,
    passedChecks: 24,
    failedChecks: 0,
    photos: 12,
  },
  {
    id: "2",
    number: "QS-2024-002",
    title: "Schweissnaht-Prüfung",
    project: "PRJ-2024-015",
    type: "production",
    status: "conditional",
    inspector: "A. Meier",
    date: "25.01.2024",
    totalChecks: 18,
    passedChecks: 16,
    failedChecks: 2,
    photos: 8,
    notes: "2 Nähte nacharbeiten",
  },
  {
    id: "3",
    number: "QS-2024-003",
    title: "Wareneingang Stahlträger",
    project: "PRJ-2024-018",
    type: "incoming",
    status: "passed",
    inspector: "T. Brunner",
    date: "22.01.2024",
    totalChecks: 8,
    passedChecks: 8,
    failedChecks: 0,
    photos: 4,
  },
  {
    id: "4",
    number: "QS-2024-004",
    title: "ISO 9001 Audit",
    project: "-",
    type: "audit",
    status: "pending",
    inspector: "Extern",
    date: "15.02.2024",
    totalChecks: 45,
    passedChecks: 0,
    failedChecks: 0,
    photos: 0,
  },
  {
    id: "5",
    number: "QS-2024-005",
    title: "Oberflächenprüfung Geländer",
    project: "PRJ-2024-018",
    type: "production",
    status: "failed",
    inspector: "S. Huber",
    date: "20.01.2024",
    totalChecks: 12,
    passedChecks: 8,
    failedChecks: 4,
    photos: 6,
    notes: "Verzinkung ungleichmässig",
  },
];

const typeStyles = {
  incoming: "bg-info/10 text-info",
  production: "bg-primary/10 text-primary",
  final: "bg-success/10 text-success",
  audit: "bg-purple-500/10 text-purple-600",
};

const typeLabels = {
  incoming: "Wareneingang",
  production: "Produktion",
  final: "Endabnahme",
  audit: "Audit",
};

const statusStyles = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-info/10 text-info",
  passed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  conditional: "bg-warning/10 text-warning",
};

const statusLabels = {
  pending: "Ausstehend",
  in_progress: "In Prüfung",
  passed: "Bestanden",
  failed: "Nicht bestanden",
  conditional: "Bedingt",
};

export default function QualityControl() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const totalChecks = checks.length;
  const passedChecks = checks.filter((c) => c.status === "passed").length;
  const failedChecks = checks.filter((c) => c.status === "failed").length;
  const passRate = totalChecks > 0 ? (passedChecks / (passedChecks + failedChecks)) * 100 : 0;

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
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Checkliste
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Neue Prüfung
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
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
        <div className="rounded-xl border border-border bg-card p-5">
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
        <div className="rounded-xl border border-border bg-card p-5">
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
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <AlertTriangle className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Erfolgsquote</p>
              <p className="text-2xl font-bold">{passRate.toFixed(0)}%</p>
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="incoming">Wareneingang</SelectItem>
            <SelectItem value="production">Produktion</SelectItem>
            <SelectItem value="final">Endabnahme</SelectItem>
            <SelectItem value="audit">Audit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Check List */}
      <div className="space-y-4">
        {checks.map((check, index) => (
          <div
            key={check.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  check.status === "passed" ? "bg-success/10" :
                  check.status === "failed" ? "bg-destructive/10" :
                  "bg-muted"
                )}>
                  {check.status === "passed" ? (
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  ) : check.status === "failed" ? (
                    <XCircle className="h-6 w-6 text-destructive" />
                  ) : (
                    <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{check.title}</h3>
                    <Badge className={typeStyles[check.type]}>
                      {typeLabels[check.type]}
                    </Badge>
                    <Badge className={statusStyles[check.status]}>
                      {statusLabels[check.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{check.number}</span>
                    {check.project !== "-" && <> • {check.project}</>}
                    {" • "}{check.inspector} • {check.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {check.photos > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Camera className="h-3 w-3" />
                    {check.photos}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      PDF exportieren
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Prüfpunkte: {check.passedChecks} bestanden, {check.failedChecks} fehlgeschlagen
                </span>
                <span className="font-mono">
                  {check.passedChecks + check.failedChecks} / {check.totalChecks}
                </span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                <div
                  className="bg-success transition-all"
                  style={{ width: `${(check.passedChecks / check.totalChecks) * 100}%` }}
                />
                <div
                  className="bg-destructive transition-all"
                  style={{ width: `${(check.failedChecks / check.totalChecks) * 100}%` }}
                />
              </div>
            </div>

            {check.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-warning flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {check.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
