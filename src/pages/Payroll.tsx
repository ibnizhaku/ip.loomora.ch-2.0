import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCompletePayrollRun, useSendPayslip } from "@/hooks/use-payroll";
import { generatePayslipPdf } from "@/lib/payslip-pdf";
import { 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
  Play,
  MoreHorizontal,
  Calculator,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// GAV Metallbau Lohnklassen
const gavLohnklassen = [
  { klasse: "A", bezeichnung: "Angelernte Arbeiter", minLohn: 4200, maxLohn: 4800 },
  { klasse: "B", bezeichnung: "Metallbauer EFZ (1-3 Jahre BE)", minLohn: 4800, maxLohn: 5400 },
  { klasse: "C", bezeichnung: "Metallbauer EFZ (>3 Jahre BE)", minLohn: 5400, maxLohn: 6200 },
  { klasse: "D", bezeichnung: "Metallbaukonstrukteur EFZ", minLohn: 5800, maxLohn: 6800 },
  { klasse: "E", bezeichnung: "Vorarbeiter / Gruppenleiter", minLohn: 6400, maxLohn: 7500 },
  { klasse: "F", bezeichnung: "Werkstattleiter / Montageleiter", minLohn: 7200, maxLohn: 8500 },
];

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Abgeschlossen": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "In Bearbeitung": { color: "bg-warning/10 text-warning", icon: Clock },
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileText },
  "Berechnet": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Prüfung": { color: "bg-warning/10 text-warning", icon: AlertCircle },
};

const defaultPayrollStatus = { color: "bg-muted text-muted-foreground", icon: FileText };

const formatCHF = (amount: number | undefined | null) => {
  return (amount || 0).toLocaleString("de-CH", { minimumFractionDigits: 2 });
};

