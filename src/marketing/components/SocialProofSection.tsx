import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";
import { FlowDotsBackground } from "./SectionBackgrounds";

const logos = [
  "Müller AG", "Weber GmbH", "Schmid & Co", "Fischer Technik",
  "Keller Bau", "Brunner Metall", "Steiner Solutions", "Huber Logistik",
];

const testimonials = [
  {
    quote: "Loomora hat unsere gesamte Administration revolutioniert. Statt 5 Tools brauchen wir nur noch eines.",
    name: "Hans Müller",
    role: "CEO, Müller AG",
    initials: "HM",
    rating: 5,
  },
  {
    quote: "Endlich eine Software, die QR-Rechnungen und Schweizer Buchhaltung wirklich versteht. Top Support!",
    name: "Sandra Weber",
    role: "CFO, Weber GmbH",
    initials: "SW",
    rating: 5,
  },
  {
    quote: "Von Offerte bis Zahlung alles in einem System. Unsere Effizienz hat sich verdreifacht.",
    name: "Thomas Keller",
    role: "Geschäftsführer, Keller Bau AG",
    initials: "TK",
    rating: 5,
  },
];

export function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0015] to-[#0d0118]" />
      <FlowDotsBackground />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Logo ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-white/25 text-xs font-medium tracking-[0.2em] uppercase mb-8">
            Vertraut von führenden Schweizer KMU
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logos.map((logo, i) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="text-white/15 text-sm font-semibold tracking-wide hover:text-white/30 transition-colors"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-500"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-white/60 text-sm leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4610A3] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold">
                  {t.initials}
                </div>
                <div>
                  <div className="text-white/80 text-sm font-medium">{t.name}</div>
                  <div className="text-white/30 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
