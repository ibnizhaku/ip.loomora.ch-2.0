import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ArrowRight, User, Building2, Shield, BarChart3, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import loomoraLogo from "@/assets/loomora-logo.png";
import loginBg from "@/assets/login-bg.jpg";

const features = [
  { icon: BarChart3, label: "ERP & Finanzen", desc: "Buchhaltung, Rechnungen, MWST" },
  { icon: Users, label: "CRM & Vertrieb", desc: "Kunden, Angebote, Aufträge" },
  { icon: Shield, label: "HR & Lohn", desc: "Mitarbeiter, Lohnabrechnung" },
  { icon: Zap, label: "Projekte", desc: "Planung, Zeiterfassung, Tasks" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(location.pathname === "/register");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Register state
  const [regData, setRegData] = useState({
    email: "", password: "", confirmPassword: "",
    firstName: "", lastName: "", companyName: "",
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const from = location.state?.from?.pathname || "/";

  const toggleMode = () => {
    const next = !isRegister;
    setIsRegister(next);
    navigate(next ? "/register" : "/login", { replace: true, state: location.state });
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      const result = await login({ email: loginEmail, password: loginPassword });
      if (result.requiresCompanySelection) {
        navigate("/select-company", { state: { from: location.state?.from } });
      } else {
        toast.success("Erfolgreich angemeldet");
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Anmeldung fehlgeschlagen");
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Register handler
  const updateRegField = (field: string, value: string) => {
    setRegData(prev => ({ ...prev, [field]: value }));
    if (regErrors[field]) setRegErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateReg = () => {
    const e: Record<string, string> = {};
    if (!regData.firstName.trim()) e.firstName = "Vorname ist erforderlich";
    if (!regData.lastName.trim()) e.lastName = "Nachname ist erforderlich";
    if (!regData.email.trim()) e.email = "E-Mail ist erforderlich";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email)) e.email = "Ungültige E-Mail-Adresse";
    if (!regData.companyName.trim()) e.companyName = "Firmenname ist erforderlich";
    if (!regData.password) e.password = "Passwort ist erforderlich";
    else if (regData.password.length < 8) e.password = "Mindestens 8 Zeichen";
    if (regData.password !== regData.confirmPassword) e.confirmPassword = "Passwörter stimmen nicht überein";
    setRegErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReg()) return;
    setIsRegLoading(true);
    try {
      const result = await register({
        email: regData.email, password: regData.password,
        firstName: regData.firstName, lastName: regData.lastName,
        companyName: regData.companyName,
      });
      if (result.requiresPayment && result.checkoutUrl) {
        toast.info("Weiterleitung zur Zahlung...");
        window.location.href = result.checkoutUrl;
      } else if (result.requiresPayment) {
        toast.success("Registrierung erfolgreich!");
        navigate("/payment-pending");
      } else {
        toast.success("Registrierung erfolgreich!");
        setIsRegister(false);
        navigate("/login", { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Registrierung fehlgeschlagen");
    } finally {
      setIsRegLoading(false);
    }
  };

  // ── Branding panel ──
  const brandingContent = (
    <div className="relative h-full flex flex-col justify-between p-12">
      <img src={loginBg} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
      {/* 1. Reduced overlay contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0536]/90 via-[#2d0a5e]/80 to-[#4610A3]/50" />

      <div className="relative z-10 pt-2">
        <div className="inline-flex items-center gap-3 rounded-xl bg-white/12 backdrop-blur-sm px-4 py-2">
          <img src={loomoraLogo} alt="Loomora" className="h-9 brightness-0 invert" />
        </div>
      </div>

      {/* 1. & 3. Headline ~5% smaller, vertically aligned with form title via pt */}
      <div className="relative z-10 space-y-8">
        <div className="space-y-3">
          <p className="text-[#b88aed]/80 font-medium tracking-wider text-xs uppercase">
            {isRegister ? "Jetzt kostenlos starten" : "All-in-One Business Software"}
          </p>
          <h1 className="text-[2.6rem] font-display font-bold text-white leading-[1.15]">
            {isRegister ? (
              <>Ihre Firma.<br />Ihre Software.<br />Ihr Erfolg.</>
            ) : (
              <>Alles was Ihr<br />Unternehmen<br />braucht.</>
            )}
          </h1>
          <p className={`text-base max-w-md leading-relaxed ${isRegister ? "text-white/50" : "text-white/55"}`}>
            {isRegister
              ? "Registrieren Sie sich und erhalten Sie sofort Zugang zu allen Business-Funktionen – massgeschneidert für Schweizer KMU."
              : "Von der Offerte bis zur Lohnabrechnung – eine Plattform für Schweizer KMU."}
          </p>
        </div>

        {/* 4. Feature tiles: reduced visual weight, no highlight, more gap */}
        <div className="grid grid-cols-2 gap-2.5 max-w-md mt-2">
          {features.map((f) => (
            <div
              key={f.label}
              className="flex items-start gap-2.5 rounded-lg bg-white/[0.04] backdrop-blur-sm border border-white/[0.07] px-3.5 py-3 transition-colors hover:bg-white/[0.07]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#4610A3]/25">
                <f.icon className="h-3.5 w-3.5 text-[#b88aed]/80" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-white/85">{f.label}</p>
                <p className="text-[11px] text-white/40">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {isRegister && (
          <div className="flex gap-5 max-w-md">
            {["Benutzerfreundlich", "Swiss Hosting", "Sofort startklar"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-white/70">
                <div className="h-2 w-2 rounded-full bg-green-400/80" />
                <span className="text-[13px]">{t}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-white/30 text-xs">© 2026 loomora.ch – Alle Rechte vorbehalten</p>
          <p className="text-white/20 text-[11px]">🇨🇭 Entwickelt für Schweizer KMU</p>
        </div>
        <div className="flex gap-5">
          <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">Datenschutz</a>
          <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">Impressum</a>
        </div>
      </div>
    </div>
  );

  // ── Login form ──
  const loginForm = (
    <div className="w-full max-w-[420px] px-2" style={{ fontFamily: "'Sora', sans-serif" }}>
      <div className="lg:hidden flex flex-col items-center gap-3 mb-10">
        <img src={loomoraLogo} alt="Loomora" className="h-12" />
        <p className="text-xs text-muted-foreground tracking-widest uppercase">All-in-One Business Software</p>
      </div>

      {/* 2. & 3. Bigger title, more spacing */}
      <div className="mb-10">
        <h2 className="text-[2rem] font-bold tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>Anmelden</h2>
        <p className="text-muted-foreground mt-2.5 text-sm">Geben Sie Ihre Zugangsdaten ein, um fortzufahren.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-sm font-medium">E-Mail-Adresse</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="login-email" type="email" placeholder="name@firma.ch"
              className="pl-11 h-12 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
              value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="email" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password" className="text-sm font-medium">Passwort</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="login-password" type={showLoginPassword ? "text" : "password"} placeholder="••••••••"
              className="pl-11 pr-11 h-12 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
              value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} autoComplete="current-password" required />
            <Button type="button" variant="ghost" size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
              onClick={() => setShowLoginPassword(!showLoginPassword)}>
              {showLoginPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="link" className="px-0 h-auto text-xs text-muted-foreground hover:text-[#4610A3]">
              Passwort vergessen?
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c as boolean)} />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Angemeldet bleiben</Label>
        </div>

        <Button type="submit" className="w-full h-12 gap-2 font-semibold rounded-xl text-sm bg-[#4610A3] hover:bg-[#370d82] text-white shadow-lg shadow-[#4610A3]/25" disabled={isLoginLoading}>
          {isLoginLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Anmeldung...
            </span>
          ) : (<>Anmelden <ArrowRight className="h-4 w-4" /></>)}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground tracking-wider">oder</span>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <button onClick={toggleMode} className="text-[#4610A3] hover:underline font-semibold">Kostenlos registrieren</button>
        </p>
        {/* 4. Demo access clearly secondary */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground/60 mb-0.5">Demo-Zugang</p>
          <p className="text-[11px] font-mono text-muted-foreground/70">
            admin@loomora.ch <span className="text-muted-foreground/40 mx-1">/</span> admin123
          </p>
        </div>
      </div>

      <div className="lg:hidden text-center text-xs text-muted-foreground pt-8 space-y-1">
        <p>© 2026 loomora.ch – Alle Rechte vorbehalten</p>
        <p className="text-muted-foreground/60">🇨🇭 Entwickelt für Schweizer KMU</p>
      </div>
    </div>
  );

  // ── Register form ──
  const registerForm = (
    <div className="w-full max-w-[440px] px-2" style={{ fontFamily: "'Sora', sans-serif" }}>
      <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
        <img src={loomoraLogo} alt="Loomora" className="h-12" />
        <p className="text-xs text-muted-foreground tracking-widest uppercase">All-in-One Business Software</p>
      </div>

      {/* 2. & 3. Bigger title, tighter subline */}
      <div className="mb-8">
        <h2 className="text-[2rem] font-bold tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>Konto erstellen</h2>
        <p className="text-muted-foreground mt-1.5 text-sm leading-snug">Registrieren Sie Ihre Firma und starten Sie sofort.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm font-medium">Vorname</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="firstName" placeholder="Max" className="pl-11 h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
                value={regData.firstName} onChange={(e) => updateRegField("firstName", e.target.value)} />
            </div>
            {regErrors.firstName && <p className="text-xs text-destructive">{regErrors.firstName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm font-medium">Nachname</Label>
            <Input id="lastName" placeholder="Keller" className="h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
              value={regData.lastName} onChange={(e) => updateRegField("lastName", e.target.value)} />
            {regErrors.lastName && <p className="text-xs text-destructive">{regErrors.lastName}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="companyName" className="text-sm font-medium">Firmenname</Label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="companyName" placeholder="Muster AG" className="pl-11 h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
              value={regData.companyName} onChange={(e) => updateRegField("companyName", e.target.value)} />
          </div>
          {regErrors.companyName && <p className="text-xs text-destructive">{regErrors.companyName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-email" className="text-sm font-medium">E-Mail-Adresse</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="reg-email" type="email" placeholder="name@firma.ch" className="pl-11 h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
              value={regData.email} onChange={(e) => updateRegField("email", e.target.value)} autoComplete="email" />
          </div>
          {regErrors.email && <p className="text-xs text-destructive">{regErrors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-sm font-medium">Passwort</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="reg-password" type={showRegPassword ? "text" : "password"} placeholder="••••••••"
              className="pl-11 pr-11 h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
              value={regData.password} onChange={(e) => updateRegField("password", e.target.value)} autoComplete="new-password" />
            <Button type="button" variant="ghost" size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
              onClick={() => setShowRegPassword(!showRegPassword)}>
              {showRegPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
          {regErrors.password && <p className="text-xs text-destructive">{regErrors.password}</p>}
          <p className="text-xs text-muted-foreground">Mindestens 8 Zeichen</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Passwort bestätigen</Label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="confirmPassword" type={showRegPassword ? "text" : "password"} placeholder="••••••••"
              className="pl-11 h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
              value={regData.confirmPassword} onChange={(e) => updateRegField("confirmPassword", e.target.value)} autoComplete="new-password" />
          </div>
          {regErrors.confirmPassword && <p className="text-xs text-destructive">{regErrors.confirmPassword}</p>}
        </div>

        <div className="text-xs text-muted-foreground pt-1">
          Mit der Registrierung akzeptieren Sie unsere{" "}
          <a href="#" className="text-[#4610A3] hover:underline font-medium">AGB</a> und{" "}
          <a href="#" className="text-[#4610A3] hover:underline font-medium">Datenschutzerklärung</a>.
        </div>

        {/* 5. Register button: bigger CTA, more spacing above */}
        <div className="pt-2" />
        <Button type="submit" className="w-full h-[54px] gap-2 font-semibold rounded-xl text-[15px] bg-[#4610A3] hover:bg-[#370d82] text-white shadow-lg shadow-[#4610A3]/25" disabled={isRegLoading}>
          {isRegLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Registrierung...
            </span>
          ) : (<>Jetzt registrieren <ArrowRight className="h-4 w-4" /></>)}
        </Button>
      </form>

      {/* More spacing below button */}
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Bereits ein Konto?{" "}
          <button onClick={toggleMode} className="text-[#4610A3] hover:underline font-semibold">Jetzt anmelden</button>
        </p>
      </div>

      <div className="lg:hidden text-center text-xs text-muted-foreground pt-8 space-y-1">
        <p>© 2026 loomora.ch – Alle Rechte vorbehalten</p>
        <p className="text-muted-foreground/60">🇨🇭 Entwickelt für Schweizer KMU</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Desktop layout */}
      <div className="hidden lg:flex h-screen relative">
        {/* Login Form Panel */}
        <motion.div
          className="w-[45%] h-full flex items-center justify-center p-8 sm:p-14 bg-background shrink-0"
          animate={{
            x: isRegister ? 0 : "122.2%",
            opacity: isRegister ? 0 : 1,
          }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 35 },
            opacity: { duration: 0.2, delay: isRegister ? 0 : 0.15 },
          }}
          style={{ pointerEvents: isRegister ? "none" : "auto", position: "absolute", left: 0, top: 0, bottom: 0 }}
        >
          {loginForm}
        </motion.div>

        {/* Register Form Panel */}
        <motion.div
          className="w-[45%] h-full flex items-center justify-center p-8 sm:p-14 bg-background overflow-y-auto shrink-0"
          animate={{
            opacity: isRegister ? 1 : 0,
          }}
          transition={{
            opacity: { duration: 0.2, delay: isRegister ? 0.15 : 0 },
          }}
          style={{ pointerEvents: isRegister ? "auto" : "none", position: "absolute", left: 0, top: 0, bottom: 0 }}
        >
          {registerForm}
        </motion.div>

        {/* Branding Panel */}
        <motion.div
          className="w-[55%] h-full overflow-hidden shrink-0 z-20"
          style={{ position: "absolute", top: 0, bottom: 0 }}
          animate={{ left: isRegister ? "45%" : "0%" }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
        >
          {brandingContent}
        </motion.div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden w-full min-h-screen flex items-center justify-center p-6 sm:p-12 bg-background overflow-y-auto">
        {isRegister ? registerForm : loginForm}
      </div>
    </div>
  );
}
