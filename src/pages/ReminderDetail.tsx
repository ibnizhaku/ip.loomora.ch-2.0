import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Mail, FileText, Clock, CheckCircle2, Send, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const mahnungData = {
  id: "MA-2024-0056",
  kunde: "Bau & Partner AG",
  kundenNr: "KD-2024-0023",
  mahnstufe: 2,
  status: "versendet",
  erstelltAm: "25.01.2024",
  versendetAm: "25.01.2024",
  fälligBis: "08.02.2024",
  // Beträge
  offenerBetrag: 15680.00,
  mahngebühr: 50.00,
  verzugszins: 78.40,
  gesamtforderung: 15808.40,
  // Zinsen
  zinssatz: 5.0,
  verzugstage: 36,
};

const offeneRechnungen = [
  { nr: "RE-2024-0089", datum: "15.12.2023", fällig: "14.01.2024", betrag: 8450.00, verzugstage: 42, zins: 48.55 },
  { nr: "RE-2024-0102", datum: "28.12.2023", fällig: "27.01.2024", betrag: 7230.00, verzugstage: 29, zins: 29.85 },
];

const mahnhistorie = [
  { stufe: 1, datum: "15.01.2024", betrag: 15680.00, gebühr: 0, status: "versendet" },
  { stufe: 2, datum: "25.01.2024", betrag: 15680.00, gebühr: 50.00, status: "versendet" },
];

const mahnstufen = [
  { stufe: 1, bezeichnung: "Zahlungserinnerung", frist: 10, gebühr: 0 },
  { stufe: 2, bezeichnung: "1. Mahnung", frist: 10, gebühr: 50 },
  { stufe: 3, bezeichnung: "2. Mahnung (letzte)", frist: 10, gebühr: 100 },
];

const statusColors: Record<string, string> = {
  entwurf: "bg-muted text-muted-foreground",
  versendet: "bg-success/10 text-success",
  bezahlt: "bg-info/10 text-info",
  inkasso: "bg-destructive/10 text-destructive",
};

export default function ReminderDetail() {
  const { id } = useParams();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const currentStufe = mahnstufen.find(s => s.stufe === mahnungData.mahnstufe);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/reminders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{mahnungData.id}</h1>
            <Badge className={statusColors[mahnungData.status]}>
              {mahnungData.status.charAt(0).toUpperCase() + mahnungData.status.slice(1)}
            </Badge>
            <Badge className="bg-warning/10 text-warning">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Mahnstufe {mahnungData.mahnstufe}
            </Badge>
          </div>
          <p className="text-muted-foreground">{currentStufe?.bezeichnung} - {mahnungData.kunde}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Per E-Mail
          </Button>
          {mahnungData.mahnstufe < 3 && (
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Nächste Stufe
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offener Betrag</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(mahnungData.offenerBetrag)}</p>
            <p className="text-sm text-muted-foreground">Hauptforderung</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mahngebühr</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(mahnungData.mahngebühr)}</p>
            <p className="text-sm text-muted-foreground">Stufe {mahnungData.mahnstufe}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verzugszins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(mahnungData.verzugszins)}</p>
            <p className="text-sm text-muted-foreground">{mahnungData.zinssatz}% p.a.</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtforderung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(mahnungData.gesamtforderung)}</p>
            <p className="text-sm text-muted-foreground">inkl. Gebühren & Zins</p>
          </CardContent>
        </Card>
      </div>

      {/* Kunde & Frist */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schuldner</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to={`/customers/${mahnungData.kundenNr}`} className="text-xl font-bold text-primary hover:underline">
              {mahnungData.kunde}
            </Link>
            <p className="text-muted-foreground">{mahnungData.kundenNr}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Zahlungsfrist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold">{mahnungData.fälligBis}</p>
                <p className="text-sm text-muted-foreground">Frist für Zahlung</p>
              </div>
              <Badge variant="outline" className="ml-auto">
                <Clock className="mr-1 h-3 w-3" />
                {mahnungData.verzugstage} Tage Verzug
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offene Rechnungen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Offene Rechnungen</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rechnung</TableHead>
                <TableHead>Rechnungsdatum</TableHead>
                <TableHead>Fällig am</TableHead>
                <TableHead className="text-center">Verzugstage</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead className="text-right">Verzugszins</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offeneRechnungen.map((r) => (
                <TableRow key={r.nr}>
                  <TableCell>
                    <Link to={`/invoices/${r.nr}`} className="text-primary hover:underline font-medium">
                      {r.nr}
                    </Link>
                  </TableCell>
                  <TableCell>{r.datum}</TableCell>
                  <TableCell>{r.fällig}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-warning">{r.verzugstage}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(r.betrag)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(r.zins)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={4} className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(offeneRechnungen.reduce((s, r) => s + r.betrag, 0))}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(offeneRechnungen.reduce((s, r) => s + r.zins, 0))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Berechnung */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Forderungsberechnung</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <div className="flex justify-between">
              <span>Offene Rechnungen</span>
              <span>{formatCurrency(mahnungData.offenerBetrag)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>+ Mahngebühr Stufe {mahnungData.mahnstufe}</span>
              <span>{formatCurrency(mahnungData.mahngebühr)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>+ Verzugszins ({mahnungData.zinssatz}% p.a.)</span>
              <span>{formatCurrency(mahnungData.verzugszins)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Gesamtforderung</span>
              <span className="text-destructive">{formatCurrency(mahnungData.gesamtforderung)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mahnhistorie */}
      <Card>
        <CardHeader>
          <CardTitle>Mahnverlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stufe</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Hauptforderung</TableHead>
                <TableHead className="text-right">Gebühr</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mahnhistorie.map((h) => (
                <TableRow key={h.stufe}>
                  <TableCell>
                    <Badge variant="outline">Stufe {h.stufe}</Badge>
                  </TableCell>
                  <TableCell>{h.datum}</TableCell>
                  <TableCell className="text-right">{formatCurrency(h.betrag)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(h.gebühr)}</TableCell>
                  <TableCell>
                    <Badge className="bg-success/10 text-success">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {h.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
