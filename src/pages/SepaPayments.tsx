import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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


const typeStyles = {
  "credit-transfer": "bg-blue-500/10 text-blue-600",
  "direct-debit": "bg-purple-500/10 text-purple-600",
};

const typeLabels = {
  "credit-transfer": "Überweisung",
  "direct-debit": "Lastschrift",
};

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  PENDING: "bg-warning/10 text-warning",
  executed: "bg-success/10 text-success",
  COMPLETED: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  FAILED: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  pending: "Ausstehend",
  PENDING: "Ausstehend",
  executed: "Ausgeführt",
  COMPLETED: "Ausgeführt",
  failed: "Fehlgeschlagen",
  FAILED: "Fehlgeschlagen",
  cancelled: "Storniert",
  CANCELLED: "Storniert",
};

const statusIcons: Record<string, any> = {
  draft: Clock,
  pending: Clock,
  PENDING: Clock,
  executed: CheckCircle,
  COMPLETED: CheckCircle,
  failed: XCircle,
  FAILED: XCircle,
  cancelled: XCircle,
  CANCELLED: XCircle,
};

export default function SepaPayments() {
  const navigate = useNavigate();
  const { data: apiData } = useQuery({ queryKey: ["/payments"], queryFn: () => api.get<any>("/payments") });
  const payments = apiData?.data || [];
  const [activeTab, setActiveTab] = useState("outgoing");
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentList, setPaymentList] = useState<any[]>([]);

  // Sync paymentList when API data loads; API uses INCOMING/OUTGOING
  useEffect(() => {
    setPaymentList(payments);
  }, [payments]);

  const outgoingPayments = paymentList.filter((p) => p.type === "credit-transfer" || p.type === "OUTGOING");
  const incomingPayments = paymentList.filter((p) => p.type === "direct-debit" || p.type === "INCOMING");
  
  const pendingTotal = paymentList
    .filter((p) => p.status === "pending" || p.status === "PENDING")
    .reduce((acc, p) => acc + (p.amount || 0), 0);

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
                  const StatusIcon = statusIcons[payment.status] || Clock;
                  
                  return (
                    <TableRow
                      key={payment.id}
                      className="animate-fade-in cursor-pointer hover:bg-muted/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/payments/${payment.id}`)}
                    >
                      <TableCell>
                        <span className="font-mono font-medium">{payment.reference || payment.number || "—"}</span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.recipient || payment.supplier?.name || payment.supplier?.companyName || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{payment.iban || payment.supplier?.iban || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{payment.purpose || payment.notes || "—"}</p>
                          {payment.linkedDocument && (
                            <p className="text-xs text-muted-foreground">
                              Beleg: {payment.linkedDocument}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{payment.executionDate || payment.paymentDate?.split?.("T")[0] || "—"}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-destructive">
                        -CHF {(payment.amount || 0).toLocaleString("de-CH")}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", statusStyles[payment.status] || "bg-muted")}>
                          <StatusIcon className="h-3 w-3" />
                          {statusLabels[payment.status] || payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/payments/${payment.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </DropdownMenuItem>
                            {(payment.status === "draft" || payment.status === "PENDING") && (
                              <>
                                <DropdownMenuItem onClick={() => navigate(`/payments/${payment.id}`)}>
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
                      className="animate-fade-in cursor-pointer hover:bg-muted/50"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => navigate(`/payments/${payment.id}`)}
                    >
                      <TableCell>
                        <span className="font-mono font-medium">{payment.reference || payment.number || "—"}</span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.recipient || payment.customer?.name || payment.customer?.companyName || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{payment.iban || payment.customer?.iban || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{payment.purpose || payment.notes || "—"}</p>
                          {payment.linkedDocument && (
                            <p className="text-xs text-muted-foreground">
                              Beleg: {payment.linkedDocument}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{payment.executionDate || payment.paymentDate?.split?.("T")[0] || "—"}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-success">
                        +CHF {(payment.amount || 0).toLocaleString("de-CH")}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", statusStyles[payment.status] || "bg-muted")}>
                          <StatusIcon className="h-3 w-3" />
                          {statusLabels[payment.status] || payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/payments/${payment.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/payments/${payment.id}`)}>
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
