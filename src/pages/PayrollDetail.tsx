import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCompletePayrollRun, useSendPayslip } from "@/hooks/use-payroll";
import { ArrowLeft, Loader2, Users, CheckCircle, FileText, Printer, Send, Download } from "lucide-react";
import { toast } from "sonner";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generatePayslipPdf } from "@/lib/payslip-pdf";

function formatCHF(v?: number | null) {
  return `CHF ${(Number(v) || 0).toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

export default function PayrollDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const completeRun = useCompletePayrollRun();
  const sendPayslip = useSendPayslip();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const { data: payroll, isLoading, error } = useQuery({
    queryKey: ["/payroll", id],
    queryFn: () => api.get<any>(`/payroll/${id}`),
    enabled: !!id,
  });

  const isDraft = !payroll?.status || payroll.status === "Entwurf" || payroll.status === "DRAFT";

  const handleComplete = () => {
    if (!id) return;
    completeRun.mutate(id, {
      onSuccess: () => {
        toast.success("Lohnlauf erfolgreich abgeschlossen");
        setShowCompleteDialog(false);
      },
      onError: (err: any) => toast.error(err?.message || "Fehler beim Abschliessen"),
    });
  };

  const handlePayslipPdf = (ps: any) => {
    try {
      generatePayslipPdf({
        employeeName: ps.name || `${ps.firstName || ""} ${ps.lastName || ""}`.trim() || "Mitarbeiter",
        position: ps.position || "—",
        ahvNumber: ps.ahvNumber || ps.employee?.ahvNumber || "",
        period: payroll?.period || "",
        periodStart: payroll?.periodStart,
        periodEnd: payroll?.periodEnd,
        grossSalary: Number(ps.bruttoLohn || ps.grossSalary || 0),
        netSalary: Number(ps.nettoLohn || ps.netSalary || 0),
        earnings: ps.earnings || [],
        deductions: ps.deductions || [],
        employerName: ps.employer?.name || payroll?.companyName || "Arbeitgeber",
        employerAddress: ps.employer?.address || "",
        bankAccount: ps.bankAccount,
      });
      toast.success("PDF wurde erstellt");
    } catch {
      toast.error("Fehler bei der PDF-Erstellung");
    }
  };

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
      <div className="space-y-4">
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
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Drucken
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            payslips.forEach((ps: any) => handlePayslipPdf(ps));
            if (payslips.length === 0) toast.info("Keine Lohnabrechnungen vorhanden");
          }}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" disabled={sendPayslip.isPending} onClick={() => {
            if (payslips.length === 0) { toast.info("Keine Lohnabrechnungen vorhanden"); return; }
            payslips.forEach((ps: any) => {
              sendPayslip.mutate(ps.id, {
                onSuccess: () => toast.success(`Lohnabrechnung an ${ps.name || 'Mitarbeiter'} versendet`),
                onError: () => toast.error(`Fehler beim Versand an ${ps.name || 'Mitarbeiter'}`),
              });
            });
          }}>
            <Send className="h-4 w-4 mr-2" />
            Versenden
          </Button>
          {isDraft && (
            <Button
              size="sm"
              onClick={() => setShowCompleteDialog(true)}
              disabled={completeRun.isPending}
            >
              {completeRun.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Abschliessen
            </Button>
          )}
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
                  <TableHead className="text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {payslips.map((ps: any) => (
                  <TableRow key={ps.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/payslips/${ps.id}`)}>
                    <TableCell className="font-medium">
                      {ps.name || `${ps.firstName || ""} ${ps.lastName || ""}`.trim() || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ps.position || "—"}</TableCell>
                    <TableCell className="text-right">{formatCHF(ps.bruttoLohn || ps.grossSalary)}</TableCell>
                    <TableCell className="text-right">{formatCHF(ps.nettoLohn || ps.netSalary)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ps.status || "Entwurf"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handlePayslipPdf(ps); }} title="PDF herunterladen">
                        <Download className="h-4 w-4" />
                      </Button>
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

      {/* Bestätigungsdialog für Abschluss */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lohnlauf abschliessen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dieser Lohnlauf für <strong>{payroll.period}</strong> mit{" "}
              <strong>{payslips.length} Mitarbeiter(n)</strong> und einem Nettolohn von{" "}
              <strong>{formatCHF(netTotal)}</strong> wird unwiderruflich abgeschlossen.
              Danach können keine Änderungen mehr vorgenommen werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={completeRun.isPending}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={completeRun.isPending}>
              {completeRun.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Ja, abschliessen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
