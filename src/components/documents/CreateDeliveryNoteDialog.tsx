import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateDeliveryNoteFromOrder } from "@/hooks/use-delivery-notes";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  unit?: string;
}

interface CreateDeliveryNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
}

export function CreateDeliveryNoteDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  items,
}: CreateDeliveryNoteDialogProps) {
  const navigate = useNavigate();
  const createDeliveryNote = useCreateDeliveryNoteFromOrder();
  const [selectedIds, setSelectedIds] = useState<string[]>(() => items.map((i) => i.id));

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleCreate = async () => {
    if (selectedIds.length === 0) {
      toast.error("Bitte mindestens eine Position auswählen");
      return;
    }
    try {
      const dn = await createDeliveryNote.mutateAsync({
        orderId,
        itemIds: selectedIds,
      });
      toast.success("Lieferschein wurde erstellt");
      onOpenChange(false);
      navigate(`/delivery-notes/${dn.id}`);
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      if (status === 409) {
        toast.error("Lieferschein-Nummer bereits vergeben", {
          description: "Bitte Backend prüfen: deliveryCounter-Konflikt (P2002). Cursor-Fix erforderlich.",
        });
      } else {
        toast.error("Fehler beim Erstellen des Lieferscheins");
      }
    }
  };

  const allSelected = selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Lieferschein erstellen
          </DialogTitle>
          <DialogDescription>
            Wählen Sie die Positionen aus Auftrag <strong>{orderNumber}</strong>, die in diesem
            Lieferschein enthalten sein sollen.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    ref={(el) => {
                      if (el) (el as any).indeterminate = someSelected;
                    }}
                  />
                </TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead className="text-right">Menge</TableHead>
                <TableHead className="text-right">Einheit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Keine Positionen vorhanden
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => toggleItem(item.id)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => toggleItem(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.unit || "Stk"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          {selectedIds.length} von {items.length} Positionen ausgewählt
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createDeliveryNote.isPending}>
            Abbrechen
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createDeliveryNote.isPending || selectedIds.length === 0}
          >
            {createDeliveryNote.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Truck className="h-4 w-4 mr-2" />
            )}
            Lieferschein erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
