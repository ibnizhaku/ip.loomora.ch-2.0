import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Edit,
  MoreHorizontal,
  Briefcase,
  GraduationCap,
  Award,
  Building2,
  CalendarDays,
  Download,
  UserX,
  CheckCircle2,
  Circle,
  ClipboardList,
  Laptop,
  Key,
  Shield,
  Users,
  BookOpen,
  Coffee,
  Printer,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Onboarding checklist items
interface OnboardingItem {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  completedDate?: string;
  completedBy?: string;
}

const mockOnboardingItems: OnboardingItem[] = [
  // IT & Ausstattung
  { id: "it-1", category: "IT & Ausstattung", title: "Laptop/PC einrichten", description: "Hardware bereitstellen und konfigurieren", icon: Laptop, completed: true, completedDate: "01.04.2021", completedBy: "IT-Support" },
  { id: "it-2", category: "IT & Ausstattung", title: "E-Mail-Konto erstellen", description: "Firmen-E-Mail und Kalender einrichten", icon: Mail, completed: true, completedDate: "01.04.2021", completedBy: "IT-Support" },
  { id: "it-3", category: "IT & Ausstattung", title: "Software-Zugänge", description: "Zugriff auf benötigte Tools und Systeme", icon: Key, completed: true, completedDate: "02.04.2021", completedBy: "IT-Support" },
  { id: "it-4", category: "IT & Ausstattung", title: "Drucker/Scanner", description: "Netzwerkdrucker einrichten", icon: Printer, completed: true, completedDate: "02.04.2021", completedBy: "IT-Support" },
  
  // Dokumente
  { id: "doc-1", category: "Dokumente", title: "Arbeitsvertrag unterzeichnet", description: "Unterschriebener Vertrag archiviert", icon: FileText, completed: true, completedDate: "28.03.2021", completedBy: "HR" },
  { id: "doc-2", category: "Dokumente", title: "Personalfragebogen", description: "Stammdaten erfasst", icon: ClipboardList, completed: true, completedDate: "28.03.2021", completedBy: "HR" },
  { id: "doc-3", category: "Dokumente", title: "Bankverbindung hinterlegt", description: "Für Gehaltsüberweisung", icon: Building2, completed: true, completedDate: "28.03.2021", completedBy: "HR" },
  { id: "doc-4", category: "Dokumente", title: "Sozialversicherung", description: "AHV/Pensionskasse angemeldet", icon: Shield, completed: true, completedDate: "01.04.2021", completedBy: "HR" },
  
  // Einarbeitung
  { id: "train-1", category: "Einarbeitung", title: "Firmenrundgang", description: "Räumlichkeiten und Kollegen vorstellen", icon: Building2, completed: true, completedDate: "01.04.2021", completedBy: "Vorgesetzter" },
  { id: "train-2", category: "Einarbeitung", title: "Team-Vorstellung", description: "Alle Teammitglieder kennenlernen", icon: Users, completed: true, completedDate: "01.04.2021", completedBy: "Vorgesetzter" },
  { id: "train-3", category: "Einarbeitung", title: "Mentor zugewiesen", description: "Ansprechpartner für Fragen", icon: User, completed: true, completedDate: "01.04.2021", completedBy: "Vorgesetzter" },
  { id: "train-4", category: "Einarbeitung", title: "Einführungsschulung", description: "Unternehmensprozesse und Tools", icon: BookOpen, completed: true, completedDate: "05.04.2021", completedBy: "HR" },
  
  // Zusätzliches
  { id: "extra-1", category: "Zusätzliches", title: "Schlüssel/Badge erhalten", description: "Gebäudezugang", icon: Key, completed: true, completedDate: "01.04.2021", completedBy: "Empfang" },
  { id: "extra-2", category: "Zusätzliches", title: "Parkplatz zugewiesen", description: "Falls benötigt", icon: Car, completed: false },
  { id: "extra-3", category: "Zusätzliches", title: "Willkommens-Lunch", description: "Teamessen am ersten Tag", icon: Coffee, completed: true, completedDate: "01.04.2021", completedBy: "Team" },
];

