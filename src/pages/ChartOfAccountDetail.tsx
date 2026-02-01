import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const accountData = {
  "1020": {
    number: "1020",
    name: "Bank UBS",
    type: "asset" as const,
    category: "Aktiven",
    balance: 125000,
    openingBalance: 98500,
    transactions: [
      { id: "1", date: "31.01.2024", document: "ZE-2024-089", description: "Zahlungseingang RE-2024-078", debit: 15000, credit: 0, balance: 125000 },
      { id: "2", date: "30.01.2024", document: "ZA-2024-045", description: "Zahlung ER-2024-034", debit: 0, credit: 2500, balance: 110000 },
      { id: "3", date: "28.01.2024", document: "ZE-2024-088", description: "Zahlungseingang RE-2024-072", debit: 8500, credit: 0, balance: 112500 },
      { id: "4", date: "25.01.2024", document: "ZA-2024-044", description: "Lohnzahlung Januar", debit: 0, credit: 32000, balance: 104000 },
      { id: "5", date: "20.01.2024", document: "ZE-2024-085", description: "Zahlungseingang RE-2024-065", debit: 45000, credit: 0, balance: 136000 },
      { id: "6", date: "15.01.2024", document: "ZA-2024-040", description: "Miete Januar", debit: 0, credit: 3500, balance: 91000 },
      { id: "7", date: "10.01.2024", document: "ZE-2024-082", description: "Zahlungseingang RE-2024-058", debit: 12000, credit: 0, balance: 94500 },
      { id: "8", date: "05.01.2024", document: "ZA-2024-038", description: "Versicherungsprämie", debit: 0, credit: 8000, balance: 82500 },
    ],
  },
};

const typeColors = {
  asset: "bg-blue-500/10 text-blue-600",
  liability: "bg-orange-500/10 text-orange-600",
  equity: "bg-purple-500/10 text-purple-600",
  revenue: "bg-success/10 text-success",
  expense: "bg-destructive/10 text-destructive",
};

const typeLabels = {
  asset: "Aktiven",
  liability: "Fremdkapital",
  equity: "Eigenkapital",
  revenue: "Ertrag",
  expense: "Aufwand",
};

export default function ChartOfAccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const account = accountData["1020"]; // Mock - would fetch by id
  
  const totalDebit = account.transactions.reduce((acc, t) => acc + t.debit, 0);
  const totalCredit = account.transactions.reduce((acc, t) => acc + t.credit, 0);
  const netChange = totalDebit - totalCredit;

  const formatCHF = (amount: number) => {
    return `CHF ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg text-muted-foreground">{account.number}</span>
            <h1 className="font-display text-3xl font-bold">{account.name}</h1>
            <Badge className={typeColors[account.type]}>{typeLabels[account.type]}</Badge>
          </div>
          <p className="text-muted-foreground">Kontoauszug und Buchungen</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Anfangssaldo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCHF(account.openingBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Soll (Zugänge)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{formatCHF(totalDebit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Haben (Abgänge)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{formatCHF(totalCredit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktueller Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{formatCHF(account.balance)}</p>
              {netChange >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
            </div>
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
                <TableHead>Beschreibung</TableHead>
                <TableHead className="text-right">Soll</TableHead>
                <TableHead className="text-right">Haben</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {account.transactions.map((tx, index) => (
                <TableRow key={tx.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-primary cursor-pointer hover:underline">
                      {tx.document}
                    </span>
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className={cn("text-right font-mono", tx.debit > 0 && "text-success font-medium")}>
                    {tx.debit > 0 ? formatCHF(tx.debit) : "-"}
                  </TableCell>
                  <TableCell className={cn("text-right font-mono", tx.credit > 0 && "text-destructive font-medium")}>
                    {tx.credit > 0 ? formatCHF(tx.credit) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">{formatCHF(tx.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
