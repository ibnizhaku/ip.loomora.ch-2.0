import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSupplier, useUpdateSupplier } from "@/hooks/use-suppliers";

export default function SupplierEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useSupplier(id);
  const updateSupplier = useUpdateSupplier();
  const [formData, setFormData] = useState({
    name: "", company: "", email: "", phone: "", website: "",
    street: "", zip: "", city: "", country: "Schweiz",
    paymentTerms: "30", notes: "",
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        company: supplier.companyName || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        website: supplier.website || "",
        street: supplier.street || "",
        zip: supplier.zipCode || "",
        city: supplier.city || "",
        country: supplier.country || "Schweiz",
        paymentTerms: String(supplier.paymentTermDays || 30),
        notes: supplier.notes || "",
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateSupplier.mutateAsync({
        id,
        data: {
          name: formData.name || formData.company,
          companyName: formData.company,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          website: formData.website || undefined,
          street: formData.street || undefined,
          zipCode: formData.zip || undefined,
          city: formData.city || undefined,
          country: formData.country || undefined,
          paymentTermDays: parseInt(formData.paymentTerms) || 30,
          notes: formData.notes || undefined,
        },
      });
      toast.success("Lieferant erfolgreich aktualisiert");
      navigate(`/suppliers/${id}`);
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/suppliers"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-display text-2xl font-bold">Lieferant nicht gefunden</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/suppliers/${id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight">Lieferant bearbeiten</h1>
          <p className="text-muted-foreground">{supplier.companyName || supplier.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Kontaktdaten</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Ansprechpartner</Label>
                <Input value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Firma *</Label>
                <Input value={formData.company} onChange={(e) => handleChange("company", e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={formData.website} onChange={(e) => handleChange("website", e.target.value)} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Adresse & Details</h3>
            <div className="space-y-2">
              <Label>Strasse</Label>
              <Input value={formData.street} onChange={(e) => handleChange("street", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>PLZ</Label>
                <Input value={formData.zip} onChange={(e) => handleChange("zip", e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Ort</Label>
                <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Land</Label>
              <Select value={formData.country} onValueChange={(v) => handleChange("country", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Schweiz">Schweiz</SelectItem>
                  <SelectItem value="Deutschland">Deutschland</SelectItem>
                  <SelectItem value="Österreich">Österreich</SelectItem>
                  <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zahlungsziel (Tage)</Label>
              <Select value={formData.paymentTerms} onValueChange={(v) => handleChange("paymentTerms", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Tage</SelectItem>
                  <SelectItem value="14">14 Tage</SelectItem>
                  <SelectItem value="30">30 Tage</SelectItem>
                  <SelectItem value="45">45 Tage</SelectItem>
                  <SelectItem value="60">60 Tage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold">Notizen</h3>
          <Textarea value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={4} />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/suppliers/${id}`)} disabled={updateSupplier.isPending}>Abbrechen</Button>
          <Button type="submit" className="gap-2" disabled={updateSupplier.isPending}>
            {updateSupplier.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Änderungen speichern
          </Button>
        </div>
      </form>
    </div>
  );
}
