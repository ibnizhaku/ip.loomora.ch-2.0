import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  Package,
  FileText,
  Star,
  ShoppingCart,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSupplier, useDeleteSupplier } from "@/hooks/use-suppliers";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

const orderStatusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Entwurf", color: "bg-muted text-muted-foreground" },
  SENT: { label: "Bestellt", color: "bg-info/10 text-info" },
  CONFIRMED: { label: "Bestätigt", color: "bg-success/10 text-success" },
  CANCELLED: { label: "Storniert", color: "bg-destructive/10 text-destructive" },
};

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: supplier, isLoading, error } = useSupplier(id);
  const deleteSupplier = useDeleteSupplier();

  const handleDelete = async () => {
    if (!supplier) return;
    if (confirm(`Möchten Sie "${supplier.name}" wirklich löschen?`)) {
      try {
        await deleteSupplier.mutateAsync(supplier.id);
        toast.success(`${supplier.name} wurde gelöscht`);
        navigate("/suppliers");
      } catch (error) {
        toast.error("Fehler beim Löschen. Möglicherweise gibt es verknüpfte Bestellungen.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/suppliers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-display text-2xl font-bold">Lieferant nicht gefunden</h1>
        </div>
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Der Lieferant konnte nicht geladen werden.</p>
        </div>
      </div>
    );
  }

  const products = (supplier as any).products || [];
  const purchaseOrders = (supplier as any).purchaseOrders || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/suppliers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold">{supplier.companyName || supplier.name}</h1>
                <Badge className={supplier.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                  {supplier.isActive ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{supplier.number}</span>
                {supplier.rating && supplier.rating > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span>{supplier.rating}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/purchase-orders/new")}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Bestellung erstellen
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/suppliers/${id}/edit`)}>
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
              {supplier.email && (
                <DropdownMenuItem onClick={() => window.location.href = `mailto:${supplier.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  E-Mail senden
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{supplier.totalOrders || 0}</div>
            <p className="text-sm text-muted-foreground">Bestellungen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">CHF {((supplier.totalValue || 0) as number).toLocaleString('de-CH')}</div>
            <p className="text-sm text-muted-foreground">Gesamtvolumen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-sm text-muted-foreground">Produkte</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{supplier.paymentTermDays || 30} Tage</div>
            <p className="text-sm text-muted-foreground">Zahlungsziel</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="products">Produkte ({products.length})</TabsTrigger>
          <TabsTrigger value="orders">Bestellungen ({purchaseOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Kontaktinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.name && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">Ansprechpartner</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${supplier.email}`} className="hover:text-primary">{supplier.email}</a>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        {supplier.website}
                      </a>
                    </div>
                  )}
                </div>

                {(supplier.street || supplier.city) && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        {supplier.street && <p>{supplier.street}</p>}
                        <p>{supplier.zipCode} {supplier.city}</p>
                        {supplier.country && <p>{supplier.country}</p>}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2 text-sm">
                  {supplier.vatNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UID</span>
                      <span>{supplier.vatNumber}</span>
                    </div>
                  )}
                  {supplier.iban && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IBAN</span>
                      <span className="font-mono text-xs">{supplier.iban}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Erstellt am</span>
                    <span>{format(new Date(supplier.createdAt), "dd.MM.yyyy", { locale: de })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating */}
            <Card>
              <CardHeader>
                <CardTitle>Bewertung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-6 w-6",
                        i < (supplier.rating || 0)
                          ? "text-warning fill-warning"
                          : "text-muted"
                      )}
                    />
                  ))}
                  <span className="text-lg font-medium ml-2">{supplier.rating || 0}/5</span>
                </div>

                {supplier.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Notizen</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{supplier.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Produkte von diesem Lieferanten</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Keine Produkte vorhanden.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Art.-Nr.</TableHead>
                      <TableHead>Bezeichnung</TableHead>
                      <TableHead className="text-right">EK-Preis</TableHead>
                      <TableHead className="text-right">Bestand</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: any) => (
                      <TableRow 
                        key={product.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <TableCell className="font-mono">{product.sku}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">CHF {(product.purchasePrice || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{product.stockQuantity || 0} {product.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bestellhistorie</CardTitle>
              <Button size="sm" onClick={() => navigate("/purchase-orders/new")}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Neue Bestellung
              </Button>
            </CardHeader>
            <CardContent>
              {purchaseOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Keine Bestellungen vorhanden.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bestellnummer</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead className="text-right">Betrag</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((order: any) => {
                      const status = orderStatusConfig[order.status] || orderStatusConfig.DRAFT;
                      return (
                        <TableRow 
                          key={order.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/purchase-orders/${order.id}`)}
                        >
                          <TableCell className="font-medium">{order.number}</TableCell>
                          <TableCell>{format(new Date(order.date || order.createdAt), "dd.MM.yyyy", { locale: de })}</TableCell>
                          <TableCell className="text-right">CHF {(order.total || 0).toLocaleString('de-CH')}</TableCell>
                          <TableCell>
                            <Badge className={status.color}>{status.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierDetail;