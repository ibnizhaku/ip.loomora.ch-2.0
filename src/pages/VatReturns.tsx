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
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Schweizer MWST-Sätze (ab 2024)
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


// Schweizer MWST-Positionen (effektive Methode)
const vatPositions = [
  { kz: "200", label: "Total der vereinbarten Entgelte (inkl. MWST)", netto: 1060550, ust: null },
  { kz: "205", label: "Von der Steuer befreite Leistungen (Export Art. 23)", netto: 125000, ust: null },
  { kz: "220", label: "Von der Steuer ausgenommene Leistungen (Art. 21)", netto: 35000, ust: null },
  { kz: "302", label: "Normalsatz (8.1%)", netto: 880000, ust: 71280 },
  { kz: "312", label: "Reduzierter Satz (2.6%)", netto: 45000, ust: 1170 },
  { kz: "342", label: "Sondersatz Beherbergung (3.8%)", netto: 0, ust: 0 },
  { kz: "382", label: "Bezugsteuer", netto: 25000, ust: 2025 },
];

const vorsteuerPositions = [
  { kz: "400", label: "Vorsteuer auf Material und Dienstleistungen", ust: 43700 },
  { kz: "405", label: "Vorsteuer auf Investitionen", ust: 8500 },
  { kz: "410", label: "Einlageentsteuerung", ust: 0 },
];

const formatCHF = (amount: number) => {
  return amount.toLocaleString("de-CH", { minimumFractionDigits: 2 });
};

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  calculated: "bg-blue-500/10 text-blue-600",
  submitted: "bg-blue-500/10 text-blue-600",
  accepted: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  overdue: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  calculated: "Berechnet",
  submitted: "Übermittelt",
  accepted: "Akzeptiert",
  rejected: "Abgelehnt",
  overdue: "Überfällig",
};

export default function VatReturns() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-Q4");
  const [year, setYear] = useState("2024");

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/vat-returns"],
    queryFn: () => api.get<any>("/vat-returns"),
  });
  const vatPeriods = apiData?.data || [];
  const currentPeriod = vatPeriods.find((p) => p.period === selectedPeriod);

  const totalOutputVat = vatPeriods
    .filter((p) => p.status === "accepted")
    .reduce((acc, p) => acc + p.outputVat, 0);
  const totalInputVat = vatPeriods
    .filter((p) => p.status === "accepted")
    .reduce((acc, p) => acc + p.inputVat, 0);
  const totalPayable = totalOutputVat - totalInputVat;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            MWST-Abrechnung
          </h1>
          <p className="text-muted-foreground">
            Schweizer Mehrwertsteuer (effektive Methode)
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              if (!currentPeriod) return;
              const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<VATDeclaration xmlns="http://www.ech.ch/xmlns/eCH-0217/1">
  <declarationHeader>
    <declarationKind>1</declarationKind>
    <senderId>CHE-123.456.789</senderId>
    <recipientId>CH-ESTV</recipientId>
    <referenceMessageId>${currentPeriod.period}</referenceMessageId>
    <businessProcessId>1</businessProcessId>
    <declarationDate>${new Date().toISOString().split('T')[0]}</declarationDate>
  </declarationHeader>
  <vatDeclaration>
    <taxPeriod>
      <periodFrom>${currentPeriod.period.split('-')[0]}-${currentPeriod.period.includes('Q1') ? '01' : currentPeriod.period.includes('Q2') ? '04' : currentPeriod.period.includes('Q3') ? '07' : '10'}-01</periodFrom>
      <periodTo>${currentPeriod.period.split('-')[0]}-${currentPeriod.period.includes('Q1') ? '03' : currentPeriod.period.includes('Q2') ? '06' : currentPeriod.period.includes('Q3') ? '09' : '12'}-${currentPeriod.period.includes('Q1') ? '31' : currentPeriod.period.includes('Q2') ? '30' : currentPeriod.period.includes('Q3') ? '30' : '31'}</periodTo>
    </taxPeriod>
    <totalRevenue>1060550</totalRevenue>
    <taxableRevenue302>880000</taxableRevenue302>
    <taxableRevenue312>45000</taxableRevenue312>
    <outputVat>${currentPeriod.outputVat}</outputVat>
    <inputVat>${currentPeriod.inputVat}</inputVat>
    <payableAmount>${currentPeriod.payable}</payableAmount>
  </vatDeclaration>
