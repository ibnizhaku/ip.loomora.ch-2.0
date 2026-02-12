import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Banknote,
  FileText,
  Mail,
  Phone,
  Building2,
  Eye,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Debtor {
  id: string;
  number: string;
  name: string;
  company: string;
  totalReceivables: number;
  openAmount: number;
  overdueAmount: number;
  lastPayment: string;
  paymentTerms: number;
  creditLimit: number;
  status: "good" | "warning" | "critical";
  invoiceCount: number;
}

const debtors: Debtor[] = [
  {
    id: "1",
    number: "DEB-10001",
    name: "Thomas Müller",
    company: "TechStart GmbH",
    totalReceivables: 45000,
    openAmount: 12500,
    overdueAmount: 0,
    lastPayment: "2024-01-15",
    paymentTerms: 30,
    creditLimit: 50000,
    status: "good",
    invoiceCount: 8,
  },
  {
    id: "2",
    number: "DEB-10002",
    name: "Lisa Weber",
    company: "Digital Solutions AG",
    totalReceivables: 78000,
    openAmount: 23400,
    overdueAmount: 5600,
    lastPayment: "2024-01-10",
    paymentTerms: 14,
    creditLimit: 80000,
    status: "warning",
    invoiceCount: 12,
  },
  {
    id: "3",
    number: "DEB-10003",
    name: "Michael Schneider",
    company: "Innovation Labs",
    totalReceivables: 34500,
    openAmount: 8900,
    overdueAmount: 8900,
    lastPayment: "2023-12-20",
    paymentTerms: 30,
    creditLimit: 40000,
    status: "critical",
    invoiceCount: 5,
  },
  {
    id: "4",
    number: "DEB-10004",
    name: "Sandra Fischer",
    company: "Cloud Systems KG",
    totalReceivables: 156000,
    openAmount: 45000,
    overdueAmount: 0,
    lastPayment: "2024-01-18",
    paymentTerms: 45,
    creditLimit: 200000,
    status: "good",
    invoiceCount: 24,
  },
  {
    id: "5",
    number: "DEB-10005",
    name: "Peter Wagner",
    company: "Smart Factory GmbH",
    totalReceivables: 67800,
    openAmount: 18500,
    overdueAmount: 3200,
    lastPayment: "2024-01-05",
    paymentTerms: 30,
    creditLimit: 75000,
    status: "warning",
    invoiceCount: 15,
  },
];

const openInvoices = [
  { id: "RE-2024-0156", debtor: "TechStart GmbH", amount: 4500, dueDate: "2024-02-15", daysOpen: 0 },
  { id: "RE-2024-0148", debtor: "Digital Solutions AG", amount: 8900, dueDate: "2024-01-25", daysOpen: 5 },
  { id: "RE-2024-0142", debtor: "Digital Solutions AG", amount: 5600, dueDate: "2024-01-10", daysOpen: 20 },
  { id: "RE-2024-0138", debtor: "Innovation Labs", amount: 8900, dueDate: "2024-01-05", daysOpen: 25 },
  { id: "RE-2024-0155", debtor: "Cloud Systems KG", amount: 12000, dueDate: "2024-03-01", daysOpen: 0 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "good":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "good":
      return "Gut";
    case "warning":
      return "Mahnung";
    case "critical":
      return "Kritisch";
    default:
      return status;
  }
};

export default function Debtors() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const totalReceivables = debtors.reduce((sum, d) => sum + d.openAmount, 0);
  const totalOverdue = debtors.reduce((sum, d) => sum + d.overdueAmount, 0);
  const criticalCount = debtors.filter((d) => d.status === "critical").length;

  const filteredDebtors = debtors.filter(
    (debtor) =>
      debtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debtor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      debtor.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debitoren</h1>
          <p className="text-muted-foreground">
            Forderungen und Kundenkonten verwalten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/customers")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Zu Kunden
          </Button>
          <Button onClick={() => navigate("/customers/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Debitor
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Forderungen</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {totalReceivables.toLocaleString("de-CH")}
            </div>
            <p className="text-xs text-muted-foreground">
              {debtors.length} Debitoren
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
              {((totalOverdue / totalReceivables) * 100).toFixed(1)}% der Forderungen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Zahlungsziel</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28 Tage</div>
            <p className="text-xs text-muted-foreground">
              Ø DSO (Days Sales Outstanding)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritische Konten</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">
              Erfordern Maßnahmen
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Alle Debitoren</TabsTrigger>
            <TabsTrigger value="overdue">Überfällig</TabsTrigger>
            <TabsTrigger value="invoices">Offene Rechnungen</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Debitor suchen..."
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
                  <TableHead>Debitor-Nr.</TableHead>
                  <TableHead>Firma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Offen</TableHead>
                  <TableHead className="text-right">Überfällig</TableHead>
                  <TableHead className="text-right">Kreditlimit</TableHead>
                  <TableHead>Zahlungsziel</TableHead>
                  <TableHead>Letzte Zahlung</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDebtors.map((debtor) => (
                  <TableRow key={debtor.id}>
                    <TableCell className="font-mono text-sm">{debtor.number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{debtor.company}</p>
                        <p className="text-xs text-muted-foreground">{debtor.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(debtor.status)} variant="secondary">
                        {getStatusLabel(debtor.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      CHF {debtor.openAmount.toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell className="text-right">
                      {debtor.overdueAmount > 0 ? (
                        <span className="text-destructive font-medium">
                          CHF {debtor.overdueAmount.toLocaleString("de-CH")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <span>CHF {debtor.creditLimit.toLocaleString("de-CH")}</span>
                        <Progress
                          value={(debtor.openAmount / debtor.creditLimit) * 100}
                          className="mt-1 h-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{debtor.paymentTerms} Tage</TableCell>
                    <TableCell>
                      {new Date(debtor.lastPayment).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4" />
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

        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Debitor</TableHead>
                  <TableHead className="text-right">Überfälliger Betrag</TableHead>
                  <TableHead>Tage überfällig</TableHead>
                  <TableHead>Mahnstufe</TableHead>
                  <TableHead>Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debtors
                  .filter((d) => d.overdueAmount > 0)
                  .map((debtor) => (
                    <TableRow key={debtor.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{debtor.company}</p>
                          <p className="text-xs text-muted-foreground">{debtor.number}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        CHF {debtor.overdueAmount.toLocaleString("de-CH")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {debtor.status === "critical" ? "> 30 Tage" : "15-30 Tage"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {debtor.status === "critical" ? "2. Mahnung" : "1. Mahnung"}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Mail className="mr-2 h-3 w-3" />
                          Mahnung senden
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rechnung</TableHead>
                  <TableHead>Debitor</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Fällig am</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                    <TableCell className="font-medium">{typeof invoice.debtor === 'object' ? invoice.debtor?.name || invoice.debtor?.companyName : invoice.debtor}</TableCell>
                    <TableCell className="text-right font-medium">
                      CHF {invoice.amount.toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell>
                      {invoice.daysOpen === 0 ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Offen
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {invoice.daysOpen} Tage überfällig
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
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
