import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// PurchaseOrders haben einen komplexen Wizard-Flow.
// Edit leitet zur Detail-Seite weiter, wo Inline-Editing möglich ist.
export default function PurchaseOrderEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Redirect to detail page where editing can happen
  // Complex wizard forms are better edited inline on detail pages
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/purchase-orders/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight">Bestellung bearbeiten</h1>
          <p className="text-muted-foreground">Bearbeitung erfolgt auf der Detailseite</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground mb-4">
          Einkaufsbestellungen können direkt auf der Detailseite bearbeitet werden.
        </p>
        <Button onClick={() => navigate(`/purchase-orders/${id}`)}>
          Zur Detailseite
        </Button>
      </div>
    </div>
  );
}
