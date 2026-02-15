import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Mail, Printer, Calendar, User, Building2, CreditCard, FileText, Clock, Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePayslip, useSendPayslip } from "@/hooks/use-payroll";
import { generatePayslipPdf } from "@/lib/payslip-pdf";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "paid": return { label: "Ausbezahlt", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "pending": return { label: "Ausstehend", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
    case "draft": return { label: "Entwurf", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    default: return { label: status, color: "bg-gray-100 text-gray-800" };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(amount);
};

export default function PayslipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: apiData, isLoading, error } = usePayslip(id || "");
  const sendMutation = useSendPayslip();

  const payslipData = useMemo(() => {
    if (!apiData) return null;
    return {
      id: apiData.id || id,
      period: apiData.period || "–",
      periodStart: apiData.periodStart || "",
      periodEnd: apiData.periodEnd || "",
      paymentDate: apiData.paymentDate || "",
      status: apiData.status || "draft",
      employee: {
        id: apiData.employee?.id || apiData.employeeId || "",
        name: apiData.employee?.name || (apiData.employee ? `${apiData.employee.firstName} ${apiData.employee.lastName}` : "–"),
        ahvNumber: apiData.employee?.ahvNumber || "",
        birthDate: apiData.employee?.birthDate || "",
        entryDate: apiData.employee?.entryDate || "",
        department: apiData.employee?.department || "",
        position: apiData.employee?.position || "",
        salaryClass: apiData.employee?.salaryClass || "",
        workload: apiData.employee?.workload || 100,
      },
      employer: {
        name: apiData.employer?.name || "–",
        address: apiData.employer?.address || "",
        uid: apiData.employer?.uid || "",
      },
      workingTime: apiData.workingTime || { targetHours: 0, actualHours: 0, overtime: 0, holidays: 0, sickDays: 0, vacationDays: 0 },
      earnings: apiData.earnings || [],
      deductions: apiData.deductions || [],
      employerContributions: apiData.employerContributions || [],
      expenses: apiData.expenses || [],
      bankAccount: apiData.bankAccount || { iban: "", bank: "" },
    };
  }, [apiData, id]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (error || !payslipData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Lohnabrechnung nicht gefunden</p>
        <Link to="/payroll" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(payslipData.status);
  const totalEarnings = payslipData.earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpenses = payslipData.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const grossSalary = apiData?.grossSalary || totalEarnings;
  const totalDeductions = payslipData.deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const netSalary = apiData?.netSalary || (grossSalary - totalDeductions + totalExpenses);
  const totalEmployerCost = grossSalary + payslipData.employerContributions.reduce((sum, c) => sum + (c.amount || 0), 0);

  const handleSend = () => {
    if (!id) return;
    sendMutation.mutate(id, {
      onSuccess: () => toast.success("Lohnabrechnung versendet"),
      onError: () => toast.error("Fehler beim Versenden"),
    });
  };

  const handlePrint = () => { window.print(); };

  const handlePdfExport = () => {
    try {
      generatePayslipPdf({
        employeeName: payslipData.employee.name,
        position: payslipData.employee.position,
        ahvNumber: payslipData.employee.ahvNumber,
        period: payslipData.period,
        periodStart: payslipData.periodStart,
        periodEnd: payslipData.periodEnd,
        grossSalary: grossSalary,
        netSalary: netSalary,
        earnings: payslipData.earnings,
        deductions: payslipData.deductions,
        employerName: payslipData.employer.name,
        employerAddress: payslipData.employer.address,
        bankAccount: payslipData.bankAccount,
      });
      toast.success("PDF wurde erstellt");
    } catch {
      toast.error("Fehler bei der PDF-Erstellung");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Lohnabrechnung {payslipData.period}</h1>
              <Badge className={statusConfig.color} variant="secondary">{statusConfig.label}</Badge>
            </div>
            <p className="text-muted-foreground">{payslipData.employee.name} • {payslipData.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSend} disabled={sendMutation.isPending}>
            <Mail className="h-4 w-4 mr-2" />Versenden
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />Drucken
          </Button>
          <Button onClick={handlePdfExport}>
            <Download className="h-4 w-4 mr-2" />PDF Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Arbeitnehmer & Arbeitgeber */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />Arbeitnehmer</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{payslipData.employee.name}</p>
                {payslipData.employee.ahvNumber && <p className="text-muted-foreground">AHV-Nr: {payslipData.employee.ahvNumber}</p>}
                <p className="text-muted-foreground">{payslipData.employee.position}</p>
                <div className="flex gap-2 pt-2">
                  {payslipData.employee.salaryClass && <Badge variant="outline">Lohnklasse {payslipData.employee.salaryClass}</Badge>}
                  <Badge variant="outline">{payslipData.employee.workload}%</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" />Arbeitgeber</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{payslipData.employer.name}</p>
                {payslipData.employer.address && <p className="text-muted-foreground">{payslipData.employer.address}</p>}
                {payslipData.employer.uid && <p className="text-muted-foreground">UID: {payslipData.employer.uid}</p>}
              </CardContent>
            </Card>
          </div>

          {/* Arbeitszeit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Arbeitszeit</CardTitle>
              <CardDescription>GAV Metallbau: 42.5 Stunden/Woche</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{payslipData.workingTime.targetHours}h</p>
                  <p className="text-sm text-muted-foreground">Sollstunden</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{payslipData.workingTime.actualHours}h</p>
                  <p className="text-sm text-muted-foreground">Iststunden</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">+{payslipData.workingTime.overtime}h</p>
                  <p className="text-sm text-muted-foreground">Überstunden</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold">{payslipData.workingTime.vacationDays}</p>
                  <p className="text-sm text-muted-foreground">Ferientage</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lohnbestandteile */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Lohnbestandteile</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Beschreibung</TableHead><TableHead className="text-right">Betrag</TableHead></TableRow></TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/30"><TableCell colSpan={2} className="font-semibold">Bruttolohn</TableCell></TableRow>
                  {payslipData.earnings.map((earning, index) => (
                    <TableRow key={index}><TableCell>{earning.description}</TableCell><TableCell className="text-right">{formatCurrency(earning.amount)}</TableCell></TableRow>
                  ))}
                  <TableRow className="font-medium"><TableCell>Total Bruttolohn</TableCell><TableCell className="text-right">{formatCurrency(grossSalary)}</TableCell></TableRow>
                  <TableRow className="bg-muted/30"><TableCell colSpan={2} className="font-semibold">Abzüge</TableCell></TableRow>
                  {payslipData.deductions.map((deduction, index) => (
                    <TableRow key={index}><TableCell>{deduction.description}</TableCell><TableCell className="text-right text-red-600">-{formatCurrency(deduction.amount)}</TableCell></TableRow>
                  ))}
                  <TableRow className="font-medium"><TableCell>Total Abzüge</TableCell><TableCell className="text-right text-red-600">-{formatCurrency(totalDeductions)}</TableCell></TableRow>
                  {payslipData.expenses.length > 0 && (
                    <>
                      <TableRow className="bg-muted/30"><TableCell colSpan={2} className="font-semibold">Spesen (steuerfrei)</TableCell></TableRow>
                      {payslipData.expenses.map((expense, index) => (
                        <TableRow key={index}><TableCell>{expense.description}</TableCell><TableCell className="text-right text-green-600">+{formatCurrency(expense.amount)}</TableCell></TableRow>
                      ))}
                    </>
                  )}
                  <Separator className="my-2" />
                  <TableRow className="text-lg font-bold"><TableCell>Nettolohn (Auszahlung)</TableCell><TableCell className="text-right">{formatCurrency(netSalary)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Arbeitgeberbeiträge */}
          {payslipData.employerContributions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Arbeitgeberbeiträge (nicht lohnwirksam)</CardTitle>
                <CardDescription>Sozialversicherungen zu Lasten Arbeitgeber</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {payslipData.employerContributions.map((contribution, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-muted-foreground">{contribution.description}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatCurrency(contribution.amount)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-medium">
                      <TableCell>Gesamtkosten Arbeitgeber</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalEmployerCost)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Zusammenfassung</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Bruttolohn</span><span className="font-medium">{formatCurrency(grossSalary)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Abzüge</span><span className="font-medium text-red-600">-{formatCurrency(totalDeductions)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Spesen</span><span className="font-medium text-green-600">+{formatCurrency(totalExpenses)}</span></div>
              <Separator />
              <div className="flex justify-between text-lg"><span className="font-semibold">Auszahlung</span><span className="font-bold">{formatCurrency(netSalary)}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" />Auszahlung</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {payslipData.paymentDate && (
                <div><p className="text-muted-foreground">Zahlungsdatum</p><p className="font-medium">{new Date(payslipData.paymentDate).toLocaleDateString("de-CH")}</p></div>
              )}
              {payslipData.bankAccount.iban && (
                <div><p className="text-muted-foreground">Bankverbindung</p><p className="font-medium font-mono text-xs">{payslipData.bankAccount.iban}</p>{payslipData.bankAccount.bank && <p className="text-muted-foreground">{payslipData.bankAccount.bank}</p>}</div>
              )}
            </CardContent>
          </Card>

          {payslipData.periodStart && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />Abrechnungsperiode</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Von</span><span>{new Date(payslipData.periodStart).toLocaleDateString("de-CH")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Bis</span><span>{new Date(payslipData.periodEnd).toLocaleDateString("de-CH")}</span></div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Verknüpfungen</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/hr/${payslipData.employee.id}`)}>
                <User className="h-4 w-4 mr-2" />Mitarbeiterprofil
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/payroll`)}>
                <FileText className="h-4 w-4 mr-2" />Jahresübersicht
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handlePdfExport}>
                <FileText className="h-4 w-4 mr-2" />Lohnausweis generieren
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
