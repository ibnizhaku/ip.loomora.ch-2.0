import { useState } from "react";
import {
  Search,
  Calculator,
  Users,
  Calendar,
  Download,
  Upload,
  FileText,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface WithholdingTaxEmployee {
  id: string;
  name: string;
  permitType: "B" | "L" | "G" | "C";
  canton: string;
  municipality: string;
  tariffCode: string;
  churchTax: boolean;
  grossSalary: number;
  withholdingTax: number;
  taxRate: number;
  children: number;
  status: "active" | "exempt" | "pending";
}

const employees: WithholdingTaxEmployee[] = [
  {
    id: "1",
    name: "Pedro Santos",
    permitType: "B",
    canton: "ZH",
    municipality: "Zürich",
    tariffCode: "A1",
    churchTax: false,
    grossSalary: 6500,
    withholdingTax: 845,
    taxRate: 13.0,
    children: 0,
    status: "active",
  },
  {
    id: "2",
    name: "Maria Kowalski",
    permitType: "B",
    canton: "ZH",
    municipality: "Winterthur",
    tariffCode: "B2",
    churchTax: true,
    grossSalary: 7200,
    withholdingTax: 720,
    taxRate: 10.0,
    children: 2,
    status: "active",
  },
  {
    id: "3",
    name: "Antonio Rossi",
    permitType: "G",
    canton: "ZH",
    municipality: "Zürich",
    tariffCode: "A0",
    churchTax: false,
    grossSalary: 8500,
    withholdingTax: 1275,
    taxRate: 15.0,
    children: 0,
    status: "active",
  },
  {
    id: "4",
    name: "Svetlana Ivanova",
    permitType: "L",
    canton: "AG",
    municipality: "Baden",
    tariffCode: "C1",
    churchTax: false,
    grossSalary: 5800,
    withholdingTax: 522,
    taxRate: 9.0,
    children: 1,
    status: "active",
  },
  {
    id: "5",
    name: "Jean Dubois",
    permitType: "C",
    canton: "ZH",
    municipality: "Zürich",
    tariffCode: "-",
    churchTax: true,
    grossSalary: 9200,
    withholdingTax: 0,
    taxRate: 0,
    children: 0,
    status: "exempt",
  },
];

const permitLabels = {
  B: "Aufenthaltsbewilligung B",
  L: "Kurzaufenthaltsbewilligung L",
  G: "Grenzgängerbewilligung G",
  C: "Niederlassungsbewilligung C",
};

const permitStyles = {
  B: "bg-info/10 text-info",
  L: "bg-warning/10 text-warning",
  G: "bg-purple-500/10 text-purple-600",
  C: "bg-success/10 text-success",
};

const statusStyles = {
  active: "bg-primary/10 text-primary",
  exempt: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
};

const statusLabels = {
  active: "QST-pflichtig",
  exempt: "Befreit (C)",
  pending: "Prüfung",
};

export default function WithholdingTax() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cantonFilter, setCantonFilter] = useState("all");

  const activeEmployees = employees.filter((e) => e.status === "active");
  const totalWithholdingTax = activeEmployees.reduce((sum, e) => sum + e.withholdingTax, 0);
  const avgTaxRate = activeEmployees.length > 0
    ? activeEmployees.reduce((sum, e) => sum + e.taxRate, 0) / activeEmployees.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Quellensteuer
          </h1>
          <p className="text-muted-foreground">
            Kantonale QST-Tabellen und Abzugsberechnung
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Tarife importieren
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            QST-Abrechnung
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-warning">QST-Tarife 2024</h3>
            <p className="text-sm text-muted-foreground">
              Die kantonalen Quellensteuertarife für 2024 sind aktiv. 
              Beachten Sie: Neu gilt seit 2021 die obligatorische Berichtigung bei ordentlicher Veranlagung.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">QST-Pflichtige</p>
              <p className="text-2xl font-bold">{activeEmployees.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Calculator className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">QST Monat</p>
              <p className="text-2xl font-bold">CHF {totalWithholdingTax.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <FileText className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ø Steuersatz</p>
              <p className="text-2xl font-bold">{avgTaxRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Calendar className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Abgabefrist</p>
              <p className="text-2xl font-bold">15.02.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Mitarbeiter suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={cantonFilter} onValueChange={setCantonFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Kanton" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kantone</SelectItem>
            <SelectItem value="ZH">Zürich</SelectItem>
            <SelectItem value="AG">Aargau</SelectItem>
            <SelectItem value="BE">Bern</SelectItem>
            <SelectItem value="SG">St. Gallen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee List */}
      <div className="space-y-3">
        {employees.map((emp, index) => (
          <div
            key={emp.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted font-medium">
                  {emp.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{emp.name}</h3>
                    <Badge className={permitStyles[emp.permitType]}>
                      {emp.permitType}
                    </Badge>
                    <Badge className={statusStyles[emp.status]}>
                      {statusLabels[emp.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{emp.canton} - {emp.municipality}</span>
                    <span>•</span>
                    <span>Tarif: {emp.tariffCode}</span>
                    {emp.churchTax && <span>• Kirchensteuer</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Kinder</p>
                  <p className="font-mono">{emp.children}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Bruttolohn</p>
                  <p className="font-mono">CHF {emp.grossSalary.toLocaleString()}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">QST-Satz</p>
                  <p className="font-mono">{emp.taxRate.toFixed(1)}%</p>
                </div>

                <div className="text-right min-w-[100px]">
                  <p className="text-sm text-muted-foreground">QST-Abzug</p>
                  <p className={cn(
                    "font-mono font-bold",
                    emp.withholdingTax > 0 ? "text-destructive" : "text-success"
                  )}>
                    CHF {emp.withholdingTax.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tariff Legend */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">QST-Tarifcodes</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium">A - Alleinstehend</p>
            <p className="text-sm text-muted-foreground">Ledige ohne Unterhaltspflicht</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium">B - Verheiratet</p>
            <p className="text-sm text-muted-foreground">Alleinverdiener</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium">C - Doppelverdiener</p>
            <p className="text-sm text-muted-foreground">Verheiratet, beide erwerbstätig</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium">0-9 - Kinder</p>
            <p className="text-sm text-muted-foreground">Anzahl Kinder mit Abzug</p>
          </div>
        </div>
      </div>
    </div>
  );
}
