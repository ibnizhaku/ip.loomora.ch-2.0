import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PurchaseInvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/purchase-invoices/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight">Eingangsrechnung bearbeiten</h1>
          <p className="text-muted-foreground">Bearbeitung erfolgt auf der Detailseite</p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground mb-4">
          Eingangsrechnungen können direkt auf der Detailseite bearbeitet werden.
        </p>
        <Button onClick={() => navigate(`/purchase-invoices/${id}`)}>
          Zur Detailseite
        </Button>
      </div>
    </div>
  );
}
