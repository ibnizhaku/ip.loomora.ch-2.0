import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

const trainingData = {
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

  const statusConfig = getStatusConfig(trainingData.status);
  const confirmedCount = trainingData.participants.filter(p => p.status === "confirmed").length;

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
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button>
            <Users className="h-4 w-4 mr-2" />
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
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/hr/${participant.id}`)}>
                            <User className="h-4 w-4" />
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
    </div>
  );
}
