import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, Building2, Receipt, FolderKanban, Plus, Trash2, Loader2 } from "lucide-react";
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
import { useCreatePurchaseInvoice } from "@/hooks/use-purchase-invoices";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export default function PurchaseInvoiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultSupplierId = searchParams.get("supplierId") || "";
  const defaultPurchaseOrderId = searchParams.get("purchaseOrderId") || "";

  const [formData, setFormData] = useState({
    supplierId: defaultSupplierId,
    purchaseOrderId: defaultPurchaseOrderId,
    externalNumber: "",
    invoiceDate: "",
    dueDate: "",
    description: "",
    projectId: "",
    accountCode: "",
    vatRate: "8.1",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: "", quantity: 1, unit: "Stück", unitPrice: 0 },
  ]);

  // Hooks
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ pageSize: 100 });
  const projects = useMemo(() => projectsData?.data || [], [projectsData]);
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({ pageSize: 200 });
  const suppliers = useMemo(() => (suppliersData as any)?.data || [], [suppliersData]);
  const createInvoice = useCreatePurchaseInvoice();

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), description: "", quantity: 1, unit: "Stück", unitPrice: 0 }]);
  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const vatAmount = subtotal * (Number(formData.vatRate) / 100);
  const total = subtotal + vatAmount;

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

    createInvoice.mutate(
      {
        supplierId: formData.supplierId,
        externalNumber: formData.externalNumber,
        purchaseOrderId: formData.purchaseOrderId || undefined,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        notes: formData.description || undefined,
        items: items
          .filter(i => i.description)
          .map(i => ({
            description: i.description,
            quantity: i.quantity,
            unit: i.unit,
            unitPrice: i.unitPrice,
            vatRate: Number(formData.vatRate),
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
                {defaultPurchaseOrderId && (
                  <div className="space-y-2">
                    <Label>Bezug Bestellung</Label>
                    <Input value={defaultPurchaseOrderId} disabled className="font-mono" />
                  </div>
                )}
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
                  <Label>MwSt-Satz</Label>
                  <Select
                    value={formData.vatRate}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, vatRate: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8.1">8.1% Normalsatz</SelectItem>
                      <SelectItem value="2.6">2.6% Reduziert</SelectItem>
                      <SelectItem value="0">0% Befreit</SelectItem>
                    </SelectContent>
                  </Select>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Beschreibung</TableHead>
                    <TableHead>Menge</TableHead>
                    <TableHead>Einheit</TableHead>
                    <TableHead>Einzelpreis</TableHead>
                    <TableHead className="text-right">Gesamt</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          placeholder="Beschreibung"
                          className="h-8"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="h-8 w-20"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-8 w-20"
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          className="h-8 w-24"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        CHF {(item.quantity * item.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 space-y-1 text-sm border-t pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Netto</span>
                  <span>CHF {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>MwSt. ({formData.vatRate}%)</span>
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
                <Label>Aufwandkonto</Label>
                <Select
                  value={formData.accountCode}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, accountCode: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Konto wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4000">4000 - Materialaufwand</SelectItem>
                    <SelectItem value="6000">6000 - Raumaufwand</SelectItem>
                    <SelectItem value="6500">6500 - Verwaltungsaufwand</SelectItem>
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
