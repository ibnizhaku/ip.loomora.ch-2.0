import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, Building2, Receipt, FolderKanban, Plus, Trash2, Loader2, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useProjects } from "@/hooks/use-projects";
import { useSuppliers } from "@/hooks/use-suppliers";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useCreatePurchaseInvoice } from "@/hooks/use-purchase-invoices";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;   // MwSt pro Position (%)
}

const VAT_OPTIONS = [
  { value: "8.1", label: "8.1%" },
  { value: "2.6", label: "2.6%" },
  { value: "3.8", label: "3.8%" },
  { value: "0",   label: "0%" },
];

// Swiss KMU Standardkontenrahmen (Aufwandkonten)
const SWISS_ACCOUNTS = [
  { code: "4000", label: "4000 – Materialaufwand" },
  { code: "4200", label: "4200 – Handelswarenaufwand" },
  { code: "4400", label: "4400 – Fremdleistungen" },
  { code: "4900", label: "4900 – Übrige direkte Kosten" },
  { code: "5000", label: "5000 – Personalaufwand" },
  { code: "6000", label: "6000 – Raumaufwand" },
  { code: "6100", label: "6100 – Unterhalt Sachanlagen" },
  { code: "6200", label: "6200 – Fahrzeugaufwand" },
  { code: "6300", label: "6300 – Versicherungsaufwand" },
  { code: "6400", label: "6400 – Energieaufwand" },
  { code: "6500", label: "6500 – Verwaltungsaufwand" },
  { code: "6600", label: "6600 – IT & Software" },
  { code: "6700", label: "6700 – Werbeaufwand" },
  { code: "6800", label: "6800 – Sonstiger Betriebsaufwand" },
  { code: "6900", label: "6900 – Finanzaufwand" },
  { code: "7000", label: "7000 – Abschreibungen" },
];

