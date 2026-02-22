import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Megaphone, Users, Mail, TrendingUp, Calendar, Target, BarChart3, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useCampaign } from "@/hooks/use-marketing";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const statusColors: Record<string, string> = {
  aktiv: "bg-success/10 text-success",
  active: "bg-success/10 text-success",
  ACTIVE: "bg-success/10 text-success",
  geplant: "bg-info/10 text-info",
  scheduled: "bg-info/10 text-info",
  SCHEDULED: "bg-info/10 text-info",
  draft: "bg-muted text-muted-foreground",
  DRAFT: "bg-muted text-muted-foreground",
  beendet: "bg-muted text-muted-foreground",
  completed: "bg-muted text-muted-foreground",
  COMPLETED: "bg-muted text-muted-foreground",
  pausiert: "bg-warning/10 text-warning",
  paused: "bg-warning/10 text-warning",
  PAUSED: "bg-warning/10 text-warning",
};

const leadStatusColors: Record<string, string> = {
  neu: "bg-info/10 text-info",
  NEW: "bg-info/10 text-info",
  kontaktiert: "bg-warning/10 text-warning",
  CONTACTED: "bg-warning/10 text-warning",
  qualifiziert: "bg-success/10 text-success",
  QUALIFIED: "bg-success/10 text-success",
  angebot: "bg-primary/10 text-primary",
  PROPOSAL: "bg-primary/10 text-primary",
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useCampaign(id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(value ?? 0);
  };

  const campaignData = campaign as any;
  const leads = (campaignData?.leads ?? []) as any[];
  const leadCount = campaignData?._count?.leads ?? leads.length;
  const budget = Number(campaignData?.budget ?? 0);
  const spent = Number(campaignData?.spent ?? 0);
  const actualReach = campaignData?.actualReach ?? leadCount;
  const conversions = campaignData?.conversions ?? 0;
  const roi = budget > 0 ? ((spent / budget) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <Button variant="ghost" asChild>
          <Link to="/campaigns">Zurück zu Kampagnen</Link>
        </Button>
        <p className="mt-4 text-muted-foreground">Kampagne nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/campaigns">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{campaignData?.name}</h1>
            <Badge className={statusColors[campaignData?.status] ?? statusColors.draft}>
              {(campaignData?.status || "DRAFT").charAt(0).toUpperCase() + (campaignData?.status || "").slice(1).toLowerCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground">{campaignData?.id} • {campaignData?.type}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/reports")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Report
          </Button>
          <Button onClick={() => navigate("/email-marketing")}>
            <Mail className="mr-2 h-4 w-4" />
            E-Mail senden
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads / Reichweite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{leadCount.toLocaleString("de-CH")}</p>
            <p className="text-xs text-muted-foreground">{actualReach} Reichweite</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Konversionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{conversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Budget / Ausgaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(spent)}</p>
            <p className="text-xs text-muted-foreground">von {formatCurrency(budget)}</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budgetnutzung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{roi.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">ausgegeben</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget & Timeline */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Progress value={budget > 0 ? (spent / budget) * 100 : 0} className="flex-1 h-3" />
              <span className="font-medium">{budget > 0 ? ((spent / budget) * 100).toFixed(0) : 0}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ausgaben: {formatCurrency(spent)}</span>
              <span className="text-muted-foreground">Budget: {formatCurrency(budget)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kampagnen-Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Zeitraum</p>
                <p className="font-medium">
                  {campaignData?.startDate ? format(new Date(campaignData.startDate), "dd.MM.yyyy", { locale: de }) : "—"} - {campaignData?.endDate ? format(new Date(campaignData.endDate), "dd.MM.yyyy", { locale: de }) : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Zielgruppe</p>
                <p className="font-medium">{campaignData?.targetAudience || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Typ</p>
                <Badge variant="outline">{campaignData?.type || "—"}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Beschreibung</p>
                <p className="font-medium line-clamp-2">{campaignData?.description || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generierte Leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Generierte Leads</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firma</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Potenzial</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Noch keine Leads zu dieser Kampagne.
                  </TableCell>
                </TableRow>
              ) : leads.map((lead) => (
                <TableRow 
                  key={lead.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <TableCell className="font-medium">{lead.companyName || "—"}</TableCell>
                  <TableCell>{lead.name || "—"}</TableCell>
                  <TableCell>
                    <Badge className={leadStatusColors[lead.status] ?? leadStatusColors.neu}>
                      {(lead.status || "NEW").charAt(0) + (lead.status || "").slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(lead.estimatedValue ?? 0))}</TableCell>
                  <TableCell className="text-muted-foreground flex items-center justify-between">
                    {lead.createdAt ? format(new Date(lead.createdAt), "dd.MM.yyyy", { locale: de }) : "—"}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Kampagnen-Info */}
      {campaignData?.createdAt && (
        <Card>
          <CardHeader>
            <CardTitle>Erstellt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {format(new Date(campaignData.createdAt), "dd.MM.yyyy HH:mm", { locale: de })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
