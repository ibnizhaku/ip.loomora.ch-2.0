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
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";


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
  
  const { data: apiData } = useQuery({
    queryKey: ["/finance/accounts", id],
    queryFn: () => api.get<any>(`/finance/accounts/${id}`),
    enabled: !!id,
  });
  
  const account = apiData?.data || null;
  
  const totalDebit = account?.transactions?.reduce((acc: number, t: any) => acc + (t.debit || 0), 0) || 0;
  const totalCredit = account?.transactions?.reduce((acc: number, t: any) => acc + (t.credit || 0), 0) || 0;
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
            <span className="font-mono text-lg text-muted-foreground">{account?.number || id}</span>
            <h1 className="font-display text-3xl font-bold">{account?.name || ""}</h1>
            {account?.type && (
              <Badge className={typeColors[account.type]}>{typeLabels[account.type]}</Badge>
            )}
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
            <p className="text-2xl font-bold">{formatCHF(account?.openingBalance || 0)}</p>
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
              <p className="text-2xl font-bold">{formatCHF(account?.balance || 0)}</p>
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
              {(account?.transactions || []).map((tx: any, index: number) => (
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
