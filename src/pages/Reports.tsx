import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  TrendingUp,
  Users,
  FolderKanban,
  Euro,
  Download,
  Calendar,
  FileText,
  PieChart,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ReportExportDialog } from "@/components/reports/ReportExportDialog";
import { ReportDetailDialog } from "@/components/reports/ReportDetailDialog";

// Year-based KPI data
const getKpiData = (year: string) => {
  const data: Record<string, typeof kpiData2024> = {
    "2024": [
      { title: "Umsatz YTD", value: "CHF 584'250", change: "+18.5%", trend: "up", icon: Euro },
      { title: "Projekte abgeschlossen", value: "47", change: "+12", trend: "up", icon: FolderKanban },
      { title: "Neue Kunden", value: "23", change: "+8", trend: "up", icon: Users },
      { title: "Auslastung", value: "87%", change: "+5%", trend: "up", icon: Activity },
    ],
    "2023": [
      { title: "Umsatz YTD", value: "CHF 512'800", change: "+15.2%", trend: "up", icon: Euro },
      { title: "Projekte abgeschlossen", value: "38", change: "+9", trend: "up", icon: FolderKanban },
      { title: "Neue Kunden", value: "18", change: "+5", trend: "up", icon: Users },
      { title: "Auslastung", value: "82%", change: "+3%", trend: "up", icon: Activity },
    ],
    "2022": [
      { title: "Umsatz YTD", value: "CHF 445'320", change: "+12.8%", trend: "up", icon: Euro },
      { title: "Projekte abgeschlossen", value: "32", change: "+7", trend: "up", icon: FolderKanban },
      { title: "Neue Kunden", value: "14", change: "+3", trend: "up", icon: Users },
      { title: "Auslastung", value: "78%", change: "+2%", trend: "up", icon: Activity },
    ],
  };
  return data[year] || data["2024"];
};

const kpiData2024 = [
  { title: "Umsatz YTD", value: "CHF 584'250", change: "+18.5%", trend: "up", icon: Euro },
  { title: "Projekte abgeschlossen", value: "47", change: "+12", trend: "up", icon: FolderKanban },
  { title: "Neue Kunden", value: "23", change: "+8", trend: "up", icon: Users },
  { title: "Auslastung", value: "87%", change: "+5%", trend: "up", icon: Activity },
];

const reportTypes = [
  { id: "1", title: "Umsatzbericht", description: "Monatliche Einnahmen und Ausgaben", icon: Euro, lastGenerated: "vor 2 Tagen", type: "financial" },
  { id: "2", title: "Projektübersicht", description: "Status aller aktiven Projekte", icon: FolderKanban, lastGenerated: "vor 1 Tag", type: "project" },
  { id: "3", title: "Zeiterfassungsbericht", description: "Arbeitszeiten nach Mitarbeiter", icon: Calendar, lastGenerated: "vor 3 Tagen", type: "time" },
  { id: "4", title: "Kundenbericht", description: "Kundenaktivität und Umsatz", icon: Users, lastGenerated: "vor 1 Woche", type: "customer" },
  { id: "5", title: "Leistungsanalyse", description: "Team-Performance und KPIs", icon: TrendingUp, lastGenerated: "vor 5 Tagen", type: "performance" },
  { id: "6", title: "Lagerbericht", description: "Bestandsübersicht und Bewegungen", icon: BarChart3, lastGenerated: "vor 4 Tagen", type: "inventory" },
];

