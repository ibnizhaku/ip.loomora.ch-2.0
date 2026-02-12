import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Filter,
  Receipt,
  Building2,
  CheckCircle2,
  Clock,
  Euro,
  MoreHorizontal,
  FileText,
  ArrowDownLeft,
  Eye,
  Download,
  Mail,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Map backend status (UPPERCASE) to UI labels
function mapCreditNoteStatus(s: string): string {
  const upper = (s || "DRAFT").toUpperCase();
  if (upper === "POSTED" || upper === "BOOKED") return "Verbucht";
  if (upper === "CANCELLED") return "Storniert";
  return "Entwurf";
}

function mapCreditNoteReason(s: string): string {
  const upper = (s || "").toUpperCase();
  if (upper === "RETURN" || upper === "GOODS_RETURN") return "Warenrückgabe";
  if (upper === "PRICE_ADJUSTMENT") return "Preisanpassung";
  if (upper === "GOODWILL") return "Kulanz";
  if (upper === "PARTIAL_DELIVERY") return "Teillieferung";
  if (upper === "COMPLAINT" || upper === "RECLAMATION") return "Reklamation";
  return s || "–";
}

interface CreditNote {
  id: string;
  number: string;
  customer: string;
  invoice: string;
  date: string;
  reason: string;
  total: number;
  status: string;
}

function mapCreditNote(raw: any): CreditNote {
  return {
    id: raw.id || "",
    number: raw.number || raw.id || "",
    customer: raw.customer?.companyName || raw.customer?.name || "–",
    invoice: raw.invoice?.number || raw.invoiceId || "–",
    date: raw.date || raw.createdAt
      ? new Date(raw.date || raw.createdAt).toLocaleDateString("de-CH")
      : "–",
    reason: mapCreditNoteReason(raw.reason || ""),
    total: Number(raw.total || raw.amount || 0),
    status: mapCreditNoteStatus(raw.status),
  };
}

const statusConfig: Record<string, { color: string }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground" },
  "Verbucht": { color: "bg-success/10 text-success" },
  "Storniert": { color: "bg-destructive/10 text-destructive" },
};

const reasonConfig = ["Warenrückgabe", "Preisanpassung", "Kulanz", "Teillieferung", "Reklamation"];

const CreditNotes = () => {
  const { data: apiData } = useQuery({ queryKey: ["/credit-notes"], queryFn: () => api.get<any>("/credit-notes") });
  const creditNotes: CreditNote[] = (apiData?.data || []).map(mapCreditNote);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [reasonFilters, setReasonFilters] = useState<string[]>([]);

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleReasonFilter = (reason: string) => {
    setReasonFilters((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    );
  };

  const resetFilters = () => {
    setStatusFilters([]);
    setReasonFilters([]);
  };

  const hasActiveFilters = statusFilters.length > 0 || reasonFilters.length > 0;

  const filteredNotes = creditNotes.filter(note => {
    const matchesSearch =
      (note.number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.customer || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(note.status);
    const matchesReason = reasonFilters.length === 0 || reasonFilters.includes(note.reason);
    return matchesSearch && matchesStatus && matchesReason;
  });

  const handleDownloadPdf = (note: typeof creditNotes[0], e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`PDF für ${note.id} wird heruntergeladen...`);
  };

  const handleSendEmail = (note: typeof creditNotes[0], e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`${note.id} wird per E-Mail an ${note.customer} gesendet...`);
  };

  const handleCancel = (note: typeof creditNotes[0], e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`${note.id} wurde storniert`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Gutschriften</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Gutschriften und Erstattungen</p>
        </div>
        <Button onClick={() => navigate("/credit-notes/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Gutschrift
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Gutschriften (Monat)", value: `CHF ${creditNotes.reduce((s, n) => s + n.total, 0).toLocaleString("de-CH")}`, icon: ArrowDownLeft },
          { title: "Anzahl", value: String(creditNotes.length), icon: FileText },
          { title: "Ø Betrag", value: creditNotes.length > 0 ? `CHF ${Math.round(creditNotes.reduce((s, n) => s + n.total, 0) / creditNotes.length).toLocaleString("de-CH")}` : "CHF 0", icon: Euro },
          { title: "Offen", value: String(creditNotes.filter(n => n.status === "Entwurf").length), icon: Clock },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Gutschriften suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn(hasActiveFilters && "border-primary text-primary")}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {hasActiveFilters && (
                <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-popover" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Zurücksetzen
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="space-y-2">
                  {Object.keys(statusConfig).map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={statusFilters.includes(status)}
                        onCheckedChange={() => toggleStatusFilter(status)}
                      />
                      <label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Grund</Label>
                <div className="space-y-2">
                  {reasonConfig.map((reason) => (
                    <div key={reason} className="flex items-center space-x-2">
                      <Checkbox
                        id={`reason-${reason}`}
                        checked={reasonFilters.includes(reason)}
                        onCheckedChange={() => toggleReasonFilter(reason)}
                      />
                      <label htmlFor={`reason-${reason}`} className="text-sm cursor-pointer">
                        {reason}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gutschrift-Nr.</TableHead>
                <TableHead>Rechnung</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Grund</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.map((note) => {
                const status = statusConfig[note.status] || statusConfig["Entwurf"];
                return (
                  <TableRow 
                    key={note.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/credit-notes/${note.id}`)}
                  >
                    <TableCell>
                      <span className="font-medium hover:text-primary">
                        {note.number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span 
                        className="text-muted-foreground hover:text-primary cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${note.invoice}`); }}
                      >
                        {note.invoice}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {note.customer}
                      </div>
                    </TableCell>
                    <TableCell>{note.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{note.reason}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      -CHF {(Number(note.total) || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>{note.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/credit-notes/${note.id}`); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDownloadPdf(note, e)}>
                            <Download className="h-4 w-4 mr-2" />
                            PDF herunterladen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleSendEmail(note, e)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Per E-Mail senden
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={(e) => handleCancel(note, e)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Stornieren
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditNotes;
