import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Download,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBudgets, useDeleteBudget } from "@/hooks/use-budgets";

// Map backend status to UI status
function mapStatus(status: string): "on-track" | "at-risk" | "over-budget" | "under-utilized" {
  switch (status) {
    case "ACTIVE": return "on-track";
    case "APPROVED": return "on-track";
    case "DRAFT": return "under-utilized";
    case "CLOSED": return "on-track";
    default: return "on-track";
  }
}

const statusStyles = {
  "on-track": "bg-success/10 text-success",
  "at-risk": "bg-warning/10 text-warning",
  "over-budget": "bg-destructive/10 text-destructive",
  "under-utilized": "bg-info/10 text-info",
};

const statusLabels = {
  "on-track": "Im Plan",
  "at-risk": "Gefährdet",
  "over-budget": "Überschritten",
  "under-utilized": "Unterausgelastet",
};

const statusIcons = {
  "on-track": CheckCircle,
  "at-risk": AlertTriangle,
  "over-budget": TrendingUp,
  "under-utilized": TrendingDown,
};

const backendStatusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  APPROVED: "Genehmigt",
  ACTIVE: "Aktiv",
  CLOSED: "Geschlossen",
};

export default function Budgets() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [searchQuery, setSearchQuery] = useState("");

  const { data: apiData, isLoading } = useBudgets({
    year: parseInt(year),
    search: searchQuery || undefined,
    pageSize: 50,
  });
  const deleteMutation = useDeleteBudget();

  const budgetList = (apiData?.data || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    category: b.period || "–",
    period: String(b.year),
    planned: Number(b.totalAmount) || 0,
    actual: 0, // Will come from comparison endpoint
    forecast: 0,
    status: mapStatus(b.status),
    backendStatus: b.status,
    lineCount: b._count?.lines || 0,
  }));

  const totalPlanned = budgetList.reduce((acc, b) => acc + b.planned, 0);

  const onTrackCount = budgetList.filter(b => b.backendStatus === "ACTIVE" || b.backendStatus === "APPROVED").length;
  const draftCount = budgetList.filter(b => b.backendStatus === "DRAFT").length;
  const closedCount = budgetList.filter(b => b.backendStatus === "CLOSED").length;

  const formatCHF = (amount: number) => `CHF ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;

  const handleExport = () => {
    const csvContent = [
      ["Name", "Periode", "Jahr", "Betrag", "Status"].join(";"),
      ...budgetList.map(b => [
        b.name,
        b.category,
        b.period,
        b.planned.toString().replace(".", ","),
        backendStatusLabels[b.backendStatus] || b.backendStatus,
      ].join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Budgets_${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Budget-Export wurde erstellt");
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Möchten Sie "${name}" wirklich löschen?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Budget erfolgreich gelöscht"),
        onError: () => toast.error("Fehler beim Löschen"),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Budgetverwaltung
          </h1>
          <p className="text-muted-foreground">
            Budgets planen, überwachen und prognostizieren
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => navigate("/budgets/new")}>
            <Plus className="h-4 w-4" />
            Budget anlegen
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Budget suchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktiv / Genehmigt</p>
              <p className="text-2xl font-bold">{onTrackCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Edit className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entwürfe</p>
              <p className="text-2xl font-bold">{draftCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <PiggyBank className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Geschlossen</p>
              <p className="text-2xl font-bold">{closedCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamtbudget {year}</p>
              <p className="text-2xl font-bold">CHF {(totalPlanned / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : budgetList.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-12 text-center">
          <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display font-semibold text-lg mb-2">Keine Budgets vorhanden</h3>
          <p className="text-muted-foreground mb-4">Erstellen Sie Ihr erstes Budget für {year}.</p>
          <Button onClick={() => navigate("/budgets/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Budget anlegen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {budgetList.map((budget, index) => {
            const utilization = budget.planned > 0 ? (budget.actual / budget.planned) * 100 : 0;

            return (
              <div
                key={budget.id}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/budgets/${budget.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      budget.backendStatus === "ACTIVE" ? "bg-success/10" :
                      budget.backendStatus === "APPROVED" ? "bg-info/10" :
                      budget.backendStatus === "DRAFT" ? "bg-warning/10" : "bg-muted"
                    )}>
                      {budget.backendStatus === "ACTIVE" ? <CheckCircle className="h-5 w-5 text-success" /> :
                       budget.backendStatus === "APPROVED" ? <CheckCircle className="h-5 w-5 text-info" /> :
                       budget.backendStatus === "DRAFT" ? <Edit className="h-5 w-5 text-warning" /> :
                       <PiggyBank className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">{budget.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {budget.category} • {budget.period} • {budget.lineCount} Positionen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    <Badge className={cn(
                      budget.backendStatus === "ACTIVE" ? "bg-success/10 text-success" :
                      budget.backendStatus === "APPROVED" ? "bg-info/10 text-info" :
                      budget.backendStatus === "DRAFT" ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {backendStatusLabels[budget.backendStatus] || budget.backendStatus}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/budgets/${budget.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/budgets/${budget.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(budget.id, budget.name);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Gesamtbetrag</p>
                    <p className="font-mono font-medium">CHF {budget.planned.toLocaleString("de-CH")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Positionen</p>
                    <p className="font-mono font-medium">{budget.lineCount}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
