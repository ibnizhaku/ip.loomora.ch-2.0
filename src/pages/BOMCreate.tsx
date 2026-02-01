import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

export default function BOMCreate() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([
    { id: 1, name: "", quantity: 1, unit: "Stück", price: 0 }
  ]);

  const addMaterial = () => {
    setMaterials([...materials, { id: Date.now(), name: "", quantity: 1, unit: "Stück", price: 0 }]);
  };

  const removeMaterial = (id: number) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

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
          <CardTitle>Produkt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Bezeichnung</Label>
              <Input placeholder="Produktname" />
            </div>
            <div className="space-y-2">
              <Label>Artikelnummer</Label>
              <Input placeholder="ART-XXXX" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Materialien
          </CardTitle>
          <Button size="sm" onClick={addMaterial}>
            <Plus className="h-4 w-4 mr-2" />
            Material hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Menge</TableHead>
                <TableHead>Einheit</TableHead>
                <TableHead>Preis/Einheit</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    <Input placeholder="Materialbezeichnung" className="h-8" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" defaultValue={1} className="h-8 w-20" />
                  </TableCell>
                  <TableCell>
                    <Input defaultValue="Stück" className="h-8 w-24" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" defaultValue={0} className="h-8 w-24" />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeMaterial(material.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Stückliste speichern
        </Button>
      </div>
    </div>
  );
}
