import { useState } from "react";
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Building2,
  Calendar,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface PurchaseInvoice {
  id: string;
  number: string;
  supplierNumber: string;
  supplier: string;
  invoiceDate: string;
  dueDate: string;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  currency: "CHF" | "EUR";
  status: "draft" | "pending" | "approved" | "paid" | "rejected";
  purchaseOrder?: string;
  costCenter?: string;
}

const purchaseInvoices: PurchaseInvoice[] = [
  {
    id: "1",
    number: "ERI-2024-001",
    supplierNumber: "R-45678",
    supplier: "Stahl AG Zürich",
    invoiceDate: "25.01.2024",
    dueDate: "24.02.2024",
    netAmount: 8450,
    vatAmount: 684.45,
    grossAmount: 9134.45,
    currency: "CHF",
    status: "pending",
    purchaseOrder: "BE-2024-0045",
    costCenter: "200 - Produktion",
  },
  {
    id: "2",
    number: "ERI-2024-002",
    supplierNumber: "2024-1234",
    supplier: "Verzinkerei Schweiz GmbH",
    invoiceDate: "22.01.2024",
    dueDate: "21.02.2024",
    netAmount: 2200,
    vatAmount: 178.20,
    grossAmount: 2378.20,
    currency: "CHF",
    status: "approved",
    costCenter: "200 - Produktion",
  },
  {
    id: "3",
    number: "ERI-2024-003",
    supplierNumber: "INV-2024-0089",
    supplier: "Schrauben Express AG",
    invoiceDate: "20.01.2024",
    dueDate: "19.02.2024",
    netAmount: 456.80,
    vatAmount: 36.99,
    grossAmount: 493.79,
    currency: "CHF",
    status: "paid",
    purchaseOrder: "BE-2024-0042",
    costCenter: "210 - Kleinmaterial",
  },
  {
    id: "4",
    number: "ERI-2024-004",
    supplierNumber: "RE-5567",
    supplier: "Werkzeug Müller",
    invoiceDate: "28.01.2024",
    dueDate: "27.02.2024",
    netAmount: 1250,
    vatAmount: 101.25,
    grossAmount: 1351.25,
    currency: "CHF",
    status: "draft",
    costCenter: "220 - Werkzeuge",
  },
];

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  approved: "bg-info/10 text-info",
  paid: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  draft: "Entwurf",
  pending: "Zur Prüfung",
  approved: "Freigegeben",
  paid: "Bezahlt",
  rejected: "Abgelehnt",
};

export default function PurchaseInvoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totalInvoices = purchaseInvoices.length;
  const pendingInvoices = purchaseInvoices.filter((i) => i.status === "pending").length;
  const openAmount = purchaseInvoices
    .filter((i) => i.status === "pending" || i.status === "approved")
    .reduce((sum, i) => sum + i.grossAmount, 0);
  const paidAmount = purchaseInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.grossAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Einkaufsrechnungen
          </h1>
          <p className="text-muted-foreground">
            Kreditorenrechnungen erfassen und prüfen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            PDF importieren
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Rechnung erfassen
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rechnungen</p>
              <p className="text-2xl font-bold">{totalInvoices}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zur Prüfung</p>
              <p className="text-2xl font-bold text-warning">{pendingInvoices}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold">CHF {openAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bezahlt (MTD)</p>
              <p className="text-2xl font-bold">CHF {paidAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechnung suchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
            <SelectItem value="pending">Zur Prüfung</SelectItem>
            <SelectItem value="approved">Freigegeben</SelectItem>
            <SelectItem value="paid">Bezahlt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {purchaseInvoices.map((invoice, index) => (
          <div
            key={invoice.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <Receipt className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{invoice.supplier}</h3>
                    <Badge className={statusStyles[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{invoice.number}</span>
                    {" • Lieferanten-Nr.: "}
                    <span className="font-mono">{invoice.supplierNumber}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Rechnungsdatum</p>
                  <p className="font-mono text-sm">{invoice.invoiceDate}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Fällig</p>
                  <p className="font-mono text-sm">{invoice.dueDate}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Netto</p>
                  <p className="font-mono">{invoice.currency} {invoice.netAmount.toLocaleString()}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">MwSt.</p>
                  <p className="font-mono text-sm">{invoice.currency} {invoice.vatAmount.toFixed(2)}</p>
                </div>

                <div className="text-right min-w-[120px]">
                  <p className="text-sm text-muted-foreground">Brutto</p>
                  <p className="font-mono font-bold">
                    {invoice.currency} {invoice.grossAmount.toLocaleString()}
                  </p>
                </div>

                {invoice.status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      Ablehnen
                    </Button>
                    <Button size="sm">
                      Freigeben
                    </Button>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Ansehen
                    </DropdownMenuItem>
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

            {(invoice.purchaseOrder || invoice.costCenter) && (
              <div className="mt-3 pt-3 border-t border-border flex gap-6 text-sm">
                {invoice.purchaseOrder && (
                  <span className="text-muted-foreground">
                    Bestellung: <span className="font-mono text-foreground">{invoice.purchaseOrder}</span>
                  </span>
                )}
                {invoice.costCenter && (
                  <span className="text-muted-foreground">
                    Kostenstelle: <span className="text-foreground">{invoice.costCenter}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
