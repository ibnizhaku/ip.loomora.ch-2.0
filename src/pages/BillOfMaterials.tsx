import { useState } from "react";
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

const boms: BOM[] = [
  {
    id: "1",
    number: "STL-2024-001",
    name: "Metalltreppe 3-geschossig",
    project: "PRJ-2024-015",
    status: "active",
    totalMaterial: 12450,
    totalWork: 8600,
    totalExternal: 2200,
    createdAt: "15.01.2024",
    items: [
      {
        id: "1-1",
        articleNumber: "ART-001",
        name: "Stahlträger HEB 200",
        quantity: 24,
        unit: "lfm",
        unitPrice: 85,
        type: "material",
      },
      {
        id: "1-2",
        articleNumber: "ART-002",
        name: "Treppenstufen Gitterrost",
        quantity: 36,
        unit: "Stk",
        unitPrice: 125,
        type: "material",
      },
      {
        id: "1-3",
        articleNumber: "DL-001",
        name: "Schweissarbeiten",
        quantity: 48,
        unit: "Std",
        unitPrice: 125,
        type: "work",
      },
      {
        id: "1-4",
        articleNumber: "EXT-001",
        name: "Verzinkung extern",
        quantity: 1,
        unit: "psch",
        unitPrice: 2200,
        type: "external",
      },
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
    totalExternal: 850,
    createdAt: "22.01.2024",
    items: [
      {
        id: "2-1",
        articleNumber: "ART-003",
        name: "Edelstahl Rundrohr 42mm",
        quantity: 45,
        unit: "lfm",
        unitPrice: 28,
        type: "material",
      },
      {
        id: "2-2",
        articleNumber: "DL-001",
        name: "Montagearbeiten",
        quantity: 16,
        unit: "Std",
        unitPrice: 125,
        type: "work",
      },
    ],
  },
  {
    id: "3",
    number: "STL-2024-003",
    name: "Brandschutztür T90",
    status: "draft",
    totalMaterial: 1800,
    totalWork: 960,
    totalExternal: 0,
    createdAt: "28.01.2024",
    items: [],
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedBOM, setExpandedBOM] = useState<string | null>("1");

  const totalBOMs = boms.length;
  const activeBOMs = boms.filter((b) => b.status === "active").length;
  const totalValue = boms.reduce(
    (sum, b) => sum + b.totalMaterial + b.totalWork + b.totalExternal,
    0
  );

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
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Vorlage
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Stückliste erstellen
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
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
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Package className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Materialwert</p>
              <p className="text-2xl font-bold">
                CHF {boms.reduce((s, b) => s + b.totalMaterial, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arbeitswert</p>
              <p className="text-2xl font-bold">
                CHF {boms.reduce((s, b) => s + b.totalWork, 0).toLocaleString()}
              </p>
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
        {boms.map((bom, index) => (
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
                          <Wrench className="h-4 w-4 mr-2" />
                          Kalkulation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
      </div>
    </div>
  );
}
