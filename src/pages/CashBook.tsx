import { useState } from "react";
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
import { cn } from "@/lib/utils";

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

const entries: CashEntry[] = [
  {
    id: "1",
    date: "31.01.2024",
    documentNumber: "KB-2024-045",
    description: "Anfangsbestand Februar",
    type: "income",
    amount: 0,
    runningBalance: 2500,
    taxRate: 0,
  },
  {
    id: "2",
    date: "30.01.2024",
    documentNumber: "KB-2024-044",
    description: "Barverkauf Lagerware",
    type: "income",
    amount: 350,
    runningBalance: 2500,
    taxRate: 19,
    costCenter: "Vertrieb",
  },
  {
    id: "3",
    date: "29.01.2024",
    documentNumber: "KB-2024-043",
    description: "Büromaterial Papeterie",
    type: "expense",
    amount: 45.50,
    runningBalance: 2150,
    taxRate: 19,
    costCenter: "Verwaltung",
  },
  {
    id: "4",
    date: "28.01.2024",
    documentNumber: "KB-2024-042",
    description: "Porto und Versand",
    type: "expense",
    amount: 25.00,
    runningBalance: 2195.50,
    taxRate: 0,
    costCenter: "Verwaltung",
  },
  {
    id: "5",
    date: "26.01.2024",
    documentNumber: "KB-2024-041",
    description: "Kundenbesuch - Bewirtung",
    type: "expense",
    amount: 85.00,
    runningBalance: 2220.50,
    taxRate: 19,
    costCenter: "Vertrieb",
  },
  {
    id: "6",
    date: "25.01.2024",
    documentNumber: "KB-2024-040",
    description: "Bankeinzahlung",
    type: "expense",
    amount: 500.00,
    runningBalance: 2305.50,
    taxRate: 0,
  },
  {
    id: "7",
    date: "24.01.2024",
    documentNumber: "KB-2024-039",
    description: "Barverkauf Dienstleistung",
    type: "income",
    amount: 250.00,
    runningBalance: 2805.50,
    taxRate: 19,
    costCenter: "Vertrieb",
  },
  {
    id: "8",
    date: "22.01.2024",
    documentNumber: "KB-2024-038",
    description: "Tankquittung Firmenwagen",
    type: "expense",
    amount: 75.00,
    runningBalance: 2555.50,
    taxRate: 19,
    costCenter: "Fuhrpark",
  },
];

export default function CashBook() {
  const [searchQuery, setSearchQuery] = useState("");
  const [month, setMonth] = useState("2024-01");

  const totalIncome = entries
    .filter((e) => e.type === "income" && e.amount > 0)
    .reduce((acc, e) => acc + e.amount, 0);
  const totalExpense = entries
    .filter((e) => e.type === "expense")
    .reduce((acc, e) => acc + e.amount, 0);
  const currentBalance = entries[0]?.runningBalance || 0;

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
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Drucken
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            PDF Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Kassenbuchung
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kassenbestand</p>
              <p className="text-2xl font-bold">€{currentBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <ArrowDownRight className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Einnahmen (Monat)</p>
              <p className="text-2xl font-bold text-success">€{totalIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <ArrowUpRight className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausgaben (Monat)</p>
              <p className="text-2xl font-bold text-destructive">€{totalExpense.toLocaleString()}</p>
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
              <p className="text-2xl font-bold">{entries.length}</p>
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
            <SelectItem value="2023-12">Dezember 2023</SelectItem>
            <SelectItem value="2023-11">November 2023</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
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
            {entries.map((entry, index) => (
              <TableRow
                key={entry.id}
                className="animate-fade-in"
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
                      €{entry.amount.toLocaleString()}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {entry.type === "expense" && (
                    <span className="font-mono text-destructive font-medium">
                      €{entry.amount.toLocaleString()}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono font-bold">
                  €{entry.runningBalance.toLocaleString()}
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
                        <Edit className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
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
                <p className="font-mono font-bold text-success">€{totalIncome.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Ausgaben</p>
                <p className="font-mono font-bold text-destructive">€{totalExpense.toLocaleString()}</p>
              </div>
              <div className="text-right min-w-[120px]">
                <p className="text-sm text-muted-foreground">Endbestand</p>
                <p className="font-mono font-bold text-lg">€{currentBalance.toLocaleString()}</p>
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
