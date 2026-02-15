import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Filter, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function GeneralLedgerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch account with journal entries
  const { data: raw, isLoading, error } = useQuery({
    queryKey: ['general-ledger', id],
    queryFn: () => api.get(`/journal-entries?accountId=${id}`),
    enabled: !!id,
  });

  const formatCHF = (amount: number) => `CHF ${(amount || 0).toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const entries = ((raw as any)?.data || raw || []) as any[];
  const totalDebit = entries.reduce((sum: number, e: any) => sum + Number(e.debit || 0), 0);
  const totalCredit = entries.reduce((sum: number, e: any) => sum + Number(e.credit || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">Konto {id}</h1>
          <p className="text-muted-foreground">Hauptbuch</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Soll-Summe</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-success">{formatCHF(totalDebit)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Haben-Summe</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-destructive">{formatCHF(totalCredit)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Saldo</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCHF(totalDebit - totalCredit)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Buchungen</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
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
                {entries.map((entry: any, idx: number) => (
                  <TableRow key={entry.id || idx}>
                    <TableCell>{entry.date ? new Date(entry.date).toLocaleDateString("de-CH") : "—"}</TableCell>
                    <TableCell className="font-mono text-sm text-primary">{entry.reference || entry.document || "—"}</TableCell>
                    <TableCell>{entry.description || "—"}</TableCell>
                    <TableCell className={cn("text-right font-mono", (entry.debit || 0) > 0 && "text-success font-medium")}>
                      {(entry.debit || 0) > 0 ? formatCHF(entry.debit) : "-"}
                    </TableCell>
                    <TableCell className={cn("text-right font-mono", (entry.credit || 0) > 0 && "text-destructive font-medium")}>
                      {(entry.credit || 0) > 0 ? formatCHF(entry.credit) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Keine Buchungen vorhanden</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
