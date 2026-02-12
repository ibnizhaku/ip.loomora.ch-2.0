import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateUser } from "@/hooks/use-users";

export default function UserCreate() {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "user",
    createEmployee: false,
    position: "",
    departmentId: "",
    hireDate: "",
  });

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email) return;

    createUser.mutate(
      {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        role: form.role,
        createEmployee: form.createEmployee,
        position: form.createEmployee ? form.position || undefined : undefined,
        departmentId: form.createEmployee ? form.departmentId || undefined : undefined,
        hireDate: form.createEmployee ? form.hireDate || undefined : undefined,
      },
      { onSuccess: () => navigate("/users") }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">Neuer Benutzer</h1>
          <p className="text-muted-foreground">Erstellen Sie einen neuen Benutzer</p>
        </div>
        <Button onClick={handleSubmit} disabled={createUser.isPending || !form.firstName || !form.lastName || !form.email}>
          <Save className="mr-2 h-4 w-4" />
          {createUser.isPending ? "Wird erstellt..." : "Erstellen"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Benutzerdaten</CardTitle>
            <CardDescription>Grundlegende Informationen zum Benutzer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname *</Label>
                <Input
                  id="firstName"
                  placeholder="Max"
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname *</Label>
                <Input
                  id="lastName"
                  placeholder="Mustermann"
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="max@firma.ch"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                placeholder="+41 79 000 00 00"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rolle</Label>
              <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">Benutzer</SelectItem>
                  <SelectItem value="viewer">Betrachter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mitarbeiter-Verknüpfung</CardTitle>
            <CardDescription>Optional einen Mitarbeiterdatensatz gleichzeitig anlegen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Mitarbeiter anlegen</p>
                <p className="text-sm text-muted-foreground">Erstellt gleichzeitig einen HR-Eintrag</p>
              </div>
              <Switch
                checked={form.createEmployee}
                onCheckedChange={(v) => setForm((p) => ({ ...p, createEmployee: v }))}
              />
            </div>

            {form.createEmployee && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="z.B. Projektleiter"
                    value={form.position}
                    onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Eintrittsdatum</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={form.hireDate}
                    onChange={(e) => setForm((p) => ({ ...p, hireDate: e.target.value }))}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
