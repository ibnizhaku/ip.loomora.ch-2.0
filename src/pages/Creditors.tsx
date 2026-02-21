import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  Banknote,
  FileText,
  CreditCard,
  Building2,
  Calendar,
  Eye,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Creditor {
  id: string;
  number: string;
  name: string;
  company: string;
  totalPayables: number;
  openAmount: number;
  overdueAmount: number;
  lastPayment: string;
  paymentTerms: number;
  status: "current" | "due_soon" | "overdue";
  invoiceCount: number;
  bankAccount: string;
}




const getStatusColor = (status: string) => {
  switch (status) {
    case "current":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "due_soon":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "overdue":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "current":
      return "Aktuell";
    case "due_soon":
      return "Bald fällig";
    case "overdue":
      return "Überfällig";
    default:
      return status;
  }
};

export default function Creditors() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: apiData, isLoading } = useQuery({
    queryKey: ["/suppliers/creditors"],
    queryFn: () => api.get<any>("/suppliers/creditors"),
  });

  const creditorsList: Creditor[] = (apiData?.data || []).map((c: any) => ({
    id: c.id,
    number: c.number || `KRE-${c.id.slice(-5)}`,
    name: c.name,
    company: c.company || c.name,
    totalPayables: Number(c.totalPayables || 0),
    openAmount: Number(c.openAmount || 0),
    overdueAmount: Number(c.overdueAmount || 0),
    lastPayment: c.lastPayment || "–",
    paymentTerms: c.paymentTerms || 30,
    status: (c.status || "current") as Creditor["status"],
    invoiceCount: c.invoiceCount || 0,
    bankAccount: c.bankAccount || "–",
  }));

  const totalPayables = creditorsList.reduce((sum, c) => sum + c.openAmount, 0);
  const totalOverdue = creditorsList.reduce((sum, c) => sum + c.overdueAmount, 0);
  const overdueCount = creditorsList.filter((c) => c.status === "overdue").length;

  const filteredCreditors = creditorsList.filter(
    (creditor) =>
      creditor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creditor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creditor.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kreditoren</h1>
          <p className="text-muted-foreground">
            Verbindlichkeiten und Lieferantenkonten verwalten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/suppliers")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Zu Lieferanten
          </Button>
          <Button variant="outline" onClick={() => navigate("/sepa-payments")}>
            <CreditCard className="mr-2 h-4 w-4" />
            SEPA-Zahlung
          </Button>
          <Button onClick={() => navigate("/suppliers/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Kreditor
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Verbindlichkeiten</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {totalPayables.toLocaleString("de-CH")}
            </div>
            <p className="text-xs text-muted-foreground">
              {creditorsList.length} Kreditoren
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Überfällig</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              CHF {totalOverdue.toLocaleString("de-CH")}
            </div>
            <p className="text-xs text-muted-foreground">
              {overdueCount} Kreditoren betroffen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fällig diese Woche</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {creditorsList.filter(c => c.status === 'due_soon').reduce((s, c) => s + c.openAmount, 0).toLocaleString('de-CH')}</div>
            <p className="text-xs text-muted-foreground">
              {creditorsList.filter(c => c.status === 'due_soon').length} Kreditoren
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Zahlungsziel</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditorsList.length > 0 ? Math.round(creditorsList.reduce((s, c) => s + c.paymentTerms, 0) / creditorsList.length) : 0} Tage</div>
            <p className="text-xs text-muted-foreground">
              Ø DPO (Days Payable Outstanding)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      {creditorsList.filter(c => c.status === 'due_soon' || c.status === 'overdue').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bald fällige / überfällige Kreditoren</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {creditorsList
                .filter(c => c.status === 'due_soon' || c.status === 'overdue')
                .slice(0, 4)
                .map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Link to={`/suppliers/${c.id}`} className="text-sm font-medium hover:text-primary">
                        {c.company}
                      </Link>
                      <p className="text-xs text-muted-foreground">{c.paymentTerms} Tage Ziel</p>
                    </div>
                    <p className="font-semibold">CHF {c.openAmount.toLocaleString("de-CH")}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Alle Kreditoren</TabsTrigger>
            <TabsTrigger value="bills">Offene Rechnungen</TabsTrigger>
            <TabsTrigger value="overdue">Überfällig</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kreditor suchen..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kreditor-Nr.</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Offen</TableHead>
                  <TableHead className="text-right">Überfällig</TableHead>
                  <TableHead>Zahlungsziel</TableHead>
                  <TableHead>Letzte Zahlung</TableHead>
                  <TableHead>IBAN</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreditors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      {isLoading ? "Wird geladen..." : creditorsList.length === 0 ? "Keine Kreditoren mit offenen Verbindlichkeiten vorhanden." : "Keine Ergebnisse für Ihre Suche."}
                    </TableCell>
                  </TableRow>
                )}
                {filteredCreditors.map((creditor) => (
                  <TableRow key={creditor.id}>
                    <TableCell className="font-mono text-sm">{creditor.number}</TableCell>
                    <TableCell>
                      <div>
                        <Link to={`/suppliers/${creditor.id}`} className="font-medium hover:text-primary" onClick={(e) => e.stopPropagation()}>
                          {creditor.company}
                        </Link>
                        <p className="text-xs text-muted-foreground">{creditor.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(creditor.status)} variant="secondary">
                        {getStatusLabel(creditor.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      CHF {creditor.openAmount.toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell className="text-right">
                      {creditor.overdueAmount > 0 ? (
                        <span className="text-destructive font-medium">
                          CHF {creditor.overdueAmount.toLocaleString("de-CH")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{creditor.paymentTerms} Tage</TableCell>
                    <TableCell>
                      {new Date(creditor.lastPayment).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {creditor.bankAccount.substring(0, 12)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Offene Eingangsrechnungen</p>
                <p className="text-sm mt-1">Alle offenen Eingangsrechnungen finden Sie in der Eingangsrechnungsverwaltung.</p>
                <Button className="mt-4" onClick={() => navigate("/purchase-invoices")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Zu den Eingangsrechnungen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kreditor</TableHead>
                  <TableHead className="text-right">Überfälliger Betrag</TableHead>
                  <TableHead>Tage überfällig</TableHead>
                  <TableHead>Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditorsList
                  .filter((c) => c.overdueAmount > 0)
                  .map((creditor) => (
                    <TableRow key={creditor.id}>
                      <TableCell>
                        <div>
                          <Link to={`/suppliers/${creditor.id}`} className="font-medium hover:text-primary" onClick={(e) => e.stopPropagation()}>
                            {creditor.company}
                          </Link>
                          <p className="text-xs text-muted-foreground">{creditor.number}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        CHF {creditor.overdueAmount.toLocaleString("de-CH")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {creditor.id === "3" ? "20 Tage" : "5 Tage"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm">
                          <CreditCard className="mr-2 h-3 w-3" />
                          Jetzt zahlen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