export default function PurchaseInvoiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL-Parameter (normal oder PDF-Import)
  const defaultSupplierId     = searchParams.get("supplierId") || "";
  const defaultPurchaseOrderId = searchParams.get("purchaseOrderId") || "";
  const isFromPdfImport       = searchParams.get("from") === "pdf-import";
  const importedExtNumber     = searchParams.get("externalNumber") || "";
  const importedGrossAmount   = searchParams.get("grossAmount") || "";
  const importedVatRate       = searchParams.get("vatRate") || "8.1";
  const importedInvoiceDate   = searchParams.get("invoiceDate") || "";
  const importedDueDate       = searchParams.get("dueDate") || "";
  const importedFilename      = isFromPdfImport ? (sessionStorage.getItem("pdf-import-filename") || "") : "";

  // Positionen aus sessionStorage – KEIN useMemo (Regeln: Hook nicht nach early return erlaubt)
  const importedPositions: InvoiceItem[] = (() => {
    if (!isFromPdfImport) return [];
    try {
      const raw = sessionStorage.getItem("pdf-import-positions");
      if (!raw) return [];
      const parsed = JSON.parse(raw) as any[];
      return parsed.map((p, i) => ({
        id: i + 1,
        description: p.description || "",
        quantity: Number(p.quantity) || 1,
        unit: p.unit || "Stk",
        unitPrice: Number(p.unitPrice) || Number(p.total) || 0,
        vatRate: Number(p.vatRate) || 0, // aus PDF (oft 0 = keine MwSt)
      }));
    } catch { return []; }
  })();

  const [formData, setFormData] = useState({
    supplierId: defaultSupplierId,
    purchaseOrderId: defaultPurchaseOrderId,
    externalNumber: importedExtNumber,
    invoiceDate: importedInvoiceDate,
    dueDate: importedDueDate,
    description: "",
    projectId: "",
    accountCode: "",
    vatRate: importedVatRate,
  });

  const defaultItems: InvoiceItem[] = importedPositions.length > 0
    ? importedPositions
    : [{ id: 1, description: "", quantity: 1, unit: "Stück", unitPrice: 0, vatRate: 8.1 }];

  const [items, setItems] = useState<InvoiceItem[]>(defaultItems);

  // Hooks
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ pageSize: 100 });
  const projects = useMemo(() => projectsData?.data || [], [projectsData]);
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({ pageSize: 200 });
  const suppliers = useMemo(() => (suppliersData as any)?.data || [], [suppliersData]);
  const { data: purchaseOrdersData } = usePurchaseOrders({ pageSize: 200, supplierId: formData.supplierId || undefined });
  const purchaseOrders = useMemo(() => (purchaseOrdersData as any)?.data || [], [purchaseOrdersData]);
  const createInvoice = useCreatePurchaseInvoice();

  // Fallback: wenn keine Positionen aus PDF, Bruttobetrag als eine Position setzen
  useEffect(() => {
    if (!isFromPdfImport || importedPositions.length > 0 || !importedGrossAmount) return;
    const gross = parseFloat(importedGrossAmount);
    const rate = parseFloat(importedVatRate);
    const net = rate === 0 ? gross : gross / (1 + rate / 100);
    setItems([{ id: 1, description: "Leistung gemäss Rechnung", quantity: 1, unit: "Pauschal", unitPrice: parseFloat(net.toFixed(2)), vatRate: rate }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFormData(prev => ({ ...prev, purchaseOrderId: defaultPurchaseOrderId || prev.purchaseOrderId }));
  }, [defaultPurchaseOrderId]);

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), description: "", quantity: 1, unit: "Stück", unitPrice: 0, vatRate: 8.1 }]);
  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  // Totals: pro Position eigener MwSt-Satz
  const subtotal  = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const vatAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice * (i.vatRate / 100), 0);
  const total     = subtotal + vatAmount;

  const handleSubmit = () => {
    if (!formData.supplierId) {
      toast.error("Bitte einen Lieferanten auswählen");
      return;
    }
    if (!formData.externalNumber) {
      toast.error("Bitte Lieferanten-Rechnungsnummer eingeben");
      return;
    }
    if (!formData.invoiceDate || !formData.dueDate) {
      toast.error("Bitte Rechnungs- und Fälligkeitsdatum angeben");
      return;
    }
    if (items.every(i => !i.description)) {
      toast.error("Bitte mindestens eine Position erfassen");
      return;
    }

    // Wenn PDF-Import: Original-PDF als data-URL mitschicken
    const pdfBase64 = isFromPdfImport ? sessionStorage.getItem("pdf-import-base64") : null;
    const documentUrl = pdfBase64 ? `data:application/pdf;base64,${pdfBase64}` : undefined;

    createInvoice.mutate(
      {
        supplierId: formData.supplierId,
        externalNumber: formData.externalNumber,
        purchaseOrderId: formData.purchaseOrderId || undefined,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        notes: formData.description || undefined,
        documentUrl,
        items: items
          .filter(i => i.description)
          .map(i => ({
            description: i.description,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
            vatRate: i.vatRate,
            accountCode: formData.accountCode || undefined,
          })),
      },
      {
        onSuccess: (res: any) => {
          toast.success("Rechnung erfolgreich erfasst");
          navigate(`/purchase-invoices/${res?.id || ""}`);
        },
        onError: () => toast.error("Fehler beim Speichern der Rechnung"),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neue Eingangsrechnung</h1>
          <p className="text-muted-foreground">Kreditorenrechnung erfassen</p>
        </div>
      </div>

      {/* PDF-Import Banner */}
      {isFromPdfImport && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-success/5 border border-success/20 text-sm">
          <Sparkles className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-success">Daten aus PDF importiert</p>
            <p className="text-muted-foreground mt-1">
              Felder automatisch befüllt – bitte prüfen.
              {importedExtNumber && <span className="ml-2 font-medium">RgNr: {importedExtNumber}</span>}
              {importedGrossAmount && <span className="ml-2 font-medium">Brutto: CHF {Number(importedGrossAmount).toFixed(2)}</span>}
              {importedFilename && <span className="ml-2">· <FileText className="h-3 w-3 inline" /> {importedFilename}</span>}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Lieferant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Lieferant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Lieferant auswählen *</Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, supplierId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={suppliersLoading ? "Laden..." : "Lieferant auswählen"} />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.companyName || s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bezug Bestellung (optional)</Label>
                  <Select
                    value={formData.purchaseOrderId || "__none__"}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, purchaseOrderId: v === "__none__" ? "" : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bestellung zuordnen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">—</SelectItem>
                      {purchaseOrders
                        .filter((po: any) => !formData.supplierId || po.supplierId === formData.supplierId)
                        .map((po: any) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.number} – {po.supplier?.companyName || po.supplier?.name || "—"}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rechnungsdetails */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Rechnungsdetails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rechnungsnummer (Lieferant) *</Label>
                  <Input
                    placeholder="Rechnungsnummer"
                    value={formData.externalNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, externalNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">MwSt-Satz wird pro Position gesetzt</Label>
                  <p className="text-sm text-muted-foreground">→ Spalte «MwSt.» in der Positionstabelle</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rechnungsdatum *</Label>
                  <Input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fälligkeitsdatum *</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Projekt (optional)
                </Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt zuweisen" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectsLoading ? (
                      <SelectItem value="loading" disabled>Laden...</SelectItem>
                    ) : projects.length === 0 ? (
                      <SelectItem value="none" disabled>Keine Projekte</SelectItem>
                    ) : (
                      projects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.number} - {project.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Beschreibung / Notiz</Label>
                <Textarea
                  placeholder="Beschreibung der Rechnung"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Positionen */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Positionen
              </CardTitle>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Position hinzufügen
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Beschreibung</TableHead>
                      <TableHead className="w-16">Menge</TableHead>
                      <TableHead className="w-20">Einheit</TableHead>
                      <TableHead className="w-20">MwSt.</TableHead>
                      <TableHead className="w-24">Einzelpreis</TableHead>
                      <TableHead className="text-right w-24">Gesamt</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input className="h-8" placeholder="Beschreibung" value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0} className="h-8 w-16" value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} />
                        </TableCell>
                        <TableCell>
                          <Input className="h-8 w-20" value={item.unit}
                            onChange={(e) => updateItem(item.id, "unit", e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Select value={String(item.vatRate)} onValueChange={(v) => updateItem(item.id, "vatRate", Number(v))}>
                            <SelectTrigger className="h-8 w-20 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VAT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0} step={0.01} className="h-8 w-24" value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          CHF {(item.quantity * item.unitPrice * (1 + item.vatRate / 100)).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8"
                            onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 space-y-1 text-sm border-t pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Netto</span>
                  <span>CHF {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>MwSt. (pro Position)</span>
                  <span>CHF {vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                  <span>Gesamt</span>
                  <span>CHF {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dokument */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Dokument hochladen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">PDF oder Bild hierher ziehen</p>
                <Button variant="outline" className="mt-4">Datei auswählen</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kontierung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Aufwandkonto (Swiss KMU)</Label>
                <Select
                  value={formData.accountCode}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, accountCode: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Konto wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {SWISS_ACCOUNTS.map(a => (
                      <SelectItem key={a.code} value={a.code}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Totals summary in sidebar */}
          <Card>
            <CardHeader>
              <CardTitle>Zusammenfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Positionen</span>
                <span>{items.filter(i => i.description).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Netto</span>
                <span>CHF {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MwSt.</span>
                <span>CHF {vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-3">
                <span>Total</span>
                <span>CHF {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSubmit} disabled={createInvoice.isPending}>
          {createInvoice.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Rechnung erfassen
        </Button>
      </div>
    </div>
  );
}