const Payroll = () => {
  const navigate = useNavigate();
  const completeRunMutation = useCompletePayrollRun();
  const sendPayslipMutation = useSendPayslip();
  const { data: apiData } = useQuery({ queryKey: ["payroll"], queryFn: () => api.get<any>("/payroll") });
  const payrollRuns: any[] = apiData?.payrollRuns || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPosition, setFilterPosition] = useState<string[]>([]);
  const [showAbschliessenDialog, setShowAbschliessenDialog] = useState(false);
  // Show the most relevant run: current month first, then latest draft, then latest overall
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const currentRun = payrollRuns.find(r => r.periodKey === currentMonthKey && (r.status === "Entwurf" || r.status === "In Bearbeitung"))
    || payrollRuns.find(r => r.status === "In Bearbeitung")
    || payrollRuns.filter(r => r.status === "Entwurf").sort((a: any, b: any) => (a.periodKey > b.periodKey ? -1 : 1))[0]
    || payrollRuns[0];

  // Fetch detail data of the current run to get its payslips
  const { data: currentRunDetail } = useQuery({
    queryKey: ["payroll", currentRun?.id],
    queryFn: () => api.get<any>(`/payroll/${currentRun.id}`),
    enabled: !!currentRun?.id,
  });
  const employeePayroll: any[] = currentRunDetail?.data || currentRunDetail?.payslips || [];

  const totalBrutto = employeePayroll.reduce((sum, e) => sum + (e.bruttoLohn || e.grossSalary || 0), 0);
  const totalNetto = employeePayroll.reduce((sum, e) => sum + (e.nettoLohn || e.netSalary || 0), 0);
  const totalAHV = employeePayroll.reduce((sum, e) => sum + (e.ahvIvEo || 0), 0);
  const totalBVG = employeePayroll.reduce((sum, e) => sum + (e.bvg || 0), 0);

  const uniquePositions = Array.from(new Set(employeePayroll.map((e: any) => String(e.position || e.role || ''))));
  const activeFilters = filterStatus.length + filterPosition.length;

  const handleStatClick = (filter: string | null) => {
    setStatusFilter(statusFilter === filter ? null : filter);
  };

  const resetFilters = () => {
    setFilterStatus([]);
    setFilterPosition([]);
  };

  const handleSwissdecExport = () => {
    toast.success("Swissdec Export wird erstellt...");
    setTimeout(() => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<Salary xmlns="http://www.swissdec.ch/schema/sd/20200220/SalaryDeclaration">
  <DeclarationPeriod>2024-02</DeclarationPeriod>
  <TotalEmployees>${employeePayroll.length}</TotalEmployees>
  <TotalGross>${totalBrutto}</TotalGross>
</Salary>`;
      const blob = new Blob([xmlContent], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "swissdec_elm_2024-02.xml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Swissdec XML-Datei wurde generiert", {
        description: "Die Lohndaten wurden im ELM-Format exportiert"
      });
    }, 1500);
  };

  const handleLohnlaufAbschliessen = () => {
    if (!currentRun?.id) return;
    completeRunMutation.mutate(currentRun.id, {
      onSuccess: () => {
        setShowAbschliessenDialog(false);
        toast.success("Lohnlauf erfolgreich abgeschlossen", {
          description: "Alle Lohnabrechnungen wurden finalisiert"
        });
      },
      onError: (err: any) => {
        toast.error(err?.message || "Fehler beim Abschliessen");
      },
    });
  };

  const filteredEmployees = employeePayroll.filter(e => {
    const name = e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim() || '';
    const position = e.position || e.role || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || e.status === statusFilter;
    const matchesFilterStatus = filterStatus.length === 0 || filterStatus.includes(e.status);
    const matchesFilterPosition = filterPosition.length === 0 || filterPosition.includes(position);
    return matchesSearch && matchesStatus && matchesFilterStatus && matchesFilterPosition;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Lohnabrechnung</h1>
          <p className="text-muted-foreground">Schweizer Lohnwesen nach GAV Metallbau</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleSwissdecExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Swissdec Export
          </Button>
          <Button
            onClick={() => {
              toast.info("Neuer Lohnlauf wird vorbereitet...");
              setTimeout(() => {
                navigate("/payroll/new");
              }, 500);
            }}
          >
            <Play className="h-4 w-4 mr-2" />
            Lohnlauf starten
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-primary/50",
            !statusFilter && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleStatClick(null)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">CHF {formatCHF(totalBrutto)}</div>
                <p className="text-sm text-muted-foreground">Bruttolohnsumme</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-success/50",
            statusFilter === "Berechnet" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatClick("Berechnet")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">CHF {formatCHF(totalNetto)}</div>
                <p className="text-sm text-muted-foreground">Nettolohnsumme</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:border-warning/50",
            statusFilter === "Prüfung" && "border-warning ring-2 ring-warning/20"
          )}
          onClick={() => handleStatClick("Prüfung")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">CHF {formatCHF(totalAHV * 2)}</div>
                <p className="text-sm text-muted-foreground">AHV/IV/EO/ALV (AG+AN)</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">CHF {formatCHF(totalBVG * 2)}</div>
                <p className="text-sm text-muted-foreground">BVG Pensionskasse (AG+AN)</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Payroll Run */}
      {currentRun && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Aktueller Lohnlauf: {currentRun.period}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentRun.employees} Mitarbeitende • Brutto: CHF {formatCHF(currentRun?.grossTotal)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={(statusConfig[currentRun.status] || defaultPayrollStatus).color}>
                  {currentRun.status}
                </Badge>
                <Button onClick={() => navigate(`/payroll/${currentRun.id}`)}>
                  Details
                </Button>
                {(currentRun.status === "Entwurf" || currentRun.status === "DRAFT" || currentRun.status === "In Bearbeitung") && (
                  <Button onClick={() => setShowAbschliessenDialog(true)} disabled={completeRunMutation.isPending}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Abschliessen
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lohnlauf Abschliessen Dialog */}
      <Dialog open={showAbschliessenDialog} onOpenChange={setShowAbschliessenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lohnlauf abschliessen</DialogTitle>
            <DialogDescription>
              Möchten Sie den Lohnlauf für {currentRun?.period} wirklich abschliessen?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Mitarbeitende</p>
                  <p className="font-medium">{currentRun?.employees}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bruttolohnsumme</p>
                  <p className="font-medium">CHF {formatCHF(currentRun?.grossTotal || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nettolohnsumme</p>
                  <p className="font-medium">CHF {formatCHF(currentRun?.netTotal || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className="mt-1">{currentRun?.status}</Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Nach dem Abschliessen werden alle Lohnabrechnungen finalisiert und können für den Swissdec-Export verwendet werden.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAbschliessenDialog(false)} disabled={completeRunMutation.isPending}>
              Abbrechen
            </Button>
            <Button onClick={handleLohnlaufAbschliessen} disabled={completeRunMutation.isPending}>
              {completeRunMutation.isPending ? (
                <Calculator className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Jetzt abschliessen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Lohnlauf-Historie</TabsTrigger>
          <TabsTrigger value="employees">Mitarbeitende ({currentRun?.period || "–"})</TabsTrigger>
          <TabsTrigger value="gav">GAV Metallbau</TabsTrigger>
          <TabsTrigger value="contributions">Sozialversicherungen</TabsTrigger>
          <TabsTrigger value="history">Lohnlauf-Historie</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Mitarbeitende suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(activeFilters > 0 && "border-primary")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {activeFilters > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">{activeFilters}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Filter</h4>
                    {activeFilters > 0 && (
                      <Button variant="ghost" size="sm" onClick={resetFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Zurücksetzen
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Status</Label>
                    {["Berechnet", "Prüfung"].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={filterStatus.includes(status)}
                          onCheckedChange={(checked) => {
                            setFilterStatus(checked 
                              ? [...filterStatus, status]
                              : filterStatus.filter(s => s !== status)
                            );
                          }}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Position</Label>
                    {uniquePositions.slice(0, 4).map((position) => (
                      <div key={position} className="flex items-center space-x-2">
                        <Checkbox
                          id={`position-${position}`}
                          checked={filterPosition.includes(position)}
                          onCheckedChange={(checked) => {
                            setFilterPosition(checked 
                              ? [...filterPosition, position]
                              : filterPosition.filter(p => p !== position)
                            );
                          }}
                        />
                        <Label htmlFor={`position-${position}`} className="text-sm font-normal cursor-pointer">
                          {position}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeitende</TableHead>
                    <TableHead className="text-right">Bruttolohn</TableHead>
                    <TableHead className="text-right">AHV/IV/EO</TableHead>
                    <TableHead className="text-right">ALV</TableHead>
                    <TableHead className="text-right">BVG</TableHead>
                    <TableHead className="text-right">NBU/KTG</TableHead>
                    <TableHead className="text-right">QST</TableHead>
                    <TableHead className="text-right">Nettolohn</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => {
                    const status = statusConfig[emp.status] || defaultPayrollStatus;
                    return (
                      <TableRow 
                        key={emp.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/payslips/${emp.id}`)}
                      >
                        <TableCell>
                          <div>
                            <span className="font-medium hover:text-primary">
                              {emp.name}
                            </span>
                            <p className="text-sm text-muted-foreground">{emp.position}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCHF(emp.bruttoLohn)}</TableCell>
                        <TableCell className="text-right text-destructive">-{formatCHF(emp.ahvIvEo)}</TableCell>
                        <TableCell className="text-right text-destructive">-{formatCHF(emp.alv)}</TableCell>
                        <TableCell className="text-right text-destructive">-{formatCHF(emp.bvg)}</TableCell>
                        <TableCell className="text-right text-destructive">-{formatCHF(emp.nbuKtg)}</TableCell>
                        <TableCell className="text-right">
                          {emp.quellensteuer > 0 ? (
                            <span className="text-destructive">-{formatCHF(emp.quellensteuer)}</span>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-success">{formatCHF(emp.nettoLohn)}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>{emp.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/payslips/${emp.id}`); }}>
                                Lohnabrechnung anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                try {
                                  generatePayslipPdf({
                                    employeeName: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
                                    position: emp.position || emp.role || '',
                                    period: currentRun?.period || '',
                                    periodStart: currentRun?.periodStart,
                                    periodEnd: currentRun?.periodEnd,
                                    grossSalary: Number(emp.bruttoLohn || 0),
                                    netSalary: Number(emp.nettoLohn || 0),
                                    deductions: [
                                      { description: 'AHV/IV/EO', amount: Number(emp.ahvIvEo || 0) },
                                      { description: 'ALV', amount: Number(emp.alv || 0) },
                                      { description: 'BVG', amount: Number(emp.bvg || 0) },
                                      { description: 'NBU/KTG', amount: Number(emp.nbuKtg || 0) },
                                    ].filter(d => d.amount > 0),
                                  });
                                  toast.success('PDF wurde erstellt');
                                } catch { toast.error('Fehler bei der PDF-Erstellung'); }
                              }}>
                                PDF herunterladen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                sendPayslipMutation.mutate(emp.id, {
                                  onSuccess: () => toast.success(`Lohnabrechnung an ${emp.name} versendet`),
                                  onError: () => toast.error(`Fehler beim Versand an ${emp.name}`),
                                });
                              }}>
                                Per E-Mail senden
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gav" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GAV Metallbau - Lohnklassen</CardTitle>
              <CardDescription>
                Mindestlöhne gemäss Gesamtarbeitsvertrag der Schweizerischen Metall-Union (SMU)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Klasse</TableHead>
                    <TableHead>Bezeichnung</TableHead>
                    <TableHead className="text-right">Mindestlohn</TableHead>
                    <TableHead className="text-right">Maximallohn</TableHead>
                    <TableHead>13. Monatslohn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gavLohnklassen.map((klasse) => (
                    <TableRow key={klasse.klasse}>
                      <TableCell className="font-mono font-bold">{klasse.klasse}</TableCell>
                      <TableCell>{klasse.bezeichnung}</TableCell>
                      <TableCell className="text-right">CHF {klasse.minLohn.toLocaleString("de-CH")}</TableCell>
                      <TableCell className="text-right">CHF {klasse.maxLohn.toLocaleString("de-CH")}</TableCell>
                      <TableCell><Badge variant="secondary">100%</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Arbeitszeit GAV Metallbau</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span>Wochenarbeitszeit</span><span className="font-semibold">42.5 Stunden</span></div>
                <div className="flex justify-between"><span>Jahresarbeitszeit</span><span className="font-semibold">2'190 Stunden</span></div>
                <div className="flex justify-between"><span>Überstundenzuschlag (Mo-Sa)</span><span className="font-semibold">25%</span></div>
                <div className="flex justify-between"><span>Sonntagsarbeit</span><span className="font-semibold">50%</span></div>
                <div className="flex justify-between"><span>Nachtarbeit (23-6 Uhr)</span><span className="font-semibold">25%</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ferien GAV Metallbau</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span>Bis 20 Jahre</span><span className="font-semibold">25 Arbeitstage (5 Wochen)</span></div>
                <div className="flex justify-between"><span>20-49 Jahre</span><span className="font-semibold">20 Arbeitstage (4 Wochen)</span></div>
                <div className="flex justify-between"><span>Ab 50 Jahre</span><span className="font-semibold">25 Arbeitstage (5 Wochen)</span></div>
                <div className="flex justify-between"><span>Ab 60 Jahre</span><span className="font-semibold">30 Arbeitstage (6 Wochen)</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Arbeitnehmer-Beiträge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span>AHV/IV/EO</span><span className="font-semibold">5.30%</span></div>
                <div className="flex justify-between"><span>ALV (bis CHF 148'200)</span><span className="font-semibold">1.10%</span></div>
                <div className="flex justify-between"><span>ALV2 (ab CHF 148'200)</span><span className="font-semibold">0.50%</span></div>
                <div className="flex justify-between"><span>BVG (altersabhängig)</span><span className="font-semibold">7-18%</span></div>
                <div className="flex justify-between"><span>NBU (Nichtberufsunfall)</span><span className="font-semibold">~1.00%</span></div>
                <div className="flex justify-between"><span>KTG (Krankentaggeld)</span><span className="font-semibold">~0.50%</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Arbeitgeber-Beiträge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between"><span>AHV/IV/EO</span><span className="font-semibold">5.30%</span></div>
                <div className="flex justify-between"><span>ALV</span><span className="font-semibold">1.10%</span></div>
                <div className="flex justify-between"><span>FAK (kantonal)</span><span className="font-semibold">~2.40%</span></div>
                <div className="flex justify-between"><span>BVG (mind. = AN)</span><span className="font-semibold">7-18%</span></div>
                <div className="flex justify-between"><span>UVG Berufsunfall</span><span className="font-semibold">~0.87%</span></div>
                <div className="flex justify-between"><span>KTG (falls AG zahlt)</span><span className="font-semibold">~0.50%</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lohnlauf</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-right">Mitarbeitende</TableHead>
                    <TableHead className="text-right">Brutto</TableHead>
                    <TableHead className="text-right">Netto</TableHead>
                    <TableHead>Durchgeführt</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRuns.map((run) => {
                    const status = statusConfig[run.status] || defaultPayrollStatus;
                    const StatusIcon = status.icon;
                    return (
                      <TableRow 
                        key={run.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/payroll/${run.id}`)}
                      >
                        <TableCell className="font-medium">{run.period}</TableCell>
                        <TableCell>{run.periodKey}</TableCell>
                        <TableCell className="text-right">{Array.isArray(run.employees) ? run.employees.length : (run.employees || 0)}</TableCell>
                        <TableCell className="text-right">CHF {formatCHF(run.grossTotal || 0)}</TableCell>
                        <TableCell className="text-right font-medium">CHF {formatCHF(run.netTotal)}</TableCell>
                        <TableCell>{run.runDate}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {run.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payroll;
