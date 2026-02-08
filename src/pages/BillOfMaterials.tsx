import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Layers,
  Package,
  Clock,
  Calculator,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  ChevronRight,
  FileText,
  Wrench,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface BOMItem {
  id: string;
  articleNumber: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  type: "material" | "work" | "external";
  children?: BOMItem[];
}

interface BOM {
  id: string;
  number: string;
  name: string;
  project?: string;
  status: "draft" | "active" | "archived";
  totalMaterial: number;
  totalWork: number;
  totalExternal: number;
  items: BOMItem[];
  createdAt: string;
}


const typeStyles = {
  material: "bg-blue-500/10 text-blue-600",
  work: "bg-purple-500/10 text-purple-600",
  external: "bg-warning/10 text-warning",
};

const typeLabels = {
  material: "Material",
  work: "Arbeit",
  external: "Fremdleistung",
};

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success",
  archived: "bg-secondary text-secondary-foreground",
};

const statusLabels = {
  draft: "Entwurf",
  active: "Aktiv",
  archived: "Archiviert",
};

function BOMItemRow({ item, level = 0 }: { item: BOMItem; level?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const total = item.quantity * item.unitPrice;

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-4 py-3 px-4 border-b border-border hover:bg-muted/50 transition-colors",
          level > 0 && "bg-muted/20"
        )}
        style={{ paddingLeft: `${16 + level * 24}px` }}
      >
        {hasChildren ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronRight
                  className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}
                />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        ) : (
          <div className="w-6" />
        )}

        <span className="font-mono text-sm text-muted-foreground w-24">
          {item.articleNumber}
        </span>
        <span className="flex-1 font-medium">{item.name}</span>
        <Badge className={typeStyles[item.type]}>{typeLabels[item.type]}</Badge>
        <span className="font-mono w-20 text-right">{item.quantity}</span>
        <span className="text-muted-foreground w-16">{item.unit}</span>
        <span className="font-mono w-24 text-right">CHF {item.unitPrice.toFixed(2)}</span>
        <span className="font-mono font-semibold w-28 text-right">CHF {total.toLocaleString()}</span>
      </div>
      {hasChildren && isOpen && (
        <div>
          {item.children!.map((child) => (
            <BOMItemRow key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </>
  );
}

export default function BillOfMaterials() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/bom"],
    queryFn: () => api.get<any>("/bom"),
  });
  const initialBoms = apiData?.data || [];
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedBOM, setExpandedBOM] = useState<string | null>("1");
  const [bomList, setBomList] = useState<BOM[]>(initialBoms);

  const totalBOMs = bomList.length;
  const activeBOMs = bomList.filter((b) => b.status === "active").length;
  const draftBOMs = bomList.filter((b) => b.status === "draft").length;
  const totalValue = bomList.reduce(
    (sum, b) => sum + b.totalMaterial + b.totalWork + b.totalExternal,
    0
  );

  const filteredBoms = bomList.filter((bom) => {
    const matchesSearch = bom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bom.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || bom.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (e: React.MouseEvent, bomId: string) => {
    e.stopPropagation();
    setBomList(bomList.filter(b => b.id !== bomId));
    toast.success("Stückliste gelöscht");
  };

  const handleDuplicate = (e: React.MouseEvent, bom: BOM) => {
    e.stopPropagation();
    const newBom: BOM = {
      ...bom,
      id: Date.now().toString(),
      number: `STL-2024-${String(bomList.length + 1).padStart(3, '0')}`,
      name: `${bom.name} (Kopie)`,
      status: "draft",
    };
    setBomList([...bomList, newBom]);
    toast.success("Stückliste dupliziert");
  };

  const handleViewDetails = (e: React.MouseEvent, bomId: string) => {
    e.stopPropagation();
    navigate(`/bom/${bomId}`);
  };

  const handleEdit = (e: React.MouseEvent, bomId: string) => {
    e.stopPropagation();
    navigate(`/bom/${bomId}`);
  };

  const handleCalculation = (e: React.MouseEvent, bom: BOM) => {
    e.stopPropagation();
    
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
        total: item.quantity * item.unitPrice,
      })),
    };
    sessionStorage.setItem('calculationFromBOM', JSON.stringify(calcData));
    toast.success("Daten für Kalkulation übernommen");
    navigate('/calculation/new');
  };

  const handleCreateFromTemplate = (templateId: string) => {
    const templates: Record<string, { name: string; items: BOMItem[] }> = {
      treppe: {
        name: "Metalltreppe",
        items: [
          { id: "t1", articleNumber: "ART-001", name: "Stahlträger HEB 200", quantity: 12, unit: "lfm", unitPrice: 85, type: "material" },
          { id: "t2", articleNumber: "ART-002", name: "Treppenstufen Gitterrost", quantity: 18, unit: "Stk", unitPrice: 125, type: "material" },
          { id: "t3", articleNumber: "ART-003", name: "Geländer Edelstahl", quantity: 12, unit: "lfm", unitPrice: 180, type: "material" },
          { id: "t4", articleNumber: "DL-001", name: "Schweissarbeiten", quantity: 24, unit: "Std", unitPrice: 125, type: "work" },
        ],
      },
      gelaender: {
        name: "Geländer / Balkon",
        items: [
          { id: "g1", articleNumber: "ART-010", name: "Pfosten Edelstahl 40x40", quantity: 8, unit: "Stk", unitPrice: 95, type: "material" },
          { id: "g2", articleNumber: "ART-011", name: "Handlauf Edelstahl Ø42", quantity: 10, unit: "lfm", unitPrice: 65, type: "material" },
          { id: "g3", articleNumber: "ART-012", name: "Glasfüllung VSG", quantity: 5, unit: "m²", unitPrice: 280, type: "material" },
          { id: "g4", articleNumber: "DL-002", name: "Montagearbeiten", quantity: 8, unit: "Std", unitPrice: 125, type: "work" },
        ],
      },
      tor: {
        name: "Tor / Zaun",
        items: [
          { id: "z1", articleNumber: "ART-020", name: "Rahmenrohr 60x40", quantity: 15, unit: "lfm", unitPrice: 28, type: "material" },
          { id: "z2", articleNumber: "ART-021", name: "Füllung Stabgitter", quantity: 6, unit: "m²", unitPrice: 120, type: "material" },
          { id: "z3", articleNumber: "ART-022", name: "Beschläge Set", quantity: 1, unit: "Set", unitPrice: 350, type: "material" },
          { id: "z4", articleNumber: "DL-001", name: "Schweissarbeiten", quantity: 12, unit: "Std", unitPrice: 125, type: "work" },
        ],
      },
      vordach: {
        name: "Vordach / Carport",
        items: [
          { id: "v1", articleNumber: "ART-030", name: "Stützen HEB 140", quantity: 4, unit: "Stk", unitPrice: 280, type: "material" },
          { id: "v2", articleNumber: "ART-031", name: "Träger IPE 180", quantity: 8, unit: "lfm", unitPrice: 95, type: "material" },
          { id: "v3", articleNumber: "ART-032", name: "Trapezblech verzinkt", quantity: 20, unit: "m²", unitPrice: 35, type: "material" },
          { id: "v4", articleNumber: "DL-001", name: "Montagearbeiten", quantity: 16, unit: "Std", unitPrice: 125, type: "work" },
        ],
      },
      brandschutz: {
        name: "Brandschutztür T90",
        items: [
          { id: "b1", articleNumber: "ART-040", name: "Stahlzarge T90", quantity: 1, unit: "Stk", unitPrice: 450, type: "material" },
          { id: "b2", articleNumber: "ART-041", name: "Türblatt T90", quantity: 1, unit: "Stk", unitPrice: 680, type: "material" },
          { id: "b3", articleNumber: "ART-042", name: "Beschläge Panikset", quantity: 1, unit: "Set", unitPrice: 380, type: "material" },
          { id: "b4", articleNumber: "DL-003", name: "Einbau inkl. Prüfung", quantity: 4, unit: "Std", unitPrice: 135, type: "work" },
        ],
      },
    };

    const template = templates[templateId];
    if (!template) return;

    const totalMaterial = template.items.filter(i => i.type === "material").reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const totalWork = template.items.filter(i => i.type === "work").reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const totalExternal = template.items.filter(i => i.type === "external").reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    const newBom: BOM = {
      id: Date.now().toString(),
      number: `STL-2024-${String(bomList.length + 1).padStart(3, '0')}`,
      name: template.name,
      status: "draft",
      totalMaterial,
      totalWork,
      totalExternal,
      createdAt: new Date().toLocaleDateString('de-CH'),
      items: template.items,
    };

    setBomList([...bomList, newBom]);
    setExpandedBOM(newBom.id);
    toast.success(`Stückliste "${template.name}" aus Vorlage erstellt`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Stücklisten (BOM)
          </h1>
          <p className="text-muted-foreground">
            Bill of Materials für Metallbau-Projekte
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Vorlage
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => handleCreateFromTemplate("treppe")}>
                <Layers className="h-4 w-4 mr-2" />
                <div>
                  <p className="font-medium">Metalltreppe Standard</p>
                  <p className="text-xs text-muted-foreground">Träger, Stufen, Geländer</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateFromTemplate("gelaender")}>
                <Layers className="h-4 w-4 mr-2" />
                <div>
                  <p className="font-medium">Geländer / Balkon</p>
                  <p className="text-xs text-muted-foreground">Pfosten, Handlauf, Füllung</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateFromTemplate("tor")}>
                <Layers className="h-4 w-4 mr-2" />
                <div>
                  <p className="font-medium">Tor / Zaun</p>
                  <p className="text-xs text-muted-foreground">Rahmen, Füllung, Beschläge</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateFromTemplate("vordach")}>
                <Layers className="h-4 w-4 mr-2" />
                <div>
                  <p className="font-medium">Vordach / Carport</p>
                  <p className="text-xs text-muted-foreground">Stützen, Träger, Dach</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateFromTemplate("brandschutz")}>
                <Layers className="h-4 w-4 mr-2" />
                <div>
                  <p className="font-medium">Brandschutztür</p>
                  <p className="text-xs text-muted-foreground">Zarge, Türblatt, Beschläge</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="gap-2" onClick={() => navigate("/bom/new")}>
            <Plus className="h-4 w-4" />
            Stückliste erstellen
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
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stücklisten</p>
              <p className="text-2xl font-bold">{totalBOMs}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-success/50",
            statusFilter === "active" ? "border-success ring-2 ring-success/20" : "border-border"
          )}
          onClick={() => setStatusFilter("active")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Package className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktiv</p>
              <p className="text-2xl font-bold">{activeBOMs}</p>
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entwürfe</p>
              <p className="text-2xl font-bold">{draftBOMs}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Calculator className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamtwert</p>
              <p className="text-2xl font-bold">CHF {totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Stücklisten suchen..."
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
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="archived">Archiviert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* BOM List */}
      <div className="space-y-4">
        {filteredBoms.map((bom, index) => (
          <Collapsible
            key={bom.id}
            open={expandedBOM === bom.id}
            onOpenChange={(open) => setExpandedBOM(open ? bom.id : null)}
          >
            <div
              className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <Layers className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{bom.name}</h3>
                        <Badge className={statusStyles[bom.status]}>
                          {statusLabels[bom.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-mono">{bom.number}</span>
                        {bom.project && <> • Projekt: {bom.project}</>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Material</p>
                      <p className="font-mono">CHF {bom.totalMaterial.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Arbeit</p>
                      <p className="font-mono">CHF {bom.totalWork.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Gesamt</p>
                      <p className="font-mono font-bold">
                        CHF {(bom.totalMaterial + bom.totalWork + bom.totalExternal).toLocaleString()}
                      </p>
                    </div>

                    <ChevronRight
                      className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        expandedBOM === bom.id && "rotate-90"
                      )}
                    />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleViewDetails(e, bom.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleEdit(e, bom.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDuplicate(e, bom)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleCalculation(e, bom)}>
                          <Wrench className="h-4 w-4 mr-2" />
                          Kalkulation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, bom.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t border-border">
                  <div className="flex items-center gap-4 py-2 px-4 bg-muted/50 text-sm font-medium text-muted-foreground">
                    <div className="w-6" />
                    <span className="w-24">Art.-Nr.</span>
                    <span className="flex-1">Bezeichnung</span>
                    <span className="w-20">Typ</span>
                    <span className="w-20 text-right">Menge</span>
                    <span className="w-16">Einheit</span>
                    <span className="w-24 text-right">Preis</span>
                    <span className="w-28 text-right">Total</span>
                  </div>
                  {bom.items.map((item) => (
                    <BOMItemRow key={item.id} item={item} />
                  ))}
                  {bom.items.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                      <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Keine Positionen vorhanden</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Position hinzufügen
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}

        {filteredBoms.length === 0 && (
          <div className="py-12 text-center text-muted-foreground rounded-xl border border-border bg-card">
            <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Keine Stücklisten gefunden</p>
            <p className="text-sm">Passen Sie die Filter an oder erstellen Sie eine neue Stückliste</p>
          </div>
        )}
      </div>
    </div>
  );
}