import { useState } from "react";
import {
  Download,
  Upload,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  FileText,
  Calculator,
  Euro,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface VatPeriod {
  id: string;
  period: string;
  periodLabel: string;
  dueDate: string;
  outputVat: number;
  inputVat: number;
  payable: number;
  status: "draft" | "submitted" | "accepted" | "overdue";
  submittedDate?: string;
}

const vatPeriods: VatPeriod[] = [
  {
    id: "1",
    period: "2024-01",
    periodLabel: "Januar 2024",
    dueDate: "10.02.2024",
    outputVat: 47500,
    inputVat: 12500,
    payable: 35000,
    status: "draft",
  },
  {
    id: "2",
    period: "2023-12",
    periodLabel: "Dezember 2023",
    dueDate: "10.01.2024",
    outputVat: 52000,
    inputVat: 15000,
    payable: 37000,
    status: "submitted",
    submittedDate: "08.01.2024",
  },
  {
    id: "3",
    period: "2023-11",
    periodLabel: "November 2023",
    dueDate: "10.12.2023",
    outputVat: 45000,
    inputVat: 13500,
    payable: 31500,
    status: "accepted",
    submittedDate: "05.12.2023",
  },
  {
    id: "4",
    period: "2023-10",
    periodLabel: "Oktober 2023",
    dueDate: "10.11.2023",
    outputVat: 38000,
    inputVat: 11000,
    payable: 27000,
    status: "accepted",
    submittedDate: "08.11.2023",
  },
  {
    id: "5",
    period: "2023-Q3",
    periodLabel: "Q3 2023",
    dueDate: "10.10.2023",
    outputVat: 125000,
    inputVat: 38000,
    payable: 87000,
    status: "accepted",
    submittedDate: "09.10.2023",
  },
];

const vatPositions = [
  { kz: "81", label: "Steuerpflichtige Umsätze 19%", netto: 250000, ust: 47500 },
  { kz: "86", label: "Steuerpflichtige Umsätze 7%", netto: 0, ust: 0 },
  { kz: "35", label: "Innergemeinschaftliche Lieferungen", netto: 15000, ust: 0 },
  { kz: "66", label: "Vorsteuer aus Rechnungen", netto: null, ust: 11500 },
  { kz: "67", label: "Vorsteuer aus innergemeinschaftlichem Erwerb", netto: null, ust: 1000 },
];

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-500/10 text-blue-600",
  accepted: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  draft: "Entwurf",
  submitted: "Übermittelt",
  accepted: "Akzeptiert",
  overdue: "Überfällig",
};

export default function VatReturns() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01");
  const [year, setYear] = useState("2024");

  const currentPeriod = vatPeriods.find((p) => p.period === selectedPeriod);

  const totalOutputVat = vatPeriods
    .filter((p) => p.period.startsWith(year))
    .reduce((acc, p) => acc + p.outputVat, 0);
  const totalInputVat = vatPeriods
    .filter((p) => p.period.startsWith(year))
    .reduce((acc, p) => acc + p.inputVat, 0);
  const totalPayable = totalOutputVat - totalInputVat;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Umsatzsteuer-Voranmeldung
          </h1>
          <p className="text-muted-foreground">
            USt-VA nach §18 UStG - ELSTER-Übermittlung
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            ELSTER XML
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <Euro className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">USt (Ausgang)</p>
              <p className="text-2xl font-bold">€{totalOutputVat.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Euro className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">VSt (Eingang)</p>
              <p className="text-2xl font-bold text-success">€{totalInputVat.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Calculator className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zahllast {year}</p>
              <p className="text-2xl font-bold text-warning">€{totalPayable.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Übermittelt</p>
              <p className="text-2xl font-bold">
                {vatPeriods.filter((p) => p.status === "accepted" || p.status === "submitted").length} / {vatPeriods.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Perioden-Übersicht */}
        <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">
            Meldezeiträume
          </h3>
          <div className="space-y-2">
            {vatPeriods.map((period, index) => (
              <div
                key={period.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all animate-fade-in",
                  selectedPeriod === period.period
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedPeriod(period.period)}
              >
                <div>
                  <p className="font-medium">{period.periodLabel}</p>
                  <p className="text-sm text-muted-foreground">
                    Fällig: {period.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusStyles[period.status]}>
                    {statusLabels[period.status]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail-Ansicht */}
        <div className="lg:col-span-2 space-y-6">
          {currentPeriod && (
            <>
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display font-semibold text-lg">
                      USt-VA {currentPeriod.periodLabel}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Fällig am {currentPeriod.dueDate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {currentPeriod.status === "draft" && (
                      <Button className="gap-2">
                        <Send className="h-4 w-4" />
                        An ELSTER übermitteln
                      </Button>
                    )}
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Kz.</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead className="text-right">Bemessungsgrundlage</TableHead>
                      <TableHead className="text-right">Steuer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vatPositions.map((pos) => (
                      <TableRow key={pos.kz}>
                        <TableCell className="font-mono font-medium">{pos.kz}</TableCell>
                        <TableCell>{pos.label}</TableCell>
                        <TableCell className="text-right font-mono">
                          {pos.netto !== null ? `€${pos.netto.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          €{pos.ust.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Umsatzsteuer</p>
                      <p className="text-xl font-bold font-mono">€{currentPeriod.outputVat.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-sm text-muted-foreground">Vorsteuer</p>
                      <p className="text-xl font-bold font-mono text-success">-€{currentPeriod.inputVat.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10">
                      <p className="text-sm text-muted-foreground">Zahllast</p>
                      <p className="text-xl font-bold font-mono text-primary">€{currentPeriod.payable.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {currentPeriod.status !== "draft" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h4 className="font-semibold mb-4">Übermittlungsstatus</h4>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      currentPeriod.status === "accepted" ? "bg-success/10" : "bg-blue-500/10"
                    )}>
                      {currentPeriod.status === "accepted" ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {currentPeriod.status === "accepted"
                          ? "Erfolgreich übermittelt und akzeptiert"
                          : "Übermittelt - Warte auf Bestätigung"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Übermittelt am {currentPeriod.submittedDate}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
