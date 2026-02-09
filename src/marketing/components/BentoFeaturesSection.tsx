import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Zap, Globe, Layers, Lock, Headphones } from "lucide-react";
import { OptimierenBackground } from "./SectionBackgrounds";

const bentoItems = [
  {
    icon: Shield,
    title: "Swiss Hosting",
    description: "Deine Daten bleiben in der Schweiz. Gehostet auf Schweizer Servern mit höchsten Sicherheitsstandards.",
    size: "large",
    gradient: "from-[#4610A3]/20 to-[#7c3aed]/5",
  },
  {
    icon: Zap,
    title: "Setup in 5 Minuten",
    description: "Kein aufwendiges Setup. Registriere dich und starte sofort.",
    size: "small",
    gradient: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    icon: Globe,
    title: "QR-Rechnung & MwSt",
    description: "Schweizer QR-Rechnungen und Mehrwertsteuer – alles integriert.",
    size: "small",
    gradient: "from-blue-500/10 to-blue-600/5",
  },
  {
    icon: Layers,
    title: "All-in-One Plattform",
    description: "CRM, Buchhaltung, HR, Produktion und mehr – keine separaten Tools, keine Integrationen nötig.",
    size: "large",
    gradient: "from-[#7c3aed]/15 to-[#b88aed]/5",
  },
  {
    icon: Lock,
    title: "DSGVO-konform",
    description: "Datenschutz nach höchsten Standards. Vollständige Konformität und revisionssichere Archivierung.",
    size: "small",
    gradient: "from-amber-500/10 to-amber-600/5",
  },
  {
    icon: Headphones,
    title: "Schweizer Support",
    description: "Persönlicher Support auf Deutsch. Wir kennen Schweizer KMU.",
    size: "small",
    gradient: "from-rose-500/10 to-rose-600/5",
  },
];

export function BentoFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0118] to-[#1a0536]" />
      <OptimierenBackground />
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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {bentoItems.map((item, i) => {
            const isLarge = item.size === "large";
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
                className={`group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br ${item.gradient} backdrop-blur-sm overflow-hidden cursor-default transition-all duration-500 hover:border-white/[0.12] hover:scale-[1.02] ${
                  isLarge ? "md:col-span-2 md:row-span-2" : "md:col-span-2"
                }`}
              >
                {/* Inner glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 h-full flex flex-col justify-end p-7">
                  <div
                    className={`rounded-xl bg-white/[0.06] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 ${
                      isLarge ? "w-14 h-14" : "w-11 h-11"
                    }`}
                  >
                    <item.icon size={isLarge ? 24 : 20} className="text-[#b88aed]" />
                  </div>
                  <h3
                    className={`text-white font-semibold mb-2 ${isLarge ? "text-xl" : "text-base"}`}
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className={`text-white/40 leading-relaxed ${isLarge ? "text-sm max-w-md" : "text-sm"}`}>
                    {item.description}
                  </p>
                </div>

                {/* Decorative corner accent for large items */}
                {isLarge && (
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#4610A3]/10 to-transparent rounded-bl-[100px]" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
