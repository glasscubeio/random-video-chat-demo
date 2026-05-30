import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLang } from "../lib/LanguageContext";
import type { Strings } from "../lib/i18n";

/* ─── palette ─────────────────────────────────────────────── */
const C = {
  violet: "#8b5cf6",
  indigo: "#6366f1",
  pink:   "#ec4899",
  amber:  "#f59e0b",
  green:  "#22c55e",
} as const;

/* ─── types ────────────────────────────────────────────────── */
type NodeState = "offline" | "connecting" | "waiting" | "online" | "matched" | "streaming" | "relay" | "dim";

interface Pkt {
  /** line the packet travels on */
  line: "AS" | "SB";
  dir: "→" | "←";
  label: string;
  color: string;
  delay: number;
}

interface Phase {
  color:   string;
  nodeA:   NodeState;
  nodeS:   NodeState;
  nodeB:   NodeState;
  packets: Pkt[];
  p2p:     boolean;
}

const PHASE_TITLE_KEYS: (keyof Strings)[] = ["p0title","p1title","p2title","p3title","p4title"];
const PHASE_DETAIL_KEYS: (keyof Strings)[] = ["p0detail","p1detail","p2detail","p3detail","p4detail"];

/* ─── phases ───────────────────────────────────────────────── */
const PHASES: Phase[] = [
  {
    color:  C.violet,
    nodeA: "connecting", nodeS: "online",  nodeB: "offline",
    packets: [
      { line:"AS", dir:"→", label:"nick", color:C.violet, delay:0 },
      { line:"AS", dir:"→", label:"auth", color:"#a78bfa", delay:700 },
      { line:"AS", dir:"→", label:"nick", color:C.violet, delay:1400 },
    ],
    p2p: false,
  },
  {
    color:  C.indigo,
    nodeA: "waiting", nodeS: "relay", nodeB: "connecting",
    packets: [
      { line:"SB", dir:"←", label:"nick",  color:C.indigo, delay:0 },
      { line:"SB", dir:"←", label:"auth",  color:"#818cf8", delay:600 },
      { line:"AS", dir:"→", label:"wait",  color:"#374151", delay:300 },
      { line:"SB", dir:"←", label:"wait",  color:"#374151", delay:1000 },
    ],
    p2p: false,
  },
  {
    color:  C.pink,
    nodeA: "matched", nodeS: "relay", nodeB: "matched",
    packets: [
      { line:"AS", dir:"←", label:"match", color:C.pink,    delay:0 },
      { line:"SB", dir:"→", label:"match", color:C.pink,    delay:100 },
      { line:"AS", dir:"←", label:"match", color:"#f9a8d4", delay:900 },
      { line:"SB", dir:"→", label:"match", color:"#f9a8d4", delay:1000 },
    ],
    p2p: false,
  },
  {
    color:  C.amber,
    nodeA: "online", nodeS: "online", nodeB: "online",
    packets: [
      { line:"AS", dir:"→", label:"offer",   color:C.amber,    delay:0 },
      { line:"SB", dir:"→", label:"offer",   color:C.amber,    delay:350 },
      { line:"SB", dir:"←", label:"answer",  color:"#fb923c",  delay:1000 },
      { line:"AS", dir:"←", label:"answer",  color:"#fb923c",  delay:1350 },
      { line:"AS", dir:"→", label:"ICE",     color:"#fbbf24",  delay:2100 },
      { line:"SB", dir:"→", label:"ICE",     color:"#fbbf24",  delay:2400 },
      { line:"SB", dir:"←", label:"ICE",     color:"#fbbf24",  delay:2800 },
      { line:"AS", dir:"←", label:"ICE",     color:"#fbbf24",  delay:3100 },
    ],
    p2p: false,
  },
  {
    color:  C.green,
    nodeA: "streaming", nodeS: "dim", nodeB: "streaming",
    packets: [],
    p2p: true,
  },
];

const PHASE_MS = [2800, 3000, 2600, 4800, 4200];

/* ─── coordinate map ───────────────────────────────────────── */
// SVG viewBox: 0 0 440 170
// Nodes:  A cx=75 cy=80  |  S cx=220 cy=80  |  B cx=365 cy=80
// Line A-S: x1=112 → x2=183  (71px)
// Line S-B: x1=257 → x2=328  (71px)
// P2P arc:  M75,116 C75,162 365,162 365,116

const LINE: Record<"AS" | "SB", { x1: number; x2: number; y: number }> = {
  AS: { x1: 112, x2: 183, y: 80 },
  SB: { x1: 257, x2: 328, y: 80 },
};

/* ─── sub-components ────────────────────────────────────────── */

