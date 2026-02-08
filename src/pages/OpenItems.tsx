import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  Building2,
  MoreHorizontal,
  Eye,
  Mail,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface OpenItem {
  id: string;
  type: "receivable" | "payable";
  documentNumber: string;
  documentType: "invoice" | "credit-note";
  partner: string;
  partnerType: "customer" | "supplier";
  issueDate: string;
  dueDate: string;
  amount: number;
  openAmount: number;
  status: "open" | "overdue" | "partial" | "due-soon";
  daysOverdue?: number;
}

const mockOpenItems: OpenItem[] = [
  {
    id: "1",
    type: "receivable",
    documentNumber: "RE-2024-089",
    documentType: "invoice",
    partner: "Fashion Store GmbH",
    partnerType: "customer",
    issueDate: "15.01.2024",
    dueDate: "14.02.2024",
    amount: 15000,
    openAmount: 15000,
    status: "open",
  },
  {
    id: "2",
    type: "receivable",
    documentNumber: "RE-2024-078",
    documentType: "invoice",
    partner: "FinTech Solutions",
    partnerType: "customer",
    issueDate: "05.01.2024",
    dueDate: "04.02.2024",
    amount: 25000,
    openAmount: 25000,
    status: "due-soon",
  },
  {
    id: "3",
    type: "receivable",
    documentNumber: "RE-2024-065",
    documentType: "invoice",
    partner: "Retail Pro AG",
    partnerType: "customer",
    issueDate: "20.12.2023",
    dueDate: "19.01.2024",
    amount: 8500,
    openAmount: 8500,
    status: "overdue",
    daysOverdue: 12,
  },
  {
    id: "4",
    type: "receivable",
    documentNumber: "RE-2024-058",
    documentType: "invoice",
    partner: "Logistics Hub",
    partnerType: "customer",
    issueDate: "10.12.2023",
    dueDate: "09.01.2024",
    amount: 12000,
    openAmount: 6000,
    status: "partial",
    daysOverdue: 22,
  },
  {
    id: "5",
    type: "payable",
    documentNumber: "ER-2024-044",
    documentType: "invoice",
    partner: "Software AG",
    partnerType: "supplier",
    issueDate: "27.01.2024",
    dueDate: "26.02.2024",
    amount: 2500,
    openAmount: 2500,
    status: "open",
  },
  {
    id: "6",
    type: "payable",
    documentNumber: "ER-2024-038",
    documentType: "invoice",
    partner: "Office Supplies GmbH",
    partnerType: "supplier",
    issueDate: "15.01.2024",
    dueDate: "14.02.2024",
    amount: 850,
    openAmount: 850,
    status: "open",
  },
  {
    id: "7",
    type: "payable",
    documentNumber: "ER-2024-025",
    documentType: "invoice",
    partner: "Energie Versorger",
    partnerType: "supplier",
    issueDate: "01.01.2024",
    dueDate: "31.01.2024",
    amount: 1200,
    openAmount: 1200,
    status: "overdue",
    daysOverdue: 1,
  },
];

const statusStyles = {
  open: "bg-primary/10 text-primary",
  "due-soon": "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
  partial: "bg-orange-500/10 text-orange-600",
};

const statusLabels = {
  open: "Offen",
  "due-soon": "Bald fällig",
  overdue: "Überfällig",
  partial: "Teilbezahlt",
};

export default function OpenItems() {
  const [activeTab, setActiveTab] = useState("receivables");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from API
  const { data: apiData } = useQuery({
    queryKey: ["/invoices"],
    queryFn: () => api.get<any>("/invoices"),
  });
  const openItems = apiData?.data || mockOpenItems;

  const receivables = openItems.filter((i) => i.type === "receivable");
  const payables = openItems.filter((i) => i.type === "payable");

  const totalReceivables = receivables.reduce((acc, i) => acc + i.openAmount, 0);
  const totalPayables = payables.reduce((acc, i) => acc + i.openAmount, 0);
  const overdueReceivables = receivables.filter((i) => i.status === "overdue");
  const overduePayables = payables.filter((i) => i.status === "overdue");

  const renderTable = (items: OpenItem[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Beleg</TableHead>
          <TableHead>Partner</TableHead>
          <TableHead>Belegdatum</TableHead>
          <TableHead>Fällig am</TableHead>
          <TableHead className="text-right">Betrag</TableHead>
          <TableHead className="text-right">Offen</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow
            key={item.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TableCell>
              <span className="font-mono font-medium">{item.documentNumber}</span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {item.partnerType === "customer" ? (
                  <Users className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
                <span>{item.partner}</span>
              </div>
            </TableCell>
            <TableCell>{item.issueDate}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {item.dueDate}
                {item.daysOverdue && item.daysOverdue > 0 && (
                  <span className="text-xs text-destructive">
                    (+{item.daysOverdue} Tage)
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right font-mono">
              CHF {item.amount.toLocaleString("de-CH")}
            </TableCell>
            <TableCell className="text-right font-mono font-medium">
              CHF {item.openAmount.toLocaleString("de-CH")}
            </TableCell>
            <TableCell>
              <Badge className={statusStyles[item.status]}>
                {statusLabels[item.status]}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Beleg anzeigen
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Zahlung erfassen
                  </DropdownMenuItem>
                  {item.type === "receivable" && item.status === "overdue" && (
                    <DropdownMenuItem>
                      <Mail className="h-4 w-4 mr-2" />
                      Mahnung senden
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Offene Posten
          </h1>
          <p className="text-muted-foreground">
            Forderungen und Verbindlichkeiten im Überblick
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          OP-Liste exportieren
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <Users className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Forderungen</p>
              <p className="text-2xl font-bold text-success">CHF {totalReceivables.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Überfällig (Debitoren)</p>
              <p className="text-2xl font-bold text-destructive">
                CHF {overdueReceivables.reduce((acc, i) => acc + i.openAmount, 0).toLocaleString("de-CH")}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verbindlichkeiten</p>
              <p className="text-2xl font-bold text-orange-600">CHF {totalPayables.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bald fällig</p>
              <p className="text-2xl font-bold">
                {openItems.filter((i) => i.status === "due-soon").length} Posten
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="receivables" className="gap-2">
              <Users className="h-4 w-4" />
              Forderungen ({receivables.length})
            </TabsTrigger>
            <TabsTrigger value="payables" className="gap-2">
              <Building2 className="h-4 w-4" />
              Verbindlichkeiten ({payables.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                className="pl-10 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="receivables" className="mt-4">
          <div className="rounded-2xl border border-border bg-card">
            {renderTable(receivables)}
          </div>
        </TabsContent>

        <TabsContent value="payables" className="mt-4">
          <div className="rounded-2xl border border-border bg-card">
            {renderTable(payables)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
