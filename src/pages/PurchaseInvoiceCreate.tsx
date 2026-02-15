import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Upload, Building2, Receipt, FolderKanban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useProjects } from "@/hooks/use-projects";

export default function PurchaseInvoiceCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultSupplierId = searchParams.get("supplierId") || "";
  const [formData, setFormData] = useState({
    supplier: defaultSupplierId,
    supplierNumber: "",
    amount: "",
    invoiceDate: "",
    dueDate: "",
    description: "",
    projectId: "",
    account: "",
    costCenter: "",
    vatCode: "",
  });

  // Fetch projects from API
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ pageSize: 100 });
  const projects = useMemo(() => projectsData?.data || [], [projectsData]);

  const handleSubmit = () => {
    if (!formData.supplier || !formData.amount) {
      toast.error("Bitte Pflichtfelder ausfüllen");
      return;
    }
    toast.success("Rechnung erfolgreich erfasst");
    navigate("/purchase-invoices");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Neue Eingangsrechnung</h1>
          <p className="text-muted-foreground">Kreditorenrechnung erfassen</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Lieferant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Lieferant auswählen</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Lieferant auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Software AG</SelectItem>
                    <SelectItem value="2">Office Supplies GmbH</SelectItem>
                    <SelectItem value="3">Energie Versorger</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Rechnungsdetails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rechnungsnummer (Lieferant)</Label>
                  <Input placeholder="Rechnungsnummer" />
                </div>
                <div className="space-y-2">
                  <Label>Betrag (CHF)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rechnungsdatum</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Fälligkeitsdatum</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Projekt (optional)
                </Label>
                <Select 
                  value={formData.projectId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Projekt zuweisen" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectsLoading ? (
                      <SelectItem value="loading" disabled>Laden...</SelectItem>
                    ) : projects.length === 0 ? (
                      <SelectItem value="none" disabled>Keine Projekte</SelectItem>
                    ) : (
                      projects.map((project: any) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.number} - {project.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea placeholder="Beschreibung der Rechnung" rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Dokument hochladen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">PDF oder Bild hierher ziehen</p>
                <Button variant="outline" className="mt-4">Datei auswählen</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kontierung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Aufwandkonto</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Konto wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4000">4000 - Materialaufwand</SelectItem>
                    <SelectItem value="6000">6000 - Raumaufwand</SelectItem>
                    <SelectItem value="6500">6500 - Verwaltungsaufwand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kostenstelle</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Kostenstelle wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1000 - Produktion</SelectItem>
                    <SelectItem value="2000">2000 - Vertrieb</SelectItem>
                    <SelectItem value="3000">3000 - Verwaltung</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>MWST-Code</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="MWST-Code wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8.1">8.1% Normalsatz</SelectItem>
                    <SelectItem value="2.6">2.6% Reduziert</SelectItem>
                    <SelectItem value="0">0% Befreit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSubmit}>
          <Save className="h-4 w-4" />
          Rechnung erfassen
        </Button>
      </div>
    </div>
  );
}
