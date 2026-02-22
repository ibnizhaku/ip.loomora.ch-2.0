import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Package, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useCreateGoodsReceipt } from "@/hooks/use-goods-receipts";
import { usePurchaseOrder, usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { useProducts } from "@/hooks/use-products";

interface ReceiptItem {
  id: number;
  productId: string;
  article: string;
  ordered: number;
  received: number;
  unit: string;
}

export default function GoodsReceiptCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const purchaseOrderId = searchParams.get("purchaseOrderId") || "";

  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(purchaseOrderId);
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState("");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [warehouseId, setWarehouseId] = useState("main");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: 1, productId: "", article: "", ordered: 0, received: 0, unit: "Stück" },
  ]);

  const createReceipt = useCreateGoodsReceipt();
  const { data: purchaseOrdersData } = usePurchaseOrders({ pageSize: 200 });
  const purchaseOrders = (purchaseOrdersData as any)?.data ?? [];
  const { data: productsData } = useProducts({ pageSize: 500 });
  const products = (productsData as any)?.data ?? [];

  // Load purchase order data when purchaseOrderId is provided
  const { data: poData, isLoading: poLoading } = usePurchaseOrder(selectedPurchaseOrderId);

  // Pre-fill items from purchase order (productId must be selected by user - PO items may not have product link)
  useEffect(() => {
    if (poData && (poData as any).items?.length > 0) {
      const poItems = ((poData as any).items || []).map((item: any, idx: number) => ({
        id: idx + 1,
        productId: item.productId || "",
        article: item.description || item.product?.name || "",
        ordered: Number(item.quantity) || 0,
        received: Number(item.quantity) || 0,
        unit: item.unit || "Stück",
      }));
      setItems(poItems);
    }
  }, [poData]);

  const addItem = () => setItems(prev => [...prev, {
    id: Date.now(), productId: "", article: "", ordered: 0, received: 0, unit: "Stück"
  }]);
  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: number, field: keyof ReceiptItem, value: string | number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  const updateItemMultiple = (id: number, updates: Partial<ReceiptItem>) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));

  const supplierName = useMemo(() => {
    const d = poData as any;
    return d?.supplier?.companyName || d?.supplier?.name || "";
  }, [poData]);

  const handleSubmit = () => {
    if (!selectedPurchaseOrderId) {
      toast.error("Bitte eine Bestellung auswählen");
      return;
    }
    const validItems = items.filter(i => i.productId && (i.ordered > 0 || i.received > 0));
    if (validItems.length === 0) {
      toast.error("Bitte mindestens eine Position mit Produkt und Menge erfassen");
      return;
    }
    const missingProduct = items.find(i => (i.ordered > 0 || i.received > 0) && !i.productId);
    if (missingProduct) {
      toast.error("Bitte für jede Position ein Produkt auswählen");
      return;
    }

    createReceipt.mutate(
      {
        purchaseOrderId: selectedPurchaseOrderId,
        receiptDate,
        deliveryNoteNumber: deliveryNoteNumber || undefined,
        notes: notes || undefined,
        items: validItems.map(i => ({
          productId: i.productId!,
          orderedQuantity: i.ordered,
          receivedQuantity: i.received,
          unit: i.unit || "Stück",
        })),
      } as any,
      {
        onSuccess: (res: any) => {
          toast.success("Wareneingang gebucht");
          navigate(`/goods-receipts/${res?.id || ""}`);
        },
        onError: () => toast.error("Fehler beim Buchen des Wareneingangs"),
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
          <h1 className="font-display text-2xl font-bold">Neuer Wareneingang</h1>
          <p className="text-muted-foreground">Wareneingang erfassen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bestellbezug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Bestellung *</Label>
                  <Select
                    value={selectedPurchaseOrderId || "__none__"}
                    onValueChange={(v) => setSelectedPurchaseOrderId(v === "__none__" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bestellung auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">—</SelectItem>
                      {purchaseOrders.map((po: any) => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.number} – {po.supplier?.companyName || po.supplier?.name || "—"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {poLoading && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Lade Bestellung...</p>}
                  {supplierName && <p className="text-xs text-muted-foreground">Lieferant: <strong>{supplierName}</strong></p>}
                </div>
                <div className="space-y-2">
                  <Label>Lieferschein-Nr.</Label>
                  <Input
                    placeholder="Lieferschein des Lieferanten"
                    value={deliveryNoteNumber}
                    onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Eingangsdatum</Label>
                <Input
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Bemerkungen</Label>
                <Input
                  placeholder="Optionale Notiz"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Positionen
                {poLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </CardTitle>
              <Button size="sm" onClick={addItem} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Position hinzufügen
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produkt *</TableHead>
                    <TableHead className="w-[100px]">Bestellt</TableHead>
                    <TableHead className="w-[100px]">Erhalten</TableHead>
                    <TableHead className="w-[80px]">Einheit</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select
                          value={item.productId || "__none__"}
                          onValueChange={(v) => {
                            const prod = products.find((p: any) => p.id === v);
                            updateItemMultiple(item.id, {
                              productId: v === "__none__" ? "" : v,
                              article: prod ? (prod.name || "") : item.article,
                            });
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Produkt wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— Produkt wählen —</SelectItem>
                            {products.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.sku ? `${p.sku} – ` : ""}{p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          className="h-8 w-20"
                          value={item.ordered}
                          onChange={(e) => updateItem(item.id, "ordered", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={item.ordered || undefined}
                          className="h-8 w-20"
                          value={item.received}
                          onChange={(e) => updateItem(item.id, "received", Number(e.target.value))}
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
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Lagerort</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Lager</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Lager wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Hauptlager</SelectItem>
                  <SelectItem value="external">Aussenlager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSubmit} disabled={createReceipt.isPending}>
          {createReceipt.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Wareneingang buchen
        </Button>
      </div>
    </div>
  );
}
