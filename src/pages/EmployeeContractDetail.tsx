import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, User, Calendar, Banknote, Clock, Shield, Building2, Edit, Download, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import SocialInsuranceEditor, { EmployeeSocialInsurance } from "@/components/contracts/SocialInsuranceEditor";
import { DEFAULT_SOCIAL_INSURANCE_RATES, SocialInsuranceRates, loadSocialInsuranceRates } from "@/components/settings/SocialInsuranceSettings";

const initialVertragData = {
  id: "AV-2024-0089",
  mitarbeiter: "Marco Brunner",
  personalNr: "MA-0045",
  position: "Metallbauer EFZ",
  abteilung: "Produktion",
  vorgesetzter: "Thomas Meier",
  vertragsart: "Unbefristet",
  status: "aktiv",
  eintrittsdatum: "2022-03-01",
  probezeit: "3 Monate (bis 31.05.2022)",
  kündigungsfrist: "2 Monate",
  arbeitsort: "Werkstatt Zürich",
  gav: "GAV Metallbau Schweiz",
  lohnklasse: "C",
  lohnklasseBeschreibung: "Facharbeiter mit EFZ",
  wochenarbeitszeit: 42.5,
  jahresarbeitszeit: 2212,
  monatslohn: 5400,
  stundenlohn: 30.42,
  tage13: true,
  ferienanspruch: 25,
  feiertage: 9,
  ahvNr: "756.1234.5678.90",
};

// Convert DEFAULT_SOCIAL_INSURANCE_RATES to initial employee social insurance state
const initialSocialInsurance: EmployeeSocialInsurance = {
  rates: { ...DEFAULT_SOCIAL_INSURANCE_RATES },
  overrides: {}
};

const spesen = [
  { bezeichnung: "Kilometerentschädigung", betrag: "CHF 0.70/km", bemerkung: "Privatfahrzeug für Geschäftsfahrten" },
  { bezeichnung: "Mittagessen (auswärts)", betrag: "CHF 32.00/Tag", bemerkung: "bei Montagearbeiten" },
  { bezeichnung: "Übernachtung", betrag: "effektiv bis CHF 150.00", bemerkung: "mit Beleg" },
  { bezeichnung: "Werkzeugentschädigung", betrag: "CHF 50.00/Monat", bemerkung: "gemäss GAV" },
];

const statusColors: Record<string, string> = {
  aktiv: "bg-success/10 text-success",
  gekündigt: "bg-warning/10 text-warning",
  beendet: "bg-muted text-muted-foreground",
  entwurf: "bg-info/10 text-info",
};

const lohnklassen = [
  { value: "A", label: "Klasse A - Angelernte Mitarbeiter" },
  { value: "B", label: "Klasse B - Anlernpersonal mit Erfahrung" },
  { value: "C", label: "Klasse C - Facharbeiter mit EFZ" },
  { value: "D", label: "Klasse D - Facharbeiter mit Spezialausbildung" },
  { value: "E", label: "Klasse E - Gruppenleiter / Vorarbeiter" },
  { value: "F", label: "Klasse F - Werkstattleiter / Polier" },
];

const vertragsarten = ["Unbefristet", "Befristet", "Temporär", "Praktikum", "Lehrvertrag"];
const statusOptions = ["aktiv", "gekündigt", "beendet", "entwurf"];

