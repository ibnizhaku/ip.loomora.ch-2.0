import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Download,
  MapPin,
  Users,
  Award,
  FileText,
  CheckCircle,
  XCircle,
  User,
  Building2,
  UserPlus,
  Trash2,
} from "lucide-react";

const initialTrainingData = {
  id: "WB-2024-0008",
  title: "Schweissen nach SN EN ISO 9606-1",
  type: "Zertifizierung",
  category: "Fachkompetenz",
  status: "scheduled" as const,
  description: "Schweisserprüfung für Stahlkonstruktionen nach europäischer Norm. Praktische und theoretische Prüfung für MAG-Schweissen (135) in den Positionen PA, PB, PC, PF.",
  provider: {
    name: "SVS Schweizerischer Verein für Schweisstechnik",
    location: "Basel",
    contact: "info@svs.ch",
  },
  schedule: {
    startDate: "2024-04-15",
    endDate: "2024-04-17",
    duration: "3 Tage",
    times: "08:00 - 17:00",
  },
  location: {
    type: "external",
    address: "Grosspeterstrasse 12, 4052 Basel",
    room: "Schulungszentrum SVS",
  },
  costs: {
    coursesFee: 1850.00,
    materials: 150.00,
    travel: 280.00,
    accommodation: 340.00,
    total: 2620.00,
    currency: "CHF",
  },
  certification: {
    name: "Schweisser-Zertifikat EN ISO 9606-1",
    validityYears: 3,
    expiresAt: "2027-04-17",
  },
  participants: [
    { id: "MA-001", name: "Thomas Meier", department: "Produktion", status: "confirmed", result: null },
    { id: "MA-002", name: "Marco Brunner", department: "Produktion", status: "confirmed", result: null },
    { id: "MA-003", name: "Peter Keller", department: "Montage", status: "waitlist", result: null },
  ],
  maxParticipants: 8,
  documents: [
    { name: "Kursausschreibung", type: "info" },
    { name: "Anmeldebestätigung", type: "confirmation" },
    { name: "Prüfungsordnung", type: "regulation" },
  ],
  createdAt: "2024-02-01",
  createdBy: "HR Team",
};

