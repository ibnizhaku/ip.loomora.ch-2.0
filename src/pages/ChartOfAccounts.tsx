import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  number: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  category: string;
  balance: number;
  children?: Account[];
  isExpanded?: boolean;
}

const accounts: Account[] = [
  {
    id: "1",
    number: "0",
    name: "Anlagevermögen",
    type: "asset",
    category: "Aktiva",
    balance: 125000,
    children: [
      { id: "1-1", number: "0100", name: "Grundstücke", type: "asset", category: "Aktiva", balance: 50000 },
      { id: "1-2", number: "0200", name: "Gebäude", type: "asset", category: "Aktiva", balance: 45000 },
      { id: "1-3", number: "0400", name: "Maschinen", type: "asset", category: "Aktiva", balance: 20000 },
      { id: "1-4", number: "0600", name: "Betriebs- und Geschäftsausstattung", type: "asset", category: "Aktiva", balance: 10000 },
    ],
  },
  {
    id: "2",
    number: "1",
    name: "Umlaufvermögen",
    type: "asset",
    category: "Aktiva",
    balance: 89500,
    children: [
      { id: "2-1", number: "1200", name: "Bank", type: "asset", category: "Aktiva", balance: 45000 },
      { id: "2-2", number: "1400", name: "Forderungen aus L+L", type: "asset", category: "Aktiva", balance: 32000 },
      { id: "2-3", number: "1600", name: "Kasse", type: "asset", category: "Aktiva", balance: 2500 },
      { id: "2-4", number: "1800", name: "Vorsteuer", type: "asset", category: "Aktiva", balance: 10000 },
    ],
  },
  {
    id: "3",
    number: "2",
    name: "Eigenkapital",
    type: "equity",
    category: "Passiva",
    balance: 100000,
    children: [
      { id: "3-1", number: "2000", name: "Gezeichnetes Kapital", type: "equity", category: "Passiva", balance: 50000 },
      { id: "3-2", number: "2900", name: "Gewinnvortrag", type: "equity", category: "Passiva", balance: 50000 },
    ],
  },
  {
    id: "4",
    number: "3",
    name: "Verbindlichkeiten",
    type: "liability",
    category: "Passiva",
    balance: 75000,
    children: [
      { id: "4-1", number: "3300", name: "Verbindlichkeiten aus L+L", type: "liability", category: "Passiva", balance: 25000 },
      { id: "4-2", number: "3500", name: "Umsatzsteuer", type: "liability", category: "Passiva", balance: 15000 },
      { id: "4-3", number: "3800", name: "Bankdarlehen", type: "liability", category: "Passiva", balance: 35000 },
    ],
  },
  {
    id: "5",
    number: "4",
    name: "Erlöse",
    type: "revenue",
    category: "Erträge",
    balance: 285000,
    children: [
      { id: "5-1", number: "4000", name: "Umsatzerlöse 19%", type: "revenue", category: "Erträge", balance: 250000 },
      { id: "5-2", number: "4100", name: "Umsatzerlöse 7%", type: "revenue", category: "Erträge", balance: 35000 },
    ],
  },
  {
    id: "6",
    number: "6-7",
    name: "Aufwendungen",
    type: "expense",
    category: "Aufwand",
    balance: 180000,
    children: [
      { id: "6-1", number: "6000", name: "Personalaufwand", type: "expense", category: "Aufwand", balance: 120000 },
      { id: "6-2", number: "6300", name: "Abschreibungen", type: "expense", category: "Aufwand", balance: 15000 },
      { id: "6-3", number: "6800", name: "Betriebskosten", type: "expense", category: "Aufwand", balance: 25000 },
      { id: "6-4", number: "7000", name: "Sonstige Aufwendungen", type: "expense", category: "Aufwand", balance: 20000 },
    ],
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

export default function ChartOfAccounts() {
  const [expandedIds, setExpandedIds] = useState<string[]>(["1", "2", "5"]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderAccount = (account: Account, level: number = 0) => {
    const isExpanded = expandedIds.includes(account.id);
    const hasChildren = account.children && account.children.length > 0;

    return (
      <div key={account.id}>
        <div
          className={cn(
            "flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
            level > 0 && "ml-6"
          )}
          onClick={() => hasChildren && toggleExpand(account.id)}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button className="p-1 hover:bg-muted rounded">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            {hasChildren ? (
              <Folder className="h-5 w-5 text-primary" />
            ) : (
              <FileText className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">
                  {account.number}
                </span>
                <span className="font-medium">{account.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge className={typeColors[account.type]}>
              {typeLabels[account.type]}
            </Badge>
            <span className={cn(
              "font-mono font-medium min-w-[120px] text-right",
              account.type === "revenue" && "text-success",
              account.type === "expense" && "text-destructive"
            )}>
              €{account.balance.toLocaleString()}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l-2 border-border ml-4">
            {account.children!.map((child) => renderAccount(child, level + 1))}
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
            Kontenplan
          </h1>
          <p className="text-muted-foreground">
            SKR03-basierter Kontenrahmen für Ihre Buchhaltung
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Konto anlegen
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Konten suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="rounded-xl border border-border bg-card p-4">
            <Badge className={cn("mb-2", typeColors[type as keyof typeof typeColors])}>
              {label}
            </Badge>
            <p className="text-2xl font-bold">
              €{accounts
                .filter((a) => a.type === type)
                .reduce((acc, a) => acc + a.balance, 0)
                .toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="space-y-1">
          {accounts.map((account) => renderAccount(account))}
        </div>
      </div>
    </div>
  );
}
