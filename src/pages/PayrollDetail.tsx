import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatCHF(v?: number | null) {
  return `CHF ${(Number(v) || 0).toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

export default function PayrollDetail() {
  const { id } = useParams();

  const { data: payroll, isLoading, error } = useQuery({
    queryKey: ["/payroll", id],
    queryFn: () => api.get<any>(`/payroll/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !payroll) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Lohnlauf nicht gefunden</p>
        <Link to="/payroll" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const grossTotal = Number(payroll.grossTotal || 0);
  const netTotal = Number(payroll.netTotal || 0);
  const deductions = grossTotal - netTotal;
  const payslips: any[] = payroll.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/payroll">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">
              Lohnlauf — {payroll.period || payroll.periodKey}
            </h1>
            <Badge variant="outline">{payroll.status || "Entwurf"}</Badge>
          </div>
          <p className="text-muted-foreground">
            {formatDate(payroll.periodStart)} — {formatDate(payroll.periodEnd)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Bruttolohn Total</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{formatCHF(grossTotal)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">Abzüge Total</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-destructive">-{formatCHF(deductions)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nettolohn Total</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{formatCHF(netTotal)}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Lohnabrechnungen ({payslips.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {payslips.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Lohnabrechnungen in diesem Lauf.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Brutto</TableHead>
                  <TableHead className="text-right">Netto</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((ps: any) => (
                  <TableRow key={ps.id}>
                    <TableCell className="font-medium">
                      {ps.name || `${ps.firstName || ""} ${ps.lastName || ""}`.trim() || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ps.position || "—"}</TableCell>
                    <TableCell className="text-right">{formatCHF(ps.bruttoLohn || ps.grossSalary)}</TableCell>
                    <TableCell className="text-right">{formatCHF(ps.nettoLohn || ps.netSalary)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ps.status || "Entwurf"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mitarbeiter</span>
            <span className="font-medium">{payroll.employees || payslips.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Erstellt</span>
            <span className="font-medium">{formatDate(payroll.createdAt)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline">{payroll.status || "Entwurf"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
