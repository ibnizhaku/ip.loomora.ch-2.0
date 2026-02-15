import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Download,
  Edit,
  Euro,
  Trash2,
  Copy,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Contract {
  id: string;
  number: string;
  title: string;
  client: string;
  type: "service" | "project" | "support" | "license";
  value: number;
  status: "active" | "expiring" | "expired" | "draft" | "terminated";
  startDate: string;
  endDate: string;
  autoRenewal: boolean;
  daysLeft?: number;
}


const statusConfig = {
  active: { label: "Aktiv", color: "bg-success/10 text-success", icon: CheckCircle },
  expiring: { label: "Läuft aus", color: "bg-warning/10 text-warning", icon: AlertTriangle },
  expired: { label: "Abgelaufen", color: "bg-muted text-muted-foreground", icon: Clock },
  draft: { label: "Entwurf", color: "bg-info/10 text-info", icon: FileText },
  terminated: { label: "Gekündigt", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const typeConfig = {
  service: { label: "Dienstleistung", color: "bg-primary/10 text-primary" },
  project: { label: "Projekt", color: "bg-info/10 text-info" },
  support: { label: "Support", color: "bg-success/10 text-success" },
  license: { label: "Lizenz", color: "bg-warning/10 text-warning" },
};

export default function Contracts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Fetch data from API
  const { data: apiData, isLoading } = useQuery({
    queryKey: ["/contracts"],
    queryFn: () => api.get<any>("/contracts"),
  });
  const initialContracts: Contract[] = (apiData?.data || []).map((raw: any) => ({
    id: raw.id || "",
    number: raw.number || "",
    title: raw.title || raw.name || "–",
    client: raw.customer?.companyName || raw.customer?.name || raw.client || "–",
    type: (raw.type || "service").toLowerCase(),
    value: Number(raw.value || raw.total || 0),
    status: (raw.status || "draft").toLowerCase(),
    startDate: raw.startDate ? new Date(raw.startDate).toLocaleDateString("de-CH") : "–",
    endDate: raw.endDate ? new Date(raw.endDate).toLocaleDateString("de-CH") : "–",
    autoRenewal: raw.autoRenewal || false,
    daysLeft: raw.daysLeft,
  }));
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [autoRenewalFilter, setAutoRenewalFilter] = useState<boolean | null>(null);
  const [contractList, setContractList] = useState<Contract[]>(initialContracts);

  const hasActiveFilters = typeFilters.length > 0 || autoRenewalFilter !== null;

  const filteredContracts = contractList.filter((c) => {
    const matchesSearch = (c.number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.client || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilters.length === 0 || typeFilters.includes(c.type);
    const matchesAutoRenewal = autoRenewalFilter === null || c.autoRenewal === autoRenewalFilter;
    return matchesSearch && matchesStatus && matchesType && matchesAutoRenewal;
  });

  const totalValue = contractList.filter((c) => c.status === "active").reduce((acc, c) => acc + (c.value || 0), 0);
  const expiringCount = contractList.filter((c) => c.status === "expiring").length;
  const activeCount = contractList.filter((c) => c.status === "active").length;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/contracts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/contracts"] });
      toast.success("Vertrag erfolgreich gelöscht");
    },
  });

  const handleDelete = (e: React.MouseEvent, contractId: string) => {
    e.stopPropagation();
    deleteMutation.mutate(contractId);
  };

  const handleDuplicate = (e: React.MouseEvent, contract: Contract) => {
    e.stopPropagation();
    const newContract: Contract = {
      ...contract,
      id: Date.now().toString(),
      number: `VTR-2024-${String(contractList.length + 1).padStart(3, '0')}`,
      title: `${contract.title} (Kopie)`,
      status: "draft",
    };
    setContractList([...contractList, newContract]);
    toast.success("Vertrag dupliziert");
  };

  const handleRenew = (e: React.MouseEvent, contract: Contract) => {
    e.stopPropagation();
    setContractList(contractList.map(c => 
      c.id === contract.id ? { ...c, status: "active" as const, daysLeft: 365 } : c
    ));
    toast.success("Vertrag verlängert");
  };

  const handleTerminate = (e: React.MouseEvent, contractId: string) => {
    e.stopPropagation();
    setContractList(contractList.map(c => 
      c.id === contractId ? { ...c, status: "terminated" as const } : c
    ));
    toast.success("Vertrag gekündigt");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Verträge
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Kundenverträge
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/contracts/new")}>
          <Plus className="h-4 w-4" />
          Neuer Vertrag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-primary/50",
            statusFilter === "all" ? "border-primary ring-2 ring-primary/20" : "border-border"
          )}
          onClick={() => setStatusFilter("all")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : contractList.length}</p>
              <p className="text-sm text-muted-foreground">Verträge gesamt</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-success/50",
            statusFilter === "active" ? "border-success ring-2 ring-success/20" : "border-border"
          )}
          onClick={() => setStatusFilter("active")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : activeCount}</p>
              <p className="text-sm text-muted-foreground">Aktive Verträge</p>
            </div>
          </div>
        </div>
        <div 
          className={cn(
            "rounded-xl border bg-card p-5 cursor-pointer transition-all hover:border-warning/50",
            statusFilter === "expiring" ? "border-warning ring-2 ring-warning/20" : "border-border"
          )}
          onClick={() => setStatusFilter("expiring")}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? "—" : expiringCount}</p>
              <p className="text-sm text-muted-foreground">Laufen bald aus</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Euro className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `CHF ${totalValue.toLocaleString()}`}
              </p>
              <p className="text-sm text-muted-foreground">Aktiver Wert</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {expiringCount > 0 && (
        <div className="rounded-xl border border-warning/50 bg-warning/5 p-4 flex items-center gap-4">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <div className="flex-1">
            <p className="font-medium">
              {expiringCount} Vertrag/Verträge laufen bald aus
            </p>
            <p className="text-sm text-muted-foreground">
              Überprüfen Sie die Verträge und verlängern Sie sie bei Bedarf.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStatusFilter("expiring")}>
            Anzeigen
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Verträge suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground"
                    onClick={() => {
                      setTypeFilters([]);
                      setAutoRenewalFilter(null);
                    }}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Zurücksetzen
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Vertragstyp</p>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${key}`}
                      checked={typeFilters.includes(key)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setTypeFilters([...typeFilters, key]);
                        } else {
                          setTypeFilters(typeFilters.filter((t) => t !== key));
                        }
                      }}
                    />
                    <label
                      htmlFor={`type-${key}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {config.label}
                    </label>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Auto-Verlängerung</p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-renewal-yes"
                    checked={autoRenewalFilter === true}
                    onCheckedChange={(checked) => {
                      setAutoRenewalFilter(checked ? true : null);
                    }}
                  />
                  <label htmlFor="auto-renewal-yes" className="text-sm cursor-pointer">
                    Mit Auto-Verlängerung
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-renewal-no"
                    checked={autoRenewalFilter === false}
                    onCheckedChange={(checked) => {
                      setAutoRenewalFilter(checked ? false : null);
                    }}
                  />
                  <label htmlFor="auto-renewal-no" className="text-sm cursor-pointer">
                    Ohne Auto-Verlängerung
                  </label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Vertrag</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Laufzeit</TableHead>
              <TableHead className="text-right">Wert</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.map((contract, index) => {
              const sc = statusConfig[contract.status] || statusConfig.active;
              const StatusIcon = sc.icon;
              return (
                <TableRow
                  key={contract.id}
                  className="cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/contracts/${contract.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="font-medium">{contract.number}</span>
                        <p className="text-sm text-muted-foreground">
                          {contract.title}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{contract.client}</TableCell>
                  <TableCell>
                    <Badge className={(typeConfig[contract.type] || { color: "bg-muted text-muted-foreground", label: contract.type }).color}>
                      {(typeConfig[contract.type] || { color: "bg-muted text-muted-foreground", label: contract.type }).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", sc.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {sc.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>
                        {contract.startDate} - {contract.endDate}
                      </p>
                      {contract.daysLeft !== undefined && contract.status === "active" && (
                        <p className="text-muted-foreground">
                          Noch {contract.daysLeft} Tage
                        </p>
                      )}
                      {contract.autoRenewal && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Auto-Verlängerung
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    CHF {contract.value.toLocaleString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/contracts/${contract.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/contracts/${contract.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDuplicate(e, contract)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("PDF wird heruntergeladen...")}>
                          <Download className="h-4 w-4 mr-2" />
                          Herunterladen
                        </DropdownMenuItem>
                        {(contract.status === "expiring" || contract.status === "expired") && (
                          <DropdownMenuItem onClick={(e) => handleRenew(e, contract)}>
                            Verlängern
                          </DropdownMenuItem>
                        )}
                        {contract.status === "active" && (
                          <DropdownMenuItem className="text-destructive" onClick={(e) => handleTerminate(e, contract.id)}>
                            Kündigen
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(e, contract.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredContracts.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Keine Verträge gefunden</p>
            <p className="text-sm">Passen Sie die Filter an oder erstellen Sie einen neuen Vertrag</p>
          </div>
        )}
      </div>
    </div>
  );
}
