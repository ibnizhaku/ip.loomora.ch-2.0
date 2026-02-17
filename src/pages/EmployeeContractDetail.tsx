import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileText, User, Calendar, Banknote, Clock, Shield, Building2, Edit, Download, Save, X, Loader2, Receipt } from "lucide-react";
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
import { loadExpenseRules, ExpenseRules } from "@/components/settings/ExpenseRulesSettings";
import { useEmployeeContract, useUpdateEmployeeContract } from "@/hooks/use-employee-contracts";

// Dynamic expense rules - will be loaded from settings
const getExpenseRulesDisplay = (rules: ExpenseRules) => [
  { bezeichnung: "Kilometerentschädigung", betrag: `CHF ${rules.mileage.rate.toFixed(2)}/km`, bemerkung: rules.mileage.description },
  { bezeichnung: "Mittagessen (auswärts)", betrag: `CHF ${rules.meals.lunch.toFixed(2)}/Tag`, bemerkung: "bei Montagearbeiten" },
  { bezeichnung: "Ganztag-Verpflegung", betrag: `CHF ${rules.meals.fullDay.toFixed(2)}/Tag`, bemerkung: "Frühstück, Mittag, Abend" },
  { bezeichnung: "Übernachtung", betrag: `effektiv bis CHF ${rules.accommodation.maxPerNight.toFixed(2)}`, bemerkung: rules.accommodation.requiresReceipt ? "mit Beleg" : "ohne Beleg" },
  { bezeichnung: "Werkzeugentschädigung", betrag: `CHF ${rules.toolAllowance.monthlyRate.toFixed(2)}/Monat`, bemerkung: rules.toolAllowance.gavReference },
];

