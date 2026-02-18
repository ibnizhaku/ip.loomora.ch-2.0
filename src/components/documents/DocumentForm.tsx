import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Building2,
  Package,
  Calendar,
  Save,
  Send,
  Eye,
  QrCode,
  CreditCard,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useProjects } from "@/hooks/use-projects";
import { useCompany } from "@/hooks/use-company";
import { useOrder, useQuote } from "@/hooks/use-sales";
import { toast } from "sonner";
import { PDFPreviewDialog } from "@/components/documents/PDFPreviewDialog";
import { SalesDocumentData } from "@/lib/pdf/sales-document";

interface Position {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  vatRate: number;
}

interface DocumentFormProps {
  type: "quote" | "invoice" | "order" | "delivery-note" | "credit-note" | "purchase-order";
  editMode?: boolean;
  initialData?: any;
  onSave?: (data: any) => Promise<any>;
  defaultCustomerId?: string;
}

// Customer type from API (matches src/types/api.ts)
interface CustomerData {
  id: string;
  name: string;
  companyName?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  email?: string;
  phone?: string;
  vatNumber?: string;
}

// Product type from API
interface ProductData {
  id: string;
  name: string;
  unit?: string;
  salePrice?: number;
  isService?: boolean;
}

// Swiss VAT rates (MWST-Sätze)
const vatRates = [
  { value: "8.1", label: "8.1% (Normalsatz)", rate: 8.1 },
  { value: "2.6", label: "2.6% (Reduzierter Satz)", rate: 2.6 },
  { value: "3.8", label: "3.8% (Beherbergung)", rate: 3.8 },
  { value: "0", label: "0% (Steuerbefreit)", rate: 0 },
];

