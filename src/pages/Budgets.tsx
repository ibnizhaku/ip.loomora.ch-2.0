import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
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

interface Budget {
  id: string;
  name: string;
  category: string;
  period: string;
  planned: number;
  actual: number;
  forecast: number;
  status: "on-track" | "at-risk" | "over-budget" | "under-utilized";
}

const budgets: Budget[] = [
  {
    id: "1",
    name: "Personalkosten",
    category: "Operating",
    period: "2024",
    planned: 1200000,
    actual: 480000,
    forecast: 1180000,
    status: "on-track",
  },
  {
    id: "2",
    name: "Marketing & Werbung",
    category: "Operating",
    period: "2024",
    planned: 150000,
    actual: 85000,
    forecast: 175000,
    status: "at-risk",
  },
  {
    id: "3",
    name: "IT Infrastruktur",
    category: "CAPEX",
    period: "2024",
    planned: 80000,
    actual: 95000,
    forecast: 120000,
    status: "over-budget",
  },
  {
    id: "4",
    name: "Reisekosten",
    category: "Operating",
    period: "2024",
    planned: 45000,
    actual: 12000,
    forecast: 35000,
    status: "under-utilized",
  },
  {
    id: "5",
    name: "Weiterbildung",
    category: "Operating",
    period: "2024",
    planned: 30000,
    actual: 8500,
    forecast: 28000,
    status: "on-track",
  },
  {
    id: "6",
    name: "Büroausstattung",
    category: "CAPEX",
    period: "2024",
    planned: 25000,
    actual: 22000,
    forecast: 25000,
    status: "on-track",
  },
];

const monthlyData = [
  { month: "Jan", planned: 125000, actual: 118000 },
  { month: "Feb", planned: 125000, actual: 132000 },
  { month: "Mär", planned: 125000, actual: 121000 },
  { month: "Apr", planned: 125000, actual: 128000 },
  { month: "Mai", planned: 125000, actual: 0 },
  { month: "Jun", planned: 125000, actual: 0 },
];

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

export default function Budgets() {
  const navigate = useNavigate();
  const [year, setYear] = useState("2024");
  const [budgetList] = useState(budgets);

  const totalPlanned = budgetList.reduce((acc, b) => acc + b.planned, 0);
  const totalActual = budgetList.reduce((acc, b) => acc + b.actual, 0);
  const totalForecast = budgetList.reduce((acc, b) => acc + b.forecast, 0);
  const utilizationPercent = (totalActual / totalPlanned) * 100;

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
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Export wird erstellt...")}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => navigate("/budgets/new")}>
            <Plus className="h-4 w-4" />
            Budget anlegen
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Geplant {year}</p>
              <p className="text-2xl font-bold">CHF {(totalPlanned / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <PiggyBank className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ist (YTD)</p>
              <p className="text-2xl font-bold">CHF {(totalActual / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              totalForecast <= totalPlanned ? "bg-success/10" : "bg-warning/10"
            )}>
              <TrendingUp className={cn(
                "h-6 w-6",
                totalForecast <= totalPlanned ? "text-success" : "text-warning"
              )} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prognose</p>
              <p className="text-2xl font-bold">CHF {(totalForecast / 1000).toFixed(0)}k</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auslastung</p>
              <p className="text-2xl font-bold">{utilizationPercent.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold text-lg mb-6">
          Budgetentwicklung {year}
        </h3>
        <div className="h-48 flex items-end justify-between gap-4">
          {monthlyData.map((data) => (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 items-end justify-center h-36">
                <div
                  className="w-4 bg-muted rounded-t transition-all"
                  style={{ height: `${(data.planned / 150000) * 100}%` }}
                  title={`Geplant: CHF ${data.planned.toLocaleString("de-CH")}`}
                />
                {data.actual > 0 && (
                  <div
                    className={cn(
                      "w-4 rounded-t transition-all",
                      data.actual <= data.planned ? "bg-success" : "bg-destructive"
                    )}
                    style={{ height: `${(data.actual / 150000) * 100}%` }}
                    title={`Ist: CHF ${data.actual.toLocaleString("de-CH")}`}
                  />
                )}
              </div>
              <span className="text-xs text-muted-foreground">{data.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-muted" />
            <span className="text-sm text-muted-foreground">Geplant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-success" />
            <span className="text-sm text-muted-foreground">Ist (im Plan)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-destructive" />
            <span className="text-sm text-muted-foreground">Ist (überschritten)</span>
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="space-y-3">
        {budgetList.map((budget, index) => {
          const StatusIcon = statusIcons[budget.status];
          const utilization = (budget.actual / budget.planned) * 100;
          const forecastVariance = budget.forecast - budget.planned;

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
                    statusStyles[budget.status]
                  )}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{budget.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {budget.category} • {budget.period}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                  <Badge className={statusStyles[budget.status]}>
                    {statusLabels[budget.status]}
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Auslastung</span>
                  <span className="font-medium">{utilization.toFixed(1)}%</span>
                </div>
                <Progress
                  value={Math.min(utilization, 100)}
                  className={cn(
                    "h-2",
                    utilization > 100 && "[&>div]:bg-destructive"
                  )}
                />
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Geplant</p>
                  <p className="font-mono font-medium">CHF {budget.planned.toLocaleString("de-CH")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ist</p>
                  <p className="font-mono font-medium">CHF {budget.actual.toLocaleString("de-CH")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prognose</p>
                  <p className="font-mono font-medium">CHF {budget.forecast.toLocaleString("de-CH")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Abweichung (Prog.)</p>
                  <p className={cn(
                    "font-mono font-medium",
                    forecastVariance <= 0 ? "text-success" : "text-destructive"
                  )}>
                    {forecastVariance <= 0 ? "" : "+"}CHF {forecastVariance.toLocaleString("de-CH")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
