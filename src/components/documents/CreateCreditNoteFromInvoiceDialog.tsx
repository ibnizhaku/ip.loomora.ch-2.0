import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, ArrowLeft, FileText, Loader2, CheckSquare, Square } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useInvoices, useInvoice } from "@/hooks/use-invoices";
import { useCreateCreditNoteFromInvoice } from "@/hooks/use-credit-notes";

const REASON_OPTIONS = [
  { value: "RETURN", label: "Warenrückgabe" },
  { value: "PRICE_ADJUSTMENT", label: "Preisanpassung" },
  { value: "QUANTITY_DIFFERENCE", label: "Mengendifferenz" },
  { value: "QUALITY_ISSUE", label: "Qualitätsmangel" },
  { value: "GOODWILL", label: "Kulanz" },
  { value: "OTHER", label: "Sonstiges" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "select-invoice" | "select-positions";

interface SelectedItem {
  invoiceItemId: string;
  quantity: number;
  maxQuantity: number;
  description: string;
  unitPrice: number;
  unit: string;
  vatRate: number;
}

export function CreateCreditNoteFromInvoiceDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const createFromInvoice = useCreateCreditNoteFromInvoice();

  const [step, setStep] = useState<Step>("select-invoice");
  const [search, setSearch] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [mode, setMode] = useState<"all" | "partial">("all");
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({});
  const [reason, setReason] = useState("");
  const [reasonText, setReasonText] = useState("");

  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({
    search: search || undefined,
    pageSize: 20,
    status: undefined,
  });

  const { data: invoiceDetail, isLoading: detailLoading } = useInvoice(
    step === "select-positions" ? selectedInvoiceId : undefined
  );

  const invoices = invoicesData?.data || [];

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    setSelectedItems({});
    setMode("all");
    setStep("select-positions");
  };

  const handleBack = () => {
    setStep("select-invoice");
    setSelectedInvoiceId("");
    setSelectedItems({});
    setMode("all");
    setReason("");
    setReasonText("");
  };

  const handleClose = () => {
    setStep("select-invoice");
    setSelectedInvoiceId("");
    setSearch("");
    setSelectedItems({});
    setMode("all");
    setReason("");
    setReasonText("");
    onOpenChange(false);
  };

  const toggleItem = (item: { id: string; description: string; quantity: number; unitPrice: number; unit: string; vatRate: number }) => {
    setSelectedItems((prev) => {
      if (prev[item.id]) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return {
        ...prev,
        [item.id]: {
          invoiceItemId: item.id,
          quantity: item.quantity,
          maxQuantity: item.quantity,
          description: item.description,
          unitPrice: item.unitPrice,
          unit: item.unit,
          vatRate: item.vatRate,
        },
      };
    });
  };

  const updateQuantity = (itemId: string, qty: number) => {
    setSelectedItems((prev) => {
      if (!prev[itemId]) return prev;
      return {
        ...prev,
        [itemId]: { ...prev[itemId], quantity: Math.min(Math.max(0.001, qty), prev[itemId].maxQuantity) },
      };
    });
  };

  const toggleAll = () => {
    if (!invoiceDetail?.items) return;
    const allIds = Object.fromEntries(
      invoiceDetail.items.map((item: any) => [
        item.id,
        {
          invoiceItemId: item.id,
          quantity: Number(item.quantity),
          maxQuantity: Number(item.quantity),
          description: item.description || "",
          unitPrice: Number(item.unitPrice),
          unit: item.unit || "Stk",
          vatRate: Number(item.vatRate) || 8.1,
        },
      ])
    );
    const allSelected = (invoiceDetail.items as any[]).every((i) => selectedItems[i.id]);
    setSelectedItems(allSelected ? {} : allIds);
  };

  const calcTotal = (items: SelectedItem[]) =>
    items.reduce((s, i) => s + i.quantity * i.unitPrice * (1 + i.vatRate / 100), 0);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Bitte einen Gutschriftsgrund auswählen");
      return;
    }

    const itemsPayload =
      mode === "partial"
        ? Object.values(selectedItems).map((i) => ({
            invoiceItemId: i.invoiceItemId,
            quantity: i.quantity,
          }))
        : undefined;

    if (mode === "partial" && (!itemsPayload || itemsPayload.length === 0)) {
      toast.error("Bitte mindestens eine Position auswählen");
      return;
    }

    try {
      const result = await createFromInvoice.mutateAsync({
        invoiceId: selectedInvoiceId,
        reason,
        reasonText: reasonText || undefined,
        items: itemsPayload,
      });
      toast.success(`Gutschrift ${(result as any).number} wurde erstellt`);
      handleClose();
      navigate(`/credit-notes/${(result as any).id}`);
    } catch (err: any) {
      toast.error(err?.message || "Fehler beim Erstellen der Gutschrift");
    }
  };

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);
  const partialItems = Object.values(selectedItems);
  const partialTotal = calcTotal(partialItems);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            Gutschrift aus Rechnung
          </DialogTitle>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3">
            <div className={`flex items-center gap-1.5 text-sm font-medium ${step === "select-invoice" ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${step === "select-invoice" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>1</span>
              Rechnung wählen
            </div>
            <div className="h-px w-8 bg-border" />
            <div className={`flex items-center gap-1.5 text-sm font-medium ${step === "select-positions" ? "text-primary" : "text-muted-foreground"}`}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${step === "select-positions" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>2</span>
              Positionen & Grund
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {/* STEP 1: Rechnung auswählen */}
          {step === "select-invoice" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechnungsnummer oder Kunde suchen..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {invoicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Keine Rechnungen gefunden
                </div>
              ) : (
                <div className="space-y-1.5">
                  {invoices.map((inv) => (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => handleSelectInvoice(inv.id)}
                      className="w-full flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left hover:border-primary/40 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted shrink-0">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{inv.number}</p>
                          <p className="text-xs text-muted-foreground">
                            {inv.customer?.companyName || inv.customer?.name || "–"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold">CHF {Number(inv.total || 0).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString("de-CH") : "–"}
                          </p>
                        </div>
                        <Badge
                          className={
                            inv.status === "PAID"
                              ? "bg-success/10 text-success"
                              : inv.status === "SENT"
                              ? "bg-blue-500/10 text-blue-600"
                              : inv.status === "OVERDUE"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                          }
                          variant="outline"
                        >
                          {inv.status === "PAID" ? "Bezahlt" : inv.status === "SENT" ? "Versendet" : inv.status === "OVERDUE" ? "Überfällig" : inv.status === "DRAFT" ? "Entwurf" : inv.status}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Positionen & Grund */}
          {step === "select-positions" && (
            <div className="space-y-5">
              {/* Selected invoice info */}
              {selectedInvoice && (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{selectedInvoice.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedInvoice.customer?.companyName || selectedInvoice.customer?.name || "–"}
                      {selectedInvoice.project && ` · ${(selectedInvoice as any).project?.name}`}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">CHF {Number(selectedInvoice.total || 0).toFixed(2)}</p>
                </div>
              )}

              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setMode("all"); setSelectedItems({}); }}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    mode === "all"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  Gesamte Gutschrift
                  <p className="text-xs font-normal mt-0.5 opacity-75">Alle Positionen übernehmen</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("partial")}
                  className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    mode === "partial"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  Einzelne Positionen
                  <p className="text-xs font-normal mt-0.5 opacity-75">Positionen & Mengen auswählen</p>
                </button>
              </div>

              {/* Positions list */}
              {detailLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (invoiceDetail?.items || []).length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        {mode === "partial" && (
                          <TableHead className="w-10 pl-4">
                            <button type="button" onClick={toggleAll} className="text-muted-foreground hover:text-foreground">
                              {(invoiceDetail?.items as any[])?.every((i) => selectedItems[i.id]) ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </TableHead>
                        )}
                        <TableHead>Beschreibung</TableHead>
                        <TableHead className="text-right">Menge</TableHead>
                        <TableHead>Einheit</TableHead>
                        <TableHead className="text-right">Einzelpreis</TableHead>
                        <TableHead className="text-right">Gesamt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(invoiceDetail?.items as any[] || []).map((item: any) => {
                        const isSelected = !!selectedItems[item.id];
                        const selItem = selectedItems[item.id];
                        const lineTotal = (selItem?.quantity ?? Number(item.quantity)) * Number(item.unitPrice);

                        return (
                          <TableRow
                            key={item.id}
                            className={mode === "partial" ? (isSelected ? "bg-primary/3" : "opacity-60") : ""}
                            onClick={mode === "partial" ? () => toggleItem({
                              id: item.id,
                              description: item.description || "",
                              quantity: Number(item.quantity),
                              unitPrice: Number(item.unitPrice),
                              unit: item.unit || "Stk",
                              vatRate: Number(item.vatRate) || 8.1,
                            }) : undefined}
                            style={mode === "partial" ? { cursor: "pointer" } : undefined}
                          >
                            {mode === "partial" && (
                              <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleItem({
                                    id: item.id,
                                    description: item.description || "",
                                    quantity: Number(item.quantity),
                                    unitPrice: Number(item.unitPrice),
                                    unit: item.unit || "Stk",
                                    vatRate: Number(item.vatRate) || 8.1,
                                  })}
                                />
                              </TableCell>
                            )}
                            <TableCell className="font-medium text-sm">{item.description || "–"}</TableCell>
                            <TableCell className="text-right text-sm" onClick={(e) => e.stopPropagation()}>
                              {mode === "partial" && isSelected ? (
                                <Input
                                  type="number"
                                  min={0.001}
                                  max={Number(item.quantity)}
                                  step={0.001}
                                  value={selItem.quantity}
                                  onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                                  className="w-20 h-7 text-right text-sm ml-auto"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                Number(item.quantity)
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{item.unit || "Stk"}</TableCell>
                            <TableCell className="text-right text-sm">CHF {Number(item.unitPrice).toFixed(2)}</TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              CHF {lineTotal.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              {/* Partial total */}
              {mode === "partial" && partialItems.length > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2 text-sm">
                  <span className="text-muted-foreground">{partialItems.length} Position(en) ausgewählt</span>
                  <span className="font-semibold text-destructive">-CHF {partialTotal.toFixed(2)}</span>
                </div>
              )}

              <Separator />

              {/* Reason */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Gutschriftsgrund <span className="text-destructive">*</span></Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Grund auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REASON_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {reason && (
                  <Input
                    placeholder="Zusätzliche Beschreibung (optional)"
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={step === "select-invoice" ? handleClose : handleBack}
          >
            {step === "select-invoice" ? (
              "Abbrechen"
            ) : (
              <><ArrowLeft className="h-4 w-4 mr-1.5" />Zurück</>
            )}
          </Button>

          {step === "select-positions" && (
            <Button
              onClick={handleSubmit}
              disabled={createFromInvoice.isPending || !reason}
            >
              {createFromInvoice.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Gutschrift erstellen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
