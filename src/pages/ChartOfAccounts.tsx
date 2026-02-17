import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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

  // Fetch from API
  const { data: apiData } = useQuery({
    queryKey: ["/finance/accounts"],
    queryFn: () => api.get<any>("/finance/accounts?pageSize=500"),
  });

  // Build tree from flat API data, fallback to hardcoded if empty
  const accountsData: Account[] = useMemo(() => {
    const flat = apiData?.data || [];
    if (flat.length === 0) return [];

    // Group into parent accounts (no parentId) and children
    const parents = flat.filter((a: any) => !a.parentId);
    const children = flat.filter((a: any) => a.parentId);
    
    return parents.map((p: any) => ({
      id: p.id,
      number: p.number,
      name: p.name,
      type: (p.type?.toLowerCase() || 'asset') as Account['type'],
      category: p.type || 'asset',
      balance: Number(p.balance || 0),
      children: children
        .filter((c: any) => c.parentId === p.id)
        .map((c: any) => ({
          id: c.id,
          number: c.number,
          name: c.name,
          type: (c.type?.toLowerCase() || 'asset') as Account['type'],
          category: c.type || 'asset',
          balance: Number(c.balance || 0),
        })),
    }));
  }, [apiData]);

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
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => {
              const flattenAccounts = (accs: Account[], prefix = ""): string[] => {
                return accs.flatMap(acc => {
                  const row = `${acc.number};${acc.name};${typeLabels[acc.type]};${acc.balance}`;
                  if (acc.children) {
                    return [row, ...flattenAccounts(acc.children, "  ")];
                  }
                  return [row];
                });
              };
              
              const csvContent = "Kontonummer;Kontoname;Typ;Saldo CHF\n" + flattenAccounts(accountsData).join("\n");
              const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Kontenplan-${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast.success("Kontenplan exportiert");
            }}
          >
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
              CHF {accountsData
                .filter((a) => a.type === type)
                .reduce((acc, a) => acc + a.balance, 0)
                .toLocaleString("de-CH")}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {accountsData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">Noch kein Kontenplan vorhanden</p>
            <p className="text-sm mt-1">Legen Sie Ihr erstes Konto an, um den Kontenplan aufzubauen.</p>
            <Button className="mt-4 gap-2" onClick={() => navigate("/chart-of-accounts/new")}>
              <Plus className="h-4 w-4" />
              Erstes Konto anlegen
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {(searchQuery ? accountsData.flatMap(a => [a, ...(a.children || [])]).filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.number.includes(searchQuery)) : accountsData).map((account) => renderAccount(account))}
          </div>
        )}
      </div>
    </div>
  );
}
