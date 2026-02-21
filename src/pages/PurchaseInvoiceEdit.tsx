import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Receipt, Plus, Trash2, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { usePurchaseInvoice, useUpdatePurchaseInvoice } from "@/hooks/use-purchase-invoices";

interface EditItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  vatRate: number;
  unitPrice: number;
}

const VAT_OPTIONS = [
  { value: "8.1", label: "8.1%" },
  { value: "2.6", label: "2.6%" },
  { value: "3.8", label: "3.8%" },
  { value: "0",   label: "0%" },
];

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

export default function PurchaseInvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: raw, isLoading } = usePurchaseInvoice(id || "");
  const updateInvoice = useUpdatePurchaseInvoice();

  const [formData, setFormData] = useState({
    externalNumber: "",
    invoiceDate: "",
    dueDate: "",
    notes: "",
    accountCode: "",
  });
  const [items, setItems] = useState<EditItem[]>([
    { id: 1, description: "", quantity: 1, unit: "Stück", vatRate: 8.1, unitPrice: 0 },
  ]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (raw && !initialized) {
      const pi = raw as any;
      setFormData({
        externalNumber: pi.externalNumber || pi.number || "",
        invoiceDate: pi.invoiceDate ? new Date(pi.invoiceDate).toISOString().split("T")[0] : "",
        dueDate: pi.dueDate ? new Date(pi.dueDate).toISOString().split("T")[0] : "",
        notes: pi.notes || "",
        accountCode: pi.accountCode || "",
      });
      if (pi.items && pi.items.length > 0) {
        setItems(pi.items.map((item: any, idx: number) => ({
          id: idx + 1,
          description: item.description || "",
          quantity: Number(item.quantity) || 1,
          unit: item.unit || "Stück",
          vatRate: Number(item.vatRate) ?? 8.1,
          unitPrice: Number(item.unitPrice) || 0,
        })));
      }
      setInitialized(true);
    }
  }, [raw, initialized]);

  const addItem = () => setItems(prev => [
    ...prev,
    { id: Date.now(), description: "", quantity: 1, unit: "Stück", vatRate: 8.1, unitPrice: 0 },
  ]);
  const removeItem = (itemId: number) => setItems(prev => prev.filter(i => i.id !== itemId));
  const updateItem = (itemId: number, field: keyof EditItem, value: string | number) =>
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, [field]: value } : i));

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), [items]);
  const vatAmount = useMemo(() => items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.vatRate / 100), 0), [items]);
  const total = useMemo(() => subtotal + vatAmount, [subtotal, vatAmount]);

  const handleSubmit = () => {
    if (!formData.externalNumber) { toast.error("Lieferanten-Rechnungsnummer erforderlich"); return; }
    if (!formData.invoiceDate || !formData.dueDate) { toast.error("Bitte Daten angeben"); return; }
    if (items.every(i => !i.description)) { toast.error("Mindestens eine Position erfassen"); return; }

    updateInvoice.mutate(
      {
        id: id || "",
        data: {
          externalNumber: formData.externalNumber,
          invoiceDate: formData.invoiceDate,
          dueDate: formData.dueDate,
          notes: formData.notes || undefined,
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
      },
      {
        onSuccess: () => {
          toast.success("Rechnung aktualisiert");
          navigate(`/purchase-invoices/${id}`);
        },
        onError: () => toast.error("Fehler beim Speichern"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pi = raw as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/purchase-invoices/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Eingangsrechnung bearbeiten</h1>
          <p className="text-muted-foreground">
            {pi?.externalNumber || pi?.number || id} · {pi?.supplier?.name || pi?.supplier?.companyName || ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Lieferant (readonly) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Lieferant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{pi?.supplier?.companyName || pi?.supplier?.name || "—"}</p>
              <p className="text-sm text-muted-foreground mt-1">Lieferant kann nach Erstellung nicht geändert werden.</p>
            </CardContent>
          </Card>

          {/* Rechnungsdetails */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4" />
                Rechnungsdetails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Rechnungsnummer (Lieferant) *</Label>
                <Input
                  value={formData.externalNumber}
                  onChange={(e) => setFormData(p => ({ ...p, externalNumber: e.target.value }))}
                  placeholder="z.B. R-2024-001"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rechnungsdatum *</Label>
                  <Input type="date" value={formData.invoiceDate} onChange={(e) => setFormData(p => ({ ...p, invoiceDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Fälligkeitsdatum *</Label>
                  <Input type="date" value={formData.dueDate} onChange={(e) => setFormData(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bemerkungen</Label>
                <Textarea rows={3} value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Optionale Notizen..." />
              </div>
            </CardContent>
          </Card>

          {/* Positionen */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4" />
                Positionen
              </CardTitle>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Hinzufügen
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
                      <TableHead className="w-[40px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input className="h-8" value={item.description} placeholder="Beschreibung" onChange={(e) => updateItem(item.id, "description", e.target.value)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0} className="h-8 w-16" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} />
                        </TableCell>
                        <TableCell>
                          <Input className="h-8 w-20" value={item.unit} onChange={(e) => updateItem(item.id, "unit", e.target.value)} />
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
                          <Input type="number" min={0} step={0.01} className="h-8 w-24" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          CHF {(item.quantity * item.unitPrice * (1 + item.vatRate / 100)).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
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
                  <span>Netto</span><span>CHF {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>MwSt. (pro Position)</span><span>CHF {vatAmount.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span>Gesamt</span><span>CHF {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Kontierung */}
          <Card>
            <CardHeader><CardTitle className="text-base">Kontierung</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Aufwandkonto (Swiss KMU)</Label>
                <Select value={formData.accountCode} onValueChange={(v) => setFormData(p => ({ ...p, accountCode: v }))}>
                  <SelectTrigger><SelectValue placeholder="Konto wählen" /></SelectTrigger>
                  <SelectContent>
                    {SWISS_ACCOUNTS.map(a => (
                      <SelectItem key={a.code} value={a.code}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Zusammenfassung */}
          <Card>
            <CardHeader><CardTitle className="text-base">Zusammenfassung</CardTitle></CardHeader>
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
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>CHF {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button className="gap-2" onClick={handleSubmit} disabled={updateInvoice.isPending}>
              {updateInvoice.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Änderungen speichern
            </Button>
            <Button variant="outline" onClick={() => navigate(`/purchase-invoices/${id}`)}>
              Abbrechen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
