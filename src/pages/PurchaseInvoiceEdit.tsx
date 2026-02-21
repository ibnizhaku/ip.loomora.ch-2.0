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
  unitPrice: number;
}

export default function PurchaseInvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: raw, isLoading } = usePurchaseInvoice(id || "");
  const updateInvoice = useUpdatePurchaseInvoice();

  const [formData, setFormData] = useState({
    externalNumber: "",
    invoiceDate: "",
    dueDate: "",
    vatRate: "8.1",
    notes: "",
  });
  const [items, setItems] = useState<EditItem[]>([
    { id: 1, description: "", quantity: 1, unit: "Stück", unitPrice: 0 },
  ]);
  const [initialized, setInitialized] = useState(false);

  // Pre-fill form once data arrives
  useEffect(() => {
    if (raw && !initialized) {
      const pi = raw as any;
      setFormData({
        externalNumber: pi.externalNumber || pi.number || "",
        invoiceDate: pi.invoiceDate ? new Date(pi.invoiceDate).toISOString().split("T")[0] : "",
        dueDate: pi.dueDate ? new Date(pi.dueDate).toISOString().split("T")[0] : "",
        vatRate: pi.vatAmount && pi.subtotal ? String(Math.round((pi.vatAmount / pi.subtotal) * 1000) / 10) : "8.1",
        notes: pi.notes || "",
      });
      if (pi.items && pi.items.length > 0) {
        setItems(pi.items.map((item: any, idx: number) => ({
          id: idx + 1,
          description: item.description || "",
          quantity: Number(item.quantity) || 1,
          unit: item.unit || "Stück",
          unitPrice: Number(item.unitPrice) || 0,
        })));
      }
      setInitialized(true);
    }
  }, [raw, initialized]);

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), description: "", quantity: 1, unit: "Stück", unitPrice: 0 }]);
  const removeItem = (itemId: number) => setItems(prev => prev.filter(i => i.id !== itemId));
  const updateItem = (itemId: number, field: keyof EditItem, value: string | number) =>
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, [field]: value } : i));

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), [items]);
  const vatAmount = useMemo(() => subtotal * (Number(formData.vatRate) / 100), [subtotal, formData.vatRate]);
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
              vatRate: Number(formData.vatRate),
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
            {pi?.externalNumber || pi?.number || id} · {pi?.supplier?.name || ""}
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
              <p className="font-medium">{pi?.supplier?.name || "—"}</p>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rechnungsnummer (Lieferant) *</Label>
                  <Input
                    value={formData.externalNumber}
                    onChange={(e) => setFormData(p => ({ ...p, externalNumber: e.target.value }))}
                    placeholder="z.B. R-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>MwSt-Satz</Label>
                  <Select value={formData.vatRate} onValueChange={(v) => setFormData(p => ({ ...p, vatRate: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8.1">8.1% Normalsatz</SelectItem>
                      <SelectItem value="2.6">2.6% Reduziert</SelectItem>
                      <SelectItem value="3.8">3.8% Beherbergung</SelectItem>
                      <SelectItem value="0">0% Befreit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Beschreibung</TableHead>
                    <TableHead>Menge</TableHead>
                    <TableHead>Einheit</TableHead>
                    <TableHead>Einzelpreis</TableHead>
                    <TableHead className="text-right">Gesamt</TableHead>
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
                        <Input type="number" min={0} className="h-8 w-20" value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} />
                      </TableCell>
                      <TableCell>
                        <Input className="h-8 w-20" value={item.unit} onChange={(e) => updateItem(item.id, "unit", e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={0} step={0.01} className="h-8 w-24" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        CHF {(item.quantity * item.unitPrice).toFixed(2)}
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
              <div className="mt-4 space-y-1 text-sm border-t pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Netto</span><span>CHF {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>MwSt. ({formData.vatRate}%)</span><span>CHF {vatAmount.toFixed(2)}</span>
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
