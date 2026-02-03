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

interface BalanceItem {
  id: string;
  name: string;
  currentYear: number;
  previousYear: number;
  children?: BalanceItem[];
}

// Data per year
const balanceDataByYear: Record<string, { assets: BalanceItem[]; liabilities: BalanceItem[] }> = {
  "2024": {
    assets: [
      {
        id: "a1",
        name: "A. Anlagevermögen",
        currentYear: 125000,
        previousYear: 135000,
        children: [
          { id: "a1-1", name: "I. Immaterielle Vermögensgegenstände", currentYear: 5000, previousYear: 7500 },
          {
            id: "a1-2",
            name: "II. Sachanlagen",
            currentYear: 120000,
            previousYear: 127500,
            children: [
              { id: "a1-2-1", name: "1. Grundstücke", currentYear: 50000, previousYear: 50000 },
              { id: "a1-2-2", name: "2. Technische Anlagen", currentYear: 45000, previousYear: 52500 },
              { id: "a1-2-3", name: "3. Betriebs- und Geschäftsausstattung", currentYear: 25000, previousYear: 25000 },
            ],
          },
        ],
      },
      {
        id: "a2",
        name: "B. Umlaufvermögen",
        currentYear: 89500,
        previousYear: 75000,
        children: [
          { id: "a2-1", name: "I. Vorräte", currentYear: 10000, previousYear: 8000 },
          {
            id: "a2-2",
            name: "II. Forderungen",
            currentYear: 32000,
            previousYear: 28000,
            children: [
              { id: "a2-2-1", name: "1. Forderungen aus L+L", currentYear: 32000, previousYear: 28000 },
            ],
          },
          { id: "a2-3", name: "III. Kassenbestand, Bankguthaben", currentYear: 47500, previousYear: 39000 },
        ],
      },
    ],
    liabilities: [
      {
        id: "p1",
        name: "A. Eigenkapital",
        currentYear: 139500,
        previousYear: 125000,
        children: [
          { id: "p1-1", name: "I. Gezeichnetes Kapital", currentYear: 50000, previousYear: 50000 },
          { id: "p1-2", name: "II. Kapitalrücklage", currentYear: 25000, previousYear: 25000 },
          { id: "p1-3", name: "III. Gewinnvortrag", currentYear: 50000, previousYear: 35000 },
          { id: "p1-4", name: "IV. Jahresüberschuss", currentYear: 14500, previousYear: 15000 },
        ],
      },
      {
        id: "p2",
        name: "B. Rückstellungen",
        currentYear: 15000,
        previousYear: 12000,
        children: [
          { id: "p2-1", name: "1. Steuerrückstellungen", currentYear: 5000, previousYear: 4000 },
          { id: "p2-2", name: "2. Sonstige Rückstellungen", currentYear: 10000, previousYear: 8000 },
        ],
      },
      {
        id: "p3",
        name: "C. Verbindlichkeiten",
        currentYear: 60000,
        previousYear: 73000,
        children: [
          { id: "p3-1", name: "1. Verbindlichkeiten ggü. Kreditinstituten", currentYear: 35000, previousYear: 45000 },
          { id: "p3-2", name: "2. Verbindlichkeiten aus L+L", currentYear: 25000, previousYear: 28000 },
        ],
      },
    ],
  },
  "2023": {
    assets: [
      {
        id: "a1",
        name: "A. Anlagevermögen",
        currentYear: 135000,
        previousYear: 142000,
        children: [
          { id: "a1-1", name: "I. Immaterielle Vermögensgegenstände", currentYear: 7500, previousYear: 10000 },
          {
            id: "a1-2",
            name: "II. Sachanlagen",
            currentYear: 127500,
            previousYear: 132000,
            children: [
              { id: "a1-2-1", name: "1. Grundstücke", currentYear: 50000, previousYear: 50000 },
              { id: "a1-2-2", name: "2. Technische Anlagen", currentYear: 52500, previousYear: 57000 },
              { id: "a1-2-3", name: "3. Betriebs- und Geschäftsausstattung", currentYear: 25000, previousYear: 25000 },
            ],
          },
        ],
      },
      {
        id: "a2",
        name: "B. Umlaufvermögen",
        currentYear: 75000,
        previousYear: 68000,
        children: [
          { id: "a2-1", name: "I. Vorräte", currentYear: 8000, previousYear: 7000 },
          {
            id: "a2-2",
            name: "II. Forderungen",
            currentYear: 28000,
            previousYear: 25000,
            children: [
              { id: "a2-2-1", name: "1. Forderungen aus L+L", currentYear: 28000, previousYear: 25000 },
            ],
          },
          { id: "a2-3", name: "III. Kassenbestand, Bankguthaben", currentYear: 39000, previousYear: 36000 },
        ],
      },
    ],
    liabilities: [
      {
        id: "p1",
        name: "A. Eigenkapital",
        currentYear: 125000,
        previousYear: 110000,
        children: [
          { id: "p1-1", name: "I. Gezeichnetes Kapital", currentYear: 50000, previousYear: 50000 },
          { id: "p1-2", name: "II. Kapitalrücklage", currentYear: 25000, previousYear: 25000 },
          { id: "p1-3", name: "III. Gewinnvortrag", currentYear: 35000, previousYear: 20000 },
          { id: "p1-4", name: "IV. Jahresüberschuss", currentYear: 15000, previousYear: 15000 },
        ],
      },
      {
        id: "p2",
        name: "B. Rückstellungen",
        currentYear: 12000,
        previousYear: 10000,
        children: [
          { id: "p2-1", name: "1. Steuerrückstellungen", currentYear: 4000, previousYear: 3500 },
          { id: "p2-2", name: "2. Sonstige Rückstellungen", currentYear: 8000, previousYear: 6500 },
        ],
      },
      {
        id: "p3",
        name: "C. Verbindlichkeiten",
        currentYear: 73000,
        previousYear: 90000,
        children: [
          { id: "p3-1", name: "1. Verbindlichkeiten ggü. Kreditinstituten", currentYear: 45000, previousYear: 60000 },
          { id: "p3-2", name: "2. Verbindlichkeiten aus L+L", currentYear: 28000, previousYear: 30000 },
        ],
      },
    ],
  },
  "2022": {
    assets: [
      {
        id: "a1",
        name: "A. Anlagevermögen",
        currentYear: 142000,
        previousYear: 150000,
        children: [
          { id: "a1-1", name: "I. Immaterielle Vermögensgegenstände", currentYear: 10000, previousYear: 12500 },
          {
            id: "a1-2",
            name: "II. Sachanlagen",
            currentYear: 132000,
            previousYear: 137500,
            children: [
              { id: "a1-2-1", name: "1. Grundstücke", currentYear: 50000, previousYear: 50000 },
              { id: "a1-2-2", name: "2. Technische Anlagen", currentYear: 57000, previousYear: 62500 },
              { id: "a1-2-3", name: "3. Betriebs- und Geschäftsausstattung", currentYear: 25000, previousYear: 25000 },
            ],
          },
        ],
      },
      {
        id: "a2",
        name: "B. Umlaufvermögen",
        currentYear: 68000,
        previousYear: 60000,
        children: [
          { id: "a2-1", name: "I. Vorräte", currentYear: 7000, previousYear: 6000 },
          {
            id: "a2-2",
            name: "II. Forderungen",
            currentYear: 25000,
            previousYear: 22000,
            children: [
              { id: "a2-2-1", name: "1. Forderungen aus L+L", currentYear: 25000, previousYear: 22000 },
            ],
          },
          { id: "a2-3", name: "III. Kassenbestand, Bankguthaben", currentYear: 36000, previousYear: 32000 },
        ],
      },
    ],
    liabilities: [
      {
        id: "p1",
        name: "A. Eigenkapital",
        currentYear: 110000,
        previousYear: 95000,
        children: [
          { id: "p1-1", name: "I. Gezeichnetes Kapital", currentYear: 50000, previousYear: 50000 },
          { id: "p1-2", name: "II. Kapitalrücklage", currentYear: 25000, previousYear: 25000 },
          { id: "p1-3", name: "III. Gewinnvortrag", currentYear: 20000, previousYear: 5000 },
          { id: "p1-4", name: "IV. Jahresüberschuss", currentYear: 15000, previousYear: 15000 },
        ],
      },
      {
        id: "p2",
        name: "B. Rückstellungen",
        currentYear: 10000,
        previousYear: 8000,
        children: [
          { id: "p2-1", name: "1. Steuerrückstellungen", currentYear: 3500, previousYear: 3000 },
          { id: "p2-2", name: "2. Sonstige Rückstellungen", currentYear: 6500, previousYear: 5000 },
        ],
      },
      {
        id: "p3",
        name: "C. Verbindlichkeiten",
        currentYear: 90000,
        previousYear: 107000,
        children: [
          { id: "p3-1", name: "1. Verbindlichkeiten ggü. Kreditinstituten", currentYear: 60000, previousYear: 75000 },
          { id: "p3-2", name: "2. Verbindlichkeiten aus L+L", currentYear: 30000, previousYear: 32000 },
        ],
      },
    ],
  },
};

