import { useState } from "react";
import {
  Upload,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Download,
  Eye,
  RefreshCw,
  Link2,
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

interface BankTransaction {
  id: string;
  bookingDate: string;
  valueDate: string;
  reference: string;
  counterparty: string;
  description: string;
  amount: number;
  currency: "CHF" | "EUR";
  type: "credit" | "debit";
  status: "imported" | "matched" | "unmatched" | "ignored";
  matchedDocument?: string;
  bankAccount: string;
}

const transactions: BankTransaction[] = [
  {
    id: "1",
    bookingDate: "30.01.2024",
    valueDate: "30.01.2024",
    reference: "00 00000 00000 00000 00000 00156",
    counterparty: "Bauherr AG",
    description: "QRR Zahlung",
    amount: 31970,
    currency: "CHF",
    type: "credit",
    status: "matched",
    matchedDocument: "RE-2024-0156",
    bankAccount: "UBS Geschäftskonto",
  },
  {
    id: "2",
    bookingDate: "29.01.2024",
    valueDate: "29.01.2024",
    reference: "00 00000 00000 00000 00000 00157",
    counterparty: "Immobilien Müller",
    description: "QRR Zahlung Teilbetrag",
    amount: 5000,
    currency: "CHF",
    type: "credit",
    status: "matched",
    matchedDocument: "RE-2024-0157",
    bankAccount: "UBS Geschäftskonto",
  },
  {
    id: "3",
    bookingDate: "28.01.2024",
    valueDate: "28.01.2024",
    reference: "LOOM-2024-0045",
    counterparty: "Stahl AG Zürich",
    description: "SEPA Überweisung",
    amount: 9134.45,
    currency: "CHF",
    type: "debit",
    status: "matched",
    matchedDocument: "ERI-2024-001",
    bankAccount: "UBS Geschäftskonto",
  },
  {
    id: "4",
    bookingDate: "27.01.2024",
    valueDate: "27.01.2024",
    reference: "",
    counterparty: "UNBEKANNT",
    description: "Überweisung",
    amount: 2500,
    currency: "CHF",
    type: "credit",
    status: "unmatched",
    bankAccount: "UBS Geschäftskonto",
  },
  {
    id: "5",
    bookingDate: "26.01.2024",
    valueDate: "26.01.2024",
    reference: "LSV-001234",
    counterparty: "Swisscom",
    description: "Monatsrechnung Januar",
    amount: 245.60,
    currency: "CHF",
    type: "debit",
    status: "imported",
    bankAccount: "UBS Geschäftskonto",
  },
];

const statusStyles = {
  imported: "bg-muted text-muted-foreground",
  matched: "bg-success/10 text-success",
  unmatched: "bg-warning/10 text-warning",
  ignored: "bg-secondary text-secondary-foreground",
};

const statusLabels = {
  imported: "Importiert",
  matched: "Zugeordnet",
  unmatched: "Offen",
  ignored: "Ignoriert",
};

export default function BankImport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totalTransactions = transactions.length;
  const matchedTransactions = transactions.filter((t) => t.status === "matched").length;
  const unmatchedTransactions = transactions.filter((t) => t.status === "unmatched").length;
  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Bank-Import
          </h1>
          <p className="text-muted-foreground">
            ISO 20022 camt.054 Kontoauszüge importieren
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Auto-Match
          </Button>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            camt.054 importieren
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <Building2 className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="font-semibold text-info">Swiss ISO 20022 Standard</h3>
            <p className="text-sm text-muted-foreground">
              Unterstützt camt.052 (Intraday), camt.053 (Tagesauszug) und camt.054 (Detailauszug) 
              gemäss Schweizer Implementation Guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transaktionen</p>
              <p className="text-2xl font-bold">{totalTransactions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zugeordnet</p>
              <p className="text-2xl font-bold text-success">{matchedTransactions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold text-warning">{unmatchedTransactions}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Clock className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo-Änderung</p>
              <p className="text-2xl font-bold">
                CHF {(totalCredits - totalDebits).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Transaktion suchen..."
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
            <SelectItem value="imported">Importiert</SelectItem>
            <SelectItem value="matched">Zugeordnet</SelectItem>
            <SelectItem value="unmatched">Offen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          <div className="grid grid-cols-8 gap-4 text-sm font-medium text-muted-foreground">
            <span>Datum</span>
            <span>Valuta</span>
            <span className="col-span-2">Gegenpartei</span>
            <span>Referenz</span>
            <span className="text-right">Betrag</span>
            <span>Status</span>
            <span>Aktionen</span>
          </div>
        </div>
        
        {transactions.map((tx, index) => (
          <div
            key={tx.id}
            className="px-4 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="grid grid-cols-8 gap-4 items-center">
              <span className="font-mono text-sm">{tx.bookingDate}</span>
              <span className="font-mono text-sm">{tx.valueDate}</span>
              <div className="col-span-2">
                <p className="font-medium">{tx.counterparty}</p>
                <p className="text-sm text-muted-foreground truncate">{tx.description}</p>
              </div>
              <span className="font-mono text-xs text-muted-foreground truncate">
                {tx.reference || "-"}
              </span>
              <p className={cn(
                "font-mono font-semibold text-right",
                tx.type === "credit" ? "text-success" : "text-destructive"
              )}>
                {tx.type === "credit" ? "+" : "-"}
                {tx.currency} {tx.amount.toLocaleString()}
              </p>
              <div>
                <Badge className={statusStyles[tx.status]}>
                  {statusLabels[tx.status]}
                </Badge>
                {tx.matchedDocument && (
                  <p className="text-xs text-info mt-1 font-mono">{tx.matchedDocument}</p>
                )}
              </div>
              <div className="flex gap-1">
                {tx.status === "unmatched" && (
                  <Button size="sm" variant="outline" className="gap-1">
                    <Link2 className="h-3 w-3" />
                    Zuordnen
                  </Button>
                )}
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
