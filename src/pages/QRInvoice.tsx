import { useState } from "react";
import {
  Plus,
  Search,
  QrCode,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Eye,
  Copy,
  Printer,
  MoreHorizontal,
  AlertTriangle,
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

interface QRInvoiceData {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  currency: "CHF" | "EUR";
  iban: string;
  reference: string;
  referenceType: "QRR" | "SCOR" | "NON";
  status: "draft" | "generated" | "sent" | "paid";
  dueDate: string;
  createdAt: string;
  qrGenerated: boolean;
}

const qrInvoices: QRInvoiceData[] = [
  {
    id: "1",
    invoiceNumber: "RE-2024-0156",
    customer: "Bauherr AG",
    amount: 31970,
    currency: "CHF",
    iban: "CH93 0076 2011 6238 5295 7",
    reference: "000000000000000000000000156",
    referenceType: "QRR",
    status: "sent",
    dueDate: "28.02.2024",
    createdAt: "29.01.2024",
    qrGenerated: true,
  },
  {
    id: "2",
    invoiceNumber: "RE-2024-0157",
    customer: "Immobilien Müller",
    amount: 8760,
    currency: "CHF",
    iban: "CH93 0076 2011 6238 5295 7",
    reference: "000000000000000000000000157",
    referenceType: "QRR",
    status: "paid",
    dueDate: "15.02.2024",
    createdAt: "25.01.2024",
    qrGenerated: true,
  },
  {
    id: "3",
    invoiceNumber: "RE-2024-0158",
    customer: "Logistik Center Zürich",
    amount: 15700,
    currency: "CHF",
    iban: "CH93 0076 2011 6238 5295 7",
    reference: "000000000000000000000000158",
    referenceType: "QRR",
    status: "generated",
    dueDate: "10.03.2024",
    createdAt: "30.01.2024",
    qrGenerated: true,
  },
  {
    id: "4",
    invoiceNumber: "RE-2024-0159",
    customer: "Privat Schneider",
    amount: 4250,
    currency: "CHF",
    iban: "CH93 0076 2011 6238 5295 7",
    reference: "",
    referenceType: "NON",
    status: "draft",
    dueDate: "15.03.2024",
    createdAt: "31.01.2024",
    qrGenerated: false,
  },
];

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  generated: "bg-info/10 text-info",
  sent: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
};

const statusLabels = {
  draft: "Entwurf",
  generated: "QR generiert",
  sent: "Versendet",
  paid: "Bezahlt",
};

const refTypeLabels = {
  QRR: "QR-Referenz",
  SCOR: "Creditor Ref.",
  NON: "Ohne Referenz",
};

export default function QRInvoice() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const totalInvoices = qrInvoices.length;
  const paidInvoices = qrInvoices.filter((i) => i.status === "paid").length;
  const openAmount = qrInvoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const paidAmount = qrInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            QR-Rechnung
          </h1>
          <p className="text-muted-foreground">
            Swiss QR-Invoice gem. ISO 20022 Standard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Sammel-PDF
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            QR-Rechnung erstellen
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <QrCode className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="font-semibold text-info">Swiss QR-Rechnung Standard</h3>
            <p className="text-sm text-muted-foreground">
              Konform mit ISO 20022 und den Vorgaben von SIX. Unterstützt QR-IBAN mit QR-Referenz (QRR), 
              Creditor Reference (SCOR) und Rechnungen ohne Referenz.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">QR-Rechnungen</p>
              <p className="text-2xl font-bold">{totalInvoices}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bezahlt</p>
              <p className="text-2xl font-bold text-success">{paidInvoices}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold">CHF {openAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <FileText className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eingegangen</p>
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
            <SelectItem value="generated">Generiert</SelectItem>
            <SelectItem value="sent">Versendet</SelectItem>
            <SelectItem value="paid">Bezahlt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* QR Invoice List */}
      <div className="space-y-3">
        {qrInvoices.map((invoice, index) => (
          <div
            key={invoice.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl",
                  invoice.qrGenerated ? "bg-primary/10" : "bg-muted"
                )}>
                  {invoice.qrGenerated ? (
                    <QrCode className="h-7 w-7 text-primary" />
                  ) : (
                    <AlertTriangle className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{invoice.customer}</h3>
                    <Badge className={statusStyles[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-mono">{invoice.invoiceNumber}</span>
                    {" • "}
                    Fällig: {invoice.dueDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Referenztyp</p>
                  <Badge variant="outline">{refTypeLabels[invoice.referenceType]}</Badge>
                </div>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">IBAN</p>
                  <p className="font-mono text-sm">{invoice.iban.substring(0, 12)}...</p>
                </div>

                <div className="text-right min-w-[120px]">
                  <p className="text-sm text-muted-foreground">Betrag</p>
                  <p className="font-mono font-bold text-lg">
                    {invoice.currency} {invoice.amount.toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-1">
                  {!invoice.qrGenerated && (
                    <Button size="sm" className="gap-2">
                      <QrCode className="h-4 w-4" />
                      QR generieren
                    </Button>
                  )}
                  {invoice.qrGenerated && invoice.status === "generated" && (
                    <Button size="sm" variant="outline" className="gap-2">
                      <Send className="h-4 w-4" />
                      Versenden
                    </Button>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Vorschau
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      PDF herunterladen
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Printer className="h-4 w-4 mr-2" />
                      Drucken
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      QR-Code kopieren
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {invoice.reference && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  QR-Referenz: <span className="font-mono">{invoice.reference}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QR Code Preview Panel */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">QR-Zahlteil Vorschau</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="p-6 border border-dashed border-border rounded-lg bg-white">
            <div className="aspect-square max-w-[200px] mx-auto bg-muted rounded-lg flex items-center justify-center">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Swiss QR Code
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Konto / Zahlbar an</p>
              <p className="font-mono">CH93 0076 2011 6238 5295 7</p>
              <p>Loomora AG</p>
              <p>Industriestrasse 15</p>
              <p>8005 Zürich</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Referenz</p>
              <p className="font-mono">00 00000 00000 00000 00000 00156</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zahlbar durch</p>
              <p>Bauherr AG</p>
              <p>Bahnhofstrasse 10</p>
              <p>8001 Zürich</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
