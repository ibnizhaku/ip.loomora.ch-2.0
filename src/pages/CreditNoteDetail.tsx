import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { downloadPdf } from "@/lib/api";
import { SendEmailModal } from "@/components/email/SendEmailModal";
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Euro, 
  Building2,
  Mail,
  Phone,
  Clock,
  Printer,
  MoreHorizontal,
  Download,
  Undo2,
  Loader2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { toast } from "sonner";
import { useCreditNote } from "@/hooks/use-credit-notes";
import { useCompany } from "@/hooks/use-company";
import { PDFPreviewDialog } from "@/components/documents/PDFPreviewDialog";
import { SalesDocumentData, downloadSalesDocumentPDF } from "@/lib/pdf/sales-document";

const statusMap: Record<string, string> = {
  DRAFT: "Entwurf",
  ISSUED: "Gebucht",
  APPLIED: "Verrechnet",
  CANCELLED: "Storniert",
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

const CreditNoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, isLoading, error } = useCreditNote(id || "");
  const { data: companyData } = useCompany();
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !raw) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Gutschrift nicht gefunden</p>
        <Link to="/credit-notes" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const cn = raw as any;
  const creditNoteData = {
    id: cn.number || cn.id,
    status: statusMap[cn.status] || cn.status || "Entwurf",
    originalInvoice: cn.invoice?.number || cn.invoiceId || "—",
    originalInvoiceId: cn.invoice?.id || cn.invoiceId || "",
    customer: {
      id: cn.customer?.id || cn.customerId,
      name: cn.customer?.name || "Unbekannt",
      contact: cn.customer?.contactPerson || "",
      email: cn.customer?.email || "",
      phone: cn.customer?.phone || "",
    },
    createdAt: formatDate(cn.issueDate || cn.createdAt),
    reason: cn.reason || "—",
    positions: (cn.items || []).map((item: any, idx: number) => ({
      id: idx + 1,
      description: item.description || "",
      quantity: Number(item.quantity) || 0,
      unit: item.unit || "Stück",
      price: Number(item.unitPrice) || 0,
      total: Number(item.quantity || 0) * Number(item.unitPrice || 0),
    })),
    subtotal: Number(cn.subtotal) || 0,
    tax: Number(cn.vatAmount) || 0,
    total: Number(cn.total) || 0,
  };

  // PDF data for preview
  const pdfData: SalesDocumentData = {
    type: 'invoice',
    number: creditNoteData.id,
    date: creditNoteData.createdAt,
    company: {
      name: companyData?.name || "—",
      street: companyData?.street || "",
      postalCode: companyData?.zipCode || "",
      city: companyData?.city || "",
      phone: companyData?.phone || "",
      email: companyData?.email || "",
      vatNumber: companyData?.vatNumber || "",
    },
    customer: {
      name: creditNoteData.customer.name,
      contact: creditNoteData.customer.contact,
      street: "",
      postalCode: "",
      city: "",
    },
    positions: creditNoteData.positions.map((pos: any, idx: number) => ({
      position: idx + 1,
      description: pos.description,
      quantity: pos.quantity,
      unit: pos.unit,
      unitPrice: pos.price,
      total: pos.total,
    })),
    subtotal: creditNoteData.subtotal,
    vatRate: 8.1,
    vatAmount: creditNoteData.tax,
    total: creditNoteData.total,
    notes: `Gutschrift zu ${creditNoteData.originalInvoice}`,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/credit-notes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{creditNoteData.id}</h1>
              <Badge className="bg-success/10 text-success">
                {creditNoteData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Gutschrift zu {creditNoteData.originalInvoice}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPDFPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          <Button variant="outline" size="sm" onClick={() => { downloadSalesDocumentPDF(pdfData, `Gutschrift-${creditNoteData.id}.pdf`); toast.success("PDF wird heruntergeladen"); }}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Drucken
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEmailModalOpen(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Per E-Mail senden
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/credit-notes/${id}/edit`)}>Bearbeiten</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Gutschrift wird dupliziert...")}>Duplizieren</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => toast.info("Gutschrift wird storniert...")}>Stornieren</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reason */}
          {creditNoteData.reason !== "—" && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="flex items-center gap-4 py-4">
                <Undo2 className="h-6 w-6 text-warning" />
                <div>
                  <p className="font-semibold">Gutschriftsgrund</p>
                  <p className="text-sm text-muted-foreground">{creditNoteData.reason}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Gutschriftspositionen</CardTitle>
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
                  {creditNoteData.positions.map((pos: any) => (
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
                  <span>CHF {creditNoteData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MwSt. (8.1%)</span>
                  <span>CHF {creditNoteData.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Gutschriftsbetrag</span>
                  <span className="text-success">-CHF {creditNoteData.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
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
                  <Link to={`/customers/${creditNoteData.customer.id}`} className="font-medium hover:text-primary">
                    {creditNoteData.customer.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{creditNoteData.customer.contact}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                {creditNoteData.customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{creditNoteData.customer.email}</span>
                  </div>
                )}
                {creditNoteData.customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{creditNoteData.customer.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bezug auf Rechnung</span>
                <Link to={`/invoices/${creditNoteData.originalInvoiceId}`} className="font-medium hover:text-primary">
                  {creditNoteData.originalInvoice}
                </Link>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Erstellt am</span>
                <span className="font-medium">{creditNoteData.createdAt}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gutschriftsbetrag</span>
                <span className="font-semibold text-success">-CHF {creditNoteData.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF Preview */}
      <PDFPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        documentData={pdfData}
        title={`Gutschrift ${creditNoteData.id}`}
      />

      <SendEmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        documentType="credit-note"
        documentId={id || ''}
        documentNumber={creditNoteData.id}
        defaultRecipient={creditNoteData.customer.email}
        documentData={pdfData}
      />
    </div>
  );
};

export default CreditNoteDetail;
