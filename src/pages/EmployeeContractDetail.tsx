import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, User, Calendar, Banknote, Clock, Shield, Building2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const vertragData = {
  id: "AV-2024-0089",
  mitarbeiter: "Marco Brunner",
  personalNr: "MA-0045",
  position: "Metallbauer EFZ",
  abteilung: "Produktion",
  vorgesetzter: "Thomas Meier",
  vertragsart: "Unbefristet",
  status: "aktiv",
  eintrittsdatum: "01.03.2022",
  probezeit: "3 Monate (bis 31.05.2022)",
  kündigungsfrist: "2 Monate",
  arbeitsort: "Werkstatt Zürich",
  // GAV Metallbau Schweiz
  gav: "GAV Metallbau Schweiz",
  lohnklasse: "C",
  lohnklasseBeschreibung: "Facharbeiter mit EFZ",
  // Arbeitszeit gemäss GAV
  wochenarbeitszeit: 42.5,
  jahresarbeitszeit: 2212,
  // Lohn
  monatslohn: 5400,
  stundenlohn: 30.42,
  tage13: true,
  // Ferien & Feiertage
  ferienanspruch: 25,
  feiertage: 9,
  // Sozialversicherungen CH
  ahvNr: "756.1234.5678.90",
};

const sozialversicherungen = [
  { bezeichnung: "AHV/IV/EO", arbeitgeber: 5.3, arbeitnehmer: 5.3, basis: "Bruttolohn" },
  { bezeichnung: "ALV", arbeitgeber: 1.1, arbeitnehmer: 1.1, basis: "bis CHF 148'200" },
  { bezeichnung: "ALV 2 (Solidaritätsbeitrag)", arbeitgeber: 0.5, arbeitnehmer: 0.5, basis: "ab CHF 148'200" },
  { bezeichnung: "BVG (Pensionskasse)", arbeitgeber: 7.0, arbeitnehmer: 7.0, basis: "Koordinierter Lohn" },
  { bezeichnung: "UVG (Berufsunfall)", arbeitgeber: 0.67, arbeitnehmer: 0, basis: "Bruttolohn" },
  { bezeichnung: "UVG (Nichtberufsunfall)", arbeitgeber: 0, arbeitnehmer: 1.28, basis: "Bruttolohn" },
  { bezeichnung: "KTG (Krankentaggeld)", arbeitgeber: 0.5, arbeitnehmer: 0.5, basis: "Bruttolohn" },
  { bezeichnung: "FAK (Familienausgleichskasse)", arbeitgeber: 1.2, arbeitnehmer: 0, basis: "Bruttolohn" },
];

const spesen = [
  { bezeichnung: "Kilometerentschädigung", betrag: "CHF 0.70/km", bemerkung: "Privatfahrzeug für Geschäftsfahrten" },
  { bezeichnung: "Mittagessen (auswärts)", betrag: "CHF 32.00/Tag", bemerkung: "bei Montagearbeiten" },
  { bezeichnung: "Übernachtung", betrag: "effektiv bis CHF 150.00", bemerkung: "mit Beleg" },
  { bezeichnung: "Werkzeugentschädigung", betrag: "CHF 50.00/Monat", bemerkung: "gemäss GAV" },
];

const statusColors: Record<string, string> = {
  aktiv: "bg-success/10 text-success",
  gekündigt: "bg-warning/10 text-warning",
  beendet: "bg-muted text-muted-foreground",
  entwurf: "bg-info/10 text-info",
};

const lohnklassenBeschreibung: Record<string, string> = {
  A: "Angelernte Mitarbeiter",
  B: "Anlernpersonal mit Erfahrung",
  C: "Facharbeiter mit EFZ",
  D: "Facharbeiter mit Spezialausbildung",
  E: "Gruppenleiter / Vorarbeiter",
  F: "Werkstattleiter / Polier",
};

