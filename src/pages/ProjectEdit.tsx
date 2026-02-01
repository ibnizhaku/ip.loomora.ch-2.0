import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-2xl font-bold">Projekt bearbeiten</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projektdetails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Projektname</Label>
              <Input placeholder="Projektname eingeben" />
            </div>
            <div className="space-y-2">
              <Label>Kunde</Label>
              <Input placeholder="Kunde auswählen" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Textarea placeholder="Projektbeschreibung" rows={4} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
