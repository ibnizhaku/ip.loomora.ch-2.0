import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompanyEdit() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Firma bearbeiten</h1>
          <p className="text-muted-foreground">Stammdaten der Firma anpassen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Firmendaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Firmenname</Label>
              <Input placeholder="Musterfirma AG" />
            </div>
            <div className="space-y-2">
              <Label>UID-Nummer</Label>
              <Input placeholder="CHE-123.456.789" />
            </div>
            <div className="space-y-2">
              <Label>MWST-Nummer</Label>
              <Input placeholder="CHE-123.456.789 MWST" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Strasse</Label>
              <Input placeholder="Musterstrasse 1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>PLZ</Label>
                <Input placeholder="8000" />
              </div>
              <div className="space-y-2">
                <Label>Ort</Label>
                <Input placeholder="Zürich" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Land</Label>
              <Input placeholder="Schweiz" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Speichern
        </Button>
      </div>
    </div>
  );
}
