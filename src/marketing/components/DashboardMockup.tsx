import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, Wallet, UserCog, Package,
  ChevronRight, TrendingUp, TrendingDown, Clock, Bell, Search, Plus,
  Mail, Phone, MapPin, MoreHorizontal, Star, Calendar, Download,
  CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Filter,
  UserPlus, Receipt, CreditCard, Briefcase, Award, BarChart3
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

// ─── Dashboard View ───
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

function DashboardView() {
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
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
      <div className="grid grid-cols-3 gap-3 flex-1">
        <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-gray-800 font-semibold text-[12px]">Monatsumsatz 2026</div>
              <div className="text-gray-400 text-[9px] mt-0.5">Umsatzentwicklung in CHF</div>
            </div>
            <div className="flex gap-3 text-[8px]">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#4610A3]" /><span className="text-gray-500">Umsatz</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#b88aed]/40" /><span className="text-gray-500">Vorjahr</span></div>
            </div>
          </div>
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
            {months.map((m) => (<div key={m} className="flex-1 text-center text-[7px] text-gray-400">{m}</div>))}
          </div>
        </div>
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
                  <div className="text-gray-400 text-[8px] flex items-center gap-1 mt-0.5"><Clock size={7} />{a.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <button className="text-[#4610A3] text-[9px] font-medium">Alle anzeigen →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Kunden View ───
const customers = [
  { name: "Müller AG", contact: "Hans Müller", email: "h.mueller@mueller-ag.ch", phone: "+41 44 123 45 67", city: "Zürich", status: "Aktiv", revenue: "CHF 48'200", rating: 5 },
  { name: "Weber GmbH", contact: "Sandra Weber", email: "s.weber@weber-gmbh.ch", phone: "+41 31 234 56 78", city: "Bern", status: "Aktiv", revenue: "CHF 32'100", rating: 4 },
  { name: "Schmid & Co", contact: "Peter Schmid", email: "p.schmid@schmid-co.ch", phone: "+41 61 345 67 89", city: "Basel", status: "Aktiv", revenue: "CHF 27'500", rating: 5 },
  { name: "Fischer Technik", contact: "Anna Fischer", email: "a.fischer@fischer-tech.ch", phone: "+41 71 456 78 90", city: "St. Gallen", status: "Inaktiv", revenue: "CHF 15'800", rating: 3 },
  { name: "Keller Bau AG", contact: "Thomas Keller", email: "t.keller@keller-bau.ch", phone: "+41 52 567 89 01", city: "Winterthur", status: "Aktiv", revenue: "CHF 62'400", rating: 4 },
];

function KundenView() {
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-800 font-semibold text-[13px]">Kunden</div>
          <div className="text-gray-400 text-[9px]">5 Kunden · 4 aktiv</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 text-gray-400 text-[9px]">
            <Filter size={9} /><span>Filter</span>
          </div>
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
              <th className="text-left px-3 py-2 font-medium">Umsatz</th>
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
                      <div className="text-gray-400 text-[8px]">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-600 text-[9px]">{c.contact}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1 text-gray-500 text-[9px]">
                    <MapPin size={8} />{c.city}
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-800 text-[9px] font-medium">{c.revenue}</td>
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
];

function RechnungenView() {
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Offen", value: "CHF 17'600", count: "2 Rechnungen", icon: FileText, color: "#e67e22" },
          { label: "Bezahlt (Feb)", value: "CHF 13'550", count: "2 Rechnungen", icon: CheckCircle2, color: "#27ae60" },
          { label: "Überfällig", value: "CHF 3'250", count: "1 Rechnung", icon: AlertCircle, color: "#e74c3c" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-[9px] font-medium uppercase tracking-wider">{s.label}</span>
              <s.icon size={10} style={{ color: s.color }} />
            </div>
            <div className="text-gray-900 font-bold text-[14px]">{s.value}</div>
            <div className="text-gray-400 text-[8px] mt-0.5">{s.count}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-[8px] text-gray-400 uppercase tracking-wider">
              <th className="text-left px-3 py-2 font-medium">Nr.</th>
              <th className="text-left px-3 py-2 font-medium">Kunde</th>
              <th className="text-left px-3 py-2 font-medium">Betrag</th>
              <th className="text-left px-3 py-2 font-medium">Datum</th>
              <th className="text-left px-3 py-2 font-medium">Fällig</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.nr} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-3 py-2 text-[#4610A3] text-[9px] font-medium">{inv.nr}</td>
                <td className="px-3 py-2 text-gray-800 text-[9px]">{inv.kunde}</td>
                <td className="px-3 py-2 text-gray-800 text-[9px] font-medium">{inv.betrag}</td>
                <td className="px-3 py-2 text-gray-500 text-[9px]">{inv.datum}</td>
                <td className="px-3 py-2 text-gray-500 text-[9px]">{inv.faellig}</td>
                <td className="px-3 py-2">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                    inv.status === "Bezahlt" ? "bg-emerald-50 text-emerald-600" :
                    inv.status === "Überfällig" ? "bg-red-50 text-red-600" :
                    "bg-blue-50 text-blue-600"
                  }`}>{inv.status}</span>
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
    { label: "Bankguthaben", value: "CHF 342'180", change: "+5.2%", up: true },
    { label: "Debitoren", value: "CHF 67'400", change: "+2 neue", up: true },
    { label: "Kreditoren", value: "CHF 28'900", change: "3 offen", up: false },
    { label: "Liquidität", value: "CHF 313'280", change: "Netto", up: true },
  ];
  const transactions = [
    { text: "Zahlung Müller AG", betrag: "+CHF 12'400", type: "in" },
    { text: "Lieferant Stahl24", betrag: "-CHF 8'200", type: "out" },
    { text: "Zahlung Schmid & Co", betrag: "+CHF 4'800", type: "in" },
    { text: "Sozialversicherungen Feb", betrag: "-CHF 14'500", type: "out" },
    { text: "Miete Werkstatt", betrag: "-CHF 3'800", type: "out" },
  ];
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="grid grid-cols-4 gap-3">
        {balances.map((b) => (
          <div key={b.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <span className="text-gray-400 text-[9px] font-medium uppercase tracking-wider">{b.label}</span>
            <div className="text-gray-900 font-bold text-[14px] mt-1">{b.value}</div>
            <div className={`flex items-center gap-0.5 text-[8px] mt-1 font-medium ${b.up ? "text-emerald-600" : "text-amber-600"}`}>
              {b.up ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}{b.change}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-gray-800 font-semibold text-[12px] mb-3">Letzte Buchungen</div>
          <div className="space-y-2">
            {transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] ${t.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                    {t.type === "in" ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                  </div>
                  <span className="text-gray-700 text-[9px]">{t.text}</span>
                </div>
                <span className={`text-[9px] font-medium ${t.type === "in" ? "text-emerald-600" : "text-red-500"}`}>{t.betrag}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-gray-800 font-semibold text-[12px] mb-3">Cashflow Übersicht</div>
          <div className="flex items-end gap-1 h-[90px]">
            {[45, 62, 38, 55, 72, 48, 65, 82, 58, 75, 42, 88].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-full rounded-t-sm ${h > 50 ? "bg-emerald-400/60" : "bg-red-400/40"}`} style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {months.map((m) => (<div key={m} className="flex-1 text-center text-[6px] text-gray-400">{m}</div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HR View ───
const employees = [
  { name: "Marco Lehmann", role: "Geschäftsführer", dept: "Management", status: "Aktiv", since: "01.03.2018" },
  { name: "Lisa Brunner", role: "Buchhalterin", dept: "Finanzen", status: "Aktiv", since: "15.06.2020" },
  { name: "Thomas Steiner", role: "Werkstattleiter", dept: "Produktion", status: "Aktiv", since: "01.09.2019" },
  { name: "Sarah Meier", role: "HR Managerin", dept: "Personal", status: "Aktiv", since: "01.02.2021" },
  { name: "David Huber", role: "Servicetechniker", dept: "Service", status: "Abwesend", since: "15.04.2022" },
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
              <span className="text-gray-400 text-[9px] font-medium uppercase tracking-wider">{s.label}</span>
              <s.icon size={10} style={{ color: s.color }} />
            </div>
            <div className="text-gray-900 font-bold text-[15px]">{s.value}</div>
            <div className="text-gray-400 text-[8px] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
              <th className="text-left px-3 py-1.5 font-medium">Seit</th>
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
                <td className="px-3 py-1.5 text-gray-500 text-[9px]">{e.since}</td>
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
    </div>
  );
}

// ─── Lager View ───
const products = [
  { name: "Stahlprofil HEA 200", sku: "SP-200", bestand: 145, min: 50, einheit: "Stk", status: "OK" },
  { name: "Schweissgas Argon 4.6", sku: "SG-046", bestand: 12, min: 10, einheit: "Fl", status: "Tief" },
  { name: "Schrauben M12x40", sku: "SC-1240", bestand: 2400, min: 500, einheit: "Stk", status: "OK" },
  { name: "Grundierung RAL 7035", sku: "GR-7035", bestand: 8, min: 15, einheit: "Ltr", status: "Kritisch" },
  { name: "Flachstahl 50x5mm", sku: "FS-505", bestand: 89, min: 30, einheit: "m", status: "OK" },
];

function LagerView() {
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Artikel", value: "248", sub: "5 Kategorien", icon: Package, color: "#4610A3" },
          { label: "Tiefer Bestand", value: "3", sub: "Nachbestellen", icon: AlertCircle, color: "#e67e22" },
          { label: "Lagerwert", value: "CHF 186'400", sub: "+2.1% vs. Jan", icon: BarChart3, color: "#27ae60" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-[9px] font-medium uppercase tracking-wider">{s.label}</span>
              <s.icon size={10} style={{ color: s.color }} />
            </div>
            <div className="text-gray-900 font-bold text-[14px]">{s.value}</div>
            <div className="text-gray-400 text-[8px] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
          <span className="text-gray-800 font-semibold text-[11px]">Lagerbestand</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 text-gray-400 text-[8px]">
              <Download size={8} />Export
            </div>
            <button className="flex items-center gap-1 bg-[#4610A3] text-white px-2 py-1 rounded-lg text-[8px] font-medium">
              <Plus size={8} />Wareneingang
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-[8px] text-gray-400 uppercase tracking-wider">
              <th className="text-left px-3 py-1.5 font-medium">Artikel</th>
              <th className="text-left px-3 py-1.5 font-medium">SKU</th>
              <th className="text-right px-3 py-1.5 font-medium">Bestand</th>
              <th className="text-right px-3 py-1.5 font-medium">Min.</th>
              <th className="text-left px-3 py-1.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-3 py-1.5 text-gray-800 text-[9px] font-medium">{p.name}</td>
                <td className="px-3 py-1.5 text-gray-400 text-[9px] font-mono">{p.sku}</td>
                <td className="px-3 py-1.5 text-right text-gray-800 text-[9px]">{p.bestand} {p.einheit}</td>
                <td className="px-3 py-1.5 text-right text-gray-400 text-[9px]">{p.min}</td>
                <td className="px-3 py-1.5">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                    p.status === "OK" ? "bg-emerald-50 text-emerald-600" :
                    p.status === "Tief" ? "bg-amber-50 text-amber-600" :
                    "bg-red-50 text-red-600"
                  }`}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Module Title Map ───
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

export function DashboardMockup() {
  const [activeModule, setActiveModule] = useState<ModuleKey>("dashboard");
  const ActiveView = moduleViews[activeModule];

  return (
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
              app.loomora.ch/{activeModule === "dashboard" ? "dashboard" : activeModule}
            </div>
          </div>
        </div>

        {/* App content */}
        <div className="bg-[#f4f5f7] flex text-[11px]" style={{ fontFamily: "'Inter', sans-serif", aspectRatio: "16/9" }}>
          {/* Sidebar */}
          <div className="w-[200px] bg-white border-r border-gray-100 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <img src={loomoraLogo} alt="Loomora" className="h-5" />
            </div>
            <div className="p-2 space-y-0.5 flex-1">
              {sidebarItems.map((item) => (
                <div
                  key={item.key}
                  onClick={() => setActiveModule(item.key)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 select-none ${
                    activeModule === item.key
                      ? "bg-[#4610A3]/10 text-[#4610A3] font-medium"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4610A3] to-[#7c3aed] flex items-center justify-center text-white text-[9px] font-bold">ML</div>
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
                <span className="text-gray-800 font-semibold text-[13px]">{moduleTitles[activeModule]}</span>
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
                  <Plus size={10} />Neu
                </button>
              </div>
            </div>

            {/* Module content with animation */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 flex flex-col overflow-hidden"
                >
                  <ActiveView />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      {/* Reflection */}
      <div className="h-40 bg-gradient-to-b from-white/[0.02] to-transparent rounded-b-2xl" />
    </motion.div>
  );
}
