import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  status: "completed" | "pending";
}

interface AddTransactionDialogProps {
  onTransactionAdded: (transaction: Transaction) => void;
  trigger?: React.ReactNode;
}

const incomeCategories = [
  "Einnahmen",
  "Projekteinnahmen",
  "Serviceeinnahmen",
  "Sonstige Einnahmen",
];

const expenseCategories = [
  "Betriebskosten",
  "Personal",
  "Material",
  "Miete & Nebenkosten",
  "Marketing",
  "IT & Software",
  "Fahrzeugkosten",
  "Sonstige Ausgaben",
];

export function AddTransactionDialog({ onTransactionAdded, trigger }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("income");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const resetForm = () => {
    setType("income");
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(new Date());
    setNotes("");
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error("Bitte geben Sie eine Beschreibung ein");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Bitte geben Sie einen gültigen Betrag ein");
      return;
    }
    if (!category) {
      toast.error("Bitte wählen Sie eine Kategorie");
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: description.trim(),
      category,
      amount: parseFloat(amount),
      type,
      date: format(date, "dd.MM.yyyy"),
      status: "completed",
    };

    onTransactionAdded(newTransaction);
    toast.success(
      type === "income" ? "Einnahme hinzugefügt" : "Ausgabe hinzugefügt",
      { description: `CHF ${parseFloat(amount).toLocaleString("de-CH")}` }
    );
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Transaktion hinzufügen
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Transaktion</DialogTitle>
          <DialogDescription>
            Erfassen Sie eine neue Einnahme oder Ausgabe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                type === "income"
                  ? "border-success bg-success/10 text-success"
                  : "border-border hover:border-success/50"
              )}
              onClick={() => {
                setType("income");
                setCategory("");
              }}
            >
              <ArrowDownRight className="h-5 w-5" />
              <span className="font-medium">Einnahme</span>
            </button>
            <button
              type="button"
              className={cn(
                "flex items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                type === "expense"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border hover:border-destructive/50"
              )}
              onClick={() => {
                setType("expense");
                setCategory("");
              }}
            >
              <ArrowUpRight className="h-5 w-5" />
              <span className="font-medium">Ausgabe</span>
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung *</Label>
            <Input
              id="description"
              placeholder="z.B. Zahlung von Kunde XY"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Betrag (CHF) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                CHF
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-12"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategorie *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Datum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(date, "dd. MMMM yyyy", { locale: de })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Informationen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            className={cn(
              type === "income" && "bg-success hover:bg-success/90",
              type === "expense" && "bg-destructive hover:bg-destructive/90"
            )}
          >
            {type === "income" ? "Einnahme" : "Ausgabe"} erfassen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
