import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  FileText,
  Upload,
  UserPlus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCompany, useUpdateCompany } from "@/hooks/use-company";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useCompanyTeam, useAddTeamMember, useRemoveTeamMember } from "@/hooks/use-company-team";
import { useAuth } from "@/contexts/AuthContext";

const roleOptions = [
  "CEO", "CTO", "CFO", "COO", 
  "Head of Design", "Head of Engineering", "Head of Sales", "Head of Marketing",
  "Teamleiter", "Projektmanager", "Abteilungsleiter"
];

interface FormData {
  name: string;
  legalName: string;
  street: string;
  zipCode: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  vatNumber: string;
  iban: string;
  bic: string;
  bankName: string;
  description: string;
}

const emptyForm: FormData = {
  name: "",
  legalName: "",
  street: "",
  zipCode: "",
  city: "",
  phone: "",
  email: "",
  website: "",
  vatNumber: "",
  iban: "",
  bic: "",
  bankName: "",
  description: "",
};

export default function Company() {
  const { data: company, isLoading, error } = useCompany();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const updateCompany = useUpdateCompany();
  const { updateActiveCompanyName } = useAuth();

  const { data: teamMembers = [], isLoading: teamLoading } = useCompanyTeam();
  const addTeamMember = useAddTeamMember();
  const removeTeamMember = useRemoveTeamMember();

  const [form, setForm] = useState<FormData>(emptyForm);
  const [isDirty, setIsDirty] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "" });

  // Sync form with backend data
  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || "",
        legalName: company.legalName || "",
        street: company.street || "",
        zipCode: company.zipCode || "",
        city: company.city || "",
        phone: company.phone || "",
        email: company.email || "",
        website: company.website || "",
        vatNumber: company.vatNumber || "",
        iban: company.iban || "",
        bic: company.bic || "",
        bankName: company.bankName || "",
        description: "",
      });
      setIsDirty(false);
    }
  }, [company]);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateCompany.mutateAsync({
        name: form.name || undefined,
        legalName: form.legalName || undefined,
        street: form.street || undefined,
        zipCode: form.zipCode || undefined,
        city: form.city || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        website: form.website || undefined,
        vatNumber: form.vatNumber || undefined,
        iban: form.iban || undefined,
        bic: form.bic || undefined,
        bankName: form.bankName || undefined,
      });
      if (form.name) {
        updateActiveCompanyName(form.name);
      }
      toast.success("Unternehmensdaten gespeichert");
      setIsDirty(false);
    } catch (err: any) {
      toast.error("Fehler beim Speichern", {
        description: err?.message || "Bitte versuchen Sie es erneut",
      });
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.role) {
      toast.error("Bitte füllen Sie alle Felder aus");
      return;
    }

    try {
      await addTeamMember.mutateAsync({ name: newMember.name, role: newMember.role });
      toast.success("Mitglied hinzugefügt", {
        description: `${newMember.name} wurde dem Führungsteam hinzugefügt`
      });
      setShowAddDialog(false);
      setNewMember({ name: "", role: "" });
    } catch (err: any) {
      toast.error("Fehler beim Hinzufügen", { description: err?.message });
    }
  };

  const handleRemoveMember = async (id: string, name: string) => {
    try {
      await removeTeamMember.mutateAsync(id);
      toast.info(`${name} wurde entfernt`);
    } catch (err: any) {
      toast.error("Fehler beim Entfernen", { description: err?.message });
    }
  };

  // Dynamic stats from backend
  const companyStats = [
    { label: "Mitarbeiter", value: statsLoading ? "—" : "—", icon: Users },
    { label: "Gegründet", value: company?.createdAt ? new Date(company.createdAt).getFullYear().toString() : "—", icon: Calendar },
    { label: "Projekte", value: statsLoading ? "—" : String(stats?.activeProjects ?? "—"), icon: FileText },
    { label: "Kunden", value: statsLoading ? "—" : String(stats?.customerCount ?? "—"), icon: Building2 },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Unternehmensprofil
            </h1>
            <p className="text-muted-foreground">
              Verwalten Sie Ihre Unternehmensinformationen
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Unternehmensprofil
            </h1>
            <p className="text-muted-foreground">
              Verwalten Sie Ihre Unternehmensinformationen
            </p>
          </div>
        </div>
        <div className="text-center py-24 text-muted-foreground">
          <p>Fehler beim Laden der Unternehmensdaten.</p>
        </div>
      </div>
    );
  }

  // Logo initial from company name
  const logoInitial = (company?.name || "?")[0].toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Unternehmensprofil
          </h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Unternehmensinformationen
          </p>
        </div>
        {isDirty && (
          <Button onClick={handleSave} disabled={updateCompany.isPending}>
            {updateCompany.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Speichern
          </Button>
        )}
      </div>

      {/* Company Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-3xl font-bold">
              {logoInitial}
            </div>
            <button className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary border border-border hover:bg-muted transition-colors">
              <Upload className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">{company?.name || "—"}</h2>
            <p className="text-muted-foreground">
              {company?.legalName || "Unternehmensbeschreibung nicht hinterlegt"}
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {company?.city ? `${company.city}, ${company.country || "CH"}` : "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                {company?.website || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {company?.email || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {companyStats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-xl border border-border bg-card p-5 animate-fade-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Details */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">
            Unternehmensdaten
          </h3>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Firmenname</Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rechtsform / Juristischer Name</Label>
                <Input
                  value={form.legalName}
                  onChange={(e) => handleChange("legalName", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={form.street}
                onChange={(e) => handleChange("street", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>PLZ</Label>
                <Input
                  value={form.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Stadt</Label>
                <Input
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Legal Info */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display font-semibold text-lg mb-4">
            Rechtliche Informationen
          </h3>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>USt-IdNr. / UID</Label>
                <Input
                  value={form.vatNumber}
                  onChange={(e) => handleChange("vatNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Bankname</Label>
                <Input
                  value={form.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input
                  value={form.iban}
                  onChange={(e) => handleChange("iban", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>BIC</Label>
                <Input
                  value={form.bic}
                  onChange={(e) => handleChange("bic", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Unternehmensbeschreibung</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Beschreibung Ihres Unternehmens..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Team */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">Führungsteam</h3>
          <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Mitglied hinzufügen
          </Button>
        </div>

        {teamLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Noch keine Teammitglieder hinzugefügt.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => {
              const initials = member.name.split(" ").map(n => n[0]).join("").toUpperCase();
              return (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-all animate-fade-in group relative"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 h-7 w-7 text-destructive"
                    onClick={() => handleRemoveMember(member.id, member.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mitglied hinzufügen</DialogTitle>
            <DialogDescription>
              Fügen Sie ein neues Mitglied zum Führungsteam hinzu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="memberName">Name *</Label>
              <Input
                id="memberName"
                placeholder="Max Mustermann"
                value={newMember.name}
                onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberRole">Rolle / Position *</Label>
              <Select
                value={newMember.role}
                onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Position auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddMember} disabled={addTeamMember.isPending}>
              {addTeamMember.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
