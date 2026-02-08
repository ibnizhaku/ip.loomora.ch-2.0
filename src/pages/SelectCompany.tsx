import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, CompanySummary } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SelectCompany() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, availableCompanies, selectCompany } = useAuth();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSelect = async () => {
    if (!selectedId) {
      toast.error("Bitte wählen Sie eine Firma aus");
      return;
    }

    setIsLoading(true);
    try {
      await selectCompany(selectedId);
      toast.success("Firma ausgewählt");
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Auswahl fehlgeschlagen");
    } finally {
      setIsLoading(false);
    }
  };

  if (availableCompanies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-2xl mx-auto">
            L
          </div>
          <h1 className="text-2xl font-display font-bold">Keine Firma verfügbar</h1>
          <p className="text-muted-foreground">
            Sie haben derzeit keinen Zugang zu einer aktiven Firma.
          </p>
          <Button onClick={() => navigate("/login")} variant="outline">
            Zurück zum Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-2xl mx-auto mb-6">
            L
          </div>
          <h1 className="text-2xl font-display font-bold">Firma auswählen</h1>
          <p className="text-muted-foreground mt-2">
            Willkommen zurück, {user?.firstName}! Wählen Sie eine Firma aus:
          </p>
        </div>

        <div className="space-y-3">
          {availableCompanies.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedId(company.id)}
              className={cn(
                "w-full p-4 rounded-lg border-2 text-left transition-all",
                "hover:border-primary/50 hover:bg-accent/50",
                selectedId === company.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{company.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {company.role} {company.isOwner && "• Inhaber"}
                  </p>
                </div>
                {selectedId === company.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              {company.status !== "ACTIVE" && (
                <p className="text-xs text-destructive mt-2">
                  Status: {company.status}
                </p>
              )}
            </button>
          ))}
        </div>

        <Button
          onClick={handleSelect}
          className="w-full gap-2"
          disabled={!selectedId || isLoading}
        >
          {isLoading ? (
            "Wird geladen..."
          ) : (
            <>
              Fortfahren
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
