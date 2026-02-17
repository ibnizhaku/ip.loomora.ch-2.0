import { useState } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Scale,
  ChevronRight,
  ChevronDown,
  Building,
  Wallet,
  PiggyBank,
  CreditCard,
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  FileText,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useBalanceSheet, useIncomeStatement } from "@/hooks/use-finance";

interface BalanceItem {
  id: string;
  name: string;
  currentYear: number;
  previousYear: number;
  children?: BalanceItem[];
}

export default function BalanceSheet() {
  const [expandedIds, setExpandedIds] = useState<string[]>(["a1", "a2", "p1", "p3"]);
  const [activeTab, setActiveTab] = useState("balance");
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [lockedPeriods, setLockedPeriods] = useState<string[]>([]);

  // Fetch from API
  const { data: balanceData, isLoading: balanceLoading } = useBalanceSheet();
  const { data: pnlData, isLoading: pnlLoading } = useIncomeStatement();

  // Map API data to BalanceItem structure
  const assets: BalanceItem[] = (balanceData as any)?.assets?.map((a: any, i: number) => ({
    id: `a${i}`,
    name: a.name || a.number,
    currentYear: Number(a.balance || 0),
    previousYear: 0,
  })) || [];

  const liabilities: BalanceItem[] = [
    ...((balanceData as any)?.liabilities?.map((l: any, i: number) => ({
      id: `l${i}`,
      name: l.name || l.number,
      currentYear: Number(l.balance || 0),
      previousYear: 0,
    })) || []),
    ...((balanceData as any)?.equity?.map((e: any, i: number) => ({
      id: `e${i}`,
      name: e.name || e.number,
      currentYear: Number(e.balance || 0),
      previousYear: 0,
    })) || []),
  ];

  const pnlRevenue = (pnlData as any)?.revenue?.map((r: any, i: number) => ({
    id: `r${i}`,
    name: r.name || r.number,
    currentYear: Number(r.balance || 0),
    previousYear: 0,
  })) || [];

  const pnlExpenses = (pnlData as any)?.expenses?.map((e: any, i: number) => ({
    id: `ex${i}`,
    name: e.name || e.number,
    currentYear: Number(e.balance || 0),
    previousYear: 0,
  })) || [];

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalAssets = (balanceData as any)?.totals?.assets || assets.reduce((acc, a) => acc + a.currentYear, 0);
  const totalLiabilities = (balanceData as any)?.totals?.liabilitiesAndEquity || liabilities.reduce((acc, l) => acc + l.currentYear, 0);

  const totalRevenue = (pnlData as any)?.totals?.revenue || pnlRevenue.reduce((acc: number, r: any) => acc + r.currentYear, 0);
  const totalExpenses = (pnlData as any)?.totals?.expenses || pnlExpenses.reduce((acc: number, e: any) => acc + e.currentYear, 0);
  const netIncome = (pnlData as any)?.totals?.netIncome || (totalRevenue - totalExpenses);

  const formatCHF = (amount: number) => `CHF ${Math.abs(amount).toLocaleString("de-CH")}`;

  const renderBalanceItem = (item: BalanceItem, level: number = 0) => {
    const isExpanded = expandedIds.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <div
          className={cn(
            "flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors cursor-pointer rounded-lg",
            level === 0 && "font-semibold bg-muted/30"
          )}
          style={{ paddingLeft: `${level * 24 + 16}px` }}
          onClick={() => hasChildren && toggleExpand(item.id)}
        >
          <div className="flex items-center gap-2">
            {hasChildren && (
              <span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
            )}
            {!hasChildren && <span className="w-4" />}
            <span>{item.name}</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="font-mono w-[120px] text-right">
              {formatCHF(item.currentYear)}
            </span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {item.children!.map((child) => renderBalanceItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const isLoading = balanceLoading || pnlLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Bilanz & GuV
          </h1>
          <p className="text-muted-foreground">
            Jahresabschluss nach OR (Schweizer Rechnungslegung)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => {
            toast.success("PDF wird generiert...");
          }}>
            <Download className="h-4 w-4" />
            PDF Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktiven</p>
              <p className="text-2xl font-bold">{formatCHF(totalAssets)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Passiven</p>
              <p className="text-2xl font-bold">{formatCHF(totalLiabilities)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Umsatz</p>
              <p className="text-2xl font-bold text-success">{formatCHF(totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              netIncome >= 0 ? "bg-success/10" : "bg-destructive/10"
            )}>
              <PiggyBank className={cn("h-6 w-6", netIncome >= 0 ? "text-success" : "text-destructive")} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jahresergebnis</p>
              <p className={cn("text-2xl font-bold", netIncome >= 0 ? "text-success" : "text-destructive")}>
                {formatCHF(netIncome)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="balance">Bilanz</TabsTrigger>
          <TabsTrigger value="pnl">Erfolgsrechnung</TabsTrigger>
        </TabsList>

        <TabsContent value="balance">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Laden...</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Aktiven */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold text-lg mb-4">Aktiven</h3>
                <div className="space-y-1">
                  {assets.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">Keine Daten vorhanden</p>
                  ) : assets.map((item) => renderBalanceItem(item))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between font-bold">
                  <span>Total Aktiven</span>
                  <span className="font-mono">{formatCHF(totalAssets)}</span>
                </div>
              </div>

              {/* Passiven */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold text-lg mb-4">Passiven</h3>
                <div className="space-y-1">
                  {liabilities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">Keine Daten vorhanden</p>
                  ) : liabilities.map((item) => renderBalanceItem(item))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between font-bold">
                  <span>Total Passiven</span>
                  <span className="font-mono">{formatCHF(totalLiabilities)}</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pnl">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Laden...</div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Erfolgsrechnung</h3>
              
              {/* Revenue */}
              <div className="mb-6">
                <h4 className="font-medium text-success mb-2">Erträge</h4>
                {pnlRevenue.map((item: any) => (
                  <div key={item.id} className="flex justify-between py-2 px-4 hover:bg-muted/50 rounded-lg">
                    <span>{item.name}</span>
                    <span className="font-mono text-success">{formatCHF(item.currentYear)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-4 font-semibold border-t border-border mt-2">
                  <span>Total Erträge</span>
                  <span className="font-mono text-success">{formatCHF(totalRevenue)}</span>
                </div>
              </div>

              {/* Expenses */}
              <div className="mb-6">
                <h4 className="font-medium text-destructive mb-2">Aufwand</h4>
                {pnlExpenses.map((item: any) => (
                  <div key={item.id} className="flex justify-between py-2 px-4 hover:bg-muted/50 rounded-lg">
                    <span>{item.name}</span>
                    <span className="font-mono text-destructive">{formatCHF(item.currentYear)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 px-4 font-semibold border-t border-border mt-2">
                  <span>Total Aufwand</span>
                  <span className="font-mono text-destructive">{formatCHF(totalExpenses)}</span>
                </div>
              </div>

              {/* Net Income */}
              <div className="flex justify-between py-4 px-4 font-bold text-lg border-t-2 border-border">
                <span>Jahresergebnis</span>
                <span className={cn("font-mono", netIncome >= 0 ? "text-success" : "text-destructive")}>
                  {formatCHF(netIncome)}
                </span>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