function NodeCircle({
  cx, cy, state, label, sublabel, icon, phaseColor,
}: {
  cx: number; cy: number; state: NodeState;
  label: string; sublabel: string; icon: string; phaseColor: string;
}) {
  const isActive  = state !== "offline" && state !== "dim";
  const isOffline = state === "offline";
  const isDim     = state === "dim";
  const isMatch   = state === "matched";
  const isStream  = state === "streaming";

  const borderColor = isOffline ? "rgba(255,255,255,0.09)"
    : isDim     ? "rgba(255,255,255,0.07)"
    : phaseColor;

  return (
    <motion.g
      animate={{ opacity: isDim ? 0.22 : 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* outer pulse ring */}
      {isActive && !isDim && (
        <motion.circle
          cx={cx} cy={cy}
          fill="none"
          stroke={phaseColor}
          strokeWidth={1}
          animate={{
            r:       [38, 46, 38],
            opacity: [0.55, 0.12, 0.55],
          }}
          transition={{ repeat: Infinity, duration: isMatch ? 0.7 : isStream ? 1.2 : 2.2, ease: "easeInOut" }}
        />
      )}

      {/* second ring for streaming */}
      {isStream && (
        <motion.circle
          cx={cx} cy={cy}
          fill="none"
          stroke={phaseColor}
          strokeWidth={1}
          animate={{
            r:       [44, 54, 44],
            opacity: [0.25, 0.05, 0.25],
          }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", delay: 0.6 }}
        />
      )}

      {/* main circle */}
      <motion.circle
        cx={cx} cy={cy} r={34}
        fill="#0b0b18"
        stroke={borderColor}
        strokeWidth={1.5}
        animate={isMatch ? { fill: ["#0b0b18", "#1a0622", "#0b0b18"] } : undefined}
        transition={isMatch ? { repeat: 2, duration: 0.35 } : undefined}
      />

      {/* icon */}
      <text
        x={cx} y={cy + 2}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 20, userSelect: "none" }}
      >
        {icon}
      </text>

      {/* label */}
      <text
        x={cx} y={cy + 47}
        textAnchor="middle"
        fill={isOffline ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.88)"}
        style={{ fontSize: 11, fontWeight: 700, fontFamily: "system-ui,sans-serif" }}
      >
        {label}
      </text>
      <text
        x={cx} y={cy + 60}
        textAnchor="middle"
        fill="rgba(255,255,255,0.28)"
        style={{ fontSize: 9, fontFamily: "system-ui,sans-serif" }}
      >
        {sublabel}
      </text>
    </motion.g>
  );
}

function ConnLine({ lineKey, active, color }: { lineKey: "AS" | "SB"; active: boolean; color: string }) {
  const { x1, x2, y } = LINE[lineKey];
  return (
    <>
      {/* static base track */}
      <line
        x1={x1} y1={y} x2={x2} y2={y}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={2}
        strokeDasharray="4 5"
      />
      {/* glowing active overlay */}
      {active && (
        <motion.line
          x1={x1} y1={y} x2={x2} y2={y}
          stroke={color}
          strokeWidth={2}
          opacity={0.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </>
  );
}

function Packet({ pkt, phaseKey }: { pkt: Pkt; phaseKey: number }) {
  const { x1, x2, y } = LINE[pkt.line];
  const isRight = pkt.dir === "→";
  const startX  = isRight ? x1 : x2;
  const endX    = isRight ? x2 : x1;
  const dur     = 0.72;
  const rpt     = 1.8;

  return (
    <motion.g
      key={`${phaseKey}-${pkt.line}-${pkt.dir}-${pkt.delay}`}
      initial={{ x: startX, y, opacity: 0 }}
      animate={{ x: [startX, endX], opacity: [0, 1, 1, 0] }}
      transition={{
        x:       { duration: dur, ease: "easeInOut", delay: pkt.delay / 1000, repeat: Infinity, repeatDelay: rpt },
        opacity: { duration: dur, delay: pkt.delay / 1000, repeat: Infinity, repeatDelay: rpt },
      }}
    >
      {/* dot */}
      <circle r={4.5} cx={0} cy={0} fill={pkt.color} style={{ filter: `drop-shadow(0 0 5px ${pkt.color})` }} />
      {/* label above */}
      <text
        x={0} y={-9}
        textAnchor="middle"
        fill={pkt.color}
        style={{ fontSize: 8, fontWeight: 700, fontFamily: "system-ui,sans-serif" }}
      >
        {pkt.label}
      </text>
    </motion.g>
  );
}

function P2PArc({ color }: { color: string }) {
  // Bezier from node A bottom to node B bottom: y ≈ 116 → down to 162 → back up
  const arcPath = "M 75,116 C 75,162 365,162 365,116";

  // Precomputed bezier samples for 2 travelling dots (back and forth)
  const pts = [
    [75,116],[120,148],[220,162],[320,148],[365,116],
    [320,148],[220,162],[120,148],[75,116],
  ];
  const cxs = pts.map(p => p[0]);
  const cys = pts.map(p => p[1]);

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* glow track */}
      <motion.path
        d={arcPath}
        fill="none"
        stroke={`${color}22`}
        strokeWidth={8}
      />
      {/* main arc */}
      <motion.path
        d={arcPath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      {/* dot 1 */}
      <motion.circle
        r={5} fill={color}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        animate={{ cx: cxs, cy: cys }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: 0 }}
      />
      {/* dot 2 — offset */}
      <motion.circle
        r={4} fill={color}
        opacity={0.6}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        animate={{ cx: cxs, cy: cys }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: 1.4 }}
      />
      {/* "P2P" label on the arc */}
      <motion.text
        x={220} y={176}
        textAnchor="middle"
        fill={color}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.9 }}
        style={{ fontSize: 9, fontWeight: 700, fontFamily: "system-ui,sans-serif", letterSpacing: 1 }}
      >
        DIRECT P2P
      </motion.text>
    </motion.g>
  );
}

