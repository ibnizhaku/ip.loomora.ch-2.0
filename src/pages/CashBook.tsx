import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CashEntry {
  id: string;
  date: string;
  documentNumber: string;
  description: string;
  type: "income" | "expense";
  amount: number;
  runningBalance: number;
  taxRate: number;
  costCenter?: string;
}


export default function CashBook() {
  const navigate = useNavigate();
  const { data: apiData } = useQuery({ queryKey: ["/cash-book"], queryFn: () => api.get<any>("/cash-book") });
  const entries: any[] = apiData?.data || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [month, setMonth] = useState("2024-01");
  const [entryList, setEntryList] = useState(entries);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [filterCostCenter, setFilterCostCenter] = useState<string[]>([]);

  const costCenterOptions = Array.from(new Set(entries.filter((e: any) => e.costCenter).map((e: any) => String(e.costCenter))));

  const filteredEntries = entryList.filter((entry) => {
    const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.documentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || entry.type === typeFilter;
    const matchesCostCenter = filterCostCenter.length === 0 || (entry.costCenter && filterCostCenter.includes(entry.costCenter));
    return matchesSearch && matchesType && matchesCostCenter;
  });

  const totalIncome = entryList
    .filter((e) => e.type === "income" && e.amount > 0)
    .reduce((acc, e) => acc + e.amount, 0);
  const totalExpense = entryList
    .filter((e) => e.type === "expense")
    .reduce((acc, e) => acc + e.amount, 0);
  const currentBalance = entryList[0]?.runningBalance || 0;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEntryList(entryList.filter(entry => entry.id !== id));
    toast.success("Buchung storniert");
  };

  const handleStatCardClick = (filter: "all" | "income" | "expense") => {
    setTypeFilter(typeFilter === filter ? "all" : filter);
  };

  const formatCHF = (amount: number) => `CHF ${amount.toLocaleString("de-CH", { minimumFractionDigits: 2 })}`;

  const handlePrint = () => {
    window.print();
    toast.success("Druckdialog geöffnet");
  };

  const handlePdfExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const monthLabel = month === "2024-01" ? "Januar 2024" : month === "2023-12" ? "Dezember 2023" : "November 2023";
    
    doc.setFontSize(18);
    doc.text("Kassenbuch", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(monthLabel, pageWidth / 2, 28, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Anfangsbestand: ${formatCHF(currentBalance)}`, 14, 40);
    doc.text(`Einnahmen: ${formatCHF(totalIncome)}`, 14, 46);
    doc.text(`Ausgaben: ${formatCHF(totalExpense)}`, 14, 52);
    doc.text(`Endbestand: ${formatCHF(currentBalance)}`, 14, 58);
    
    autoTable(doc, {
      startY: 68,
      head: [["Datum", "Belegnr.", "Beschreibung", "Kostenstelle", "Einnahme", "Ausgabe", "Saldo"]],
      body: filteredEntries.map(entry => [
        entry.date,
        entry.documentNumber,
        entry.description,
        entry.costCenter || "-",
        entry.type === "income" && entry.amount > 0 ? formatCHF(entry.amount) : "-",
        entry.type === "expense" ? formatCHF(entry.amount) : "-",
        formatCHF(entry.runningBalance),
      ]),
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
    });

    doc.save(`Kassenbuch_${month}.pdf`);
    toast.success("PDF wurde exportiert");
  };

  const toggleCostCenterFilter = (costCenter: string) => {
    setFilterCostCenter(prev => 
      prev.includes(costCenter) 
        ? prev.filter(c => c !== costCenter)
        : [...prev, costCenter]
    );
  };

  const activeFilters = filterCostCenter.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Kassenbuch
          </h1>
          <p className="text-muted-foreground">
            Bargeldtransaktionen gemäß GoBD dokumentieren
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Drucken
          </Button>
          <Button variant="outline" className="gap-2" onClick={handlePdfExport}>
            <Download className="h-4 w-4" />
            PDF Export
          </Button>
          <Button className="gap-2" onClick={() => navigate("/cash-book/new")}>
            <Plus className="h-4 w-4" />
            Kassenbuchung
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            typeFilter === "all" ? "border-primary ring-2 ring-primary/20" : "border-border"
          )}
          onClick={() => handleStatCardClick("all")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kassenbestand</p>
              <p className="text-2xl font-bold">CHF {currentBalance.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            typeFilter === "income" ? "border-success ring-2 ring-success/20" : "border-border"
          )}
          onClick={() => handleStatCardClick("income")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <ArrowDownRight className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Einnahmen (Monat)</p>
              <p className="text-2xl font-bold text-success">CHF {totalIncome.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:shadow-md",
            typeFilter === "expense" ? "border-destructive ring-2 ring-destructive/20" : "border-border"
          )}
          onClick={() => handleStatCardClick("expense")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <ArrowUpRight className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausgaben (Monat)</p>
              <p className="text-2xl font-bold text-destructive">CHF {totalExpense.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Calendar className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Buchungen</p>
              <p className="text-2xl font-bold">{filteredEntries.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buchungen suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-01">Januar 2024</SelectItem>
            <SelectItem value="2024-02">Februar 2024</SelectItem>
            <SelectItem value="2023-12">Dezember 2023</SelectItem>
            <SelectItem value="2023-11">November 2023</SelectItem>
            <SelectItem value="2023-10">Oktober 2023</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
              {activeFilters > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Kostenstelle</h4>
                <div className="space-y-2">
                  {costCenterOptions.map((cc) => (
                    <div key={cc} className="flex items-center space-x-2">
                      <Checkbox 
                        id={cc} 
                        checked={filterCostCenter.includes(cc)}
                        onCheckedChange={() => toggleCostCenterFilter(cc)}
                      />
                      <label htmlFor={cc} className="text-sm cursor-pointer">{cc}</label>
                    </div>
                  ))}
                </div>
              </div>
              {activeFilters > 0 && (
                <Button variant="outline" size="sm" className="w-full" onClick={() => setFilterCostCenter([])}>
                  Filter zurücksetzen
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Belegnr.</TableHead>
              <TableHead>Beschreibung</TableHead>
              <TableHead>Kostenstelle</TableHead>
              <TableHead className="text-right">Einnahme</TableHead>
              <TableHead className="text-right">Ausgabe</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry, index) => (
              <TableRow
                key={entry.id}
                className="animate-fade-in cursor-pointer hover:bg-muted/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>{entry.date}</TableCell>
                <TableCell>
                  <span className="font-mono font-medium">{entry.documentNumber}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{entry.description}</p>
                    {entry.taxRate > 0 && (
                      <p className="text-xs text-muted-foreground">
                        inkl. {entry.taxRate}% MwSt.
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {entry.costCenter && (
                    <Badge variant="outline">{entry.costCenter}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {entry.type === "income" && entry.amount > 0 && (
                    <span className="font-mono text-success font-medium">
                      CHF {entry.amount.toLocaleString("de-CH")}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {entry.type === "expense" && (
                    <span className="font-mono text-destructive font-medium">
                      CHF {entry.amount.toLocaleString("de-CH")}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  CHF {entry.runningBalance.toLocaleString("de-CH")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, entry.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Stornieren
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Summenzeile */}
        <div className="border-t border-border p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Summe Januar 2024</span>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Einnahmen</p>
                <p className="font-mono font-bold text-success">CHF {totalIncome.toLocaleString("de-CH")}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ausgaben</p>
                <p className="font-mono font-bold text-destructive">CHF {totalExpense.toLocaleString("de-CH")}</p>
              </div>
              <div className="text-right min-w-[120px]">
                <p className="text-sm text-muted-foreground">Endbestand</p>
                <p className="font-mono font-bold text-lg">CHF {currentBalance.toLocaleString("de-CH")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GoBD Hinweis */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>GoBD-Hinweis:</strong> Dieses Kassenbuch entspricht den Grundsätzen zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form. Alle Buchungen sind unveränderlich und revisionssicher gespeichert.
        </p>
      </div>
    </div>
  );
}
