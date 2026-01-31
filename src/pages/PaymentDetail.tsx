import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Banknote, Building2, FileText, CheckCircle2, Clock, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const zahlungData = {
  id: "ZA-2024-0234",
  typ: "Kreditorenzahlung",
  datum: "29.01.2024",
  valuta: "30.01.2024",
  status: "ausgeführt",
  betrag: 12450.00,
  währung: "CHF",
  zahlungsart: "SEPA-Überweisung",
  referenz: "INV-2024-EK-0089",
  verwendungszweck: "Lieferantenrechnung Stahlprofile Januar 2024",
  // Empfänger
  empfänger: "Stahl Müller AG",
  empfängerKonto: "CH93 0076 2011 6238 5295 7",
  empfängerBank: "Zürcher Kantonalbank",
  empfängerBIC: "ZKBKCHZZ80A",
  // Absender
  absenderKonto: "CH12 0483 5012 3456 7800 0",
  absenderBank: "Credit Suisse",
  // Buchung
  buchungNr: "BU-2024-0891",
  sollKonto: "2000",
  sollBezeichnung: "Kreditoren CHF",
  habenKonto: "1020",
  habenBezeichnung: "Bank Credit Suisse",
};

const zugehörigeRechnungen = [
  { nr: "ER-2024-0089", datum: "15.01.2024", lieferant: "Stahl Müller AG", betrag: 12450.00, status: "bezahlt" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  entwurf: { label: "Entwurf", color: "bg-muted text-muted-foreground", icon: Clock },
  freigegeben: { label: "Freigegeben", color: "bg-info/10 text-info", icon: CheckCircle2 },
  ausgeführt: { label: "Ausgeführt", color: "bg-success/10 text-success", icon: CheckCircle2 },
  fehlgeschlagen: { label: "Fehlgeschlagen", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

export default function PaymentDetail() {
  const { id } = useParams();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const StatusIcon = statusConfig[zahlungData.status].icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/payments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{zahlungData.id}</h1>
            <Badge className={statusConfig[zahlungData.status].color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[zahlungData.status].label}
            </Badge>
            <Badge variant="outline">{zahlungData.typ}</Badge>
          </div>
          <p className="text-muted-foreground">{zahlungData.verwendungszweck}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Beleg
          </Button>
        </div>
      </div>

      {/* Betrag Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Zahlungsbetrag</p>
              <p className="text-4xl font-bold text-primary">{formatCurrency(zahlungData.betrag)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valutadatum</p>
              <p className="text-xl font-medium">{zahlungData.valuta}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zahlungsdetails */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Empfänger */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Empfänger</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium text-lg">{zahlungData.empfänger}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IBAN</p>
              <p className="font-mono">{zahlungData.empfängerKonto}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bank</p>
                <p>{zahlungData.empfängerBank}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">BIC/SWIFT</p>
                <p className="font-mono">{zahlungData.empfängerBIC}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Absender */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Absender (Eigenes Konto)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">IBAN</p>
              <p className="font-mono">{zahlungData.absenderKonto}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bank</p>
              <p>{zahlungData.absenderBank}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Zahlungsart</p>
              <Badge variant="outline">{zahlungData.zahlungsart}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buchung */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Buchhaltung (Schweizer KMU-Kontenrahmen)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-muted-foreground">Buchung:</span>
            <Link to={`/journal-entries/${zahlungData.buchungNr}`} className="text-primary hover:underline">
              {zahlungData.buchungNr}
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seite</TableHead>
                <TableHead>Konto</TableHead>
                <TableHead>Bezeichnung</TableHead>
                <TableHead className="text-right">Betrag CHF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Soll</TableCell>
                <TableCell className="font-mono">{zahlungData.sollKonto}</TableCell>
                <TableCell>{zahlungData.sollBezeichnung}</TableCell>
                <TableCell className="text-right">{formatCurrency(zahlungData.betrag)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Haben</TableCell>
                <TableCell className="font-mono">{zahlungData.habenKonto}</TableCell>
                <TableCell>{zahlungData.habenBezeichnung}</TableCell>
                <TableCell className="text-right">{formatCurrency(zahlungData.betrag)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Zugehörige Rechnungen */}
      <Card>
        <CardHeader>
          <CardTitle>Zugehörige Einkaufsrechnungen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rechnung</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Lieferant</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zugehörigeRechnungen.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Link to={`/purchase-invoices/${r.nr}`} className="text-primary hover:underline font-medium">
                      {r.nr}
                    </Link>
                  </TableCell>
                  <TableCell>{r.datum}</TableCell>
                  <TableCell>{r.lieferant}</TableCell>
                  <TableCell className="text-right">{formatCurrency(r.betrag)}</TableCell>
                  <TableCell>
                    <Badge className="bg-success/10 text-success">Bezahlt</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Meta */}
      <Card>
        <CardContent className="py-4">
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <span className="text-muted-foreground">Erfasst:</span>
              <span className="ml-2">{zahlungData.datum}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Referenz:</span>
              <span className="ml-2 font-mono">{zahlungData.referenz}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Valuta:</span>
              <span className="ml-2">{zahlungData.valuta}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
