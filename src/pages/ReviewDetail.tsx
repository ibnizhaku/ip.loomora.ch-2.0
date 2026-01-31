import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Flag,
  Check,
  X,
  Clock,
  Mail,
  Package,
  Calendar,
  Send,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const reviewData = {
  id: "REV-2024-0042",
  status: "pending" as const,
  createdAt: "2024-01-18",
  product: {
    id: "PRD-001",
    name: "Premium Edelstahl-Geländer",
    sku: "GEL-ES-150",
    category: "Geländer",
  },
  customer: {
    name: "Hans Meier",
    email: "h.meier@example.ch",
    customerId: "KND-2024-0156",
    totalOrders: 3,
    totalReviews: 2,
  },
  rating: 4,
  title: "Sehr gute Qualität, kleine Lieferverzögerung",
  content: "Das Geländer ist wirklich hochwertig verarbeitet und sieht genau aus wie auf den Bildern. Die Montage war einfach dank der guten Anleitung. Einziger Kritikpunkt: Die Lieferung hat 3 Tage länger gedauert als angekündigt. Aber das Endresultat überzeugt auf ganzer Linie. Würde ich weiterempfehlen!",
  helpful: 8,
  notHelpful: 1,
  images: [],
  response: null as { content: string; respondedBy: string; respondedAt: string } | null,
  flags: [] as { reason: string; flaggedAt: string }[],
  verified: true,
  orderNumber: "AUF-2024-0089",
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "approved":
      return { label: "Freigegeben", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", icon: Check };
    case "pending":
      return { label: "Ausstehend", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", icon: Clock };
    case "rejected":
      return { label: "Abgelehnt", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", icon: X };
    default:
      return { label: status, color: "bg-gray-100 text-gray-800", icon: Clock };
  }
};

const StarRating = ({ rating, size = "default" }: { rating: number; size?: "default" | "large" }) => {
  const starSize = size === "large" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [responseText, setResponseText] = useState("");
  const [showResponseForm, setShowResponseForm] = useState(false);

  const statusConfig = getStatusConfig(reviewData.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/reviews")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{reviewData.id}</h1>
              <Badge className={statusConfig.color} variant="secondary">
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {reviewData.verified && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  Verifizierter Kauf
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Eingereicht am {new Date(reviewData.createdAt).toLocaleDateString("de-CH")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {reviewData.status === "pending" && (
            <>
              <Button variant="default" className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Freigeben
              </Button>
              <Button variant="destructive">
                <X className="h-4 w-4 mr-2" />
                Ablehnen
              </Button>
            </>
          )}
          <Button variant="outline">
            <Flag className="h-4 w-4 mr-2" />
            Melden
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hauptinhalt */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bewertung */}
          <Card>
            <CardHeader>
              <CardTitle>Bewertung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <StarRating rating={reviewData.rating} size="large" />
                <span className="text-2xl font-bold">{reviewData.rating}/5</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{reviewData.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{reviewData.content}</p>
              </div>
              <Separator />
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span>{reviewData.helpful} fanden dies hilfreich</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span>{reviewData.notHelpful}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Antwort */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Geschäftsantwort
                </CardTitle>
                {!reviewData.response && !showResponseForm && (
                  <Button onClick={() => setShowResponseForm(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Antwort verfassen
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {reviewData.response ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{reviewData.response.respondedBy}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(reviewData.response.respondedAt).toLocaleDateString("de-CH")}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{reviewData.response.content}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Bearbeiten
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Löschen
                    </Button>
                  </div>
                </div>
              ) : showResponseForm ? (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Vielen Dank für Ihre Bewertung..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tipp: Professionelle Antworten auf Kritik zeigen anderen Kunden, dass Sie Feedback ernst nehmen.
                  </p>
                  <div className="flex gap-2">
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Veröffentlichen
                    </Button>
                    <Button variant="outline" onClick={() => setShowResponseForm(false)}>
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Noch keine Antwort verfasst
                </p>
              )}
            </CardContent>
          </Card>

          {/* Moderationshistorie */}
          <Card>
            <CardHeader>
              <CardTitle>Moderationshistorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Bewertung eingereicht</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reviewData.createdAt).toLocaleDateString("de-CH", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {reviewData.verified && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Kauf verifiziert</p>
                      <p className="text-sm text-muted-foreground">
                        Automatisch verknüpft mit {reviewData.orderNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Kunde */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kunde</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {reviewData.customer.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{reviewData.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{reviewData.customer.customerId}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{reviewData.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{reviewData.customer.totalOrders} Bestellungen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>{reviewData.customer.totalReviews} Bewertungen</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/customers/${reviewData.customer.customerId}`)}>
                Kundenprofil öffnen
              </Button>
            </CardContent>
          </Card>

          {/* Produkt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bewertetes Produkt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{reviewData.product.name}</p>
                <p className="text-sm text-muted-foreground">{reviewData.product.sku}</p>
              </div>
              <Badge variant="secondary">{reviewData.product.category}</Badge>
              <Separator />
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Auftrag: {reviewData.orderNumber}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/products/${reviewData.product.id}`)}>
                Produkt anzeigen
              </Button>
            </CardContent>
          </Card>

          {/* Meldungen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Meldungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviewData.flags.length > 0 ? (
                <div className="space-y-2">
                  {reviewData.flags.map((flag, index) => (
                    <div key={index} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        {flag.reason}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {new Date(flag.flaggedAt).toLocaleDateString("de-CH")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Keine Meldungen
                </p>
              )}
            </CardContent>
          </Card>

          {/* Schnellaktionen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Kunden kontaktieren
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Star className="h-4 w-4 mr-2" />
                Alle Produktbewertungen
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Bewertung löschen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