export default function EmployeeContractDetail() {
  const { id } = useParams();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const jahreslohn = vertragData.monatslohn * (vertragData.tage13 ? 13 : 12);
  const agAbzüge = sozialversicherungen.reduce((sum, s) => sum + s.arbeitgeber, 0);
  const anAbzüge = sozialversicherungen.reduce((sum, s) => sum + s.arbeitnehmer, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/employee-contracts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">Arbeitsvertrag</h1>
            <Badge className={statusColors[vertragData.status]}>
              {vertragData.status.charAt(0).toUpperCase() + vertragData.status.slice(1)}
            </Badge>
            <Badge variant="outline">{vertragData.vertragsart}</Badge>
          </div>
          <p className="text-muted-foreground">{vertragData.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PDF Export
          </Button>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
        </div>
      </div>

      {/* Mitarbeiter Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Mitarbeiter</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {vertragData.mitarbeiter.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Link to={`/hr/${vertragData.personalNr}`} className="text-xl font-bold text-primary hover:underline">
                {vertragData.mitarbeiter}
              </Link>
              <p className="text-muted-foreground">{vertragData.personalNr}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{vertragData.position}</p>
              <p className="text-sm text-muted-foreground">{vertragData.abteilung}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vertragsdaten */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Eintrittsdatum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vertragData.eintrittsdatum}</p>
            <p className="text-sm text-muted-foreground">Probezeit: {vertragData.probezeit}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Arbeitszeit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vertragData.wochenarbeitszeit} Std./Woche</p>
            <p className="text-sm text-muted-foreground">{vertragData.jahresarbeitszeit.toLocaleString("de-CH")} Std./Jahr</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Arbeitsort
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{vertragData.arbeitsort}</p>
            <p className="text-sm text-muted-foreground">Kündigungsfrist: {vertragData.kündigungsfrist}</p>
          </CardContent>
        </Card>
      </div>

      {/* GAV & Lohn */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Entlöhnung (GAV Metallbau Schweiz)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Lohnklasse</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary text-lg px-3">
                    Klasse {vertragData.lohnklasse}
                  </Badge>
                  <span>{vertragData.lohnklasseBeschreibung}</span>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monatslohn (brutto)</p>
                  <p className="text-2xl font-bold">{formatCurrency(vertragData.monatslohn)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stundenlohn</p>
                  <p className="text-2xl font-bold">{formatCurrency(vertragData.stundenlohn)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jahreslohn</p>
                <p className="text-xl font-bold">
                  {formatCurrency(jahreslohn)}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({vertragData.tage13 ? "13 Monatslöhne" : "12 Monatslöhne"})
                  </span>
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Ferienanspruch</p>
                <p className="text-xl font-bold">{vertragData.ferienanspruch} Tage</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bezahlte Feiertage</p>
                <p className="text-xl font-bold">{vertragData.feiertage} Tage</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">AHV-Nummer</p>
                <p className="font-mono">{vertragData.ahvNr}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sozialversicherungen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Sozialversicherungen (Schweiz)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Versicherung</TableHead>
                <TableHead className="text-right">AG-Anteil %</TableHead>
                <TableHead className="text-right">AN-Anteil %</TableHead>
                <TableHead>Bemessungsgrundlage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sozialversicherungen.map((sv, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{sv.bezeichnung}</TableCell>
                  <TableCell className="text-right">{sv.arbeitgeber > 0 ? `${sv.arbeitgeber}%` : "-"}</TableCell>
                  <TableCell className="text-right">{sv.arbeitnehmer > 0 ? `${sv.arbeitnehmer}%` : "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{sv.basis}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-bold">Total Abzüge</TableCell>
                <TableCell className="text-right font-bold">{agAbzüge.toFixed(2)}%</TableCell>
                <TableCell className="text-right font-bold">{anAbzüge.toFixed(2)}%</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Spesen */}
      <Card>
        <CardHeader>
          <CardTitle>Spesenregelung (GAV Metallbau)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bezeichnung</TableHead>
                <TableHead>Ansatz</TableHead>
                <TableHead>Bemerkung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spesen.map((sp, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{sp.bezeichnung}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sp.betrag}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sp.bemerkung}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
