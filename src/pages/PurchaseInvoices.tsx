import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { extractInvoiceFromPDF, type ExtractedInvoiceData } from "@/lib/pdf/pdf-extractor";
import { usePermissions } from "@/hooks/use-permissions";
import { useSuppliers } from "@/hooks/use-suppliers";
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
  Receipt,
  X,
  File,
  SendHorizonal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useApprovePurchaseInvoice, useUpdatePurchaseInvoice } from "@/hooks/use-purchase-invoices";


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
  pdfFile?: string;
}


const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  approved: "bg-info/10 text-info",
  paid: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  pending: "Zur Prüfung",
  approved: "Freigegeben",
  paid: "Bezahlt",
  cancelled: "Storniert",
};

const suppliers = [
  "Stahl AG Zürich",
  "Verzinkerei Schweiz GmbH",
  "Schrauben Express AG",
  "Werkzeug Müller",
  "TechParts International",
];

export default function PurchaseInvoices() {
  const { canWrite, canDelete } = usePermissions();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Lieferanten für Import-Dialog
  const { data: suppliersData } = useSuppliers({ pageSize: 200 });
  const suppliers = useMemo(() => (suppliersData as any)?.data || [], [suppliersData]);

  // API mutations
  const approveMutation = useApprovePurchaseInvoice();
  const updateMutation = useUpdatePurchaseInvoice();

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["purchase-invoices"],
    queryFn: () => api.get<any>("/purchase-invoices"),
  });
  const invoices: PurchaseInvoice[] = (apiData?.data || []).map((raw: any) => ({
    id: raw.id || "",
    number: raw.number || "",
    supplierNumber: raw.supplierNumber || raw.supplier?.number || "–",
    supplier: raw.supplier?.companyName || raw.supplier?.name || raw.supplierName || "–",
    invoiceDate: raw.invoiceDate ? new Date(raw.invoiceDate).toLocaleDateString("de-CH") : "–",
    dueDate: raw.dueDate ? new Date(raw.dueDate).toLocaleDateString("de-CH") : "–",
    netAmount: Number(raw.netAmount || raw.subtotal || 0),
    vatAmount: Number(raw.vatAmount || raw.tax || 0),
    grossAmount: Number(raw.grossAmount || raw.total || 0),
    currency: raw.currency || "CHF",
    status: (raw.status || "draft").toLowerCase(),
    purchaseOrder: raw.purchaseOrder?.number || raw.purchaseOrderNumber,
    costCenter: raw.costCenter?.name || raw.costCenterName,
    pdfFile: raw.pdfFile,
  }));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
  const [importData, setImportData] = useState({
    supplierId: "",        // ID aus Dropdown
    supplierNumber: "",    // Rechnungsnummer Lieferant
    grossAmount: "",       // Zahlungsbetrag (Brutto)
    vatRate: "8.1",
    invoiceDate: "",
    dueDate: "",
  });

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.supplier || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.supplierNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalInvoices = invoices.length;
  const pendingInvoices = invoices.filter((i) => i.status === "pending").length;
  const openAmount = invoices
    .filter((i) => i.status === "pending" || i.status === "approved")
    .reduce((sum, i) => sum + (i.grossAmount || 0), 0);
  const paidAmount = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.grossAmount, 0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Nur PDF-Dateien erlaubt"); return; }
    setUploadedFile(file);
    setImportDialogOpen(true);
    setIsExtracting(true);
    toast.info("PDF wird analysiert...", { duration: 2000 });
    try {
      const data = await extractInvoiceFromPDF(file);
      setExtractedData(data);

      // Lieferant per Fuzzy-Match aus Stammdaten finden
      let matchedSupplierId = "";
      if (data.supplierName && suppliers.length > 0) {
        const nameLower = data.supplierName.toLowerCase();
        const match = suppliers.find((s: any) => {
          const n = (s.companyName || s.name || "").toLowerCase();
          return n.includes(nameLower) || nameLower.includes(n);
        });
        if (match) matchedSupplierId = match.id;
      }

      setImportData({
        supplierId: matchedSupplierId,
        supplierNumber: data.externalNumber || "",
        grossAmount: data.grossAmount || "",
        vatRate: data.vatRate || "8.1",
        invoiceDate: data.invoiceDate || "",
        dueDate: data.dueDate || "",
      });
      toast.success("Daten aus PDF erkannt – bitte prüfen");
    } catch {
      toast.error("PDF konnte nicht gelesen werden. Bitte manuell ausfüllen.");
    } finally {
      setIsExtracting(false);
    }
  };

  const resetImportDialog = () => {
    setImportDialogOpen(false);
    setUploadedFile(null);
    setExtractedData(null);
    setImportData({ supplierId: "", supplierNumber: "", grossAmount: "", vatRate: "8.1", invoiceDate: "", dueDate: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportInvoice = () => {
    if (!importData.supplierId) { toast.error("Bitte Lieferant auswählen"); return; }
    if (!importData.grossAmount) { toast.error("Bitte Betrag angeben"); return; }

    // Positionen + rohe PDF-Daten via sessionStorage übergeben (URL zu lang)
    if (extractedData?.positions) {
      sessionStorage.setItem("pdf-import-positions", JSON.stringify(extractedData.positions));
    }
    if (uploadedFile) {
      // Dateiname für später speichern
      sessionStorage.setItem("pdf-import-filename", uploadedFile.name);
      // PDF als Base64 für Anhang
      const reader = new FileReader();
      reader.onload = () => {
        sessionStorage.setItem("pdf-import-base64", (reader.result as string).split(",")[1] || "");
      };
      reader.readAsDataURL(uploadedFile);
    }

    const params = new URLSearchParams({
      from: "pdf-import",
      supplierId: importData.supplierId,
      externalNumber: importData.supplierNumber,
      grossAmount: importData.grossAmount,
      vatRate: importData.vatRate,
      invoiceDate: importData.invoiceDate,
      dueDate: importData.dueDate,
    });
    resetImportDialog();
    toast.success("Daten übernommen – Rechnung wird geöffnet");
    navigate("/purchase-invoices/new?" + params.toString());
  };

  const handleSubmitForReview = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateMutation.mutate(
      { id, data: { status: "PENDING" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
          toast.success("Rechnung zur Prüfung eingereicht");
        },
        onError: () => toast.error("Fehler beim Einreichen"),
      }
    );
  };

  const handleApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    approveMutation.mutate(
      { id, data: {} },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
          toast.success("Rechnung freigegeben");
        },
        onError: () => toast.error("Fehler beim Freigeben"),
      }
    );
  };

  const handleReject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateMutation.mutate(
      { id, data: { status: "DRAFT" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
          toast.info("Rechnung abgelehnt – zurück in Entwurf");
        },
        onError: () => toast.error("Fehler beim Ablehnen"),
      }
    );
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/purchase-invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      toast.success("Eingangsrechnung erfolgreich gelöscht");
    },
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };


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
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          {canWrite('purchase-invoices') && (
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              PDF importieren
            </Button>
          )}
          {canWrite('purchase-invoices') && (
            <Button className="gap-2" onClick={() => navigate("/purchase-invoices/new")}>
              <Plus className="h-4 w-4" />
              Rechnung erfassen
            </Button>
          )}
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
              <p className="text-2xl font-bold">CHF {openAmount.toLocaleString("de-CH")}</p>
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
              <p className="text-2xl font-bold">CHF {paidAmount.toLocaleString("de-CH")}</p>
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
            <SelectItem value="cancelled">Storniert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Keine Rechnungen gefunden</p>
          </div>
        ) : (
          filteredInvoices.map((invoice, index) => (
            <div
              key={invoice.id}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate(`/purchase-invoices/${invoice.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Receipt className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{invoice.supplier}</h3>
                      <Badge className={statusStyles[invoice.status] || "bg-muted text-muted-foreground"}>
                        {statusLabels[invoice.status] || invoice.status}
                      </Badge>
                      {invoice.pdfFile && (
                        <Badge variant="outline" className="gap-1">
                          <File className="h-3 w-3" />
                          PDF
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-mono">{invoice.number}</span>
                      {" • Lieferanten-Nr.: "}
                      <span className="font-mono">{invoice.supplierNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm text-muted-foreground">Rechnungsdatum</p>
                    <p className="font-mono text-sm">{invoice.invoiceDate}</p>
                  </div>

                  <div className="text-right hidden md:block">
                    <p className="text-sm text-muted-foreground">Fällig</p>
                    <p className="font-mono text-sm">{invoice.dueDate}</p>
                  </div>

                  <div className="text-right hidden xl:block">
                    <p className="text-sm text-muted-foreground">Netto</p>
                    <p className="font-mono">{invoice.currency} {invoice.netAmount.toLocaleString("de-CH")}</p>
                  </div>

                  <div className="text-right min-w-[120px]">
                    <p className="text-sm text-muted-foreground">Brutto</p>
                    <p className="font-mono font-bold">
                      {invoice.currency} {invoice.grossAmount.toLocaleString("de-CH")}
                    </p>
                  </div>

                  {invoice.status === "draft" && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={(e) => handleSubmitForReview(invoice.id, e)}>
                        <SendHorizonal className="h-3 w-3 mr-1" />
                        Einreichen
                      </Button>
                    </div>
                  )}
                  {invoice.status === "pending" && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="outline" onClick={(e) => handleReject(invoice.id, e)}>
                        Ablehnen
                      </Button>
                      <Button size="sm" onClick={(e) => handleApprove(invoice.id, e)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Freigeben
                      </Button>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/purchase-invoices/${invoice.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ansehen
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/purchase-invoices/${invoice.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                      {invoice.status === "draft" && (
                        <DropdownMenuItem onClick={(e) => handleSubmitForReview(invoice.id, e)}>
                          <SendHorizonal className="h-4 w-4 mr-2" />
                          Zur Prüfung einreichen
                        </DropdownMenuItem>
                      )}
                      {canDelete('purchase-invoices') && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => handleDelete(e, invoice.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      )}
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
          ))
        )}
      </div>

      {/* PDF Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => { if (!open) resetImportDialog(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>PDF-Rechnung importieren</DialogTitle>
          </DialogHeader>

          {isExtracting ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Rechnung wird analysiert...</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Datei-Info */}
              {uploadedFile && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                  <File className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(0)} KB
                      {extractedData && <span className="ml-2 text-success">· Daten erkannt</span>}
                    </p>
                  </div>
                </div>
              )}

              {/* Lieferant */}
              <div className="space-y-2">
                <Label>Lieferant *</Label>
                <Select value={importData.supplierId} onValueChange={(v) => setImportData({ ...importData, supplierId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lieferant auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.length === 0
                      ? <SelectItem value="_none" disabled>Keine Lieferanten vorhanden</SelectItem>
                      : suppliers.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.companyName || s.name}</SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
                {extractedData?.supplierName && (
                  <p className="text-xs text-muted-foreground">
                    Im PDF erkannt: <span className="font-medium">{extractedData.supplierName}</span> – bitte oben zuordnen
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rechnungsnr. (Lieferant)</Label>
                  <Input value={importData.supplierNumber} placeholder="z.B. 358630"
                    onChange={(e) => setImportData({ ...importData, supplierNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Zahlungsbetrag (CHF) *</Label>
                  <Input type="number" step="0.01" value={importData.grossAmount} placeholder="0.00"
                    onChange={(e) => setImportData({ ...importData, grossAmount: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rechnungsdatum</Label>
                  <Input type="date" value={importData.invoiceDate}
                    onChange={(e) => setImportData({ ...importData, invoiceDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Fällig am</Label>
                  <Input type="date" value={importData.dueDate}
                    onChange={(e) => setImportData({ ...importData, dueDate: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={resetImportDialog}>Abbrechen</Button>
            <Button onClick={handleImportInvoice} className="gap-2" disabled={isExtracting}>
              <Upload className="h-4 w-4" />
              Weiterbearbeiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
