import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield, BarChart3, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import loomoraLogo from "@/assets/loomora-logo.png";
import loginBg from "@/assets/login-bg.jpg";

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

  const features = [
    { icon: BarChart3, label: "ERP & Finanzen", desc: "Buchhaltung, Rechnungen, MWST" },
    { icon: Users, label: "CRM & Vertrieb", desc: "Kunden, Angebote, Aufträge" },
    { icon: Shield, label: "HR & Lohn", desc: "Mitarbeiter, Lohnabrechnung" },
    { icon: Zap, label: "Projekte", desc: "Planung, Zeiterfassung, Tasks" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Full visual branding */}
      <div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
      >
        {/* Background image */}
        <img
          src={loginBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-teal-900/70" />

        {/* Content */}
        <div className="relative z-10">
          <img src={loomoraLogo} alt="Loomora" className="h-10" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <p className="text-teal-400 font-medium tracking-wider text-sm uppercase">
              All-in-One Business Software
            </p>
            <h1 className="text-5xl font-display font-bold text-white leading-[1.15]">
              Alles was Ihr<br />
              Unternehmen<br />
              braucht.
            </h1>
            <p className="text-white/60 text-lg max-w-md">
              Von der Offerte bis zur Lohnabrechnung – eine Plattform
              für Schweizer KMU.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-3 rounded-xl bg-white/[0.06] backdrop-blur-sm border border-white/10 p-4 transition-colors hover:bg-white/[0.1]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/20">
                  <f.icon className="h-4 w-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <p className="text-xs text-white/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <p className="text-white/40 text-sm">
            © 2026 loomora.ch – Alle Rechte vorbehalten
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">Datenschutz</a>
            <a href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">Impressum</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-4">
            <img src={loomoraLogo} alt="Loomora" className="h-10" />
            <p className="text-xs text-muted-foreground">All-in-One Business Software</p>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold tracking-tight">
              Willkommen zurück
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Melden Sie sich in Ihrem Konto an
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@firma.ch"
                  className="pl-10 h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">Passwort</Label>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-xs text-muted-foreground hover:text-primary"
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
                  className="pl-10 pr-10 h-11"
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
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Angemeldet bleiben
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 gap-2 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Anmeldung...
                </span>
              ) : (
                <>
                  Anmelden
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">oder</span>
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Noch kein Konto?{" "}
              <Link to="/register" className="text-primary hover:underline font-semibold">
                Kostenlos registrieren
              </Link>
            </p>
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="text-xs text-muted-foreground">
                Demo-Zugang: <span className="font-mono font-medium text-foreground">admin@loomora.ch</span> / <span className="font-mono font-medium text-foreground">admin123</span>
              </p>
            </div>
          </div>

          {/* Mobile Footer */}
          <p className="lg:hidden text-center text-xs text-muted-foreground pt-4">
            © 2026 loomora.ch – Alle Rechte vorbehalten
          </p>
        </div>
      </div>
    </div>
  );
}