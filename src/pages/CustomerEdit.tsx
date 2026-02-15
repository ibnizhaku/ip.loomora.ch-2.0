import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { useCustomer, useUpdateCustomer } from "@/hooks/use-customers";

export default function CustomerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading: customerLoading } = useCustomer(id);
  const updateCustomer = useUpdateCustomer();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    mobile: "",
    website: "",
    street: "",
    zip: "",
    city: "",
    country: "Schweiz",
    notes: "",
    paymentTermDays: "30",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        company: (customer as any).companyName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        mobile: (customer as any).mobile || "",
        website: (customer as any).website || "",
        street: (customer as any).street || "",
        zip: (customer as any).zipCode || "",
        city: (customer as any).city || "",
        country: (customer as any).country || "Schweiz",
        notes: (customer as any).notes || "",
        paymentTermDays: String((customer as any).paymentTermDays || 30),
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateCustomer.mutateAsync({
        id,
        data: {
          name: formData.name,
          companyName: formData.company,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          mobile: formData.mobile || undefined,
          website: formData.website || undefined,
          street: formData.street || undefined,
          zipCode: formData.zip || undefined,
          city: formData.city || undefined,
          country: formData.country || undefined,
          notes: formData.notes || undefined,
          paymentTermDays: parseInt(formData.paymentTermDays) || 30,
        },
      });
      toast.success("Kunde erfolgreich aktualisiert");
      navigate(`/customers/${id}`);
    } catch (error) {
      toast.error("Fehler beim Aktualisieren des Kunden");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-display text-2xl font-bold">Kunde nicht gefunden</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/customers/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Kunde bearbeiten
          </h1>
          <p className="text-muted-foreground">
            {customer.name} — {(customer as any).companyName || ""}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact Information */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Kontaktdaten</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Firma *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold">Adresse</h3>

            <div className="space-y-2">
              <Label htmlFor="street">Strasse</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="zip">PLZ</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleChange("zip", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="city">Ort</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => handleChange("country", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Schweiz">Schweiz</SelectItem>
                  <SelectItem value="Deutschland">Deutschland</SelectItem>
                  <SelectItem value="Österreich">Österreich</SelectItem>
                  <SelectItem value="Liechtenstein">Liechtenstein</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTermDays">Zahlungsziel (Tage)</Label>
              <Input
                id="paymentTermDays"
                type="number"
                value={formData.paymentTermDays}
                onChange={(e) => handleChange("paymentTermDays", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold">Notizen</h3>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Zusätzliche Informationen zum Kunden..."
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/customers/${id}`)} disabled={updateCustomer.isPending}>
            Abbrechen
          </Button>
          <Button type="submit" className="gap-2" disabled={updateCustomer.isPending}>
            {updateCustomer.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Änderungen speichern
          </Button>
        </div>
      </form>
    </div>
  );
}
