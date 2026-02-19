import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrder, useCreateOrder, useUpdateOrder } from "@/hooks/use-sales";
import { useCompany } from "@/hooks/use-company";
import { useUsers } from "@/hooks/use-users";
import { Loader2 } from "lucide-react";

import { 
  ArrowLeft, 
  ShoppingCart, 
  Calendar, 
  Euro, 
  Building2,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  FileText,
  Printer,
  MoreHorizontal,
  AlertCircle,
  MapPin,
  Download,
  Eye,
  User,
  UserPlus,
  FolderKanban,
  Activity,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { PDFPreviewDialog } from "@/components/documents/PDFPreviewDialog";
import { CreateDeliveryNoteDialog } from "@/components/documents/CreateDeliveryNoteDialog";
import { SalesDocumentData, downloadSalesDocumentPDF } from "@/lib/pdf/sales-document";
import { formatDistanceToNow, parseISO } from "date-fns";
import { de } from "date-fns/locale";

// Unified progress function (synced with Orders.tsx)
function getOrderProgress(status: string): number {
  switch (status?.toUpperCase()) {
    case "DRAFT": return 10;
    case "SENT": return 50;
    case "CONFIRMED": return 100;
    case "CANCELLED": return 0;
    default: return 10;
  }
}

// Status mapping from backend enum to German display labels
const statusLabelMap: Record<string, string> = {
  DRAFT: "Neu",
  SENT: "In Bearbeitung",
  CONFIRMED: "Abgeschlossen",
  CANCELLED: "Storniert",
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch { return dateStr; }
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: de });
  } catch { return ""; }
}

function mapOrderToView(order: any) {
  const items = order.items || [];
  const total = Number(order.total) || 0;
  const paidAmount = Number(order.paidAmount) || 0;
  const rawStatus = order.status || "DRAFT";

  return {
    id: order.number || order.id,
    rawStatus,
    status: statusLabelMap[rawStatus] || rawStatus || "Neu",
    progress: getOrderProgress(rawStatus),
    customer: {
      id: order.customer?.id,
      name: order.customer?.companyName || order.customer?.name || "Unbekannt",
      contact: order.customer?.contactPerson || "",
      address: [order.customer?.street, [order.customer?.zipCode, order.customer?.city].filter(Boolean).join(" ")].filter(Boolean).join(", "),
    },
    quote: order.quote?.number || "",
    quoteId: order.quote?.id || order.quoteId || "",
    projectId: order.projectId || order.project?.id || "",
    projectName: order.project?.name || order.projectName || "",
    projectNumber: order.project?.number || order.projectNumber || "",
    createdAt: formatDate(order.orderDate || order.createdAt),
    createdAtRaw: order.orderDate || order.createdAt || "",
    deliveryDate: formatDate(order.deliveryDate),
    assignedUsers: order.assignedUsers || [],
    notes: order.notes || "",
    positions: items.map((item: any, idx: number) => ({
      id: item.id || String(idx + 1),
      description: item.description || "",
      quantity: item.quantity || 0,
      unit: item.unit || "Stk",
      status: "In Arbeit",
      progress: 0,
    })),
    total,
    paid: paidAmount,
    milestones: [] as { name: string; date: string; completed: boolean }[],
    deliveries: (order.deliveryNotes || []).map((dn: any) => ({
      id: dn.id,
      number: dn.number || dn.id,
      date: formatDate(dn.deliveryDate || dn.createdAt),
      status: dn.status === "DELIVERED" ? "Geliefert" : dn.status === "SHIPPED" ? "Versendet" : "Entwurf",
    })),
    deliveryAddress: order.deliveryAddress || null,
  };
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  "Neu": { color: "bg-info/10 text-info", icon: ShoppingCart },
  "In Bearbeitung": { color: "bg-warning/10 text-warning", icon: Clock },
  "Abgeschlossen": { color: "bg-success/10 text-success", icon: CheckCircle2 },
  "Storniert": { color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const positionStatusColors: Record<string, string> = {
  "Abgeschlossen": "bg-success/10 text-success",
  "In Arbeit": "bg-warning/10 text-warning",
  "Geplant": "bg-muted text-muted-foreground",
};

// Build a local activity log from order data
function getUserName(user: any): string {
  if (!user) return "";
  if (user.firstName || user.lastName) return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (user.name) return user.name;
  if (user.email) return user.email;
  return "";
}

function getUserInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).filter(Boolean).join("").slice(0, 2).toUpperCase() || "?";
}

