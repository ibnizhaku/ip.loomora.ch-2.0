import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardMockup } from "./DashboardMockup";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0015] via-[#1a0536] to-[#0d0118]" />
      
      {/* Floating orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#4610A3]/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7c3aed]/15 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-[#b88aed]/10 rounded-full blur-[80px]"
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-40 pb-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 text-sm font-medium">Jetzt verfügbar für Schweizer KMU</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <span className="text-white">Alles in</span>
            <br />
            <span className="bg-gradient-to-r from-[#b88aed] via-[#9f6dd8] to-[#4610A3] bg-clip-text text-transparent">
              einer Software.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mt-8 leading-relaxed"
          >
            Loomora vereint CRM, Buchhaltung, HR, Produktion und mehr – 
            entwickelt für die Anforderungen von Schweizer KMU.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(70,16,163,0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="group bg-gradient-to-r from-[#4610A3] to-[#7c3aed] text-white font-semibold px-8 py-4 rounded-2xl text-base flex items-center gap-3 transition-shadow"
            >
              Kostenlos starten
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-3 text-white/60 hover:text-white font-medium px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Play size={16} fill="currentColor" />
              </div>
              Demo ansehen
            </motion.button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16"
          >
            {[
              { icon: Shield, text: "Swiss Hosting" },
              { icon: Globe, text: "DSGVO-konform" },
              { icon: Zap, text: "Setup in 5 Min" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-white/30 text-sm">
                <item.icon size={16} />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

      </div>

      {/* Dashboard Mockup - full width below hero content */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-8 pb-20">
        <DashboardMockup />
      </div>
    </section>
  );
}