const employeeData = {
  id: "MA-001",
  firstName: "Anna",
  lastName: "Schmidt",
  position: "Senior Entwicklerin",
  department: "Entwicklung",
  status: "Aktiv",
  email: "anna.schmidt@loomora.de",
  phone: "+49 170 1234567",
  address: "Musterstraße 15, 10115 Berlin",
  birthDate: "15.03.1990",
  startDate: "01.04.2021",
  manager: "Max Keller",
  employmentType: "Vollzeit",
  salary: {
    gross: 72000,
    net: 48000
  },
  vacation: {
    total: 30,
    taken: 12,
    remaining: 18
  },
  workingHours: {
    weekly: 40,
    thisMonth: 152,
    overtime: 8
  },
  skills: [
    { name: "React", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Node.js", level: 85 },
    { name: "Python", level: 70 },
    { name: "AWS", level: 75 },
  ],
  certifications: [
    { name: "AWS Certified Developer", date: "2023" },
    { name: "Scrum Master", date: "2022" },
  ],
  education: [
    { degree: "M.Sc. Informatik", institution: "TU Berlin", year: "2015" },
    { degree: "B.Sc. Informatik", institution: "TU Berlin", year: "2013" },
  ],
  projects: [
    { name: "E-Commerce Plattform", role: "Lead Developer", status: "Aktiv" },
    { name: "Mobile App", role: "Developer", status: "Aktiv" },
    { name: "CRM System", role: "Developer", status: "Abgeschlossen" },
  ],
  documents: [
    { name: "Arbeitsvertrag.pdf", date: "01.04.2021" },
    { name: "Gehaltsnachweis_Jan_2024.pdf", date: "31.01.2024" },
    { name: "Zeugnis_AWS.pdf", date: "15.06.2023" },
  ],
  timeOff: [
    { type: "Urlaub", from: "15.02.2024", to: "22.02.2024", days: 6, status: "Genehmigt" },
    { type: "Urlaub", from: "24.12.2023", to: "31.12.2023", days: 5, status: "Genommen" },
  ]
};

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/employees"],
    queryFn: () => api.get<any>("/employees"),
  });
  const initialOnboardingItems = apiData?.data || mockOnboardingItems;

  const [onboardingItems, setOnboardingItems] = useState<OnboardingItem[]>(initialOnboardingItems);
  const [showOffboardingDialog, setShowOffboardingDialog] = useState(false);

  // Calculate onboarding progress
  const completedCount = onboardingItems.filter(item => item.completed).length;
  const totalCount = onboardingItems.length;
  const onboardingProgress = Math.round((completedCount / totalCount) * 100);

  // Group onboarding items by category
  const groupedItems = onboardingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, OnboardingItem[]>);

  const handleToggleOnboardingItem = (itemId: string) => {
    setOnboardingItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const completed = !item.completed;
        return {
          ...item,
          completed,
          completedDate: completed ? new Date().toLocaleDateString('de-CH') : undefined,
          completedBy: completed ? "Aktueller Benutzer" : undefined,
        };
      }
      return item;
    }));
    toast.success("Onboarding-Status aktualisiert");
  };

  const handleSendEmail = () => {
    window.location.href = `mailto:${employeeData.email}`;
    toast.success("E-Mail-Programm wird geöffnet");
  };

  const handleEdit = () => {
    toast.info("Bearbeitungsmodus wird geladen...");
    // In real app: navigate(`/hr/${id}/edit`)
  };

  const handleUploadDocument = () => {
    toast.success("Dokument-Upload wird geöffnet");
  };

  const handleSalaryAdjustment = () => {
    toast.info("Gehaltsanpassung wird vorbereitet");
    navigate("/payroll");
  };

  const handleRequestVacation = () => {
    toast.info("Urlaubsantrag wird erstellt");
    navigate("/absences/new");
  };

  const handleDeactivate = () => {
    setShowOffboardingDialog(true);
  };

  const handleStartOffboarding = () => {
    // Reset onboarding items to offboarding checklist
    setOnboardingItems([
      { id: "off-1", category: "IT & Rückgabe", title: "Laptop/PC zurückgeben", description: "Hardware einsammeln und inventarisieren", icon: Laptop, completed: false },
      { id: "off-2", category: "IT & Rückgabe", title: "E-Mail-Zugang deaktivieren", description: "Konto sperren, Weiterleitung einrichten", icon: Mail, completed: false },
      { id: "off-3", category: "IT & Rückgabe", title: "Software-Lizenzen entfernen", description: "Zugänge zu Tools widerrufen", icon: Key, completed: false },
      { id: "off-4", category: "IT & Rückgabe", title: "Schlüssel/Badge einziehen", description: "Gebäudezugang sperren", icon: Key, completed: false },
      { id: "off-5", category: "Dokumente", title: "Arbeitszeugnis erstellen", description: "Zeugnis vorbereiten und unterzeichnen", icon: FileText, completed: false },
      { id: "off-6", category: "Dokumente", title: "Lohnabrechnung finalisieren", description: "Letzte Abrechnung mit Ferien-/Überzeitausgleich", icon: ClipboardList, completed: false },
      { id: "off-7", category: "Dokumente", title: "Austrittsgespräch führen", description: "Feedback und Übergabe besprechen", icon: Users, completed: false },
      { id: "off-8", category: "Wissenstransfer", title: "Dokumentation übergeben", description: "Wichtige Infos an Nachfolger/Team", icon: BookOpen, completed: false },
      { id: "off-9", category: "Wissenstransfer", title: "Projekte übergeben", description: "Offene Tasks und Verantwortlichkeiten", icon: Briefcase, completed: false },
      { id: "off-10", category: "Administrativ", title: "Sozialversicherung abmelden", description: "AHV/Pensionskasse informieren", icon: Shield, completed: false },
    ]);
    setShowOffboardingDialog(false);
    toast.success("Offboarding-Prozess gestartet", {
      description: "Die Checkliste wurde auf Offboarding-Aufgaben umgestellt."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/hr">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {employeeData.firstName[0]}{employeeData.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold">
                  {employeeData.firstName} {employeeData.lastName}
                </h1>
                <Badge className="bg-success/10 text-success">{employeeData.status}</Badge>
              </div>
              <p className="text-muted-foreground">{employeeData.position} • {employeeData.department}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            E-Mail
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleUploadDocument}>
                <Download className="h-4 w-4 mr-2" />
                Dokument hochladen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSalaryAdjustment}>
                <FileText className="h-4 w-4 mr-2" />
                Gehaltsanpassung
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRequestVacation}>
                <CalendarDays className="h-4 w-4 mr-2" />
                Urlaub beantragen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDeactivate}>
                <UserX className="h-4 w-4 mr-2" />
                Deaktivieren
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{employeeData.vacation.remaining}</div>
                <p className="text-sm text-muted-foreground">Resturlaub</p>
              </div>
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={(employeeData.vacation.taken / employeeData.vacation.total) * 100} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-1">{employeeData.vacation.taken} von {employeeData.vacation.total} Tagen genommen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{employeeData.workingHours.thisMonth}h</div>
                <p className="text-sm text-muted-foreground">Stunden (Monat)</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-warning mt-2">+{employeeData.workingHours.overtime}h Überstunden</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{employeeData.projects.filter(p => p.status === "Aktiv").length}</div>
                <p className="text-sm text-muted-foreground">Aktive Projekte</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{employeeData.certifications.length}</div>
                <p className="text-sm text-muted-foreground">Zertifikate</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="projects">Projekte</TabsTrigger>
          <TabsTrigger value="timeoff">Abwesenheiten</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
          <TabsTrigger value="salary">Gehalt</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contact & Personal */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Persönliche Informationen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">E-MAIL</p>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{employeeData.email}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">TELEFON</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{employeeData.phone}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">ADRESSE</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{employeeData.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">GEBURTSDATUM</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{employeeData.birthDate}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">EINTRITTSDATUM</p>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{employeeData.startDate}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">VORGESETZTER</p>
                      <span>{employeeData.manager}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Anstellung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Beschäftigungsart</span>
                  <Badge variant="outline">{employeeData.employmentType}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wochenstunden</span>
                  <span className="font-medium">{employeeData.workingHours.weekly}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Abteilung</span>
                  <span className="font-medium">{employeeData.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Position</span>
                  <span className="font-medium">{employeeData.position}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Fähigkeiten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {employeeData.skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education & Certifications */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Ausbildung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employeeData.education.map((edu, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      </div>
                      <Badge variant="outline">{edu.year}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Zertifikate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employeeData.certifications.map((cert, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <p className="font-medium">{cert.name}</p>
                      <Badge variant="outline">{cert.date}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-6">
          {/* Onboarding Progress Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Onboarding-Fortschritt
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {completedCount} von {totalCount} Aufgaben erledigt
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">{onboardingProgress}%</span>
                  <p className="text-sm text-muted-foreground">abgeschlossen</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={onboardingProgress} className="h-3" />
            </CardContent>
          </Card>

          {/* Grouped Onboarding Items */}
          {Object.entries(groupedItems).map(([category, items]) => {
            const categoryCompleted = items.filter(i => i.completed).length;
            const CategoryIcon = items[0]?.icon || ClipboardList;
            
            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                      {category}
                    </CardTitle>
                    <Badge variant={categoryCompleted === items.length ? "default" : "secondary"}>
                      {categoryCompleted}/{items.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                          item.completed ? 'bg-success/5 border-success/20' : 'bg-background'
                        }`}
                        onClick={() => handleToggleOnboardingItem(item.id)}
                      >
                        <div className="pt-0.5">
                          {item.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.title}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          {item.completed && item.completedDate && (
                            <p className="text-xs text-success mt-1">
                              ✓ Erledigt am {item.completedDate} von {item.completedBy}
                            </p>
                          )}
                        </div>
                        <item.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projektbeteiligung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeData.projects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <Link to="/projects/1" className="font-medium hover:text-primary">{project.name}</Link>
                      <p className="text-sm text-muted-foreground">{project.role}</p>
                    </div>
                    <Badge className={project.status === "Aktiv" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeoff">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Abwesenheiten</CardTitle>
              <Button size="sm">Urlaub beantragen</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeData.timeOff.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">{entry.type}</p>
                      <p className="text-sm text-muted-foreground">{entry.from} - {entry.to}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{entry.days} Tage</p>
                      <Badge className={entry.status === "Genehmigt" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                        {entry.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dokumente</CardTitle>
              <Button size="sm">Hochladen</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.date}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle>Gehaltsinformationen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Bruttojahresgehalt</p>
                  <p className="text-3xl font-bold">CHF {employeeData.salary.gross.toLocaleString("de-CH")}</p>
                </div>
                <div className="p-6 rounded-xl bg-success/5 border border-success/20">
                  <p className="text-sm text-muted-foreground mb-1">Nettojahresgehalt (ca.)</p>
                  <p className="text-3xl font-bold text-success">CHF {employeeData.salary.net.toLocaleString("de-CH")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Offboarding Dialog */}
      <Dialog open={showOffboardingDialog} onOpenChange={setShowOffboardingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-destructive" />
              Offboarding starten
            </DialogTitle>
            <DialogDescription>
              Dies startet den Offboarding-Prozess für {employeeData.firstName} {employeeData.lastName}. 
              Die Onboarding-Checkliste wird durch eine Offboarding-Checkliste ersetzt.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm font-medium text-warning">Wichtige Hinweise:</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Alle IT-Zugänge müssen deaktiviert werden</li>
                <li>Firmeneigentum muss zurückgegeben werden</li>
                <li>Ein Arbeitszeugnis muss erstellt werden</li>
                <li>Wissenstransfer sollte dokumentiert werden</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOffboardingDialog(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleStartOffboarding}>
              <UserX className="h-4 w-4 mr-2" />
              Offboarding starten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDetail;
