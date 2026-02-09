import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WachsenBackground } from "./SectionBackgrounds";

const plans = [
  {
    name: "Starter",
    description: "Für Einzelunternehmer und Kleinstfirmen",
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      "1 Benutzer",
      "CRM & Kontakte",
      "Angebote & Rechnungen",
      "QR-Rechnung",
      "Basis-Buchhaltung",
      "5 GB Speicher",
      "E-Mail-Support",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    description: "Für wachsende KMU",
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      "Bis 10 Benutzer",
      "Alle Starter-Features",
      "HR & Lohnabrechnung",
      "Lager & Produktion",
      "Swissdec-Integration",
      "MwSt-Abrechnungen",
      "50 GB Speicher",
      "Prioritäts-Support",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Für grössere Unternehmen",
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      "Unbegrenzte Benutzer",
      "Alle Professional-Features",
      "Multi-Company",
      "API-Zugang",
      "Dedizierte Infrastruktur",
      "Unbegrenzter Speicher",
      "Persönlicher Ansprechpartner",
      "SLA & Onboarding",
    ],
    highlighted: false,
  },
];

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [yearly, setYearly] = useState(true);
  const navigate = useNavigate();

  return (
    <section id="preise" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0536] via-[#0d0118] to-[#0a0015]" />
      <WachsenBackground />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4610A3]/8 rounded-full blur-[200px]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#b88aed] text-sm font-semibold tracking-wider uppercase mb-4"
          >
            Preise
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Transparent &{" "}
            <span className="bg-gradient-to-r from-[#b88aed] to-[#4610A3] bg-clip-text text-transparent">
              fair.
            </span>
          </motion.h2>
        </div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-16"
        >
          <span className={`text-sm font-medium ${!yearly ? "text-white" : "text-white/40"}`}>Monatlich</span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              yearly ? "bg-[#4610A3]" : "bg-white/20"
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                yearly ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${yearly ? "text-white" : "text-white/40"}`}>
            Jährlich
            <span className="ml-2 text-xs text-emerald-400 font-semibold">-20%</span>
          </span>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-[#4610A3]/20 to-[#7c3aed]/10 border-2 border-[#4610A3]/50 scale-105"
                  : "bg-white/[0.03] border border-white/[0.06]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4610A3] to-[#7c3aed] text-white text-xs font-bold px-4 py-1 rounded-full">
                  Beliebteste Wahl
                </div>
              )}

              <h3 className="text-white font-bold text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>
                {plan.name}
              </h3>
              <p className="text-white/40 text-sm mt-1">{plan.description}</p>

              <div className="mt-6 mb-8">
                {plan.monthlyPrice ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-5xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                      CHF {yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-white/40 text-sm">/Monat</span>
                  </div>
                ) : (
                  <div className="text-white text-3xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Auf Anfrage
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-white/60 text-sm">
                    <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/register")}
                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-[#4610A3] to-[#7c3aed] text-white hover:shadow-[0_0_30px_rgba(70,16,163,0.4)]"
                    : "border border-white/10 text-white/80 hover:bg-white/5"
                }`}
              >
                {plan.monthlyPrice ? "Kostenlos testen" : "Kontakt aufnehmen"}
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
