import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  Filter,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CostCenter {
  id: string;
  number: string;
  name: string;
  manager: string;
  budget: number;
  actual: number;
  variance: number;
  variancePercent: number;
  category: "production" | "sales" | "admin" | "it" | "hr";
  status: "on-track" | "warning" | "over-budget";
}

const mockCostCenters: CostCenter[] = [
  {
    id: "1",
    number: "1000",
    name: "Produktion",
    manager: "Thomas Müller",
    budget: 150000,
    actual: 142000,
    variance: 8000,
    variancePercent: 5.3,
    category: "production",
    status: "on-track",
  },
  {
    id: "2",
    number: "2000",
    name: "Vertrieb & Marketing",
    manager: "Sarah Weber",
    budget: 85000,
    actual: 82500,
    variance: 2500,
    variancePercent: 2.9,
    category: "sales",
    status: "on-track",
  },
  {
    id: "3",
    number: "3000",
    name: "Verwaltung",
    manager: "Michael Schmidt",
    budget: 45000,
    actual: 48000,
    variance: -3000,
    variancePercent: -6.7,
    category: "admin",
    status: "warning",
  },
  {
    id: "4",
    number: "4000",
    name: "IT & Digitalisierung",
    manager: "Julia Hoffmann",
    budget: 60000,
    actual: 72000,
    variance: -12000,
    variancePercent: -20,
    category: "it",
    status: "over-budget",
  },
  {
    id: "5",
    number: "5000",
    name: "Personal & HR",
    manager: "Andreas Klein",
    budget: 35000,
    actual: 33500,
    variance: 1500,
    variancePercent: 4.3,
    category: "hr",
    status: "on-track",
  },
];

const categoryColors = {
  production: "bg-blue-500/10 text-blue-600",
  sales: "bg-purple-500/10 text-purple-600",
  admin: "bg-orange-500/10 text-orange-600",
  it: "bg-info/10 text-info",
  hr: "bg-success/10 text-success",
};

const categoryLabels = {
  production: "Produktion",
  sales: "Vertrieb",
  admin: "Verwaltung",
  it: "IT",
  hr: "Personal",
};

const statusStyles = {
  "on-track": "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  "over-budget": "bg-destructive/10 text-destructive",
};

const statusLabels = {
  "on-track": "Im Plan",
  warning: "Achtung",
  "over-budget": "Überschritten",
};