// Available employees for adding
const availableEmployees = [
  { id: "MA-004", name: "Hans Weber", department: "Produktion" },
  { id: "MA-005", name: "Stefan Schmid", department: "Montage" },
  { id: "MA-006", name: "Michael Huber", department: "Produktion" },
  { id: "MA-007", name: "Andreas Müller", department: "Werkstatt" },
  { id: "MA-008", name: "Daniel Fischer", department: "Montage" },
  { id: "MA-009", name: "Reto Steiner", department: "Produktion" },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "scheduled":
      return { label: "Geplant", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" };
    case "ongoing":
      return { label: "Laufend", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
    case "completed":
      return { label: "Abgeschlossen", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "cancelled":
      return { label: "Abgesagt", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-800" };
  }
};

const getParticipantStatusConfig = (status: string) => {
  switch (status) {
    case "confirmed":
      return { label: "Bestätigt", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
    case "waitlist":
      return { label: "Warteliste", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
    case "cancelled":
      return { label: "Abgesagt", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
    default:
      return { label: status, color: "bg-gray-100 text-gray-800" };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(amount);
};

export default function TrainingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trainingData, setTrainingData] = useState(initialTrainingData);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddParticipantsDialog, setShowAddParticipantsDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  const [editForm, setEditForm] = useState({
    title: trainingData.title,
    description: trainingData.description,
    status: trainingData.status as string,
    startDate: trainingData.schedule.startDate,
    endDate: trainingData.schedule.endDate,
    times: trainingData.schedule.times,
    room: trainingData.location.room,
    address: trainingData.location.address,
    coursesFee: trainingData.costs.coursesFee.toString(),
    maxParticipants: trainingData.maxParticipants.toString(),
  });

  const statusConfig = getStatusConfig(trainingData.status);
  const confirmedCount = trainingData.participants.filter(p => p.status === "confirmed").length;

  const handleEditSave = () => {
    const coursesFee = parseFloat(editForm.coursesFee) || 0;
    const newTotal = coursesFee + trainingData.costs.materials + trainingData.costs.travel + trainingData.costs.accommodation;
    
    setTrainingData(prev => ({
      ...prev,
      title: editForm.title,
      description: editForm.description,
      status: editForm.status as typeof prev.status,
      schedule: {
        ...prev.schedule,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        times: editForm.times,
      },
      location: {
        ...prev.location,
        room: editForm.room,
        address: editForm.address,
      },
      costs: {
        ...prev.costs,
        coursesFee,
        total: newTotal,
      },
      maxParticipants: parseInt(editForm.maxParticipants) || prev.maxParticipants,
    }));
    
    setShowEditDialog(false);
    toast.success("Schulung aktualisiert");
  };

  const handleAddParticipants = () => {
    if (selectedEmployees.length === 0) {
      toast.error("Bitte wählen Sie mindestens einen Mitarbeiter aus");
      return;
    }
    
    const newParticipants = selectedEmployees.map(empId => {
      const emp = availableEmployees.find(e => e.id === empId)!;
      const confirmedCount = trainingData.participants.filter(p => p.status === "confirmed").length;
      const willBeOnWaitlist = confirmedCount >= trainingData.maxParticipants;
      
      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        status: willBeOnWaitlist ? "waitlist" : "confirmed",
        result: null,
      };
    });
    
    setTrainingData(prev => ({
      ...prev,
      participants: [...prev.participants, ...newParticipants],
    }));
    
    setShowAddParticipantsDialog(false);
    setSelectedEmployees([]);
    toast.success(`${newParticipants.length} Teilnehmer hinzugefügt`);
  };

  const handleRemoveParticipant = (participantId: string) => {
    setTrainingData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== participantId),
    }));
    toast.info("Teilnehmer entfernt");
  };

  const handleToggleEmployee = (empId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const availableToAdd = availableEmployees.filter(
    emp => !trainingData.participants.some(p => p.id === emp.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/training")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{trainingData.title}</h1>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {trainingData.id} • {trainingData.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button onClick={() => setShowAddParticipantsDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Teilnehmer hinzufügen
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Teilnehmer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{confirmedCount} / {trainingData.maxParticipants}</p>
            <Progress value={(confirmedCount / trainingData.maxParticipants) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dauer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{trainingData.schedule.duration}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kosten gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(trainingData.costs.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kosten pro Person</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(trainingData.costs.total / confirmedCount)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hauptbereich */}
        <div className="lg:col-span-2 space-y-6">
          {/* Beschreibung */}
          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{trainingData.description}</p>
            </CardContent>
          </Card>

          {/* Teilnehmer */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Teilnehmer
                </CardTitle>
                <Badge variant="outline">{confirmedCount} bestätigt</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Abteilung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ergebnis</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingData.participants.map((participant) => {
                    const pStatus = getParticipantStatusConfig(participant.status);
                    return (
                      <TableRow key={participant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {participant.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{participant.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{participant.department}</TableCell>
                        <TableCell>
                          <Badge className={pStatus.color} variant="secondary">
                            {pStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {participant.result === "passed" && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Bestanden
                            </Badge>
                          )}
                          {participant.result === "failed" && (
                            <Badge variant="outline" className="text-red-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Nicht bestanden
                            </Badge>
                          )}
                          {!participant.result && <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveParticipant(participant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Kosten */}
          <Card>
            <CardHeader>
              <CardTitle>Kostenaufstellung</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>Kursgebühren</TableCell>
                    <TableCell className="text-right">{formatCurrency(trainingData.costs.coursesFee)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Materialkosten</TableCell>
                    <TableCell className="text-right">{formatCurrency(trainingData.costs.materials)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Reisekosten</TableCell>
                    <TableCell className="text-right">{formatCurrency(trainingData.costs.travel)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Unterkunft</TableCell>
                    <TableCell className="text-right">{formatCurrency(trainingData.costs.accommodation)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Gesamtkosten</TableCell>
                    <TableCell className="text-right">{formatCurrency(trainingData.costs.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Termin */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Termin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Beginn</span>
                <span>{new Date(trainingData.schedule.startDate).toLocaleDateString("de-CH")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ende</span>
                <span>{new Date(trainingData.schedule.endDate).toLocaleDateString("de-CH")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zeiten</span>
                <span>{trainingData.schedule.times}</span>
              </div>
            </CardContent>
          </Card>

          {/* Ort */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Veranstaltungsort
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{trainingData.location.room}</p>
              <p className="text-muted-foreground">{trainingData.location.address}</p>
            </CardContent>
          </Card>

          {/* Anbieter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Anbieter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{trainingData.provider.name}</p>
              <p className="text-muted-foreground">{trainingData.provider.location}</p>
              <p className="text-muted-foreground">{trainingData.provider.contact}</p>
            </CardContent>
          </Card>

          {/* Zertifizierung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4" />
                Zertifizierung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-medium">{trainingData.certification.name}</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gültigkeit</span>
                <span>{trainingData.certification.validityYears} Jahre</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ablauf</span>
                <span>{new Date(trainingData.certification.expiresAt).toLocaleDateString("de-CH")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Dokumente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Dokumente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trainingData.documents.map((doc, index) => (
                <Button key={index} variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  {doc.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schulung bearbeiten</DialogTitle>
            <DialogDescription>Ändern Sie die Details der Schulung</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Geplant</SelectItem>
                    <SelectItem value="ongoing">Laufend</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="cancelled">Abgesagt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={editForm.maxParticipants}
                  onChange={(e) => setEditForm(prev => ({ ...prev, maxParticipants: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Beginn</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Ende</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="times">Zeiten</Label>
              <Input
                id="times"
                placeholder="z.B. 08:00 - 17:00"
                value={editForm.times}
                onChange={(e) => setEditForm(prev => ({ ...prev, times: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="room">Raum/Ort</Label>
              <Input
                id="room"
                value={editForm.room}
                onChange={(e) => setEditForm(prev => ({ ...prev, room: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coursesFee">Kursgebühren (CHF)</Label>
              <Input
                id="coursesFee"
                type="number"
                step="0.01"
                value={editForm.coursesFee}
                onChange={(e) => setEditForm(prev => ({ ...prev, coursesFee: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleEditSave}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Participants Dialog */}
      <Dialog open={showAddParticipantsDialog} onOpenChange={setShowAddParticipantsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teilnehmer hinzufügen</DialogTitle>
            <DialogDescription>
              Wählen Sie Mitarbeiter aus, die an der Schulung teilnehmen sollen.
              {confirmedCount >= trainingData.maxParticipants && (
                <span className="block text-amber-600 mt-1">
                  Maximale Teilnehmerzahl erreicht. Weitere Anmeldungen werden auf die Warteliste gesetzt.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {availableToAdd.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Keine weiteren Mitarbeiter verfügbar
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableToAdd.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleToggleEmployee(emp.id)}
                  >
                    <Checkbox
                      checked={selectedEmployees.includes(emp.id)}
                      onCheckedChange={() => handleToggleEmployee(emp.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {emp.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddParticipantsDialog(false);
              setSelectedEmployees([]);
            }}>
              Abbrechen
            </Button>
            <Button onClick={handleAddParticipants} disabled={selectedEmployees.length === 0}>
              <UserPlus className="h-4 w-4 mr-2" />
              {selectedEmployees.length} hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
