import { useState } from "react";
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

  const filteredQuotes = quotes.filter(
    (q) =>
      q.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Filters */}
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
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
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
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/quotes/${quote.id}`)}>Anzeigen</DropdownMenuItem>
                        <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Copy className="h-4 w-4" />
                          Duplizieren
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Send className="h-4 w-4" />
                          Versenden
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <ArrowRight className="h-4 w-4" />
                          In Rechnung umwandeln
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
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
    </div>
  );
}
