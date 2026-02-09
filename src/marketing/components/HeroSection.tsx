import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Zap, Globe, LayoutDashboard, Users, FileText, Wallet, UserCog, Package, ChevronRight, TrendingUp, TrendingDown, Clock, Bell, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import loomoraLogo from "@/assets/loomora-logo.png";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Kunden", active: false },
  { icon: FileText, label: "Rechnungen", active: false },
  { icon: Wallet, label: "Finanzen", active: false },
  { icon: UserCog, label: "HR", active: false },
  { icon: Package, label: "Lager", active: false },
];

const kpis = [
  { label: "Umsatz", value: "CHF 284'500", change: "+12.5%", up: true, color: "#4610A3" },
  { label: "Offene Posten", value: "CHF 18'200", change: "3 Rechnungen", up: false, color: "#e67e22" },
  { label: "Neue Kunden", value: "24", change: "+8 diesen Monat", up: true, color: "#27ae60" },
  { label: "Projekte", value: "12", change: "4 aktiv", up: true, color: "#3498db" },
];

const chartData = [35, 52, 48, 65, 58, 72, 85, 68, 78, 92, 55, 98];
const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

const activities = [
  { text: "Rechnung #1042 an Müller AG gesendet", time: "vor 12 Min", color: "#4610A3" },
  { text: "Neuer Kunde: Weber GmbH erfasst", time: "vor 34 Min", color: "#27ae60" },
  { text: "Zahlung CHF 4'800 von Schmid & Co", time: "vor 1 Std", color: "#3498db" },
  { text: "Projekt 'Büro Zürich' abgeschlossen", time: "vor 2 Std", color: "#e67e22" },
];

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
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

        {/* App Preview Mockup - Light Mode Realistic Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(70,16,163,0.25)]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f8f8f8] border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white rounded-lg px-4 py-1 text-gray-400 text-[11px] border border-gray-200 flex items-center gap-2">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  app.loomora.ch/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content - Light mode */}
            <div className="aspect-[16/9] bg-[#f4f5f7] flex text-[11px]" style={{ fontFamily: "'Inter', sans-serif" }}>
              {/* Sidebar */}
              <div className="w-[200px] bg-white border-r border-gray-100 flex flex-col shrink-0">
                {/* Logo */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <img src={loomoraLogo} alt="Loomora" className="h-5" />
                </div>
                {/* Nav */}
                <div className="p-2 space-y-0.5 flex-1">
                  {sidebarItems.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-default transition-colors ${
                        item.active
                          ? "bg-[#4610A3]/10 text-[#4610A3] font-medium"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon size={14} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                {/* User */}
                <div className="p-3 border-t border-gray-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4610A3] to-[#7c3aed] flex items-center justify-center text-white text-[9px] font-bold">
                    ML
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-gray-800 truncate">Marco Lehmann</div>
                    <div className="text-[8px] text-gray-400">Admin</div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar */}
                <div className="h-11 bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0">
                  <div>
                    <span className="text-gray-800 font-semibold text-[13px]">Dashboard</span>
                    <span className="text-gray-400 text-[10px] ml-2">Montag, 9. Februar 2026</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 text-gray-400">
                      <Search size={12} />
                      <span className="text-[10px]">Suchen...</span>
                    </div>
                    <div className="relative">
                      <Bell size={14} className="text-gray-400" />
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                    <button className="flex items-center gap-1 bg-[#4610A3] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-medium">
                      <Plus size={10} />
                      Neu
                    </button>
                  </div>
                </div>

                {/* Dashboard body */}
                <div className="flex-1 p-4 space-y-3 overflow-hidden">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-4 gap-3">
                    {kpis.map((kpi) => (
                      <div key={kpi.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-gray-400 text-[9px] font-medium uppercase tracking-wider">{kpi.label}</span>
                          <div className={`flex items-center gap-0.5 text-[8px] font-medium ${kpi.up ? "text-emerald-600" : "text-amber-600"}`}>
                            {kpi.up ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                            {kpi.change}
                          </div>
                        </div>
                        <div className="text-gray-900 font-bold text-[15px]">{kpi.value}</div>
                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: "68%", backgroundColor: kpi.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart + Activity */}
                  <div className="grid grid-cols-3 gap-3 flex-1">
                    {/* Revenue Chart */}
                    <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-gray-800 font-semibold text-[12px]">Monatsumsatz 2026</div>
                          <div className="text-gray-400 text-[9px] mt-0.5">Umsatzentwicklung in CHF</div>
                        </div>
                        <div className="flex gap-3 text-[8px]">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-[#4610A3]" />
                            <span className="text-gray-500">Umsatz</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-sm bg-[#b88aed]/40" />
                            <span className="text-gray-500">Vorjahr</span>
                          </div>
                        </div>
                      </div>
                      {/* Chart bars */}
                      <div className="flex items-end gap-[6px] h-[100px]">
                        {chartData.map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex gap-[2px]" style={{ height: `${h}%` }}>
                              <div className="flex-1 bg-gradient-to-t from-[#4610A3] to-[#7c3aed] rounded-t-sm" />
                              <div className="flex-1 bg-[#b88aed]/25 rounded-t-sm" style={{ height: `${Math.max(30, h - 15)}%`, alignSelf: "flex-end" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-[6px] mt-1.5">
                        {months.map((m) => (
                          <div key={m} className="flex-1 text-center text-[7px] text-gray-400">{m}</div>
                        ))}
                      </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="col-span-1 bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-gray-800 font-semibold text-[12px]">Letzte Aktivitäten</div>
                        <ChevronRight size={12} className="text-gray-300" />
                      </div>
                      <div className="space-y-2.5 flex-1">
                        {activities.map((a, i) => (
                          <div key={i} className="flex gap-2.5 items-start">
                            <div className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-700 text-[10px] leading-tight">{a.text}</div>
                              <div className="text-gray-400 text-[8px] flex items-center gap-1 mt-0.5">
                                <Clock size={7} />
                                {a.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <button className="text-[#4610A3] text-[9px] font-medium hover:underline">Alle anzeigen →</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Reflection */}
          <div className="h-40 bg-gradient-to-b from-white/[0.02] to-transparent rounded-b-2xl" />
        </motion.div>
      </div>
    </section>
  );
}