import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calendar,
  Users,
  FolderKanban,
  Flag,
  Target,
  Loader2,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useCustomers } from "@/hooks/use-customers";
import { useEmployees } from "@/hooks/use-employees";
import { useCreateProject, useUpdateProject, useAddProjectMilestone } from "@/hooks/use-projects";

interface Milestone {
  id: number | string;
  title: string;
  date: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  customerId: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  budget: number;
  hourlyRate?: number;
  managerId?: string;
}

interface ProjectFormProps {
  mode: 'create' | 'edit';
  defaultCustomerId?: string;
  initialData?: {
    id: string;
    name: string;
    description?: string;
    customerId?: string;
    customer?: { id: string; name: string };
    status: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    spent?: number;
    managerId?: string;
    manager?: { id: string; firstName: string; lastName: string };
    members?: Array<{ employee: { id: string; firstName: string; lastName: string; position?: string } }>;
  };
}

export function ProjectForm({ mode, initialData, defaultCustomerId }: ProjectFormProps) {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const addMilestoneMutation = useAddProjectMilestone();

  const { data: customersData } = useCustomers({ pageSize: 100 });
  const { data: employeesData } = useEmployees({ pageSize: 100 });

  const customers = customersData?.data || [];
  const employees = employeesData?.data || [];

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    customerId: defaultCustomerId || '',
    status: 'PLANNING',
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
    budget: 0,
    hourlyRate: 0,
    managerId: '',
  });

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState({ title: "", date: "" });
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);

  // Initialize form data from initialData (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        customerId: initialData.customerId || initialData.customer?.id || '',
        status: initialData.status?.toUpperCase().replace('-', '_') || 'PLANNING',
        priority: initialData.priority?.toUpperCase() || 'MEDIUM',
        startDate: initialData.startDate?.split('T')[0] || '',
        endDate: initialData.endDate?.split('T')[0] || '',
        budget: initialData.budget || 0,
        managerId: initialData.managerId || initialData.manager?.id || '',
      });
      
      // Set team members
      if (initialData.members) {
        setSelectedTeam(initialData.members.map(m => m.employee.id));
      }
    }
  }, [mode, initialData]);

  const handleInputChange = (field: keyof ProjectFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMilestone = () => {
    if (newMilestone.title.trim() && newMilestone.date) {
      setMilestones([...milestones, { id: Date.now(), ...newMilestone }]);
      setNewMilestone({ title: "", date: "" });
    }
  };

  const removeMilestone = (id: number | string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeam(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Bitte geben Sie einen Projektnamen ein');
      return;
    }

    const projectData = {
      name: formData.name,
      description: formData.description || undefined,
      customerId: formData.customerId || undefined,
      status: formData.status,
      priority: formData.priority,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      budget: formData.budget || undefined,
      managerId: formData.managerId || undefined,
      members: selectedTeam.length > 0 ? selectedTeam : undefined,
    };

    try {
      if (mode === 'edit' && initialData) {
        await updateProject.mutateAsync({ id: initialData.id, data: projectData });
        toast.success('Projekt erfolgreich aktualisiert');
        navigate(`/projects/${initialData.id}`);
      } else {
        const result = await createProject.mutateAsync(projectData);
        // Save milestones after project creation
        if (milestones.length > 0) {
          await Promise.all(
            milestones.map((m) =>
              addMilestoneMutation.mutateAsync({ projectId: result.id, title: m.title, dueDate: m.date || undefined })
            )
          );
        }
        toast.success('Projekt erfolgreich erstellt');
        navigate(`/projects/${result.id}`);
      }
    } catch (error) {
      toast.error(mode === 'edit' ? 'Fehler beim Aktualisieren' : 'Fehler beim Erstellen');
    }
  };

  const isLoading = createProject.isPending || updateProject.isPending || addMilestoneMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">
            {mode === 'edit' ? 'Projekt bearbeiten' : 'Neues Projekt'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'edit' ? 'Ändern Sie die Projektdetails' : 'Erstellen Sie ein neues Projekt'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>Abbrechen</Button>
        <Button className="gap-2" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {mode === 'edit' ? 'Speichern' : 'Projekt erstellen'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                Projektinformationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Projektname *</Label>
                <Input 
                  id="name" 
                  placeholder="z.B. E-Commerce Platform" 
                  className="text-lg"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea 
                  id="description" 
                  placeholder="Beschreiben Sie das Projekt im Detail..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Kunde</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => handleInputChange('customerId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kunde auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.companyName || customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Projektleiter</Label>
                <Select 
                  value={formData.managerId} 
                  onValueChange={(value) => handleInputChange('managerId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Projektleiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team ({selectedTeam.length} ausgewählt)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {employees.map((member: any) => (
                  <div
                    key={member.id}
                    onClick={() => toggleTeamMember(member.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTeam.includes(member.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Checkbox checked={selectedTeam.includes(member.id)} />
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.firstName} {member.lastName}</p>
                      <p className="text-sm text-muted-foreground truncate">{member.position || 'Mitarbeiter'}</p>
                    </div>
                  </div>
                ))}
              </div>
              {employees.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine Mitarbeiter verfügbar
                </p>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Meilensteine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Meilenstein-Titel"
                  value={newMilestone.title}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  className="flex-1"
                />
                <Input 
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                  className="w-40"
                />
                <Button onClick={addMilestone} disabled={!newMilestone.title.trim() || !newMilestone.date}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {milestones.length > 0 && (
                <div className="space-y-2">
                  {milestones.map((milestone, index) => (
                    <div 
                      key={milestone.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">{milestone.date}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {milestones.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Noch keine Meilensteine hinzugefügt
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status & Priorität</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planung</SelectItem>
                    <SelectItem value="ACTIVE">Aktiv</SelectItem>
                    <SelectItem value="ON_HOLD">Pausiert</SelectItem>
                    <SelectItem value="COMPLETED">Abgeschlossen</SelectItem>
                    <SelectItem value="CANCELLED">Abgebrochen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Priorität
                </Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        Niedrig
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-warning" />
                        Mittel
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        Hoch
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Zeitraum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Startdatum</Label>
                <Input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Enddatum</Label>
                <Input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Gesamtbudget (CHF)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  min="0" 
                  step="100"
                  value={formData.budget || ''}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Das Budget kann nach Projektstart angepasst werden.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
