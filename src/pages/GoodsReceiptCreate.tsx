import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

export default function GoodsReceiptCreate() {
  const navigate = useNavigate();
  const [items, setItems] = useState([{ id: 1, article: "", ordered: 0, received: 0 }]);

  const addItem = () => setItems([...items, { id: Date.now(), article: "", ordered: 0, received: 0 }]);
  const removeItem = (id: number) => setItems(items.filter(i => i.id !== id));

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
                  <Label>Bestellung</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Bestellung auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">BE-2024-015 - Material AG</SelectItem>
                      <SelectItem value="2">BE-2024-018 - Stahlwerk GmbH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lieferschein-Nr.</Label>
                  <Input placeholder="Lieferschein des Lieferanten" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Eingangsdatum</Label>
                <Input type="date" />
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
                    <TableHead>Artikel</TableHead>
                    <TableHead>Bestellt</TableHead>
                    <TableHead>Erhalten</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input placeholder="Artikelbezeichnung" className="h-8" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={0} className="h-8 w-20" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={0} className="h-8 w-20" />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
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
              <Select>
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
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Wareneingang buchen
        </Button>
      </div>
    </div>
  );
}
