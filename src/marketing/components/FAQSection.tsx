import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Für welche Unternehmen ist Loomora geeignet?",
    a: "Loomora ist speziell für Schweizer KMU mit 1–100 Mitarbeitern entwickelt. Egal ob Handwerk, Dienstleistung, Handel oder Produktion – unsere Module lassen sich flexibel an Ihre Branche anpassen.",
  },
  {
    q: "Kann ich Loomora kostenlos testen?",
    a: "Ja! Sie können Loomora 30 Tage lang unverbindlich und kostenlos testen. Keine Kreditkarte erforderlich. Danach wählen Sie einfach den Plan, der zu Ihrem Unternehmen passt.",
  },
  {
    q: "Wo werden meine Daten gespeichert?",
    a: "Alle Daten werden ausschliesslich auf Schweizer Servern gehostet. Wir erfüllen alle Anforderungen der DSGVO und des Schweizer Datenschutzgesetzes (nDSG).",
  },
  {
    q: "Unterstützt Loomora Schweizer QR-Rechnungen?",
    a: "Ja, Loomora generiert automatisch Swiss QR-Rechnungen mit QR-Code (inkl. QR-IBAN und Referenznummern). Zahlungseingänge können über camt.054 automatisch abgeglichen werden.",
  },
  {
    q: "Kann ich von meiner bestehenden Software wechseln?",
    a: "Absolut. Unser Onboarding-Team unterstützt Sie beim Import Ihrer bestehenden Daten (Kunden, Artikel, Buchhaltung). Die Migration ist in den meisten Fällen innerhalb weniger Tage abgeschlossen.",
  },
  {
    q: "Gibt es eine API für eigene Integrationen?",
    a: "Ja, im Enterprise-Plan bieten wir eine vollständige REST-API für individuelle Integrationen und Automatisierungen. Dokumentation und Sandbox-Umgebung inklusive.",
  },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="border-b border-white/[0.06] last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <span className="text-white/80 font-medium text-base group-hover:text-white transition-colors pr-4">
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={18} className="text-white/30" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-white/40 text-sm leading-relaxed pb-6 pr-12">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0015] to-[#0a0015]" />

      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#b88aed] text-sm font-semibold tracking-wider uppercase mb-4"
          >
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Häufige{" "}
            <span className="bg-gradient-to-r from-[#b88aed] to-[#4610A3] bg-clip-text text-transparent">
              Fragen.
            </span>
          </motion.h2>
        </div>

        {isInView && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-8">
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
