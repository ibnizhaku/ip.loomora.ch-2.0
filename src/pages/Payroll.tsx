import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Calculator
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Schweizer Lohnabrechnung nach GAV Metallbau
const payrollRuns = [
  { id: "LR-2024-01", period: "Januar 2024", employees: 6, grossTotal: 35500, netTotal: 29232, status: "Abgeschlossen", runDate: "25.01.2024" },
  { id: "LR-2024-02", period: "Februar 2024", employees: 6, grossTotal: 35500, netTotal: 29232, status: "In Bearbeitung", runDate: "25.02.2024" },
  { id: "LR-2023-12", period: "Dezember 2023", employees: 6, grossTotal: 35500, netTotal: 29232, status: "Abgeschlossen", runDate: "22.12.2023" },
];

// Schweizer Sozialversicherungsbeiträge
const employeePayroll = [
  { 
    id: "1", name: "Thomas Müller", position: "Metallbauer EFZ", 
    bruttoLohn: 5800, 
    ahvIvEo: 307.40, // 5.3%
    alv: 63.80, // 1.1%
    bvg: 290.00,
    nbuKtg: 87.00, // NBU 1% + KTG 0.5%
    quellensteuer: 0,
    nettoLohn: 5051.80, 
    status: "Berechnet" 
  },
  { 
    id: "2", name: "Lisa Weber", position: "Metallbaukonstrukteurin EFZ", 
    bruttoLohn: 6200, 
    ahvIvEo: 328.60,
    alv: 68.20,
    bvg: 320.00,
    nbuKtg: 93.00,
    quellensteuer: 0,
    nettoLohn: 5390.20, 
    status: "Berechnet" 
  },
  { 
    id: "3", name: "Michael Schneider", position: "Vorarbeiter", 
    bruttoLohn: 6800, 
    ahvIvEo: 360.40,
    alv: 74.80,
    bvg: 380.00,
    nbuKtg: 102.00,
    quellensteuer: 0,
    nettoLohn: 5882.80, 
    status: "Prüfung" 
  },
  { 
    id: "4", name: "Sandra Fischer", position: "Kaufm. Angestellte", 
    bruttoLohn: 5200, 
    ahvIvEo: 275.60,
    alv: 57.20,
    bvg: 260.00,
    nbuKtg: 78.00,
    quellensteuer: 0,
    nettoLohn: 4529.20, 
    status: "Berechnet" 
  },
  { 
    id: "5", name: "Pedro Santos", position: "Metallbauer EFZ", 
    bruttoLohn: 5500, 
    ahvIvEo: 291.50,
    alv: 60.50,
    bvg: 275.00,
    nbuKtg: 82.50,
    quellensteuer: 412.50, // B-Ausweis
    nettoLohn: 4378.00, 
    status: "Berechnet" 
  },
  { 
    id: "6", name: "Hans Keller", position: "Werkstattleiter", 
    bruttoLohn: 8000, 
    ahvIvEo: 424.00,
    alv: 88.00,
    bvg: 480.00,
    nbuKtg: 120.00,
    quellensteuer: 0,
    nettoLohn: 6888.00, 
    status: "Berechnet" 
  },
];

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

const formatCHF = (amount: number) => {
  return amount.toLocaleString("de-CH", { minimumFractionDigits: 2 });
};

const Payroll = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const currentRun = payrollRuns.find(r => r.status === "In Bearbeitung");

  const totalBrutto = employeePayroll.reduce((sum, e) => sum + e.bruttoLohn, 0);
  const totalNetto = employeePayroll.reduce((sum, e) => sum + e.nettoLohn, 0);
  const totalAHV = employeePayroll.reduce((sum, e) => sum + e.ahvIvEo, 0);
  const totalBVG = employeePayroll.reduce((sum, e) => sum + e.bvg, 0);

  const handleStatClick = (filter: string | null) => {
    setStatusFilter(statusFilter === filter ? null : filter);
  };

  const filteredEmployees = employeePayroll.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || e.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Swissdec Export
          </Button>
          <Button>
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
                    {currentRun.employees} Mitarbeitende • Brutto: CHF {formatCHF(currentRun.grossTotal)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={statusConfig[currentRun.status].color}>
                  {currentRun.status}
                </Badge>
                <Button onClick={() => toast.success("Lohnlauf wird abgeschlossen...")}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Abschliessen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">Mitarbeitende ({currentRun?.period})</TabsTrigger>
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
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
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
                    const status = statusConfig[emp.status];
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
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success("PDF wird erstellt..."); }}>
                                PDF herunterladen
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success(`Lohnabrechnung an ${emp.name} gesendet`); }}>
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
                    const status = statusConfig[run.status];
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">{run.id}</TableCell>
                        <TableCell>{run.period}</TableCell>
                        <TableCell className="text-right">{run.employees}</TableCell>
                        <TableCell className="text-right">CHF {formatCHF(run.grossTotal)}</TableCell>
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
