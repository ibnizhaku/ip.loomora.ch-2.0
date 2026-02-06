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
} from "lucide-react";
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

const initialQuoteData = {
  id: "ANG-2024-0042",
  status: "Gesendet",
  customer: {
    name: "TechStart GmbH",
    contact: "Maria Weber",
    email: "m.weber@techstart.de",
    phone: "+49 30 12345678",
    address: "Innovationsstraße 15, 10115 Berlin"
  },
  project: "E-Commerce Plattform",
  createdAt: "15.01.2024",
  validUntil: "15.02.2024",
  positions: [
    { id: 1, description: "Frontend-Entwicklung", quantity: 80, unit: "Stunden", price: 120, total: 9600 },
    { id: 2, description: "Backend-Entwicklung", quantity: 60, unit: "Stunden", price: 130, total: 7800 },
    { id: 3, description: "UI/UX Design", quantity: 40, unit: "Stunden", price: 110, total: 4400 },
    { id: 4, description: "Projektmanagement", quantity: 20, unit: "Stunden", price: 100, total: 2000 },
    { id: 5, description: "Testing & QA", quantity: 30, unit: "Stunden", price: 95, total: 2850 },
  ],
  subtotal: 26650,
  tax: 2158.65,
  total: 28808.65,
  notes: "Zahlungsziel: 14 Tage nach Rechnungsstellung. Bei Auftragserteilung innerhalb der Gültigkeitsfrist gewähren wir 3% Skonto.",
  history: [
    { date: "15.01.2024 14:30", action: "Angebot erstellt", user: "Max Keller" },
    { date: "15.01.2024 15:45", action: "Angebot per E-Mail versendet", user: "Max Keller" },
    { date: "18.01.2024 10:20", action: "Kunde hat Angebot geöffnet", user: "System" },
  ]
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileText },
  "Gesendet": { color: "bg-info/10 text-info", icon: Send },
  "Angenommen": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Abgelehnt": { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [quoteData, setQuoteData] = useState(initialQuoteData);
  const [historyEntries, setHistoryEntries] = useState(initialQuoteData.history);
  
  // Dialog states
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertStep, setConvertStep] = useState(1);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Conversion form
  const [orderDeliveryDate, setOrderDeliveryDate] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [createDeliveryNote, setCreateDeliveryNote] = useState(false);
  const [createInvoice, setCreateInvoice] = useState(false);
  const [newStatus, setNewStatus] = useState(quoteData.status);
  
  const status = statusConfig[quoteData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;

  // Prepare PDF data
  const pdfData: SalesDocumentData = {
    type: 'quote',
    number: quoteData.id,
    date: quoteData.createdAt,
    validUntil: quoteData.validUntil,
    projectNumber: quoteData.project,
    company: {
      name: "Loomora Metallbau AG",
      street: "Industriestrasse 15",
      postalCode: "8005",
      city: "Zürich",
      phone: "+41 44 123 45 67",
      email: "info@loomora.ch",
      vatNumber: "CHE-123.456.789",
    },
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
    downloadSalesDocumentPDF(pdfData);
    toast.success("PDF heruntergeladen");
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

  // Konvertierung durchführen
  const handleConvert = () => {
    // Generate new order number
    const orderNumber = `AUF-2024-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
    
    // Update quote status
    setQuoteData(prev => ({ ...prev, status: "Angenommen" }));
    addHistoryEntry(`In Auftrag ${orderNumber} umgewandelt`);
    
    toast.success(`Auftrag ${orderNumber} wurde erstellt`);
    
    if (createDeliveryNote) {
      const lsNumber = `LS-2024-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
      addHistoryEntry(`Lieferschein ${lsNumber} erstellt`);
      toast.success(`Lieferschein ${lsNumber} wurde erstellt`);
    }
    
    if (createInvoice) {
      const invoiceNumber = `RE-2024-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
      addHistoryEntry(`Rechnung ${invoiceNumber} erstellt`);
      toast.success(`Rechnung ${invoiceNumber} wurde erstellt`);
    }
    
    setConvertDialogOpen(false);
    
    // Optional: Navigate to order
    // navigate(`/orders/${orderNumber}`);
  };

  // Status ändern
  const handleStatusChange = () => {
    setQuoteData(prev => ({ ...prev, status: newStatus }));
    addHistoryEntry(`Status geändert zu "${newStatus}"`);
    toast.success("Status aktualisiert");
    setStatusChangeOpen(false);
  };

  // Duplizieren
  const handleDuplicate = () => {
    addHistoryEntry("Angebot dupliziert");
    toast.success("Angebot wurde dupliziert");
  };

  // Löschen
  const handleDelete = () => {
    toast.success("Angebot gelöscht");
    navigate("/quotes");
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
              <DropdownMenuItem onClick={() => toast.info("E-Mail wird vorbereitet...")}>
                <Mail className="h-4 w-4 mr-2" />
                Per E-Mail senden
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
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Position hinzufügen
              </Button>
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
                  <Link to="/customers/1" className="font-medium hover:text-primary">
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
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("E-Mail wird vorbereitet...")}>
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
            {/* Step 1: Order Details */}
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
                  <Input
                    type="date"
                    value={orderDeliveryDate}
                    onChange={(e) => setOrderDeliveryDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Auftragsnotizen</Label>
                  <Textarea
                    placeholder="Besondere Anforderungen oder Hinweise..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Step 2: Additional Documents */}
            {convertStep === 2 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Wählen Sie aus, welche zusätzlichen Belege automatisch erstellt werden sollen:
                </p>
                
                <div className="space-y-3">
                  <div 
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      createDeliveryNote ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setCreateDeliveryNote(!createDeliveryNote)}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      createDeliveryNote ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Lieferschein erstellen</p>
                      <p className="text-sm text-muted-foreground">
                        Lieferschein direkt aus dem Auftrag generieren
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={createDeliveryNote}
                      onChange={() => {}}
                      className="h-5 w-5 rounded"
                    />
                  </div>
                  
                  <div 
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      createInvoice ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setCreateInvoice(!createInvoice)}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      createInvoice ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Rechnung erstellen</p>
                      <p className="text-sm text-muted-foreground">
                        Rechnung direkt aus dem Auftrag generieren
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={createInvoice}
                      onChange={() => {}}
                      className="h-5 w-5 rounded"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Summary */}
            {convertStep === 3 && (
              <>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border bg-success/5 border-success/20">
                    <div className="flex items-center gap-2 text-success mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">Auftrag wird erstellt</span>
                    </div>
                    <p className="text-sm">
                      Basierend auf Angebot {quoteData.id} mit {quoteData.positions.length} Positionen
                    </p>
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
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
              Abbrechen
            </Button>
            {convertStep > 1 && (
              <Button variant="outline" onClick={() => setConvertStep(convertStep - 1)}>
                Zurück
              </Button>
            )}
            {convertStep < 3 ? (
              <Button onClick={() => setConvertStep(convertStep + 1)}>
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleConvert}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
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
            <DialogDescription>
              Neuen Status für das Angebot festlegen
            </DialogDescription>
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
            <Button variant="outline" onClick={() => setStatusChangeOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleStatusChange}>
              Status ändern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Löschen AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Angebot löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Angebot "{quoteData.id}" wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        documentData={pdfData}
        title={`Angebot ${quoteData.id}`}
      />
    </div>
  );
};

export default QuoteDetail;
