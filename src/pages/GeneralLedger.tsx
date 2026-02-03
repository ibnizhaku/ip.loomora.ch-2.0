import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  BookOpen,
  ChevronRight,
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
import { useNavigate } from "react-router-dom";

interface LedgerAccount {
  id: string;
  number: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
  lastActivity: string;
  transactionCount: number;
}

const ledgerAccounts: LedgerAccount[] = [
  {
    id: "1",
    number: "1200",
    name: "Bank",
    type: "asset",
    openingBalance: 50000,
    debitTotal: 125000,
    creditTotal: 130000,
    closingBalance: 45000,
    lastActivity: "31.01.2024",
    transactionCount: 45,
  },
  {
    id: "2",
    number: "1400",
    name: "Forderungen aus L+L",
    type: "asset",
    openingBalance: 28000,
    debitTotal: 85000,
    creditTotal: 81000,
    closingBalance: 32000,
    lastActivity: "31.01.2024",
    transactionCount: 28,
  },
  {
    id: "3",
    number: "1600",
    name: "Kasse",
    type: "asset",
    openingBalance: 3000,
    debitTotal: 5000,
    creditTotal: 5500,
    closingBalance: 2500,
    lastActivity: "26.01.2024",
    transactionCount: 12,
  },
  {
    id: "4",
    number: "3300",
    name: "Verbindlichkeiten aus L+L",
    type: "liability",
    openingBalance: 22000,
    debitTotal: 45000,
    creditTotal: 48000,
    closingBalance: 25000,
    lastActivity: "30.01.2024",
    transactionCount: 18,
  },
  {
    id: "5",
    number: "4000",
    name: "Umsatzerlöse 19%",
    type: "revenue",
    openingBalance: 0,
    debitTotal: 0,
    creditTotal: 250000,
    closingBalance: 250000,
    lastActivity: "31.01.2024",
    transactionCount: 35,
  },
  {
    id: "6",
    number: "6000",
    name: "Personalaufwand",
    type: "expense",
    openingBalance: 0,
    debitTotal: 120000,
    creditTotal: 0,
    closingBalance: 120000,
    lastActivity: "29.01.2024",
    transactionCount: 12,
  },
  {
    id: "7",
    number: "6300",
    name: "Abschreibungen",
    type: "expense",
    openingBalance: 0,
    debitTotal: 15000,
    creditTotal: 0,
    closingBalance: 15000,
    lastActivity: "28.01.2024",
    transactionCount: 6,
  },
  {
    id: "8",
    number: "6800",
    name: "Betriebskosten",
    type: "expense",
    openingBalance: 0,
    debitTotal: 25000,
    creditTotal: 0,
    closingBalance: 25000,
    lastActivity: "27.01.2024",
    transactionCount: 22,
  },
];

const typeColors = {
  asset: "bg-blue-500/10 text-blue-600",
  liability: "bg-orange-500/10 text-orange-600",
  equity: "bg-purple-500/10 text-purple-600",
  revenue: "bg-success/10 text-success",
  expense: "bg-destructive/10 text-destructive",
};

const typeLabels = {
  asset: "Aktiv",
  liability: "Passiv",
  equity: "Eigenkapital",
  revenue: "Ertrag",
  expense: "Aufwand",
};

export default function GeneralLedger() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredAccounts = ledgerAccounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.number.includes(searchQuery);
    const matchesType = typeFilter === "all" || account.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalDebit = ledgerAccounts.reduce((acc, a) => acc + a.debitTotal, 0);
  const totalCredit = ledgerAccounts.reduce((acc, a) => acc + a.creditTotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Hauptbuch
          </h1>
          <p className="text-muted-foreground">
            Übersicht aller Sachkonten mit Salden
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Konten aktiv</p>
              <p className="text-2xl font-bold">{ledgerAccounts.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Soll gesamt</p>
              <p className="text-2xl font-bold">CHF {totalDebit.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <TrendingDown className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Haben gesamt</p>
              <p className="text-2xl font-bold">CHF {totalCredit.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              totalDebit === totalCredit ? "bg-success/10" : "bg-destructive/10"
            )}>
              <BookOpen className={cn(
                "h-6 w-6",
                totalDebit === totalCredit ? "text-success" : "text-destructive"
              )} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bilanz</p>
              <p className={cn(
                "text-2xl font-bold",
                totalDebit === totalCredit ? "text-success" : "text-destructive"
              )}>
                {totalDebit === totalCredit ? "Ausgeglichen" : "Differenz"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Konto suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kontenart" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Konten</SelectItem>
            <SelectItem value="asset">Aktiv</SelectItem>
            <SelectItem value="liability">Passiv</SelectItem>
            <SelectItem value="equity">Eigenkapital</SelectItem>
            <SelectItem value="revenue">Ertrag</SelectItem>
            <SelectItem value="expense">Aufwand</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-3">
        {filteredAccounts.map((account, index) => (
          <div
            key={account.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all cursor-pointer animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => navigate(`/general-ledger/${account.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <span className="font-mono font-bold text-lg">{account.number}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{account.name}</h3>
                    <Badge className={typeColors[account.type]}>
                      {typeLabels[account.type]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {account.transactionCount} Buchungen • Letzte: {account.lastActivity}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Anfangsbestand</p>
                  <p className="font-mono font-medium">CHF {account.openingBalance.toLocaleString("de-CH")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Soll</p>
                  <p className="font-mono font-medium text-success">CHF {account.debitTotal.toLocaleString("de-CH")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Haben</p>
                  <p className="font-mono font-medium text-info">CHF {account.creditTotal.toLocaleString("de-CH")}</p>
                </div>
                <div className="text-right min-w-[120px]">
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className={cn(
                    "font-mono font-bold text-lg",
                    account.type === "revenue" && "text-success",
                    account.type === "expense" && "text-destructive"
                  )}>
                    CHF {account.closingBalance.toLocaleString("de-CH")}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