export default function CostCenters() {
  const navigate = useNavigate();

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/cost-centers"],
    queryFn: () => api.get<any>("/cost-centers"),
  });
  const costCenters = apiData?.data || mockCostCenters;

  const [searchQuery, setSearchQuery] = useState("");
  const [centerList, setCenterList] = useState(costCenters);
  const [statusFilter, setStatusFilter] = useState<"all" | "on-track" | "warning" | "over-budget">("all");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  const filteredCenters = centerList.filter((center) => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.number.includes(searchQuery) ||
      center.manager.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || center.status === statusFilter;
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(center.category);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalBudget = centerList.reduce((acc, c) => acc + c.budget, 0);
  const totalActual = centerList.reduce((acc, c) => acc + c.actual, 0);
  const totalVariance = totalBudget - totalActual;

  const onTrackCount = centerList.filter(c => c.status === "on-track").length;
  const warningCount = centerList.filter(c => c.status === "warning").length;
  const overBudgetCount = centerList.filter(c => c.status === "over-budget").length;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCenterList(centerList.filter(c => c.id !== id));
    toast.success("Kostenstelle gelöscht");
  };

  const handleStatCardClick = (filter: "all" | "on-track" | "warning" | "over-budget") => {
    setStatusFilter(statusFilter === filter ? "all" : filter);
  };

  const formatCHF = (amount: number) => `CHF ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;

  const handleCreateReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(18);
    doc.text("Kostenstellenbericht", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Erstellt am: ${new Date().toLocaleDateString("de-CH")}`, pageWidth / 2, 28, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("Zusammenfassung", 14, 42);
    doc.setFontSize(10);
    doc.text(`Gesamtbudget: ${formatCHF(totalBudget)}`, 14, 50);
    doc.text(`Ist-Kosten: ${formatCHF(totalActual)}`, 14, 56);
    doc.text(`Abweichung: ${formatCHF(totalVariance)}`, 14, 62);
    doc.text(`Im Plan: ${onTrackCount} | Achtung: ${warningCount} | Überschritten: ${overBudgetCount}`, 14, 68);
    
    autoTable(doc, {
      startY: 78,
      head: [["Nr.", "Kostenstelle", "Verantwortlich", "Budget", "Ist", "Abweichung", "Status"]],
      body: centerList.map(c => [
        c.number,
        c.name,
        c.manager,
        formatCHF(c.budget),
        formatCHF(c.actual),
        `${c.variance >= 0 ? "+" : ""}${formatCHF(c.variance)}`,
        statusLabels[c.status],
      ]),
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
    });

    doc.save(`Kostenstellenbericht_${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("Bericht wurde erstellt");
  };

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilter(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const activeFilters = categoryFilter.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Kostenstellenrechnung
          </h1>
          <p className="text-muted-foreground">
            Kosten nach Verantwortungsbereichen überwachen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleCreateReport}>
            <BarChart3 className="h-4 w-4" />
            Bericht erstellen
          </Button>
          <Button className="gap-2" onClick={() => navigate("/cost-centers/new")}>
            <Plus className="h-4 w-4" />
            Kostenstelle anlegen
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            statusFilter === "all" ? "border-primary ring-2 ring-primary/20" : "border-border"
          )}
          onClick={() => handleStatCardClick("all")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamtbudget</p>
              <p className="text-2xl font-bold">CHF {totalBudget.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            statusFilter === "on-track" ? "border-success ring-2 ring-success/20" : "border-border"
          )}
          onClick={() => handleStatCardClick("on-track")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Im Plan</p>
              <p className="text-2xl font-bold text-success">{onTrackCount} Stellen</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            statusFilter === "warning" ? "border-warning ring-2 ring-warning/20" : "border-border"
          )}
          onClick={() => handleStatCardClick("warning")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Target className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Achtung</p>
              <p className="text-2xl font-bold text-warning">{warningCount} Stellen</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            statusFilter === "over-budget" ? "border-destructive ring-2 ring-destructive/20" : "border-border"
          )}
          onClick={() => handleStatCardClick("over-budget")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Überschritten</p>
              <p className="text-2xl font-bold text-destructive">{overBudgetCount} Stellen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Kostenstellen suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
              {activeFilters > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Kategorie</h4>
                <div className="space-y-2">
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox 
                        id={key} 
                        checked={categoryFilter.includes(key)}
                        onCheckedChange={() => toggleCategoryFilter(key)}
                      />
                      <label htmlFor={key} className="text-sm cursor-pointer">{label}</label>
                    </div>
                  ))}
                </div>
              </div>
              {activeFilters > 0 && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => setCategoryFilter([])}>
                  Filter zurücksetzen
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kostenstelle</TableHead>
              <TableHead>Verantwortlich</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Ist</TableHead>
              <TableHead>Auslastung</TableHead>
              <TableHead className="text-right">Abweichung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCenters.map((center, index) => {
              const utilizationPercent = (center.actual / center.budget) * 100;

              return (
                <TableRow
                  key={center.id}
                  className="animate-fade-in cursor-pointer hover:bg-muted/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/cost-centers/${center.id}`)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{center.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {center.number}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{center.manager}</TableCell>
                  <TableCell>
                    <Badge className={categoryColors[center.category]}>
                      {categoryLabels[center.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    CHF {center.budget.toLocaleString("de-CH")}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    CHF {center.actual.toLocaleString("de-CH")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 min-w-[100px]">
                      <Progress
                        value={Math.min(utilizationPercent, 100)}
                        className={cn(
                          "h-2",
                          utilizationPercent > 100 && "[&>div]:bg-destructive"
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        {utilizationPercent.toFixed(1)}%
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-mono font-medium",
                    center.variance >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {center.variance >= 0 ? "+" : ""}CHF {center.variance.toLocaleString("de-CH")}
                    <span className="text-xs ml-1">
                      ({center.variancePercent >= 0 ? "+" : ""}{center.variancePercent}%)
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[center.status]}>
                      {statusLabels[center.status]}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/cost-centers/${center.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/cost-centers/${center.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, center.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
