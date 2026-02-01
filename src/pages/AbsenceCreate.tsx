import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AbsenceCreate() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neue Abwesenheit</h1>
          <p className="text-muted-foreground">Abwesenheit erfassen</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Abwesenheitsdetails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mitarbeiter</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Mitarbeiter auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Thomas Müller</SelectItem>
                <SelectItem value="2">Anna Schmidt</SelectItem>
                <SelectItem value="3">Michael Weber</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Abwesenheitstyp</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Ferien</SelectItem>
                <SelectItem value="sick">Krankheit</SelectItem>
                <SelectItem value="unpaid">Unbezahlter Urlaub</SelectItem>
                <SelectItem value="training">Weiterbildung</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Von</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Bis</Label>
              <Input type="date" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bemerkung</Label>
            <Textarea placeholder="Optionale Bemerkung" rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Abwesenheit erfassen
        </Button>
      </div>
    </div>
  );
}
