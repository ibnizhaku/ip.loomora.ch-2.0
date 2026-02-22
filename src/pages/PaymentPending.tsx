import { Link } from "react-router-dom";
import { CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import loomoraLogo from "@/assets/loomora-logo.png";

export default function PaymentPending() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted/30">
      <Link to="/" className="mb-8">
        <img src={loomoraLogo} alt="Loomora" className="h-10" />
      </Link>
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Zahlung ausstehend</h1>
        <p className="text-muted-foreground mb-6">
          Ihre Registrierung war erfolgreich. Bitte schliessen Sie den Zahlungsvorgang ab, um Ihr Konto vollständig zu aktivieren.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild className="gap-2">
            <Link to="/login">
              Zum Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Zur Startseite</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