export function DocumentForm({ type, editMode = false, initialData, onSave, defaultCustomerId }: DocumentFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [validDays, setValidDays] = useState("30");
  const [paymentDays, setPaymentDays] = useState("30");
  const [defaultVatRate, setDefaultVatRate] = useState("8.1");
  const [useQrInvoice, setUseQrInvoice] = useState(true);
  const [qrReference, setQrReference] = useState("");
  const [esrParticipant, setEsrParticipant] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [documentDate, setDocumentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // Read query params for context-sensitive creation
  const urlCustomerId = defaultCustomerId || searchParams.get("customerId") || undefined;
  const urlOrderId = searchParams.get("orderId") || undefined;
  const urlQuoteId = searchParams.get("quoteId") || undefined;
  const urlInvoiceId = searchParams.get("invoiceId") || undefined;

  // Fetch customers, products, projects and company from API
  const { data: customersData, isLoading: customersLoading } = useCustomers({ search: customerSearch, pageSize: 50 });
  const { data: productsData, isLoading: productsLoading } = useProducts({ search: productSearch, pageSize: 50 });
  const { data: projectsData } = useProjects({ pageSize: 100 });
  const { data: companyData } = useCompany();

  // Fetch source document for pre-filling (order or quote)
  const { data: sourceOrder } = useOrder(urlOrderId || "");
  const { data: sourceQuote } = useQuote(urlQuoteId || "");

  const customers = useMemo(() => customersData?.data || [], [customersData]);
  const products = useMemo(() => productsData?.data || [], [productsData]);
  const projects = useMemo(() => projectsData?.data || [], [projectsData]);

  // Company bank details (dynamic from API)
  const companyBankAccount = useMemo(() => ({
    name: companyData?.name || "—",
    iban: companyData?.iban || "—",
    qrIban: companyData?.qrIban || "—",
    bic: companyData?.bic || "—",
    bank: companyData?.bankName || "—",
    address: [companyData?.street, [companyData?.zipCode, companyData?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "—",
    uid: companyData?.vatNumber || "—",
  }), [companyData]);

  // Pre-select customer from URL param
  const defaultCustomerApplied = useState(false);
  if (urlCustomerId && !defaultCustomerApplied[0] && customers.length > 0 && !selectedCustomer) {
    const found = customers.find((c: any) => c.id === urlCustomerId);
    if (found) {
      setSelectedCustomer(found as any);
      defaultCustomerApplied[1](true);
    }
  }

  // Pre-fill from initialData in edit mode
  const [editApplied, setEditApplied] = useState(false);
  useEffect(() => {
    if (!editMode || editApplied || !initialData) return;
    const raw = initialData as any;

    // Pre-fill customer
    if (!selectedCustomer && raw.customer) {
      setSelectedCustomer({
        id: raw.customer.id,
        name: raw.customer.companyName || raw.customer.name || "",
        companyName: raw.customer.companyName,
        street: raw.customer.street,
        zipCode: raw.customer.zipCode,
        city: raw.customer.city,
        email: raw.customer.email,
        phone: raw.customer.phone,
        vatNumber: raw.customer.vatNumber,
      });
    }

    // Pre-fill positions
    const items = raw.items || raw.positions || [];
    if (items.length > 0 && positions.length === 0) {
      const mapped: Position[] = items.map((item: any, idx: number) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice || item.price || item.salePrice) || 0;
        return {
          id: Date.now() + idx,
          description: item.description || item.name || "",
          quantity: qty,
          unit: item.unit || "Stück",
          price,
          total: qty * price,
          vatRate: Number(item.vatRate) || 8.1,
        };
      });
      setPositions(mapped);
    }

    // Pre-fill notes & settings
    if (raw.notes) setNotes(raw.notes);
    if (raw.validDays) setValidDays(String(raw.validDays));
    if (raw.paymentTermDays) setPaymentDays(String(raw.paymentTermDays));
    if (raw.projectId) setSelectedProjectId(raw.projectId);
    // Pre-fill document date
    const rawDate = raw.issueDate || raw.date || raw.orderDate || raw.deliveryDate;
    if (rawDate) setDocumentDate(rawDate.split("T")[0]);

    setEditApplied(true);
  }, [editMode, editApplied, initialData, selectedCustomer, positions.length]);

  // Pre-fill from source order or quote (new document creation)
  const [sourceApplied, setSourceApplied] = useState(false);
  useEffect(() => {
    if (sourceApplied || editMode) return;
    const source = sourceOrder || sourceQuote;
    if (!source) return;
    
    const raw = source as any;
    const items = raw.items || raw.positions || [];
    if (items.length > 0 && positions.length === 0) {
      const mapped: Position[] = items.map((item: any, idx: number) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice || item.price || item.salePrice) || 0;
        return {
          id: Date.now() + idx,
          description: item.description || item.name || "",
          quantity: qty,
          unit: item.unit || "Stück",
          price,
          total: qty * price,
          vatRate: Number(item.vatRate) || 8.1,
        };
      });
      setPositions(mapped);
    }

    // Pre-fill customer from source if not already set
    if (!selectedCustomer && raw.customer) {
      setSelectedCustomer({
        id: raw.customer.id,
        name: raw.customer.companyName || raw.customer.name || "",
        companyName: raw.customer.companyName,
        street: raw.customer.street,
        zipCode: raw.customer.zipCode,
        city: raw.customer.city,
        email: raw.customer.email,
        phone: raw.customer.phone,
        vatNumber: raw.customer.vatNumber,
      });
    }

    // Pre-fill notes
    if (raw.notes && !notes) {
      setNotes(raw.notes);
    }

    setSourceApplied(true);
  }, [sourceOrder, sourceQuote, sourceApplied, editMode, positions.length, selectedCustomer, notes]);

  const isQuote = type === "quote";
  const isInvoice = type === "invoice";
  const editTitleConfig: Record<string, string> = {
    quote: "Angebot bearbeiten",
    invoice: "Rechnung bearbeiten",
    order: "Auftrag bearbeiten",
    "delivery-note": "Lieferschein bearbeiten",
    "credit-note": "Gutschrift bearbeiten",
    "purchase-order": "Bestellung bearbeiten",
  };
  const typeConfig: Record<string, { title: string; backPath: string; sendLabel: string }> = {
    quote: { title: editMode ? editTitleConfig.quote : "Neues Angebot", backPath: "/quotes", sendLabel: "Angebot senden" },
    invoice: { title: editMode ? editTitleConfig.invoice : "Neue Rechnung", backPath: "/invoices", sendLabel: "Rechnung senden" },
    order: { title: editMode ? editTitleConfig.order : "Neuer Auftrag", backPath: "/orders", sendLabel: "Auftrag erstellen" },
    "delivery-note": { title: editMode ? editTitleConfig["delivery-note"] : "Neuer Lieferschein", backPath: "/delivery-notes", sendLabel: "Lieferschein erstellen" },
    "credit-note": { title: editMode ? editTitleConfig["credit-note"] : "Neue Gutschrift", backPath: "/credit-notes", sendLabel: "Gutschrift erstellen" },
    "purchase-order": { title: editMode ? editTitleConfig["purchase-order"] : "Neue Bestellung", backPath: "/purchase-orders", sendLabel: "Bestellung senden" },
  };
  const { title, backPath, sendLabel } = typeConfig[type] || typeConfig.invoice;

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (c: any) =>
      c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.contactPerson?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.vatNumber?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Filter products based on search
  const filteredProducts = products.filter((p: any) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addPosition = (product: ProductData) => {
    const price = Number(product.salePrice) || 0;
    const newPosition: Position = {
      id: Date.now(),
      description: product.name,
      quantity: 1,
      unit: product.unit || "Stück",
      price,
      total: price,
      vatRate: parseFloat(defaultVatRate),
    };
    setPositions([...positions, newPosition]);
    setProductDialogOpen(false);
  };

  const updatePosition = (id: number, field: keyof Position, value: string | number) => {
    setPositions(
      positions.map((pos) => {
        if (pos.id === id) {
          const updated = { ...pos, [field]: value };
          if (field === "quantity" || field === "price") {
            updated.total = updated.quantity * updated.price;
          }
          return updated;
        }
        return pos;
      })
    );
  };

  const removePosition = (id: number) => {
    setPositions(positions.filter((pos) => pos.id !== id));
  };

  const addCustomPosition = () => {
    const newPosition: Position = {
      id: Date.now(),
      description: "",
      quantity: 1,
      unit: "Stück",
      price: 0,
      total: 0,
      vatRate: parseFloat(defaultVatRate),
    };
    setPositions([...positions, newPosition]);
  };

  // Calculate totals with different VAT rates
  const subtotal = positions.reduce((sum, pos) => sum + pos.total, 0);
  
  // Group VAT by rate
  const vatByRate = positions.reduce((acc, pos) => {
    const rate = pos.vatRate;
    if (!acc[rate]) acc[rate] = 0;
    acc[rate] += pos.total * (rate / 100);
    return acc;
  }, {} as Record<number, number>);
  
  const totalVat = Object.values(vatByRate).reduce((sum, vat) => sum + vat, 0);
  const total = subtotal + totalVat;

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (asDraft: boolean) => {
    if (!selectedCustomer) {
      toast.error("Bitte wählen Sie einen Kunden aus");
      return;
    }

    if (!documentDate) {
      toast.error("Bitte wählen Sie ein Datum aus");
      return;
    }

    const isDeliveryNote = type === "delivery-note";
    const payload: any = {
      customerId: selectedCustomer.id,
      status: asDraft ? "DRAFT" : (isDeliveryNote ? "SHIPPED" : "SENT"),
      items: positions.map((pos, idx) => {
        const item: any = {
          position: idx + 1,
          description: pos.description,
          quantity: pos.quantity,
          unit: pos.unit,
        };
        // Delivery notes don't use unitPrice
        if (!isDeliveryNote) {
          item.unitPrice = pos.price;
        }
        return item;
      }),
      notes: notes || undefined,
    };

    // Pass through context IDs
    if (selectedProjectId) payload.projectId = selectedProjectId;
    if (urlOrderId) payload.orderId = urlOrderId;
    if (urlQuoteId) payload.quoteId = urlQuoteId;
    if (urlInvoiceId) payload.invoiceId = urlInvoiceId;

    // Type-specific fields
    if (type === "quote") {
      payload.issueDate = documentDate;
      // validUntil is required by the backend – default to 30 days
      const days = parseInt(validDays) || 30;
      const valid = new Date(documentDate);
      valid.setDate(valid.getDate() + days);
      payload.validUntil = valid.toISOString().split("T")[0];
    } else if (type === "invoice") {
      payload.issueDate = documentDate;
      if (paymentDays) {
        const due = new Date(documentDate);
        due.setDate(due.getDate() + parseInt(paymentDays));
        payload.dueDate = due.toISOString().split("T")[0];
      }
    } else if (type === "order") {
      payload.orderDate = documentDate;
    } else if (type === "delivery-note") {
      payload.deliveryDate = documentDate;
    } else if (type === "credit-note") {
      payload.issueDate = documentDate;
    }

    if (onSave) {
      setIsSaving(true);
      try {
        const result = await onSave(payload);
        // Navigate to detail page if we got an ID back
        if (result?.id) {
          navigate(`${backPath}/${result.id}`);
        } else {
          navigate(backPath);
        }
      } catch (err: any) {
        toast.error(err?.message || "Fehler beim Speichern");
      } finally {
        setIsSaving(false);
      }
    } else {
      // Legacy fallback
      console.log("Saving document:", { type, payload });
      navigate(backPath);
    }
  };

  // Prepare PDF preview data
  const pdfPreviewData: SalesDocumentData = useMemo(() => ({
    type: type as SalesDocumentData['type'],
    number: "VORSCHAU",
    date: documentDate || new Date().toISOString().split("T")[0],
    company: {
      name: companyData?.name || "—",
      street: companyData?.street || "",
      postalCode: companyData?.zipCode || "",
      city: companyData?.city || "",
      phone: companyData?.phone || "",
      email: companyData?.email || "",
      vatNumber: companyData?.vatNumber || "",
      iban: companyData?.iban || "",
      bic: companyData?.bic || "",
    },
    customer: {
      name: selectedCustomer?.name || "—",
      contact: "",
      street: selectedCustomer?.street || "",
      postalCode: selectedCustomer?.zipCode || "",
      city: selectedCustomer?.city || "",
      email: selectedCustomer?.email || "",
      phone: selectedCustomer?.phone || "",
    },
    positions: positions.map((pos, idx) => ({
      position: idx + 1,
      description: pos.description,
      quantity: pos.quantity,
      unit: pos.unit,
      unitPrice: pos.price,
      total: pos.total,
    })),
    subtotal,
    vatRate: 8.1,
    vatAmount: totalVat,
    total,
    notes,
    ...(type === 'quote' && validDays ? {
      validUntil: (() => {
        const d = new Date(documentDate || new Date());
        d.setDate(d.getDate() + (parseInt(validDays) || 30));
        return d.toISOString().split("T")[0];
      })(),
    } : {}),
  }), [type, selectedCustomer, positions, subtotal, totalVat, total, notes, companyData, documentDate, validDays]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(backPath)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{title}</h1>
              {isInvoice && useQrInvoice && (
                <Badge variant="outline" className="gap-1">
                  <QrCode className="h-3 w-3" />
                  QR-Rechnung
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {typeConfig[type]?.title || "Dokument erstellen"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave(true)} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Als Entwurf speichern
          </Button>
          <Button variant="outline" onClick={() => setShowPDFPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          <Button onClick={() => handleSave(false)} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {sendLabel}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Kunde</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedCustomer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCustomer.phone || selectedCustomer.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCustomer.street}{selectedCustomer.city ? `, ${selectedCustomer.zipCode} ${selectedCustomer.city}` : ''}
                      </p>
                      {selectedCustomer.vatNumber && (
                        <p className="text-xs font-mono text-muted-foreground">
                          UID: {selectedCustomer.vatNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomerDialogOpen(true)}
                  >
                    Ändern
                  </Button>
                </div>
              ) : (
                <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Search className="h-4 w-4" />
                      Kunde auswählen...
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Kunde auswählen</DialogTitle>
                      <DialogDescription>Suchen und wählen Sie einen Kunden aus der Liste.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Name, Kontakt oder UID suchen..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setCustomerDialogOpen(false);
                            }}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Building2 className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {customer.email} • {customer.city || customer.street}
                              </p>
                              {customer.vatNumber && (
                                <p className="text-xs font-mono text-muted-foreground">
                                  {customer.vatNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Positions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Positionen</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addCustomPosition}>
                  <Plus className="h-4 w-4 mr-2" />
                  Freie Position
                </Button>
                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Package className="h-4 w-4 mr-2" />
                      Produkt hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Produkt auswählen</DialogTitle>
                      <DialogDescription>Suchen und wählen Sie ein Produkt aus dem Katalog.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Produkt suchen..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => addPosition(product)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.unit}</p>
                              </div>
                            </div>
                            <span className="font-medium">CHF {Number(product.salePrice || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Positionen hinzugefügt</p>
                  <p className="text-sm">
                    Fügen Sie Produkte oder freie Positionen hinzu
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[35%]">Beschreibung</TableHead>
                        <TableHead className="w-[60px]">Menge</TableHead>
                        <TableHead className="w-[80px]">Einheit</TableHead>
                        <TableHead className="w-[100px]">Einzelpreis</TableHead>
                        <TableHead className="w-[80px]">MwSt.</TableHead>
                        <TableHead className="text-right">Gesamt</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((pos) => (
                        <TableRow key={pos.id}>
                          <TableCell>
                            <Input
                              value={pos.description}
                              onChange={(e) =>
                                updatePosition(pos.id, "description", e.target.value)
                              }
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={pos.quantity}
                              onChange={(e) =>
                                updatePosition(pos.id, "quantity", parseFloat(e.target.value) || 0)
                              }
                              className="h-8 w-14"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={pos.unit}
                              onValueChange={(value) => updatePosition(pos.id, "unit", value)}
                            >
                              <SelectTrigger className="h-8 w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Stück">Stück</SelectItem>
                                <SelectItem value="Stunden">Std.</SelectItem>
                                <SelectItem value="Tage">Tage</SelectItem>
                                <SelectItem value="Pauschal">Pausch.</SelectItem>
                                <SelectItem value="Monat">Monat</SelectItem>
                                <SelectItem value="m²">m²</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lfm">lfm</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                value={pos.price}
                                onChange={(e) =>
                                  updatePosition(pos.id, "price", parseFloat(e.target.value) || 0)
                                }
                                className="h-8 w-20"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={pos.vatRate.toString()}
                              onValueChange={(value) => updatePosition(pos.id, "vatRate", parseFloat(value))}
                            >
                              <SelectTrigger className="h-8 w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {vatRates.map((vat) => (
                                  <SelectItem key={vat.value} value={vat.value}>
                                    {vat.rate}%
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            CHF {pos.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removePosition(pos.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Zwischensumme (netto)</span>
                      <span>CHF {subtotal.toFixed(2)}</span>
                    </div>
                    
                    {/* VAT breakdown by rate */}
                    {Object.entries(vatByRate).map(([rate, amount]) => (
                      amount > 0 && (
                        <div key={rate} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">MwSt. {rate}%</span>
                          <span>CHF {amount.toFixed(2)}</span>
                        </div>
                      )
                    ))}
                    
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Gesamtbetrag (brutto)</span>
                      <span className="text-primary">CHF {total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Bemerkungen</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={
                  isQuote
                    ? "z.B. Zahlungsbedingungen, besondere Hinweise..."
                    : "z.B. Zahlungshinweise, Referenznummer, Skonto..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Standard: Zahlbar innert {paymentDays} Tagen netto
              </p>
            </CardContent>
          </Card>

          {/* QR Invoice Preview (for invoices) */}
          {isInvoice && useQrInvoice && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR-Rechnung Vorschau
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Empfangsschein */}
                    <div className="border-r pr-4">
                      <p className="text-xs font-bold mb-2">Empfangsschein</p>
                      <div className="space-y-1 text-xs">
                        <p className="font-semibold">Konto / Zahlbar an</p>
                        <p className="font-mono">{companyBankAccount.qrIban}</p>
                        <p>{companyBankAccount.name}</p>
                        <p>{companyBankAccount.address}</p>
                        
                        {qrReference && (
                          <>
                            <p className="font-semibold mt-2">Referenz</p>
                            <p className="font-mono text-[10px]">{qrReference}</p>
                          </>
                        )}
                        
                        <p className="font-semibold mt-2">Zahlbar durch</p>
                        {selectedCustomer ? (
                          <>
                            <p>{selectedCustomer.name}</p>
                            <p>{selectedCustomer.street}{selectedCustomer.city ? `, ${selectedCustomer.zipCode} ${selectedCustomer.city}` : ''}</p>
                          </>
                        ) : (
                          <p className="text-muted-foreground italic">Kunde auswählen</p>
                        )}
                        
                        <div className="mt-3 pt-2 border-t">
                          <p className="font-semibold">Währung / Betrag</p>
                          <div className="flex gap-4">
                            <span>CHF</span>
                            <span className="font-mono">{total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Zahlteil */}
                    <div className="pl-4">
                      <p className="text-xs font-bold mb-2">Zahlteil</p>
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
                          <QrCode className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <div className="space-y-1 text-xs flex-1">
                          <p className="font-semibold">Konto / Zahlbar an</p>
                          <p className="font-mono">{companyBankAccount.qrIban}</p>
                          <p>{companyBankAccount.name}</p>
                          <p>{companyBankAccount.address}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-1 text-xs">
                        {qrReference && (
                          <>
                            <p className="font-semibold">Referenz</p>
                            <p className="font-mono">{qrReference}</p>
                          </>
                        )}
                        
                        <p className="font-semibold mt-2">Zusätzliche Informationen</p>
                        <p>{isQuote ? "Angebot" : "Rechnung"} {selectedCustomer?.name || ""}</p>
                        
                        <p className="font-semibold mt-2">Zahlbar durch</p>
                        {selectedCustomer ? (
                          <>
                            <p>{selectedCustomer.name}</p>
                            <p>{selectedCustomer.street}{selectedCustomer.city ? `, ${selectedCustomer.zipCode} ${selectedCustomer.city}` : ''}</p>
                          </>
                        ) : (
                          <p className="text-muted-foreground italic">—</p>
                        )}
                        
                        <div className="mt-3 pt-2 border-t">
                          <p className="font-semibold">Währung / Betrag</p>
                          <div className="flex gap-4">
                            <span>CHF</span>
                            <span className="font-mono font-bold">{total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Swiss QR-Invoice nach ISO 20022 Standard. Der QR-Code wird bei der Rechnungserstellung generiert.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Dokumentdatum *</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={documentDate}
                    onChange={(e) => setDocumentDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {isQuote ? (
                <div className="space-y-2">
                  <Label>Gültigkeitsdauer</Label>
                  <Select value={validDays} onValueChange={setValidDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14">14 Tage</SelectItem>
                      <SelectItem value="30">30 Tage</SelectItem>
                      <SelectItem value="60">60 Tage</SelectItem>
                      <SelectItem value="90">90 Tage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : isInvoice ? (
                <>
                  <div className="space-y-2">
                    <Label>Zahlungsziel</Label>
                    <Select value={paymentDays} onValueChange={setPaymentDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 Tage netto</SelectItem>
                        <SelectItem value="20">20 Tage netto</SelectItem>
                        <SelectItem value="30">30 Tage netto</SelectItem>
                        <SelectItem value="45">45 Tage netto</SelectItem>
                        <SelectItem value="60">60 Tage netto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>QR-Rechnung</Label>
                      <p className="text-xs text-muted-foreground">Swiss QR-Invoice aktivieren</p>
                    </div>
                    <Switch checked={useQrInvoice} onCheckedChange={setUseQrInvoice} />
                  </div>

                  {useQrInvoice && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        QR-Referenz
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-xs">
                              26-stellige QR-Referenz (QRR) oder 25-stellige Creditor Reference (SCOR).
                              Wird automatisch vom Backend generiert.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input 
                        value={qrReference}
                        onChange={(e) => setQrReference(e.target.value)}
                        placeholder="Wird automatisch generiert"
                        className="font-mono text-sm"
                      />
                    </div>
                  )}
                </>
              ) : null}

              <div className="space-y-2">
                <Label>Standard MwSt.-Satz</Label>
                <Select value={defaultVatRate} onValueChange={setDefaultVatRate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vatRates.map((vat) => (
                      <SelectItem key={vat.value} value={vat.value}>
                        {vat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Projekt (optional)</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: any) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Info */}
          {isInvoice && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Bankverbindung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium">{companyBankAccount.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IBAN</span>
                  <span className="font-mono text-xs">{companyBankAccount.iban}</span>
                </div>
                {useQrInvoice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">QR-IBAN</span>
                    <span className="font-mono text-xs">{companyBankAccount.qrIban}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BIC</span>
                  <span className="font-medium">{companyBankAccount.bic}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MWST-Nr.</span>
                  <span className="font-mono text-xs">{companyBankAccount.uid}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Zusammenfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kunde</span>
                <span className="font-medium truncate max-w-[150px]">
                  {selectedCustomer?.name || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Positionen</span>
                <span className="font-medium">{positions.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Netto</span>
                <span className="font-medium">CHF {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">MwSt.</span>
                <span className="font-medium">CHF {totalVat.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Brutto</span>
                <span className="text-primary">CHF {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        documentData={pdfPreviewData}
        title={`${title} – Vorschau`}
      />
    </div>
  );
}
