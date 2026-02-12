import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Trash2,
  Layers,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

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

// Available BOMs for selection
interface BOMItem {
  id: string;
  articleNumber: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  type: "material" | "work" | "external";
}

interface BOM {
  id: string;
  number: string;
  name: string;
  project?: string;
  status: "draft" | "active" | "archived";
  totalMaterial: number;
  totalWork: number;
  items: BOMItem[];
}

const availableBOMs: BOM[] = [
  {
    id: "1",
    number: "STL-2024-001",
    name: "Metalltreppe 3-geschossig",
    project: "PRJ-2024-015",
    status: "active",
    totalMaterial: 12450,
    totalWork: 8600,
    items: [
      { id: "1-1", articleNumber: "ART-001", name: "Stahlträger HEB 200", quantity: 24, unit: "lfm", unitPrice: 85, type: "material" },
      { id: "1-2", articleNumber: "ART-002", name: "Treppenstufen Gitterrost", quantity: 36, unit: "Stk", unitPrice: 125, type: "material" },
      { id: "1-3", articleNumber: "DL-001", name: "Schweissarbeiten", quantity: 48, unit: "Std", unitPrice: 125, type: "work" },
    ],
  },
  {
    id: "2",
    number: "STL-2024-002",
    name: "Geländer Balkon 15m",
    project: "PRJ-2024-018",
    status: "active",
    totalMaterial: 3200,
    totalWork: 2400,
    items: [
      { id: "2-1", articleNumber: "ART-003", name: "Edelstahl Rundrohr 42mm", quantity: 45, unit: "lfm", unitPrice: 28, type: "material" },
      { id: "2-2", articleNumber: "DL-002", name: "Montagearbeiten", quantity: 16, unit: "Std", unitPrice: 125, type: "work" },
    ],
  },
  {
    id: "3",
    number: "STL-2024-003",
    name: "Brandschutztür T90",
    status: "draft",
    totalMaterial: 1800,
    totalWork: 960,
    items: [
      { id: "3-1", articleNumber: "ART-004", name: "Stahlzarge T90", quantity: 1, unit: "Stk", unitPrice: 450, type: "material" },
      { id: "3-2", articleNumber: "ART-005", name: "Türblatt T90", quantity: 1, unit: "Stk", unitPrice: 680, type: "material" },
      { id: "3-3", articleNumber: "DL-003", name: "Einbau", quantity: 6, unit: "Std", unitPrice: 125, type: "work" },
    ],
  },
  {
    id: "4",
    number: "STL-2024-004",
    name: "Vordach Stahl verzinkt",
    status: "active",
    totalMaterial: 4500,
    totalWork: 2100,
    items: [
      { id: "4-1", articleNumber: "ART-006", name: "Stützen HEB 140", quantity: 4, unit: "Stk", unitPrice: 320, type: "material" },
      { id: "4-2", articleNumber: "ART-007", name: "Träger IPE 180", quantity: 12, unit: "lfm", unitPrice: 95, type: "material" },
      { id: "4-3", articleNumber: "DL-001", name: "Schweissarbeiten", quantity: 14, unit: "Std", unitPrice: 125, type: "work" },
    ],
  },
];

const bomStatusStyles = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success",
  archived: "bg-secondary text-secondary-foreground",
};

const bomStatusLabels = {
  draft: "Entwurf",
  active: "Aktiv",
  archived: "Archiviert",
};

