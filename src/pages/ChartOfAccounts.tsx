import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Download,
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
import { toast } from "sonner";

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

// Schweizer Kontenrahmen KMU (nach OR 957a)
const accounts: Account[] = [
  {
    id: "1",
    number: "1",
    name: "Aktiven",
    type: "asset",
    category: "Aktiven",
    balance: 856000,
    children: [
      { id: "1-1", number: "1000", name: "Kasse", type: "asset", category: "Aktiven", balance: 2500 },
      { id: "1-2", number: "1010", name: "Post", type: "asset", category: "Aktiven", balance: 15000 },
      { id: "1-3", number: "1020", name: "Bank UBS", type: "asset", category: "Aktiven", balance: 125000 },
      { id: "1-4", number: "1021", name: "Bank ZKB", type: "asset", category: "Aktiven", balance: 85000 },
      { id: "1-5", number: "1100", name: "Debitoren (Forderungen aus L+L)", type: "asset", category: "Aktiven", balance: 178500 },
      { id: "1-6", number: "1109", name: "Delkredere", type: "asset", category: "Aktiven", balance: -8925 },
      { id: "1-7", number: "1170", name: "Vorsteuer MWST", type: "asset", category: "Aktiven", balance: 12400 },
      { id: "1-8", number: "1200", name: "Warenvorräte", type: "asset", category: "Aktiven", balance: 45000 },
      { id: "1-9", number: "1300", name: "Aktive Rechnungsabgrenzung", type: "asset", category: "Aktiven", balance: 1525 },
      { id: "1-10", number: "1500", name: "Maschinen und Apparate", type: "asset", category: "Aktiven", balance: 180000 },
      { id: "1-11", number: "1509", name: "WB Maschinen", type: "asset", category: "Aktiven", balance: -45000 },
      { id: "1-12", number: "1520", name: "Fahrzeuge", type: "asset", category: "Aktiven", balance: 120000 },
      { id: "1-13", number: "1529", name: "WB Fahrzeuge", type: "asset", category: "Aktiven", balance: -48000 },
      { id: "1-14", number: "1600", name: "Immobilien", type: "asset", category: "Aktiven", balance: 350000 },
      { id: "1-15", number: "1609", name: "WB Immobilien", type: "asset", category: "Aktiven", balance: -30000 },
    ],
  },
  {
    id: "2",
    number: "2",
    name: "Passiven",
    type: "liability",
    category: "Passiven",
    balance: 856000,
    children: [
      { id: "2-1", number: "2000", name: "Kreditoren (Verbindlichkeiten aus L+L)", type: "liability", category: "Passiven", balance: 78000 },
      { id: "2-2", number: "2030", name: "Kontokorrent AHV/IV/EO/ALV", type: "liability", category: "Passiven", balance: 12500 },
      { id: "2-3", number: "2050", name: "Kontokorrent Quellensteuer", type: "liability", category: "Passiven", balance: 3400 },
      { id: "2-4", number: "2100", name: "Bankverbindlichkeiten kurzfristig", type: "liability", category: "Passiven", balance: 25000 },
      { id: "2-5", number: "2200", name: "MWST-Schuld", type: "liability", category: "Passiven", balance: 18600 },
      { id: "2-6", number: "2300", name: "Passive Rechnungsabgrenzung", type: "liability", category: "Passiven", balance: 18500 },
      { id: "2-7", number: "2400", name: "Bankdarlehen", type: "liability", category: "Passiven", balance: 150000 },
      { id: "2-8", number: "2450", name: "Hypotheken", type: "liability", category: "Passiven", balance: 50000 },
    ],
  },
  {
    id: "3",
    number: "28",
    name: "Eigenkapital",
    type: "equity",
    category: "Passiven",
    balance: 500000,
    children: [
      { id: "3-1", number: "2800", name: "Aktienkapital / Stammkapital", type: "equity", category: "Passiven", balance: 100000 },
      { id: "3-2", number: "2900", name: "Gesetzliche Kapitalreserven", type: "equity", category: "Passiven", balance: 50000 },
      { id: "3-3", number: "2950", name: "Gewinnvortrag / Verlustvortrag", type: "equity", category: "Passiven", balance: 280000 },
      { id: "3-4", number: "2979", name: "Jahresgewinn / Jahresverlust", type: "equity", category: "Passiven", balance: 70000 },
    ],
  },
  {
    id: "4",
    number: "3",
    name: "Betriebsertrag aus Lieferungen und Leistungen",
    type: "revenue",
    category: "Ertrag",
    balance: 1250000,
    children: [
      { id: "4-1", number: "3000", name: "Produktionserlöse", type: "revenue", category: "Ertrag", balance: 850000 },
      { id: "4-2", number: "3200", name: "Handelserlöse", type: "revenue", category: "Ertrag", balance: 320000 },
      { id: "4-3", number: "3400", name: "Dienstleistungserlöse", type: "revenue", category: "Ertrag", balance: 95000 },
      { id: "4-4", number: "3800", name: "Erlösminderungen", type: "revenue", category: "Ertrag", balance: -15000 },
    ],
  },
  {
    id: "5",
    number: "4",
    name: "Aufwand für Material, Handelswaren, Dienstleistungen",
    type: "expense",
    category: "Aufwand",
    balance: 580000,
    children: [
      { id: "5-1", number: "4000", name: "Materialaufwand", type: "expense", category: "Aufwand", balance: 380000 },
      { id: "5-2", number: "4200", name: "Handelswarenaufwand", type: "expense", category: "Aufwand", balance: 165000 },
      { id: "5-3", number: "4400", name: "Aufwand für bezogene Dienstleistungen", type: "expense", category: "Aufwand", balance: 35000 },
    ],
  },
  {
    id: "6",
    number: "5",
    name: "Personalaufwand",
    type: "expense",
    category: "Aufwand",
    balance: 420000,
    children: [
      { id: "6-1", number: "5000", name: "Löhne und Gehälter", type: "expense", category: "Aufwand", balance: 320000 },
      { id: "6-2", number: "5700", name: "Sozialversicherungsaufwand AHV/IV/EO/ALV", type: "expense", category: "Aufwand", balance: 42000 },
      { id: "6-3", number: "5710", name: "Aufwand BVG (Pensionskasse)", type: "expense", category: "Aufwand", balance: 38000 },
      { id: "6-4", number: "5720", name: "Aufwand UVG/NBU", type: "expense", category: "Aufwand", balance: 8500 },
      { id: "6-5", number: "5730", name: "Aufwand KTG", type: "expense", category: "Aufwand", balance: 4500 },
      { id: "6-6", number: "5800", name: "Übriger Personalaufwand", type: "expense", category: "Aufwand", balance: 7000 },
    ],
  },
  {
    id: "7",
    number: "6",
    name: "Übriger betrieblicher Aufwand",
    type: "expense",
    category: "Aufwand",
    balance: 125000,
    children: [
      { id: "7-1", number: "6000", name: "Raumaufwand", type: "expense", category: "Aufwand", balance: 36000 },
      { id: "7-2", number: "6100", name: "Unterhalt und Reparaturen", type: "expense", category: "Aufwand", balance: 18000 },
      { id: "7-3", number: "6200", name: "Fahrzeugaufwand", type: "expense", category: "Aufwand", balance: 24000 },
      { id: "7-4", number: "6300", name: "Sachversicherungen", type: "expense", category: "Aufwand", balance: 8500 },
      { id: "7-5", number: "6500", name: "Verwaltungsaufwand", type: "expense", category: "Aufwand", balance: 22000 },
      { id: "7-6", number: "6570", name: "Informatikaufwand", type: "expense", category: "Aufwand", balance: 12000 },
      { id: "7-7", number: "6600", name: "Werbeaufwand", type: "expense", category: "Aufwand", balance: 4500 },
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
  asset: "Aktiven",
  liability: "Fremdkapital",
  equity: "Eigenkapital",
  revenue: "Ertrag",
  expense: "Aufwand",
};

export default function ChartOfAccounts() {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState<string[]>(["1", "4", "6"]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const formatCHF = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString("de-CH", { minimumFractionDigits: 2 });
    return amount < 0 ? `-CHF ${formatted}` : `CHF ${formatted}`;
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
              "font-mono font-medium min-w-[140px] text-right",
              account.type === "revenue" && "text-success",
              account.type === "expense" && "text-destructive"
            )}>
              {formatCHF(account.balance)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/chart-of-accounts/${account.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => toast.success("Konto gelöscht")}>
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
            Schweizer Kontenrahmen KMU (OR 957a)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Export wird erstellt...")}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2" onClick={() => navigate("/chart-of-accounts/new")}>
            <Plus className="h-4 w-4" />
            Konto anlegen
          </Button>
        </div>
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
              CHF {accounts
                .filter((a) => a.type === type)
                .reduce((acc, a) => acc + a.balance, 0)
                .toLocaleString("de-CH")}
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
