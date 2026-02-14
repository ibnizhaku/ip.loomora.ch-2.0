import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Play, Shield, Zap, Globe, Menu, X, ChevronDown,
  Users, Receipt, UserCheck, Package, ShoppingCart,
  FolderKanban, FileText, Settings, BarChart3,
  Layers, Lock, Headphones, Star, Check,
  LayoutDashboard, Wallet, UserCog,
  ChevronRight, TrendingUp, TrendingDown, Clock, Bell, Search, Plus,
  MapPin, MoreHorizontal, Calendar, Download,
  CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Filter,
  UserPlus, Briefcase, Award,
  PieChart, Activity, Target, ShieldCheck, Truck,
  CircleDot, FileBarChart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import loomoraLogo from "@/assets/loomora-logo.png";

// ═══════════════════════════════════════════════════════════════
// SECTION BACKGROUNDS
// ═══════════════════════════════════════════════════════════════

function VernetzenBackground() {
  const nodes = [
    { x: 80, y: 60 }, { x: 220, y: 120 }, { x: 360, y: 80 },
    { x: 500, y: 160 }, { x: 140, y: 200 }, { x: 300, y: 240 },
    { x: 440, y: 200 }, { x: 180, y: 320 }, { x: 380, y: 340 },
    { x: 520, y: 280 }, { x: 60, y: 380 }, { x: 260, y: 400 },
  ];
  const connections = [
    [0,1],[1,2],[2,3],[0,4],[4,5],[5,6],[6,3],[4,7],[7,8],[8,9],[7,10],[10,11],[11,8],[5,8],[1,5],[2,6],
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.25 }}>
      <svg viewBox="0 0 600 460" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="vGlow"><feGaussianBlur stdDeviation="2" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {connections.map(([a, b], i) => (
          <motion.line key={`vc-${i}`}
            x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
            stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          />
        ))}
        {nodes.map((n, i) => (
          <motion.g key={`vn-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.3 + i * 0.04 }}>
            <motion.circle cx={n.x} cy={n.y} r="4" fill="#4610A3" filter="url(#vGlow)"
              animate={{ r: [4, 5.5, 4] }} transition={{ duration: 1.5 + i * 0.15, repeat: Infinity }} />
            <circle cx={n.x} cy={n.y} r="1.5" fill="#b88aed" />
            <motion.circle cx={n.x} cy={n.y} r="8" stroke="#b88aed" strokeWidth="0.4" fill="none"
              animate={{ r: [8, 14, 8], strokeOpacity: [0.3, 0, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.2 }} />
          </motion.g>
        ))}
        <motion.circle r="1.5" fill="#b88aed" filter="url(#vGlow)">
          <animateMotion dur="1.5s" repeatCount="indefinite" path={`M${nodes[0].x} ${nodes[0].y} L${nodes[1].x} ${nodes[1].y} L${nodes[5].x} ${nodes[5].y} L${nodes[8].x} ${nodes[8].y}`} />
        </motion.circle>
        <motion.circle r="1.2" fill="#7c3aed" filter="url(#vGlow)">
          <animateMotion dur="2s" repeatCount="indefinite" path={`M${nodes[3].x} ${nodes[3].y} L${nodes[6].x} ${nodes[6].y} L${nodes[5].x} ${nodes[5].y} L${nodes[4].x} ${nodes[4].y}`} />
        </motion.circle>
      </svg>
    </div>
  );
}

function OptimierenBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.2 }}>
      <svg viewBox="0 0 600 400" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="oGlow"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <motion.circle cx="300" cy="200" r="16" fill="#4610A3" fillOpacity="0.2" filter="url(#oGlow)"
          initial={{ scale: 0 }} animate={{ scale: 1, r: [16, 20, 16] }}
          transition={{ scale: { duration: 0.3 }, r: { duration: 2.5, repeat: Infinity } }} />
        <circle cx="300" cy="200" r="6" fill="#4610A3" fillOpacity="0.4" />
        <circle cx="300" cy="200" r="2.5" fill="#b88aed" />
        <motion.circle cx="300" cy="200" r="40" stroke="#7c3aed" strokeWidth="0.6" fill="none" strokeDasharray="4 4" strokeOpacity="0.3"
          animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "300px 200px" }} />
        <motion.circle cx="300" cy="200" r="70" stroke="#4610A3" strokeWidth="0.4" fill="none" strokeDasharray="2 6" strokeOpacity="0.2"
          animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "300px 200px" }} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x2 = 300 + Math.cos(rad) * 120;
          const y2 = 200 + Math.sin(rad) * 120;
          return (
            <motion.line key={`os-${i}`} x1="300" y1="200" x2={x2} y2={y2}
              stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }} />
          );
        })}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 300 + Math.cos(rad) * 90;
          const cy = 200 + Math.sin(rad) * 90;
          return (
            <motion.g key={`on-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ duration: 0.2, delay: 0.4 + i * 0.05 }}>
              <circle cx={cx} cy={cy} r="3.5" fill="#7c3aed" fillOpacity="0.4" />
              <circle cx={cx} cy={cy} r="1.5" fill="#b88aed" />
            </motion.g>
          );
        })}
        <circle r="2" fill="#b88aed" filter="url(#oGlow)">
          <animateTransform attributeName="transform" type="rotate" from="0 300 200" to="360 300 200" dur="4s" repeatCount="indefinite" />
          <animateMotion dur="4s" repeatCount="indefinite" path="M340 200 A40 40 0 1 1 339.99 200" />
        </circle>
        {[{ x: 200, y: 140 }, { x: 400, y: 260 }, { x: 180, y: 280 }, { x: 420, y: 130 }].map((sq, i) => (
          <motion.rect key={`oq-${i}`} x={sq.x - 4} y={sq.y - 4} width="8" height="8" rx="1"
            stroke="#7c3aed" strokeWidth="0.5" fill="none" strokeOpacity="0.25"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.15, delay: 0.5 + i * 0.08 }} />
        ))}
      </svg>
    </div>
  );
}

function WachsenBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.2 }}>
      <svg viewBox="0 0 600 400" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="wGlow"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <motion.path d="M300 380 V260" stroke="#4610A3" strokeWidth="1.5" strokeOpacity="0.4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.4 }} />
        <motion.path d="M300 260 L220 180" stroke="#7c3aed" strokeWidth="1" strokeOpacity="0.3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }} />
        <motion.path d="M300 260 L380 180" stroke="#7c3aed" strokeWidth="1" strokeOpacity="0.3"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }} />
        <motion.path d="M220 180 L160 120" stroke="#b88aed" strokeWidth="0.8" strokeOpacity="0.25"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.25, delay: 0.5 }} />
        <motion.path d="M220 180 L250 110" stroke="#b88aed" strokeWidth="0.8" strokeOpacity="0.25"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.25, delay: 0.55 }} />
        <motion.path d="M380 180 L350 110" stroke="#b88aed" strokeWidth="0.8" strokeOpacity="0.25"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.25, delay: 0.5 }} />
        <motion.path d="M380 180 L440 120" stroke="#b88aed" strokeWidth="0.8" strokeOpacity="0.25"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.25, delay: 0.55 }} />
        {[
          { cx: 300, cy: 260 }, { cx: 220, cy: 180 }, { cx: 380, cy: 180 },
          { cx: 160, cy: 120 }, { cx: 250, cy: 110 }, { cx: 350, cy: 110 }, { cx: 440, cy: 120 },
        ].map((n, i) => (
          <motion.g key={`wn-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.4 + i * 0.06 }}>
            <motion.circle cx={n.cx} cy={n.cy} r="4" fill="#4610A3" filter="url(#wGlow)"
              animate={{ r: [4, 6, 4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
            <circle cx={n.cx} cy={n.cy} r="1.5" fill="#b88aed" />
            <motion.circle cx={n.cx} cy={n.cy} r="8" stroke="#4610A3" strokeWidth="0.5" fill="none"
              animate={{ r: [8, 20, 8], strokeOpacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }} />
          </motion.g>
        ))}
        {[100, 200, 400, 500].map((x, i) => (
          <motion.circle key={`wp-${i}`} cx={x} r="1.5" fill="#b88aed" fillOpacity="0.4"
            animate={{ cy: [380, 40], fillOpacity: [0.4, 0] }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }} />
        ))}
      </svg>
    </div>
  );
}

function FlowDotsBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.15 }}>
      <svg viewBox="0 0 800 200" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <motion.path d="M0 100 C200 40, 400 160, 600 80 S800 120, 800 100" 
          stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.3" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }} />
        <motion.circle r="2" fill="#b88aed">
          <animateMotion dur="3s" repeatCount="indefinite" path="M0 100 C200 40, 400 160, 600 80 S800 120, 800 100" />
        </motion.circle>
        <motion.circle r="1.5" fill="#4610A3">
          <animateMotion dur="3s" repeatCount="indefinite" begin="1s" path="M0 100 C200 40, 400 160, 600 80 S800 120, 800 100" />
        </motion.circle>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD MOCKUP
// ═══════════════════════════════════════════════════════════════

type ModuleKey = "dashboard" | "kunden" | "rechnungen" | "finanzen" | "hr" | "lager";

const sidebarItems: { icon: typeof LayoutDashboard; label: string; key: ModuleKey }[] = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: Users, label: "Kunden", key: "kunden" },
  { icon: FileText, label: "Rechnungen", key: "rechnungen" },
  { icon: Wallet, label: "Finanzen", key: "finanzen" },
  { icon: UserCog, label: "HR", key: "hr" },
  { icon: Package, label: "Lager", key: "lager" },
];

const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

function Sparkline({ data, color, height = 24 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={height} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DonutChart({ segments, size = 60 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = (size - 8) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const currentOffset = offset;
        offset += dash;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="6"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        );
      })}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="text-[9px] font-bold fill-gray-700">
        {total}
      </text>
    </svg>
  );
}

// ─── Dashboard View ───
const kpis = [
  { label: "Umsatz", value: "CHF 284'500", change: "+12.5%", up: true, color: "#4610A3", sparkData: [35, 42, 38, 52, 48, 65, 58, 72, 68, 78, 85, 92] },
  { label: "Offene Posten", value: "CHF 18'200", change: "3 Rechnungen", up: false, color: "#e67e22", sparkData: [22, 28, 25, 30, 18, 24, 20, 26, 22, 18, 15, 18] },
  { label: "Neue Kunden", value: "24", change: "+8 diesen Monat", up: true, color: "#27ae60", sparkData: [2, 3, 1, 4, 2, 5, 3, 6, 4, 5, 7, 8] },
  { label: "Projekte", value: "12", change: "4 aktiv", up: true, color: "#3498db", sparkData: [8, 9, 10, 9, 11, 10, 12, 11, 13, 12, 12, 12] },
];
const chartData = [35, 52, 48, 65, 58, 72, 85, 68, 78, 92, 55, 98];
const prevYearData = [28, 40, 42, 50, 52, 58, 62, 55, 65, 70, 48, 75];
const activities = [
  { text: "Rechnung #1042 an Müller AG gesendet", time: "vor 12 Min", color: "#4610A3", icon: FileText },
  { text: "Neuer Kunde: Weber GmbH erfasst", time: "vor 34 Min", color: "#27ae60", icon: UserPlus },
  { text: "Zahlung CHF 4'800 von Schmid & Co", time: "vor 1 Std", color: "#3498db", icon: ArrowUpRight },
  { text: "Projekt 'Büro Zürich' abgeschlossen", time: "vor 2 Std", color: "#e67e22", icon: CheckCircle2 },
  { text: "Lager: Grundierung RAL 7035 kritisch", time: "vor 3 Std", color: "#e74c3c", icon: AlertCircle },
];

const upcomingTasks = [
  { text: "Meeting Müller AG", time: "10:00", tag: "CRM" },
  { text: "Rechnung #1043 erstellen", time: "11:30", tag: "Finanzen" },
  { text: "Bewerbungsgespräch", time: "14:00", tag: "HR" },
  { text: "Wareneingang prüfen", time: "15:30", tag: "Lager" },
];

function DashboardView() {
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="grid grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-[9px] font-medium uppercase tracking-wider">{kpi.label}</span>
              <div className={`flex items-center gap-0.5 text-[8px] font-medium ${kpi.up ? "text-emerald-600" : "text-amber-600"}`}>
                {kpi.up ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                {kpi.change}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-gray-900 font-bold text-[15px]">{kpi.value}</div>
              <Sparkline data={kpi.sparkData} color={kpi.color} height={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-3 flex-1">
        <div className="col-span-5 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-gray-800 font-semibold text-[11px]">Monatsumsatz 2026</div>
              <div className="text-gray-400 text-[8px]">vs. Vorjahr</div>
            </div>
            <div className="flex gap-2 text-[7px]">
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-sm bg-[#4610A3]" /><span className="text-gray-400">2026</span></div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-sm bg-[#b88aed]/40" /><span className="text-gray-400">2025</span></div>
            </div>
          </div>
          <div className="flex items-end gap-[4px] h-[80px]">
            {chartData.map((h, i) => (
              <div key={i} className="flex-1 flex gap-[1px]" style={{ height: "100%", alignItems: "flex-end" }}>
                <div className="flex-1 bg-gradient-to-t from-[#4610A3] to-[#7c3aed] rounded-t-sm" style={{ height: `${h}%` }} />
                <div className="flex-1 bg-[#b88aed]/25 rounded-t-sm" style={{ height: `${prevYearData[i]}%` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-[4px] mt-1">
            {months.map((m) => (<div key={m} className="flex-1 text-center text-[6px] text-gray-400">{m}</div>))}
          </div>
        </div>

        <div className="col-span-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="text-gray-800 font-semibold text-[11px] mb-2">Projekte nach Status</div>
          <div className="flex items-center justify-center mb-2">
            <DonutChart segments={[
              { value: 4, color: "#4610A3", label: "Aktiv" },
              { value: 3, color: "#27ae60", label: "Fertig" },
              { value: 2, color: "#e67e22", label: "Wartend" },
              { value: 3, color: "#3498db", label: "Planung" },
            ]} size={56} />
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {[
              { label: "Aktiv", value: 4, color: "#4610A3" },
              { label: "Fertig", value: 3, color: "#27ae60" },
              { label: "Wartend", value: 2, color: "#e67e22" },
              { label: "Planung", value: 3, color: "#3498db" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-gray-500 text-[7px]">{s.label}</span>
                <span className="text-gray-700 text-[7px] font-medium ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4 bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-800 font-semibold text-[11px]">Letzte Aktivitäten</div>
            <ChevronRight size={10} className="text-gray-300" />
          </div>
          <div className="space-y-1.5 flex-1">
            {activities.map((a, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="mt-0.5 w-4 h-4 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${a.color}15` }}>
                  <a.icon size={8} style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-700 text-[9px] leading-tight truncate">{a.text}</div>
                  <div className="text-gray-400 text-[7px] flex items-center gap-0.5 mt-0.5"><Clock size={6} />{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-5 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-800 font-semibold text-[11px]">Heutige Aufgaben</div>
            <span className="text-[8px] text-gray-400">4 Einträge</span>
          </div>
          <div className="space-y-1.5">
            {upcomingTasks.map((t, i) => (
              <div key={i} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
                <div className="w-1 h-1 rounded-full bg-[#4610A3]" />
                <span className="text-gray-500 text-[8px] font-mono w-8 shrink-0">{t.time}</span>
                <span className="text-gray-700 text-[9px] flex-1 truncate">{t.text}</span>
                <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[#4610A3]/8 text-[#4610A3] font-medium">{t.tag}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-7 grid grid-cols-3 gap-3">
          {[
            { icon: Target, label: "Conversion Rate", value: "32%", sub: "+4% vs. Jan", color: "#4610A3" },
            { icon: ShieldCheck, label: "Kundenzufriedenheit", value: "4.8/5", sub: "128 Bewertungen", color: "#27ae60" },
            { icon: Activity, label: "Systemstatus", value: "99.9%", sub: "Uptime (30 Tage)", color: "#3498db" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${s.color}12` }}>
                  <s.icon size={10} style={{ color: s.color }} />
                </div>
                <span className="text-gray-400 text-[8px] font-medium uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-gray-900 font-bold text-[14px]">{s.value}</div>
              <div className="text-gray-400 text-[7px] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Kunden View ───
const customers = [
  { name: "Müller AG", contact: "Hans Müller", email: "h.mueller@mueller-ag.ch", phone: "+41 44 123 45 67", city: "Zürich", status: "Aktiv", revenue: "CHF 48'200", rating: 5, projects: 3 },
  { name: "Weber GmbH", contact: "Sandra Weber", email: "s.weber@weber-gmbh.ch", phone: "+41 31 234 56 78", city: "Bern", status: "Aktiv", revenue: "CHF 32'100", rating: 4, projects: 2 },
  { name: "Schmid & Co", contact: "Peter Schmid", email: "p.schmid@schmid-co.ch", phone: "+41 61 345 67 89", city: "Basel", status: "Aktiv", revenue: "CHF 27'500", rating: 5, projects: 1 },
  { name: "Fischer Technik", contact: "Anna Fischer", email: "a.fischer@fischer-tech.ch", phone: "+41 71 456 78 90", city: "St. Gallen", status: "Inaktiv", revenue: "CHF 15'800", rating: 3, projects: 0 },
  { name: "Keller Bau AG", contact: "Thomas Keller", email: "t.keller@keller-bau.ch", phone: "+41 52 567 89 01", city: "Winterthur", status: "Aktiv", revenue: "CHF 62'400", rating: 4, projects: 4 },
];

function KundenView() {
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Kunden", value: "148", change: "+12 Q1", color: "#4610A3", icon: Users },
          { label: "Aktive Kunden", value: "124", change: "83.8%", color: "#27ae60", icon: CheckCircle2 },
          { label: "Ø Umsatz/Kunde", value: "CHF 37'200", change: "+8.4%", color: "#3498db", icon: BarChart3 },
          { label: "Neukundenquote", value: "18%", change: "+3% vs. Q4", color: "#e67e22", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-[8px] font-medium uppercase tracking-wider">{s.label}</span>
              <s.icon size={10} style={{ color: s.color }} />
            </div>
            <div className="text-gray-900 font-bold text-[14px]">{s.value}</div>
            <div className="text-gray-400 text-[7px] mt-0.5">{s.change}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 text-gray-400 text-[9px]">
            <Search size={9} /><span>Suchen...</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 text-gray-400 text-[9px]">
            <Filter size={9} /><span>Filter</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 bg-gray-50 text-gray-600 px-2 py-1 rounded-lg text-[9px]">
            <Download size={9} />Export
          </button>
          <button className="flex items-center gap-1 bg-[#4610A3] text-white px-2 py-1 rounded-lg text-[9px] font-medium">
            <UserPlus size={9} />Neuer Kunde
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-[8px] text-gray-400 uppercase tracking-wider">
              <th className="text-left px-3 py-2 font-medium">Firma</th>
              <th className="text-left px-3 py-2 font-medium">Kontakt</th>
              <th className="text-left px-3 py-2 font-medium">Ort</th>
              <th className="text-right px-3 py-2 font-medium">Umsatz</th>
              <th className="text-center px-3 py-2 font-medium">Projekte</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
              <th className="text-right px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#4610A3]/10 to-[#7c3aed]/10 flex items-center justify-center text-[#4610A3] text-[8px] font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-gray-800 text-[10px] font-medium">{c.name}</div>
                      <div className="text-gray-400 text-[7px]">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-600 text-[9px]">{c.contact}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1 text-gray-500 text-[9px]">
                    <MapPin size={8} />{c.city}
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-gray-800 text-[9px] font-medium">{c.revenue}</td>
                <td className="px-3 py-2 text-center text-gray-600 text-[9px]">{c.projects}</td>
                <td className="px-3 py-2">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${c.status === "Aktiv" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <MoreHorizontal size={10} className="text-gray-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[8px] text-gray-400">Zeige 1-5 von 148</span>
          <div className="flex gap-1">
            {[1, 2, 3, "...", 30].map((p, i) => (
              <div key={i} className={`w-5 h-5 rounded flex items-center justify-center text-[8px] ${p === 1 ? "bg-[#4610A3] text-white" : "text-gray-400 hover:bg-gray-50"}`}>{p}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rechnungen View ───
const invoices = [
  { nr: "#1042", kunde: "Müller AG", betrag: "CHF 12'400", datum: "08.02.2026", faellig: "08.03.2026", status: "Gesendet" },
  { nr: "#1041", kunde: "Keller Bau AG", betrag: "CHF 8'750", datum: "05.02.2026", faellig: "05.03.2026", status: "Bezahlt" },
  { nr: "#1040", kunde: "Weber GmbH", betrag: "CHF 5'200", datum: "01.02.2026", faellig: "01.03.2026", status: "Gesendet" },
  { nr: "#1039", kunde: "Schmid & Co", betrag: "CHF 4'800", datum: "28.01.2026", faellig: "28.02.2026", status: "Bezahlt" },
  { nr: "#1038", kunde: "Fischer Technik", betrag: "CHF 3'250", datum: "22.01.2026", faellig: "22.02.2026", status: "Überfällig" },
  { nr: "#1037", kunde: "Baumann Elektronik", betrag: "CHF 6'900", datum: "18.01.2026", faellig: "18.02.2026", status: "Bezahlt" },
];

function RechnungenView() {
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Offen", value: "CHF 17'600", count: "2 Rechnungen", icon: FileText, color: "#e67e22" },
          { label: "Bezahlt (Feb)", value: "CHF 20'450", count: "3 Rechnungen", icon: CheckCircle2, color: "#27ae60" },
          { label: "Überfällig", value: "CHF 3'250", count: "1 Rechnung", icon: AlertCircle, color: "#e74c3c" },
          { label: "Total (YTD)", value: "CHF 41'300", count: "6 Rechnungen", icon: Receipt, color: "#4610A3" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-[8px] font-medium uppercase tracking-wider">{s.label}</span>
              <s.icon size={10} style={{ color: s.color }} />
            </div>
            <div className="text-gray-900 font-bold text-[14px]">{s.value}</div>
            <div className="text-gray-400 text-[7px] mt-0.5">{s.count}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 text-gray-400 text-[9px]"><Search size={9} />Suchen...</div>
          <div className="flex gap-1">
            {["Alle", "Offen", "Bezahlt", "Überfällig"].map((f, i) => (
              <span key={f} className={`text-[8px] px-2 py-0.5 rounded-full cursor-pointer ${i === 0 ? "bg-[#4610A3] text-white" : "bg-gray-50 text-gray-500"}`}>{f}</span>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-1 bg-[#4610A3] text-white px-2 py-1 rounded-lg text-[9px] font-medium">
          <Plus size={9} />Neue Rechnung
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-[8px] text-gray-400 uppercase tracking-wider">
              <th className="text-left px-3 py-2 font-medium">Nr.</th>
              <th className="text-left px-3 py-2 font-medium">Kunde</th>
              <th className="text-right px-3 py-2 font-medium">Betrag</th>
              <th className="text-left px-3 py-2 font-medium">Datum</th>
              <th className="text-left px-3 py-2 font-medium">Fällig</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
              <th className="text-right px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.nr} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-3 py-2 text-[#4610A3] text-[9px] font-medium">{inv.nr}</td>
                <td className="px-3 py-2 text-gray-800 text-[9px]">{inv.kunde}</td>
                <td className="px-3 py-2 text-right text-gray-800 text-[9px] font-medium">{inv.betrag}</td>
                <td className="px-3 py-2 text-gray-500 text-[9px]">{inv.datum}</td>
                <td className="px-3 py-2 text-gray-500 text-[9px]">{inv.faellig}</td>
                <td className="px-3 py-2">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                    inv.status === "Bezahlt" ? "bg-emerald-50 text-emerald-600" :
                    inv.status === "Überfällig" ? "bg-red-50 text-red-600" :
                    "bg-blue-50 text-blue-600"
                  }`}>{inv.status}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <MoreHorizontal size={10} className="text-gray-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Finanzen View ───
function FinanzenView() {
  const balances = [
    { label: "Bankguthaben", value: "CHF 342'180", change: "+5.2%", up: true, icon: Wallet },
    { label: "Debitoren", value: "CHF 67'400", change: "+2 neue", up: true, icon: ArrowUpRight },
    { label: "Kreditoren", value: "CHF 28'900", change: "3 offen", up: false, icon: ArrowDownRight },
    { label: "Liquidität", value: "CHF 313'280", change: "Netto", up: true, icon: Activity },
  ];
  const transactions = [
    { text: "Zahlung Müller AG", betrag: "+CHF 12'400", type: "in", date: "09.02" },
    { text: "Lieferant Stahl24", betrag: "-CHF 8'200", type: "out", date: "08.02" },
    { text: "Zahlung Schmid & Co", betrag: "+CHF 4'800", type: "in", date: "07.02" },
    { text: "Sozialversicherungen Feb", betrag: "-CHF 14'500", type: "out", date: "05.02" },
    { text: "Miete Werkstatt", betrag: "-CHF 3'800", type: "out", date: "01.02" },
    { text: "Zahlung Keller Bau AG", betrag: "+CHF 8'750", type: "in", date: "01.02" },
  ];
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="grid grid-cols-4 gap-3">
        {balances.map((b) => (
          <div key={b.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-[8px] font-medium uppercase tracking-wider">{b.label}</span>
              <b.icon size={10} className={b.up ? "text-emerald-500" : "text-amber-500"} />
            </div>
            <div className="text-gray-900 font-bold text-[14px] mt-1">{b.value}</div>
            <div className={`flex items-center gap-0.5 text-[7px] mt-0.5 font-medium ${b.up ? "text-emerald-600" : "text-amber-600"}`}>
              {b.up ? <ArrowUpRight size={7} /> : <ArrowDownRight size={7} />}{b.change}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-800 font-semibold text-[11px]">Letzte Buchungen</div>
            <span className="text-[8px] text-gray-400">6 Einträge</span>
          </div>
          <div className="space-y-1">
            {transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] ${t.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                    {t.type === "in" ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                  </div>
                  <div>
                    <span className="text-gray-700 text-[9px]">{t.text}</span>
                    <div className="text-gray-400 text-[7px]">{t.date}</div>
                  </div>
                </div>
                <span className={`text-[9px] font-medium ${t.type === "in" ? "text-emerald-600" : "text-red-500"}`}>{t.betrag}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-5 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="text-gray-800 font-semibold text-[11px] mb-2">Cashflow Übersicht</div>
          <div className="flex items-end gap-1 h-[70px]">
            {[45, 62, 38, 55, 72, 48, 65, 82, 58, 75, 42, 88].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-full rounded-t-sm ${h > 50 ? "bg-emerald-400/60" : "bg-red-400/40"}`} style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {months.map((m) => (<div key={m} className="flex-1 text-center text-[6px] text-gray-400">{m}</div>))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-50 grid grid-cols-2 gap-2">
            <div>
              <div className="text-[7px] text-gray-400">Einnahmen</div>
              <div className="text-[10px] text-emerald-600 font-semibold">CHF 25'950</div>
            </div>
            <div>
              <div className="text-[7px] text-gray-400">Ausgaben</div>
              <div className="text-[10px] text-red-500 font-semibold">CHF 26'500</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HR View ───
const employees = [
  { name: "Marco Lehmann", role: "Geschäftsführer", dept: "Management", status: "Aktiv", since: "01.03.2018", hours: "42h" },
  { name: "Lisa Brunner", role: "Buchhalterin", dept: "Finanzen", status: "Aktiv", since: "15.06.2020", hours: "38h" },
  { name: "Thomas Steiner", role: "Werkstattleiter", dept: "Produktion", status: "Aktiv", since: "01.09.2019", hours: "41h" },
  { name: "Sarah Meier", role: "HR Managerin", dept: "Personal", status: "Aktiv", since: "01.02.2021", hours: "40h" },
  { name: "David Huber", role: "Servicetechniker", dept: "Service", status: "Abwesend", since: "15.04.2022", hours: "—" },
];

function HRView() {
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Mitarbeiter", value: "18", icon: Users, sub: "16 aktiv", color: "#4610A3" },
          { label: "Abwesend", value: "2", icon: Calendar, sub: "1 Krankheit", color: "#e67e22" },
          { label: "Offene Stellen", value: "3", icon: Briefcase, sub: "2 Interviews", color: "#3498db" },
          { label: "Schulungen", value: "5", icon: Award, sub: "Feb geplant", color: "#27ae60" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-[8px] font-medium uppercase tracking-wider">{s.label}</span>
              <s.icon size={10} style={{ color: s.color }} />
            </div>
            <div className="text-gray-900 font-bold text-[15px]">{s.value}</div>
            <div className="text-gray-400 text-[7px] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-gray-800 font-semibold text-[11px]">Mitarbeiterliste</span>
            <button className="flex items-center gap-1 bg-[#4610A3] text-white px-2 py-1 rounded-lg text-[8px] font-medium">
              <UserPlus size={8} />Hinzufügen
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-[8px] text-gray-400 uppercase tracking-wider">
                <th className="text-left px-3 py-1.5 font-medium">Name</th>
                <th className="text-left px-3 py-1.5 font-medium">Position</th>
                <th className="text-left px-3 py-1.5 font-medium">Abteilung</th>
                <th className="text-left px-3 py-1.5 font-medium">Stunden</th>
                <th className="text-left px-3 py-1.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#4610A3] to-[#7c3aed] flex items-center justify-center text-white text-[7px] font-bold">
                        {e.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="text-gray-800 text-[9px] font-medium">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-gray-600 text-[9px]">{e.role}</td>
                  <td className="px-3 py-1.5 text-gray-500 text-[9px]">{e.dept}</td>
                  <td className="px-3 py-1.5 text-gray-600 text-[9px] font-mono">{e.hours}</td>
                  <td className="px-3 py-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${e.status === "Aktiv" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-span-4 space-y-3">
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="text-gray-800 font-semibold text-[10px] mb-2">Abteilungen</div>
            <div className="space-y-1.5">
              {[
                { dept: "Produktion", count: 6, color: "#4610A3" },
                { dept: "Service", count: 4, color: "#3498db" },
                { dept: "Finanzen", count: 3, color: "#27ae60" },
                { dept: "Management", count: 3, color: "#e67e22" },
                { dept: "Personal", count: 2, color: "#e74c3c" },
              ].map((d) => (
                <div key={d.dept} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600 text-[8px] flex-1">{d.dept}</span>
                  <span className="text-gray-800 text-[8px] font-medium">{d.count}</span>
                  <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(d.count / 6) * 100}%`, backgroundColor: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="text-gray-800 font-semibold text-[10px] mb-1.5">Absenzen heute</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-[7px] font-bold">DH</div>
                <div>
                  <div className="text-gray-700 text-[8px]">David Huber</div>
                  <div className="text-gray-400 text-[7px]">Krankheit</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[7px] font-bold">AK</div>
                <div>
                  <div className="text-gray-700 text-[8px]">Andrea Kunz</div>
                  <div className="text-gray-400 text-[7px]">Ferien</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lager View ───
const products = [
  { name: "Stahlprofil HEA 200", sku: "SP-200", bestand: 145, min: 50, einheit: "Stk", status: "OK", wert: "CHF 14'500" },
  { name: "Schweissgas Argon 4.6", sku: "SG-046", bestand: 12, min: 10, einheit: "Fl", status: "Tief", wert: "CHF 2'400" },
  { name: "Schrauben M12x40", sku: "SC-1240", bestand: 2400, min: 500, einheit: "Stk", status: "OK", wert: "CHF 960" },
  { name: "Grundierung RAL 7035", sku: "GR-7035", bestand: 8, min: 15, einheit: "Ltr", status: "Kritisch", wert: "CHF 320" },
  { name: "Flachstahl 50x5mm", sku: "FS-505", bestand: 89, min: 30, einheit: "m", status: "OK", wert: "CHF 4'450" },
  { name: "Dichtungsband 15mm", sku: "DB-015", bestand: 340, min: 100, einheit: "m", status: "OK", wert: "CHF 680" },
];

function LagerView() {
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Artikel", value: "248", sub: "5 Kategorien", icon: Package, color: "#4610A3" },
          { label: "Tiefer Bestand", value: "3", sub: "Nachbestellen", icon: AlertCircle, color: "#e67e22" },
          { label: "Lagerwert", value: "CHF 186'400", sub: "+2.1% vs. Jan", icon: BarChart3, color: "#27ae60" },
          { label: "Wareneingänge", value: "12", sub: "Diese Woche", icon: Truck, color: "#3498db" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-[8px] font-medium uppercase tracking-wider">{s.label}</span>
              <s.icon size={10} style={{ color: s.color }} />
            </div>
            <div className="text-gray-900 font-bold text-[14px]">{s.value}</div>
            <div className="text-gray-400 text-[7px] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 text-gray-400 text-[9px]"><Search size={9} />Suchen...</div>
          <div className="flex gap-1">
            {["Alle", "OK", "Tief", "Kritisch"].map((f, i) => (
              <span key={f} className={`text-[8px] px-2 py-0.5 rounded-full ${i === 0 ? "bg-[#4610A3] text-white" : "bg-gray-50 text-gray-500"}`}>{f}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 bg-gray-50 text-gray-600 px-2 py-1 rounded-lg text-[8px]">
            <Download size={8} />Export
          </button>
          <button className="flex items-center gap-1 bg-[#4610A3] text-white px-2 py-1 rounded-lg text-[8px] font-medium">
            <Plus size={8} />Wareneingang
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-[8px] text-gray-400 uppercase tracking-wider">
              <th className="text-left px-3 py-1.5 font-medium">Artikel</th>
              <th className="text-left px-3 py-1.5 font-medium">SKU</th>
              <th className="text-right px-3 py-1.5 font-medium">Bestand</th>
              <th className="text-right px-3 py-1.5 font-medium">Min.</th>
              <th className="text-right px-3 py-1.5 font-medium">Wert</th>
              <th className="text-left px-3 py-1.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center">
                      <Layers size={8} className="text-gray-400" />
                    </div>
                    <span className="text-gray-800 text-[9px] font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-3 py-1.5 text-gray-400 text-[9px] font-mono">{p.sku}</td>
                <td className="px-3 py-1.5 text-right text-gray-800 text-[9px]">{p.bestand} {p.einheit}</td>
                <td className="px-3 py-1.5 text-right text-gray-400 text-[9px]">{p.min}</td>
                <td className="px-3 py-1.5 text-right text-gray-700 text-[9px] font-medium">{p.wert}</td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                      p.status === "OK" ? "bg-emerald-50 text-emerald-600" :
                      p.status === "Tief" ? "bg-amber-50 text-amber-600" :
                      "bg-red-50 text-red-600"
                    }`}>{p.status}</span>
                    {p.status !== "OK" && (
                      <div className="w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${p.status === "Tief" ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${(p.bestand / p.min) * 100}%` }} />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Module Config ───
const moduleTitles: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  kunden: "Kunden",
  rechnungen: "Rechnungen",
  finanzen: "Finanzen",
  hr: "Personal",
  lager: "Lager",
};

const moduleViews: Record<ModuleKey, () => JSX.Element> = {
  dashboard: DashboardView,
  kunden: KundenView,
  rechnungen: RechnungenView,
  finanzen: FinanzenView,
  hr: HRView,
  lager: LagerView,
};

const cycleOrder: ModuleKey[] = ["dashboard", "kunden", "rechnungen", "finanzen", "hr", "lager"];

function DashboardMockup() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const ActiveView = moduleViews[activeModule];

  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setActiveModule((prev) => {
        const idx = cycleOrder.indexOf(prev);
        return cycleOrder[(idx + 1) % cycleOrder.length];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoCycling]);

  const handleModuleClick = useCallback((key: ModuleKey) => {
    setIsAutoCycling(false);
    setActiveModule(key);
    setTimeout(() => setIsAutoCycling(true), 12000);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mt-16 w-full"
      style={{ perspective: "2000px" }}
    >
      <div className="absolute -inset-10 bg-gradient-to-b from-[#4610A3]/30 via-[#7c3aed]/20 to-transparent rounded-[40px] blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-[#4610A3]/15 rounded-full blur-[120px] pointer-events-none" />

      <div
        className="relative rounded-2xl overflow-hidden border border-white/[0.15] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_80px_-20px_rgba(70,16,163,0.5),0_0_120px_rgba(70,16,163,0.15)]"
        style={{ transform: "rotateX(2deg)", transformOrigin: "center bottom" }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-10 pointer-events-none" />

        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1e] border-b border-white/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white/[0.06] rounded-lg px-4 py-1 text-white/40 text-[11px] border border-white/[0.08] flex items-center gap-2 min-w-[260px] justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
              app.loomora.ch/{activeModule === "dashboard" ? "dashboard" : activeModule}
            </div>
          </div>
        </div>

        <div className="bg-[#f4f5f7] flex text-[12px]" style={{ fontFamily: "'Inter', sans-serif", aspectRatio: "16/9" }}>
          <div className="w-[200px] bg-white border-r border-gray-100 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <img src={loomoraLogo} alt="Loomora" className="h-5" />
            </div>
            <div className="p-2 space-y-0.5 flex-1">
              {sidebarItems.map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleModuleClick(item.key)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 select-none ${
                    activeModule === item.key
                      ? "bg-[#4610A3]/10 text-[#4610A3] font-medium"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                  {activeModule === item.key && (
                    <div className="ml-auto w-1 h-1 rounded-full bg-[#4610A3]" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-2 border-t border-gray-100 space-y-0.5">
              <div className="flex items-center gap-2.5 px-3 py-1.5 text-gray-400 text-[11px]">
                <Settings size={12} /><span>Einstellungen</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-1.5 text-gray-400 text-[11px]">
                <FileBarChart size={12} /><span>Berichte</span>
              </div>
            </div>
            <div className="p-3 border-t border-gray-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4610A3] to-[#7c3aed] flex items-center justify-center text-white text-[9px] font-bold">ML</div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium text-gray-800 truncate">Marco Lehmann</div>
                <div className="text-[8px] text-gray-400">Admin</div>
              </div>
              <CircleDot size={10} className="text-emerald-400" />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="h-11 bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-gray-800 font-semibold text-[13px]">{moduleTitles[activeModule]}</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-400 text-[10px]">Übersicht</span>
                <span className="text-gray-300 text-[10px] ml-2">·</span>
                <span className="text-gray-400 text-[10px] ml-1">Montag, 9. Februar 2026</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 text-gray-400">
                  <Search size={12} />
                  <span className="text-[10px]">Suchen...</span>
                  <span className="text-[8px] text-gray-300 ml-2 border border-gray-200 rounded px-1">⌘K</span>
                </div>
                <div className="relative">
                  <Bell size={14} className="text-gray-400" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                </div>
                <button className="flex items-center gap-1 bg-[#4610A3] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-medium">
                  <Plus size={10} />Neu
                </button>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex flex-col overflow-hidden"
                >
                  <ActiveView />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {isAutoCycling && (
        <div className="flex justify-center mt-4 gap-1.5">
          {cycleOrder.map((key) => (
            <div
              key={key}
              className={`h-1 rounded-full transition-all duration-300 ${
                activeModule === key ? "w-6 bg-[#7c3aed]" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}

      <div
        className="h-24 mt-[-1px] rounded-b-2xl overflow-hidden opacity-30 pointer-events-none"
        style={{
          transform: "rotateX(-2deg) scaleY(-1)",
          transformOrigin: "center top",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)",
        }}
      >
        <div className="h-full bg-gradient-to-b from-[#4610A3]/10 to-transparent" />
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO SECTION - Circuit Background
// ═══════════════════════════════════════════════════════════════

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
          <linearGradient id="traceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4610A3" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#b88aed" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
            <stop offset="50%" stopColor="#b88aed" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* VERNETZEN */}
        <g className="vernetzen-group">
          <motion.path d="M-50 200 H200 V400 H350 V300 H500" stroke="url(#traceGrad)" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }} />
          <motion.path d="M-50 500 H150 V350 H300 V500 H450 V400" stroke="url(#traceGrad)" strokeWidth="1" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeInOut", delay: 0.15 }} />
          <motion.path d="M100 100 V250 H250 V150 H400 V350" stroke="url(#traceGrad)" strokeWidth="1" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeInOut", delay: 0.2 }} />
          <motion.path d="M-50 700 H200 V600 H350 V700 H500 V550" stroke="url(#traceGrad)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 6"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeInOut", delay: 0.25 }} />

          {[
            { cx: 200, cy: 200 }, { cx: 200, cy: 400 }, { cx: 350, cy: 300 },
            { cx: 150, cy: 350 }, { cx: 300, cy: 500 }, { cx: 100, cy: 250 },
            { cx: 250, cy: 150 }, { cx: 200, cy: 600 }, { cx: 350, cy: 700 },
          ].map((node, i) => (
            <motion.g key={`vn-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15, delay: 0.3 + i * 0.03 }}>
              <motion.circle cx={node.cx} cy={node.cy} r="6" fill="#4610A3" filter="url(#glow)"
                animate={{ r: [6, 8, 6] }} transition={{ duration: 1.2 + i * 0.15, repeat: Infinity, ease: "easeInOut" }} />
              <circle cx={node.cx} cy={node.cy} r="2.5" fill="#b88aed" />
              <motion.circle cx={node.cx} cy={node.cy} r="12" stroke="#b88aed" strokeWidth="0.5" fill="none" strokeOpacity="0.3"
                animate={{ r: [12, 18, 12], strokeOpacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }} />
            </motion.g>
          ))}

          <motion.circle r="2" fill="#b88aed" filter="url(#glow)">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M-50 200 H200 V400 H350 V300 H500" />
          </motion.circle>
          <motion.circle r="1.5" fill="#7c3aed" filter="url(#glow)">
            <animateMotion dur="1.8s" repeatCount="indefinite" path="M-50 500 H150 V350 H300 V500 H450 V400" />
          </motion.circle>
        </g>

        {/* OPTIMIEREN */}
        <g className="optimieren-group">
          <motion.path d="M700 300 H960 V540 H700 V300" stroke="#7c3aed" strokeWidth="1" strokeOpacity="0.3" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3 }} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 830 + Math.cos(rad) * 200;
            const cy = 420 + Math.sin(rad) * 200;
            return (
              <motion.line key={`opt-${i}`} x1="830" y1="420" x2={cx} y2={cy}
                stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="3 5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.03 }} />
            );
          })}

          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2, delay: 0.35 }}>
            <motion.circle cx="830" cy="420" r="20" fill="#4610A3" fillOpacity="0.15" filter="url(#softGlow)"
              animate={{ r: [20, 25, 20] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
            <circle cx="830" cy="420" r="10" fill="#4610A3" fillOpacity="0.3" />
            <circle cx="830" cy="420" r="4" fill="#b88aed" />
            <motion.circle cx="830" cy="420" r="30" stroke="#b88aed" strokeWidth="0.5" fill="none" strokeDasharray="4 4"
              animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "830px 420px" }} />
          </motion.g>

          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const cx = 830 + Math.cos(rad) * 140;
            const cy = 420 + Math.sin(rad) * 140;
            return (
              <motion.g key={`sat-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15, delay: 0.5 + i * 0.03 }}>
                <circle cx={cx} cy={cy} r="5" fill="#7c3aed" fillOpacity="0.4" />
                <circle cx={cx} cy={cy} r="2" fill="#b88aed" />
              </motion.g>
            );
          })}

          <circle r="2" fill="#b88aed" filter="url(#glow)" cx="970" cy="420">
            <animateTransform attributeName="transform" type="rotate" from="0 830 420" to="360 830 420" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* WACHSEN */}
        <g className="wachsen-group">
          <motion.path d="M1400 200 H1550 V350 H1700 V250 H1850 V400 H1970" stroke="url(#traceGrad)" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: "easeInOut", delay: 0.5 }} />
          <motion.path d="M1350 500 H1500 V650 H1650 V500 H1800 V700 H1970" stroke="url(#traceGrad)" strokeWidth="1" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: "easeInOut", delay: 0.55 }} />
          <motion.path d="M1450 400 V550 H1600 V450 H1750 V600 H1900" stroke="url(#traceGrad)" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 6"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeInOut", delay: 0.6 }} />

          {[
            { cx: 1550, cy: 350 }, { cx: 1700, cy: 250 }, { cx: 1850, cy: 400 },
            { cx: 1500, cy: 650 }, { cx: 1650, cy: 500 }, { cx: 1800, cy: 700 },
            { cx: 1600, cy: 450 }, { cx: 1750, cy: 600 },
          ].map((node, i) => (
            <motion.g key={`wn-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15, delay: 0.65 + i * 0.03 }}>
              <motion.circle cx={node.cx} cy={node.cy} r="5" fill="#4610A3" filter="url(#glow)"
                animate={{ r: [5, 7, 5] }} transition={{ duration: 1.2 + i * 0.1, repeat: Infinity, ease: "easeInOut" }} />
              <circle cx={node.cx} cy={node.cy} r="2" fill="#b88aed" />
              <motion.circle cx={node.cx} cy={node.cy} r="10" stroke="#4610A3" strokeWidth="0.5" fill="none"
                animate={{ r: [10, 25, 10], strokeOpacity: [0.4, 0, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }} />
            </motion.g>
          ))}

          <motion.circle r="2" fill="#b88aed" filter="url(#glow)">
            <animateMotion dur="1.5s" repeatCount="indefinite" path="M1400 200 H1550 V350 H1700 V250 H1850 V400 H1970" />
          </motion.circle>
        </g>

        {/* Cross-connections */}
        <motion.path d="M500 300 C600 350, 650 400, 700 400" stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.15" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
        <motion.path d="M960 420 C1050 400, 1200 350, 1400 300" stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.15" fill="none"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.55 }} />
        <motion.path d="M500 550 C600 500, 700 480, 750 450" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.1" fill="none" strokeDasharray="3 6"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.52 }} />
        <motion.path d="M910 500 C1000 550, 1200 600, 1350 500" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.1" fill="none" strokeDasharray="3 6"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.58 }} />

        {/* Decorative dots */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x = 100 + Math.random() * 1700;
          const y = 100 + Math.random() * 800;
          return (
            <motion.circle key={`dot-${i}`} cx={x} cy={y} r="1" fill="#b88aed" fillOpacity="0.15"
              animate={{ fillOpacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 1.2 + Math.random() * 1.5, repeat: Infinity, delay: Math.random() * 0.8 }} />
          );
        })}

        {[
          { x: 280, y: 250 }, { x: 450, y: 400 }, { x: 1480, y: 300 },
          { x: 1720, y: 550 }, { x: 800, y: 280 }, { x: 860, y: 560 },
        ].map((sq, i) => (
          <motion.rect key={`sq-${i}`} x={sq.x - 4} y={sq.y - 4} width="8" height="8" rx="1"
            stroke="#7c3aed" strokeWidth="0.5" fill="none" strokeOpacity="0.2"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.1, delay: 0.3 + i * 0.06 }} />
        ))}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0015] via-[#1a0536] to-[#0d0118]" />
      <CircuitBackground />

      <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#4610A3]/20 rounded-full blur-[120px]" />
      <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7c3aed]/15 rounded-full blur-[100px]" />
      <motion.div animate={{ x: [0, 15, 0], y: [0, 15, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-[#b88aed]/10 rounded-full blur-[80px]" />

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-40 pb-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 text-sm font-medium">Jetzt verfügbar für Schweizer KMU</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]" style={{ fontFamily: "'Sora', sans-serif" }}>
            <span className="text-white">Alles in</span><br />
            <span className="bg-gradient-to-r from-[#b88aed] via-[#9f6dd8] to-[#4610A3] bg-clip-text text-transparent">einer Software.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mt-8 leading-relaxed">
            Loomora vereint CRM, Buchhaltung, HR, Produktion und mehr – entwickelt für die Anforderungen von Schweizer KMU.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(70,16,163,0.5)" }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="group bg-gradient-to-r from-[#4610A3] to-[#7c3aed] text-white font-semibold px-8 py-4 rounded-2xl text-base flex items-center gap-3 transition-shadow">
              Kostenlos starten
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="group flex items-center gap-3 text-white/60 hover:text-white font-medium px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Play size={16} fill="currentColor" />
              </div>
              Demo ansehen
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16">
            {[
              { icon: Shield, text: "Swiss Hosting" },
              { icon: Globe, text: "DSGVO-konform" },
              { icon: Zap, text: "Setup in 15 Min" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-white/30 text-sm">
                <item.icon size={16} />
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <DashboardMockup />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0015] to-transparent z-20 pointer-events-none" />
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SOCIAL PROOF SECTION
// ═══════════════════════════════════════════════════════════════

const logos = [
  "Müller AG", "Weber GmbH", "Schmid & Co", "Fischer Technik",
  "Keller Bau", "Brunner Metall", "Steiner Solutions", "Huber Logistik",
];

const testimonials = [
  { quote: "Loomora hat unsere gesamte Administration revolutioniert. Statt 5 Tools brauchen wir nur noch eines.", name: "Hans Müller", role: "CEO, Müller AG", initials: "HM", rating: 5 },
  { quote: "Endlich eine Software, die QR-Rechnungen und Schweizer Buchhaltung wirklich versteht. Top Support!", name: "Sandra Weber", role: "CFO, Weber GmbH", initials: "SW", rating: 5 },
  { quote: "Von Offerte bis Zahlung alles in einem System. Unsere Effizienz hat sich verdreifacht.", name: "Thomas Keller", role: "Geschäftsführer, Keller Bau AG", initials: "TK", rating: 5 },
];

function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0015] to-[#0d0118]" />
      <FlowDotsBackground />
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }} className="text-center mb-12">
          <p className="text-white/25 text-xs font-medium tracking-[0.2em] uppercase mb-8">Vertraut von führenden Schweizer KMU</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logos.map((logo, i) => (
              <motion.div key={logo} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="text-white/15 text-sm font-semibold tracking-wide hover:text-white/30 transition-colors" style={{ fontFamily: "'Sora', sans-serif" }}>
                {logo}
              </motion.div>
            ))}
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-500">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4610A3] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold">{t.initials}</div>
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

// ═══════════════════════════════════════════════════════════════
// STATS SECTION
// ═══════════════════════════════════════════════════════════════

function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");
  const hasDecimal = target % 1 !== 0;

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const start = performance.now();
    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(hasDecimal ? current.toFixed(1) : Math.round(current).toString());
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [isInView, target, hasDecimal]);

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

const stats = [
  { value: 200, suffix: "+", label: "Schweizer KMU" },
  { value: 99.9, suffix: "%", label: "Uptime-Garantie" },
  { value: 15, suffix: " Min", label: "Ø Setup-Zeit" },
  { value: 50, suffix: "%", label: "Weniger Admin-Aufwand" },
];

function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-[#0d0118]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#4610A3]/40 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#4610A3]/40 to-transparent" />
      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                {isInView && <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
              </div>
              <div className="text-white/30 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// MODULES SECTION
// ═══════════════════════════════════════════════════════════════

const modules = [
  { icon: Users, title: "CRM & Vertrieb", description: "Kunden, Leads, Angebote, Aufträge und Rechnungen – alles in einer Pipeline.", color: "#4610A3" },
  { icon: Receipt, title: "Finanzen & Buchhaltung", description: "Kontenplan, Journalbuchungen, MwSt, QR-Rechnungen – Swiss-Ready.", color: "#7c3aed" },
  { icon: UserCheck, title: "HR & Personal", description: "Lohnabrechnung, Zeiterfassung, Abwesenheiten, Swissdec-Integration.", color: "#9f6dd8" },
  { icon: Package, title: "Lager & Produktion", description: "Artikel, Stücklisten, Produktionsaufträge und Qualitätskontrolle.", color: "#b88aed" },
  { icon: ShoppingCart, title: "Einkauf", description: "Lieferanten, Bestellungen, Einkaufsrechnungen und Wareneingänge.", color: "#4610A3" },
  { icon: FolderKanban, title: "Projektmanagement", description: "Projekte, Aufgaben, Kalender und Zeiterfassung an einem Ort.", color: "#7c3aed" },
  { icon: FileText, title: "Dokumente", description: "Upload, Ordnerstruktur und zentrale Dokumentenverwaltung.", color: "#9f6dd8" },
  { icon: BarChart3, title: "Reporting", description: "Dashboards, Analysen und Auswertungen für datenbasierte Entscheidungen.", color: "#b88aed" },
  { icon: Settings, title: "Administration", description: "Benutzer, Rollen, Audit-Log und Multi-Company-Verwaltung.", color: "#4610A3" },
];

function ModulesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="module" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0118] via-[#0a0015] to-[#0d0118]" />
      <VernetzenBackground />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#4610A3]/10 rounded-full blur-[150px]" />
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
            className="text-[#b88aed] text-sm font-semibold tracking-wider uppercase mb-4">Module</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            Ein System.{" "}<span className="bg-gradient-to-r from-[#b88aed] to-[#4610A3] bg-clip-text text-transparent">Alles drin.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/40 text-lg mt-6">Ersetze dutzende Einzellösungen durch eine integrierte Plattform.</motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod, i) => (
            <motion.div key={mod.title} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}>
              <div className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 h-full cursor-default">
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 40px ${mod.color}10, 0 0 30px ${mod.color}08` }} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${mod.color}15` }}>
                    <mod.icon size={22} style={{ color: mod.color }} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>{mod.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{mod.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// BENTO FEATURES SECTION
// ═══════════════════════════════════════════════════════════════

const bentoItems = [
  { icon: Shield, title: "Swiss Hosting", description: "Deine Daten bleiben in der Schweiz. Gehostet auf Schweizer Servern mit höchsten Sicherheitsstandards.", size: "large", gradient: "from-[#4610A3]/20 to-[#7c3aed]/5" },
  { icon: Zap, title: "Setup in 5 Minuten", description: "Kein aufwendiges Setup. Registriere dich und starte sofort.", size: "small", gradient: "from-emerald-500/10 to-emerald-600/5" },
  { icon: Globe, title: "QR-Rechnung & MwSt", description: "Schweizer QR-Rechnungen und Mehrwertsteuer – alles integriert.", size: "small", gradient: "from-blue-500/10 to-blue-600/5" },
  { icon: Layers, title: "All-in-One Plattform", description: "CRM, Buchhaltung, HR, Produktion und mehr – keine separaten Tools, keine Integrationen nötig.", size: "large", gradient: "from-[#7c3aed]/15 to-[#b88aed]/5" },
  { icon: Lock, title: "DSGVO-konform", description: "Datenschutz nach höchsten Standards. Vollständige Konformität und revisionssichere Archivierung.", size: "small", gradient: "from-amber-500/10 to-amber-600/5" },
  { icon: Headphones, title: "Schweizer Support", description: "Persönlicher Support auf Deutsch. Wir kennen Schweizer KMU.", size: "small", gradient: "from-rose-500/10 to-rose-600/5" },
];

function BentoFeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0118] to-[#1a0536]" />
      <OptimierenBackground />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#4610A3]/10 rounded-full blur-[150px]" />
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
            className="text-[#b88aed] text-sm font-semibold tracking-wider uppercase mb-4">Warum Loomora?</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            Gemacht für die{" "}<span className="bg-gradient-to-r from-[#b88aed] to-[#4610A3] bg-clip-text text-transparent">Schweiz.</span>
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {bentoItems.map((item, i) => {
            const isLarge = item.size === "large";
            return (
              <motion.div key={item.title} initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
                className={`group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br ${item.gradient} backdrop-blur-sm overflow-hidden cursor-default transition-all duration-500 hover:border-white/[0.12] hover:scale-[1.02] ${
                  isLarge ? "md:col-span-2 md:row-span-2" : "md:col-span-2"
                }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 h-full flex flex-col justify-end p-7">
                  <div className={`rounded-xl bg-white/[0.06] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 ${isLarge ? "w-14 h-14" : "w-11 h-11"}`}>
                    <item.icon size={isLarge ? 24 : 20} className="text-[#b88aed]" />
                  </div>
                  <h3 className={`text-white font-semibold mb-2 ${isLarge ? "text-xl" : "text-base"}`} style={{ fontFamily: "'Sora', sans-serif" }}>{item.title}</h3>
                  <p className={`text-white/40 leading-relaxed ${isLarge ? "text-sm max-w-md" : "text-sm"}`}>{item.description}</p>
                </div>
                {isLarge && <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#4610A3]/10 to-transparent rounded-bl-[100px]" />}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRICING SECTION
// ═══════════════════════════════════════════════════════════════

const plans = [
  { name: "Starter", description: "Für Einzelunternehmer und Kleinstfirmen", monthlyPrice: 49, yearlyPrice: 39,
    features: ["1 Benutzer", "CRM & Kontakte", "Angebote & Rechnungen", "QR-Rechnung", "Basis-Buchhaltung", "5 GB Speicher", "E-Mail-Support"], highlighted: false },
  { name: "Professional", description: "Für wachsende KMU", monthlyPrice: 99, yearlyPrice: 79,
    features: ["Bis 10 Benutzer", "Alle Starter-Features", "HR & Lohnabrechnung", "Lager & Produktion", "Swissdec-Integration", "MwSt-Abrechnungen", "50 GB Speicher", "Prioritäts-Support"], highlighted: true },
  { name: "Enterprise", description: "Für grössere Unternehmen", monthlyPrice: null, yearlyPrice: null,
    features: ["Unbegrenzte Benutzer", "Alle Professional-Features", "Multi-Company", "API-Zugang", "Dedizierte Infrastruktur", "Unbegrenzter Speicher", "Persönlicher Ansprechpartner", "SLA & Onboarding"], highlighted: false },
];

function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [yearly, setYearly] = useState(true);
  const navigate = useNavigate();

  return (
    <section id="preise" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0536] via-[#0d0118] to-[#0a0015]" />
      <WachsenBackground />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4610A3]/8 rounded-full blur-[200px]" />
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
            className="text-[#b88aed] text-sm font-semibold tracking-wider uppercase mb-4">Preise</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            Transparent &{" "}<span className="bg-gradient-to-r from-[#b88aed] to-[#4610A3] bg-clip-text text-transparent">fair.</span>
          </motion.h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm font-medium ${!yearly ? "text-white" : "text-white/40"}`}>Monatlich</span>
          <button onClick={() => setYearly(!yearly)} className={`relative w-14 h-7 rounded-full transition-colors ${yearly ? "bg-[#4610A3]" : "bg-white/20"}`}>
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${yearly ? "translate-x-8" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm font-medium ${yearly ? "text-white" : "text-white/40"}`}>
            Jährlich<span className="ml-2 text-xs text-emerald-400 font-semibold">-20%</span>
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className={`relative rounded-2xl p-8 ${plan.highlighted ? "bg-gradient-to-b from-[#4610A3]/20 to-[#7c3aed]/10 border-2 border-[#4610A3]/50 scale-105" : "bg-white/[0.03] border border-white/[0.06]"}`}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4610A3] to-[#7c3aed] text-white text-xs font-bold px-4 py-1 rounded-full">Beliebteste Wahl</div>
              )}
              <h3 className="text-white font-bold text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>{plan.name}</h3>
              <p className="text-white/40 text-sm mt-1">{plan.description}</p>
              <div className="mt-6 mb-8">
                {plan.monthlyPrice ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-5xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>CHF {yearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                    <span className="text-white/40 text-sm">/Monat</span>
                  </div>
                ) : (
                  <div className="text-white text-3xl font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>Auf Anfrage</div>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-white/60 text-sm"><Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />{f}</li>
                ))}
              </ul>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/register")}
                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  plan.highlighted ? "bg-gradient-to-r from-[#4610A3] to-[#7c3aed] text-white hover:shadow-[0_0_30px_rgba(70,16,163,0.4)]" : "border border-white/10 text-white/80 hover:bg-white/5"
                }`}>
                {plan.monthlyPrice ? "Kostenlos testen" : "Kontakt aufnehmen"}<ArrowRight size={16} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FAQ SECTION
// ═══════════════════════════════════════════════════════════════

const faqs = [
  { q: "Für welche Unternehmen ist Loomora geeignet?", a: "Loomora ist speziell für Schweizer KMU mit 1–100 Mitarbeitern entwickelt. Egal ob Handwerk, Dienstleistung, Handel oder Produktion – unsere Module lassen sich flexibel an Ihre Branche anpassen." },
  { q: "Kann ich Loomora kostenlos testen?", a: "Ja! Sie können Loomora 30 Tage lang unverbindlich und kostenlos testen. Keine Kreditkarte erforderlich. Danach wählen Sie einfach den Plan, der zu Ihrem Unternehmen passt." },
  { q: "Wo werden meine Daten gespeichert?", a: "Alle Daten werden ausschliesslich auf Schweizer Servern gehostet. Wir erfüllen alle Anforderungen der DSGVO und des Schweizer Datenschutzgesetzes (nDSG)." },
  { q: "Unterstützt Loomora Schweizer QR-Rechnungen?", a: "Ja, Loomora generiert automatisch Swiss QR-Rechnungen mit QR-Code (inkl. QR-IBAN und Referenznummern). Zahlungseingänge können über camt.054 automatisch abgeglichen werden." },
  { q: "Kann ich von meiner bestehenden Software wechseln?", a: "Absolut. Unser Onboarding-Team unterstützt Sie beim Import Ihrer bestehenden Daten (Kunden, Artikel, Buchhaltung). Die Migration ist in den meisten Fällen innerhalb weniger Tage abgeschlossen." },
  { q: "Gibt es eine API für eigene Integrationen?", a: "Ja, im Enterprise-Plan bieten wir eine vollständige REST-API für individuelle Integrationen und Automatisierungen. Dokumentation und Sandbox-Umgebung inklusive." },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.06 }}
      className="border-b border-white/[0.06] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-6 text-left group">
        <span className="text-white/80 font-medium text-base group-hover:text-white transition-colors pr-4">{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={18} className="text-white/30" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
            <p className="text-white/40 text-sm leading-relaxed pb-6 pr-12">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0015] to-[#0a0015]" />
      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
            className="text-[#b88aed] text-sm font-semibold tracking-wider uppercase mb-4">FAQ</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            Häufige{" "}<span className="bg-gradient-to-r from-[#b88aed] to-[#4610A3] bg-clip-text text-transparent">Fragen.</span>
          </motion.h2>
        </div>
        {isInView && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-8">
            {faqs.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════════════════════════

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0015]" />
      <VernetzenBackground />
      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7 }} className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4610A3] via-[#2d0a5e] to-[#7c3aed]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M0%2060L60%200%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.05)%22%20fill%3D%22none%22/%3E%3C/svg%3E')] opacity-50" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#b88aed]/20 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6" style={{ fontFamily: "'Sora', sans-serif" }}>
              Bereit für die Zukunft deines KMU?
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
              Starte jetzt kostenlos und entdecke, wie Loomora dein Unternehmen auf das nächste Level bringt.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/register")}
                className="group bg-white text-[#4610A3] font-bold px-8 py-4 rounded-2xl text-base flex items-center gap-3 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow">
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

// ═══════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════

const navLinks = [
  { label: "Module", href: "#module" },
  { label: "Features", href: "#features" },
  { label: "Preise", href: "#preise" },
  { label: "Kontakt", href: "#kontakt" },
];

function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0d0118]/80 backdrop-blur-xl border-b border-white/10 shadow-lg" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo("#hero")}>
            <img src={loomoraLogo} alt="Loomora" className="h-8 brightness-0 invert" />
          </motion.div>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button key={link.href} onClick={() => scrollTo(link.href)}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#b88aed] group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate("/login")} className="text-white/70 hover:text-white text-sm font-medium transition-colors">Login</button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-[#4610A3] to-[#7c3aed] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:shadow-[0_0_30px_rgba(70,16,163,0.5)] transition-shadow">
              Kostenlos testen
            </motion.button>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white/80">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0d0118]/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <button key={link.href} onClick={() => scrollTo(link.href)}
                  className="block text-white/80 hover:text-white text-base font-medium transition-colors w-full text-left">{link.label}</button>
              ))}
              <div className="pt-4 space-y-3 border-t border-white/10">
                <button onClick={() => navigate("/login")} className="block text-white/70 hover:text-white text-sm w-full text-left">Login</button>
                <button onClick={() => navigate("/register")}
                  className="w-full bg-gradient-to-r from-[#4610A3] to-[#7c3aed] text-white text-sm font-semibold px-6 py-3 rounded-xl">Kostenlos testen</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════

const footerLinks = {
  Produkt: ["Module", "Features", "Preise", "Roadmap"],
  Unternehmen: ["Über uns", "Karriere", "Blog", "Kontakt"],
  Rechtliches: ["Datenschutz", "AGB", "Impressum"],
  Support: ["Hilfe-Center", "Dokumentation", "Status", "API"],
};

function MarketingFooter() {
  return (
    <footer id="kontakt" className="relative border-t border-white/[0.06] bg-[#0a0015]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <img src={loomoraLogo} alt="Loomora" className="h-8 brightness-0 invert mb-4" />
            <p className="text-white/30 text-sm leading-relaxed">All-in-One Business Software für Schweizer KMU.</p>
          </div>
          {Object.entries(footerLinks).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-white/60 font-semibold text-sm mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}><a href="#" className="text-white/30 hover:text-white/60 text-sm transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-sm">© 2026 loomora.ch – Alle Rechte vorbehalten</p>
          <p className="text-white/20 text-xs flex items-center gap-1.5">🇨🇭 Entwickelt & gehostet in der Schweiz</p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE EXPORT
// ═══════════════════════════════════════════════════════════════

export default function WebsiteLoomora() {
  return (
    <div className="min-h-screen bg-[#0a0015]">
      <MarketingNavbar />
      <HeroSection />
      <SocialProofSection />
      <StatsSection />
      <ModulesSection />
      <BentoFeaturesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <MarketingFooter />
    </div>
  );
}
