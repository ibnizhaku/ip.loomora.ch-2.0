import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, FileText, CheckCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const receiptData = {
  id: "WE-2024-001",
  date: "01.02.2024",
  supplier: "Material AG",
  poNumber: "BE-2024-015",
  deliveryNote: "LS-2024-0892",
  status: "completed",
  warehouse: "Hauptlager",
  items: [
    { id: "1", article: "Stahlblech 2mm", ordered: 100, received: 100, unit: "Stück" },
    { id: "2", article: "Schrauben M8x25", ordered: 500, received: 500, unit: "Stück" },
    { id: "3", article: "Muttern M8", ordered: 500, received: 480, unit: "Stück" },
  ],
};

export default function GoodsReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{receiptData.id}</h1>
            <Badge className="bg-success/10 text-success">Vollständig</Badge>
          </div>
          <p className="text-muted-foreground">{receiptData.supplier} • {receiptData.date}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          Drucken
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Eingegangene Positionen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artikel</TableHead>
                    <TableHead className="text-right">Bestellt</TableHead>
                    <TableHead className="text-right">Erhalten</TableHead>
                    <TableHead>Einheit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptData.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.article}</TableCell>
                      <TableCell className="text-right font-mono">{item.ordered}</TableCell>
                      <TableCell className="text-right font-mono">{item.received}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        {item.received >= item.ordered ? (
                          <Badge className="bg-success/10 text-success gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Vollständig
                          </Badge>
                        ) : (
                          <Badge className="bg-warning/10 text-warning">Teilweise</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Bestellung</p>
                <p className="font-mono font-medium">{receiptData.poNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieferschein (Lieferant)</p>
                <p className="font-mono">{receiptData.deliveryNote}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lagerort</p>
                <p className="font-medium">{receiptData.warehouse}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verknüpfte Belege</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                {receiptData.poNumber}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
