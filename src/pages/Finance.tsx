import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AddTransactionDialog } from "@/components/finance/AddTransactionDialog";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  status: "completed" | "pending";
}

// Helper function for Swiss CHF formatting
const formatCHF = (amount: number) => {
  return amount.toLocaleString("de-CH", { minimumFractionDigits: 0 });
};

const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Zahlung von Fashion Store GmbH",
    category: "Einnahmen",
    amount: 15000,
    type: "income",
    date: "01.02.2024",
    status: "completed",
  },
  {
    id: "2",
    description: "Software-Lizenzen",
    category: "Betriebskosten",
    amount: 2500,
    type: "expense",
    date: "31.01.2024",
    status: "completed",
  },
  {
    id: "3",
    description: "Zahlung von FinTech Solutions",
    category: "Einnahmen",
    amount: 25000,
    type: "income",
    date: "30.01.2024",
    status: "pending",
  },
  {
    id: "4",
    description: "Büromaterial",
    category: "Betriebskosten",
    amount: 350,
    type: "expense",
    date: "29.01.2024",
    status: "completed",
  },
  {
    id: "5",
    description: "Gehälter Januar",
    category: "Personal",
    amount: 45000,
    type: "expense",
    date: "28.01.2024",
    status: "completed",
  },
  {
    id: "6",
    description: "Zahlung von Sales Pro AG",
    category: "Einnahmen",
    amount: 8500,
    type: "income",
    date: "27.01.2024",
    status: "completed",
  },
];

const monthlyData = [
  { month: "Aug", income: 85000, expense: 62000 },
  { month: "Sep", income: 92000, expense: 58000 },
  { month: "Okt", income: 78000, expense: 65000 },
  { month: "Nov", income: 105000, expense: 72000 },
  { month: "Dez", income: 125000, expense: 85000 },
  { month: "Jan", income: 98000, expense: 68000 },
];

export default function Finance() {
  const navigate = useNavigate();
  const [transactionList, setTransactionList] = useState<Transaction[]>(initialTransactions);

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/finance"],
    queryFn: () => api.get<any>("/finance"),
  });
  const initialTransactions = apiData?.data || mockTransactions;
  
  const totalIncome = transactionList
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactionList
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleTransactionAdded = (transaction: Transaction) => {
    setTransactionList([transaction, ...transactionList]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Finanzen
          </h1>
          <p className="text-muted-foreground">
            Übersicht über Ihre Einnahmen und Ausgaben
          </p>
        </div>
        <AddTransactionDialog onTransactionAdded={handleTransactionAdded} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kontostand</p>
              <p className="text-2xl font-bold">CHF {formatCHF(balance)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Einnahmen (Monat)</p>
              <p className="text-2xl font-bold text-success">
                CHF {formatCHF(totalIncome)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausgaben (Monat)</p>
              <p className="text-2xl font-bold text-destructive">
                CHF {formatCHF(totalExpense)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <PiggyBank className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gewinn (Monat)</p>
              <p className="text-2xl font-bold">
                CHF {formatCHF(totalIncome - totalExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">
            Einnahmen vs. Ausgaben
          </h3>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtern
          </Button>
        </div>

        <div className="h-64 flex items-end justify-between gap-4">
          {monthlyData.map((data) => (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 items-end justify-center h-48">
                <div
                  className="w-5 bg-success rounded-t transition-all hover:opacity-80"
                  style={{ height: `${(data.income / 150000) * 100}%` }}
                  title={`Einnahmen: CHF ${formatCHF(data.income)}`}
                />
                <div
                  className="w-5 bg-destructive/70 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${(data.expense / 150000) * 100}%` }}
                  title={`Ausgaben: CHF ${formatCHF(data.expense)}`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{data.month}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-success" />
            <span className="text-sm text-muted-foreground">Einnahmen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-destructive/70" />
            <span className="text-sm text-muted-foreground">Ausgaben</span>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">
            Letzte Transaktionen
          </h3>
          <Button variant="link" className="text-primary" onClick={() => navigate("/journal-entries")}>
            Alle anzeigen
          </Button>
        </div>

        <div className="space-y-3">
          {transactionList.map((transaction, index) => (
            <div
              key={transaction.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/journal-entries/${transaction.id}`)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    transaction.type === "income"
                      ? "bg-success/10"
                      : "bg-destructive/10"
                  )}
                >
                  {transaction.type === "income" ? (
                    <ArrowDownRight className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.category} • {transaction.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {transaction.status === "pending" && (
                  <Badge variant="outline" className="bg-warning/10 text-warning">
                    Ausstehend
                  </Badge>
                )}
                <p
                  className={cn(
                    "font-display font-semibold",
                    transaction.type === "income"
                      ? "text-success"
                      : "text-destructive"
                  )}
                >
                  {transaction.type === "income" ? "+" : "-"}CHF {formatCHF(transaction.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
