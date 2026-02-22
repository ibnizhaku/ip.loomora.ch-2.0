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
  Plus,
  CreditCard,
  Target,
  Landmark,
  BookOpen,
  FileText,
  Scale,
  Calculator,
  UserPlus2,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFinanceMonthlySummary } from "@/hooks/use-finance";
import { useJournalEntries } from "@/hooks/use-journal-entries";

const formatCHF = (amount: number) => {
  return amount.toLocaleString("de-CH", { minimumFractionDigits: 0 });
};

export default function Finance() {
  const navigate = useNavigate();

  // Fetch monthly summary for chart
  const { data: monthlySummary } = useFinanceMonthlySummary();
  const monthlyData = (monthlySummary as any[]) || [];

  // Fetch recent journal entries as transactions
  const { data: journalData } = useJournalEntries({ pageSize: 10 });
  const recentEntries = journalData?.data || [];

  // Calculate totals from monthly data
  const currentMonth = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : null;
  const totalIncome = currentMonth?.income || 0;
  const totalExpense = currentMonth?.expense || 0;
  const balance = monthlyData.reduce((acc: number, m: any) => acc + (m.profit || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Finanzen
          </h1>
          <p className="text-muted-foreground">
            Übersicht über Ihre Einnahmen und Ausgaben
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/cash-book")}>
            Kassenbuch
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate("/journal-entries/new")}>
            <Plus className="h-4 w-4" />
            Transaktion hinzufügen
          </Button>
        </div>
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

      {/* Buchhaltung Quick Links */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Buchhaltung – Schnellzugriff</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button onClick={() => navigate("/cash-book")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <Wallet className="h-6 w-6 text-primary" />
            <span>Kassenbuch</span>
          </button>
          <button onClick={() => navigate("/cost-centers")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <Target className="h-6 w-6 text-primary" />
            <span>Kostenstellen</span>
          </button>
          <button onClick={() => navigate("/budgets")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <PiggyBank className="h-6 w-6 text-primary" />
            <span>Budgets</span>
          </button>
          <button onClick={() => navigate("/debtors")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <UserPlus2 className="h-6 w-6 text-primary" />
            <span>Debitoren</span>
          </button>
          <button onClick={() => navigate("/creditors")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <UserMinus className="h-6 w-6 text-primary" />
            <span>Kreditoren</span>
          </button>
          <button onClick={() => navigate("/bank-accounts")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <Landmark className="h-6 w-6 text-primary" />
            <span>Bankkonten</span>
          </button>
          <button onClick={() => navigate("/sepa-payments")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <CreditCard className="h-6 w-6 text-primary" />
            <span>SEPA-Zahlungen</span>
          </button>
          <button onClick={() => navigate("/chart-of-accounts")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Kontenplan</span>
          </button>
          <button onClick={() => navigate("/journal-entries")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <FileText className="h-6 w-6 text-primary" />
            <span>Buchungsjournal</span>
          </button>
          <button onClick={() => navigate("/general-ledger")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <FileText className="h-6 w-6 text-primary" />
            <span>Hauptbuch</span>
          </button>
          <button onClick={() => navigate("/open-items")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <FileText className="h-6 w-6 text-primary" />
            <span>Offene Posten</span>
          </button>
          <button onClick={() => navigate("/balance-sheet")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <Scale className="h-6 w-6 text-primary" />
            <span>Bilanz & GuV</span>
          </button>
          <button onClick={() => navigate("/vat-returns")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <Calculator className="h-6 w-6 text-primary" />
            <span>MWST-Abrechnung</span>
          </button>
          <button onClick={() => navigate("/fixed-assets")} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-left">
            <PiggyBank className="h-6 w-6 text-primary" />
            <span>Anlagenbuchhaltung</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">
            Einnahmen vs. Ausgaben
          </h3>
        </div>

        {monthlyData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Keine monatlichen Daten vorhanden
          </div>
        ) : (
          <>
            <div className="h-64 flex items-end justify-between gap-4">
              {monthlyData.slice(-6).map((data: any) => {
                const maxVal = Math.max(...monthlyData.slice(-6).map((d: any) => Math.max(d.income || 0, d.expense || 0)), 1);
                return (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 items-end justify-center h-48">
                      <div
                        className="w-5 bg-success rounded-t transition-all hover:opacity-80"
                        style={{ height: `${((data.income || 0) / maxVal) * 100}%` }}
                        title={`Einnahmen: CHF ${formatCHF(data.income || 0)}`}
                      />
                      <div
                        className="w-5 bg-destructive/70 rounded-t transition-all hover:opacity-80"
                        style={{ height: `${((data.expense || 0) / maxVal) * 100}%` }}
                        title={`Ausgaben: CHF ${formatCHF(data.expense || 0)}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                );
              })}
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
          </>
        )}
      </div>

      {/* Recent Journal Entries */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">
            Letzte Buchungen
          </h3>
          <Button variant="link" className="text-primary" onClick={() => navigate("/journal-entries")}>
            Alle anzeigen
          </Button>
        </div>

        <div className="space-y-3">
          {recentEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine Buchungen vorhanden
            </div>
          ) : recentEntries.map((entry: any, index: number) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/journal-entries/${entry.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <ArrowDownRight className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{entry.description || entry.number}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.number} • {entry.entryDate ? new Date(entry.entryDate).toLocaleDateString("de-CH") : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge className={cn(
                  entry.status === "POSTED" ? "bg-success/10 text-success" :
                  entry.status === "DRAFT" ? "bg-muted text-muted-foreground" :
                  "bg-destructive/10 text-destructive"
                )}>
                  {entry.status === "POSTED" ? "Gebucht" : entry.status === "DRAFT" ? "Entwurf" : "Storniert"}
                </Badge>
                <p className="font-display font-semibold font-mono">
                  CHF {formatCHF(entry.totalDebit || 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