/* ─── main diagram ──────────────────────────────────────────── */

function Diagram({ phase, phaseKey }: { phase: Phase; phaseKey: number }) {
  const lineASActive = phase.packets.some(p => p.line === "AS") || phase.p2p;
  const lineSBActive = phase.packets.some(p => p.line === "SB") || phase.p2p;

  const nodeAIcon = phase.nodeA === "streaming" ? "📹" : "🙂";
  const nodeBIcon = phase.nodeB === "streaming" ? "📹" : phase.nodeB === "offline" ? "👤" : "🙂";
  const nodeSIcon = phase.nodeS === "relay"     ? "📡"
    : phase.nodeS === "dim"      ? "💤"
    : "⚡";

  return (
    <div className="relative w-full" style={{ padding: "8px 0" }}>
      <svg
        viewBox="0 0 440 185"
        className="w-full"
        style={{ maxWidth: 440, margin: "0 auto", display: "block" }}
      >
        <defs>
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={phase.color} stopOpacity={0.06} />
            <stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </radialGradient>
          <pattern id="dotgrid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.05)" />
          </pattern>
        </defs>

        {/* background */}
        <rect width={440} height={185} fill="url(#dotgrid)" rx={12} />
        <rect width={440} height={185} fill="url(#bg-glow)" rx={12} />

        {/* connection lines */}
        <ConnLine lineKey="AS" active={lineASActive && !phase.p2p} color={phase.color} />
        <ConnLine lineKey="SB" active={lineSBActive && !phase.p2p} color={phase.color} />

        {/* P2P arc */}
        <AnimatePresence>
          {phase.p2p && <P2PArc key="p2p-arc" color={phase.color} />}
        </AnimatePresence>

        {/* packets */}
        {phase.packets.map((pkt, i) => (
          <Packet key={`${phaseKey}-${i}`} pkt={pkt} phaseKey={phaseKey} />
        ))}

        {/* nodes */}
        <NodeCircle cx={75}  cy={80} state={phase.nodeA} label="You"      sublabel="Browser"   icon={nodeAIcon} phaseColor={phase.color} />
        <NodeCircle cx={220} cy={80} state={phase.nodeS} label="Server"   sublabel="Socket.IO" icon={nodeSIcon} phaseColor={phase.color} />
        <NodeCircle cx={365} cy={80} state={phase.nodeB} label="Stranger" sublabel="Browser"   icon={nodeBIcon} phaseColor={phase.color} />
      </svg>
    </div>
  );
}

/* ─── modal ─────────────────────────────────────────────────── */

export default function HowItWorksModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState(0);
  const { t } = useLang();

  useEffect(() => {
    const timer = setTimeout(() => setPhase(p => (p + 1) % PHASES.length), PHASE_MS[phase]);
    return () => clearTimeout(timer);
  }, [phase]);

  const current = PHASES[phase];
  const phaseTitle  = t(PHASE_TITLE_KEYS[phase]);
  const phaseDetail = t(PHASE_DETAIL_KEYS[phase]);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          key="card"
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{ background: "#08080f", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* ── header ── */}
          <div
            className="flex items-center justify-between px-5 pt-4 pb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div>
              <p className="font-semibold text-white" style={{ fontSize: 15 }}>{t("modalTitle")}</p>
              <p className="mt-0.5" style={{ color: "#4b4b60", fontSize: 13 }}>{t("modalSubtitle")}</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "#5b5b70" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#f1f1f5")}
              onMouseLeave={e => (e.currentTarget.style.color = "#5b5b70")}
            >
              <X size={15} />
            </button>
          </div>

          {/* ── diagram ── */}
          <div className="px-4 pt-3 pb-1">
            <Diagram phase={current} phaseKey={phase} />
          </div>

          {/* ── phase label ── */}
          <div className="px-5 pb-1" style={{ minHeight: 60 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${phase}-${phaseTitle}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="font-bold uppercase tracking-widest"
                    style={{ color: current.color, fontSize: 11 }}
                  >
                    {phaseTitle}
                  </span>
                  <motion.div
                    className="flex-1 h-px rounded-full"
                    style={{ background: `${current.color}22` }}
                  >
                    <motion.div
                      className="h-px rounded-full"
                      style={{ background: current.color }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: PHASE_MS[phase] / 1000, ease: "linear" }}
                    />
                  </motion.div>
                </div>
                <p className="leading-relaxed" style={{ color: "#6b6b80", fontSize: 13 }}>
                  {phaseDetail}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── phase dots ── */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2">
              {PHASES.map((_p, i) => (
                <button
                  key={i}
                  onClick={() => setPhase(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === phase ? 20 : 6,
                    height: 6,
                    background: i === phase ? current.color : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>
            <p style={{ color: "#2e2e40", fontSize: 12 }}>
              {phase + 1} / {PHASES.length}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
