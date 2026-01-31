import { useState } from "react";
import {
  CreditCard,
  X,
  Calendar,
  Euro,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceTotal: number;
  alreadyPaid: number;
  customerName: string;
  onPaymentSaved?: (payment: PaymentData) => void;
}

interface PaymentData {
  amount: number;
  date: string;
  method: string;
  reference: string;
  notes: string;
}

export function PaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceTotal,
  alreadyPaid,
  customerName,
  onPaymentSaved,
}: PaymentDialogProps) {
  const outstanding = invoiceTotal - alreadyPaid;
  const [amount, setAmount] = useState(outstanding.toString());
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    const payment: PaymentData = {
      amount: parseFloat(amount) || 0,
      date,
      method,
      reference,
      notes,
    };
    onPaymentSaved?.(payment);
    onOpenChange(false);
    // Reset form
    setAmount(outstanding.toString());
    setReference("");
    setNotes("");
  };

  const paymentMethods = [
    { value: "bank_transfer", label: "Überweisung" },
    { value: "cash", label: "Barzahlung" },
    { value: "credit_card", label: "Kreditkarte" },
    { value: "debit_card", label: "EC-Karte" },
    { value: "paypal", label: "PayPal" },
    { value: "other", label: "Sonstige" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Zahlung erfassen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Info */}
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rechnung</span>
              <span className="font-medium">{invoiceId}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Kunde</span>
              <span className="font-medium">{customerName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gesamtbetrag</span>
              <span className="font-medium">€{invoiceTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bereits bezahlt</span>
              <span className="font-medium text-success">€{alreadyPaid.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold border-t pt-2">
              <span>Offener Betrag</span>
              <span className="text-warning">€{outstanding.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Zahlungsbetrag</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                placeholder="0.00"
              />
            </div>
            {parseFloat(amount) > outstanding && (
              <p className="text-xs text-warning">
                Betrag übersteigt den offenen Betrag
              </p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Zahlungsdatum</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Zahlungsart</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem key={pm.value} value={pm.value}>
                    {pm.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reference */}
          <div className="space-y-2">
            <Label htmlFor="reference">Referenz / Transaktionsnummer</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="z.B. Überweisungsreferenz"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Zusätzliche Informationen..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={!amount || parseFloat(amount) <= 0}>
            <CreditCard className="h-4 w-4 mr-2" />
            Zahlung speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
