import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calculator, Clock, Users, Package, Truck, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const kalkulationData = {
  id: "KALK-2024-0089",
  bezeichnung: "Stahlkonstruktion Industriehalle",
  projekt: "Industriehalle Müller AG",
  projektNr: "PRJ-2024-0015",
  kunde: "Müller Industrie AG",
  status: "freigegeben",
  erstelltAm: "12.01.2024",
  gültigBis: "12.04.2024",
  ersteller: "Peter Schneider",
  gewinnmarge: 12,
};

const materialkosten = [
  { kategorie: "Stahlprofile (HEA, IPE, ROR)", betrag: 18739.20 },
  { kategorie: "Stahlbleche", betrag: 3408.00 },
  { kategorie: "Verbindungsmittel (HV-Schrauben)", betrag: 3726.40 },
  { kategorie: "Beschichtung / Korrosionsschutz", betrag: 4200.00 },
  { kategorie: "Kleinmaterial", betrag: 850.00 },
];

const fertigungskosten = [
  { arbeitsgang: "Zuschnitt / Sägen", stunden: 8, stundensatz: 95, total: 760 },
  { arbeitsgang: "CNC-Bohren", stunden: 6, stundensatz: 110, total: 660 },
  { arbeitsgang: "Schweissen", stunden: 24, stundensatz: 105, total: 2520 },
  { arbeitsgang: "Schlossern / Montage", stunden: 16, stundensatz: 95, total: 1520 },
  { arbeitsgang: "Oberflächenbehandlung", stunden: 12, stundensatz: 85, total: 1020 },
  { arbeitsgang: "Qualitätskontrolle", stunden: 4, stundensatz: 95, total: 380 },
];

const montagekosten = [
  { position: "Baustellenmontage", einheit: "Std.", menge: 32, satz: 115, total: 3680 },
  { position: "Kranarbeiten", einheit: "Std.", menge: 8, satz: 180, total: 1440 },
  { position: "Anfahrt / Transport", einheit: "km", menge: 85, satz: 2.80, total: 238 },
  { position: "Spesen (Verpflegung)", einheit: "Tag", menge: 4, satz: 32, total: 128 },
  { position: "Übernachtung", einheit: "Nacht", menge: 3, satz: 150, total: 450 },
];

const statusColors: Record<string, string> = {
  freigegeben: "bg-success/10 text-success",
  entwurf: "bg-warning/10 text-warning",
  abgelehnt: "bg-destructive/10 text-destructive",
};

export default function CalculationDetail() {
  const { id } = useParams();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const totalMaterial = materialkosten.reduce((sum, m) => sum + m.betrag, 0);
  const totalFertigung = fertigungskosten.reduce((sum, f) => sum + f.total, 0);
  const totalMontage = montagekosten.reduce((sum, m) => sum + m.total, 0);
  const totalStunden = fertigungskosten.reduce((sum, f) => sum + f.stunden, 0);

  const selbstkosten = totalMaterial + totalFertigung + totalMontage;
  const gewinn = selbstkosten * (kalkulationData.gewinnmarge / 100);
  const nettopreis = selbstkosten + gewinn;
  const mwst = nettopreis * 0.081;
  const bruttopreis = nettopreis + mwst;

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
            <Badge className={statusColors[kalkulationData.status]}>
              {kalkulationData.status.charAt(0).toUpperCase() + kalkulationData.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">{kalkulationData.bezeichnung}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PDF Export
          </Button>
          <Button>
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
              {materialkosten.map((m, i) => (
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

      {/* Fertigung */}
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
              {fertigungskosten.map((f, i) => (
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

      {/* Montage */}
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
              {montagekosten.map((m, i) => (
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
        </CardContent>
      </Card>

      {/* Meta */}
      <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
        <div>Erstellt am {kalkulationData.erstelltAm} von {kalkulationData.ersteller}</div>
        <div className="text-right">Gültig bis {kalkulationData.gültigBis}</div>
      </div>
    </div>
  );
}
