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
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0536]/95 via-[#2d0a5e]/85 to-[#4610A3]/60" />

        {/* Content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2">
            <img src={loomoraLogo} alt="Loomora" className="h-10 brightness-0 invert" />
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <p className="text-[#b88aed] font-medium tracking-wider text-sm uppercase">
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4610A3]/30">
                  <f.icon className="h-4 w-4 text-[#b88aed]" />
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
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-[400px]" style={{ fontFamily: "'Sora', sans-serif" }}>
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-10">
            <img src={loomoraLogo} alt="Loomora" className="h-12" />
            <p className="text-xs text-muted-foreground tracking-widest uppercase">All-in-One Business Software</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Anmelden
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Geben Sie Ihre Zugangsdaten ein, um fortzufahren.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">E-Mail-Adresse</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@firma.ch"
                  className="pl-11 h-12 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {/* Passwort vergessen - unter dem Feld */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-xs text-muted-foreground hover:text-[#4610A3]"
                >
                  Passwort vergessen?
                </Button>
              </div>
            </div>

            {/* Remember me */}
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

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 gap-2 font-semibold rounded-xl text-sm bg-[#4610A3] hover:bg-[#370d82] text-white shadow-lg shadow-[#4610A3]/25"
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

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground tracking-wider">oder</span>
            </div>
          </div>

          {/* Register + Demo */}
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Noch kein Konto?{" "}
              <Link to="/register" className="text-[#4610A3] hover:underline font-semibold">
                Kostenlos registrieren
              </Link>
            </p>
            <div className="rounded-xl bg-muted/40 border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Demo-Zugang</p>
              <p className="text-sm font-mono font-medium text-foreground">
                admin@loomora.ch <span className="text-muted-foreground mx-1">/</span> admin123
              </p>
            </div>
          </div>

          {/* Mobile Footer */}
          <p className="lg:hidden text-center text-xs text-muted-foreground pt-8">
            © 2026 loomora.ch – Alle Rechte vorbehalten
          </p>
        </div>
      </div>
    </div>
  );
}