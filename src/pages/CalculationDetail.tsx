import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, Clock, Users, Package, Truck, FileText, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useCalculation } from "@/hooks/use-calculations";

const statusColors: Record<string, string> = {
  freigegeben: "bg-success/10 text-success",
  entwurf: "bg-warning/10 text-warning",
  abgelehnt: "bg-destructive/10 text-destructive",
  DRAFT: "bg-warning/10 text-warning",
  FINALIZED: "bg-success/10 text-success",
  CONVERTED: "bg-info/10 text-info",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  FINALIZED: "Freigegeben",
  CONVERTED: "Umgewandelt",
};

export default function CalculationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: calculation, isLoading, error } = useCalculation(id || "");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !calculation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/calculation">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Kalkulation nicht gefunden</h1>
            <p className="text-muted-foreground">Die angeforderte Kalkulation existiert nicht.</p>
          </div>
        </div>
        <Button onClick={() => navigate("/calculation")}>Zurück zu Kalkulationen</Button>
      </div>
    );
  }

  const calc = calculation as any;

  // Map API data to display
  const kalkulationData = {
    id: calc.number || calc.id,
    bezeichnung: calc.name || "",
    projekt: calc.project?.name || "",
    projektNr: calc.projectId || "",
    kunde: calc.customer?.name || "",
    status: calc.status || "DRAFT",
    erstelltAm: calc.createdAt ? new Date(calc.createdAt).toLocaleDateString("de-CH") : "",
    gültigBis: "",
    ersteller: "",
    gewinnmarge: calc.margin || 0,
  };

  // Map items by type
  const materialItems = (calc.items || []).filter((i: any) => i.type === "MATERIAL");
  const laborItems = (calc.items || []).filter((i: any) => i.type === "LABOR");
  const otherItems = (calc.items || []).filter((i: any) => !["MATERIAL", "LABOR"].includes(i.type));

  const materialkosten = materialItems.map((i: any) => ({
    kategorie: i.description,
    betrag: (i.quantity || 0) * (i.unitPrice || 0),
  }));

  const fertigungskosten = laborItems.map((i: any) => ({
    arbeitsgang: i.description,
    stunden: i.quantity || 0,
    stundensatz: i.unitPrice || 0,
    total: (i.quantity || 0) * (i.unitPrice || 0),
  }));

  const montagekosten = otherItems.map((i: any) => ({
    position: i.description,
    einheit: i.unit || "Stk",
    menge: i.quantity || 0,
    satz: i.unitPrice || 0,
    total: (i.quantity || 0) * (i.unitPrice || 0),
  }));

  const totalMaterial = calc.materialCost || materialkosten.reduce((sum: number, m: any) => sum + m.betrag, 0);
  const totalFertigung = calc.laborCost || fertigungskosten.reduce((sum: number, f: any) => sum + f.total, 0);
  const totalMontage = calc.machineCost || montagekosten.reduce((sum: number, m: any) => sum + m.total, 0);
  const totalStunden = fertigungskosten.reduce((sum: number, f: any) => sum + f.stunden, 0);

  const selbstkosten = calc.subtotal || (totalMaterial + totalFertigung + totalMontage);
  const gewinn = selbstkosten * (kalkulationData.gewinnmarge / 100);
  const nettopreis = calc.total || (selbstkosten + gewinn);
  const mwst = nettopreis * 0.081;
  const bruttopreis = nettopreis + mwst;

  const statusKey = kalkulationData.status;
  const displayStatus = statusLabels[statusKey] || statusKey;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/calculation">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{kalkulationData.id}</h1>
            <Badge className={statusColors[statusKey] || "bg-muted text-muted-foreground"}>
              {displayStatus}
            </Badge>
          </div>
          <p className="text-muted-foreground">{kalkulationData.bezeichnung}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PDF Export
          </Button>
          <Button onClick={() => navigate(`/quotes/new?calculationId=${calc.id}`)}>
            Angebot erstellen
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(totalMaterial)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Fertigung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(totalFertigung)}</p>
            <p className="text-xs text-muted-foreground">{totalStunden} Std.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Montage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{formatCurrency(totalMontage)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Marge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{kalkulationData.gewinnmarge}%</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(gewinn)}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Angebotspreis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-primary">{formatCurrency(bruttopreis)}</p>
            <p className="text-xs text-muted-foreground">inkl. 8.1% MwSt.</p>
          </CardContent>
        </Card>
      </div>

      {/* Material */}
      {materialkosten.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Materialkosten</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategorie</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialkosten.map((m: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{m.kategorie}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(m.betrag)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Total Material</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalMaterial)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Fertigung */}
      {fertigungskosten.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Fertigungskosten (Werkstatt)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arbeitsgang</TableHead>
                  <TableHead className="text-right">Stunden</TableHead>
                  <TableHead className="text-right">Stundensatz</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fertigungskosten.map((f: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{f.arbeitsgang}</TableCell>
                    <TableCell className="text-right">{f.stunden}</TableCell>
                    <TableCell className="text-right">{formatCurrency(f.stundensatz)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(f.total)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Total Fertigung</TableCell>
                  <TableCell className="text-right font-bold">{totalStunden} Std.</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalFertigung)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Montage */}
      {montagekosten.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Montagekosten (Baustelle)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-center">Einheit</TableHead>
                  <TableHead className="text-right">Menge</TableHead>
                  <TableHead className="text-right">Satz CHF</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {montagekosten.map((m: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{m.position}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{m.einheit}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{m.menge}</TableCell>
                    <TableCell className="text-right">{formatCurrency(m.satz)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(m.total)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-bold">Total Montage</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalMontage)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Kalkulation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Kalkulationsübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Materialkosten</span>
              <span>{formatCurrency(totalMaterial)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fertigungskosten</span>
              <span>{formatCurrency(totalFertigung)}</span>
            </div>
            <div className="flex justify-between">
              <span>Montagekosten</span>
              <span>{formatCurrency(totalMontage)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Selbstkosten</span>
              <span>{formatCurrency(selbstkosten)}</span>
            </div>
            <div className="flex justify-between text-success">
              <span>Gewinnzuschlag ({kalkulationData.gewinnmarge}%)</span>
              <span>+ {formatCurrency(gewinn)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Nettopreis</span>
              <span>{formatCurrency(nettopreis)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>MwSt. 8.1%</span>
              <span>{formatCurrency(mwst)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Angebotspreis (brutto)</span>
              <span className="text-primary">{formatCurrency(bruttopreis)}</span>
            </div>
          </div>

          {/* Kostenverteilung */}
          {selbstkosten > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Kostenverteilung</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Material</span>
                  <span>{Math.round((totalMaterial / selbstkosten) * 100)}%</span>
                </div>
                <Progress value={(totalMaterial / selbstkosten) * 100} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Fertigung</span>
                  <span>{Math.round((totalFertigung / selbstkosten) * 100)}%</span>
                </div>
                <Progress value={(totalFertigung / selbstkosten) * 100} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Montage</span>
                  <span>{Math.round((totalMontage / selbstkosten) * 100)}%</span>
                </div>
                <Progress value={(totalMontage / selbstkosten) * 100} className="h-2" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meta */}
      <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
        <div>Erstellt am {kalkulationData.erstelltAm} {kalkulationData.ersteller && `von ${kalkulationData.ersteller}`}</div>
        {kalkulationData.gültigBis && <div className="text-right">Gültig bis {kalkulationData.gültigBis}</div>}
      </div>
    </div>
  );
}
