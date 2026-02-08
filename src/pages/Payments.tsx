import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Wallet,
  Building2,
  MoreHorizontal,
  Eye,
  Edit,
  Link2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  type: "incoming" | "outgoing";
  reference: string;
  counterparty: string;
  description: string;
  amount: number;
  currency: "CHF" | "EUR";
  date: string;
  valueDate: string;
  status: "pending" | "completed" | "matched" | "unmatched";
  linkedDocument?: string;
  bankAccount: string;
}


const statusStyles = {
  pending: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  matched: "bg-info/10 text-info",
  unmatched: "bg-destructive/10 text-destructive",
};

const statusLabels = {
  pending: "Ausstehend",
  completed: "Ausgeführt",
  matched: "Zugeordnet",
  unmatched: "Nicht zugeordnet",
};

export default function Payments() {
  const queryClient = useQueryClient();
  const { data: apiData } = useQuery({ queryKey: ["/payments"], queryFn: () => api.get<any>("/payments") });
  const payments = apiData?.data || [];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/payments"] });
      toast.success("Zahlung erfolgreich gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
    },
  });

  const incomingPayments = payments.filter((p) => p.type === "incoming");
  const outgoingPayments = payments.filter((p) => p.type === "outgoing");
  const unmatchedPayments = payments.filter((p) => p.status === "unmatched");

  const totalIncoming = incomingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutgoing = outgoingPayments.reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = activeTab === "all"
    ? payments
    : activeTab === "incoming"
    ? incomingPayments
    : activeTab === "outgoing"
    ? outgoingPayments
    : unmatchedPayments;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Zahlungsverkehr
          </h1>
          <p className="text-muted-foreground">
            Zahlungsein- und -ausgänge verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Bank-Sync
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Zahlung erfassen
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <ArrowDownLeft className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Eingänge</p>
              <p className="text-2xl font-bold text-success">
                CHF {totalIncoming.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <ArrowUpRight className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausgänge</p>
              <p className="text-2xl font-bold text-destructive">
                CHF {totalOutgoing.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/10">
              <Wallet className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className="text-2xl font-bold">
                CHF {(totalIncoming - totalOutgoing).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nicht zugeordnet</p>
              <p className="text-2xl font-bold text-warning">{unmatchedPayments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Alle ({payments.length})</TabsTrigger>
            <TabsTrigger value="incoming">Eingänge ({incomingPayments.length})</TabsTrigger>
            <TabsTrigger value="outgoing">Ausgänge ({outgoingPayments.length})</TabsTrigger>
            <TabsTrigger value="unmatched" className="text-destructive">
              Nicht zugeordnet ({unmatchedPayments.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-3">
            {filteredPayments.map((payment, index) => (
              <div
                key={payment.id}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      payment.type === "incoming" ? "bg-success/10" : "bg-destructive/10"
                    )}>
                      {payment.type === "incoming" ? (
                        <ArrowDownLeft className="h-6 w-6 text-success" />
                      ) : (
                        <ArrowUpRight className="h-6 w-6 text-destructive" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{payment.counterparty}</h3>
                        <Badge className={statusStyles[payment.status]}>
                          {statusLabels[payment.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {payment.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Datum</p>
                      <p className="font-mono text-sm">{payment.date}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Konto</p>
                      <p className="text-sm">{payment.bankAccount}</p>
                    </div>

                    {payment.linkedDocument && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Beleg</p>
                        <p className="font-mono text-sm text-info">{payment.linkedDocument}</p>
                      </div>
                    )}

                    <div className="text-right min-w-[140px]">
                      <p className="text-sm text-muted-foreground">Betrag</p>
                      <p className={cn(
                        "font-mono font-bold text-lg",
                        payment.type === "incoming" ? "text-success" : "text-destructive"
                      )}>
                        {payment.type === "incoming" ? "+" : "-"}
                        {payment.currency} {payment.amount.toLocaleString()}
                      </p>
                    </div>

                    {payment.status === "unmatched" && (
                      <Button size="sm" className="gap-2">
                        <Link2 className="h-4 w-4" />
                        Zuordnen
                      </Button>
                    )}

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
                          <Link2 className="h-4 w-4 mr-2" />
                          Beleg zuordnen
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Möchten Sie diese Zahlung wirklich löschen?`)) {
                              deleteMutation.mutate(payment.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {payment.reference && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Referenz: <span className="font-mono">{payment.reference}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
