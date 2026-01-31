import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Receipt, Car, Train, Hotel, Utensils, FileText, CheckCircle2, Clock, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const spesenData = {
  id: "SP-2024-0067",
  mitarbeiter: "Peter Schneider",
  personalNr: "MA-0012",
  abteilung: "Verkauf",
  projekt: "Kundentermine Bern/Basel",
  projektNr: "PRJ-2024-0018",
  status: "eingereicht",
  zeitraum: "22.01.2024 - 24.01.2024",
  eingereichtAm: "25.01.2024",
  gesamtbetrag: 542.60,
};

const positionen = [
  { id: 1, datum: "22.01.2024", kategorie: "Fahrt", beschreibung: "Zürich - Bern (Geschäftsfahrzeug)", einheit: "km", menge: 125, satz: 0.70, betrag: 87.50, beleg: true },
  { id: 2, datum: "22.01.2024", kategorie: "Verpflegung", beschreibung: "Mittagessen Kunde Bern", einheit: "Pauschale", menge: 1, satz: 32.00, betrag: 32.00, beleg: true },
  { id: 3, datum: "22.01.2024", kategorie: "Übernachtung", beschreibung: "Hotel Schweizerhof Bern", einheit: "Nacht", menge: 1, satz: 145.00, betrag: 145.00, beleg: true },
  { id: 4, datum: "23.01.2024", kategorie: "Fahrt", beschreibung: "Bern - Basel (Zug 1. Klasse)", einheit: "Ticket", menge: 1, satz: 68.00, betrag: 68.00, beleg: true },
  { id: 5, datum: "23.01.2024", kategorie: "Verpflegung", beschreibung: "Mittagessen Kunde Basel", einheit: "Pauschale", menge: 1, satz: 32.00, betrag: 32.00, beleg: true },
  { id: 6, datum: "23.01.2024", kategorie: "Übernachtung", beschreibung: "Hotel Euler Basel", einheit: "Nacht", menge: 1, satz: 138.00, betrag: 138.00, beleg: true },
  { id: 7, datum: "24.01.2024", kategorie: "Fahrt", beschreibung: "Basel - Zürich (Zug 1. Klasse)", einheit: "Ticket", menge: 1, satz: 40.10, betrag: 40.10, beleg: true },
];

const kategorieIcons: Record<string, any> = {
  Fahrt: Car,
  Verpflegung: Utensils,
  Übernachtung: Hotel,
  Zug: Train,
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  entwurf: { label: "Entwurf", color: "bg-muted text-muted-foreground", icon: Clock },
  eingereicht: { label: "Eingereicht", color: "bg-info/10 text-info", icon: Clock },
  genehmigt: { label: "Genehmigt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  ausbezahlt: { label: "Ausbezahlt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  abgelehnt: { label: "Abgelehnt", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

// GAV Metallbau Spesenansätze
const gavSätze = {
  kmPauschale: 0.70,
  mittagessen: 32.00,
  übernachtungMax: 150.00,
};

export default function TravelExpenseDetail() {
  const { id } = useParams();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const StatusIcon = statusConfig[spesenData.status].icon;
  const totalBetrag = positionen.reduce((sum, p) => sum + p.betrag, 0);

  const kategorienSummen = positionen.reduce((acc, p) => {
    acc[p.kategorie] = (acc[p.kategorie] || 0) + p.betrag;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/travel-expenses">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{spesenData.id}</h1>
            <Badge className={statusConfig[spesenData.status].color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[spesenData.status].label}
            </Badge>
          </div>
          <p className="text-muted-foreground">{spesenData.projekt}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          {spesenData.status === "eingereicht" && (
            <Button>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Genehmigen
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtbetrag</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalBetrag)}</p>
          </CardContent>
        </Card>
        {Object.entries(kategorienSummen).map(([kat, sum]) => {
          const Icon = kategorieIcons[kat] || Receipt;
          return (
            <Card key={kat}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {kat}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{formatCurrency(sum)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mitarbeiter & Projekt */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mitarbeiter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>PS</AvatarFallback>
              </Avatar>
              <div>
                <Link to={`/hr/${spesenData.personalNr}`} className="font-medium text-primary hover:underline">
                  {spesenData.mitarbeiter}
                </Link>
                <p className="text-sm text-muted-foreground">{spesenData.personalNr} • {spesenData.abteilung}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reisedaten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Zeitraum</p>
                <p className="font-medium">{spesenData.zeitraum}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Projekt</p>
                <Link to={`/projects/${spesenData.projektNr}`} className="text-primary hover:underline">
                  {spesenData.projektNr}
                </Link>
              </div>
              <div>
                <p className="text-muted-foreground">Eingereicht am</p>
                <p className="font-medium">{spesenData.eingereichtAm}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positionen */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Spesenpositionen</CardTitle>
          </div>
          <Button size="sm" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Beleg hochladen
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead className="text-center">Menge</TableHead>
                <TableHead className="text-right">Satz CHF</TableHead>
                <TableHead className="text-right">Betrag CHF</TableHead>
                <TableHead className="text-center">Beleg</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positionen.map((p) => {
                const Icon = kategorieIcons[p.kategorie] || Receipt;
                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.datum}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{p.kategorie}</span>
                      </div>
                    </TableCell>
                    <TableCell>{p.beschreibung}</TableCell>
                    <TableCell className="text-center">
                      {p.menge} {p.einheit !== "Pauschale" && p.einheit !== "Ticket" && p.einheit !== "Nacht" ? p.einheit : ""}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(p.satz)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(p.betrag)}</TableCell>
                    <TableCell className="text-center">
                      {p.beleg ? (
                        <Badge className="bg-success/10 text-success">
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <Badge variant="outline">Fehlt</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={5} className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totalBetrag)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* GAV Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Spesenansätze (GAV Metallbau Schweiz)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Kilometerentschädigung:</span>
              <Badge variant="outline">{formatCurrency(gavSätze.kmPauschale)}/km</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Mittagessen:</span>
              <Badge variant="outline">{formatCurrency(gavSätze.mittagessen)}/Tag</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Hotel className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Übernachtung max.:</span>
              <Badge variant="outline">{formatCurrency(gavSätze.übernachtungMax)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
