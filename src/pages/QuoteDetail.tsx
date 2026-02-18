import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  FileText, 
  Building2, 
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  Printer,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit,
  Download,
  Eye,
  ShoppingCart,
  ArrowRight,
  Package,
  Receipt,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useQuote, useConvertQuoteToOrder, useSendQuote, useDeleteQuote, useUpdateQuote } from "@/hooks/use-sales";
import { useCompany } from "@/hooks/use-company";
import { sendEmail, downloadPdf } from "@/lib/api";
import { SendEmailModal } from "@/components/email/SendEmailModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PDFPreviewDialog } from "@/components/documents/PDFPreviewDialog";
import { SalesDocumentData, downloadSalesDocumentPDF } from "@/lib/pdf/sales-document";

// Status mapping from backend enum to German display labels
const quoteStatusMap: Record<string, string> = {
  DRAFT: "Entwurf",
  SENT: "Gesendet",
  CONFIRMED: "Angenommen",
  CANCELLED: "Abgelehnt",
};

const reverseStatusMap: Record<string, string> = {
  "Entwurf": "DRAFT",
  "Gesendet": "SENT",
  "Angenommen": "CONFIRMED",
  "Abgelehnt": "CANCELLED",
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return dateStr; }
}

function mapQuoteToView(quote: any) {
  const items = quote.items || [];
  return {
    id: quote.number || quote.id,
    rawId: quote.id,
    status: quoteStatusMap[quote.status] || quote.status || "Entwurf",
    customer: {
      id: quote.customer?.id,
      name: quote.customer?.name || "Unbekannt",
      contact: quote.customer?.contactPerson || quote.customer?.companyName || "",
      email: quote.customer?.email || "",
      phone: quote.customer?.phone || "",
      address: [quote.customer?.street, [quote.customer?.zipCode, quote.customer?.city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    },
    project: quote.project?.name || "",
    createdAt: formatDate(quote.issueDate || quote.createdAt),
    validUntil: formatDate(quote.validUntil),
    positions: items.map((item: any, idx: number) => ({
      id: item.id || idx + 1,
      description: item.description || "",
      quantity: Number(item.quantity) || 0,
      unit: item.unit || "Stück",
      price: Number(item.unitPrice) || 0,
      total: Number(item.total) || 0,
    })),
    subtotal: Number(quote.subtotal) || 0,
    tax: Number(quote.vatAmount) || 0,
    total: Number(quote.total) || 0,
    notes: quote.notes || "",
    history: [] as { date: string; action: string; user: string }[],
  };
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileText },
  "Gesendet": { color: "bg-info/10 text-info", icon: Send },
  "Angenommen": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Abgelehnt": { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rawQuote, isLoading, error } = useQuote(id || "");
  const { data: companyData } = useCompany();
  const convertToOrder = useConvertQuoteToOrder();
  const sendQuote = useSendQuote();
  const deleteQuote = useDeleteQuote();
  const updateQuote = useUpdateQuote();
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<{ date: string; action: string; user: string }[]>([]);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertStep, setConvertStep] = useState(1);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [orderDeliveryDate, setOrderDeliveryDate] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [createDeliveryNote, setCreateDeliveryNote] = useState(false);
  const [createInvoice, setCreateInvoice] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !rawQuote) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Angebot nicht gefunden</p>
        <Link to="/quotes" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const quoteData = mapQuoteToView(rawQuote);
  
  const status = statusConfig[quoteData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;

  // Company data for PDF
  const companyInfo = {
    name: companyData?.name || "—",
    street: companyData?.street || "",
    postalCode: companyData?.zipCode || "",
    city: companyData?.city || "",
    phone: companyData?.phone || "",
    email: companyData?.email || "",
    vatNumber: companyData?.vatNumber || "",
  };

  // Prepare PDF data
  const pdfData: SalesDocumentData = {
    type: 'quote',
    number: quoteData.id,
    date: quoteData.createdAt,
    validUntil: quoteData.validUntil,
    projectNumber: quoteData.project,
    company: companyInfo,
    customer: {
      name: quoteData.customer.name,
      contact: quoteData.customer.contact,
      street: quoteData.customer.address.split(',')[0],
      postalCode: quoteData.customer.address.split(',')[1]?.trim().split(' ')[0] || '',
      city: quoteData.customer.address.split(',')[1]?.trim().split(' ').slice(1).join(' ') || '',
      email: quoteData.customer.email,
      phone: quoteData.customer.phone,
    },
    positions: quoteData.positions.map((pos, idx) => ({
      position: idx + 1,
      description: pos.description,
      quantity: pos.quantity,
      unit: pos.unit,
      unitPrice: pos.price,
      total: pos.total,
    })),
    subtotal: quoteData.subtotal,
    vatRate: 8.1,
    vatAmount: quoteData.tax,
    total: quoteData.total,
    notes: quoteData.notes,
  };

  const addHistoryEntry = (action: string) => {
    const newEntry = {
      date: new Date().toLocaleString("de-CH"),
      action,
      user: "Aktueller Benutzer",
    };
    setHistoryEntries([newEntry, ...historyEntries]);
  };

  const handleDownloadPDF = () => {
    downloadPdf('quotes', id || '', `Angebot-${quoteData.id}.pdf`);
    toast.success("PDF wird heruntergeladen");
  };

  const handleSendEmail = () => {
    setEmailModalOpen(true);
  };

  // Konvertierung starten
  const handleStartConversion = () => {
    setConvertStep(1);
    setOrderDeliveryDate("");
    setOrderNotes("");
    setCreateDeliveryNote(false);
    setCreateInvoice(false);
    setConvertDialogOpen(true);
  };

  // Konvertierung durchführen via API
  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const result = await convertToOrder.mutateAsync(id || "");
      addHistoryEntry("In Auftrag umgewandelt");
      toast.success("Auftrag wurde erstellt");
      setConvertDialogOpen(false);
      // Navigate to new order
      if (result?.id) {
        navigate(`/orders/${result.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Fehler bei der Konvertierung");
    } finally {
      setIsConverting(false);
    }
  };

  // Status ändern via API
  const handleStatusChange = async () => {
    const backendStatus = reverseStatusMap[newStatus];
    if (!backendStatus) return;
    try {
      await updateQuote.mutateAsync({ id: id || "", data: { status: backendStatus } as any });
      addHistoryEntry(`Status geändert zu "${newStatus}"`);
      toast.success("Status aktualisiert");
      setStatusChangeOpen(false);
    } catch {
      toast.error("Fehler beim Ändern des Status");
    }
  };

  // Versenden via API
  const handleSendQuote = async () => {
    try {
      await sendQuote.mutateAsync(id || "");
      addHistoryEntry("Angebot versendet");
      toast.success("Angebot wurde als versendet markiert");
    } catch {
      toast.error("Fehler beim Versenden");
    }
  };

  // Duplizieren
  const handleDuplicate = () => {
    navigate(`/quotes/new?customerId=${quoteData.customer.id || ''}`);
    toast.info("Angebot wird dupliziert – bitte Daten anpassen");
  };

  // Löschen via API
  const handleDelete = async () => {
    try {
      await deleteQuote.mutateAsync(id || "");
      toast.success("Angebot gelöscht");
      navigate("/quotes");
    } catch {
      toast.error("Fehler beim Löschen");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{quoteData.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {quoteData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{quoteData.project}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPDFPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button 
            size="sm" 
            onClick={handleStartConversion}
            disabled={quoteData.status === "Angenommen" || quoteData.status === "Abgelehnt"}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            In Auftrag umwandeln
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover">
              <DropdownMenuItem onClick={handleStartConversion} disabled={quoteData.status === "Angenommen"}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                In Auftrag umwandeln
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusChangeOpen(true)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Status ändern
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Per E-Mail senden
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendQuote}>
                <Send className="h-4 w-4 mr-2" />
                Als versendet markieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplizieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Drucken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/quotes/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Positions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Positionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Beschreibung</TableHead>
                    <TableHead className="text-right">Menge</TableHead>
                    <TableHead>Einheit</TableHead>
                    <TableHead className="text-right">Einzelpreis</TableHead>
                    <TableHead className="text-right">Gesamt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteData.positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.description}</TableCell>
                      <TableCell className="text-right">{pos.quantity}</TableCell>
                      <TableCell>{pos.unit}</TableCell>
                      <TableCell className="text-right">CHF {pos.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">CHF {pos.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Zwischensumme (netto)</span>
                  <span>CHF {quoteData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MwSt. (8.1%)</span>
                  <span>CHF {quoteData.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gesamtbetrag (brutto)</span>
                  <span className="text-primary">CHF {quoteData.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Bemerkungen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{quoteData.notes}</p>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historyEntries.map((entry, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{entry.action}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{entry.date}</span>
                        <span>•</span>
                        <span>{entry.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kunde</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link to={`/customers/${quoteData.customer.id || ''}`} className="font-medium hover:text-primary">
                    {quoteData.customer.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{quoteData.customer.contact}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{quoteData.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{quoteData.customer.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quote Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Erstellt am</span>
                <span className="text-sm font-medium">{quoteData.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gültig bis</span>
                <span className="text-sm font-medium">{quoteData.validUntil}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Positionen</span>
                <span className="text-sm font-medium">{quoteData.positions.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nettobetrag</span>
                <span className="text-sm font-semibold">CHF {quoteData.subtotal.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {quoteData.status !== "Angenommen" && quoteData.status !== "Abgelehnt" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" onClick={handleStartConversion}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  In Auftrag umwandeln
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleSendEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Nachfassen per E-Mail
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Konvertierungs-Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Angebot in Auftrag umwandeln
            </DialogTitle>
            <DialogDescription>
              {convertStep === 1 && "Schritt 1: Auftragsdaten festlegen"}
              {convertStep === 2 && "Schritt 2: Zusätzliche Belege erstellen"}
              {convertStep === 3 && "Schritt 3: Zusammenfassung"}
            </DialogDescription>
          </DialogHeader>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === convertStep
                    ? "bg-primary text-primary-foreground"
                    : step < convertStep
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step < convertStep ? <CheckCircle2 className="h-4 w-4" /> : step}
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            {convertStep === 1 && (
              <>
                <div className="p-3 rounded-lg border bg-muted/50">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{quoteData.project}</p>
                      <p className="text-sm text-muted-foreground">{quoteData.customer.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">CHF {quoteData.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{quoteData.positions.length} Positionen</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Gewünschtes Lieferdatum</Label>
                  <Input type="date" value={orderDeliveryDate} onChange={(e) => setOrderDeliveryDate(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <Label>Auftragsnotizen</Label>
                  <Textarea placeholder="Besondere Anforderungen oder Hinweise..." value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} rows={3} />
                </div>
              </>
            )}

            {convertStep === 2 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Wählen Sie aus, welche zusätzlichen Belege automatisch erstellt werden sollen:
                </p>
                <div className="space-y-3">
                  <div 
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${createDeliveryNote ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    onClick={() => setCreateDeliveryNote(!createDeliveryNote)}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${createDeliveryNote ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Lieferschein erstellen</p>
                      <p className="text-sm text-muted-foreground">Lieferschein direkt aus dem Auftrag generieren</p>
                    </div>
                    <input type="checkbox" checked={createDeliveryNote} onChange={() => {}} className="h-5 w-5 rounded" />
                  </div>
                  
                  <div 
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${createInvoice ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    onClick={() => setCreateInvoice(!createInvoice)}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${createInvoice ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Rechnung erstellen</p>
                      <p className="text-sm text-muted-foreground">Rechnung direkt aus dem Auftrag generieren</p>
                    </div>
                    <input type="checkbox" checked={createInvoice} onChange={() => {}} className="h-5 w-5 rounded" />
                  </div>
                </div>
              </>
            )}

            {convertStep === 3 && (
              <>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border bg-success/5 border-success/20">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">Auftrag wird erstellt</span>
                    </div>
                    <p className="text-sm">Basierend auf Angebot {quoteData.id} mit {quoteData.positions.length} Positionen</p>
                  </div>
                  
                  {createDeliveryNote && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <span>Lieferschein wird erstellt</span>
                    </div>
                  )}
                  
                  {createInvoice && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                      <span>Rechnung wird erstellt</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Auftragswert</span>
                    <span className="text-xl font-bold">CHF {quoteData.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>Abbrechen</Button>
            {convertStep > 1 && (
              <Button variant="outline" onClick={() => setConvertStep(convertStep - 1)}>Zurück</Button>
            )}
            {convertStep < 3 ? (
              <Button onClick={() => setConvertStep(convertStep + 1)}>
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleConvert} disabled={isConverting}>
                {isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Auftrag erstellen
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status ändern Dialog */}
      <Dialog open={statusChangeOpen} onOpenChange={setStatusChangeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Status ändern</DialogTitle>
            <DialogDescription>Neuen Status für das Angebot festlegen</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Neuer Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="Entwurf">Entwurf</SelectItem>
                <SelectItem value="Gesendet">Gesendet</SelectItem>
                <SelectItem value="Angenommen">Angenommen</SelectItem>
                <SelectItem value="Abgelehnt">Abgelehnt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChangeOpen(false)}>Abbrechen</Button>
            <Button onClick={handleStatusChange}>Status ändern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Löschen AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Angebot löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Angebot "{quoteData.id}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog open={showPDFPreview} onOpenChange={setShowPDFPreview} documentData={pdfData} title={`Angebot ${quoteData.id}`} />

      <SendEmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        documentType="quote"
        documentId={id || ''}
        documentNumber={quoteData.id}
        defaultRecipient={quoteData.customer.email}
      />
    </div>
  );
};

export default QuoteDetail;
