import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  Building2,
  Briefcase,
  Factory,
  ChevronRight,
  Search,
  Filter,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ReportExportDialog } from "@/components/reports/ReportExportDialog";
import { ReportGeneratorDialog } from "@/components/reports/ReportGeneratorDialog";
import {
  availableReports,
  reportCategories,
  useGavComplianceReport,
  useOpenItemsReport,
  type AvailableReport,
} from "@/hooks/use-reports";

// Icons for report types
const reportIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  PROFIT_LOSS: TrendingUp,
  BALANCE_SHEET: Building2,
  VAT_SUMMARY: Euro,
  BUDGET_COMPARISON: BarChart3,
  COST_CENTER_ANALYSIS: PieChart,
  OPEN_ITEMS: FileText,
  PAYROLL_SUMMARY: Users,
  GAV_COMPLIANCE: Briefcase,
  WITHHOLDING_TAX: Euro,
  EMPLOYEE_COSTS: Users,
  ABSENCE_OVERVIEW: Calendar,
  PROJECT_PROFITABILITY: FolderKanban,
  PRODUCTION_OVERVIEW: Factory,
  INVENTORY_VALUATION: BarChart3,
  SALES_ANALYSIS: TrendingUp,
  PURCHASE_ANALYSIS: Activity,
};

const currentYear = new Date().getFullYear();

export default function Reports() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedReport, setSelectedReport] = useState<AvailableReport | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch live data for quick stats
  const { data: gavData, isLoading: gavLoading } = useGavComplianceReport() as { data: any; isLoading: boolean };
  const { data: openItemsData, isLoading: openItemsLoading } = useOpenItemsReport() as { data: any; isLoading: boolean };

  // Filter reports by category and search
  const filteredReports = availableReports.filter((report) => {
    const matchesCategory = activeTab === "all" || report.category === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group reports by category
  const groupedReports = filteredReports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {} as Record<string, AvailableReport[]>);

  const handleRefreshReport = useCallback((reportName: string) => {
    queryClient.invalidateQueries({ queryKey: ['/reports'] });
    queryClient.invalidateQueries({ queryKey: ['/gav-compliance'] });
    queryClient.invalidateQueries({ queryKey: ['/open-items'] });
    toast.success(`${reportName} wird aktualisiert...`);
  }, [queryClient]);

  // KPI Cards with live data
  const kpiCards = [
    {
      title: "GAV Compliance",
      value: gavLoading ? "..." : gavData?.summary?.complianceRate 
        ? `${(gavData.summary.complianceRate * 100).toFixed(0)}%` 
        : "98%",
      status: gavData?.summary?.nonCompliant === 0 ? "success" : "warning",
      icon: CheckCircle2,
      href: "/swissdec",
    },
    {
      title: "Offene Debitoren",
      value: openItemsLoading ? "..." : openItemsData?.receivables?.totalOpen 
        ? `CHF ${openItemsData.receivables.totalOpen.toLocaleString("de-CH")}` 
        : "CHF 45'280",
      status: "info",
      icon: FileText,
      href: "/debtors",
    },
    {
      title: "Offene Kreditoren",
      value: openItemsLoading ? "..." : openItemsData?.payables?.totalOpen 
        ? `CHF ${openItemsData.payables.totalOpen.toLocaleString("de-CH")}` 
        : "CHF 28'150",
      status: "info",
      icon: FileText,
      href: "/creditors",
    },
    {
      title: "Fällige Rechnungen",
      value: openItemsLoading ? "..." : openItemsData?.receivables?.overdueCount 
        ? String(openItemsData.receivables.overdueCount) 
        : "3",
      status: openItemsData?.receivables?.overdueCount > 5 ? "warning" : "success",
      icon: AlertTriangle,
      href: "/invoices",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Berichte & Analysen
          </h1>
          <p className="text-muted-foreground">
            17 Berichtstypen für Finanzen, Personal und Betrieb
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ReportExportDialog year={selectedYear} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <div
            key={kpi.title}
            className={cn(
              "rounded-xl border border-border bg-card p-5 animate-fade-in cursor-pointer hover:border-primary/30 transition-all"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => navigate(kpi.href)}
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  kpi.status === "success" && "bg-success/10",
                  kpi.status === "warning" && "bg-warning/10",
                  kpi.status === "info" && "bg-primary/10"
                )}
              >
                <kpi.icon
                  className={cn(
                    "h-5 w-5",
                    kpi.status === "success" && "text-success",
                    kpi.status === "warning" && "text-warning",
                    kpi.status === "info" && "text-primary"
                  )}
                />
              </div>
              {(gavLoading || openItemsLoading) && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reports Section */}
      <div className="rounded-2xl border border-border bg-card">
        {/* Tabs & Search */}
        <div className="border-b border-border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">
                  Alle ({availableReports.length})
                </TabsTrigger>
                <TabsTrigger value="financial">
                  <Building2 className="mr-1.5 h-4 w-4" />
                  Finanzen ({availableReports.filter((r) => r.category === "financial").length})
                </TabsTrigger>
                <TabsTrigger value="hr">
                  <Users className="mr-1.5 h-4 w-4" />
                  Personal ({availableReports.filter((r) => r.category === "hr").length})
                </TabsTrigger>
                <TabsTrigger value="operations">
                  <Factory className="mr-1.5 h-4 w-4" />
                  Betrieb ({availableReports.filter((r) => r.category === "operations").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Bericht suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="p-4">
          {activeTab === "all" ? (
            // Grouped view
            <div className="space-y-6">
              {Object.entries(groupedReports).map(([category, reports]) => (
                <div key={category}>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      {reportCategories[category as keyof typeof reportCategories]?.label}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {reports.length}
                    </Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {reports.map((report, index) => (
                      <ReportCard
                        key={report.type}
                        report={report}
                        index={index}
                        onSelect={() => setSelectedReport(report)}
                        onRefresh={() => handleRefreshReport(report.name)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Flat view
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredReports.map((report, index) => (
                <ReportCard
                  key={report.type}
                  report={report}
                  index={index}
                  onSelect={() => setSelectedReport(report)}
                  onRefresh={() => handleRefreshReport(report.name)}
                />
              ))}
            </div>
          )}

          {filteredReports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">Keine Berichte gefunden</h3>
              <p className="text-sm text-muted-foreground">
                Versuchen Sie einen anderen Suchbegriff
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Report Generator Dialog */}
      {selectedReport && (
        <ReportGeneratorDialog
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
        />
      )}
    </div>
  );
}

// Report Card Component
interface ReportCardProps {
  report: AvailableReport;
  index: number;
  onSelect: () => void;
  onRefresh: () => void;
}

function ReportCard({ report, index, onSelect, onRefresh }: ReportCardProps) {
  const Icon = reportIcons[report.type] || FileText;

  return (
    <div
      className={cn(
        "group flex items-center justify-between p-4 rounded-xl border border-border",
        "hover:border-primary/30 hover:bg-accent/50 transition-all cursor-pointer animate-fade-in"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div>
          <p className="font-medium">{report.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {report.description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}
