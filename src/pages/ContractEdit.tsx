import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useContract, useUpdateContract } from "@/hooks/use-contracts";
import { useCustomers } from "@/hooks/use-customers";

export default function ContractEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contract, isLoading } = useContract(id);
  const updateContract = useUpdateContract();
  const { data: customersData } = useCustomers({ pageSize: 200 });
  const customers = customersData?.data || [];

  const [formData, setFormData] = useState({
    title: "", customerId: "", type: "", value: "",
    startDate: "", endDate: "", autoRenew: false,
    noticePeriodDays: "", description: "", status: "DRAFT",
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        title: contract.title || "",
        customerId: contract.customerId || "",
        type: contract.type || "",
        value: String(contract.value || ""),
        startDate: contract.startDate ? contract.startDate.split("T")[0] : "",
        endDate: contract.endDate ? contract.endDate.split("T")[0] : "",
        autoRenew: contract.autoRenew || false,
        noticePeriodDays: String(contract.noticePeriodDays || ""),
        description: contract.description || "",
        status: contract.status || "DRAFT",
      });
    }
  }, [contract]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateContract.mutateAsync({
        id,
        data: {
          title: formData.title,
          customerId: formData.customerId,
          type: formData.type,
          value: parseFloat(formData.value) || 0,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          autoRenew: formData.autoRenew,
          noticePeriodDays: parseInt(formData.noticePeriodDays) || undefined,
          description: formData.description || undefined,
          status: formData.status,
        },
      });
      toast.success("Vertrag aktualisiert");
      navigate(`/contracts/${id}`);
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!contract) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/contracts"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-display text-2xl font-bold">Vertrag nicht gefunden</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/contracts/${id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight">Vertrag bearbeiten</h1>
          <p className="text-muted-foreground">{contract.number} — {contract.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Vertragsdaten</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Titel *</Label>
                <Input value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Kunde *</Label>
                <Select value={formData.customerId} onValueChange={(v) => handleChange("customerId", v)}>
                  <SelectTrigger><SelectValue placeholder="Kunde wählen" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Vertragsart</Label>
                  <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                    <SelectTrigger><SelectValue placeholder="Typ wählen" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SERVICE">Service</SelectItem>
                      <SelectItem value="MAINTENANCE">Wartung</SelectItem>
                      <SelectItem value="LICENSE">Lizenz</SelectItem>
                      <SelectItem value="LEASE">Leasing</SelectItem>
                      <SelectItem value="OTHER">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Entwurf</SelectItem>
                      <SelectItem value="ACTIVE">Aktiv</SelectItem>
                      <SelectItem value="EXPIRED">Abgelaufen</SelectItem>
                      <SelectItem value="TERMINATED">Gekündigt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Vertragswert (CHF)</Label>
                <Input type="number" step="0.01" value={formData.value} onChange={(e) => handleChange("value", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Laufzeit</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Startdatum *</Label>
                  <Input type="date" value={formData.startDate} onChange={(e) => handleChange("startDate", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Enddatum</Label>
                  <Input type="date" value={formData.endDate} onChange={(e) => handleChange("endDate", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.autoRenew} onCheckedChange={(v) => handleChange("autoRenew", v)} />
                <Label>Automatische Verlängerung</Label>
              </div>
              <div className="space-y-2">
                <Label>Kündigungsfrist (Tage)</Label>
                <Input type="number" value={formData.noticePeriodDays} onChange={(e) => handleChange("noticePeriodDays", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/contracts/${id}`)} disabled={updateContract.isPending}>Abbrechen</Button>
          <Button type="submit" className="gap-2" disabled={updateContract.isPending}>
            {updateContract.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Änderungen speichern
          </Button>
        </div>
      </form>
    </div>
  );
}
