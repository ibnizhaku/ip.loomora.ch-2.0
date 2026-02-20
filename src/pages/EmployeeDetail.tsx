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
  Loader2,
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
import { usePayslips } from "@/hooks/use-payroll";
import { useEntityHistory } from "@/hooks/use-audit-log";
import { CreditCard } from "lucide-react";

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


// employeeData is built from backend data inside the component (mock removed)

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ALL hooks MUST be before any conditional returns (React rules of hooks)
  const { data: employee, isLoading, error } = useQuery({
    queryKey: ["/employees", id],
    queryFn: () => api.get<any>(`/employees/${id}`),
    enabled: !!id,
  });

  const { data: payslipsData } = usePayslips({ employeeId: id });
  const { data: auditHistory } = useEntityHistory("EMPLOYEE", id || "");

  const [onboardingItems, setOnboardingItems] = useState<OnboardingItem[]>([]);
  const [showOffboardingDialog, setShowOffboardingDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Mitarbeiter nicht gefunden</p>
        <Link to="/hr" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  // Map backend data to component format (replaces hardcoded mock)
  const employeeData = {
    id: employee.number || employee.id,
    firstName: employee.firstName || '',
    lastName: employee.lastName || '',
    position: employee.position || 'Keine Angabe',
    department: employee.department?.name || 'Keine Abteilung',
    status: employee.status === 'ACTIVE' ? 'Aktiv' : employee.status === 'INACTIVE' ? 'Inaktiv' : employee.status || 'Aktiv',
    email: employee.email || '',
    phone: employee.phone || employee.mobile || '',
    address: [employee.street, [employee.zip, employee.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') || '',
    birthDate: employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('de-CH') : '-',
    startDate: employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('de-CH') : '-',
    manager: employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : '-',
    employmentType: employee.employmentType || 'Vollzeit',
    salary: { 
      monthly: Number(employee.salary) || 0, 
      gross: (Number(employee.salary) || 0) * (employee.contracts?.[0]?.thirteenthMonth ? 13 : 12), 
      net: Math.round((Number(employee.salary) || 0) * (employee.contracts?.[0]?.thirteenthMonth ? 13 : 12) * 0.78) 
    },
    vacation: { total: employee.vacationDays || 25, taken: employee.vacationTaken || 0, remaining: (employee.vacationDays || 25) - (employee.vacationTaken || 0) },
    workingHours: { weekly: Number(employee.workHoursPerWeek) || 42, thisMonth: 0, overtime: 0 },
    contracts: employee.contracts || [],
    skills: employee.skills || [],
    certifications: employee.certifications || [],
    education: employee.education || [],
    projects: employee.projects || [],
    documents: employee.documents || [],
    timeOff: employee.absences?.map((a: any) => ({
      type: a.type || 'Urlaub',
      from: a.startDate ? new Date(a.startDate).toLocaleDateString('de-CH') : '',
      to: a.endDate ? new Date(a.endDate).toLocaleDateString('de-CH') : '',
      days: a.days || 0,
      status: a.status || 'Genehmigt',
    })) || [],
  };

  // Calculate onboarding progress
  const completedCount = onboardingItems.filter(item => item.completed).length;
  const totalCount = onboardingItems.length;
  const onboardingProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
    navigate(`/hr/${id}/edit`);
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
              {employeeData.contracts.length > 0 ? (
                <DropdownMenuItem onClick={() => navigate(`/employee-contracts/${employeeData.contracts[0].id}`)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Vertrag anzeigen
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => navigate(`/employee-contracts/new?employeeId=${id}`)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Vertrag erstellen
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleUploadDocument}>
                <Download className="h-4 w-4 mr-2" />
                Dokument hochladen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSalaryAdjustment}>
                <CreditCard className="h-4 w-4 mr-2" />
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
          <TabsTrigger value="payslips">Lohnabrechnungen</TabsTrigger>
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
            <div className="space-y-4">
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

              {/* Linked User Account */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Benutzerkonto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.userId ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{employee.userName || '–'}</span>
                      </div>
                      {employee.userEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{employee.userEmail}</span>
                        </div>
                      )}
                      <Link to={`/users/${employee.userId}`}>
                        <Button variant="outline" size="sm" className="w-full mt-2 gap-2">
                          <Users className="h-4 w-4" />
                          Benutzerprofil öffnen
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Kein Benutzerkonto verknüpft</p>
                  )}
                </CardContent>
              </Card>
            </div>
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
              {employeeData.projects.length > 0 ? (
                <div className="space-y-4">
                  {employeeData.projects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project.id || project.projectId}`)}>
                      <div>
                        <span className="font-medium hover:text-primary">{project.name}</span>
                        <p className="text-sm text-muted-foreground">{project.role}</p>
                      </div>
                      <Badge className={project.status === "Aktiv" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Keine Projekte zugewiesen</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeoff">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Abwesenheiten</CardTitle>
              <Button size="sm" onClick={() => navigate(`/absences/new?employeeId=${id}`)}>Urlaub beantragen</Button>
            </CardHeader>
            <CardContent>
              {employeeData.timeOff.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Keine Abwesenheiten erfasst</p>
                </div>
              )}
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

        <TabsContent value="payslips">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Lohnabrechnungen
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => navigate("/payroll")}>
                Zur Lohnbuchhaltung
              </Button>
            </CardHeader>
            <CardContent>
              {payslipsData?.data && payslipsData.data.length > 0 ? (
                <div className="space-y-3">
                  {payslipsData.data.map((slip) => {
                    const statusMap: Record<string, { label: string; class: string }> = {
                      paid: { label: "Ausbezahlt", class: "bg-success/10 text-success" },
                      pending: { label: "Ausstehend", class: "bg-warning/10 text-warning" },
                      draft: { label: "Entwurf", class: "bg-muted text-muted-foreground" },
                    };
                    const st = statusMap[slip.status] || { label: slip.status, class: "bg-muted text-muted-foreground" };
                    return (
                      <div
                        key={slip.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/payroll/payslip/${slip.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{slip.period}</p>
                            <p className="text-sm text-muted-foreground">
                              {slip.paymentDate ? new Date(slip.paymentDate).toLocaleDateString("de-CH") : "Kein Zahlungsdatum"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {slip.netSalary
                                ? new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }).format(slip.netSalary)
                                : "–"}
                            </p>
                            <p className="text-xs text-muted-foreground">Netto</p>
                          </div>
                          <Badge className={st.class}>{st.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Keine Lohnabrechnungen vorhanden</p>
                  <p className="text-sm mt-1">Lohnabrechnungen werden über die Lohnbuchhaltung erstellt.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle>Gehaltsinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="p-6 rounded-xl bg-muted/50 border">
                  <p className="text-sm text-muted-foreground mb-1">Monatslohn (brutto)</p>
                  <p className="text-3xl font-bold">CHF {employeeData.salary.monthly.toLocaleString("de-CH")}</p>
                </div>
                <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Bruttojahresgehalt</p>
                  <p className="text-3xl font-bold">CHF {employeeData.salary.gross.toLocaleString("de-CH")}</p>
                  {employeeData.contracts[0]?.thirteenthMonth && (
                    <p className="text-xs text-muted-foreground mt-1">inkl. 13. Monatslohn</p>
                  )}
                </div>
                <div className="p-6 rounded-xl bg-success/5 border border-success/20">
                  <p className="text-sm text-muted-foreground mb-1">Nettojahresgehalt (ca.)</p>
                  <p className="text-3xl font-bold text-success">CHF {employeeData.salary.net.toLocaleString("de-CH")}</p>
                </div>
              </div>

              {/* Contract details */}
              {employeeData.contracts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">VERTRAGSDETAILS</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex justify-between text-sm p-3 rounded-lg border">
                      <span className="text-muted-foreground">Vertragsart</span>
                      <span className="font-medium capitalize">{employeeData.contracts[0].contractType}</span>
                    </div>
                    <div className="flex justify-between text-sm p-3 rounded-lg border">
                      <span className="text-muted-foreground">Lohnklasse</span>
                      <span className="font-medium">{employeeData.contracts[0].wageClass || '–'}</span>
                    </div>
                    <div className="flex justify-between text-sm p-3 rounded-lg border">
                      <span className="text-muted-foreground">Kündigungsfrist</span>
                      <span className="font-medium">{employeeData.contracts[0].noticePeriod?.replace('_', ' ') || '–'}</span>
                    </div>
                    <div className="flex justify-between text-sm p-3 rounded-lg border">
                      <span className="text-muted-foreground">13. Monatslohn</span>
                      <span className="font-medium">{employeeData.contracts[0].thirteenthMonth ? 'Ja' : 'Nein'}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate(`/employee-contracts/${employeeData.contracts[0].id}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Vertrag öffnen
                  </Button>
                </div>
              )}
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