const pnlDataByYear: Record<string, { revenue: { id: string; name: string; currentYear: number; previousYear: number }[]; expenses: { id: string; name: string; currentYear: number; previousYear: number }[] }> = {
  "2024": {
    revenue: [
      { id: "r1", name: "1. Umsatzerlöse", currentYear: 285000, previousYear: 265000 },
      { id: "r2", name: "2. Sonstige betriebliche Erträge", currentYear: 5000, previousYear: 3000 },
    ],
    expenses: [
      { id: "e1", name: "3. Materialaufwand", currentYear: 85000, previousYear: 78000 },
      { id: "e2", name: "4. Personalaufwand", currentYear: 120000, previousYear: 110000 },
      { id: "e3", name: "5. Abschreibungen", currentYear: 15000, previousYear: 15000 },
      { id: "e4", name: "6. Sonstige betriebliche Aufwendungen", currentYear: 45000, previousYear: 40000 },
      { id: "e5", name: "7. Zinsen und ähnliche Aufwendungen", currentYear: 3500, previousYear: 4000 },
      { id: "e6", name: "8. Steuern vom Einkommen und Ertrag", currentYear: 7000, previousYear: 6000 },
    ],
  },
  "2023": {
    revenue: [
      { id: "r1", name: "1. Umsatzerlöse", currentYear: 265000, previousYear: 245000 },
      { id: "r2", name: "2. Sonstige betriebliche Erträge", currentYear: 3000, previousYear: 2500 },
    ],
    expenses: [
      { id: "e1", name: "3. Materialaufwand", currentYear: 78000, previousYear: 72000 },
      { id: "e2", name: "4. Personalaufwand", currentYear: 110000, previousYear: 100000 },
      { id: "e3", name: "5. Abschreibungen", currentYear: 15000, previousYear: 15000 },
      { id: "e4", name: "6. Sonstige betriebliche Aufwendungen", currentYear: 40000, previousYear: 36000 },
      { id: "e5", name: "7. Zinsen und ähnliche Aufwendungen", currentYear: 4000, previousYear: 4500 },
      { id: "e6", name: "8. Steuern vom Einkommen und Ertrag", currentYear: 6000, previousYear: 5000 },
    ],
  },
  "2022": {
    revenue: [
      { id: "r1", name: "1. Umsatzerlöse", currentYear: 245000, previousYear: 220000 },
      { id: "r2", name: "2. Sonstige betriebliche Erträge", currentYear: 2500, previousYear: 2000 },
    ],
    expenses: [
      { id: "e1", name: "3. Materialaufwand", currentYear: 72000, previousYear: 65000 },
      { id: "e2", name: "4. Personalaufwand", currentYear: 100000, previousYear: 90000 },
      { id: "e3", name: "5. Abschreibungen", currentYear: 15000, previousYear: 15000 },
      { id: "e4", name: "6. Sonstige betriebliche Aufwendungen", currentYear: 36000, previousYear: 32000 },
      { id: "e5", name: "7. Zinsen und ähnliche Aufwendungen", currentYear: 4500, previousYear: 5000 },
      { id: "e6", name: "8. Steuern vom Einkommen und Ertrag", currentYear: 5000, previousYear: 5000 },
    ],
  },
};

