"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { ShipGlyph } from "@/components/ShipGlyph";

type Vessel = {
  id: string;
  name: string;
  carrier: string;
  status: "on" | "risk" | "demurrage" | "dim";
  path: [number, number][];
  progress: number;
  speed: number;
  nextPort: string;
  eta: string;
  congestion: "Low" | "Moderate" | "Severe";
  heading: number;
  region: "Pacific" | "Atlantic" | "Suez" | "Other";
  containers?: Array<{
    no: string;
    cargo: string;
    weight: string;
    freeTimeHours: number;
    risk: "on" | "risk" | "demurrage";
  }>;
};

function lonLat([lon, lat]: [number, number]): [number, number] {
  const x = ((lon + 180) / 360) * 1000;
  const y = ((85 - lat) / 170) * 500;
  return [x, y];
}

const CONTINENTS = [
  "M 130 130 L 230 100 L 300 130 L 320 200 L 280 260 L 220 290 L 170 240 L 140 180 Z",
  "M 260 300 L 310 290 L 340 360 L 320 430 L 290 460 L 270 420 L 260 360 Z",
  "M 460 130 L 540 120 L 570 160 L 550 200 L 500 210 L 470 180 Z",
  "M 490 220 L 570 210 L 590 290 L 570 380 L 540 410 L 510 380 L 480 300 Z",
  "M 570 100 L 780 110 L 830 200 L 800 260 L 720 290 L 640 260 L 590 200 Z",
  "M 660 260 L 700 260 L 705 320 L 680 340 L 660 310 Z",
  "M 800 300 L 870 310 L 900 380 L 850 420 L 800 400 L 790 350 Z",
  "M 830 380 L 900 380 L 920 430 L 870 450 L 830 430 Z",
];

const SHIPPING_LANES: [number, number][][] = [
  [[-122, 37], [-160, 40], [170, 38], [140, 35], [121, 31]],
  [[121, 31], [103, 1], [80, 8], [43, 12], [32, 30], [14, 36], [-5, 36], [4, 51]],
  [[-74, 40], [-40, 43], [-10, 48], [4, 51]],
  [[-43, -22], [-15, 0], [-9, 38], [4, 51]],
  [[151, -33], [130, -10], [121, 15], [121, 31]],
];

function generateVessels(): Vessel[] {
  const NAMES = [
    "MSC Aurora", "Maersk Halcyon", "Ever Golden", "ONE Meridian", "CMA CGM Sirius",
    "Cosco Andes", "Hapag Marlin", "MSC Kepler", "Yang Ming Orion", "ZIM Polaris",
    "Maersk Vega", "Wan Hai Nova",
  ];
  const CARRIERS = ["MSC", "Maersk", "Evergreen", "ONE", "CMA CGM", "COSCO", "Hapag-Lloyd", "Yang Ming", "ZIM", "Wan Hai"];
  const PORTS = ["Shanghai", "Rotterdam", "Los Angeles", "Singapore", "Antwerp", "Hamburg", "Jebel Ali", "Long Beach", "Ningbo", "Busan"];
  const REGIONS: Vessel["region"][] = ["Pacific", "Suez", "Atlantic", "Atlantic", "Other"];
  const STATUSES = ["on", "on", "on", "on", "risk", "risk", "risk", "demurrage", "on", "risk", "demurrage", "on"] as const;

  const vessels: Vessel[] = [];
  for (let i = 0; i < 40; i++) {
    const isHighlight = i < 12;
    const laneIdx = i % SHIPPING_LANES.length;
    const status: Vessel["status"] = isHighlight ? STATUSES[i] : "dim";
    const name = isHighlight ? NAMES[i] : `MV ${String.fromCharCode(65 + (i % 26))}${100 + i}`;
    vessels.push({
      id: `v${i}`,
      name,
      carrier: CARRIERS[i % CARRIERS.length],
      status,
      path: SHIPPING_LANES[laneIdx],
      progress: (i * 0.13) % 1,
      speed: 0.00003 + (i % 5) * 0.000008,
      nextPort: PORTS[i % PORTS.length],
      eta: `${3 + (i % 9)}d ${2 + (i % 20)}h`,
      congestion: (["Low", "Moderate", "Severe"] as const)[i % 3],
      heading: 45 + ((i * 17) % 315),
      region: REGIONS[laneIdx],
      containers: isHighlight
        ? [
            {
              no: `MSKU${7000000 + i * 137}`,
              cargo: i % 2 ? "Automotive parts" : "Consumer electronics",
              weight: `${18 + (i % 8)}.${i % 10}t`,
              freeTimeHours: status === "demurrage" ? -12 : status === "risk" ? 18 : 96,
              risk: status === "dim" ? "on" : status,
            },
            {
              no: `TCLU${5000000 + i * 211}`,
              cargo: i % 2 ? "Apparel & textiles" : "Industrial components",
              weight: `${12 + (i % 6)}.${(i + 3) % 10}t`,
              freeTimeHours: status === "demurrage" ? -36 : status === "risk" ? 8 : 72,
              risk: status === "dim" ? "on" : status,
            },
          ]
        : undefined,
    });
  }
  return vessels;
}

