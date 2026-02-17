import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Send,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Banknote,
  ArrowRight,
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
import { toast } from "sonner";

interface QuoteRaw {
  id: string;
  number: string;
  customer?: { id: string; name: string; companyName?: string };
  total?: number;
  subtotal?: number;
  status: string;
  validUntil?: string;
  createdAt?: string;
  _count?: { items: number };
  notes?: string;
}

interface Quote {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: string;
  validUntil: string;
  items: number;
}

function mapQuote(raw: QuoteRaw): Quote {
  return {
    id: raw.id,
    number: raw.number || "",
    client: raw.customer?.companyName || raw.customer?.name || "–",
    amount: Number(raw.total || raw.subtotal || 0),
    status: (raw.status || "DRAFT").toLowerCase(),
    validUntil: raw.validUntil
      ? new Date(raw.validUntil).toLocaleDateString("de-CH")
      : "–",
    items: raw._count?.items ?? 0,
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Entwurf", color: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "Versendet", color: "bg-info/10 text-info", icon: Send },
  confirmed: { label: "Bestätigt", color: "bg-success/10 text-success", icon: CheckCircle },
  accepted: { label: "Angenommen", color: "bg-success/10 text-success", icon: CheckCircle },
  declined: { label: "Abgelehnt", color: "bg-destructive/10 text-destructive", icon: XCircle },
  cancelled: { label: "Storniert", color: "bg-destructive/10 text-destructive", icon: XCircle },
  expired: { label: "Abgelaufen", color: "bg-warning/10 text-warning", icon: Clock },
};

const defaultStatus = { label: "Unbekannt", color: "bg-muted text-muted-foreground", icon: FileText };

export default function Quotes() {
  const queryClient = useQueryClient();
  const { data: apiData, isLoading } = useQuery({ queryKey: ["/quotes"], queryFn: () => api.get<any>("/quotes") });
  const quotes: Quote[] = (apiData?.data || []).map(mapQuote);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/quotes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/quotes"] });
      toast.success("Offerte erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
    },
  });

  const filteredQuotes = useMemo(() => quotes.filter(
    (q) => {
      const matchesSearch = q.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(q.status);
      return matchesSearch && matchesStatus;
    }
  ), [quotes, searchQuery, statusFilters]);

  const nonDraftCount = quotes.filter((q) => q.status !== "draft").length;
  const acceptedCount = quotes.filter((q) => q.status === "accepted" || q.status === "confirmed").length;

  const stats = {
    total: quotes.reduce((acc, q) => acc + q.amount, 0),
    accepted: quotes.filter((q) => q.status === "accepted" || q.status === "confirmed").reduce((acc, q) => acc + q.amount, 0),
    pending: quotes.filter((q) => q.status === "sent").reduce((acc, q) => acc + q.amount, 0),
    conversionRate: nonDraftCount > 0 ? Math.round((acceptedCount / nonDraftCount) * 100) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Angebote
          </h1>
          <p className="text-muted-foreground">
            Erstellen und verwalten Sie Ihre Angebote
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/quotes/new")}>
          <Plus className="h-4 w-4" />
          Neues Angebot
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Banknote className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamtwert</p>
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `CHF ${stats.total.toLocaleString("de-CH")}`}
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
              <p className="text-sm text-muted-foreground">Angenommen</p>
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `CHF ${stats.accepted.toLocaleString("de-CH")}`}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Send className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `CHF ${stats.pending.toLocaleString("de-CH")}`}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <ArrowRight className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion</p>
              <p className="text-2xl font-bold">
                {isLoading ? "—" : `${stats.conversionRate}%`}
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
            placeholder="Angebote suchen..."
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
          {filteredQuotes.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground rounded-xl border border-dashed">
              Keine Angebote gefunden
            </div>
          ) : (
            filteredQuotes.map((quote, index) => {
              const cfg = statusConfig[quote.status] || defaultStatus;
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={quote.id}
                  className="group relative rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/quotes/${quote.id}`)}
                >
                  <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => navigate(`/quotes/${quote.id}`)}>Anzeigen</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => navigate(`/quotes/${quote.id}/edit`)}>Bearbeiten</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onSelect={() => navigate(`/quotes/new?customerId=${quote.id}`)}>
                          <Copy className="h-4 w-4" />
                          Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => {
                            if (confirm("Offerte wirklich löschen?")) {
                              deleteMutation.mutate(quote.id);
                            }
                          }}
                        >
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{quote.number}</p>
                      <p className="text-sm text-muted-foreground">{quote.items} Positionen</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{quote.client}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Gültig bis: {quote.validUntil}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                    <Badge className={cn("gap-1", cfg.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                    <span className="font-semibold">CHF {quote.amount.toLocaleString("de-CH")}</span>
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
                <TableHead>Angebot</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Projekt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Gültig bis</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote, index) => {
                const cfg = statusConfig[quote.status] || defaultStatus;
                const StatusIcon = cfg.icon;
                return (
                  <TableRow
                    key={quote.id}
                    className="cursor-pointer animate-fade-in hover:bg-muted/50"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/quotes/${quote.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="font-medium">{quote.number}</span>
                          <p className="text-xs text-muted-foreground">
                            {quote.items} Positionen
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{quote.client}</TableCell>
                    <TableCell className="text-muted-foreground">
                      –
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1", cfg.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      CHF {quote.amount.toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {quote.validUntil}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => navigate(`/quotes/${quote.id}`)}>Anzeigen</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => navigate(`/quotes/${quote.id}/edit`)}>Bearbeiten</DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onSelect={() => navigate(`/quotes/new?customerId=${quote.id}`)}>
                            <Copy className="h-4 w-4" />
                            Duplizieren
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onSelect={async () => { try { const { sendEmail } = await import("@/lib/api"); await sendEmail('quotes', quote.id); toast.success("Angebot versendet"); } catch { toast.error("Fehler beim Versenden"); } }}>
                            <Send className="h-4 w-4" />
                            Versenden
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onSelect={() => navigate(`/invoices/new?quoteId=${quote.id}`)}>
                            <ArrowRight className="h-4 w-4" />
                            In Rechnung umwandeln
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={() => {
                              if (confirm("Offerte wirklich löschen?")) {
                                deleteMutation.mutate(quote.id);
                              }
                            }}
                          >
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
        </div>
      )}
    </div>
  );
}