export default function Calculation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/calculations"],
    queryFn: () => api.get<any>("/calculations"),
  });
  const initialCalculations = apiData?.data || [];
  const [statusFilter, setStatusFilter] = useState("all");
  const [calcList, setCalcList] = useState<Calculation[]>(initialCalculations);
  const [bomDialogOpen, setBomDialogOpen] = useState(false);
  const [bomSearchQuery, setBomSearchQuery] = useState("");

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/calculations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/calculations"] });
      toast.success("Kalkulation erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Kalkulation");
    },
  });

  const totalCalcs = calcList.length;
  const approvedCalcs = calcList.filter((c) => c.status === "approved").length;
  const draftCalcs = calcList.filter((c) => c.status === "draft").length;
  const totalVolume = calcList
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + (c.sellingPrice || 0), 0);
  const avgMargin =
    calcList.length > 0 ? calcList.reduce((sum, c) => sum + (c.profitMargin || 0), 0) / calcList.length : 0;

  const filteredCalcs = calcList.filter((calc) => {
    const matchesSearch = (calc.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (calc.number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (calc.customer || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || calc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBOMs = availableBOMs.filter((bom) =>
    (bom.name || "").toLowerCase().includes(bomSearchQuery.toLowerCase()) ||
    (bom.number || "").toLowerCase().includes(bomSearchQuery.toLowerCase())
  );

  const handleDelete = (e: React.MouseEvent, calcId: string) => {
    e.stopPropagation();
    deleteMutation.mutate(calcId);
  };

  const handleDuplicate = (e: React.MouseEvent, calc: Calculation) => {
    e.stopPropagation();
    const newCalc: Calculation = {
      ...calc,
      id: Date.now().toString(),
      number: `KALK-2024-${String(calcList.length + 1).padStart(3, '0')}`,
      name: `${calc.name} (Kopie)`,
      status: "draft",
    };
    setCalcList([...calcList, newCalc]);
    toast.success("Kalkulation dupliziert");
  };

  const handleCreateQuote = (e: React.MouseEvent, calc: Calculation) => {
    e.stopPropagation();
    navigate("/quotes/new");
    toast.info("Angebot wird erstellt...");
  };

  const handleSelectBOM = (bom: BOM) => {
    // Store BOM data in sessionStorage for calculation page
    const calcData = {
      bomId: bom.number,
      bomName: bom.name,
      projekt: bom.project || "",
      projektNr: bom.project || "",
      materialkosten: bom.totalMaterial,
      positionen: bom.items.map(item => ({
        artikelNr: item.articleNumber,
        bezeichnung: item.name,
        menge: item.quantity,
        einheit: item.unit,
        einzelpreis: item.unitPrice,
        type: item.type,
      })),
    };
    sessionStorage.setItem('calculationFromBOM', JSON.stringify(calcData));
    setBomDialogOpen(false);
    toast.success(`Stückliste "${bom.name}" ausgewählt`);
    navigate('/calculation/new');
  };

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
          <Dialog open={bomDialogOpen} onOpenChange={setBomDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Layers className="h-4 w-4" />
                Aus Stückliste
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Stückliste auswählen</DialogTitle>
                <DialogDescription>
                  Wählen Sie eine Stückliste als Grundlage für die Kalkulation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Stückliste suchen..."
                    className="pl-10"
                    value={bomSearchQuery}
                    onChange={(e) => setBomSearchQuery(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {filteredBOMs.map((bom) => (
                      <div
                        key={bom.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all"
                        onClick={() => handleSelectBOM(bom)}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Layers className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{bom.name}</p>
                            <Badge className={bomStatusStyles[bom.status]} variant="secondary">
                              {bomStatusLabels[bom.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-mono">{bom.number}</span>
                            {bom.project && <> • {bom.project}</>}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm">CHF {Number((bom.totalMaterial || 0) + (bom.totalWork || 0)).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{bom.items.length} Positionen</p>
                        </div>
                      </div>
                    ))}
                    {filteredBOMs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Keine Stücklisten gefunden</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="gap-2" onClick={() => navigate("/calculation/new")}>
            <Plus className="h-4 w-4" />
            Neue Kalkulation
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
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kalkulationen</p>
              <p className="text-2xl font-bold">{totalCalcs}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-success/50",
            statusFilter === "approved" ? "border-success ring-2 ring-success/20" : "border-border"
          )}
          onClick={() => setStatusFilter("approved")}
        >
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
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-muted-foreground/50",
            statusFilter === "draft" ? "border-muted-foreground ring-2 ring-muted-foreground/20" : "border-border"
          )}
          onClick={() => setStatusFilter("draft")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <TrendingUp className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entwürfe</p>
              <p className="text-2xl font-bold">{draftCalcs}</p>
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
        {filteredCalcs.map((calc, index) => (
          <div
            key={calc.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => navigate(`/calculation/${calc.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Calculator className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{calc.name || ""}</h3>
                    <Badge className={statusStyles[calc.status] || statusStyles.draft}>
                      {statusLabels[calc.status] || statusLabels.draft}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{calc.number || ""}</span> • {calc.customer || ""}
                    {calc.project && <> • {calc.project}</>}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/calculation/${calc.id}`); }}>
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/calculation/${calc.id}`); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleDuplicate(e, calc)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplizieren
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleCreateQuote(e, calc)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Angebot erstellen
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, calc.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
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
                <p className="font-mono font-medium">CHF {Number(calc.materialCost || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Arbeit ({calc.laborHours || 0}h)</span>
                </div>
                <p className="font-mono font-medium">CHF {Number(calc.laborCost || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Fremd</span>
                </div>
                <p className="font-mono font-medium">CHF {Number(calc.externalCost || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Gemeinkosten</span>
                </div>
                <p className="font-mono font-medium">CHF {Number(calc.overhead || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">VK-Preis</span>
                </div>
                <p className="font-mono font-bold text-primary">
                  CHF {Number(calc.sellingPrice || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">Marge</span>
                </div>
                <p className={cn(
                  "font-mono font-bold",
                  (calc.profitMargin || 0) >= 20 ? "text-success" : (calc.profitMargin || 0) >= 15 ? "text-warning" : "text-destructive"
                )}>
                  {calc.profitMargin || 0}%
                </p>
              </div>
            </div>

            {/* Margin Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kostenstruktur</span>
                <span className="font-mono">
                  Selbstkosten: CHF {Number(calc.totalCost || 0).toLocaleString()} → VK: CHF {Number(calc.sellingPrice || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${calc.sellingPrice > 0 ? ((calc.materialCost || 0) / calc.sellingPrice) * 100 : 0}%` }}
                  title="Material"
                />
                <div
                  className="bg-purple-500 transition-all"
                  style={{ width: `${calc.sellingPrice > 0 ? ((calc.laborCost || 0) / calc.sellingPrice) * 100 : 0}%` }}
                  title="Arbeit"
                />
                <div
                  className="bg-warning transition-all"
                  style={{ width: `${calc.sellingPrice > 0 ? ((calc.externalCost || 0) / calc.sellingPrice) * 100 : 0}%` }}
                  title="Fremdleistung"
                />
                <div
                  className="bg-muted-foreground/30 transition-all"
                  style={{ width: `${calc.sellingPrice > 0 ? ((calc.overhead || 0) / calc.sellingPrice) * 100 : 0}%` }}
                  title="Gemeinkosten"
                />
                <div
                  className="bg-success transition-all"
                  style={{ width: `${calc.sellingPrice > 0 ? (((calc.sellingPrice || 0) - (calc.totalCost || 0)) / calc.sellingPrice) * 100 : 0}%` }}
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

        {filteredCalcs.length === 0 && (
          <div className="py-12 text-center text-muted-foreground rounded-xl border border-border bg-card">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Keine Kalkulationen gefunden</p>
            <p className="text-sm">Passen Sie die Filter an oder erstellen Sie eine neue Kalkulation</p>
          </div>
        )}
      </div>
    </div>
  );
}