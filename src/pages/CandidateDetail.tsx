import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText, Star, Calendar, MessageSquare, UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const kandidatData = {
  id: "BEW-2024-0034",
  name: "Sarah Keller",
  email: "sarah.keller@email.ch",
  telefon: "+41 79 345 67 89",
  adresse: "Bahnhofstrasse 25, 8001 Zürich",
  geburtsdatum: "15.03.1992",
  nationalität: "Schweiz",
  stelle: "Metallbauer EFZ",
  stellenNr: "STL-2024-0008",
  status: "interview",
  bewertung: 4,
  quelle: "jobs.ch",
  beworbenAm: "20.01.2024",
  // Qualifikationen
  ausbildung: "Metallbauer EFZ",
  erfahrung: "6 Jahre",
  sprachkenntnisse: ["Deutsch (Muttersprache)", "Französisch (B2)", "Englisch (B1)"],
  führerschein: "Kat. B",
  lohnvorstellung: "5'800 - 6'200 CHF",
};

const dokumente = [
  { name: "Lebenslauf_Keller.pdf", typ: "CV", datum: "20.01.2024" },
  { name: "Zeugnisse_komplett.pdf", typ: "Zeugnisse", datum: "20.01.2024" },
  { name: "EFZ_Diplom.pdf", typ: "Diplom", datum: "20.01.2024" },
  { name: "Arbeitszeugnisse.pdf", typ: "Referenzen", datum: "22.01.2024" },
];

