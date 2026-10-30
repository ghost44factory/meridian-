"use client";

// Homepage demo: the real live map, animating itself — ships sail real sea
// lanes, a cursor "clicks" a vessel, and its data card pops up. Cycles forever.
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShipGlyph } from "@/components/ShipGlyph";
import { WORLD_PATH, MAP_W, MAP_H } from "@/lib/world-path";
import { LANES, makeLane, pointAlong, lanePolylines, type Lane } from "@/lib/sea-lanes";

const SHOW_LANES: Lane[] = [
  makeLane(LANES.asiaEurope),
  makeLane(LANES.transatlantic),
  makeLane(LANES.brazilEurope),
  makeLane(LANES.transpacific),
];

type Featured = {
  name: string;
  carrier: string;
  lane: number;
  base: number; // base progress along lane
  color: string;
  status: string;
  boxes: { no: string; left: string; tone: string }[];
  note: string;
};

const FEATURED: Featured[] = [
  {
    name: "MSC Aurora", carrier: "MSC · Shanghai → Rotterdam", lane: 0, base: 0.46,
    color: "var(--danger)", status: "Active demurrage",
    boxes: [
      { no: "MSKU 7023941", left: "+36h over", tone: "var(--danger)" },
      { no: "TCLU 5118420", left: "+12h over", tone: "var(--danger)" },
    ],
    note: "£1,240 disputable — letter drafted",
  },
  {
    name: "Maersk Halcyon", carrier: "Maersk · New York → Rotterdam", lane: 1, base: 0.55,
    color: "var(--warn)", status: "Free-time risk",
    boxes: [
      { no: "MRKU 8830117", left: "18h left", tone: "var(--warn)" },
      { no: "MRKU 8830254", left: "2d left", tone: "var(--accent)" },
    ],
    note: "Alert sent: book trucker by Friday",
  },
  {
    name: "Ever Golden", carrier: "Evergreen · Santos → Rotterdam", lane: 2, base: 0.62,
    color: "var(--accent)", status: "On schedule",
    boxes: [
      { no: "EGHU 2203981", left: "6d free", tone: "var(--accent)" },
      { no: "EGHU 2204102", left: "6d free", tone: "var(--accent)" },
    ],
    note: "Nothing to do — tracked automatically",
  },
];

const AMBIENT = Array.from({ length: 10 }, (_, i) => ({
  lane: i % SHOW_LANES.length,
  base: (0.13 + i * 0.09) % 1,
}));

export function MapShowcase() {
  const [t, setT] = useState(0); // global drift 0..1
  const [idx, setIdx] = useState(0); // which featured vessel is "clicked"
  const [clicked, setClicked] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      setT((v) => (v + (now - last) * 0.0000045) % 1);
      last = now;
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  useEffect(() => {
    // cycle: cursor flies (0.9s) → click → card up → hold → next
    setClicked(false);
    const clickTimer = setTimeout(() => setClicked(true), 1000);
    const nextTimer = setTimeout(() => setIdx((i) => (i + 1) % FEATURED.length), 6500);
    return () => { clearTimeout(clickTimer); clearTimeout(nextTimer); };
  }, [idx]);

  const pos = (lane: number, base: number) =>
    pointAlong(SHOW_LANES[lane], (base + t * 0.35) % 1);

  const active = FEATURED[idx];
  const ap = pos(active.lane, active.base);
  const apx = (ap.x / MAP_W) * 100;
  const apy = (ap.y / MAP_H) * 100;
  // keep the card inside the frame
  const cardLeft = Math.min(72, Math.max(2, apx + (apx > 60 ? -30 : 3)));
  const cardTop = Math.min(38, Math.max(4, apy - 18));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border" style={{ background: "#0a0b0d" }}>
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full">
        <rect width={MAP_W} height={MAP_H} fill="#0a0b0d" />
        <path d={WORLD_PATH} fill="#16181c" stroke="#26292e" strokeWidth="0.7" strokeLinejoin="round" />
        {SHOW_LANES.map((lane, i) =>
          lanePolylines(lane).map((points, j) => (
            <polyline key={`${i}-${j}`} points={points} fill="none" stroke="#31353b" strokeWidth="0.9" strokeDasharray="3 5" />
          ))
        )}
        {AMBIENT.map((a, i) => {
          const p = pos(a.lane, a.base);
          return (
            <g key={i} transform={`translate(${p.x} ${p.y})`}>
              <ShipGlyph color="#41464e" travelAngle={p.angle} scale={0.9} />
            </g>
          );
        })}
        {FEATURED.map((f, i) => {
          const p = pos(f.lane, f.base);
          const isActive = i === idx && clicked;
          return (
            <g key={f.name} transform={`translate(${p.x} ${p.y})`}>
              {isActive && (
                <circle r="12" fill="none" stroke={f.color} strokeWidth="1.2" opacity="0.8">
                  <animate attributeName="r" values="6;20" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0" dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}
              <ShipGlyph color={f.color} travelAngle={p.angle} scale={1.45} />
            </g>
          );
        })}
      </svg>

      {/* flying cursor */}
      <motion.div
        className="pointer-events-none absolute z-10"
        animate={{ left: `${apx}%`, top: `${apy}%` }}
        transition={{ type: "spring", stiffness: 60, damping: 16 }}
        style={{ translateX: "-20%", translateY: "-20%" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M4 2 L20 12 L12 13.5 L8.5 21 Z" fill="#fff" stroke="#0a0b0d" strokeWidth="1.5" />
        </svg>
      </motion.div>

      {/* data card */}
      <AnimatePresence mode="wait">
        {clicked && (
          <motion.div
            key={active.name}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute z-20 w-60 rounded-xl border border-white/10 bg-[#16181c]/95 p-3.5 shadow-2xl backdrop-blur"
            style={{ left: `${cardLeft}%`, top: `${cardTop}%` }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">{active.name}</div>
              <span className="h-2 w-2 rounded-full" style={{ background: active.color }} />
            </div>
            <div className="mt-0.5 text-[11px] text-[#9aa1ac]">{active.carrier}</div>
            <div className="mt-1 text-[11px] font-medium" style={{ color: active.color }}>{active.status}</div>
            <div className="mt-2.5 space-y-1.5">
              {active.boxes.map((b) => (
                <div key={b.no} className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-1.5">
                  <span className="font-mono text-[10px] text-white/90">{b.no}</span>
                  <span className="font-mono text-[10px]" style={{ color: b.tone }}>{b.left}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 border-t border-white/10 pt-2 text-[11px] text-[#c8cdd6]">{active.note}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 font-display font-semibold text-[10px] uppercase tracking-[0.18em] text-[#6be3a9] backdrop-blur">
        Live demo · real product
      </div>
    </div>
  );
}
