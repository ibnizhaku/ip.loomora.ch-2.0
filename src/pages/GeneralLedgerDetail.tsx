import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Filter, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ledgerData = {
  account: { number: "1020", name: "Bank UBS" },
  period: "Januar 2024",
  openingBalance: 98500,
  closingBalance: 125000,
  entries: [
    { id: "1", date: "05.01.2024", document: "ZA-2024-038", description: "Versicherungsprämie", debit: 0, credit: 8000 },
    { id: "2", date: "10.01.2024", document: "ZE-2024-082", description: "Zahlungseingang RE-2024-058", debit: 12000, credit: 0 },
    { id: "3", date: "15.01.2024", document: "ZA-2024-040", description: "Miete Januar", debit: 0, credit: 3500 },
    { id: "4", date: "20.01.2024", document: "ZE-2024-085", description: "Zahlungseingang RE-2024-065", debit: 45000, credit: 0 },
    { id: "5", date: "25.01.2024", document: "ZA-2024-044", description: "Lohnzahlung Januar", debit: 0, credit: 32000 },
    { id: "6", date: "28.01.2024", document: "ZE-2024-088", description: "Zahlungseingang RE-2024-072", debit: 8500, credit: 0 },
    { id: "7", date: "30.01.2024", document: "ZA-2024-045", description: "Zahlung ER-2024-034", debit: 0, credit: 2500 },
    { id: "8", date: "31.01.2024", document: "ZE-2024-089", description: "Zahlungseingang RE-2024-078", debit: 15000, credit: 0 },
  ],
};

export default function GeneralLedgerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const totalDebit = ledgerData.entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = ledgerData.entries.reduce((sum, e) => sum + e.credit, 0);

  const formatCHF = (amount: number) => `CHF ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">
            {ledgerData.account.number} - {ledgerData.account.name}
          </h1>
          <p className="text-muted-foreground">Hauptbuch • {ledgerData.period}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Anfangssaldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCHF(ledgerData.openingBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Soll-Summe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatCHF(totalDebit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Haben-Summe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatCHF(totalCredit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Endsaldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCHF(ledgerData.closingBalance)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Buchungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Beleg</TableHead>
                <TableHead>Buchungstext</TableHead>
                <TableHead className="text-right">Soll</TableHead>
                <TableHead className="text-right">Haben</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerData.entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell className="font-mono text-sm text-primary">{entry.document}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className={cn("text-right font-mono", entry.debit > 0 && "text-success font-medium")}>
                    {entry.debit > 0 ? formatCHF(entry.debit) : "-"}
                  </TableCell>
                  <TableCell className={cn("text-right font-mono", entry.credit > 0 && "text-destructive font-medium")}>
                    {entry.credit > 0 ? formatCHF(entry.credit) : "-"}
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
