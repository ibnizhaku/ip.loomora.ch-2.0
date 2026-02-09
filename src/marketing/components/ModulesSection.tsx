import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Users, Receipt, UserCheck, Package, ShoppingCart,
  FolderKanban, FileText, Settings, BarChart3
} from "lucide-react";

const modules = [
  {
    icon: Users,
    title: "CRM & Vertrieb",
    description: "Kunden, Leads, Angebote, Aufträge und Rechnungen – alles in einer Pipeline.",
    color: "#4610A3",
  },
  {
    icon: Receipt,
    title: "Finanzen & Buchhaltung",
    description: "Kontenplan, Journalbuchungen, MwSt, QR-Rechnungen – Swiss-Ready.",
    color: "#7c3aed",
  },
  {
    icon: UserCheck,
    title: "HR & Personal",
    description: "Lohnabrechnung, Zeiterfassung, Abwesenheiten, Swissdec-Integration.",
    color: "#9f6dd8",
  },
  {
    icon: Package,
    title: "Lager & Produktion",
    description: "Artikel, Stücklisten, Produktionsaufträge und Qualitätskontrolle.",
    color: "#b88aed",
  },
  {
    icon: ShoppingCart,
    title: "Einkauf",
    description: "Lieferanten, Bestellungen, Einkaufsrechnungen und Wareneingänge.",
    color: "#4610A3",
  },
  {
    icon: FolderKanban,
    title: "Projektmanagement",
    description: "Projekte, Aufgaben, Kalender und Zeiterfassung an einem Ort.",
    color: "#7c3aed",
  },
  {
    icon: FileText,
    title: "Dokumente",
    description: "Upload, Ordnerstruktur und zentrale Dokumentenverwaltung.",
    color: "#9f6dd8",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    description: "Dashboards, Analysen und Auswertungen für datenbasierte Entscheidungen.",
    color: "#b88aed",
  },
  {
    icon: Settings,
    title: "Administration",
    description: "Benutzer, Rollen, Audit-Log und Multi-Company-Verwaltung.",
    color: "#4610A3",
  },
];

export function ModulesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="module" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0118] via-[#0a0015] to-[#0d0118]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#4610A3]/10 rounded-full blur-[150px]" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#b88aed] text-sm font-semibold tracking-wider uppercase mb-4"
          >
            Module
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Ein System.{" "}
            <span className="bg-gradient-to-r from-[#b88aed] to-[#4610A3] bg-clip-text text-transparent">
              Alles drin.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/40 text-lg mt-6"
          >
            Ersetze dutzende Einzellösungen durch eine integrierte Plattform.
          </motion.p>
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
            >
              <div className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 h-full cursor-default">
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 40px ${mod.color}10, 0 0 30px ${mod.color}08` }}
                />
                
                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${mod.color}15` }}
                  >
                    <mod.icon size={22} style={{ color: mod.color }} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {mod.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
