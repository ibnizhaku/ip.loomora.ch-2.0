import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Layers, Calculator, FileText, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

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

const bomData = {
  id: "STL-2024-0042",
  bezeichnung: "Stahlkonstruktion Hallendach 12x24m",
  projekt: "Industriehalle Müller AG",
  projektNr: "PRJ-2024-0015",
  status: "aktiv",
  version: "2.1",
  erstelltAm: "15.01.2024",
  geändertAm: "28.01.2024",
  ersteller: "Thomas Meier",
  gesamtgewicht: "4'850 kg",
  materialkosten: 28450.00,
  fertigungszeit: "42 Std.",
};

const positionen: BOMPosition[] = [
  { id: "1", artikelNr: "ST-HEA-200", bezeichnung: "HEA 200 Träger S355", einheit: "lfm", menge: 96, einzelpreis: 85.50, total: 8208.00, lagerbestand: 120 },
  { id: "2", artikelNr: "ST-IPE-180", bezeichnung: "IPE 180 Pfetten S235", einheit: "lfm", menge: 144, einzelpreis: 52.30, total: 7531.20, lagerbestand: 200 },
  { id: "3", artikelNr: "ST-ROR-100", bezeichnung: "Rohr 100x100x5 S355", einheit: "lfm", menge: 48, einzelpreis: 68.00, total: 3264.00, lagerbestand: 85 },
  { id: "4", artikelNr: "ST-BLE-8", bezeichnung: "Stahlblech 8mm S235", einheit: "m²", menge: 24, einzelpreis: 142.00, total: 3408.00, lagerbestand: 45 },
  { id: "5", artikelNr: "ST-WIN-80", bezeichnung: "Winkelstahl 80x80x8", einheit: "lfm", menge: 36, einzelpreis: 28.50, total: 1026.00, lagerbestand: 150 },
  { id: "6", artikelNr: "VB-M16-HV", bezeichnung: "HV-Schrauben M16x60 10.9", einheit: "Stk", menge: 480, einzelpreis: 2.85, total: 1368.00, lagerbestand: 2500 },
  { id: "7", artikelNr: "VB-M20-HV", bezeichnung: "HV-Schrauben M20x80 10.9", einheit: "Stk", menge: 192, einzelpreis: 4.20, total: 806.40, lagerbestand: 1200 },
  { id: "8", artikelNr: "ZB-ANKER", bezeichnung: "Fundamentanker M24 verzinkt", einheit: "Stk", menge: 32, einzelpreis: 48.50, total: 1552.00, lagerbestand: 64 },
];

const statusColors: Record<string, string> = {
  aktiv: "bg-success/10 text-success",
  entwurf: "bg-warning/10 text-warning",
  archiviert: "bg-muted text-muted-foreground",
};

export default function BOMDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const totalMaterial = positionen.reduce((sum, p) => sum + p.total, 0);
  const mwst = totalMaterial * 0.081;
  const gesamtTotal = totalMaterial + mwst;

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
              // Store BOM data in sessionStorage for calculation page
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
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
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
    </div>
  );
}
