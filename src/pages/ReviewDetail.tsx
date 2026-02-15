import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, MessageSquare, Flag, Check, X, Clock, Mail, Package, Calendar, Send, Edit, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useModerateReview } from "@/hooks/use-ecommerce";

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  true: { label: "Freigegeben", color: "bg-success/10 text-success", icon: Check },
  false: { label: "Ausstehend", color: "bg-warning/10 text-warning", icon: Clock },
};

const StarRating = ({ rating, size = "default" }: { rating: number; size?: "default" | "large" }) => {
  const starSize = size === "large" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`${starSize} ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
      ))}
    </div>
  );
};

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [responseText, setResponseText] = useState("");
  const [showResponseForm, setShowResponseForm] = useState(false);
  const moderateReview = useModerateReview();

  const { data: raw, isLoading, error } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get(`/ecommerce/reviews/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (error || !raw) return <div className="flex flex-col items-center justify-center h-64 text-muted-foreground"><p>Bewertung nicht gefunden</p><Button variant="link" onClick={() => navigate(-1)}>Zurück</Button></div>;

  const r = raw as any;
  const isApproved = r.isApproved === true;
  const sc = statusMap[String(isApproved)] || statusMap.false;
  const StatusIcon = sc.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/reviews")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{r.id?.substring(0, 12) || "Bewertung"}</h1>
              <Badge className={sc.color} variant="secondary"><StatusIcon className="h-3 w-3 mr-1" />{sc.label}</Badge>
            </div>
            <p className="text-muted-foreground">
              Eingereicht am {r.createdAt ? new Date(r.createdAt).toLocaleDateString("de-CH") : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isApproved && (
            <Button className="bg-success hover:bg-success/90" onClick={() => { moderateReview.mutate({ id: id || '', data: { isApproved: true } }); toast.success("Freigegeben"); }}>
              <Check className="h-4 w-4 mr-2" />Freigeben
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Bewertung</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <StarRating rating={r.rating || 0} size="large" />
                <span className="text-2xl font-bold">{r.rating || 0}/5</span>
              </div>
              {r.title && <h3 className="text-lg font-semibold">{r.title}</h3>}
              <p className="text-muted-foreground leading-relaxed">{r.content || r.comment || "—"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Geschäftsantwort</CardTitle>
                {!r.response && !showResponseForm && (
                  <Button onClick={() => setShowResponseForm(true)}><Edit className="h-4 w-4 mr-2" />Antwort verfassen</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {r.response ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground">{r.response}</p>
                </div>
              ) : showResponseForm ? (
                <div className="space-y-4">
                  <Textarea placeholder="Vielen Dank für Ihre Bewertung..." value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={4} />
                  <div className="flex gap-2">
                    <Button onClick={() => { moderateReview.mutate({ id: id || '', data: { response: responseText } }); toast.success("Antwort veröffentlicht"); setShowResponseForm(false); }}>
                      <Send className="h-4 w-4 mr-2" />Veröffentlichen
                    </Button>
                    <Button variant="outline" onClick={() => setShowResponseForm(false)}>Abbrechen</Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Noch keine Antwort verfasst</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Kunde</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{(r.customerName || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{r.customerName || r.customer?.name || "Unbekannt"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {r.product && (
            <Card>
              <CardHeader><CardTitle className="text-base">Bewertetes Produkt</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{r.product.name}</p>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/products/${r.product.id || r.productId}`)}>
                  Produkt anzeigen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