export default function EmployeeContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [vertragData, setVertragData] = useState(initialVertragData);
  const [editData, setEditData] = useState(initialVertragData);
  const [companyRates, setCompanyRates] = useState<SocialInsuranceRates>(DEFAULT_SOCIAL_INSURANCE_RATES);
  const [socialInsurance, setSocialInsurance] = useState<EmployeeSocialInsurance>(initialSocialInsurance);
  const [editSocialInsurance, setEditSocialInsurance] = useState<EmployeeSocialInsurance>(initialSocialInsurance);

  // Load company rates on mount
  useEffect(() => {
    const rates = loadSocialInsuranceRates();
    setCompanyRates(rates);
    // Update social insurance with company rates (keeping any overrides)
    setSocialInsurance(prev => ({
      rates: { ...rates, ...Object.fromEntries(
        Object.entries(prev.rates).filter(([key]) => prev.overrides[key as keyof SocialInsuranceRates])
      ) } as SocialInsuranceRates,
      overrides: prev.overrides
    }));
  }, []);

  // Check for edit mode from URL param
  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setIsEditMode(true);
      setEditData(vertragData);
      // Clean up URL
      searchParams.delete("edit");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, vertragData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("de-CH");
    } catch {
      return dateStr;
    }
  };

  const jahreslohn = vertragData.monatslohn * (vertragData.tage13 ? 13 : 12);
  const agAbzüge = Object.values(socialInsurance.rates).reduce((sum, r) => sum + r.employer, 0);
  const anAbzüge = Object.values(socialInsurance.rates).reduce((sum, r) => sum + r.employee, 0);

  const handlePdfExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(18);
    doc.text("Arbeitsvertrag", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`${vertragData.id}`, pageWidth / 2, 28, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("Mitarbeiter", 14, 42);
    doc.setFontSize(10);
    doc.text(`Name: ${vertragData.mitarbeiter}`, 14, 50);
    doc.text(`Personal-Nr.: ${vertragData.personalNr}`, 14, 56);
    doc.text(`Position: ${vertragData.position}`, 14, 62);
    doc.text(`Abteilung: ${vertragData.abteilung}`, 14, 68);
    
    doc.setFontSize(12);
    doc.text("Vertragsdaten", 14, 82);
    doc.setFontSize(10);
    doc.text(`Vertragsart: ${vertragData.vertragsart}`, 14, 90);
    doc.text(`Eintrittsdatum: ${formatDate(vertragData.eintrittsdatum)}`, 14, 96);
    doc.text(`Arbeitsort: ${vertragData.arbeitsort}`, 14, 102);
    doc.text(`Kündigungsfrist: ${vertragData.kündigungsfrist}`, 14, 108);
    
    doc.setFontSize(12);
    doc.text("Entlöhnung (GAV Metallbau)", 14, 122);
    doc.setFontSize(10);
    doc.text(`Lohnklasse: ${vertragData.lohnklasse} - ${vertragData.lohnklasseBeschreibung}`, 14, 130);
    doc.text(`Monatslohn: ${formatCurrency(vertragData.monatslohn)}`, 14, 136);
    doc.text(`Jahreslohn: ${formatCurrency(jahreslohn)} (${vertragData.tage13 ? "13" : "12"} Monatslöhne)`, 14, 142);
    doc.text(`Ferienanspruch: ${vertragData.ferienanspruch} Tage`, 14, 148);
    
    autoTable(doc, {
      startY: 160,
      head: [["Sozialversicherung", "AG %", "AN %", "Basis"]],
      body: Object.values(socialInsurance.rates).map(rate => [
        rate.description,
        rate.employer > 0 ? `${rate.employer}%` : "-",
        rate.employee > 0 ? `${rate.employee}%` : "-",
        rate.basis,
      ]),
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
    });

    doc.save(`Arbeitsvertrag_${vertragData.personalNr}.pdf`);
    toast.success("PDF wurde exportiert");
  };

  const handleEditToggle = () => {
    if (!isEditMode) {
      setEditData(vertragData);
      setEditSocialInsurance(socialInsurance);
    }
    setIsEditMode(!isEditMode);
  };

  const handleCancel = () => {
    setEditData(vertragData);
    setEditSocialInsurance(socialInsurance);
    setIsEditMode(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local data
      setVertragData(editData);
      setSocialInsurance(editSocialInsurance);
      setIsEditMode(false);
      toast.success("Vertrag wurde erfolgreich aktualisiert");
    } catch (error) {
      toast.error("Fehler beim Speichern des Vertrags");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/employee-contracts">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">Arbeitsvertrag</h1>
            {isEditMode ? (
              <Badge className="bg-info/10 text-info">Bearbeitungsmodus</Badge>
            ) : (
              <>
                <Badge className={statusColors[vertragData.status]}>
                  {vertragData.status.charAt(0).toUpperCase() + vertragData.status.slice(1)}
                </Badge>
                <Badge variant="outline">{vertragData.vertragsart}</Badge>
              </>
            )}
          </div>
          <p className="text-muted-foreground">{vertragData.id}</p>
        </div>
        <div className="flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Abbrechen
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Speichern
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handlePdfExport}>
                <Download className="mr-2 h-4 w-4" />
                PDF Export
              </Button>
              <Button onClick={handleEditToggle}>
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mitarbeiter Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Mitarbeiter</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {vertragData.mitarbeiter.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditMode ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={editData.position}
                        onChange={(e) => updateField("position", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="abteilung">Abteilung</Label>
                      <Input
                        id="abteilung"
                        value={editData.abteilung}
                        onChange={(e) => updateField("abteilung", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link to={`/hr/${vertragData.personalNr}`} className="text-xl font-bold text-primary hover:underline">
                    {vertragData.mitarbeiter}
                  </Link>
                  <p className="text-muted-foreground">{vertragData.personalNr}</p>
                </>
              )}
            </div>
            {!isEditMode && (
              <div className="text-right">
                <p className="font-medium">{vertragData.position}</p>
                <p className="text-sm text-muted-foreground">{vertragData.abteilung}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vertragsdaten */}
      {isEditMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Vertragsdaten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="vertragsart">Vertragsart</Label>
                <Select
                  value={editData.vertragsart}
                  onValueChange={(value) => updateField("vertragsart", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vertragsarten.map((art) => (
                      <SelectItem key={art} value={art}>{art}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editData.status}
                  onValueChange={(value) => updateField("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eintrittsdatum">Eintrittsdatum</Label>
                <Input
                  id="eintrittsdatum"
                  type="date"
                  value={editData.eintrittsdatum}
                  onChange={(e) => updateField("eintrittsdatum", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arbeitsort">Arbeitsort</Label>
                <Input
                  id="arbeitsort"
                  value={editData.arbeitsort}
                  onChange={(e) => updateField("arbeitsort", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kündigungsfrist">Kündigungsfrist</Label>
                <Input
                  id="kündigungsfrist"
                  value={editData.kündigungsfrist}
                  onChange={(e) => updateField("kündigungsfrist", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wochenarbeitszeit">Wochenarbeitszeit (Std.)</Label>
                <Input
                  id="wochenarbeitszeit"
                  type="number"
                  step="0.5"
                  value={editData.wochenarbeitszeit}
                  onChange={(e) => updateField("wochenarbeitszeit", parseFloat(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Eintrittsdatum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatDate(vertragData.eintrittsdatum)}</p>
              <p className="text-sm text-muted-foreground">Probezeit: {vertragData.probezeit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Arbeitszeit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{vertragData.wochenarbeitszeit} Std./Woche</p>
              <p className="text-sm text-muted-foreground">{vertragData.jahresarbeitszeit.toLocaleString("de-CH")} Std./Jahr</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Arbeitsort
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{vertragData.arbeitsort}</p>
              <p className="text-sm text-muted-foreground">Kündigungsfrist: {vertragData.kündigungsfrist}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* GAV & Lohn */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Entlöhnung (GAV Metallbau Schweiz)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditMode ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Lohnklasse</Label>
                  <Select
                    value={editData.lohnklasse}
                    onValueChange={(value) => updateField("lohnklasse", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lohnklassen.map((lk) => (
                        <SelectItem key={lk.value} value={lk.value}>{lk.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monatslohn">Monatslohn (CHF)</Label>
                    <Input
                      id="monatslohn"
                      type="number"
                      value={editData.monatslohn}
                      onChange={(e) => updateField("monatslohn", parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stundenlohn">Stundenlohn (CHF)</Label>
                    <Input
                      id="stundenlohn"
                      type="number"
                      step="0.01"
                      value={editData.stundenlohn}
                      onChange={(e) => updateField("stundenlohn", parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ferienanspruch">Ferienanspruch (Tage)</Label>
                  <Input
                    id="ferienanspruch"
                    type="number"
                    value={editData.ferienanspruch}
                    onChange={(e) => updateField("ferienanspruch", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feiertage">Bezahlte Feiertage (Tage)</Label>
                  <Input
                    id="feiertage"
                    type="number"
                    value={editData.feiertage}
                    onChange={(e) => updateField("feiertage", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ahvNr">AHV-Nummer</Label>
                  <Input
                    id="ahvNr"
                    value={editData.ahvNr}
                    onChange={(e) => updateField("ahvNr", e.target.value)}
                    placeholder="756.XXXX.XXXX.XX"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Lohnklasse</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary text-lg px-3">
                      Klasse {vertragData.lohnklasse}
                    </Badge>
                    <span>{vertragData.lohnklasseBeschreibung}</span>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Monatslohn (brutto)</p>
                    <p className="text-2xl font-bold">{formatCurrency(vertragData.monatslohn)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stundenlohn</p>
                    <p className="text-2xl font-bold">{formatCurrency(vertragData.stundenlohn)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jahreslohn</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(jahreslohn)}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({vertragData.tage13 ? "13 Monatslöhne" : "12 Monatslöhne"})
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ferienanspruch</p>
                  <p className="text-xl font-bold">{vertragData.ferienanspruch} Tage</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bezahlte Feiertage</p>
                  <p className="text-xl font-bold">{vertragData.feiertage} Tage</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">AHV-Nummer</p>
                  <p className="font-mono">{vertragData.ahvNr}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sozialversicherungen */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Sozialversicherungen (Schweiz)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SocialInsuranceEditor
            value={isEditMode ? editSocialInsurance : socialInsurance}
            onChange={setEditSocialInsurance}
            companyRates={companyRates}
            isEditMode={isEditMode}
          />
        </CardContent>
      </Card>

      {/* Spesen - Read-only */}
      <Card>
        <CardHeader>
          <CardTitle>Spesenregelung (GAV Metallbau)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bezeichnung</TableHead>
                <TableHead>Ansatz</TableHead>
                <TableHead>Bemerkung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spesen.map((sp, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{sp.bezeichnung}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sp.betrag}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sp.bemerkung}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
