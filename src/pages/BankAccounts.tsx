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
  Loader2,
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
import { useBankTransactions } from "@/hooks/use-bank-import";

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

const typeStyles: Record<string, string> = {
  checking: "bg-blue-500/10 text-blue-600",
  savings: "bg-success/10 text-success",
  credit: "bg-purple-500/10 text-purple-600",
};

const typeLabels: Record<string, string> = {
  checking: "Girokonto",
  savings: "Sparkonto",
  credit: "Kreditkarte",
};

const statusStyles: Record<string, string> = {
  matched: "bg-success/10 text-success",
  reconciled: "bg-success/10 text-success",
  unmatched: "bg-warning/10 text-warning",
  pending: "bg-muted text-muted-foreground",
  imported: "bg-info/10 text-info",
};

const statusLabels: Record<string, string> = {
  matched: "Zugeordnet",
  reconciled: "Zugeordnet",
  unmatched: "Offen",
  pending: "Ausstehend",
  imported: "Importiert",
};

export default function BankAccounts() {
  const navigate = useNavigate();

  // Fetch bank accounts from API
  const { data: apiData, isLoading: accountsLoading } = useQuery({
    queryKey: ["/bank-accounts"],
    queryFn: () => api.get<any>("/bank-accounts"),
  });
  const bankAccounts: BankAccount[] = (apiData?.data || apiData || []) as BankAccount[];

  // Fetch transactions from API
  const { data: txData, isLoading: txLoading } = useBankTransactions({ pageSize: 20 });
  const transactions = txData?.data || [];

  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  // Sync selectedAccount when API data arrives
  if (bankAccounts.length > 0 && !selectedAccount) {
    setSelectedAccount(bankAccounts[0]);
  }

  const totalBalance = bankAccounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  const unmatchedCount = transactions.filter((t: any) => t.status === "unmatched" || t.status === "imported").length;
  const matchedCount = transactions.filter((t: any) => t.status === "matched" || t.status === "reconciled").length;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "–";
    try {
      return new Date(dateStr).toLocaleDateString("de-CH");
    } catch {
      return dateStr;
    }
  };

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
              <p className="text-2xl font-bold">{matchedCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kontenliste */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-display font-semibold">Ihre Konten</h3>
          {accountsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <p className="text-muted-foreground text-sm">Keine Konten vorhanden</p>
            </div>
          ) : (
            bankAccounts.map((account, index) => (
              <div
                key={account.id}
                className={cn(
                  "rounded-xl border p-4 cursor-pointer transition-all animate-fade-in",
                  selectedAccount?.id === account.id
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
                  <Badge className={typeStyles[account.type] || "bg-muted text-muted-foreground"}>
                    {typeLabels[account.type] || account.type}
                  </Badge>
                </div>
                <p className={cn(
                  "text-2xl font-bold font-mono",
                  (Number(account.balance) || 0) < 0 && "text-destructive"
                )}>
                  CHF {(Number(account.balance) || 0).toLocaleString("de-CH")}
                </p>
                {account.lastSync && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Letzte Sync: {formatDate(account.lastSync)}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Transaktionen */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold">
                    Kontobewegungen - {selectedAccount?.name || "Kein Konto ausgewählt"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedAccount?.iban || "–"}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Abgleichen
                </Button>
              </div>
            </div>

            {txLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Keine Transaktionen vorhanden</p>
              </div>
            ) : (
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
                  {transactions.map((tx: any, index: number) => {
                    const amount = Number(tx.amount) || 0;
                    const isCredit = amount > 0 || tx.type === "credit";
                    const txStatus = tx.status || "pending";

                    return (
                      <TableRow
                        key={tx.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>{formatDate(tx.date || tx.valueDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isCredit ? (
                              <ArrowDownRight className="h-4 w-4 text-success" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-destructive" />
                            )}
                            <span>{tx.description || tx.remittanceInfo || "–"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tx.reference && (
                            <span className="font-mono text-sm">{tx.reference}</span>
                          )}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-mono font-medium",
                          isCredit ? "text-success" : "text-destructive"
                        )}>
                          {isCredit ? "+" : "-"}CHF {Math.abs(amount).toLocaleString("de-CH")}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusStyles[txStatus] || "bg-muted text-muted-foreground"}>
                            {statusLabels[txStatus] || txStatus}
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
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