// Year-based revenue data
const getRevenueByProject = (year: string) => {
  const data: Record<string, typeof revenue2024> = {
    "2024": [
      { name: "Stahlbau", value: 245000, percentage: 42 },
      { name: "Treppen", value: 128000, percentage: 22 },
      { name: "Geländer", value: 98000, percentage: 17 },
      { name: "Brandschutz", value: 68000, percentage: 12 },
      { name: "Service", value: 45250, percentage: 7 },
    ],
    "2023": [
      { name: "Stahlbau", value: 215000, percentage: 42 },
      { name: "Treppen", value: 112000, percentage: 22 },
      { name: "Geländer", value: 87000, percentage: 17 },
      { name: "Brandschutz", value: 58000, percentage: 11 },
      { name: "Service", value: 40800, percentage: 8 },
    ],
    "2022": [
      { name: "Stahlbau", value: 187000, percentage: 42 },
      { name: "Treppen", value: 98000, percentage: 22 },
      { name: "Geländer", value: 76000, percentage: 17 },
      { name: "Brandschutz", value: 49000, percentage: 11 },
      { name: "Service", value: 35320, percentage: 8 },
    ],
  };
  return data[year] || data["2024"];
};

const revenue2024 = [
  { name: "Stahlbau", value: 245000, percentage: 42 },
  { name: "Treppen", value: 128000, percentage: 22 },
  { name: "Geländer", value: 98000, percentage: 17 },
  { name: "Brandschutz", value: 68000, percentage: 12 },
  { name: "Service", value: 45250, percentage: 7 },
];

export default function Reports() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedReport, setSelectedReport] = useState<typeof reportTypes[0] | null>(null);

  const kpiData = getKpiData(selectedYear);
  const revenueByProject = getRevenueByProject(selectedYear);

  const handleRefreshReport = (reportTitle: string) => {
    toast.success(`${reportTitle} wird aktualisiert...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Berichte & Analysen
          </h1>
          <p className="text-muted-foreground">
            Detaillierte Einblicke in Ihre Geschäftsdaten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <ReportExportDialog year={selectedYear} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <div
            key={kpi.title}
            className={cn(
              "rounded-xl border border-border bg-card p-5 animate-fade-in cursor-pointer hover:border-primary/30 transition-all"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => navigate("/finance")}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              <Badge
                className={cn(
                  kpi.trend === "up"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {kpi.change}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Project */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-lg">
              Umsatz nach Kategorie
            </h3>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-4">
            {revenueByProject.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    CHF {item.value.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      index === 0 && "bg-primary",
                      index === 1 && "bg-success",
                      index === 2 && "bg-info",
                      index === 3 && "bg-warning",
                      index === 4 && "bg-muted-foreground"
                    )}
                    style={{
                      width: `${item.percentage}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gesamt</span>
              <span className="font-bold">
                CHF {revenueByProject.reduce((a, b) => a + b.value, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Report Types */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-semibold text-lg">
              Verfügbare Berichte
            </h3>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {reportTypes.map((report, index) => (
              <div
                key={report.id}
                className={cn(
                  "group flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer animate-fade-in"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                    <report.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {report.lastGenerated}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRefreshReport(report.title);
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReport(report);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Report Detail Dialog */}
          {selectedReport && (
            <ReportDetailDialog
              report={selectedReport}
              year={selectedYear}
              open={!!selectedReport}
              onOpenChange={(open) => !open && setSelectedReport(null)}
            />
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">
            Monatlicher Trend
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary" />
              <span className="text-sm text-muted-foreground">{selectedYear}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-muted-foreground/30" />
              <span className="text-sm text-muted-foreground">{parseInt(selectedYear) - 1}</span>
            </div>
          </div>
        </div>

        <div className="h-48 flex items-end justify-between gap-2">
          {["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"].map(
            (month, i) => {
              const current = 40 + Math.random() * 60;
              const previous = 30 + Math.random() * 50;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                  <div className="w-full flex gap-0.5 items-end justify-center h-36">
                    <div
                      className="flex-1 max-w-3 bg-muted-foreground/30 rounded-t transition-all group-hover:bg-muted-foreground/50"
                      style={{ height: `${previous}%` }}
                    />
                    <div
                      className="flex-1 max-w-3 bg-primary rounded-t transition-all group-hover:bg-primary/80"
                      style={{ height: `${current}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{month}</span>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
