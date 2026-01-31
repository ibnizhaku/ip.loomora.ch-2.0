import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter,
  Euro,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
  Play,
  MoreHorizontal,
  Send,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { Separator } from "@/components/ui/separator";

const payrollRuns = [
  { id: "LR-2024-01", period: "Januar 2024", employees: 24, grossTotal: 168000, netTotal: 112560, status: "Abgeschlossen", runDate: "25.01.2024" },
  { id: "LR-2024-02", period: "Februar 2024", employees: 24, grossTotal: 172000, netTotal: 115240, status: "In Bearbeitung", runDate: "25.02.2024" },
  { id: "LR-2023-12", period: "Dezember 2023", employees: 23, grossTotal: 165500, netTotal: 110885, status: "Abgeschlossen", runDate: "22.12.2023" },
  { id: "LR-2023-11", period: "November 2023", employees: 23, grossTotal: 164200, netTotal: 110014, status: "Abgeschlossen", runDate: "24.11.2023" },
];

const employeePayroll = [
  { id: "1", name: "Max Keller", position: "CEO", grossSalary: 12000, netSalary: 7200, taxClass: "1", socialSecurity: 1200, tax: 3600, status: "Berechnet" },
  { id: "2", name: "Anna Schmidt", position: "Senior Developer", grossSalary: 6000, netSalary: 4020, taxClass: "1", socialSecurity: 600, tax: 1380, status: "Berechnet" },
  { id: "3", name: "Thomas Müller", position: "Project Manager", grossSalary: 5500, netSalary: 3685, taxClass: "3", socialSecurity: 550, tax: 1265, status: "Berechnet" },
  { id: "4", name: "Lisa Weber", position: "UX Designer", grossSalary: 4800, netSalary: 3216, taxClass: "1", socialSecurity: 480, tax: 1104, status: "Prüfung" },
  { id: "5", name: "Sarah Koch", position: "Marketing Manager", grossSalary: 5200, netSalary: 3484, taxClass: "4", socialSecurity: 520, tax: 1196, status: "Berechnet" },
  { id: "6", name: "Michael Braun", position: "Backend Developer", grossSalary: 5000, netSalary: 3350, taxClass: "1", socialSecurity: 500, tax: 1150, status: "Berechnet" },
];

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Abgeschlossen": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "In Bearbeitung": { color: "bg-warning/10 text-warning", icon: Clock },
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileText },
  "Berechnet": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Prüfung": { color: "bg-warning/10 text-warning", icon: AlertCircle },
};

const stats = [
  { title: "Mitarbeiter", value: "24", icon: Users, change: "+2 vs. Vormonat" },
  { title: "Bruttolohnsumme", value: "€172.000", icon: Euro, change: "+2.4%" },
  { title: "Nettolohnsumme", value: "€115.240", icon: TrendingUp, change: "+2.4%" },
  { title: "Nächster Lohnlauf", value: "25.02.", icon: Calendar, change: "In 5 Tagen" },
];

const Payroll = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const currentRun = payrollRuns.find(r => r.status === "In Bearbeitung");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Lohnabrechnung</h1>
          <p className="text-muted-foreground">Verwalten Sie Gehaltsabrechnungen und Lohnläufe</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            DATEV Export
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Lohnlauf starten
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                    {currentRun.employees} Mitarbeiter • Brutto: €{currentRun.grossTotal.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={statusConfig[currentRun.status].color}>
                  {currentRun.status}
                </Badge>
                <Button>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Abschließen
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Fortschritt</span>
                <span>22 von 24 Mitarbeitern berechnet</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">Mitarbeiter ({currentRun?.period})</TabsTrigger>
          <TabsTrigger value="history">Lohnlauf-Historie</TabsTrigger>
          <TabsTrigger value="reports">Auswertungen</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Mitarbeiter suchen..."
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
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Steuerklasse</TableHead>
                    <TableHead className="text-right">Brutto</TableHead>
                    <TableHead className="text-right">Sozialabgaben</TableHead>
                    <TableHead className="text-right">Lohnsteuer</TableHead>
                    <TableHead className="text-right">Netto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeePayroll.map((emp) => {
                    const status = statusConfig[emp.status];
                    return (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <div>
                            <Link to={`/hr/${emp.id}`} className="font-medium hover:text-primary">
                              {emp.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{emp.position}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Klasse {emp.taxClass}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">€{emp.grossSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">€{emp.socialSecurity.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">€{emp.tax.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold text-success">€{emp.netSalary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>{emp.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Lohnabrechnung anzeigen</DropdownMenuItem>
                              <DropdownMenuItem>PDF herunterladen</DropdownMenuItem>
                              <DropdownMenuItem>Per E-Mail senden</DropdownMenuItem>
                              <DropdownMenuItem>Korrigieren</DropdownMenuItem>
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

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Zusammenfassung {currentRun?.period}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Bruttolohnsumme</p>
                  <p className="text-2xl font-bold">€{currentRun?.grossTotal.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Arbeitgeberanteil SV</p>
                  <p className="text-2xl font-bold">€{(currentRun?.grossTotal ? currentRun.grossTotal * 0.2 : 0).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nettolohnsumme</p>
                  <p className="text-2xl font-bold text-success">€{currentRun?.netTotal.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lohnlauf</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-right">Mitarbeiter</TableHead>
                    <TableHead className="text-right">Brutto</TableHead>
                    <TableHead className="text-right">Netto</TableHead>
                    <TableHead>Durchgeführt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
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
                        <TableCell className="text-right">€{run.grossTotal.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">€{run.netTotal.toLocaleString()}</TableCell>
                        <TableCell>{run.runDate}</TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {run.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Details anzeigen</DropdownMenuItem>
                              <DropdownMenuItem>DATEV Export</DropdownMenuItem>
                              <DropdownMenuItem>Alle PDFs herunterladen</DropdownMenuItem>
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

        <TabsContent value="reports">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lohnentwicklung 2024</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Januar</span>
                    <span className="font-medium">€168.000</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Februar (Prognose)</span>
                    <span className="font-medium">€172.000</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Jahresmeldungen erstellen
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Lohnjournal exportieren
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Lohnabrechnungen versenden
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payroll;
