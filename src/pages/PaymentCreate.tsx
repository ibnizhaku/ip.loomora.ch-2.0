import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreatePayment } from "@/hooks/use-payments";

export default function PaymentCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createPayment = useCreatePayment();
  const [formData, setFormData] = useState({
    type: "OUTGOING" as "INCOMING" | "OUTGOING",
    method: "BANK_TRANSFER" as string,
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
    reference: "",
    notes: "",
    customerId: "",
    supplierId: "",
    bankAccountId: "",
    invoiceId: "",
    purchaseInvoiceId: "",
  });

  useEffect(() => {
    const invoiceId = searchParams.get("invoiceId");
    const purchaseInvoiceId = searchParams.get("purchaseInvoiceId");
    if (invoiceId) setFormData((prev) => ({ ...prev, invoiceId, type: "INCOMING" as const }));
    if (purchaseInvoiceId) setFormData((prev) => ({ ...prev, purchaseInvoiceId, type: "OUTGOING" as const }));
  }, [searchParams]);

  const { data: customersData } = useQuery({
    queryKey: ["/customers"],
    queryFn: () => api.get<any>("/customers?pageSize=200"),
  });
  const { data: suppliersData } = useQuery({
    queryKey: ["/suppliers"],
    queryFn: () => api.get<any>("/suppliers?pageSize=200"),
  });
  const { data: bankAccountsData } = useQuery({
    queryKey: ["/bank-accounts"],
    queryFn: () => api.get<any>("/bank-accounts"),
  });
  const { data: invoicesData } = useQuery({
    queryKey: ["/invoices", "payment-create"],
    queryFn: () => api.get<any>("/invoices?pageSize=200"),
  });
  const { data: purchaseInvoicesData } = useQuery({
    queryKey: ["/purchase-invoices", "payment-create"],
    queryFn: () => api.get<any>("/purchase-invoices?pageSize=200"),
  });

  const customers = customersData?.data || [];
  const suppliers = suppliersData?.data || [];
  const bankAccounts = Array.isArray(bankAccountsData) ? bankAccountsData : (bankAccountsData?.data || []);
  const invoices = (invoicesData as any)?.data || [];
  const purchaseInvoices = (purchaseInvoicesData as any)?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      toast.error("Bitte geben Sie einen gültigen Betrag ein");
      return;
    }

    try {
      await createPayment.mutateAsync({
        type: formData.type,
        method: formData.method as any,
        amount,
        paymentDate: formData.paymentDate,
        reference: formData.reference.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        customerId: formData.customerId || undefined,
        supplierId: formData.supplierId || undefined,
        bankAccountId: formData.bankAccountId || undefined,
        invoiceId: formData.invoiceId || undefined,
        purchaseInvoiceId: formData.purchaseInvoiceId || undefined,
      });
      toast.success("Zahlung erstellt");
      navigate("/sepa-payments");
    } catch (err: any) {
      toast.error(err?.message || "Fehler beim Erstellen");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/sepa-payments")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Neue Zahlung</h1>
          <p className="text-muted-foreground">Überweisung oder Lastschrift erfassen</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zahlungsdaten</CardTitle>
                <CardDescription>Art und Betrag der Zahlung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Typ *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v: "INCOMING" | "OUTGOING") => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OUTGOING">Ausgehend (Überweisung)</SelectItem>
                        <SelectItem value="INCOMING">Eingehend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Zahlungsart *</Label>
                    <Select
                      value={formData.method}
                      onValueChange={(v) => setFormData({ ...formData, method: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANK_TRANSFER">Überweisung</SelectItem>
                        <SelectItem value="SEPA">SEPA</SelectItem>
                        <SelectItem value="QR_INVOICE">QR-Rechnung</SelectItem>
                        <SelectItem value="TWINT">Twint</SelectItem>
                        <SelectItem value="CASH">Bargeld</SelectItem>
                        <SelectItem value="CREDIT_CARD">Kreditkarte</SelectItem>
                        <SelectItem value="OTHER">Sonstige</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Betrag (CHF) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Zahlungsdatum</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Referenz / ESR-Nummer</Label>
                  <Input
                    id="reference"
                    placeholder="z.B. Rechnungsnummer"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Verwendungszweck</Label>
                  <Textarea
                    id="notes"
                    placeholder="Verwendungszweck"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verknüpfung</CardTitle>
                <CardDescription>Kunde, Lieferant, Rechnung (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bankkonto</Label>
                  <Select
                    value={formData.bankAccountId || "__none__"}
                    onValueChange={(v) => setFormData({ ...formData, bankAccountId: v === "__none__" ? "" : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">—</SelectItem>
                      {bankAccounts.map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} ({b.iban})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.type === "OUTGOING" && (
                  <>
                    <div className="space-y-2">
                      <Label>Einkaufsrechnung</Label>
                      <Select
                        value={formData.purchaseInvoiceId || "__none__"}
                        onValueChange={(v) => setFormData({ ...formData, purchaseInvoiceId: v === "__none__" ? "" : v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Rechnung zuordnen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">—</SelectItem>
                          {purchaseInvoices.map((inv: any) => (
                            <SelectItem key={inv.id} value={inv.id}>
                              {inv.number} – {inv.supplier?.name || "—"} – CHF {(inv.totalAmount ?? 0).toLocaleString("de-CH")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Lieferant</Label>
                      <Select
                        value={formData.supplierId || "__none__"}
                        onValueChange={(v) => setFormData({ ...formData, supplierId: v === "__none__" ? "" : v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">—</SelectItem>
                          {suppliers.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.companyName || s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                {formData.type === "INCOMING" && (
                  <>
                    <div className="space-y-2">
                      <Label>Rechnung (Verkauf)</Label>
                      <Select
                        value={formData.invoiceId || "__none__"}
                        onValueChange={(v) => setFormData({ ...formData, invoiceId: v === "__none__" ? "" : v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Rechnung zuordnen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">—</SelectItem>
                          {invoices.map((inv: any) => (
                            <SelectItem key={inv.id} value={inv.id}>
                              {inv.number} – {inv.customer?.companyName || inv.customer?.name || "—"} – CHF {(inv.totalAmount ?? 0).toLocaleString("de-CH")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Kunde</Label>
                      <Select
                        value={formData.customerId || "__none__"}
                        onValueChange={(v) => setFormData({ ...formData, customerId: v === "__none__" ? "" : v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Optional wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">—</SelectItem>
                          {customers.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.companyName || c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={createPayment.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Zahlung erfassen
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/sepa-payments")}>
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
