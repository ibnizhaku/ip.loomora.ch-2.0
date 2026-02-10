import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, Wallet, UserCog, Package,
  ChevronRight, TrendingUp, TrendingDown, Clock, Bell, Search, Plus,
  MapPin, MoreHorizontal, Calendar, Download,
  CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Filter,
  UserPlus, Receipt, Briefcase, Award, BarChart3,
  PieChart, Activity, Target, ShieldCheck, Truck, Settings,
  CircleDot, Layers, FileBarChart
} from "lucide-react";
import loomoraLogo from "@/assets/loomora-logo.png";

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

// ─── Mini Sparkline Component ───
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

// ─── Mini Donut Chart ───
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
      {/* KPI Row */}
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

      {/* Main content row */}
      <div className="grid grid-cols-12 gap-3 flex-1">
        {/* Chart - 5 cols */}
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

        {/* Donut + Stats - 3 cols */}
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

        {/* Activities - 4 cols */}
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

      {/* Bottom row */}
      <div className="grid grid-cols-12 gap-3">
        {/* Upcoming Tasks */}
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

        {/* Quick Stats Grid */}
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
      {/* Stats row */}
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

export function DashboardMockup() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const ActiveView = moduleViews[activeModule];

  // Auto-cycle through modules
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
    // Resume auto-cycling after 12s of inactivity
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
      {/* Glow behind mockup */}
      <div className="absolute -inset-10 bg-gradient-to-b from-[#4610A3]/30 via-[#7c3aed]/20 to-transparent rounded-[40px] blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-[#4610A3]/15 rounded-full blur-[120px] pointer-events-none" />

      <div
        className="relative rounded-2xl overflow-hidden border border-white/[0.15] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_80px_-20px_rgba(70,16,163,0.5),0_0_120px_rgba(70,16,163,0.15)]"
        style={{
          transform: "rotateX(2deg)",
          transformOrigin: "center bottom",
        }}
      >
        {/* Glossy top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-10 pointer-events-none" />

        {/* Browser chrome */}
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

        {/* App content */}
        <div className="bg-[#f4f5f7] flex text-[12px]" style={{ fontFamily: "'Inter', sans-serif", aspectRatio: "16/9" }}>
          {/* Sidebar */}
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
            {/* Sidebar footer with more nav items */}
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

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top bar */}
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

            {/* Module content with animation */}
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

      {/* Auto-cycle indicator */}
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

      {/* Reflection / fade out */}
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