const statusColors: Record<string, string> = {
  aktiv: "bg-success/10 text-success",
  active: "bg-success/10 text-success",
  gekündigt: "bg-warning/10 text-warning",
  terminated: "bg-warning/10 text-warning",
  beendet: "bg-muted text-muted-foreground",
  ended: "bg-muted text-muted-foreground",
  entwurf: "bg-info/10 text-info",
  draft: "bg-info/10 text-info",
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

// Convert DEFAULT_SOCIAL_INSURANCE_RATES to initial employee social insurance state
const initialSocialInsurance: EmployeeSocialInsurance = {
  rates: { ...DEFAULT_SOCIAL_INSURANCE_RATES },
  overrides: {}
};

export default function EmployeeContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // API hooks
  const { data: apiData, isLoading, error } = useEmployeeContract(id || "");
  const updateMutation = useUpdateEmployeeContract();

  // Map API data to component format
  const initialData = useMemo(() => {
    if (!apiData) return null;
    const extractName = (val: any): string => {
      if (!val) return "–";
      if (typeof val === "string") return val;
      if (typeof val === "object" && val.name) return val.name;
      return "–";
    };
    // Format ISO date strings to yyyy-MM-dd for date inputs
    const toDateInput = (val?: string | null): string => {
      if (!val) return "";
      try {
        return val.includes("T") ? val.split("T")[0] : val;
      } catch { return val; }
    };
    return {
      id: apiData.id || id || "",
      mitarbeiter: apiData.employeeName || (apiData.employee ? `${apiData.employee.firstName} ${apiData.employee.lastName}` : "–"),
      personalNr: apiData.employeeId || apiData.employee?.id || "",
      position: extractName(apiData.position) || extractName(apiData.employee?.position) || "–",
      abteilung: extractName(apiData.department) || extractName(apiData.employee?.department) || "–",
      vorgesetzter: extractName(apiData.supervisor),
      vertragsart: apiData.contractType || "Unbefristet",
      status: apiData.status || "aktiv",
      eintrittsdatum: toDateInput(apiData.startDate),
      probezeit: toDateInput(apiData.probationEnd) || "–",
      kündigungsfrist: apiData.noticePeriod || "–",
      arbeitsort: apiData.workLocation || "–",
      gav: apiData.gav || "GAV Metallbau Schweiz",
      lohnklasse: apiData.gavClass || "C",
      lohnklasseBeschreibung: apiData.salaryClassDescription || "Facharbeiter mit EFZ",
      wochenarbeitszeit: apiData.weeklyHours || 42.5,
      jahresarbeitszeit: apiData.annualHours || 2212,
      monatslohn: apiData.baseSalary || 0,
      stundenlohn: apiData.hourlyRate || 0,
      tage13: apiData.thirteenthMonth !== false,
      ferienanspruch: apiData.vacationDays || 20,
      feiertage: apiData.publicHolidays || 9,
      ahvNr: apiData.ahvNumber || "",
    };
  }, [apiData, id]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [vertragData, setVertragData] = useState(initialData);
  const [editData, setEditData] = useState(initialData);
  const [companyRates, setCompanyRates] = useState<SocialInsuranceRates>(DEFAULT_SOCIAL_INSURANCE_RATES);
  const [socialInsurance, setSocialInsurance] = useState<EmployeeSocialInsurance>(initialSocialInsurance);
  const [editSocialInsurance, setEditSocialInsurance] = useState<EmployeeSocialInsurance>(initialSocialInsurance);
  const [expenseRules, setExpenseRules] = useState<ExpenseRules | null>(null);

  // Sync API data
  useEffect(() => {
    if (initialData) {
      setVertragData(initialData);
      setEditData(initialData);
    }
  }, [initialData]);

  // Load company rates and expense rules on mount
  useEffect(() => {
    const rates = loadSocialInsuranceRates();
    setCompanyRates(rates);
    setSocialInsurance(prev => ({
      rates: { ...rates, ...Object.fromEntries(
        Object.entries(prev.rates).filter(([key]) => prev.overrides[key as keyof SocialInsuranceRates])
      ) } as SocialInsuranceRates,
      overrides: prev.overrides
    }));
    
    const expRules = loadExpenseRules();
    setExpenseRules(expRules);
  }, []);

  const spesen = expenseRules ? getExpenseRulesDisplay(expenseRules) : [];

  // Check for edit mode from URL param
  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setIsEditMode(true);
      if (vertragData) setEditData(vertragData);
      searchParams.delete("edit");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, vertragData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !vertragData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Vertrag nicht gefunden</p>
        <Link to="/employee-contracts" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("de-CH");
    } catch { return dateStr; }
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
    if (!editData || !id) return;
    updateMutation.mutate({
      id,
      data: {
        contractType: editData.vertragsart,
        startDate: editData.eintrittsdatum,
        workLocation: editData.arbeitsort === "–" ? undefined : editData.arbeitsort,
        noticePeriod: editData.kündigungsfrist === "–" ? undefined : editData.kündigungsfrist,
        weeklyHours: editData.wochenarbeitszeit,
        gavClass: editData.lohnklasse,
        baseSalary: editData.monatslohn,
        hourlyRate: editData.stundenlohn,
        vacationDays: editData.ferienanspruch,
        thirteenthMonth: editData.tage13,
        position: editData.position === "–" ? undefined : editData.position,
        department: editData.abteilung === "–" ? undefined : editData.abteilung,
      },
    }, {
      onSuccess: () => {
        setVertragData(editData);
        setSocialInsurance(editSocialInsurance);
        setIsEditMode(false);
        toast.success("Vertrag wurde erfolgreich aktualisiert");
      },
      onError: () => {
        toast.error("Fehler beim Speichern des Vertrags");
      },
    });
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setEditData(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const isSaving = updateMutation.isPending;

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
                <Badge className={statusColors[vertragData.status] || "bg-muted"}>
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
                      <Input id="position" value={editData?.position || ""} onChange={(e) => updateField("position", e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="abteilung">Abteilung</Label>
                      <Input id="abteilung" value={editData?.abteilung || ""} onChange={(e) => updateField("abteilung", e.target.value)} />
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
          <CardHeader><CardTitle>Vertragsdaten</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="vertragsart">Vertragsart</Label>
                <Select value={editData?.vertragsart || ""} onValueChange={(value) => updateField("vertragsart", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {vertragsarten.map((art) => (<SelectItem key={art} value={art}>{art}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={editData?.status || ""} onValueChange={(value) => updateField("status", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (<SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eintrittsdatum">Eintrittsdatum</Label>
                <Input id="eintrittsdatum" type="date" value={editData?.eintrittsdatum || ""} onChange={(e) => updateField("eintrittsdatum", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arbeitsort">Arbeitsort</Label>
                <Input id="arbeitsort" value={editData?.arbeitsort || ""} onChange={(e) => updateField("arbeitsort", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kündigungsfrist">Kündigungsfrist</Label>
                <Input id="kündigungsfrist" value={editData?.kündigungsfrist || ""} onChange={(e) => updateField("kündigungsfrist", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wochenarbeitszeit">Wochenarbeitszeit (Std.)</Label>
                <Input id="wochenarbeitszeit" type="number" step="0.5" value={editData?.wochenarbeitszeit || 0} onChange={(e) => updateField("wochenarbeitszeit", parseFloat(e.target.value))} />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />Eintrittsdatum
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
                <Clock className="h-4 w-4" />Arbeitszeit
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
                <Building2 className="h-4 w-4" />Arbeitsort
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
                  <Select value={editData?.lohnklasse || ""} onValueChange={(value) => updateField("lohnklasse", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {lohnklassen.map((lk) => (<SelectItem key={lk.value} value={lk.value}>{lk.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monatslohn">Monatslohn (CHF)</Label>
                    <Input id="monatslohn" type="number" value={editData?.monatslohn || 0} onChange={(e) => updateField("monatslohn", parseFloat(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stundenlohn">Stundenlohn (CHF)</Label>
                    <Input id="stundenlohn" type="number" step="0.01" value={editData?.stundenlohn || 0} onChange={(e) => updateField("stundenlohn", parseFloat(e.target.value))} />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ferienanspruch">Ferienanspruch (Tage)</Label>
                  <Input id="ferienanspruch" type="number" value={editData?.ferienanspruch || 0} onChange={(e) => updateField("ferienanspruch", parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feiertage">Bezahlte Feiertage (Tage)</Label>
                  <Input id="feiertage" type="number" value={editData?.feiertage || 0} onChange={(e) => updateField("feiertage", parseInt(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ahvNr">AHV-Nummer</Label>
                  <Input id="ahvNr" value={editData?.ahvNr || ""} onChange={(e) => updateField("ahvNr", e.target.value)} placeholder="756.XXXX.XXXX.XX" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Lohnklasse</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary text-lg px-3">Klasse {vertragData.lohnklasse}</Badge>
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
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Spesenregelung (GAV Metallbau)</CardTitle>
          </div>
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
                  <TableCell><Badge variant="outline">{sp.betrag}</Badge></TableCell>
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
