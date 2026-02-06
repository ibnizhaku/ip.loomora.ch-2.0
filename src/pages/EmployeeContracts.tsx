import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  FileSignature,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EmployeeContract {
  id: string;
  employeeId: string;
  employeeName: string;
  contractType: "unbefristet" | "befristet" | "temporär" | "praktikum" | "lehrvertrag";
  gavClass: "A" | "B" | "C" | "D" | "E" | "F"; // GAV Metallbau Lohnklassen
  startDate: string;
  endDate?: string;
  probationEnd?: string;
  workload: number; // Percentage 0-100
  weeklyHours: number;
  baseSalary: number; // Monthly in CHF
  status: "active" | "expiring" | "expired" | "draft";
  department: string;
  noticePeriod: string;
  vacationDays: number;
}

const contracts: EmployeeContract[] = [
  {
    id: "1",
    employeeId: "EMP-001",
    employeeName: "Max Keller",
    contractType: "unbefristet",
    gavClass: "A",
    startDate: "01.01.2020",
    probationEnd: "01.04.2020",
    workload: 100,
    weeklyHours: 42.5,
    baseSalary: 9500,
    status: "active",
    department: "Geschäftsleitung",
    noticePeriod: "3 Monate",
    vacationDays: 25,
  },
  {
    id: "2",
    employeeId: "EMP-002",
    employeeName: "Anna Meier",
    contractType: "unbefristet",
    gavClass: "B",
    startDate: "01.03.2021",
    probationEnd: "01.06.2021",
    workload: 100,
    weeklyHours: 42.5,
    baseSalary: 7200,
    status: "active",
    department: "Produktion",
    noticePeriod: "2 Monate",
    vacationDays: 22,
  },
  {
    id: "3",
    employeeId: "EMP-003",
    employeeName: "Thomas Brunner",
    contractType: "befristet",
    gavClass: "C",
    startDate: "01.06.2023",
    endDate: "31.05.2024",
    probationEnd: "01.09.2023",
    workload: 100,
    weeklyHours: 42.5,
    baseSalary: 6200,
    status: "expiring",
    department: "Montage",
    noticePeriod: "1 Monat",
    vacationDays: 20,
  },
  {
    id: "4",
    employeeId: "EMP-004",
    employeeName: "Lisa Weber",
    contractType: "unbefristet",
    gavClass: "D",
    startDate: "15.09.2022",
    probationEnd: "15.12.2022",
    workload: 80,
    weeklyHours: 34,
    baseSalary: 4960,
    status: "active",
    department: "Administration",
    noticePeriod: "2 Monate",
    vacationDays: 20,
  },
  {
    id: "5",
    employeeId: "EMP-005",
    employeeName: "Marco Steiner",
    contractType: "lehrvertrag",
    gavClass: "F",
    startDate: "01.08.2023",
    endDate: "31.07.2027",
    workload: 100,
    weeklyHours: 42.5,
    baseSalary: 850,
    status: "active",
    department: "Produktion",
    noticePeriod: "gem. OR",
    vacationDays: 25,
  },
  {
    id: "6",
    employeeId: "EMP-006",
    employeeName: "Sandra Huber",
    contractType: "temporär",
    gavClass: "E",
    startDate: "01.01.2024",
    endDate: "28.02.2024",
    workload: 100,
    weeklyHours: 42.5,
    baseSalary: 5100,
    status: "expired",
    department: "Logistik",
    noticePeriod: "7 Tage",
    vacationDays: 20,
  },
];

const gavClasses = {
  A: { label: "Klasse A - Kader/Spezialisten", minSalary: 7500, color: "bg-primary/10 text-primary" },
  B: { label: "Klasse B - Facharbeiter mit BM", minSalary: 6200, color: "bg-info/10 text-info" },
  C: { label: "Klasse C - Facharbeiter EFZ", minSalary: 5400, color: "bg-success/10 text-success" },
  D: { label: "Klasse D - Angelernte", minSalary: 4600, color: "bg-warning/10 text-warning" },
  E: { label: "Klasse E - Hilfskräfte", minSalary: 4200, color: "bg-muted text-muted-foreground" },
  F: { label: "Klasse F - Lernende", minSalary: 700, color: "bg-purple-500/10 text-purple-600" },
};

const contractTypeStyles = {
  unbefristet: "bg-success/10 text-success",
  befristet: "bg-warning/10 text-warning",
  temporär: "bg-info/10 text-info",
  praktikum: "bg-purple-500/10 text-purple-600",
  lehrvertrag: "bg-primary/10 text-primary",
};

const contractTypeLabels = {
  unbefristet: "Unbefristet",
  befristet: "Befristet",
  temporär: "Temporär",
  praktikum: "Praktikum",
  lehrvertrag: "Lehrvertrag",
};

const statusStyles = {
  active: "bg-success/10 text-success",
  expiring: "bg-warning/10 text-warning",
  expired: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
};

const statusLabels = {
  active: "Aktiv",
  expiring: "Läuft aus",
  expired: "Abgelaufen",
  draft: "Entwurf",
};

