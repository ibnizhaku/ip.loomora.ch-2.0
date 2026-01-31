import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  FileSignature,
  Building2,
  Calendar,
  Euro,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  MoreHorizontal,
  Bell,
  FileText,
  User,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const contractData = {
  id: "VT-2024-0012",
  title: "Wartungsvertrag Server-Infrastruktur",
  type: "Servicevertrag",
  status: "Aktiv",
  partner: {
    name: "Digital Solutions AG",
    contact: "Thomas Müller",
    type: "Kunde"
  },
  startDate: "01.01.2024",
  endDate: "31.12.2024",
  autoRenewal: true,
  renewalNotice: "3 Monate",
  value: {
    monthly: 2500,
    annual: 30000
  },
  progress: 8, // 8% des Jahres
  daysRemaining: 337,
  services: [
    { name: "24/7 Monitoring", included: true },
    { name: "Monatliche Wartung", included: true },
    { name: "Sicherheitsupdates", included: true },
    { name: "Backup-Management", included: true },
    { name: "Notfall-Support (4h SLA)", included: true },
    { name: "Hardware-Ersatz", included: false },
  ],
  payments: [
    { date: "01.01.2024", amount: 2500, status: "Bezahlt" },
  ],
  documents: [
    { name: "Vertrag_VT-2024-0012.pdf", date: "01.01.2024", size: "245 KB" },
    { name: "SLA_Anhang.pdf", date: "01.01.2024", size: "128 KB" },
    { name: "Leistungsbeschreibung.pdf", date: "01.01.2024", size: "89 KB" },
  ],
  history: [
    { date: "01.01.2024", action: "Vertrag aktiviert", user: "System" },
    { date: "28.12.2023", action: "Vertrag unterzeichnet", user: "Thomas Müller" },
    { date: "20.12.2023", action: "Vertrag erstellt", user: "Max Keller" },
  ],
  notes: "Verlängerung um ein weiteres Jahr geplant. Kunde zufrieden mit bisherigem Service."
};

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Entwurf": { color: "bg-muted text-muted-foreground", icon: FileSignature },
  "Aktiv": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Läuft aus": { color: "bg-warning/10 text-warning", icon: AlertTriangle },
  "Beendet": { color: "bg-muted text-muted-foreground", icon: Clock },
  "Gekündigt": { color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

const ContractDetail = () => {
  const { id } = useParams();
  const status = statusConfig[contractData.status] || statusConfig["Entwurf"];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/contracts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{contractData.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {contractData.status}
              </Badge>
              {contractData.autoRenewal && (
                <Badge variant="outline">Auto-Verlängerung</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{contractData.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Erinnerung
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
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
              <DropdownMenuItem>Verlängern</DropdownMenuItem>
              <DropdownMenuItem>Duplizieren</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Kündigen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Vertragslaufzeit</p>
              <p className="text-lg font-semibold">{contractData.startDate} - {contractData.endDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Verbleibend</p>
              <p className="text-lg font-semibold">{contractData.daysRemaining} Tage</p>
            </div>
          </div>
          <Progress value={contractData.progress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {contractData.progress}% der Laufzeit verstrichen
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="payments">Zahlungen</TabsTrigger>
              <TabsTrigger value="documents">Dokumente</TabsTrigger>
              <TabsTrigger value="history">Verlauf</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Leistungsumfang</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {contractData.services.map((service, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          service.included ? "bg-success/5 border border-success/20" : "bg-muted/50"
                        }`}
                      >
                        {service.included ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className={service.included ? "font-medium" : "text-muted-foreground"}>
                          {service.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Notizen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{contractData.notes}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Zahlungsübersicht</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contractData.payments.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                            <Euro className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium">Monatliche Zahlung</p>
                            <p className="text-sm text-muted-foreground">{payment.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">€{payment.amount.toLocaleString()}</p>
                          <Badge className="bg-success/10 text-success">{payment.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Vertragsdokumente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contractData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">{doc.date} • {doc.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Vertragsverlauf</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contractData.history.map((entry, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <History className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {index < contractData.history.length - 1 && (
                            <div className="w-px h-8 bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium">{entry.action}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{entry.date}</span>
                            <span>•</span>
                            <span>{entry.user}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Partner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vertragspartner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link to="/customers/1" className="font-medium hover:text-primary">
                    {contractData.partner.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{contractData.partner.contact}</p>
                </div>
              </div>
              <Badge variant="secondary">{contractData.partner.type}</Badge>
            </CardContent>
          </Card>

          {/* Financial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vertragswert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Monatlich</span>
                <span className="font-semibold">€{contractData.value.monthly.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Jährlich</span>
                <span className="font-semibold text-primary">€{contractData.value.annual.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Vertragsart</span>
                <span className="font-medium">{contractData.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Startdatum</span>
                <span className="font-medium">{contractData.startDate}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Enddatum</span>
                <span className="font-medium">{contractData.endDate}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kündigungsfrist</span>
                <span className="font-medium">{contractData.renewalNotice}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auto-Verlängerung</span>
                <span className="font-medium">{contractData.autoRenewal ? "Ja" : "Nein"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContractDetail;
