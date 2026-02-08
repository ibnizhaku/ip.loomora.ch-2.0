import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Edit,
  Link2,
  TrendingUp,
  CheckCircle,
  Clock,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  iban: string;
  bic: string;
  balance: number;
  currency: string;
  type: "checking" | "savings" | "credit";
  lastSync: string;
  status: "active" | "inactive";
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  status: "matched" | "unmatched" | "pending";
  reference?: string;
}

const mockBankAccounts: BankAccount[] = [
  {
    id: "1",
    name: "Geschäftskonto Hauptkonto",
    bank: "UBS Switzerland AG",
    iban: "CH93 0076 2011 6238 5295 7",
    bic: "UBSWCHZH80A",
    balance: 145320.50,
    currency: "CHF",
    type: "checking",
    lastSync: "31.01.2024 14:30",
    status: "active",
  },
  {
    id: "2",
    name: "Sparkonto Rücklagen",
    bank: "Raiffeisen Schweiz",
    iban: "CH39 8080 8001 2345 6789 0",
    bic: "RAABORXXX",
    balance: 50000.00,
    currency: "CHF",
    type: "savings",
    lastSync: "31.01.2024 08:00",
    status: "active",
  },
  {
    id: "3",
    name: "Kreditkarte Business",
    bank: "Viseca Card Services",
    iban: "-",
    bic: "-",
    balance: -2340.00,
    currency: "CHF",
    type: "credit",
    lastSync: "30.01.2024 23:00",
    status: "active",
  },
  {
    id: "4",
    name: "Zahlungsverkehr",
    bank: "PostFinance AG",
    iban: "CH58 0900 0000 1234 5678 9",
    bic: "POFICHBEXXX",
    balance: 28450.00,
    currency: "CHF",
    type: "checking",
    lastSync: "31.01.2024 12:00",
    status: "active",
  },
];

const recentTransactions: Transaction[] = [
  {
    id: "1",
    date: "31.01.2024",
    description: "Zahlung Fashion Store GmbH",
    amount: 15000,
    type: "credit",
    status: "matched",
    reference: "RE-2024-089",
  },
  {
    id: "2",
    date: "30.01.2024",
    description: "SEPA Lastschrift Software AG",
    amount: 2500,
    type: "debit",
    status: "matched",
    reference: "ER-2024-044",
  },
  {
    id: "3",
    date: "29.01.2024",
    description: "Gehaltszahlung Januar",
    amount: 45000,
    type: "debit",
    status: "matched",
  },
  {
    id: "4",
    date: "28.01.2024",
    description: "Überweisung unbekannt",
    amount: 1250,
    type: "credit",
    status: "unmatched",
  },
  {
    id: "5",
    date: "27.01.2024",
    description: "Dauerauftrag Miete",
    amount: 3500,
    type: "debit",
    status: "pending",
  },
];

const typeStyles = {
  checking: "bg-blue-500/10 text-blue-600",
  savings: "bg-success/10 text-success",
  credit: "bg-purple-500/10 text-purple-600",
};

const typeLabels = {
  checking: "Girokonto",
  savings: "Sparkonto",
  credit: "Kreditkarte",
};

const statusStyles = {
  matched: "bg-success/10 text-success",
  unmatched: "bg-warning/10 text-warning",
  pending: "bg-muted text-muted-foreground",
};

const statusLabels = {
  matched: "Zugeordnet",
  unmatched: "Offen",
  pending: "Ausstehend",
};

export default function BankAccounts() {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0]);

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/bank-accounts"],
    queryFn: () => api.get<any>("/bank-accounts"),
  });
  const bankAccounts = apiData?.data || mockBankAccounts;

  const totalBalance = bankAccounts.reduce((acc, a) => acc + a.balance, 0);
  const unmatchedCount = recentTransactions.filter((t) => t.status === "unmatched").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Bankkonten
          </h1>
          <p className="text-muted-foreground">
            Kontoübersicht und Bankabgleich
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/bank-import")}>
            <FileUp className="h-4 w-4" />
            Bank-Import
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Konten werden synchronisiert...")}>
            <RefreshCw className="h-4 w-4" />
            Synchronisieren
          </Button>
          <Button className="gap-2" onClick={() => navigate("/bank-accounts/new")}>
            <Plus className="h-4 w-4" />
            Konto hinzufügen
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Landmark className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamtsaldo</p>
              <p className="text-2xl font-bold">CHF {totalBalance.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Konten</p>
              <p className="text-2xl font-bold">{bankAccounts.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offene Buchungen</p>
              <p className="text-2xl font-bold text-warning">{unmatchedCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <CheckCircle className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zugeordnet (Monat)</p>
              <p className="text-2xl font-bold">
                {recentTransactions.filter((t) => t.status === "matched").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kontenliste */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-display font-semibold">Ihre Konten</h3>
          {bankAccounts.map((account, index) => (
            <div
              key={account.id}
              className={cn(
                "rounded-xl border p-4 cursor-pointer transition-all animate-fade-in",
                selectedAccount.id === account.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedAccount(account)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-sm text-muted-foreground">{account.bank}</p>
                </div>
                <Badge className={typeStyles[account.type]}>
                  {typeLabels[account.type]}
                </Badge>
              </div>
              <p className={cn(
                "text-2xl font-bold font-mono",
                account.balance < 0 && "text-destructive"
              )}>
                CHF {account.balance.toLocaleString("de-CH")}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Letzte Sync: {account.lastSync}
              </p>
            </div>
          ))}
        </div>

        {/* Transaktionen */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold">
                    Kontobewegungen - {selectedAccount.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedAccount.iban}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Abgleichen
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Referenz</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx, index) => (
                  <TableRow
                    key={tx.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.type === "credit" ? (
                          <ArrowDownRight className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                        <span>{tx.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tx.reference && (
                        <span className="font-mono text-sm">{tx.reference}</span>
                      )}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-mono font-medium",
                      tx.type === "credit" ? "text-success" : "text-destructive"
                    )}>
                      {tx.type === "credit" ? "+" : "-"}CHF {tx.amount.toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[tx.status]}>
                        {statusLabels[tx.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link2 className="h-4 w-4 mr-2" />
                            Zuordnen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
