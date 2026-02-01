import { useState } from "react";
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

const companyStats = [
  { label: "Mitarbeiter", value: "24", icon: Users },
  { label: "Gegründet", value: "2020", icon: Calendar },
  { label: "Projekte", value: "156", icon: FileText },
  { label: "Kunden", value: "89", icon: Building2 },
];

const initialTeamMembers = [
  { id: "1", name: "Max Keller", role: "CEO", initials: "MK" },
  { id: "2", name: "Anna Schmidt", role: "CTO", initials: "AS" },
  { id: "3", name: "Thomas Müller", role: "CFO", initials: "TM" },
  { id: "4", name: "Lisa Weber", role: "Head of Design", initials: "LW" },
];

const roleOptions = [
  "CEO", "CTO", "CFO", "COO", 
  "Head of Design", "Head of Engineering", "Head of Sales", "Head of Marketing",
  "Teamleiter", "Projektmanager", "Abteilungsleiter"
];

export default function Company() {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "" });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.role) {
      toast.error("Bitte füllen Sie alle Felder aus");
      return;
    }

    const initials = newMember.name.split(" ").map(n => n[0]).join("").toUpperCase();
    const newId = Date.now().toString();
    
    setTeamMembers(prev => [...prev, {
      id: newId,
      name: newMember.name,
      role: newMember.role,
      initials
    }]);

    toast.success("Mitglied hinzugefügt", {
      description: `${newMember.name} wurde dem Führungsteam hinzugefügt`
    });
    
    setShowAddDialog(false);
    setNewMember({ name: "", role: "" });
  };

  const handleRemoveMember = (id: string, name: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    toast.info(`${name} wurde entfernt`);
  };

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
      </div>

      {/* Company Header Card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-3xl font-bold">
              L
            </div>
            <button className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary border border-border hover:bg-muted transition-colors">
              <Upload className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold">Loomora GmbH</h2>
            <p className="text-muted-foreground">
              Innovative Softwarelösungen für moderne Unternehmen
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                München, Deutschland
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                www.loomora.de
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                info@loomora.de
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
                <Input defaultValue="Loomora GmbH" />
              </div>
              <div className="space-y-2">
                <Label>Rechtsform</Label>
                <Input defaultValue="GmbH" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input defaultValue="Maximilianstraße 35a" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>PLZ</Label>
                <Input defaultValue="80539" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Stadt</Label>
                <Input defaultValue="München" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input defaultValue="+49 89 12345678" />
              </div>
              <div className="space-y-2">
                <Label>E-Mail</Label>
                <Input defaultValue="info@loomora.de" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input defaultValue="https://www.loomora.de" />
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
                <Label>Handelsregister</Label>
                <Input defaultValue="HRB 123456" />
              </div>
              <div className="space-y-2">
                <Label>Registergericht</Label>
                <Input defaultValue="München" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>USt-IdNr.</Label>
                <Input defaultValue="DE123456789" />
              </div>
              <div className="space-y-2">
                <Label>Steuernummer</Label>
                <Input defaultValue="143/123/12345" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Geschäftsführer</Label>
              <Input defaultValue="Max Keller, Anna Schmidt" />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Unternehmensbeschreibung</Label>
              <Textarea
                rows={4}
                defaultValue="Loomora GmbH ist ein führender Anbieter von Unternehmenssoftware. Wir entwickeln maßgeschneiderte Lösungen für Projektmanagement, Zeiterfassung und Ressourcenplanung."
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-all animate-fade-in group relative"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {member.initials}
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
          ))}
        </div>
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
            <Button onClick={handleAddMember}>
              <UserPlus className="mr-2 h-4 w-4" />
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
