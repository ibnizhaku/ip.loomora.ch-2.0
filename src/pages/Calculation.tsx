import { useState } from "react";
import {
  Plus,
  Search,
  Calculator,
  TrendingUp,
  Package,
  Clock,
  Truck,
  Percent,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  FileText,
  CheckCircle2,
  AlertTriangle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Calculation {
  id: string;
  number: string;
  name: string;
  customer: string;
  project?: string;
  status: "draft" | "calculated" | "approved" | "rejected";
  materialCost: number;
  laborCost: number;
  laborHours: number;
  externalCost: number;
  overhead: number;
  margin: number;
  discount: number;
  totalCost: number;
  sellingPrice: number;
  profitMargin: number;
  createdAt: string;
}

const calculations: Calculation[] = [
  {
    id: "1",
    number: "KALK-2024-001",
    name: "Metalltreppe Villa Sonnenberg",
    customer: "Bauherr AG",
    project: "PRJ-2024-015",
    status: "approved",
    materialCost: 12450,
    laborCost: 8600,
    laborHours: 68,
    externalCost: 2200,
    overhead: 2325,
    margin: 25,
    discount: 0,
    totalCost: 25575,
    sellingPrice: 31970,
    profitMargin: 20,
    createdAt: "15.01.2024",
  },
  {
    id: "2",
    number: "KALK-2024-002",
    name: "Balkongeländer Residenz Park",
    customer: "Immobilien Müller",
    project: "PRJ-2024-018",
    status: "calculated",
    materialCost: 3200,
    laborCost: 2400,
    laborHours: 19,
    externalCost: 850,
    overhead: 645,
    margin: 30,
    discount: 5,
    totalCost: 7095,
    sellingPrice: 8760,
    profitMargin: 19,
    createdAt: "22.01.2024",
  },
  {
    id: "3",
    number: "KALK-2024-003",
    name: "Brandschutztüren Industriehalle",
    customer: "Logistik Center Zürich",
    status: "draft",
    materialCost: 8500,
    laborCost: 3200,
    laborHours: 25,
    externalCost: 0,
    overhead: 1170,
    margin: 22,
    discount: 0,
    totalCost: 12870,
    sellingPrice: 15700,
    profitMargin: 18,
    createdAt: "28.01.2024",
  },
  {
    id: "4",
    number: "KALK-2024-004",
    name: "Carport Stahlkonstruktion",
    customer: "Privat Schneider",
    status: "rejected",
    materialCost: 4200,
    laborCost: 1800,
    laborHours: 14,
    externalCost: 600,
    overhead: 660,
    margin: 28,
    discount: 0,
    totalCost: 7260,
    sellingPrice: 9290,
    profitMargin: 22,
    createdAt: "25.01.2024",
  },
];

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  calculated: "bg-info/10 text-info",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  draft: "Entwurf",
  calculated: "Kalkuliert",
  approved: "Freigegeben",
  rejected: "Abgelehnt",
};

export default function Calculation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totalCalcs = calculations.length;
  const approvedCalcs = calculations.filter((c) => c.status === "approved").length;
  const totalVolume = calculations
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + c.sellingPrice, 0);
  const avgMargin =
    calculations.reduce((sum, c) => sum + c.profitMargin, 0) / calculations.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Kalkulation
          </h1>
          <p className="text-muted-foreground">
            Projekt- und Angebotskalkulation mit Materialkosten und Stundensätzen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Aus Stückliste
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Neue Kalkulation
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kalkulationen</p>
              <p className="text-2xl font-bold">{totalCalcs}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Freigegeben</p>
              <p className="text-2xl font-bold text-success">{approvedCalcs}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <TrendingUp className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auftragsvolumen</p>
              <p className="text-2xl font-bold">CHF {totalVolume.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Percent className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ø Marge</p>
              <p className="text-2xl font-bold">{avgMargin.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Kalkulation suchen..."
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
            <SelectItem value="draft">Entwurf</SelectItem>
            <SelectItem value="calculated">Kalkuliert</SelectItem>
            <SelectItem value="approved">Freigegeben</SelectItem>
            <SelectItem value="rejected">Abgelehnt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calculations List */}
      <div className="space-y-4">
        {calculations.map((calc, index) => (
          <div
            key={calc.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Calculator className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{calc.name}</h3>
                    <Badge className={statusStyles[calc.status]}>
                      {statusLabels[calc.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{calc.number}</span> • {calc.customer}
                    {calc.project && <> • {calc.project}</>}
                  </p>
                </div>
              </div>

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
                    <Copy className="h-4 w-4 mr-2" />
                    Duplizieren
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Angebot erstellen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Cost Breakdown */}
            <div className="grid gap-4 sm:grid-cols-6 mb-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Material</span>
                </div>
                <p className="font-mono font-medium">CHF {calc.materialCost.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Arbeit ({calc.laborHours}h)</span>
                </div>
                <p className="font-mono font-medium">CHF {calc.laborCost.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Fremd</span>
                </div>
                <p className="font-mono font-medium">CHF {calc.externalCost.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Gemeinkosten</span>
                </div>
                <p className="font-mono font-medium">CHF {calc.overhead.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">VK-Preis</span>
                </div>
                <p className="font-mono font-bold text-primary">
                  CHF {calc.sellingPrice.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">Marge</span>
                </div>
                <p className={cn(
                  "font-mono font-bold",
                  calc.profitMargin >= 20 ? "text-success" : calc.profitMargin >= 15 ? "text-warning" : "text-destructive"
                )}>
                  {calc.profitMargin}%
                </p>
              </div>
            </div>

            {/* Margin Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kostenstruktur</span>
                <span className="font-mono">
                  Selbstkosten: CHF {calc.totalCost.toLocaleString()} → VK: CHF {calc.sellingPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${(calc.materialCost / calc.sellingPrice) * 100}%` }}
                  title="Material"
                />
                <div
                  className="bg-purple-500 transition-all"
                  style={{ width: `${(calc.laborCost / calc.sellingPrice) * 100}%` }}
                  title="Arbeit"
                />
                <div
                  className="bg-warning transition-all"
                  style={{ width: `${(calc.externalCost / calc.sellingPrice) * 100}%` }}
                  title="Fremdleistung"
                />
                <div
                  className="bg-muted-foreground/30 transition-all"
                  style={{ width: `${(calc.overhead / calc.sellingPrice) * 100}%` }}
                  title="Gemeinkosten"
                />
                <div
                  className="bg-success transition-all"
                  style={{ width: `${((calc.sellingPrice - calc.totalCost) / calc.sellingPrice) * 100}%` }}
                  title="Gewinn"
                />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500" /> Material
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-purple-500" /> Arbeit
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-warning" /> Fremd
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" /> GK
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-success" /> Gewinn
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
