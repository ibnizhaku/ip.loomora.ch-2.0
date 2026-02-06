import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Download,
  Send,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Upload,
  Euro,
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
import { toast } from "sonner";

interface SepaPayment {
  id: string;
  type: "credit-transfer" | "direct-debit";
  reference: string;
  recipient: string;
  iban: string;
  amount: number;
  purpose: string;
  executionDate: string;
  status: "draft" | "pending" | "executed" | "failed" | "cancelled";
  linkedDocument?: string;
}

const payments: SepaPayment[] = [
  {
    id: "1",
    type: "credit-transfer",
    reference: "SEPA-2024-0089",
    recipient: "Software AG",
    iban: "DE89 3704 0044 0532 0130 00",
    amount: 2500.00,
    purpose: "Rechnung ER-2024-044",
    executionDate: "05.02.2024",
    status: "pending",
    linkedDocument: "ER-2024-044",
  },
  {
    id: "2",
    type: "credit-transfer",
    reference: "SEPA-2024-0088",
    recipient: "Office Supplies GmbH",
    iban: "DE55 1234 5678 9012 3456 78",
    amount: 850.00,
    purpose: "Rechnung ER-2024-038",
    executionDate: "05.02.2024",
    status: "pending",
    linkedDocument: "ER-2024-038",
  },
  {
    id: "3",
    type: "credit-transfer",
    reference: "SEPA-2024-0087",
    recipient: "Energie Versorger",
    iban: "DE44 2345 6789 0123 4567 89",
    amount: 1200.00,
    purpose: "Abschlag Februar",
    executionDate: "01.02.2024",
    status: "executed",
  },
  {
    id: "4",
    type: "direct-debit",
    reference: "SEPA-DD-2024-015",
    recipient: "Fashion Store GmbH",
    iban: "DE33 3456 7890 1234 5678 90",
    amount: 15000.00,
    purpose: "Rechnung RE-2024-089",
    executionDate: "10.02.2024",
    status: "draft",
    linkedDocument: "RE-2024-089",
  },
  {
    id: "5",
    type: "credit-transfer",
    reference: "SEPA-2024-0085",
    recipient: "Marketing Agentur",
    iban: "DE22 4567 8901 2345 6789 01",
    amount: 3500.00,
    purpose: "Kampagne Q1",
    executionDate: "28.01.2024",
    status: "failed",
  },
];

const typeStyles = {
  "credit-transfer": "bg-blue-500/10 text-blue-600",
  "direct-debit": "bg-purple-500/10 text-purple-600",
};

const typeLabels = {
  "credit-transfer": "Überweisung",
  "direct-debit": "Lastschrift",
};

const statusStyles = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  executed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const statusLabels = {
  draft: "Entwurf",
  pending: "Ausstehend",
  executed: "Ausgeführt",
  failed: "Fehlgeschlagen",
  cancelled: "Storniert",
};

const statusIcons = {
  draft: Clock,
  pending: Clock,
  executed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
};

export default function SepaPayments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("outgoing");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentList, setPaymentList] = useState(payments);

  const outgoingPayments = paymentList.filter((p) => p.type === "credit-transfer");
  const incomingPayments = paymentList.filter((p) => p.type === "direct-debit");
  
  const pendingTotal = paymentList
    .filter((p) => p.status === "pending")
    .reduce((acc, p) => acc + p.amount, 0);

  const handleCancel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPaymentList(paymentList.map(p => 
      p.id === id ? { ...p, status: "cancelled" as const } : p
    ));
    toast.success("Zahlung storniert");
  };

  const handleApprove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPaymentList(paymentList.map(p => 
      p.id === id ? { ...p, status: "pending" as const } : p
    ));
    toast.success("Zahlung freigegeben");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            SEPA-Zahlungsverkehr
          </h1>
          <p className="text-muted-foreground">
            Überweisungen und Lastschriften verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => toast.success("SEPA-XML Import...")}>
            <Upload className="h-4 w-4" />
            SEPA-XML Import
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => toast.success("SEPA-XML Export...")}>
            <Download className="h-4 w-4" />
            SEPA-XML Export
          </Button>
          <Button className="gap-2" onClick={() => navigate("/sepa-payments/new")}>
            <Plus className="h-4 w-4" />
            Neue Zahlung
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zahlungen gesamt</p>
              <p className="text-2xl font-bold">{payments.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausstehend</p>
              <p className="text-2xl font-bold text-warning">CHF {pendingTotal.toLocaleString("de-CH")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausgeführt</p>
              <p className="text-2xl font-bold">
                {payments.filter((p) => p.status === "executed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fehlgeschlagen</p>
              <p className="text-2xl font-bold text-destructive">
                {payments.filter((p) => p.status === "failed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="outgoing" className="gap-2">
              <Send className="h-4 w-4" />
              Überweisungen ({outgoingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2">
              <Euro className="h-4 w-4" />
              Lastschriften ({incomingPayments.length})
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

        <TabsContent value="outgoing" className="mt-4">
          <div className="rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referenz</TableHead>
                  <TableHead>Empfänger</TableHead>
                  <TableHead>IBAN</TableHead>
                  <TableHead>Verwendungszweck</TableHead>
                  <TableHead>Ausführung</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outgoingPayments.map((payment, index) => {
                  const StatusIcon = statusIcons[payment.status];
                  
                  return (
                    <TableRow
                      key={payment.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <span className="font-mono font-medium">{payment.reference}</span>
                      </TableCell>
                      <TableCell className="font-medium">{payment.recipient}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{payment.iban}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{payment.purpose}</p>
                          {payment.linkedDocument && (
                            <p className="text-xs text-muted-foreground">
                              Beleg: {payment.linkedDocument}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{payment.executionDate}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-destructive">
                        -CHF {payment.amount.toLocaleString("de-CH")}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", statusStyles[payment.status])}>
                          <StatusIcon className="h-3 w-3" />
                          {statusLabels[payment.status]}
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
                              Details
                            </DropdownMenuItem>
                            {payment.status === "draft" && (
                              <>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Bearbeiten
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-success">
                                  <Send className="h-4 w-4 mr-2" />
                                  Freigeben
                                </DropdownMenuItem>
                              </>
                            )}
                            {payment.status === "pending" && (
                              <DropdownMenuItem className="text-destructive">
                                <XCircle className="h-4 w-4 mr-2" />
                                Stornieren
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="incoming" className="mt-4">
          <div className="rounded-2xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referenz</TableHead>
                  <TableHead>Zahlungspflichtiger</TableHead>
                  <TableHead>IBAN</TableHead>
                  <TableHead>Verwendungszweck</TableHead>
                  <TableHead>Einzugsdatum</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomingPayments.map((payment, index) => {
                  const StatusIcon = statusIcons[payment.status];
                  
                  return (
                    <TableRow
                      key={payment.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <span className="font-mono font-medium">{payment.reference}</span>
                      </TableCell>
                      <TableCell className="font-medium">{payment.recipient}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{payment.iban}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{payment.purpose}</p>
                          {payment.linkedDocument && (
                            <p className="text-xs text-muted-foreground">
                              Beleg: {payment.linkedDocument}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{payment.executionDate}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-success">
                        +CHF {payment.amount.toLocaleString("de-CH")}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", statusStyles[payment.status])}>
                          <StatusIcon className="h-3 w-3" />
                          {statusLabels[payment.status]}
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
                              Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