export default function BalanceSheet() {
  const [expandedIds, setExpandedIds] = useState<string[]>(["a1", "a2", "p1", "p3"]);
  const [period, setPeriod] = useState("2024");
  const [activeTab, setActiveTab] = useState("balance");
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [lockedPeriods, setLockedPeriods] = useState<string[]>(["2022", "2023"]);

  const isPeriodLocked = lockedPeriods.includes(period);

  // Get data for selected year
  const { assets, liabilities } = balanceDataByYear[period] || balanceDataByYear["2024"];
  const pnlItems = pnlDataByYear[period] || pnlDataByYear["2024"];

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleLockPeriod = () => {
    if (isPeriodLocked) {
      setLockedPeriods(prev => prev.filter(p => p !== period));
      toast.success(`Periode ${period} wurde entsperrt`);
    } else {
      setLockedPeriods(prev => [...prev, period]);
      toast.success(`Periode ${period} wurde gesperrt`);
    }
    setShowLockDialog(false);
  };

  const totalAssets = assets.reduce((acc, a) => acc + a.currentYear, 0);
  const totalLiabilities = liabilities.reduce((acc, l) => acc + l.currentYear, 0);
  const totalAssetsPrev = assets.reduce((acc, a) => acc + a.previousYear, 0);
  const totalLiabilitiesPrev = liabilities.reduce((acc, l) => acc + l.previousYear, 0);

  const totalRevenue = pnlItems.revenue.reduce((acc, r) => acc + r.currentYear, 0);
  const totalExpenses = pnlItems.expenses.reduce((acc, e) => acc + e.currentYear, 0);
  const netIncome = totalRevenue - totalExpenses;
  const totalRevenuePrev = pnlItems.revenue.reduce((acc, r) => acc + r.previousYear, 0);
  const totalExpensesPrev = pnlItems.expenses.reduce((acc, e) => acc + e.previousYear, 0);
  const netIncomePrev = totalRevenuePrev - totalExpensesPrev;

  const eigenkapitalQuote = ((liabilities[0]?.currentYear || 0) / totalLiabilities) * 100;

  const formatCHF = (amount: number) => `CHF ${amount.toLocaleString("de-CH")}`;

  const renderBalanceItem = (item: BalanceItem, level: number = 0) => {
    const isExpanded = expandedIds.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const change = ((item.currentYear - item.previousYear) / item.previousYear) * 100;

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
            <span className="font-mono w-[120px] text-right text-muted-foreground">
              {formatCHF(item.previousYear)}
            </span>
            <span className={cn(
              "w-[80px] text-right text-sm",
              change > 0 ? "text-success" : change < 0 ? "text-destructive" : "text-muted-foreground"
            )}>
              {change > 0 ? "+" : ""}{change.toFixed(1)}%
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
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">
                <span className="flex items-center gap-2">
                  GJ 2024
                  {lockedPeriods.includes("2024") && <Lock className="h-3 w-3" />}
                </span>
              </SelectItem>
              <SelectItem value="2023">
                <span className="flex items-center gap-2">
                  GJ 2023
                  {lockedPeriods.includes("2023") && <Lock className="h-3 w-3" />}
                </span>
              </SelectItem>
              <SelectItem value="2022">
                <span className="flex items-center gap-2">
                  GJ 2022
                  {lockedPeriods.includes("2022") && <Lock className="h-3 w-3" />}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant={isPeriodLocked ? "destructive" : "outline"} 
            className="gap-2"
            onClick={() => setShowLockDialog(true)}
          >
            {isPeriodLocked ? (
              <>
                <Lock className="h-4 w-4" />
                Gesperrt
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                Periode sperren
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              const doc = new jsPDF();
              const pageWidth = doc.internal.pageSize.getWidth();
              
              // Header
              doc.setFontSize(20);
              doc.setFont("helvetica", "bold");
              doc.text("Bilanz & Erfolgsrechnung", pageWidth / 2, 20, { align: "center" });
              doc.setFontSize(12);
              doc.setFont("helvetica", "normal");
              doc.text(`Geschäftsjahr ${period}`, pageWidth / 2, 28, { align: "center" });
              doc.text("nach OR (Schweizer Rechnungslegung)", pageWidth / 2, 35, { align: "center" });
              
              // Bilanz Aktiva
              doc.setFontSize(14);
              doc.setFont("helvetica", "bold");
              doc.text("AKTIVA", 14, 50);
              
              const aktivaData = assets.flatMap(item => {
                const rows: string[][] = [[item.name, formatCHF(item.currentYear), formatCHF(item.previousYear)]];
                item.children?.forEach(child => {
                  rows.push(["  " + child.name, formatCHF(child.currentYear), formatCHF(child.previousYear)]);
                  child.children?.forEach(grandchild => {
                    rows.push(["    " + grandchild.name, formatCHF(grandchild.currentYear), formatCHF(grandchild.previousYear)]);
                  });
                });
                return rows;
              });
              aktivaData.push(["Summe Aktiva", formatCHF(totalAssets), formatCHF(totalAssetsPrev)]);
              
              autoTable(doc, {
                startY: 55,
                head: [["Position", `GJ ${period}`, `Vorjahr`]],
                body: aktivaData,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] },
              });
              
              // Bilanz Passiva
              const passivaY = (doc as any).lastAutoTable.finalY + 15;
              doc.setFontSize(14);
              doc.text("PASSIVA", 14, passivaY);
              
              const passivaData = liabilities.flatMap(item => {
                const rows: string[][] = [[item.name, formatCHF(item.currentYear), formatCHF(item.previousYear)]];
                item.children?.forEach(child => {
                  rows.push(["  " + child.name, formatCHF(child.currentYear), formatCHF(child.previousYear)]);
                });
                return rows;
              });
              passivaData.push(["Summe Passiva", formatCHF(totalLiabilities), formatCHF(totalLiabilitiesPrev)]);
              
              autoTable(doc, {
                startY: passivaY + 5,
                head: [["Position", `GJ ${period}`, `Vorjahr`]],
                body: passivaData,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] },
              });
              
              // Neue Seite für GuV
              doc.addPage();
              doc.setFontSize(20);
              doc.setFont("helvetica", "bold");
              doc.text("Erfolgsrechnung", pageWidth / 2, 20, { align: "center" });
              doc.setFontSize(12);
              doc.setFont("helvetica", "normal");
              doc.text(`Geschäftsjahr ${period}`, pageWidth / 2, 28, { align: "center" });
              
              // Erträge
              doc.setFontSize(14);
              doc.setFont("helvetica", "bold");
              doc.text("ERTRÄGE", 14, 45);
              
              const revenueData = pnlItems.revenue.map(item => [item.name, formatCHF(item.currentYear), formatCHF(item.previousYear)]);
              revenueData.push(["Summe Erträge", formatCHF(totalRevenue), formatCHF(totalRevenuePrev)]);
              
              autoTable(doc, {
                startY: 50,
                head: [["Position", `GJ ${period}`, `Vorjahr`]],
                body: revenueData,
                theme: 'striped',
                headStyles: { fillColor: [34, 197, 94] },
              });
              
              // Aufwendungen
              const expenseY = (doc as any).lastAutoTable.finalY + 15;
              doc.setFontSize(14);
              doc.text("AUFWENDUNGEN", 14, expenseY);
              
              const expenseData = pnlItems.expenses.map(item => [item.name, formatCHF(item.currentYear), formatCHF(item.previousYear)]);
              expenseData.push(["Summe Aufwendungen", formatCHF(totalExpenses), formatCHF(totalExpensesPrev)]);
              
              autoTable(doc, {
                startY: expenseY + 5,
                head: [["Position", `GJ ${period}`, `Vorjahr`]],
                body: expenseData,
                theme: 'striped',
                headStyles: { fillColor: [239, 68, 68] },
              });
              
              // Ergebnis
              const resultY = (doc as any).lastAutoTable.finalY + 15;
              doc.setFontSize(16);
              doc.setFont("helvetica", "bold");
              doc.text(`Jahresüberschuss: ${formatCHF(netIncome)}`, 14, resultY);
              
              // Footer
              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              doc.text(`Erstellt am ${new Date().toLocaleDateString("de-CH")}`, 14, doc.internal.pageSize.getHeight() - 10);
              
              doc.save(`Bilanz-GuV-${period}.pdf`);
              toast.success(`PDF für Geschäftsjahr ${period} exportiert`);
            }}
          >
            <FileText className="h-4 w-4" />
            PDF Export
          </Button>
        </div>
      </div>

      {/* Period Lock Status */}
      {isPeriodLocked && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <Lock className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive font-medium">
            Periode {period} ist gesperrt – keine Buchungen möglich
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setActiveTab("balance")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bilanzsumme Aktiva</p>
              <p className="text-2xl font-bold">{formatCHF(totalAssets)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalAssets > totalAssetsPrev ? "+" : ""}{((totalAssets - totalAssetsPrev) / totalAssetsPrev * 100).toFixed(1)}% zum Vorjahr
              </p>
            </div>
          </div>
        </div>
        <div 
          className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setActiveTab("balance")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50">
              <Scale className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eigenkapitalquote</p>
              <p className="text-2xl font-bold">
                {eigenkapitalQuote.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ziel: &gt;30%
              </p>
            </div>
          </div>
        </div>
        <div 
          className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setActiveTab("pnl")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamtleistung</p>
              <p className="text-2xl font-bold text-success">{formatCHF(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalRevenue > totalRevenuePrev ? "+" : ""}{((totalRevenue - totalRevenuePrev) / totalRevenuePrev * 100).toFixed(1)}% zum Vorjahr
              </p>
            </div>
          </div>
        </div>
        <div 
          className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setActiveTab("pnl")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <PiggyBank className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jahresüberschuss</p>
              <p className="text-2xl font-bold">{formatCHF(netIncome)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {netIncome > netIncomePrev ? "+" : ""}{((netIncome - netIncomePrev) / netIncomePrev * 100).toFixed(1)}% zum Vorjahr
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="balance">Bilanz</TabsTrigger>
          <TabsTrigger value="pnl">Gewinn- und Verlustrechnung</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="mt-4 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Aktiva */}
            <div className="rounded-2xl border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Aktiva
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Aktuelles Jahr</span>
                  <span>Vorjahr</span>
                  <span>Veränderung</span>
                </div>
              </div>
              <div className="p-2">
                {assets.map((item) => renderBalanceItem(item))}
                <div className="flex items-center justify-between py-3 px-4 mt-2 border-t border-border font-bold">
                  <span>Summe Aktiva</span>
                  <div className="flex items-center gap-8">
                    <span className="font-mono w-[120px] text-right">
                      {formatCHF(totalAssets)}
                    </span>
                    <span className="font-mono w-[120px] text-right text-muted-foreground">
                      {formatCHF(assets.reduce((acc, a) => acc + a.previousYear, 0))}
                    </span>
                    <span className="w-[80px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Passiva */}
            <div className="rounded-2xl border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Passiva
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Aktuelles Jahr</span>
                  <span>Vorjahr</span>
                  <span>Veränderung</span>
                </div>
              </div>
              <div className="p-2">
                {liabilities.map((item) => renderBalanceItem(item))}
                <div className="flex items-center justify-between py-3 px-4 mt-2 border-t border-border font-bold">
                  <span>Summe Passiva</span>
                  <div className="flex items-center gap-8">
                    <span className="font-mono w-[120px] text-right">
                      {formatCHF(totalLiabilities)}
                    </span>
                    <span className="font-mono w-[120px] text-right text-muted-foreground">
                      {formatCHF(liabilities.reduce((acc, l) => acc + l.previousYear, 0))}
                    </span>
                    <span className="w-[80px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pnl" className="mt-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-lg mb-4">
              Gewinn- und Verlustrechnung {period}
            </h3>

            {/* Erträge */}
            <div className="mb-6">
              <h4 className="font-medium text-muted-foreground mb-2">Erträge</h4>
              {pnlItems.revenue.map((item) => (
                <div key={item.id} className="flex justify-between py-2 px-4 hover:bg-muted/50 rounded">
                  <span>{item.name}</span>
                  <div className="flex gap-8">
                    <span className="font-mono w-[120px] text-right text-success">
                      {formatCHF(item.currentYear)}
                    </span>
                    <span className="font-mono w-[120px] text-right text-muted-foreground">
                      {formatCHF(item.previousYear)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between py-2 px-4 font-semibold border-t border-border mt-2">
                <span>Summe Erträge</span>
                <div className="flex gap-8">
                  <span className="font-mono w-[120px] text-right text-success">
                    {formatCHF(totalRevenue)}
                  </span>
                  <span className="font-mono w-[120px] text-right text-muted-foreground">
                    {formatCHF(pnlItems.revenue.reduce((acc, r) => acc + r.previousYear, 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Aufwendungen */}
            <div className="mb-6">
              <h4 className="font-medium text-muted-foreground mb-2">Aufwendungen</h4>
              {pnlItems.expenses.map((item) => (
                <div key={item.id} className="flex justify-between py-2 px-4 hover:bg-muted/50 rounded">
                  <span>{item.name}</span>
                  <div className="flex gap-8">
                    <span className="font-mono w-[120px] text-right text-destructive">
                      {formatCHF(item.currentYear)}
                    </span>
                    <span className="font-mono w-[120px] text-right text-muted-foreground">
                      {formatCHF(item.previousYear)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between py-2 px-4 font-semibold border-t border-border mt-2">
                <span>Summe Aufwendungen</span>
                <div className="flex gap-8">
                  <span className="font-mono w-[120px] text-right text-destructive">
                    {formatCHF(totalExpenses)}
                  </span>
                  <span className="font-mono w-[120px] text-right text-muted-foreground">
                    {formatCHF(pnlItems.expenses.reduce((acc, e) => acc + e.previousYear, 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Ergebnis */}
            <div className="rounded-xl bg-primary/5 p-4">
              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-lg">Jahresüberschuss</span>
                <div className="flex gap-8">
                  <span className={cn(
                    "font-mono font-bold text-xl w-[120px] text-right",
                    netIncome >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {formatCHF(netIncome)}
                  </span>
                  <span className="font-mono w-[120px] text-right text-muted-foreground">
                    {formatCHF(pnlItems.revenue.reduce((acc, r) => acc + r.previousYear, 0) - 
                       pnlItems.expenses.reduce((acc, e) => acc + e.previousYear, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Period Lock Dialog */}
      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isPeriodLocked ? (
                <>
                  <Unlock className="h-5 w-5" />
                  Periode {period} entsperren
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Periode {period} sperren
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isPeriodLocked ? (
                <>
                  Möchten Sie die Periode <strong>GJ {period}</strong> entsperren? 
                  Nach dem Entsperren können wieder Buchungen in dieser Periode vorgenommen werden.
                  <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                      <span className="text-sm text-destructive">
                        Achtung: Das Entsperren einer abgeschlossenen Periode kann die Revisionssicherheit beeinträchtigen.
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  Möchten Sie die Periode <strong>GJ {period}</strong> sperren?
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Keine weiteren Buchungen möglich</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Revisionssichere Abschluss-Dokumentation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Daten bleiben lesbar für Auswertungen</span>
                    </div>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLockDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              variant={isPeriodLocked ? "destructive" : "default"}
              onClick={handleLockPeriod}
            >
              {isPeriodLocked ? "Entsperren" : "Periode sperren"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