function buildActivityLog(order: any) {
  const entries: { id: string; text: string; time: string; icon: string; user?: string; initials?: string }[] = [];

  const creatorName = getUserName(order.createdByUser || order.user);

  if (order.createdAt || order.orderDate) {
    entries.push({
      id: "created",
      text: "Auftrag erstellt",
      time: order.orderDate || order.createdAt,
      icon: "create",
      user: creatorName || undefined,
      initials: creatorName ? getUserInitials(creatorName) : undefined,
    });
  }

  if (order.status === "SENT" || order.status === "CONFIRMED" || order.status === "CANCELLED") {
    const updaterName = getUserName(order.updatedByUser || order.user);
    entries.push({
      id: "status",
      text: `Status geändert zu "${statusLabelMap[order.status] || order.status}"`,
      time: order.updatedAt || order.orderDate || order.createdAt,
      icon: "status",
      user: updaterName || undefined,
      initials: updaterName ? getUserInitials(updaterName) : undefined,
    });
  }

  (order.deliveryNotes || []).forEach((dn: any, idx: number) => {
    const dnUserName = getUserName(dn.createdByUser || dn.user);
    entries.push({
      id: `dn-${dn.id || idx}`,
      text: `Lieferschein ${dn.number || ""} erstellt`,
      time: dn.createdAt || "",
      icon: "delivery",
      user: dnUserName || undefined,
      initials: dnUserName ? getUserInitials(dnUserName) : undefined,
    });
  });

  (order.invoices || []).forEach((inv: any, idx: number) => {
    const invUserName = getUserName(inv.createdByUser || inv.user);
    entries.push({
      id: `inv-${inv.id || idx}`,
      text: `Rechnung ${inv.number || ""} erstellt`,
      time: inv.createdAt || "",
      icon: "invoice",
      user: invUserName || undefined,
      initials: invUserName ? getUserInitials(invUserName) : undefined,
    });
  });

  return entries
    .filter((e) => e.time)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: rawOrder, isLoading, error } = useOrder(id || "");
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const { data: companyData } = useCompany();
  const { data: usersData } = useUsers({ pageSize: 100 });
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !rawOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>Auftrag nicht gefunden</p>
        <Link to="/orders" className="text-primary hover:underline mt-2">Zurück zur Übersicht</Link>
      </div>
    );
  }

  const orderData = mapOrderToView(rawOrder);
  const activityLog = buildActivityLog(rawOrder as any);
  const users = usersData?.data || [];
  
  const status = statusConfig[orderData.status] || statusConfig["Neu"];
  const StatusIcon = status.icon;

  // Prepare PDF data - use raw ISO dates, not formatted strings
  const pdfData: SalesDocumentData = {
    type: 'order',
    number: orderData.id,
    date: (rawOrder as any)?.orderDate || (rawOrder as any)?.date || (rawOrder as any)?.createdAt || new Date().toISOString().split("T")[0],
    deliveryDate: (rawOrder as any)?.deliveryDate || undefined,
    reference: orderData.quote,
    projectNumber: orderData.projectNumber || orderData.projectName || undefined,
    company: {
      name: companyData?.name || "—",
      street: companyData?.street || "",
      postalCode: companyData?.zipCode || "",
      city: companyData?.city || "",
      phone: companyData?.phone || "",
      email: companyData?.email || "",
      vatNumber: companyData?.vatNumber || "",
    },
    customer: {
      name: (rawOrder as any)?.customer?.companyName || orderData.customer.name,
      contact: "",
      street: (rawOrder as any)?.customer?.street || orderData.customer.address.split(',')[0],
      postalCode: (rawOrder as any)?.customer?.zipCode || orderData.customer.address.split(',')[1]?.trim().split(' ')[0] || '',
      city: (rawOrder as any)?.customer?.city || orderData.customer.address.split(',')[1]?.trim().split(' ').slice(1).join(' ') || '',
    },
    deliveryAddress: (rawOrder as any)?.deliveryAddress ? {
      company: (rawOrder as any).deliveryAddress.company,
      street: (rawOrder as any).deliveryAddress.street,
      zipCode: (rawOrder as any).deliveryAddress.zipCode,
      city: (rawOrder as any).deliveryAddress.city,
      country: (rawOrder as any).deliveryAddress.country,
    } : undefined,
    positions: orderData.positions.map((pos, idx) => ({
      position: idx + 1,
      description: pos.description,
      quantity: pos.quantity,
      unit: pos.unit || "Stk",
      unitPrice: orderData.positions.length > 0 ? orderData.total / orderData.positions.length : 0,
      total: orderData.positions.length > 0 ? orderData.total / orderData.positions.length : 0,
    })),
    subtotal: orderData.total / 1.081,
    vatRate: 8.1,
    vatAmount: orderData.total - (orderData.total / 1.081),
    total: orderData.total,
    deliveryTerms: "Lieferung frei Haus",
    paymentTerms: "30 Tage netto",
  };

  const handleDownloadPDF = () => {
    downloadSalesDocumentPDF(pdfData);
    toast.success("PDF heruntergeladen");
  };

  const handleDuplicate = async () => {
    try {
      const raw = rawOrder as any;
      const dup = await createOrder.mutateAsync({
        customerId: raw.customerId || raw.customer?.id,
        projectId: raw.projectId,
        notes: raw.notes,
        orderDate: new Date().toISOString().split("T")[0],
        items: (raw.items || []).map((item: any, idx: number) => ({
          position: idx + 1,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
        })),
      } as any);
      toast.success("Auftrag wurde dupliziert");
      navigate(`/orders/${(dup as any).id}`);
    } catch {
      toast.error("Fehler beim Duplizieren");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Auftrag wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.")) return;
    try {
      await updateOrder.mutateAsync({ id: id!, data: { status: "CANCELLED" } as any });
      toast.success("Auftrag wurde storniert");
    } catch {
      toast.error("Fehler beim Stornieren");
    }
  };

  const handleMarkDone = async () => {
    try {
      await updateOrder.mutateAsync({ id: id!, data: { status: "CONFIRMED" } as any });
      toast.success("Auftrag wurde als erledigt markiert");
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const statusOptions = [
    { value: "DRAFT",     label: "Neu",             color: "text-muted-foreground" },
    { value: "SENT",      label: "In Arbeit",        color: "text-blue-600" },
    { value: "CONFIRMED", label: "Abgeschlossen",    color: "text-green-600" },
    { value: "CANCELLED", label: "Storniert",        color: "text-destructive" },
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === orderData.rawStatus) return;
    if (newStatus === "CANCELLED" && !confirm("Auftrag wirklich stornieren?")) return;
    try {
      await updateOrder.mutateAsync({ id: id!, data: { status: newStatus } as any });
      toast.success(`Status geändert zu "${statusOptions.find(s => s.value === newStatus)?.label}"`);
    } catch {
      toast.error("Fehler beim Ändern des Status");
    }
  };

  const handleAssignUser = async (userId: string, userName: string) => {
    const currentIds: string[] = ((rawOrder as any)?.assignedUsers || []).map((u: any) => u.id || u);
    const isAlreadyAssigned = currentIds.includes(userId);
    const newIds = isAlreadyAssigned
      ? currentIds.filter((uid) => uid !== userId)
      : [...currentIds, userId];
    try {
      await updateOrder.mutateAsync({ id: id!, data: { assignedUserIds: newIds } as any });
      toast.success(isAlreadyAssigned ? `${userName} entfernt` : `${userName} zugewiesen`);
    } catch {
      toast.error("Fehler beim Zuweisen");
    }
  };

  const assignedUserIds: string[] = ((rawOrder as any)?.assignedUsers || []).map((u: any) => u.id || u);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{orderData.id}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {orderData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{orderData.customer.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPDFPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Vorschau
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDeliveryDialog(true)}>
            <Truck className="h-4 w-4 mr-2" />
            Lieferschein erstellen
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/new?orderId=${id}&customerId=${orderData.customer.id || ''}`)}>
            <FileText className="h-4 w-4 mr-2" />
            Rechnung erstellen
          </Button>
          {/* Status manuell ändern */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={updateOrder.isPending}>
                {updateOrder.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Status ändern
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  disabled={opt.value === orderData.rawStatus}
                  className={opt.value === orderData.rawStatus ? "font-semibold opacity-50 cursor-default" : opt.color}
                >
                  {opt.value === orderData.rawStatus && "✓ "}
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/orders/${id}/edit`)}>Bearbeiten</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate} disabled={createOrder.isPending}>
                {createOrder.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Duplizieren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleCancel} disabled={updateOrder.isPending}>
                Stornieren
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Auftragsfortschritt</h3>
              <p className="text-sm text-muted-foreground">
                {orderData.progress}% abgeschlossen
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Liefertermin</p>
              <p className="font-semibold">{orderData.deliveryDate}</p>
            </div>
          </div>
          <Progress value={orderData.progress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Auftragspositionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Beschreibung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fortschritt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData.positions.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={positionStatusColors[pos.status]}>
                          {pos.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pos.progress} className="h-2 w-20" />
                          <span className="text-sm text-muted-foreground">{pos.progress}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Lieferscheine */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Lieferscheine</CardTitle>
              <Button size="sm" onClick={() => setShowDeliveryDialog(true)}>
                <Truck className="h-4 w-4 mr-2" />
                Lieferschein erstellen
              </Button>
            </CardHeader>
            <CardContent>
              {orderData.deliveries.length > 0 ? (
                <div className="space-y-3">
                  {orderData.deliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/delivery-notes/${delivery.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Truck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm hover:text-primary">{delivery.number}</p>
                          <p className="text-xs text-muted-foreground">{delivery.date}</p>
                        </div>
                      </div>
                      <Badge className={
                        delivery.status === "Geliefert" ? "bg-success/10 text-success" :
                        delivery.status === "Versendet" ? "bg-warning/10 text-warning" :
                        "bg-muted text-muted-foreground"
                      }>{delivery.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border rounded-lg">
                  <Truck className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Noch kein Lieferschein vorhanden</p>
                  <p className="text-xs text-muted-foreground mt-1">Erstellen Sie den ersten Lieferschein für diesen Auftrag</p>
                  <Button size="sm" className="mt-3" onClick={() => setShowDeliveryDialog(true)}>
                    <Truck className="h-4 w-4 mr-2" />
                    Lieferschein erstellen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Aktivitäten
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activityLog.length > 0 ? (
                <div className="space-y-0">
                  {activityLog.map((entry, index) => {
                    const iconMap: Record<string, { icon: any; color: string; bg: string }> = {
                      create: { icon: ShoppingCart, color: "text-primary", bg: "bg-primary/10" },
                      status: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
                      delivery: { icon: Truck, color: "text-warning", bg: "bg-warning/10" },
                      invoice: { icon: FileText, color: "text-info", bg: "bg-info/10" },
                    };
                    const cfg = iconMap[entry.icon] || { icon: Activity, color: "text-muted-foreground", bg: "bg-muted" };
                    const Icon = cfg.icon;
                    const isLast = index === activityLog.length - 1;
                    return (
                      <div key={entry.id} className="flex gap-3">
                        {/* Icon + connector line */}
                        <div className="flex flex-col items-center">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                            <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                          </div>
                          {!isLast && (
                            <div className="w-px flex-1 bg-border my-1" />
                          )}
                        </div>
                        {/* Content */}
                        <div className={`flex-1 min-w-0 ${!isLast ? "pb-4" : "pb-0"}`}>
                          <p className="text-sm font-medium leading-tight pt-1">{entry.text}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {entry.user && (
                              <>
                                <Avatar className="h-4 w-4">
                                  <AvatarFallback className="text-[8px] bg-muted text-muted-foreground">
                                    {entry.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-foreground/70">{entry.user}</span>
                                <span className="text-xs text-muted-foreground">·</span>
                              </>
                            )}
                            <span className="text-xs text-muted-foreground">{formatRelativeTime(entry.time)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Keine Aktivitäten vorhanden</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kunde</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Link to={`/customers/${orderData.customer.id || ''}`} className="font-medium hover:text-primary">
                    {orderData.customer.name}
                  </Link>
                  {orderData.customer.contact && (
                    <p className="text-sm text-muted-foreground">{orderData.customer.contact}</p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{orderData.customer.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Zugewiesen an
              </CardTitle>
              <Popover open={assignOpen} onOpenChange={setAssignOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-2" align="end">
                  <p className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">Person auswählen</p>
                  {users.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-2 py-2">Keine Benutzer gefunden</p>
                  ) : (
                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {users.map((u) => {
                        const isAssigned = assignedUserIds.includes(u.id);
                        return (
                          <button
                            key={u.id}
                            onClick={() => handleAssignUser(u.id, u.name)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-muted transition-colors ${isAssigned ? "bg-primary/10 text-primary" : ""}`}
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {(u.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="flex-1 text-left">{u.name}</span>
                            {isAssigned && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              {((rawOrder as any)?.assignedUsers || []).length > 0 ? (
                <div className="space-y-2">
                  {((rawOrder as any)?.assignedUsers || []).map((u: any) => {
                    const name = u.name || u.firstName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : u.id;
                    return (
                      <div key={u.id || u} className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Noch niemand zugewiesen</p>
              )}
            </CardContent>
          </Card>

          {/* Project */}
          {orderData.projectName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Projekt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  to={`/projects/${orderData.projectId}`}
                  className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                    <FolderKanban className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{orderData.projectName}</p>
                    {orderData.projectNumber && (
                      <p className="text-xs text-muted-foreground">{orderData.projectNumber}</p>
                    )}
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Delivery Address */}
          {orderData.deliveryAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Lieferadresse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    {orderData.deliveryAddress.company && (
                      <p className="font-medium">{orderData.deliveryAddress.company}</p>
                    )}
                    {orderData.deliveryAddress.street && (
                      <p>{orderData.deliveryAddress.street}</p>
                    )}
                    {(orderData.deliveryAddress.zipCode || orderData.deliveryAddress.city) && (
                      <p>{orderData.deliveryAddress.zipCode} {orderData.deliveryAddress.city}</p>
                    )}
                    {orderData.deliveryAddress.country && orderData.deliveryAddress.country !== "CH" && (
                      <p className="text-muted-foreground">{orderData.deliveryAddress.country}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Finanzen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Auftragswert</span>
                <span className="font-semibold">CHF {orderData.total.toLocaleString("de-CH")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bezahlt</span>
                <span className="font-medium text-success">CHF {orderData.paid.toLocaleString("de-CH")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Offen</span>
                <span className="font-medium text-warning">CHF {(orderData.total - orderData.paid).toLocaleString("de-CH")}</span>
              </div>
              <Separator />
              <Progress value={orderData.total > 0 ? (orderData.paid / orderData.total) * 100 : 0} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {orderData.total > 0 ? Math.round((orderData.paid / orderData.total) * 100) : 0}% bezahlt
              </p>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Angebot</span>
                {orderData.quote ? (
                  <Link to={`/quotes/${orderData.quoteId}`} className="font-medium hover:text-primary">
                    {orderData.quote}
                  </Link>
                ) : (
                  <span className="font-medium">—</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Erstellt am</span>
                <span className="font-medium">{orderData.createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Liefertermin</span>
                <span className="font-medium">{orderData.deliveryDate}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        open={showPDFPreview}
        onOpenChange={setShowPDFPreview}
        documentData={pdfData}
        title={`Auftrag ${orderData.id}`}
      />

      {/* Create Delivery Note Dialog */}
      <CreateDeliveryNoteDialog
        open={showDeliveryDialog}
        onOpenChange={setShowDeliveryDialog}
        orderId={id || ""}
        orderNumber={orderData.id}
        items={orderData.positions.map((pos) => ({
          id: pos.id,
          description: pos.description,
          quantity: pos.quantity,
          unit: pos.unit,
        }))}
      />
    </div>
  );
};

export default OrderDetail;
