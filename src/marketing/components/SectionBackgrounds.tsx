import { motion } from "framer-motion";

// ─── VERNETZEN: Connecting nodes with lines ───
export function VernetzenBackground() {
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
        {/* Data particles flowing along connections */}
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

// ─── OPTIMIEREN: Central hub with orbiting elements ───
export function OptimierenBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.2 }}>
      <svg viewBox="0 0 600 400" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="oGlow"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {/* Central hub */}
        <motion.circle cx="300" cy="200" r="16" fill="#4610A3" fillOpacity="0.2" filter="url(#oGlow)"
          initial={{ scale: 0 }} animate={{ scale: 1, r: [16, 20, 16] }}
          transition={{ scale: { duration: 0.3 }, r: { duration: 2.5, repeat: Infinity } }} />
        <circle cx="300" cy="200" r="6" fill="#4610A3" fillOpacity="0.4" />
        <circle cx="300" cy="200" r="2.5" fill="#b88aed" />
        
        {/* Rotating dashed ring */}
        <motion.circle cx="300" cy="200" r="40" stroke="#7c3aed" strokeWidth="0.6" fill="none" strokeDasharray="4 4" strokeOpacity="0.3"
          animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "300px 200px" }} />
        <motion.circle cx="300" cy="200" r="70" stroke="#4610A3" strokeWidth="0.4" fill="none" strokeDasharray="2 6" strokeOpacity="0.2"
          animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "300px 200px" }} />

        {/* Radial spokes */}
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

        {/* Satellite nodes */}
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

        {/* Orbiting particle */}
        <circle r="2" fill="#b88aed" filter="url(#oGlow)">
          <animateTransform attributeName="transform" type="rotate" from="0 300 200" to="360 300 200" dur="4s" repeatCount="indefinite" />
          <animateMotion dur="4s" repeatCount="indefinite" path="M340 200 A40 40 0 1 1 339.99 200" />
        </circle>

        {/* Efficiency arrows / circuit squares */}
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

// ─── WACHSEN: Expanding circles and growing branches ───
export function WachsenBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.2 }}>
      <svg viewBox="0 0 600 400" fill="none" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="wGlow"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        
        {/* Growing tree structure from bottom center */}
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

        {/* Growth nodes with expanding rings */}
        {[
          { cx: 300, cy: 260 }, { cx: 220, cy: 180 }, { cx: 380, cy: 180 },
          { cx: 160, cy: 120 }, { cx: 250, cy: 110 }, { cx: 350, cy: 110 }, { cx: 440, cy: 120 },
        ].map((n, i) => (
          <motion.g key={`wn-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.4 + i * 0.06 }}>
            <motion.circle cx={n.cx} cy={n.cy} r="4" fill="#4610A3" filter="url(#wGlow)"
              animate={{ r: [4, 6, 4] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} />
            <circle cx={n.cx} cy={n.cy} r="1.5" fill="#b88aed" />
            {/* Growth rings expanding outward */}
            <motion.circle cx={n.cx} cy={n.cy} r="8" stroke="#4610A3" strokeWidth="0.5" fill="none"
              animate={{ r: [8, 20, 8], strokeOpacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }} />
          </motion.g>
        ))}

        {/* Rising particles */}
        {[100, 200, 400, 500].map((x, i) => (
          <motion.circle key={`wp-${i}`} cx={x} r="1.5" fill="#b88aed" fillOpacity="0.4"
            animate={{ cy: [380, 40], fillOpacity: [0.4, 0] }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }} />
        ))}
      </svg>
    </div>
  );
}

// ─── Mixed subtle: dots flowing along a path ───
export function FlowDotsBackground() {
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
