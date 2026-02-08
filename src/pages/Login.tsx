import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login({ email, password });
      
      if (result.requiresCompanySelection) {
        // User has multiple companies, redirect to selection
        navigate("/select-company", { state: { from: location.state?.from } });
      } else {
        toast.success("Erfolgreich angemeldet");
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Anmeldung fehlgeschlagen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white font-display font-bold text-xl">
              L
            </div>
            <span className="font-display font-bold text-2xl text-white">Loomora</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-display font-bold text-white leading-tight">
            Ihr Metallbau-ERP<br />für die Schweiz
          </h1>
          <p className="text-white/80 text-lg">
            Projekte, Finanzen, HR und mehr – alles in einer modernen Plattform.
            Konform mit GAV Metallbau und Schweizer Normen.
          </p>
          <div className="flex gap-4">
            <div className="p-4 rounded-xl bg-white/10">
              <p className="text-white font-semibold">CHF</p>
              <p className="text-white/70 text-sm">Schweizer Währung</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10">
              <p className="text-white font-semibold">KMU</p>
              <p className="text-white/70 text-sm">Kontenrahmen</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10">
              <p className="text-white font-semibold">GAV</p>
              <p className="text-white/70 text-sm">Metallbau</p>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-sm">
          © 2024 loomora.ch – Alle Rechte vorbehalten
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-xl">
              L
            </div>
            <span className="font-display font-bold text-2xl">Loomora</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold">Willkommen zurück</h2>
            <p className="text-muted-foreground mt-2">
              Melden Sie sich an, um fortzufahren
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@loomora.ch"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm text-muted-foreground"
                >
                  Passwort vergessen?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Angemeldet bleiben
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                "Anmeldung..."
              ) : (
                <>
                  Anmelden
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Noch kein Konto?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Jetzt registrieren
              </Link>
            </p>
            <p className="text-xs">
              Demo: <span className="font-mono">admin@loomora.ch</span> / <span className="font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
