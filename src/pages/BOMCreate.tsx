import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCreateBom } from "@/hooks/use-bom";
import { toast } from "sonner";

interface BomItemRow {
  tempId: number;
  type: "MATERIAL" | "LABOR" | "EXTERNAL";
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  hours?: number;
  hourlyRate?: number;
}

export default function BOMCreate() {
  const navigate = useNavigate();
  const createBom = useCreateBom();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<BomItemRow[]>([
    { tempId: Date.now(), type: "MATERIAL", description: "", quantity: 1, unit: "Stk", unitPrice: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { tempId: Date.now(), type: "MATERIAL", description: "", quantity: 1, unit: "Stk", unitPrice: 0 }]);
  };

  const removeItem = (tempId: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.tempId !== tempId));
  };

  const updateItem = (tempId: number, field: keyof BomItemRow, value: any) => {
    setItems(items.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i)));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Bitte Bezeichnung eingeben");
      return;
    }

    const validItems = items.filter((i) => i.description.trim());
    if (validItems.length === 0) {
      toast.error("Mindestens eine Position erforderlich");
      return;
    }

    createBom.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        items: validItems.map((item) => ({
          type: item.type,
          description: item.description,
          quantity: item.type === "LABOR" ? 1 : item.quantity,
          unit: item.type === "LABOR" ? "Std" : item.unit,
          unitPrice: item.type === "LABOR" ? 0 : item.unitPrice,
          ...(item.type === "LABOR" ? { hours: item.hours || 0, hourlyRate: item.hourlyRate || 0 } : {}),
        })),
      } as any,
      {
        onSuccess: (data: any) => {
          toast.success("Stückliste erstellt");
          navigate(data?.id ? `/bom/${data.id}` : "/bom");
        },
        onError: () => toast.error("Fehler beim Erstellen der Stückliste"),
      }
    );
  };

  const getItemTotal = (item: BomItemRow) => {
    if (item.type === "LABOR") return (item.hours || 0) * (item.hourlyRate || 0);
    return item.quantity * item.unitPrice;
  };

  const grandTotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neue Stückliste</h1>
          <p className="text-muted-foreground">Bill of Materials erstellen</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grunddaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Bezeichnung *</Label>
              <Input
                placeholder="z.B. Metalltreppe Standard"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Input
                placeholder="z.B. Treppe, Geländer, Tor"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea
              placeholder="Optionale Beschreibung..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Positionen
          </CardTitle>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Position hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Typ</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead className="w-[80px]">Menge</TableHead>
                <TableHead className="w-[80px]">Einheit</TableHead>
                <TableHead className="w-[100px]">Preis/Einheit</TableHead>
                <TableHead className="w-[100px] text-right">Total</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.tempId}>
                  <TableCell>
                    <Select
                      value={item.type}
                      onValueChange={(v) => updateItem(item.tempId, "type", v)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MATERIAL">Material</SelectItem>
                        <SelectItem value="LABOR">Arbeit</SelectItem>
                        <SelectItem value="EXTERNAL">Fremdleistung</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Beschreibung"
                      className="h-8"
                      value={item.description}
                      onChange={(e) => updateItem(item.tempId, "description", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    {item.type === "LABOR" ? (
                      <Input
                        type="number"
                        className="h-8 w-20"
                        placeholder="Std."
                        value={item.hours || ""}
                        onChange={(e) => updateItem(item.tempId, "hours", parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <Input
                        type="number"
                        className="h-8 w-20"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.tempId, "quantity", parseFloat(e.target.value) || 0)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.type === "LABOR" ? (
                      <span className="text-sm text-muted-foreground">Std</span>
                    ) : (
                      <Input
                        className="h-8 w-20"
                        value={item.unit}
                        onChange={(e) => updateItem(item.tempId, "unit", e.target.value)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.type === "LABOR" ? (
                      <Input
                        type="number"
                        className="h-8 w-24"
                        placeholder="CHF/Std"
                        value={item.hourlyRate || ""}
                        onChange={(e) => updateItem(item.tempId, "hourlyRate", parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <Input
                        type="number"
                        className="h-8 w-24"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.tempId, "unitPrice", parseFloat(e.target.value) || 0)}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {getItemTotal(item).toLocaleString("de-CH", { style: "currency", currency: "CHF" })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.tempId)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className="text-right font-bold">
                  Gesamttotal
                </TableCell>
                <TableCell className="text-right font-bold">
                  {grandTotal.toLocaleString("de-CH", { style: "currency", currency: "CHF" })}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Abbrechen
        </Button>
        <Button className="gap-2" onClick={handleSave} disabled={createBom.isPending}>
          <Save className="h-4 w-4" />
          {createBom.isPending ? "Wird gespeichert..." : "Stückliste speichern"}
        </Button>
      </div>
    </div>
  );
}
