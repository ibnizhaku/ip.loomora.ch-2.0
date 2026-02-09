import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VernetzenBackground } from "./SectionBackgrounds";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0015]" />
      <VernetzenBackground />

      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4610A3] via-[#2d0a5e] to-[#7c3aed]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2060L60%200%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.05)%22%20fill%3D%22none%22/%3E%3C/svg%3E')] opacity-50" />

          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#b88aed]/20 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Bereit für die Zukunft deines KMU?
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
              Starte jetzt kostenlos und entdecke, wie Loomora dein Unternehmen auf das nächste Level bringt.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/register")}
                className="group bg-white text-[#4610A3] font-bold px-8 py-4 rounded-2xl text-base flex items-center gap-3 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow"
              >
                Jetzt kostenlos starten
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <button className="text-white/60 hover:text-white font-medium px-8 py-4 rounded-2xl border border-white/20 hover:border-white/40 transition-all">
                Demo vereinbaren
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