export default function EmployeeContracts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gavFilter, setGavFilter] = useState("all");

  const handleStatClick = (status: string) => {
    setStatusFilter(statusFilter === status ? "all" : status);
  };

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesGav = gavFilter === "all" || c.gavClass === gavFilter;
    return matchesSearch && matchesStatus && matchesGav;
  });

  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const expiringContracts = contracts.filter((c) => c.status === "expiring").length;
  const totalSalary = contracts
    .filter((c) => c.status === "active" || c.status === "expiring")
    .reduce((sum, c) => sum + c.baseSalary, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Arbeitsverträge
          </h1>
          <p className="text-muted-foreground">
            Mitarbeiterverträge nach GAV Metallbau verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            const csvContent = [
              ["Name", "Personal-Nr.", "Vertragsart", "GAV Klasse", "Start", "Ende", "Pensum", "Bruttolohn", "Status"].join(";"),
              ...contracts.map(c => [
                c.employeeName,
                c.employeeId,
                contractTypeLabels[c.contractType],
                `GAV ${c.gavClass}`,
                c.startDate,
                c.endDate || "-",
                `${c.workload}%`,
                `CHF ${c.baseSalary}`,
                statusLabels[c.status],
              ].join(";"))
            ].join("\n");
            
            const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "Arbeitsvertraege.csv";
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Export wurde erstellt");
          }}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => navigate("/employee-contracts/new")}>
            <Plus className="h-4 w-4" />
            Vertrag erstellen
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-primary/50",
            statusFilter === "all" && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => handleStatClick("all")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileSignature className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verträge total</p>
              <p className="text-2xl font-bold">{contracts.length}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-success/50",
            statusFilter === "active" && "border-success ring-2 ring-success/20"
          )}
          onClick={() => handleStatClick("active")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Verträge</p>
              <p className="text-2xl font-bold text-success">{activeContracts}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-warning/50",
            statusFilter === "expiring" && "border-warning ring-2 ring-warning/20"
          )}
          onClick={() => handleStatClick("expiring")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auslaufend</p>
              <p className="text-2xl font-bold text-warning">{expiringContracts}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-destructive/50",
            statusFilter === "expired" && "border-destructive ring-2 ring-destructive/20"
          )}
          onClick={() => handleStatClick("expired")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Clock className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lohnsumme/Mt.</p>
              <p className="text-2xl font-bold">CHF {totalSalary.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GAV Info Banner */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <FileSignature className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="font-semibold text-info">GAV Metallbau Schweiz</h3>
            <p className="text-sm text-muted-foreground">
              Alle Verträge basieren auf dem Gesamtarbeitsvertrag für das Schweizerische Metallgewerbe. 
              Wochenarbeitszeit: 42.5 Std. | 13. Monatslohn: obligatorisch | Mindestferien: 20 Tage (25 Tage ab 50 Jahren)
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Mitarbeiter oder ID suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="expiring">Auslaufend</SelectItem>
            <SelectItem value="expired">Abgelaufen</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gavFilter} onValueChange={setGavFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="GAV Klasse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Klassen</SelectItem>
            {Object.entries(gavClasses).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                Klasse {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contracts List */}
      <div className="space-y-3">
        {filteredContracts.map((contract, index) => (
          <div
            key={contract.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => navigate(`/employee-contracts/${contract.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {contract.employeeName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{contract.employeeName}</h3>
                    <Badge className={statusStyles[contract.status]}>
                      {statusLabels[contract.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{contract.employeeId}</span> • {contract.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Badge className={contractTypeStyles[contract.contractType]}>
                  {contractTypeLabels[contract.contractType]}
                </Badge>

                <Badge className={gavClasses[contract.gavClass].color}>
                  GAV {contract.gavClass}
                </Badge>

                <div className="text-right min-w-[100px]">
                  <p className="text-sm text-muted-foreground">Pensum</p>
                  <div className="flex items-center gap-2">
                    <Progress value={contract.workload} className="w-16 h-2" />
                    <span className="font-mono text-sm">{contract.workload}%</span>
                  </div>
                </div>

                <div className="text-right min-w-[100px]">
                  <p className="text-sm text-muted-foreground">Bruttolohn</p>
                  <p className="font-mono font-bold">CHF {contract.baseSalary.toLocaleString()}</p>
                </div>

                <div className="text-right min-w-[100px]">
                  <p className="text-sm text-muted-foreground">Vertragsbeginn</p>
                  <p className="font-mono text-sm">{contract.startDate}</p>
                  {contract.endDate && (
                    <p className="text-xs text-muted-foreground">bis {contract.endDate}</p>
                  )}
                </div>

                <div className="text-right min-w-[80px]">
                  <p className="text-sm text-muted-foreground">Ferien</p>
                  <p className="font-mono">{contract.vacationDays} Tage</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/employee-contracts/${contract.id}`); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Vertrag anzeigen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/employee-contracts/${contract.id}?edit=true`); }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success("Vertrag wird verlängert..."); }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Verlängern
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast.success("PDF wird erstellt..."); }}>
                      <Download className="h-4 w-4 mr-2" />
                      PDF exportieren
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); toast.success("Kündigungsprozess gestartet"); }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Kündigen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* GAV Legend */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">GAV Metallbau Lohnklassen (Mindestlöhne 2024)</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(gavClasses).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Badge className={value.color}>Klasse {key}</Badge>
                <span className="text-sm text-muted-foreground">
                  {key === "F" ? "Lernende" : value.label.split(" - ")[1]}
                </span>
              </div>
              <span className="font-mono text-sm">ab CHF {value.minSalary.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
