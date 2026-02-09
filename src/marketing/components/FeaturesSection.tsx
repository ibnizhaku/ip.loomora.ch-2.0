import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Zap, Globe, Layers, Lock, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Swiss Hosting",
    description: "Deine Daten bleiben in der Schweiz. Gehostet auf Schweizer Servern mit höchsten Sicherheitsstandards.",
  },
  {
    icon: Zap,
    title: "Sofort einsatzbereit",
    description: "Kein aufwendiges Setup. Registriere dich und starte in wenigen Minuten mit deiner Business Software.",
  },
  {
    icon: Globe,
    title: "QR-Rechnung & MwSt",
    description: "Schweizer QR-Rechnungen, Mehrwertsteuer-Abrechnungen und Swissdec-Integration – alles integriert.",
  },
  {
    icon: Layers,
    title: "All-in-One",
    description: "CRM, Buchhaltung, HR, Produktion und mehr – keine separaten Tools, keine Integrationen nötig.",
  },
  {
    icon: Lock,
    title: "DSGVO-konform",
    description: "Datenschutz nach höchsten Standards. Vollständige DSGVO-Konformität und revisionssichere Archivierung.",
  },
  {
    icon: Headphones,
    title: "Schweizer Support",
    description: "Persönlicher Support auf Deutsch. Wir kennen die Anforderungen von Schweizer KMU.",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0118] to-[#1a0536]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#4610A3]/10 rounded-full blur-[150px]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#b88aed] text-sm font-semibold tracking-wider uppercase mb-4"
          >
            Warum Loomora?
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Gemacht für die{" "}
            <span className="bg-gradient-to-r from-[#b88aed] to-[#4610A3] bg-clip-text text-transparent">
              Schweiz.
            </span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              className="group"
            >
              <div className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 h-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4610A3]/20 to-[#7c3aed]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon size={24} className="text-[#b88aed]" />
                </div>
                <h3
                  className="text-white font-semibold text-xl mb-3"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {feature.title}
                </h3>
                <p className="text-white/40 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
