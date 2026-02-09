import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardMockup } from "./DashboardMockup";

// ─── Animated IT Circuit Illustration ───
function CircuitBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.35 }}
      >
        <defs>
          {/* Gradient for traces */}
          <linearGradient id="traceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4610A3" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#b88aed" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="50%" stopColor="#b88aed" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
          {/* Node glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── VERNETZEN: Left side - nodes connecting ── */}
        <g className="vernetzen-group">
          {/* Main circuit traces - left network */}
          <motion.path
            d="M-50 200 H200 V400 H350 V300 H500"
            stroke="url(#traceGrad)" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
          />
          <motion.path
            d="M-50 500 H150 V350 H300 V500 H450 V400"
            stroke="url(#traceGrad)" strokeWidth="1" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.15 }}
          />
          <motion.path
            d="M100 100 V250 H250 V150 H400 V350"
            stroke="url(#traceGrad)" strokeWidth="1" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.path
            d="M-50 700 H200 V600 H350 V700 H500 V550"
            stroke="url(#traceGrad)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 6"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.25 }}
          />

          {/* Connection nodes - Vernetzen */}
          {[
            { cx: 200, cy: 200 }, { cx: 200, cy: 400 }, { cx: 350, cy: 300 },
            { cx: 150, cy: 350 }, { cx: 300, cy: 500 }, { cx: 100, cy: 250 },
            { cx: 250, cy: 150 }, { cx: 200, cy: 600 }, { cx: 350, cy: 700 },
          ].map((node, i) => (
            <motion.g key={`vn-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15, delay: 0.3 + i * 0.03 }}
            >
              <motion.circle cx={node.cx} cy={node.cy} r="6" fill="#4610A3" filter="url(#glow)"
                animate={{ r: [6, 8, 6] }}
                transition={{ duration: 1.2 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
              />
              <circle cx={node.cx} cy={node.cy} r="2.5" fill="#b88aed" />
              <motion.circle cx={node.cx} cy={node.cy} r="12" stroke="#b88aed" strokeWidth="0.5" fill="none" strokeOpacity="0.3"
                animate={{ r: [12, 18, 12], strokeOpacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              />
            </motion.g>
          ))}

          {/* Data flow particles on left traces */}
          <motion.circle r="2" fill="#b88aed" filter="url(#glow)">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M-50 200 H200 V400 H350 V300 H500" />
          </motion.circle>
          <motion.circle r="1.5" fill="#7c3aed" filter="url(#glow)">
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M-50 500 H150 V350 H300 V500 H450 V400" />
          </motion.circle>
        </g>

        {/* ── OPTIMIEREN: Center - efficient hub structure ── */}
        <g className="optimieren-group">
          <motion.path
            d="M700 300 H960 V540 H700 V300" stroke="#7c3aed" strokeWidth="1" strokeOpacity="0.3" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 830 + Math.cos(rad) * 200;
            const cy = 420 + Math.sin(rad) * 200;
            return (
              <motion.line key={`opt-${i}`}
                x1="830" y1="420" x2={cx} y2={cy}
                stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.2"
                strokeDasharray="3 5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.03 }}
              />
            );
          })}

          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2, delay: 0.35 }}>
            <motion.circle cx="830" cy="420" r="20" fill="#4610A3" fillOpacity="0.15" filter="url(#softGlow)"
              animate={{ r: [20, 25, 20] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <circle cx="830" cy="420" r="10" fill="#4610A3" fillOpacity="0.3" />
            <circle cx="830" cy="420" r="4" fill="#b88aed" />
            <motion.circle cx="830" cy="420" r="30" stroke="#b88aed" strokeWidth="0.5" fill="none" strokeDasharray="4 4"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "830px 420px" }}
            />
          </motion.g>

          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 830 + Math.cos(rad) * 140;
            const cy = 420 + Math.sin(rad) * 140;
            return (
              <motion.g key={`sat-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15, delay: 0.5 + i * 0.03 }}
              >
                <circle cx={cx} cy={cy} r="5" fill="#7c3aed" fillOpacity="0.4" />
                <circle cx={cx} cy={cy} r="2" fill="#b88aed" />
              </motion.g>
            );
          })}

          <circle r="2" fill="#b88aed" filter="url(#glow)" cx="970" cy="420">
            <animateTransform attributeName="transform" type="rotate" from="0 830 420" to="360 830 420" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* ── WACHSEN: Right side - expanding network ── */}
        <g className="wachsen-group">
          <motion.path
            d="M1400 200 H1550 V350 H1700 V250 H1850 V400 H1970"
            stroke="url(#traceGrad)" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.path
            d="M1350 500 H1500 V650 H1650 V500 H1800 V700 H1970"
            stroke="url(#traceGrad)" strokeWidth="1" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut", delay: 0.55 }}
          />
          <motion.path
            d="M1450 400 V550 H1600 V450 H1750 V600 H1900"
            stroke="url(#traceGrad)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 6"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: 0.6 }}
          />

          {[
            { cx: 1550, cy: 350 }, { cx: 1700, cy: 250 }, { cx: 1850, cy: 400 },
            { cx: 1500, cy: 650 }, { cx: 1650, cy: 500 }, { cx: 1800, cy: 700 },
            { cx: 1600, cy: 450 }, { cx: 1750, cy: 600 },
          ].map((node, i) => (
            <motion.g key={`wn-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15, delay: 0.65 + i * 0.03 }}
            >
              <motion.circle cx={node.cx} cy={node.cy} r="5" fill="#4610A3" filter="url(#glow)"
                animate={{ r: [5, 7, 5] }}
                transition={{ duration: 1.2 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
              />
              <circle cx={node.cx} cy={node.cy} r="2" fill="#b88aed" />
              <motion.circle cx={node.cx} cy={node.cy} r="10" stroke="#4610A3" strokeWidth="0.5" fill="none"
                animate={{ r: [10, 25, 10], strokeOpacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
              />
            </motion.g>
          ))}

          <motion.circle r="2" fill="#b88aed" filter="url(#glow)">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M1400 200 H1550 V350 H1700 V250 H1850 V400 H1970" />
          </motion.circle>
        </g>

        {/* ── Cross-connections between zones ── */}
        <motion.path
          d="M500 300 C600 350, 650 400, 700 400"
          stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.15" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        <motion.path
          d="M960 420 C1050 400, 1200 350, 1400 300"
          stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.15" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        />
        <motion.path
          d="M500 550 C600 500, 700 480, 750 450"
          stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.1" fill="none" strokeDasharray="3 6"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.52 }}
        />
        <motion.path
          d="M910 500 C1000 550, 1200 600, 1350 500"
          stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.1" fill="none" strokeDasharray="3 6"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.58 }}
        />

        {/* Decorative dots */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = 100 + Math.random() * 1700;
          const y = 100 + Math.random() * 800;
          return (
            <motion.circle key={`dot-${i}`} cx={x} cy={y} r="1" fill="#b88aed" fillOpacity="0.15"
              animate={{ fillOpacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 1.2 + Math.random() * 1.5, repeat: Infinity, delay: Math.random() * 0.8 }}
            />
          );
        })}

        {/* Small circuit board squares */}
        {[
          { x: 280, y: 250 }, { x: 450, y: 400 }, { x: 1480, y: 300 },
          { x: 1720, y: 550 }, { x: 800, y: 280 }, { x: 860, y: 560 },
        ].map((sq, i) => (
          <motion.rect key={`sq-${i}`}
            x={sq.x - 4} y={sq.y - 4}
            width="8" height="8" rx="1"
            stroke="#7c3aed" strokeWidth="0.5" fill="none" strokeOpacity="0.2"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.1, delay: 0.3 + i * 0.06 }}
          />
        ))}
      </svg>
    </div>
  );
}


export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0015] via-[#1a0536] to-[#0d0118]" />
      
      {/* Circuit illustration */}
      <CircuitBackground />

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
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <DashboardMockup />
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0015] to-transparent z-20 pointer-events-none" />
    </section>
  );
}