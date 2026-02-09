import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import loomoraLogo from "@/assets/loomora-logo.png";

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
            <img src={loomoraLogo} alt="Loomora" className="h-12" />
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-display font-bold text-white leading-tight">
            All-in-One<br />Business Software
          </h1>
          <p className="text-white/80 text-lg">
            Projekte, Finanzen, HR und mehr – alles in einer modernen Plattform.
            Massgeschneidert für Schweizer KMU.
          </p>
          <div className="flex gap-4">
            <div className="p-4 rounded-xl bg-white/10">
              <p className="text-white font-semibold">CRM</p>
              <p className="text-white/70 text-sm">Kundenmanagement</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10">
              <p className="text-white font-semibold">ERP</p>
              <p className="text-white/70 text-sm">Ressourcenplanung</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10">
              <p className="text-white font-semibold">HR</p>
              <p className="text-white/70 text-sm">Personalwesen</p>
            </div>
          </div>
        </div>

        <p className="text-white/60 text-sm">
          © 2026 loomora.ch – Alle Rechte vorbehalten
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={loomoraLogo} alt="Loomora" className="h-12" />
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

          {/* Mobile Footer */}
          <p className="lg:hidden text-center text-xs text-muted-foreground">
            © 2026 loomora.ch – Alle Rechte vorbehalten
          </p>
        </div>
      </div>
    </div>
  );
}
