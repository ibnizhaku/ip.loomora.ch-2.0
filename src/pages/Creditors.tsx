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

const creditors: Creditor[] = [
  {
    id: "1",
    number: "KRE-20001",
    name: "Hans Meier",
    company: "Meier Elektronik GmbH",
    totalPayables: 89000,
    openAmount: 23400,
    overdueAmount: 0,
    lastPayment: "2024-01-18",
    paymentTerms: 30,
    status: "current",
    invoiceCount: 12,
    bankAccount: "DE89 3704 0044 0532 0130 00",
  },
  {
    id: "2",
    number: "KRE-20002",
    name: "Petra Schmidt",
    company: "Schmidt Bürobedarf",
    totalPayables: 12500,
    openAmount: 4500,
    overdueAmount: 0,
    lastPayment: "2024-01-15",
    paymentTerms: 14,
    status: "due_soon",
    invoiceCount: 8,
    bankAccount: "DE89 3704 0044 0532 0130 01",
  },
  {
    id: "3",
    number: "KRE-20003",
    name: "Klaus Weber",
    company: "Weber Logistics AG",
    totalPayables: 156000,
    openAmount: 45000,
    overdueAmount: 12000,
    lastPayment: "2023-12-20",
    paymentTerms: 30,
    status: "overdue",
    invoiceCount: 24,
    bankAccount: "DE89 3704 0044 0532 0130 02",
  },
  {
    id: "4",
    number: "KRE-20004",
    name: "Anna Bauer",
    company: "Bauer IT Services",
    totalPayables: 67800,
    openAmount: 18500,
    overdueAmount: 0,
    lastPayment: "2024-01-10",
    paymentTerms: 45,
    status: "current",
    invoiceCount: 15,
    bankAccount: "DE89 3704 0044 0532 0130 03",
  },
  {
    id: "5",
    number: "KRE-20005",
    name: "Martin Hoffmann",
    company: "Hoffmann Werkzeuge KG",
    totalPayables: 34500,
    openAmount: 8900,
    overdueAmount: 2500,
    lastPayment: "2024-01-05",
    paymentTerms: 14,
    status: "overdue",
    invoiceCount: 6,
    bankAccount: "DE89 3704 0044 0532 0130 04",
  },
];

const openBills = [
  { id: "ER-2024-0089", creditor: "Meier Elektronik GmbH", amount: 8500, dueDate: "2024-02-15", daysUntilDue: 25 },
  { id: "ER-2024-0092", creditor: "Schmidt Bürobedarf", amount: 2300, dueDate: "2024-01-25", daysUntilDue: 5 },
  { id: "ER-2024-0078", creditor: "Weber Logistics AG", amount: 12000, dueDate: "2024-01-10", daysUntilDue: -10 },
  { id: "ER-2024-0095", creditor: "Bauer IT Services", amount: 6700, dueDate: "2024-02-28", daysUntilDue: 38 },
  { id: "ER-2024-0085", creditor: "Hoffmann Werkzeuge KG", amount: 2500, dueDate: "2024-01-15", daysUntilDue: -5 },
];

const upcomingPayments = [
  { date: "2024-01-25", count: 3, amount: 12500 },
  { date: "2024-01-31", count: 5, amount: 28900 },
  { date: "2024-02-15", count: 8, amount: 45600 },
  { date: "2024-02-28", count: 4, amount: 18700 },
];

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

  const totalPayables = creditors.reduce((sum, c) => sum + c.openAmount, 0);
  const totalOverdue = creditors.reduce((sum, c) => sum + c.overdueAmount, 0);
  const overdueCount = creditors.filter((c) => c.status === "overdue").length;

  const filteredCreditors = creditors.filter(
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
              {creditors.length} Kreditoren
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
            <div className="text-2xl font-bold">CHF 12'500</div>
            <p className="text-xs text-muted-foreground">
              3 Rechnungen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ø Zahlungsziel</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27 Tage</div>
            <p className="text-xs text-muted-foreground">
              Ø DPO (Days Payable Outstanding)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anstehende Zahlungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {upcomingPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(payment.date).toLocaleDateString("de-DE")}
                  </p>
                  <p className="text-xs text-muted-foreground">{payment.count} Rechnungen</p>
                </div>
                <p className="font-semibold">CHF {payment.amount.toLocaleString("de-CH")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                {filteredCreditors.map((creditor) => (
                  <TableRow key={creditor.id}>
                    <TableCell className="font-mono text-sm">{creditor.number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{creditor.company}</p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rechnung</TableHead>
                  <TableHead>Kreditor</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Fällig am</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-mono text-sm">{bill.id}</TableCell>
                    <TableCell className="font-medium">{typeof bill.creditor === 'object' ? bill.creditor?.name || bill.creditor?.companyName : bill.creditor}</TableCell>
                    <TableCell className="text-right font-medium">
                      CHF {bill.amount.toLocaleString("de-CH")}
                    </TableCell>
                    <TableCell>
                      {new Date(bill.dueDate).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell>
                      {bill.daysUntilDue > 7 ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {bill.daysUntilDue} Tage
                        </Badge>
                      ) : bill.daysUntilDue > 0 ? (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="mr-1 h-3 w-3" />
                          {bill.daysUntilDue} Tage
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          {Math.abs(bill.daysUntilDue)} Tage überfällig
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <CreditCard className="mr-2 h-3 w-3" />
                        Zahlen
                      </Button>
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
                  <TableHead>Kreditor</TableHead>
                  <TableHead className="text-right">Überfälliger Betrag</TableHead>
                  <TableHead>Tage überfällig</TableHead>
                  <TableHead>Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditors
                  .filter((c) => c.overdueAmount > 0)
                  .map((creditor) => (
                    <TableRow key={creditor.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{creditor.company}</p>
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
