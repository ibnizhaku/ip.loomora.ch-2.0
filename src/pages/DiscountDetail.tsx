import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Copy,
  Trash2,
  Tag,
  Percent,
  Package,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useDiscount, useDeleteDiscount } from "@/hooks/use-ecommerce";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(amount);
};

export default function DiscountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: discount, isLoading } = useDiscount(id);
  const deleteDiscount = useDeleteDiscount();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    if (!id) return;
    deleteDiscount.mutate(id, {
      onSuccess: () => {
        toast.success("Rabatt gelöscht");
        navigate("/discounts");
      },
      onError: (err: any) => toast.error(err?.message || "Fehler beim Löschen"),
    });
    setDeleteDialogOpen(false);
  };

  const handleDuplicate = () => {
    if (discount) {
      navigate("/discounts/new", {
        state: {
          duplicateFrom: {
            code: discount.code + "-KOPIE",
            name: discount.name + " (Kopie)",
            type: discount.type,
            value: discount.value,
            minOrderValue: discount.minOrderValue,
            maxUses: discount.maxUses,
            validFrom: discount.validFrom,
            validUntil: discount.validUntil,
          },
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!discount) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/discounts")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <p className="text-muted-foreground">Rabatt nicht gefunden</p>
      </div>
    );
  }

  const statusConfig = discount.isActive
    ? { label: "Aktiv", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" }
    : { label: "Inaktiv", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/discounts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{discount.name || discount.code}</h1>
              <Badge className={statusConfig.color} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono">Code: {discount.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplizieren
          </Button>
          <Button variant="outline" onClick={() => navigate(`/discounts/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button
            variant="outline"
            className="text-red-600"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleteDiscount.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rabattwert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">
                {discount.type === "percentage" ? `${discount.value}%` : formatCurrency(discount.value)}
              </p>
            </div>
            {discount.minOrderValue != null && (
              <p className="text-xs text-muted-foreground">Min. Bestellwert {formatCurrency(discount.minOrderValue)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verwendungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{discount.usedCount ?? 0}</p>
            <p className="text-xs text-muted-foreground">
              {discount.maxUses ? `von ${discount.maxUses} max` : "Unbegrenzt"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gültig ab</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {discount.validFrom ? new Date(discount.validFrom).toLocaleDateString("de-CH") : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gültig bis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {discount.validUntil ? new Date(discount.validUntil).toLocaleDateString("de-CH") : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Bedingungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Mindestbestellwert</p>
                  <p className="text-lg font-semibold">
                    {discount.minOrderValue != null ? formatCurrency(discount.minOrderValue) : "—"}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Nutzungslimit</p>
                  <p className="text-lg font-semibold">{discount.maxUses ?? "Unbegrenzt"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Rabatt aktiv</span>
                <Switch checked={discount.isActive} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Gültigkeitszeitraum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Von</span>
                <span>
                  {discount.validFrom ? new Date(discount.validFrom).toLocaleDateString("de-CH") : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bis</span>
                <span>
                  {discount.validUntil ? new Date(discount.validUntil).toLocaleDateString("de-CH") : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Informationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Erstellt am</p>
                <p className="font-medium">
                  {discount.createdAt ? new Date(discount.createdAt).toLocaleDateString("de-CH") : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rabatt löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Rabatt &quot;{discount.name || discount.code}&quot; wirklich löschen? Diese Aktion
              kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
