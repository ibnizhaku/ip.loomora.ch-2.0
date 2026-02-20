import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Layers, Calculator, FileText, Plus, Trash2, Edit, Factory, Wrench, Calendar, Clock, Users, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useBom } from "@/hooks/use-bom";
import { useEntityHistory } from "@/hooks/use-audit-log";

interface BOMPosition {
  id: string;
  artikelNr: string;
  bezeichnung: string;
  einheit: string;
  menge: number;
  einzelpreis: number;
  total: number;
  lagerbestand: number;
}

interface ProductionOperation {
  id: string;
  name: string;
  workstation: string;
  hours: number;
  selected: boolean;
}

const defaultOperations: ProductionOperation[] = [
  { id: "op-1", name: "Zuschnitt", workstation: "Säge", hours: 8, selected: true },
  { id: "op-2", name: "CNC-Bearbeitung", workstation: "CNC-Fräse", hours: 12, selected: true },
  { id: "op-3", name: "Schweissen", workstation: "Schweissplatz", hours: 16, selected: true },
  { id: "op-4", name: "Oberflächenbehandlung", workstation: "Sandstrahlen", hours: 4, selected: true },
  { id: "op-5", name: "Endkontrolle", workstation: "QS-Station", hours: 2, selected: true },
];

const statusColors: Record<string, string> = {
  aktiv: "bg-success/10 text-success",
  entwurf: "bg-warning/10 text-warning",
  archiviert: "bg-muted text-muted-foreground",
};

export default function BOMDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: apiBom, isLoading } = useBom(id || "");
  const { data: auditHistory } = useEntityHistory("BOM", id || "");
  const [showProductionDialog, setShowProductionDialog] = useState(false);
  const [productionStep, setProductionStep] = useState(1);
  const [operations, setOperations] = useState<ProductionOperation[]>(defaultOperations);
  const [productionData, setProductionData] = useState({
    quantity: 1,
    priority: "MEDIUM",
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: "",
    notes: "",
    reserveMaterial: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!apiBom) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/bom"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Stückliste nicht gefunden</h1>
            <p className="text-muted-foreground">Die angeforderte Stückliste existiert nicht.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/bom")}>Zurück</Button>
      </div>
    );
  }

  const bom = apiBom as any;

  const bomData = {
    id: bom.name || bom.id,
    bezeichnung: bom.description || bom.name || "",
    projekt: bom.project?.name || "",
    projektNr: bom.projectId || "",
    status: "aktiv",
    version: "1.0",
    erstelltAm: bom.createdAt ? new Date(bom.createdAt).toLocaleDateString("de-CH") : "",
    geändertAm: "",
    ersteller: "",
    gesamtgewicht: "",
    materialkosten: bom.materialCost || bom.total || 0,
    fertigungszeit: "",
  };

  const positionen: BOMPosition[] = (bom.items || []).map((item: any, idx: number) => ({
    id: String(idx + 1),
    artikelNr: item.productId || `POS-${idx + 1}`,
    bezeichnung: item.description || "",
    einheit: item.unit || "Stk",
    menge: item.quantity || 0,
    einzelpreis: item.unitPrice || 0,
    total: (item.quantity || 0) * (item.unitPrice || 0),
    lagerbestand: 0,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const totalMaterial = positionen.reduce((sum, p) => sum + p.total, 0);
  const mwst = totalMaterial * 0.081;
  const gesamtTotal = totalMaterial + mwst;

  const selectedOperations = operations.filter(op => op.selected);
  const totalProductionHours = selectedOperations.reduce((sum, op) => sum + op.hours, 0);

  // Check material availability
  const materialShortages = positionen.filter(p => p.lagerbestand < p.menge * productionData.quantity);

  const handleToggleOperation = (opId: string) => {
    setOperations(prev => prev.map(op => 
      op.id === opId ? { ...op, selected: !op.selected } : op
    ));
  };

  const handleCreateProductionOrder = () => {
    // Store production order data
    const productionOrderData = {
      bomId: bomData.id,
      bomName: bomData.bezeichnung,
      projekt: bomData.projekt,
      projektNr: bomData.projektNr,
      quantity: productionData.quantity,
      priority: productionData.priority,
      plannedStartDate: productionData.plannedStartDate,
      plannedEndDate: productionData.plannedEndDate,
      notes: productionData.notes,
      operations: selectedOperations.map(op => ({
        name: op.name,
        workstation: op.workstation,
        plannedHours: op.hours * productionData.quantity,
      })),
      materials: positionen.map(p => ({
        artikelNr: p.artikelNr,
        bezeichnung: p.bezeichnung,
        menge: p.menge * productionData.quantity,
        einheit: p.einheit,
        reserved: productionData.reserveMaterial,
      })),
    };
    
    sessionStorage.setItem('productionFromBOM', JSON.stringify(productionOrderData));
    
    toast.success("Werkstattauftrag erstellt", {
      description: `Auftrag für ${productionData.quantity}x ${bomData.bezeichnung}`,
    });
    
    setShowProductionDialog(false);
    setProductionStep(1);
    navigate('/production/new');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/bom">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{bomData.id}</h1>
            <Badge className={statusColors[bomData.status]}>
              {bomData.status.charAt(0).toUpperCase() + bomData.status.slice(1)}
            </Badge>
            <Badge variant="outline">Version {bomData.version}</Badge>
          </div>
          <p className="text-muted-foreground">{bomData.bezeichnung}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PDF Export
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              const calcData = {
                bomId: bomData.id,
                bomName: bomData.bezeichnung,
                projekt: bomData.projekt,
                projektNr: bomData.projektNr,
                materialkosten: totalMaterial,
                fertigungszeit: bomData.fertigungszeit,
                positionen: positionen.map(p => ({
                  artikelNr: p.artikelNr,
                  bezeichnung: p.bezeichnung,
                  menge: p.menge,
                  einheit: p.einheit,
                  einzelpreis: p.einzelpreis,
                  total: p.total,
                })),
              };
              sessionStorage.setItem('calculationFromBOM', JSON.stringify(calcData));
              toast.success("Daten für Kalkulation übernommen");
              navigate('/calculation/new');
            }}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Kalkulation erstellen
          </Button>
          <Button onClick={() => setShowProductionDialog(true)}>
            <Factory className="mr-2 h-4 w-4" />
            Werkstattauftrag
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projekt</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to={`/projects/${bomData.projektNr}`} className="font-medium text-primary hover:underline">
              {bomData.projekt}
            </Link>
            <p className="text-sm text-muted-foreground">{bomData.projektNr}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Materialkosten</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalMaterial)}</p>
            <p className="text-sm text-muted-foreground">exkl. MwSt.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtgewicht</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bomData.gesamtgewicht}</p>
            <p className="text-sm text-muted-foreground">Stahl S235/S355</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fertigungszeit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bomData.fertigungszeit}</p>
            <p className="text-sm text-muted-foreground">geschätzt</p>
          </CardContent>
        </Card>
      </div>

      {/* Positionen */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Stücklistenpositionen</CardTitle>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Position hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Pos.</TableHead>
                <TableHead>Artikel-Nr.</TableHead>
                <TableHead>Bezeichnung</TableHead>
                <TableHead className="text-center">Einheit</TableHead>
                <TableHead className="text-right">Menge</TableHead>
                <TableHead className="text-right">Einzelpreis</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Lager</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positionen.map((pos, index) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{pos.artikelNr}</TableCell>
                  <TableCell>{pos.bezeichnung}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{pos.einheit}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{pos.menge.toLocaleString("de-CH")}</TableCell>
                  <TableCell className="text-right">{formatCurrency(pos.einzelpreis)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(pos.total)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={pos.lagerbestand >= pos.menge ? "outline" : "destructive"}>
                      {pos.lagerbestand.toLocaleString("de-CH")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Zwischensumme</span>
                <span>{formatCurrency(totalMaterial)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">MwSt. 8.1%</span>
                <span>{formatCurrency(mwst)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Gesamttotal</span>
                <span>{formatCurrency(gesamtTotal)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Änderungshistorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground">Erstellt am:</span>
              <span className="ml-2">{bomData.erstelltAm} von {bomData.ersteller}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Letzte Änderung:</span>
              <span className="ml-2">{bomData.geändertAm}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verlauf */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Verlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!auditHistory || auditHistory.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-4">Noch keine Einträge</p>
          ) : (
            <div className="space-y-4">
              {auditHistory.map((log: any, index: number) => (
                <div key={log.id || index} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {log.action === "CREATE" ? "Erstellt" : log.action === "UPDATE" ? "Bearbeitet" : log.action === "DELETE" ? "Gelöscht" : log.action === "SEND" ? "Versendet" : log.action === "APPROVE" ? "Genehmigt" : log.action === "REJECT" ? "Abgelehnt" : log.description || log.action}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(log.createdAt || log.timestamp).toLocaleString("de-CH")}</span>
                      <span>•</span>
                      <span>{log.user ? `${log.user.firstName} ${log.user.lastName}`.trim() : "System"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production Order Dialog */}
      <Dialog open={showProductionDialog} onOpenChange={setShowProductionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Werkstattauftrag aus Stückliste erstellen
            </DialogTitle>
            <DialogDescription>
              Schritt {productionStep} von 3 - {productionStep === 1 ? 'Grunddaten' : productionStep === 2 ? 'Arbeitsgänge' : 'Übersicht'}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  productionStep >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {productionStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
                </div>
                <span className={`text-sm ${productionStep >= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step === 1 ? 'Grunddaten' : step === 2 ? 'Arbeitsgänge' : 'Prüfung'}
                </span>
                {step < 3 && <div className="flex-1 h-px bg-border" />}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Data */}
          {productionStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="font-medium">{bomData.bezeichnung}</p>
                <p className="text-sm text-muted-foreground">{bomData.id} • {bomData.projekt}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Menge</Label>
                  <Input
                    type="number"
                    min={1}
                    value={productionData.quantity}
                    onChange={(e) => setProductionData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorität</Label>
                  <Select
                    value={productionData.priority}
                    onValueChange={(value) => setProductionData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Niedrig</SelectItem>
                      <SelectItem value="MEDIUM">Normal</SelectItem>
                      <SelectItem value="HIGH">Hoch</SelectItem>
                      <SelectItem value="URGENT">Dringend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Geplanter Start</Label>
                  <Input
                    type="date"
                    value={productionData.plannedStartDate}
                    onChange={(e) => setProductionData(prev => ({ ...prev, plannedStartDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Geplantes Ende</Label>
                  <Input
                    type="date"
                    value={productionData.plannedEndDate}
                    onChange={(e) => setProductionData(prev => ({ ...prev, plannedEndDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bemerkungen</Label>
                <Textarea
                  placeholder="Zusätzliche Hinweise für die Produktion..."
                  value={productionData.notes}
                  onChange={(e) => setProductionData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Step 2: Operations */}
          {productionStep === 2 && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Wählen Sie die Arbeitsgänge für diesen Auftrag:
              </p>

              <div className="space-y-2">
                {operations.map((op) => (
                  <div
                    key={op.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      op.selected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleToggleOperation(op.id)}
                  >
                    <Checkbox checked={op.selected} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{op.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{op.workstation}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{op.hours * productionData.quantity} Std.</p>
                      <p className="text-xs text-muted-foreground">{op.hours} Std./Stück</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between p-4 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Gesamte Fertigungszeit:</span>
                <span className="font-bold">{totalProductionHours * productionData.quantity} Stunden</span>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {productionStep === 3 && (
            <div className="space-y-4 py-4">
              {/* Material availability check */}
              {materialShortages.length > 0 && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Materialengpässe</span>
                  </div>
                  <ul className="text-sm space-y-1">
                    {materialShortages.map(m => (
                      <li key={m.id}>
                        {m.bezeichnung}: benötigt {m.menge * productionData.quantity}, verfügbar {m.lagerbestand}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {materialShortages.length === 0 && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Alle Materialien verfügbar</span>
                  </div>
                </div>
              )}

              {/* Summary */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">STÜCKLISTE</p>
                      <p className="font-medium">{bomData.bezeichnung}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">MENGE</p>
                      <p className="font-medium">{productionData.quantity} Stück</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">PRIORITÄT</p>
                      <Badge variant={productionData.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                        {productionData.priority === 'LOW' ? 'Niedrig' : productionData.priority === 'MEDIUM' ? 'Normal' : productionData.priority === 'HIGH' ? 'Hoch' : 'Dringend'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ZEITRAUM</p>
                      <p className="font-medium">{productionData.plannedStartDate} - {productionData.plannedEndDate || 'offen'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">ARBEITSGÄNGE ({selectedOperations.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedOperations.map(op => (
                        <Badge key={op.id} variant="outline">{op.name}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Geschätzte Fertigungszeit:</span>
                    <span className="font-bold">{totalProductionHours * productionData.quantity} Stunden</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={productionData.reserveMaterial}
                  onCheckedChange={(checked) => setProductionData(prev => ({ ...prev, reserveMaterial: !!checked }))}
                />
                <Label className="font-normal">Material für diesen Auftrag reservieren</Label>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {productionStep > 1 && (
              <Button variant="outline" onClick={() => setProductionStep(prev => prev - 1)}>
                Zurück
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={() => { setShowProductionDialog(false); setProductionStep(1); }}>
              Abbrechen
            </Button>
            {productionStep < 3 ? (
              <Button onClick={() => setProductionStep(prev => prev + 1)}>
                Weiter
              </Button>
            ) : (
              <Button onClick={handleCreateProductionOrder}>
                <Factory className="h-4 w-4 mr-2" />
                Auftrag erstellen
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
