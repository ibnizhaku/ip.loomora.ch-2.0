import { useState } from "react";
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
import { cn } from "@/lib/utils";

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

const contracts: Contract[] = [
  {
    id: "1",
    number: "VTR-2024-001",
    title: "E-Commerce Entwicklung",
    client: "Fashion Store GmbH",
    type: "project",
    value: 85000,
    status: "active",
    startDate: "01.01.2024",
    endDate: "31.12.2024",
    autoRenewal: false,
    daysLeft: 334,
  },
  {
    id: "2",
    number: "VTR-2024-002",
    title: "Support & Wartung",
    client: "FinTech Solutions",
    type: "support",
    value: 24000,
    status: "active",
    startDate: "01.02.2024",
    endDate: "31.01.2025",
    autoRenewal: true,
    daysLeft: 365,
  },
  {
    id: "3",
    number: "VTR-2023-089",
    title: "Software Lizenz",
    client: "Sales Pro AG",
    type: "license",
    value: 12000,
    status: "expiring",
    startDate: "01.02.2023",
    endDate: "31.01.2024",
    autoRenewal: false,
    daysLeft: 0,
  },
  {
    id: "4",
    number: "VTR-2024-003",
    title: "Beratungsvertrag",
    client: "Tech Innovations",
    type: "service",
    value: 48000,
    status: "draft",
    startDate: "01.03.2024",
    endDate: "28.02.2025",
    autoRenewal: false,
  },
  {
    id: "5",
    number: "VTR-2022-045",
    title: "Hosting Services",
    client: "Data Analytics Inc.",
    type: "service",
    value: 18000,
    status: "expired",
    startDate: "01.01.2022",
    endDate: "31.12.2023",
    autoRenewal: false,
  },
  {
    id: "6",
    number: "VTR-2023-078",
    title: "Entwicklungsvertrag",
    client: "Logistics Plus",
    type: "project",
    value: 65000,
    status: "terminated",
    startDate: "01.06.2023",
    endDate: "31.05.2024",
    autoRenewal: false,
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContracts = contracts.filter(
    (c) =>
      c.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = contracts
    .filter((c) => c.status === "active")
    .reduce((acc, c) => acc + c.value, 0);
  const expiringCount = contracts.filter((c) => c.status === "expiring").length;

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Neuer Vertrag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{contracts.length}</p>
              <p className="text-sm text-muted-foreground">Verträge gesamt</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {contracts.filter((c) => c.status === "active").length}
              </p>
              <p className="text-sm text-muted-foreground">Aktive Verträge</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expiringCount}</p>
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
              <p className="text-2xl font-bold">€{totalValue.toLocaleString()}</p>
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
          <Button variant="outline" size="sm">
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
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
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
              const StatusIcon = statusConfig[contract.status].icon;
              return (
                <TableRow
                  key={contract.id}
                  className="cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                    <Badge className={typeConfig[contract.type].color}>
                      {typeConfig[contract.type].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", statusConfig[contract.status].color)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[contract.status].label}
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
                    €{contract.value.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Anzeigen</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Download className="h-4 w-4" />
                          Herunterladen
                        </DropdownMenuItem>
                        <DropdownMenuItem>Verlängern</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Kündigen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
