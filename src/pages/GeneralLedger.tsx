import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  BookOpen,
  ChevronRight,
  X,
  Calendar,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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

const mockLedgerAccounts: LedgerAccount[] = [
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

const formatCHF = (amount: number) => `CHF ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;

export default function GeneralLedger() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/journal-entries"],
    queryFn: () => api.get<any>("/journal-entries"),
  });
  const ledgerAccounts = apiData?.data || mockLedgerAccounts;
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [hasActivityFilter, setHasActivityFilter] = useState(false);
  const [minTransactions, setMinTransactions] = useState(0);

  const filteredAccounts = ledgerAccounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.number.includes(searchQuery);
    const matchesType = typeFilter === "all" || account.type === typeFilter;
    const matchesActivity = !hasActivityFilter || account.transactionCount >= minTransactions;
    return matchesSearch && matchesType && matchesActivity;
  });

  const totalDebit = filteredAccounts.reduce((acc, a) => acc + a.debitTotal, 0);
  const totalCredit = filteredAccounts.reduce((acc, a) => acc + a.creditTotal, 0);
  const activeFilters = (typeFilter !== "all" ? 1 : 0) + (hasActivityFilter ? 1 : 0);

  const handleExport = () => {
    const csvContent = "Kontonummer;Kontoname;Typ;Anfangsbestand CHF;Soll CHF;Haben CHF;Saldo CHF;Letzte Aktivität;Buchungen\n" +
      filteredAccounts.map(acc => 
        `${acc.number};${acc.name};${typeLabels[acc.type]};${acc.openingBalance};${acc.debitTotal};${acc.creditTotal};${acc.closingBalance};${acc.lastActivity};${acc.transactionCount}`
      ).join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hauptbuch-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Hauptbuch exportiert");
  };

  const resetFilters = () => {
    setTypeFilter("all");
    setHasActivityFilter(false);
    setMinTransactions(0);
  };

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
          <Button variant="outline" className="gap-2" onClick={handleExport}>
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
              <p className="text-2xl font-bold">{filteredAccounts.length}</p>
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
              <p className="text-2xl font-bold">{formatCHF(totalDebit)}</p>
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
              <p className="text-2xl font-bold">{formatCHF(totalCredit)}</p>
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
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
              {activeFilters > 0 && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs">{activeFilters}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Erweiterte Filter</h4>
                {activeFilters > 0 && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Zurücksetzen
                  </Button>
                )}
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Aktivität</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-activity"
                      checked={hasActivityFilter}
                      onCheckedChange={(checked) => setHasActivityFilter(!!checked)}
                    />
                    <label htmlFor="has-activity" className="text-sm">Nur aktive Konten</label>
                  </div>
                  {hasActivityFilter && (
                    <div className="ml-6">
                      <label className="text-sm text-muted-foreground">Min. Buchungen:</label>
                      <Input
                        type="number"
                        min={0}
                        value={minTransactions}
                        onChange={(e) => setMinTransactions(parseInt(e.target.value) || 0)}
                        className="mt-1 w-24"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
                  <p className="font-mono font-medium">{formatCHF(account.openingBalance)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Soll</p>
                  <p className="font-mono font-medium text-success">{formatCHF(account.debitTotal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Haben</p>
                  <p className="font-mono font-medium text-info">{formatCHF(account.creditTotal)}</p>
                </div>
                <div className="text-right min-w-[120px]">
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className={cn(
                    "font-mono font-bold text-lg",
                    account.type === "revenue" && "text-success",
                    account.type === "expense" && "text-destructive"
                  )}>
                    {formatCHF(account.closingBalance)}
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