</VATDeclaration>`;
              const blob = new Blob([xmlContent], { type: 'application/xml' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `MWST-${currentPeriod.period}.xml`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast.success(`XML für ${currentPeriod.periodLabel} exportiert`);
            }}
          >
            <Download className="h-4 w-4" />
            XML Export
          </Button>
          <Button 
            className="gap-2"
            onClick={() => {
              if (!currentPeriod) return;
              if (currentPeriod.status !== 'draft') {
                toast.error('Diese Periode wurde bereits übermittelt');
                return;
              }
              toast.success(`MwSt-Abrechnung ${currentPeriod.periodLabel} wurde an ESTV übermittelt`);
            }}
          >
            <Send className="h-4 w-4" />
            MwSt übermitteln
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="flex items-center gap-3 py-3">
          <Info className="h-5 w-5 text-blue-600" />
          <div className="text-sm">
            <span className="font-medium">MWST-Sätze ab 01.01.2024:</span> Normalsatz 8.1% | Reduzierter Satz 2.6% | Beherbergung 3.8%
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <Calculator className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Umsatzsteuer</p>
              <p className="text-2xl font-bold">CHF {formatCHF(currentPeriod?.outputVat || 0)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Calculator className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vorsteuer</p>
              <p className="text-2xl font-bold text-success">CHF {formatCHF(currentPeriod?.inputVat || 0)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zahllast</p>
              <p className="text-2xl font-bold text-warning">CHF {formatCHF(currentPeriod?.payable || 0)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fälligkeit</p>
              <p className="text-2xl font-bold">{currentPeriod?.dueDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Perioden-Übersicht */}
        <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">
            Abrechnungsperioden
          </h3>
          <div className="space-y-2">
            {vatPeriods.map((period, index) => (
              <div
                key={period.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                  selectedPeriod === period.period
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted/50"
                )}
                onClick={() => setSelectedPeriod(period.period)}
              >
                <div>
                  <p className="font-medium">{period.periodLabel}</p>
                  <p className="text-sm text-muted-foreground">
                    Fällig: {period.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusStyles[period.status] ?? statusStyles.draft}>
                    {statusLabels[period.status] ?? period.status}
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
              <Card>
                <CardHeader>
                  <CardTitle>MWST-Abrechnung {currentPeriod.periodLabel}</CardTitle>
                  <CardDescription>Formular Nr. 050 für die ESTV</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Ziffer</TableHead>
                        <TableHead>Beschreibung</TableHead>
                        <TableHead className="text-right">Umsatz</TableHead>
                        <TableHead className="text-right">Steuer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="font-semibold">I. Umsatz</TableCell>
                      </TableRow>
                      {vatPositions.slice(0, 3).map((pos) => (
                        <TableRow key={pos.kz}>
                          <TableCell className="font-mono font-medium">{pos.kz}</TableCell>
                          <TableCell>{pos.label}</TableCell>
                          <TableCell className="text-right font-mono">CHF {formatCHF(pos.netto!)}</TableCell>
                          <TableCell className="text-right">-</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="font-semibold">II. Steuerberechnung</TableCell>
                      </TableRow>
                      {vatPositions.slice(3).map((pos) => (
                        <TableRow key={pos.kz}>
                          <TableCell className="font-mono font-medium">{pos.kz}</TableCell>
                          <TableCell>{pos.label}</TableCell>
                          <TableCell className="text-right font-mono">CHF {formatCHF(pos.netto!)}</TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            CHF {formatCHF(pos.ust!)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-mono font-medium">399</TableCell>
                        <TableCell className="font-semibold">Total geschuldete Steuer</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono font-semibold">CHF {formatCHF(currentPeriod.outputVat)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="font-semibold">III. Vorsteuer</TableCell>
                      </TableRow>
                      {vorsteuerPositions.map((pos) => (
                        <TableRow key={pos.kz}>
                          <TableCell className="font-mono font-medium">{pos.kz}</TableCell>
                          <TableCell>{pos.label}</TableCell>
                          <TableCell></TableCell>
                          <TableCell className="text-right font-mono text-success">CHF {formatCHF(pos.ust)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell className="font-mono font-medium">479</TableCell>
                        <TableCell className="font-semibold">Total Vorsteuer</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono font-semibold text-success">CHF {formatCHF(currentPeriod.inputVat)}</TableCell>
                      </TableRow>
                      <TableRow className="border-t-2 bg-primary/5">
                        <TableCell className="font-mono font-bold">500</TableCell>
                        <TableCell className="font-bold">Zu bezahlender Betrag</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono font-bold text-lg">CHF {formatCHF(currentPeriod.payable)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Zahlung an ESTV</h3>
                      <p className="text-muted-foreground">Fällig bis {currentPeriod.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">CHF {formatCHF(currentPeriod.payable)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        IBAN: CH93 0076 2011 6238 5295 7
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
