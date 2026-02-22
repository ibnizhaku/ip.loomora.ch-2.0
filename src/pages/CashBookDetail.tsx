import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

export default function CashBookDetail() {
  const { id } = useParams();

  const { data: entry, isLoading, error } = useQuery({
    queryKey: ["/cash-book", id],
    queryFn: () => api.get<any>(`/cash-book/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Kassenbucheintrag nicht gefunden</p>
        <Link to="/cash-book" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const amount = Math.abs(Number(entry.amount || 0));
  const isIncome = entry.type === "RECEIPT" || entry.type === "INCOME" || entry.type === "income" || Number(entry.amount || 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/cash-book">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">
              {entry.number ?? entry.documentNumber ?? `Eintrag ${entry.id}`}
            </h1>
            <Badge className={isIncome ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
              {isIncome ? "Einnahme" : "Ausgabe"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{entry.description || "Kein Beschreibung"}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Datum</span>
                <span className="font-medium">{formatDate(entry.date || entry.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Beschreibung</span>
                <span className="font-medium">{entry.description || "—"}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Betrag</span>
                <span className={isIncome ? "text-success" : "text-destructive"}>
                  {isIncome ? "+" : "-"}CHF {Math.abs(amount).toLocaleString("de-CH", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {entry.reference && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Referenz</span>
                  <span className="font-medium">{entry.reference}</span>
                </div>
              )}
              {(entry.account?.name ?? entry.account) && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Konto</span>
                  <span className="font-medium">{typeof entry.account === "object" ? entry.account?.name : entry.account}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Erstellt am</span>
                <span className="font-medium">{formatDate(entry.createdAt)}</span>
              </div>
              {entry.createdBy && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Erstellt von</span>
                  <span className="font-medium">
                    {typeof entry.createdBy === "object" 
                      ? `${entry.createdBy.firstName} ${entry.createdBy.lastName}` 
                      : entry.createdBy}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
