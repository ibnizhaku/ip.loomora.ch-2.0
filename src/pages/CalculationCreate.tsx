import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Calculator, Package, Clock, Truck, Percent, FileText, Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Position {
  id: number;
  type: "material" | "labor" | "external";
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

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

const bomStatusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success",
  archived: "bg-secondary text-secondary-foreground",
};

const bomStatusLabels: Record<string, string> = {
  draft: "Entwurf",
  active: "Aktiv",
  archived: "Archiviert",
};

export default function CalculationCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [customer, setCustomer] = useState("");
  const [project, setProject] = useState("");
  const [bomReference, setBomReference] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([
    { id: 1, type: "material", description: "", quantity: 1, unit: "Stk", unitPrice: 0 },
  ]);
  const [overheadPercent, setOverheadPercent] = useState(10);
  const [marginPercent, setMarginPercent] = useState(25);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [bomDialogOpen, setBomDialogOpen] = useState(false);
  const [bomSearchQuery, setBomSearchQuery] = useState("");

  const filteredBOMs = availableBOMs.filter((bom) =>
    bom.name.toLowerCase().includes(bomSearchQuery.toLowerCase()) ||
    bom.number.toLowerCase().includes(bomSearchQuery.toLowerCase())
  );

  const handleSelectBOM = (bom: BOM) => {
    setName(bom.name);
    setProject(bom.project || "");
    setBomReference(bom.number);
    
    // Convert BOM items to calculation positions
    const calcPositions: Position[] = bom.items.map((item, index) => ({
      id: Date.now() + index,
      type: item.type === "work" ? "labor" : item.type === "external" ? "external" : "material",
      description: `${item.articleNumber} - ${item.name}`,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
    }));
    setPositions(calcPositions);
    setBomDialogOpen(false);
    toast.success(`Daten aus Stückliste "${bom.name}" übernommen`);
  };

  // Load BOM data from sessionStorage if available
  useEffect(() => {
    const bomDataStr = sessionStorage.getItem('calculationFromBOM');
    if (bomDataStr) {
      try {
        const bomData = JSON.parse(bomDataStr);
        setName(bomData.bomName || "");
        setProject(bomData.projektNr || "");
        setBomReference(bomData.bomId);
        
        // Convert BOM positions to calculation positions
        if (bomData.positionen && bomData.positionen.length > 0) {
          const calcPositions: Position[] = bomData.positionen.map((p: any, index: number) => ({
            id: Date.now() + index,
            type: p.type === "work" ? "labor" : p.type === "external" ? "external" : "material",
            description: `${p.artikelNr || ''} - ${p.bezeichnung}`,
            quantity: p.menge,
            unit: p.einheit,
            unitPrice: p.einzelpreis,
          }));
          setPositions(calcPositions);
        }
        
        // Clear the stored data
        sessionStorage.removeItem('calculationFromBOM');
        toast.info(`Daten aus Stückliste ${bomData.bomId} übernommen`);
      } catch (e) {
        console.error("Failed to parse BOM data:", e);
      }
    }
  }, []);

  const addPosition = (type: "material" | "labor" | "external") => {
    setPositions([
      ...positions,
      { id: Date.now(), type, description: "", quantity: 1, unit: type === "labor" ? "Std" : "Stk", unitPrice: type === "labor" ? 125 : 0 },
    ]);
  };

  const removePosition = (id: number) => {
    setPositions(positions.filter((p) => p.id !== id));
  };

  const updatePosition = (id: number, field: keyof Position, value: string | number) => {
    setPositions(positions.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // Calculate totals
  const materialCost = positions.filter((p) => p.type === "material").reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const laborCost = positions.filter((p) => p.type === "labor").reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const laborHours = positions.filter((p) => p.type === "labor").reduce((sum, p) => sum + p.quantity, 0);
  const externalCost = positions.filter((p) => p.type === "external").reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  
  const subtotal = materialCost + laborCost + externalCost;
  const overhead = subtotal * (overheadPercent / 100);
  const totalCost = subtotal + overhead;
  const marginAmount = totalCost * (marginPercent / 100);
  const grossPrice = totalCost + marginAmount;
  const discountAmount = grossPrice * (discountPercent / 100);
  const sellingPrice = grossPrice - discountAmount;
  const profit = sellingPrice - totalCost;
  const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  const handleSave = () => {
    if (!name) {
      toast.error("Bitte geben Sie eine Bezeichnung ein");
      return;
    }
    toast.success("Kalkulation erstellt");
    navigate("/calculation");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">Neue Kalkulation</h1>
          <p className="text-muted-foreground">Bottom-Up Projektkalkulation</p>
        </div>
        <div className="flex items-center gap-2">
          {bomReference && (
            <Badge variant="outline" className="gap-2">
              <FileText className="h-3 w-3" />
              Aus Stückliste: {bomReference}
            </Badge>
          )}
          <Dialog open={bomDialogOpen} onOpenChange={setBomDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
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
                          <p className="font-mono text-sm">CHF {(bom.totalMaterial + bom.totalWork).toLocaleString()}</p>
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grunddaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Bezeichnung *</Label>
                  <Input
                    placeholder="z.B. Metalltreppe Villa Sonnenberg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kunde</Label>
                  <Input
                    placeholder="Kundenname"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Projekt (optional)</Label>
                <Input
                  placeholder="PRJ-2024-XXX"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Positionen */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Kostenpositionen
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addPosition("material")}>
                  <Package className="h-4 w-4 mr-2" />
                  Material
                </Button>
                <Button size="sm" variant="outline" onClick={() => addPosition("labor")}>
                  <Clock className="h-4 w-4 mr-2" />
                  Arbeit
                </Button>
                <Button size="sm" variant="outline" onClick={() => addPosition("external")}>
                  <Truck className="h-4 w-4 mr-2" />
                  Fremd
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Typ</TableHead>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead className="w-20">Menge</TableHead>
                    <TableHead className="w-20">Einheit</TableHead>
                    <TableHead className="w-28">Preis/Einheit</TableHead>
                    <TableHead className="w-28 text-right">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell>
                        <Select
                          value={pos.type}
                          onValueChange={(value) => updatePosition(pos.id, "type", value as "material" | "labor" | "external")}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="labor">Arbeit</SelectItem>
                            <SelectItem value="external">Fremd</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8"
                          placeholder="Beschreibung"
                          value={pos.description}
                          onChange={(e) => updatePosition(pos.id, "description", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 w-16"
                          type="number"
                          value={pos.quantity}
                          onChange={(e) => updatePosition(pos.id, "quantity", parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 w-16"
                          value={pos.unit}
                          onChange={(e) => updatePosition(pos.id, "unit", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 w-24"
                          type="number"
                          value={pos.unitPrice}
                          onChange={(e) => updatePosition(pos.id, "unitPrice", parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        CHF {(pos.quantity * pos.unitPrice).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePosition(pos.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {positions.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Keine Positionen vorhanden</p>
                  <p className="text-sm">Fügen Sie Material, Arbeit oder Fremdleistungen hinzu</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zuschläge */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Zuschläge & Marge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Gemeinkosten (%)</Label>
                  <Input
                    type="number"
                    value={overheadPercent}
                    onChange={(e) => setOverheadPercent(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">= CHF {overhead.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label>Gewinnmarge (%)</Label>
                  <Input
                    type="number"
                    value={marginPercent}
                    onChange={(e) => setMarginPercent(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">= CHF {marginAmount.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <Label>Rabatt (%)</Label>
                  <Input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">= CHF {discountAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Kalkulation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cost Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    Material
                  </span>
                  <span className="font-mono">CHF {materialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    Arbeit ({laborHours}h)
                  </span>
                  <span className="font-mono">CHF {laborCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-warning" />
                    Fremdleistung
                  </span>
                  <span className="font-mono">CHF {externalCost.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span>Zwischensumme</span>
                <span className="font-mono">CHF {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Gemeinkosten ({overheadPercent}%)</span>
                <span className="font-mono">CHF {overhead.toLocaleString()}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Selbstkosten</span>
                <span className="font-mono">CHF {totalCost.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>+ Marge ({marginPercent}%)</span>
                <span className="font-mono">CHF {marginAmount.toLocaleString()}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>- Rabatt ({discountPercent}%)</span>
                  <span className="font-mono">CHF {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Verkaufspreis</span>
                <span className="font-mono text-primary">CHF {sellingPrice.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-lg bg-success/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gewinn</span>
                  <span className={cn(
                    "font-mono font-bold",
                    profitMargin >= 20 ? "text-success" : profitMargin >= 15 ? "text-warning" : "text-destructive"
                  )}>
                    CHF {profit.toLocaleString()} ({profitMargin.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Margin Bar */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Kostenstruktur</p>
                <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                  {sellingPrice > 0 && (
                    <>
                      <div className="bg-blue-500" style={{ width: `${(materialCost / sellingPrice) * 100}%` }} />
                      <div className="bg-purple-500" style={{ width: `${(laborCost / sellingPrice) * 100}%` }} />
                      <div className="bg-warning" style={{ width: `${(externalCost / sellingPrice) * 100}%` }} />
                      <div className="bg-muted-foreground/30" style={{ width: `${(overhead / sellingPrice) * 100}%` }} />
                      <div className="bg-success" style={{ width: `${(profit / sellingPrice) * 100}%` }} />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Abbrechen
        </Button>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Kalkulation speichern
        </Button>
      </div>
    </div>
  );
}
