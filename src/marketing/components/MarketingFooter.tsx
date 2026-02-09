import loomoraLogo from "@/assets/loomora-logo.png";

const links = {
  Produkt: ["Module", "Features", "Preise", "Roadmap"],
  Unternehmen: ["Über uns", "Karriere", "Blog", "Kontakt"],
  Rechtliches: ["Datenschutz", "AGB", "Impressum"],
  Support: ["Hilfe-Center", "Dokumentation", "Status", "API"],
};

export function MarketingFooter() {
  return (
    <footer id="kontakt" className="relative border-t border-white/[0.06] bg-[#0a0015]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <img src={loomoraLogo} alt="Loomora" className="h-8 brightness-0 invert mb-4" />
            <p className="text-white/30 text-sm leading-relaxed">
              All-in-One Business Software für Schweizer KMU.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4
                className="text-white/60 font-semibold text-sm mb-4"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-white/30 hover:text-white/60 text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-sm">
            © 2026 loomora.ch – Alle Rechte vorbehalten
          </p>
          <p className="text-white/20 text-xs flex items-center gap-1.5">
            🇨🇭 Entwickelt & gehostet in der Schweiz
          </p>
        </div>
      </div>
    </footer>
  );
}
