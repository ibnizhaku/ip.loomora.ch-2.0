import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight, User, Building2, Shield, BarChart3, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import loomoraLogo from "@/assets/loomora-logo.png";
import loginBg from "@/assets/login-bg.jpg";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    companyName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Vorname ist erforderlich";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Nachname ist erforderlich";
    }
    if (!formData.email.trim()) {
      newErrors.email = "E-Mail ist erforderlich";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ungültige E-Mail-Adresse";
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Firmenname ist erforderlich";
    }
    if (!formData.password) {
      newErrors.password = "Passwort ist erforderlich";
    } else if (formData.password.length < 8) {
      newErrors.password = "Passwort muss mindestens 8 Zeichen haben";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwörter stimmen nicht überein";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName,
      });

      if (result.requiresPayment && result.checkoutUrl) {
        toast.info("Weiterleitung zur Zahlung...");
        window.location.href = result.checkoutUrl;
      } else if (result.requiresPayment) {
        toast.success("Registrierung erfolgreich! Bitte schliessen Sie die Zahlung ab.");
        navigate("/payment-pending");
      } else {
        toast.success("Registrierung erfolgreich!");
        navigate("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "Registrierung fehlgeschlagen");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const features = [
    { icon: BarChart3, label: "ERP & Finanzen", desc: "Buchhaltung, Rechnungen, MWST", highlight: true },
    { icon: Users, label: "CRM & Vertrieb", desc: "Kunden, Angebote, Aufträge", highlight: false },
    { icon: Shield, label: "HR & Lohn", desc: "Mitarbeiter, Lohnabrechnung", highlight: false },
    { icon: Zap, label: "Projekte", desc: "Planung, Zeiterfassung, Tasks", highlight: false },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12">
        <img
          src={loginBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0536]/95 via-[#2d0a5e]/85 to-[#4610A3]/60" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2">
            <img src={loomoraLogo} alt="Loomora" className="h-10 brightness-0 invert" />
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-4">
            <p className="text-[#b88aed] font-medium tracking-wider text-sm uppercase">
              Jetzt kostenlos starten
            </p>
            <h1 className="text-5xl font-display font-bold text-white leading-[1.15]">
              Ihre Firma.<br />
              Ihre Software.<br />
              Ihr Erfolg.
            </h1>
            <p className="text-white/60 text-lg max-w-md leading-snug">
              Registrieren Sie sich und erhalten Sie sofort Zugang zu allen
              Business-Funktionen – massgeschneidert für Schweizer KMU.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            {features.map((f) => (
              <div
                key={f.label}
                className={`flex items-start gap-3 rounded-xl backdrop-blur-sm border transition-colors hover:bg-white/[0.1] ${
                  f.highlight
                    ? "bg-white/[0.09] border-white/15 p-[18px]"
                    : "bg-white/[0.06] border-white/10 p-4"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    f.highlight ? "bg-[#4610A3]/40" : "bg-[#4610A3]/30"
                  }`}
                >
                  <f.icon
                    className={`h-4 w-4 ${f.highlight ? "text-[#c9a5f0]" : "text-[#b88aed]"}`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                  <p className="text-xs text-white/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-6 max-w-md mt-2">
            <div className="flex items-center gap-2 text-white/80">
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="text-sm">Benutzerfreundlich</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="text-sm">Swiss Hosting</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="text-sm">Sofort startklar</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-white/40 text-sm">
              © 2026 loomora.ch – Alle Rechte vorbehalten
            </p>
            <p className="text-white/25 text-xs">🇨🇭 Entwickelt für Schweizer KMU</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">Datenschutz</a>
            <a href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">Impressum</a>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 overflow-y-auto bg-background">
        <div className="w-full max-w-[420px]" style={{ fontFamily: "'Sora', sans-serif" }}>
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
            <img src={loomoraLogo} alt="Loomora" className="h-12" />
            <p className="text-xs text-muted-foreground tracking-widest uppercase">All-in-One Business Software</p>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
              Konto erstellen
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm leading-snug">
              Registrieren Sie Ihre Firma und starten Sie sofort.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium">Vorname</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="Max"
                    className="pl-11 h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                  />
                </div>
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium">Nachname</Label>
                <Input
                  id="lastName"
                  placeholder="Keller"
                  className="h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-sm font-medium">Firmenname</Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="companyName"
                  placeholder="Muster AG"
                  className="pl-11 h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                />
              </div>
              {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">E-Mail-Adresse</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@firma.ch"
                  className="pl-11 h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  autoComplete="new-password"
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
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              <p className="text-xs text-muted-foreground">Mindestens 8 Zeichen</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Passwort bestätigen</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 h-11 rounded-xl border-border/60 bg-muted/30 text-sm focus-visible:ring-[#4610A3]"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div className="text-xs text-muted-foreground pt-1">
              Mit der Registrierung akzeptieren Sie unsere{" "}
              <a href="#" className="text-[#4610A3] hover:underline font-medium">AGB</a> und{" "}
              <a href="#" className="text-[#4610A3] hover:underline font-medium">Datenschutzerklärung</a>.
            </div>

            {/* Submit */}
            <div className="pt-1" />
            <Button
              type="submit"
              className="w-full h-[52px] gap-2 font-semibold rounded-xl text-[15px] bg-[#4610A3] hover:bg-[#370d82] text-white shadow-lg shadow-[#4610A3]/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Registrierung...
                </span>
              ) : (
                <>
                  Jetzt registrieren
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Login link */}
          <div className="text-center text-sm text-muted-foreground mt-6">
            <p>
              Bereits ein Konto?{" "}
              <Link to="/login" className="text-[#4610A3] hover:underline font-semibold">
                Jetzt anmelden
              </Link>
            </p>
          </div>

          {/* Mobile Footer */}
          <div className="lg:hidden text-center text-xs text-muted-foreground pt-8 space-y-1">
            <p>© 2026 loomora.ch – Alle Rechte vorbehalten</p>
            <p className="text-muted-foreground/60">🇨🇭 Entwickelt für Schweizer KMU</p>
          </div>
        </div>
      </div>
    </div>
  );
}
