import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

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
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setDisplay(hasDecimal ? current.toFixed(1) : Math.round(current).toString());
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [isInView, target, hasDecimal]);

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

const stats = [
  { value: 200, suffix: "+", label: "Schweizer KMU" },
  { value: 99.9, suffix: "%", label: "Uptime-Garantie" },
  { value: 15, suffix: " Min", label: "Ø Setup-Zeit" },
  { value: 50, suffix: "%", label: "Weniger Admin-Aufwand" },
];

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="absolute inset-0 bg-[#0d0118]" />
      {/* Subtle divider glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#4610A3]/40 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#4610A3]/40 to-transparent" />

      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {isInView && (
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                  />
                )}
              </div>
              <div className="text-white/30 text-sm font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
