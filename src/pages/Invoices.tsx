import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { SendEmailModal } from "@/components/email/SendEmailModal";
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
  LayoutGrid,
  List,
  Building2,
  Calendar,
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useInvoices, type Invoice } from "@/hooks/use-invoices";
import { usePermissions } from "@/hooks/use-permissions";

// Map backend status to UI status
type UIStatus = "paid" | "pending" | "overdue" | "draft";

const mapStatus = (status: Invoice['status']): UIStatus => {
  const s = (status || 'DRAFT').toUpperCase();
  switch (s) {
    case 'PAID': return 'paid';
    case 'SENT': return 'pending';
    case 'OVERDUE': return 'overdue';
    case 'DRAFT': return 'draft';
    case 'CANCELLED': return 'draft';
    case 'PARTIAL': return 'pending';
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { canWrite, canDelete } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [emailModal, setEmailModal] = useState<{ id: string; number: string; recipient?: string } | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  
  const { data: invoicesData, isLoading } = useInvoices({ 
    search: searchQuery || undefined,
    pageSize: 100 
  });
  
  const invoices = useMemo(() => invoicesData?.data || [], [invoicesData]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Rechnung erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
    },
  });

  const totalAmount = useMemo(() => 
    invoices.reduce((acc, i) => acc + (i.total || 0), 0), [invoices]);
  const totalPaid = useMemo(() => 
    invoices.filter((i) => i.status === "PAID").reduce((acc, i) => acc + (i.total || 0), 0), [invoices]);
  const totalPending = useMemo(() => 
    invoices.filter((i) => i.status === "SENT").reduce((acc, i) => acc + (i.total || 0), 0), [invoices]);
  const totalOverdue = useMemo(() => 
    invoices.filter((i) => i.status === "OVERDUE").reduce((acc, i) => acc + (i.total || 0), 0), [invoices]);

  const filteredInvoices = useMemo(() => invoices.filter((i) => {
    if (statusFilters.length === 0) return true;
    const uiStatus = mapStatus(i.status);
    return statusFilters.includes(uiStatus);
  }), [invoices, statusFilters]);

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
        {canWrite('invoices') && (
          <Button className="gap-2" onClick={() => navigate("/invoices/new")}>
            <Plus className="h-4 w-4" />
            Neue Rechnung
          </Button>
        )}
      </div>


      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Euro className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt</p>
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `CHF ${totalAmount.toLocaleString("de-CH")}`}
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
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `CHF ${totalPaid.toLocaleString("de-CH")}`}
              </p>
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
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `CHF ${totalPending.toLocaleString("de-CH")}`}
              </p>
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
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `CHF ${totalOverdue.toLocaleString("de-CH")}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters + View Toggle */}
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
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className={statusFilters.length > 0 ? "border-primary text-primary" : ""}>
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 bg-popover border border-border shadow-lg z-50" align="end">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Status filtern</p>
                  {statusFilters.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setStatusFilters([])}>
                      Zurücksetzen
                    </Button>
                  )}
                </div>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={statusFilters.includes(key)}
                      onCheckedChange={(checked) => {
                        setStatusFilters(prev =>
                          checked ? [...prev, key] : prev.filter(s => s !== key)
                        );
                      }}
                    />
                    <span className="text-sm">{cfg.label}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "table" && "bg-primary/10 text-primary")}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", viewMode === "cards" && "bg-primary/10 text-primary")}
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Card View */}
      {viewMode === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground rounded-xl border border-dashed">
              Keine Rechnungen gefunden
            </div>
          ) : (
            filteredInvoices.map((invoice, index) => {
              const uiStatus = mapStatus(invoice.status);
              const cfg = statusConfig[uiStatus];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={invoice.id}
                  className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onSelect={() => navigate(`/invoices/${invoice.id}`)}>
                          <Eye className="h-4 w-4" />
                          Anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onSelect={() => import("@/lib/api").then(m => m.downloadPdf("invoices", invoice.id, `Rechnung-${invoice.number}.pdf`))}>
                          <Download className="h-4 w-4" />
                          Herunterladen
                        </DropdownMenuItem>
                        {canWrite('invoices') && (
                          <DropdownMenuItem className="gap-2" onSelect={() => setEmailModal({ id: invoice.id, number: invoice.number || invoice.id, recipient: (invoice.customer as any)?.email })}>
                            <Send className="h-4 w-4" />
                            Per E-Mail senden
                          </DropdownMenuItem>
                        )}
                        {canDelete('invoices') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() => {
                                if (confirm("Rechnung wirklich löschen?")) {
                                  deleteMutation.mutate(invoice.id);
                                }
                              }}
                            >
                              Löschen
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invoice.number}</p>
                      <p className="text-sm text-muted-foreground">{invoice.project?.name || '–'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{invoice.customer?.name || '–'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Fällig: {formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                    <Badge className={cn("gap-1", cfg.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                    <span className="font-semibold">CHF {(invoice.total || 0).toLocaleString("de-CH")}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
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
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Keine Rechnungen gefunden</p>
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.map((invoice, index) => {
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onSelect={() => navigate(`/invoices/${invoice.id}`)}>
                            <Eye className="h-4 w-4" />
                            Anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onSelect={() => import("@/lib/api").then(m => m.downloadPdf("invoices", invoice.id, `Rechnung-${invoice.number}.pdf`))}>
                            <Download className="h-4 w-4" />
                            Herunterladen
                          </DropdownMenuItem>
                          {canWrite('invoices') && (
                            <DropdownMenuItem className="gap-2" onSelect={() => setEmailModal({ id: invoice.id, number: invoice.number || invoice.id, recipient: (invoice.customer as any)?.email })}>
                              <Send className="h-4 w-4" />
                              Per E-Mail senden
                            </DropdownMenuItem>
                          )}
                           {canDelete('invoices') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => {
                                  if (confirm("Rechnung wirklich löschen?")) {
                                    deleteMutation.mutate(invoice.id);
                                  }
                                }}
                              >
                                Löschen
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {emailModal && (
        <SendEmailModal
          open={true}
          onClose={() => setEmailModal(null)}
          documentType="invoice"
          documentId={emailModal.id}
          documentNumber={emailModal.number}
          defaultRecipient={emailModal.recipient}
        />
      )}
    </div>
  );
}