const interviews = [
  { datum: "28.01.2024 14:00", typ: "Erstgespräch", interviewer: "Thomas Meier", status: "durchgeführt", notiz: "Sehr guter Eindruck, fachlich kompetent" },
  { datum: "05.02.2024 10:00", typ: "Fachgespräch", interviewer: "Marco Brunner", status: "geplant", notiz: "" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  neu: { label: "Neu", color: "bg-info/10 text-info" },
  screening: { label: "Screening", color: "bg-warning/10 text-warning" },
  interview: { label: "Interview", color: "bg-primary/10 text-primary" },
  angebot: { label: "Angebot", color: "bg-success/10 text-success" },
  eingestellt: { label: "Eingestellt", color: "bg-success/10 text-success" },
  abgelehnt: { label: "Abgelehnt", color: "bg-destructive/10 text-destructive" },
};

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showHireDialog, setShowHireDialog] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [hireData, setHireData] = useState({
    startDate: "",
    department: "Produktion",
    salary: "5800",
    manager: "Thomas Meier",
  });

  const handleSendOffer = () => {
    setShowOfferDialog(false);
    toast.success(`Angebot an ${kandidatData.name} gesendet`, {
      description: "Die E-Mail mit dem Vertragsangebot wurde verschickt."
    });
  };

  const handleHire = () => {
    if (!hireData.startDate) {
      toast.error("Bitte geben Sie ein Eintrittsdatum ein");
      return;
    }
    setShowHireDialog(false);
    toast.success(`${kandidatData.name} wurde eingestellt!`, {
      description: `Startdatum: ${new Date(hireData.startDate).toLocaleDateString('de-CH')}`
    });
    setTimeout(() => {
      navigate("/hr");
    }, 1500);
  };

  const handleReject = () => {
    toast.info(`Absage an ${kandidatData.name} gesendet`);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/recruiting">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{kandidatData.name}</h1>
            <Badge className={statusConfig[kandidatData.status].color}>
              {statusConfig[kandidatData.status].label}
            </Badge>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < kandidatData.bewertung ? "text-warning fill-warning" : "text-muted-foreground"}`}
                />
              ))}
            </div>
          </div>
          <p className="text-muted-foreground">{kandidatData.id} • Bewerbung für {kandidatData.stelle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReject}>
            Absage
          </Button>
          <Button variant="outline" onClick={() => setShowOfferDialog(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Angebot senden
          </Button>
          <Button onClick={() => setShowHireDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Einstellen
          </Button>
        </div>
      </div>

      {/* Bewerbungsstatus */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Fortschritt:</span>
            <Progress value={60} className="flex-1 h-2" />
            <span className="text-sm font-medium">Interview-Phase</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Persönliche Daten */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Persönliche Daten</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {kandidatData.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">{kandidatData.name}</p>
                <p className="text-muted-foreground">{kandidatData.geburtsdatum} • {kandidatData.nationalität}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${kandidatData.email}`} className="text-primary hover:underline">
                  {kandidatData.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{kandidatData.telefon}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{kandidatData.adresse}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Qualifikationen */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Qualifikationen</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ausbildung</p>
                <p className="font-medium">{kandidatData.ausbildung}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Berufserfahrung</p>
                <p className="font-medium">{kandidatData.erfahrung}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Führerschein</p>
                <p className="font-medium">{kandidatData.führerschein}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lohnvorstellung</p>
                <p className="font-medium">{kandidatData.lohnvorstellung}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Sprachkenntnisse</p>
              <div className="flex flex-wrap gap-2">
                {kandidatData.sprachkenntnisse.map((s, i) => (
                  <Badge key={i} variant="outline">{s}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stelle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Bewerbung</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Stelle</p>
              <p className="font-medium">{kandidatData.stelle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stellen-Nr.</p>
              <p className="font-medium">{kandidatData.stellenNr}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Beworben am</p>
              <p className="font-medium">{kandidatData.beworbenAm}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quelle</p>
              <Badge variant="outline">{kandidatData.quelle}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Interviews</CardTitle>
          </div>
          <Button size="sm">Interview planen</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interviews.map((iv, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{iv.typ}</Badge>
                    <Badge className={iv.status === "durchgeführt" ? "bg-success/10 text-success" : "bg-info/10 text-info"}>
                      {iv.status}
                    </Badge>
                  </div>
                  <p className="font-medium mt-2">{iv.datum}</p>
                  <p className="text-sm text-muted-foreground">Interviewer: {iv.interviewer}</p>
                  {iv.notiz && (
                    <p className="text-sm mt-2 p-2 bg-muted rounded">{iv.notiz}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dokumente */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Bewerbungsunterlagen</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {dokumente.map((doc, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.datum}</p>
                </div>
                <Badge variant="outline">{doc.typ}</Badge>
                <Button variant="ghost" size="sm">Öffnen</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vertragsangebot senden</DialogTitle>
            <DialogDescription>
              Senden Sie ein Vertragsangebot an {kandidatData.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Stelle</p>
                  <p className="font-medium">{kandidatData.stelle}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lohnvorstellung</p>
                  <p className="font-medium">{kandidatData.lohnvorstellung}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Das Angebot wird per E-Mail an {kandidatData.email} gesendet.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSendOffer}>
              <Mail className="h-4 w-4 mr-2" />
              Angebot senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hire Dialog */}
      <Dialog open={showHireDialog} onOpenChange={setShowHireDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kandidat einstellen</DialogTitle>
            <DialogDescription>
              {kandidatData.name} als Mitarbeiter anlegen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="font-medium">{kandidatData.name}</p>
                <p className="text-sm text-muted-foreground">{kandidatData.stelle}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Eintrittsdatum *</Label>
              <Input
                id="startDate"
                type="date"
                value={hireData.startDate}
                onChange={(e) => setHireData({ ...hireData, startDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Abteilung</Label>
              <Select
                value={hireData.department}
                onValueChange={(value) => setHireData({ ...hireData, department: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Produktion">Produktion</SelectItem>
                  <SelectItem value="Montage">Montage</SelectItem>
                  <SelectItem value="Konstruktion">Konstruktion</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary">Monatslohn (CHF)</Label>
              <Input
                id="salary"
                type="number"
                value={hireData.salary}
                onChange={(e) => setHireData({ ...hireData, salary: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manager">Vorgesetzter</Label>
              <Select
                value={hireData.manager}
                onValueChange={(value) => setHireData({ ...hireData, manager: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Thomas Meier">Thomas Meier</SelectItem>
                  <SelectItem value="Hans Keller">Hans Keller</SelectItem>
                  <SelectItem value="Marco Brunner">Marco Brunner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHireDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleHire} className="bg-success hover:bg-success/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Jetzt einstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
