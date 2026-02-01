import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EmployeeCreate() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neuer Mitarbeiter</h1>
          <p className="text-muted-foreground">Mitarbeiterdaten erfassen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Persönliche Daten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Vorname</Label>
                <Input placeholder="Vorname" />
              </div>
              <div className="space-y-2">
                <Label>Nachname</Label>
                <Input placeholder="Nachname" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-Mail</Label>
              <Input type="email" placeholder="email@beispiel.ch" />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input placeholder="+41 XX XXX XX XX" />
            </div>
            <div className="space-y-2">
              <Label>Geburtsdatum</Label>
              <Input type="date" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anstellung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <Input placeholder="Stellenbezeichnung" />
            </div>
            <div className="space-y-2">
              <Label>Abteilung</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Abteilung wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Produktion</SelectItem>
                  <SelectItem value="sales">Vertrieb</SelectItem>
                  <SelectItem value="admin">Verwaltung</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Eintrittsdatum</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Pensum (%)</Label>
              <Input type="number" placeholder="100" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Mitarbeiter anlegen
        </Button>
      </div>
    </div>
  );
}
