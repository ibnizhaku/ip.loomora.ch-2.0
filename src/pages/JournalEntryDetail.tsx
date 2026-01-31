import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, CheckCircle2, Clock, AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const buchungData = {
  id: "BU-2024-0892",
  datum: "29.01.2024",
  buchungsart: "Debitorenrechnung",
  beleg: "RE-2024-0156",
  beschreibung: "Stahlkonstruktion Projekt Müller AG",
  status: "gebucht",
  periode: "01/2024",
  erstelltVon: "Peter Schneider",
  erstelltAm: "29.01.2024 14:35",
  gebuchtAm: "29.01.2024 14:38",
};

const sollBuchungen = [
  { konto: "1100", bezeichnung: "Debitoren CHF", betrag: 48537.00, kostenstelle: "", mwst: "" },
];

const habenBuchungen = [
  { konto: "3000", bezeichnung: "Produktionserlöse", betrag: 44900.00, kostenstelle: "KST-100", mwst: "8.1%" },
  { konto: "2200", bezeichnung: "MwSt. Umsatzsteuer", betrag: 3637.00, kostenstelle: "", mwst: "" },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  entwurf: { label: "Entwurf", color: "bg-muted text-muted-foreground", icon: Clock },
  gebucht: { label: "Gebucht", color: "bg-success/10 text-success", icon: CheckCircle2 },
  storniert: { label: "Storniert", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

export default function JournalEntryDetail() {
  const { id } = useParams();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const totalSoll = sollBuchungen.reduce((sum, b) => sum + b.betrag, 0);
  const totalHaben = habenBuchungen.reduce((sum, b) => sum + b.betrag, 0);
  const StatusIcon = statusConfig[buchungData.status].icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/journal-entries">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{buchungData.id}</h1>
            <Badge className={statusConfig[buchungData.status].color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig[buchungData.status].label}
            </Badge>
            <Badge variant="outline">{buchungData.buchungsart}</Badge>
          </div>
          <p className="text-muted-foreground">{buchungData.beschreibung}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Kopieren
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          {buchungData.status === "gebucht" && (
            <Button variant="destructive">
              Stornieren
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buchungsdatum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{buchungData.datum}</p>
            <p className="text-sm text-muted-foreground">Periode {buchungData.periode}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Beleg</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to={`/invoices/${buchungData.beleg}`} className="text-xl font-bold text-primary hover:underline">
              {buchungData.beleg}
            </Link>
            <p className="text-sm text-muted-foreground">{buchungData.buchungsart}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Soll</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalSoll)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Haben</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalHaben)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Buchungssätze */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Buchungssatz (Schweizer KMU-Kontenrahmen)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Soll */}
          <div>
            <h4 className="font-medium mb-3 text-muted-foreground">SOLL</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Konto</TableHead>
                  <TableHead>Bezeichnung</TableHead>
                  <TableHead>Kostenstelle</TableHead>
                  <TableHead>MwSt.</TableHead>
                  <TableHead className="text-right">Betrag CHF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sollBuchungen.map((b, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono font-medium">{b.konto}</TableCell>
                    <TableCell>{b.bezeichnung}</TableCell>
                    <TableCell>{b.kostenstelle || "-"}</TableCell>
                    <TableCell>{b.mwst || "-"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(b.betrag)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-bold">Total Soll</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalSoll)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Haben */}
          <div>
            <h4 className="font-medium mb-3 text-muted-foreground">HABEN</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Konto</TableHead>
                  <TableHead>Bezeichnung</TableHead>
                  <TableHead>Kostenstelle</TableHead>
                  <TableHead>MwSt.</TableHead>
                  <TableHead className="text-right">Betrag CHF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {habenBuchungen.map((b, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono font-medium">{b.konto}</TableCell>
                    <TableCell>{b.bezeichnung}</TableCell>
                    <TableCell>
                      {b.kostenstelle ? (
                        <Badge variant="outline">{b.kostenstelle}</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {b.mwst ? (
                        <Badge variant="outline">{b.mwst}</Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(b.betrag)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-bold">Total Haben</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(totalHaben)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Differenz Check */}
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Differenz (Soll - Haben)</p>
              <p className={`text-xl font-bold ${totalSoll === totalHaben ? "text-success" : "text-destructive"}`}>
                {formatCurrency(totalSoll - totalHaben)}
                {totalSoll === totalHaben && " ✓"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Info */}
      <Card>
        <CardContent className="py-4">
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground">Erstellt:</span>
              <span className="ml-2">{buchungData.erstelltAm} von {buchungData.erstelltVon}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Gebucht:</span>
              <span className="ml-2">{buchungData.gebuchtAm}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
