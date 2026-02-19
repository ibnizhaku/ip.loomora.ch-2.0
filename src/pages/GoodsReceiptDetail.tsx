import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Package, FileText, CheckCircle, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGoodsReceipt } from "@/hooks/use-goods-receipts";

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT:         { label: "Entwurf",          color: "bg-muted text-muted-foreground" },
  RECEIVED:      { label: "Erhalten",          color: "bg-info/10 text-info" },
  QUALITY_CHECK: { label: "Qualitätsprüfung",  color: "bg-warning/10 text-warning" },
  COMPLETED:     { label: "Abgeschlossen",     color: "bg-success/10 text-success" },
  REJECTED:      { label: "Abgelehnt",         color: "bg-destructive/10 text-destructive" },
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("de-CH"); } catch { return d; }
}

export default function GoodsReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: raw, isLoading, error } = useGoodsReceipt(id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !raw) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Wareneingang nicht gefunden</p>
        <Link to="/goods-receipts" className="text-primary hover:underline mt-2">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const receipt = raw as any;
  const status = statusConfig[receipt.status] || statusConfig.DRAFT;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{receipt.number || receipt.id}</h1>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
          <p className="text-muted-foreground">
            {receipt.supplier?.name || receipt.supplier?.companyName || "—"}
            {receipt.receiptDate && ` • ${formatDate(receipt.receiptDate)}`}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
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
              {(receipt.items || []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Keine Positionen vorhanden</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artikel</TableHead>
                      <TableHead className="text-right">Erwartet</TableHead>
                      <TableHead className="text-right">Erhalten</TableHead>
                      <TableHead>Einheit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(receipt.items || []).map((item: any, idx: number) => {
                      const expected = item.expectedQuantity ?? item.orderedQuantity ?? 0;
                      const received = item.receivedQuantity ?? 0;
                      const isComplete = received >= expected;
                      return (
                        <TableRow key={item.id || idx}>
                          <TableCell className="font-medium">
                            {item.description || item.product?.name || `Position ${idx + 1}`}
                          </TableCell>
                          <TableCell className="text-right font-mono">{expected}</TableCell>
                          <TableCell className="text-right font-mono">{received}</TableCell>
                          <TableCell>{item.unit || "Stück"}</TableCell>
                          <TableCell>
                            {isComplete ? (
                              <Badge className="bg-success/10 text-success gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Vollständig
                              </Badge>
                            ) : received > 0 ? (
                              <Badge className="bg-warning/10 text-warning">Teilweise</Badge>
                            ) : (
                              <Badge className="bg-muted text-muted-foreground">Ausstehend</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
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
                <p className="text-sm text-muted-foreground">Eingangsdatum</p>
                <p className="font-medium">{formatDate(receipt.receiptDate)}</p>
              </div>
              {receipt.deliveryNoteNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Lieferschein (Lieferant)</p>
                  <p className="font-mono">{receipt.deliveryNoteNumber}</p>
                </div>
              )}
              {receipt.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Bemerkungen</p>
                  <p className="text-sm">{receipt.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {receipt.purchaseOrderId && (
            <Card>
              <CardHeader>
                <CardTitle>Verknüpfte Belege</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={`/purchase-orders/${receipt.purchaseOrder?.id || receipt.purchaseOrderId}`}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    {receipt.purchaseOrder?.number || receipt.purchaseOrderId}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
