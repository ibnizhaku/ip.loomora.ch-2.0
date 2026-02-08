import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Send,
  Eye,
  FileText,
  Euro,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useInvoices, type Invoice } from "@/hooks/use-invoices";

// Map backend status to UI status
type UIStatus = "paid" | "pending" | "overdue" | "draft";

const mapStatus = (status: Invoice['status']): UIStatus => {
  switch (status) {
    case 'PAID': return 'paid';
    case 'SENT': return 'pending';
    case 'OVERDUE': return 'overdue';
    case 'DRAFT': return 'draft';
    case 'CANCELLED': return 'draft';
    default: return 'draft';
  }
};

const statusConfig = {
  paid: {
    label: "Bezahlt",
    color: "bg-success/10 text-success",
    icon: CheckCircle,
  },
  pending: {
    label: "Ausstehend",
    color: "bg-warning/10 text-warning",
    icon: Clock,
  },
  overdue: {
    label: "Überfällig",
    color: "bg-destructive/10 text-destructive",
    icon: XCircle,
  },
  draft: {
    label: "Entwurf",
    color: "bg-muted text-muted-foreground",
    icon: FileText,
  },
};

// Format date from ISO to DD.MM.YYYY
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-CH');
  } catch {
    return dateStr;
  }
};

export default function Invoices() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch invoices from API
  const { data: invoicesData, isLoading } = useInvoices({ 
    search: searchQuery || undefined,
    pageSize: 100 
  });
  
  const invoices = useMemo(() => invoicesData?.data || [], [invoicesData]);

  // Calculate stats from API data
  const totalAmount = useMemo(() => 
    invoices.reduce((acc, i) => acc + (i.total || 0), 0), [invoices]);
  const totalPaid = useMemo(() => 
    invoices.filter((i) => i.status === "PAID").reduce((acc, i) => acc + (i.total || 0), 0), [invoices]);
  const totalPending = useMemo(() => 
    invoices.filter((i) => i.status === "SENT").reduce((acc, i) => acc + (i.total || 0), 0), [invoices]);
  const totalOverdue = useMemo(() => 
    invoices.filter((i) => i.status === "OVERDUE").reduce((acc, i) => acc + (i.total || 0), 0), [invoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Rechnungen
          </h1>
          <p className="text-muted-foreground">
            Erstellen und verwalten Sie Ihre Rechnungen
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/invoices/new")}>
          <Plus className="h-4 w-4" />
          Neue Rechnung
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Euro className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt</p>
              <p className="text-2xl font-bold">
                CHF {totalAmount.toLocaleString("de-CH")}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bezahlt</p>
              <p className="text-2xl font-bold">CHF {totalPaid.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausstehend</p>
              <p className="text-2xl font-bold">CHF {totalPending.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Überfällig</p>
              <p className="text-2xl font-bold">CHF {totalOverdue.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechnungen suchen..."
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
              <TableHead>Rechnung</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Projekt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Fällig am</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Rechnungen werden geladen...</p>
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Keine Rechnungen gefunden</p>
                </TableCell>
              </TableRow>
            ) : invoices.map((invoice, index) => {
              const uiStatus = mapStatus(invoice.status);
              const StatusIcon = statusConfig[uiStatus].icon;
              return (
                <TableRow
                  key={invoice.id}
                  className="animate-fade-in cursor-pointer hover:bg-muted/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{invoice.number}</span>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.customer?.name || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.project?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("gap-1", statusConfig[uiStatus].color)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[uiStatus].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    CHF {(invoice.total || 0).toLocaleString("de-CH")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                          <Eye className="h-4 w-4" />
                          Anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Download className="h-4 w-4" />
                          Herunterladen
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Send className="h-4 w-4" />
                          Per E-Mail senden
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