const STATUS_COLORS: Record<Vessel["status"], string> = {
  on: "#4cd9e0",
  risk: "#f2a93c",
  demurrage: "#ff5a5f",
  dim: "#3d5478",
};

function pointOnPath(path: [number, number][], t: number) {
  const segCount = path.length - 1;
  const scaled = t * segCount;
  const i = Math.min(segCount - 1, Math.floor(scaled));
  const local = scaled - i;
  const [x1, y1] = lonLat(path[i]);
  const [x2, y2] = lonLat(path[i + 1]);
  return {
    x: x1 + (x2 - x1) * local,
    y: y1 + (y2 - y1) * local,
    angle: (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI,
  };
}

export default function MapPage() {
  const [vessels, setVessels] = useState<Vessel[]>(() => generateVessels());
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [filter, setFilter] = useState<"All" | "At risk" | "Pacific" | "Atlantic" | "Suez">("All");
  const [search, setSearch] = useState("");
  const [clock, setClock] = useState("");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      setVessels((vs) => vs.map((v) => ({ ...v, progress: (v.progress + v.speed * 16) % 1 })));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toISOString().slice(11, 19)), 1000);
    return () => clearInterval(id);
  }, []);

  const filteredVessels = useMemo(() => {
    return vessels.filter((v) => {
      if (filter === "At risk" && !(v.status === "risk" || v.status === "demurrage")) return false;
      if (filter === "Pacific" && v.region !== "Pacific") return false;
      if (filter === "Atlantic" && v.region !== "Atlantic") return false;
      if (filter === "Suez" && v.region !== "Suez") return false;
      if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [vessels, filter, search]);

  const highlightedCount = filteredVessels.filter((v) => v.status !== "dim").length;
  const cargoCount = filteredVessels.reduce((a, v) => a + (v.containers?.length ?? 0), 0);

  return (
    <div className="relative min-h-screen bg-abyss text-paper">
      <TopNav />

      <div className="fixed left-0 right-0 top-16 z-30 flex flex-wrap items-center gap-3 px-6 py-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">
            Command center · demo data
          </div>
          <h1 className="font-display text-xl font-semibold">Live tracking — Global</h1>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {(["All", "At risk", "Pacific", "Atlantic", "Suez"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                filter === f
                  ? "border-cyan bg-cyan/20 text-cyan"
                  : "border-white/15 bg-white/5 text-mist hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search vessel…"
            className="w-52 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs text-paper outline-none placeholder:text-mist/60 focus:border-cyan"
          />
        </div>
      </div>

      <div className="relative h-screen w-full pt-28">
        <svg viewBox="0 0 1000 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a2540" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1000" height="500" fill="#0b1220" />
          <rect width="1000" height="500" fill="url(#grid)" />
          {[125, 250, 375].map((y) => (
            <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#1a2540" strokeWidth="0.5" strokeDasharray="2 6" />
          ))}
          {CONTINENTS.map((d, i) => (
            <path key={i} d={d} fill="#132038" stroke="#1e2f4f" strokeWidth="1" />
          ))}
          {SHIPPING_LANES.map((lane, i) => {
            const points = lane.map((p) => lonLat(p).join(",")).join(" ");
            return (
              <polyline key={i} points={points} fill="none" stroke="#1e3350" strokeWidth="1" strokeDasharray="3 5" />
            );
          })}
          {filteredVessels.map((v) => {
            const p = pointOnPath(v.path, v.progress);
            const c = STATUS_COLORS[v.status];
            const isHighlight = v.status !== "dim";
            return (
              <g
                key={v.id}
                transform={`translate(${p.x} ${p.y})`}
                onClick={() => isHighlight && setSelected(v)}
                style={{ cursor: isHighlight ? "pointer" : "default" }}
              >
                {isHighlight && (
                  <>
                    <circle r="10" fill={c} opacity="0.15">
                      <animate attributeName="r" values="7;17;7" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                    <ShipGlyph color={c} travelAngle={p.angle} scale={1.35} />
                  </>
                )}
                {!isHighlight && <circle r="1.6" fill={c} opacity="0.6" />}
              </g>
            );
          })}
        </svg>

        <div className="glass-panel absolute bottom-6 left-6 rounded-xl p-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-mist">Legend</div>
          <div className="space-y-1.5 text-xs">
            <LegendRow color="#4cd9e0" label="On schedule" />
            <LegendRow color="#f2a93c" label="Free-time risk" />
            <LegendRow color="#ff5a5f" label="Active demurrage" />
            <LegendRow color="#3d5478" label="Background traffic" />
          </div>
        </div>

        <div className="glass-panel absolute right-6 top-32 rounded-xl p-4 font-mono text-xs">
          <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-mist">Live readout</div>
          <div className="flex justify-between gap-6">
            <span className="text-mist">Vessels in view</span>
            <span className="text-cyan">{filteredVessels.length}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-mist">Highlighted</span>
            <span className="text-cyan">{highlightedCount}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-mist">Your cargo</span>
            <span className="text-amber">{cargoCount} boxes</span>
          </div>
          <div className="mt-2 flex justify-between gap-6 border-t border-white/10 pt-2">
            <span className="text-mist">UTC</span>
            <span className="text-paper">{clock || "--:--:--"}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && <VesselPanel vessel={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="text-mist">{label}</span>
    </div>
  );
}

function VesselPanel({ vessel, onClose }: { vessel: Vessel; onClose: () => void }) {
  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 220, damping: 30 }}
      className="glass-panel fixed right-0 top-16 z-40 h-[calc(100vh-4rem)] w-full max-w-md overflow-y-auto border-l border-white/10 p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">Vessel</div>
          <h2 className="mt-1 font-display text-2xl font-semibold">{vessel.name}</h2>
          <div className="text-sm text-mist">{vessel.carrier}</div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
        >
          Close
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 font-mono text-xs">
        <PanelStat label="Speed" value={`${14 + Math.round(vessel.progress * 8)}kn`} />
        <PanelStat label="Heading" value={`${vessel.heading.toFixed(0)}°`} />
        <PanelStat label="Next port" value={vessel.nextPort} />
        <PanelStat label="ETA" value={vessel.eta} />
        <PanelStat
          label="Berth congestion"
          value={vessel.congestion}
          valueClass={
            vessel.congestion === "Severe" ? "text-coral" : vessel.congestion === "Moderate" ? "text-amber" : "text-cyan"
          }
        />
        <PanelStat
          label="Status"
          value={vessel.status === "on" ? "On schedule" : vessel.status === "risk" ? "Free-time risk" : "Demurrage"}
          valueClass={vessel.status === "on" ? "text-cyan" : vessel.status === "risk" ? "text-amber" : "text-coral"}
        />
      </div>

      <div className="mt-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
          Your cargo on this vessel
        </div>
        <div className="mt-3 space-y-3">
          {vessel.containers?.map((c) => (
            <div key={c.no} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{c.no}</span>
                <span
                  className={`font-mono text-xs ${
                    c.risk === "on" ? "text-cyan" : c.risk === "risk" ? "text-amber" : "text-coral"
                  }`}
                >
                  {c.freeTimeHours >= 0 ? `${c.freeTimeHours}h left` : `+${Math.abs(c.freeTimeHours)}h over`}
                </span>
              </div>
              <div className="mt-1 text-sm">{c.cargo}</div>
              <div className="font-mono text-xs text-mist">{c.weight}</div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.max(6, Math.min(100, ((c.freeTimeHours + 48) / 144) * 100))}%`,
                    background: c.risk === "on" ? "#4cd9e0" : c.risk === "risk" ? "#f2a93c" : "#ff5a5f",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10">
          View full BL
        </button>
        <button className="flex-1 rounded-full bg-cyan px-4 py-2.5 text-sm font-medium text-navy hover:brightness-110">
          Generate dispute
        </button>
      </div>

      <Link
        href="/"
        className="mt-6 block text-center font-mono text-[10px] uppercase tracking-[0.25em] text-mist hover:text-paper"
      >
        ← Back to home
      </Link>
    </motion.aside>
  );
}

function PanelStat({ label, value, valueClass = "text-paper" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="text-[9px] uppercase tracking-widest text-mist">{label}</div>
      <div className={`mt-1 ${valueClass}`}>{value}</div>
    </div>
  );
}
