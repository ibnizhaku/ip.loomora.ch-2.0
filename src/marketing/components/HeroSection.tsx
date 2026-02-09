import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Shield, Zap, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardMockup } from "./DashboardMockup";
import { useEffect, useRef, useState } from "react";

// Phase colors: Vernetzen = purple, Optimieren = blue, Wachsen = green
const PHASES = [
  { color: [184, 138, 237], accent: [70, 16, 163], label: "Vernetzen" },   // purple
  { color: [100, 180, 255], accent: [59, 130, 246], label: "Optimieren" }, // blue
  { color: [74, 222, 128], accent: [34, 197, 94], label: "Wachsen" },     // green
];
const PHASE_DURATION = 4000; // ms per phase
const TRANSITION_DURATION = 1500;

interface Node {
  x: number; y: number; vx: number; vy: number; size: number;
  baseSize: number; pulse: number; pulseSpeed: number;
  hub: boolean; born: number;
}

function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let nodes: Node[] = [];
    let startTime = performance.now();

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const init = () => {
      resize();
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const count = Math.min(90, Math.floor((w * h) / 10000));
      startTime = performance.now();
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.5 + 0.8,
        baseSize: Math.random() * 1.5 + 0.8,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        hub: i < count * 0.15, // 15% are hub nodes
        born: 0,
      }));
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpColor = (c1: number[], c2: number[], t: number) =>
      c1.map((v, i) => Math.round(lerp(v, c2[i], t)));

    const draw = (now: number) => {
      const elapsed = now - startTime;
      const totalCycle = PHASES.length * PHASE_DURATION;
      const cycleTime = elapsed % totalCycle;
      const phaseIndex = Math.floor(cycleTime / PHASE_DURATION);
      const nextPhaseIndex = (phaseIndex + 1) % PHASES.length;
      const phaseProgress = (cycleTime % PHASE_DURATION) / PHASE_DURATION;

      // Smooth transition between phases
      let blendT = 0;
      if (phaseProgress > 1 - TRANSITION_DURATION / PHASE_DURATION) {
        blendT = (phaseProgress - (1 - TRANSITION_DURATION / PHASE_DURATION)) / (TRANSITION_DURATION / PHASE_DURATION);
        blendT = blendT * blendT * (3 - 2 * blendT); // smoothstep
      }

      const currentColor = lerpColor(PHASES[phaseIndex].color, PHASES[nextPhaseIndex].color, blendT);
      const currentAccent = lerpColor(PHASES[phaseIndex].accent, PHASES[nextPhaseIndex].accent, blendT);

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      // Phase-specific behavior modifiers
      const isVernetzen = phaseIndex === 0 && blendT < 0.5;
      const isOptimieren = phaseIndex === 1 && blendT < 0.5;
      const isWachsen = phaseIndex === 2 && blendT < 0.5;

      const maxDist = isVernetzen ? 180 : isOptimieren ? 140 : 160;
      const speed = isOptimieren ? 0.6 : isWachsen ? 0.4 : 0.3;

      // Update nodes
      for (const n of nodes) {
        n.x += n.vx * speed;
        n.y += n.vy * speed;
        n.pulse += n.pulseSpeed;
        n.size = n.baseSize + Math.sin(n.pulse) * 0.4;

        // Wachsen: hubs pulse bigger
        if (isWachsen && n.hub) {
          n.size = n.baseSize * 1.8 + Math.sin(n.pulse * 2) * 0.8;
        }

        if (n.x < -10) n.x = w + 10;
        if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10;
        if (n.y > h + 10) n.y = -10;
      }

      // Optimieren: nodes gently attract to hubs
      if (isOptimieren) {
        const hubs = nodes.filter(n => n.hub);
        for (const n of nodes) {
          if (n.hub) continue;
          let closestHub = hubs[0];
          let closestDist = Infinity;
          for (const hub of hubs) {
            const d = Math.hypot(n.x - hub.x, n.y - hub.y);
            if (d < closestDist) { closestDist = d; closestHub = hub; }
          }
          if (closestDist < 250) {
            const strength = 0.0003 * (1 - closestDist / 250);
            n.vx += (closestHub.x - n.x) * strength;
            n.vy += (closestHub.y - n.y) * strength;
          }
        }
      }

      // Wachsen: gentle repulsion to spread out
      if (isWachsen) {
        for (const n of nodes) {
          n.vx += (Math.random() - 0.5) * 0.01;
          n.vy += (Math.random() - 0.5) * 0.01;
        }
      }

      // Damping
      for (const n of nodes) {
        n.vx *= 0.999;
        n.vy *= 0.999;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const base = (1 - dist / maxDist);
            let alpha = base * 0.18;
            let lineWidth = 0.5;

            // Optimieren: hub connections are brighter
            if (isOptimieren && (nodes[i].hub || nodes[j].hub)) {
              alpha = base * 0.4;
              lineWidth = 1;
            }
            // Wachsen: pulsing connections
            if (isWachsen) {
              alpha *= 1 + 0.3 * Math.sin(elapsed * 0.003 + i);
            }

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]}, ${alpha})`;
            ctx.lineWidth = lineWidth;
            ctx.stroke();

            // Optimieren: data packets traveling along connections
            if (isOptimieren && (nodes[i].hub || nodes[j].hub) && base > 0.5) {
              const packetT = ((elapsed * 0.001 + i * 0.3) % 1);
              const px = nodes[i].x + (nodes[j].x - nodes[i].x) * packetT;
              const py = nodes[i].y + (nodes[j].y - nodes[i].y) * packetT;
              ctx.beginPath();
              ctx.arc(px, py, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${currentAccent[0]}, ${currentAccent[1]}, ${currentAccent[2]}, ${0.6 * base})`;
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        // Glow for hubs
        if (n.hub) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${currentAccent[0]}, ${currentAccent[1]}, ${currentAccent[2]}, 0.04)`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        const a = n.hub ? 0.5 : 0.25;
        ctx.fillStyle = `rgba(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]}, ${a})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    init();
    animationId = requestAnimationFrame(draw);
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}

// Cycling text animation for the slogan
function CyclingSlogan() {
  const words = ["Vernetzen.", "Optimieren.", "Wachsen."];
  const colors = ["from-[#b88aed] to-[#4610A3]", "from-[#60a5fa] to-[#3b82f6]", "from-[#4ade80] to-[#22c55e]"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % words.length);
    }, PHASE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block relative h-[1.1em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block bg-gradient-to-r ${colors[index]} bg-clip-text text-transparent`}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0015] via-[#1a0536] to-[#0d0118]" />
      
      {/* Network animation */}
      <NetworkBackground />

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
            <span className="text-white">einer Software.</span>
          </motion.h1>

          {/* Animated slogan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <CyclingSlogan />
          </motion.div>

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