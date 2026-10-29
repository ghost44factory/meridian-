"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { daysLeft } from "@/lib/format";
import { ShipGlyph } from "@/components/ShipGlyph";

type Shipment = {
  id: string; container_no: string; carrier: string; vessel_name: string | null;
  origin_port: string; destination_port: string; status: string;
  free_time_days: number; clock_start_at: string | null;
};

function lonLat([lon, lat]: [number, number]): [number, number] {
  return [((lon + 180) / 360) * 1000, ((85 - lat) / 170) * 500];
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

const LANES: Record<string, [number, number][]> = {
  Shanghai: [[121, 31], [103, 1], [80, 8], [43, 12], [32, 30], [14, 36], [-5, 36], [4, 51]],
  Ningbo: [[121, 29], [103, 1], [80, 8], [43, 12], [32, 30], [14, 36], [-5, 36], [4, 51]],
  Shenzhen: [[114, 22], [103, 1], [80, 8], [43, 12], [32, 30], [14, 36], [-5, 36], [4, 51]],
  "Jebel Ali": [[55, 25], [43, 12], [32, 30], [14, 36], [-5, 36], [4, 51]],
  Karachi: [[67, 24], [43, 12], [32, 30], [14, 36], [-5, 36], [-1, 51]],
  "Los Angeles": [[-118, 33], [-160, 40], [170, 38], [121, 31], [103, 1]],
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pointOnPath(path: [number, number][], t: number) {
  const segCount = path.length - 1;
  const scaled = Math.min(0.999, Math.max(0, t)) * segCount;
  const i = Math.floor(scaled);
  const local = scaled - i;
  const [x1, y1] = lonLat(path[i]);
  const [x2, y2] = lonLat(path[i + 1]);
  return {
    x: x1 + (x2 - x1) * local,
    y: y1 + (y2 - y1) * local,
    angle: (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI,
  };
}

export default function AppLiveMap() {
  const [rows, setRows] = useState<Shipment[]>([]);
  const [selected, setSelected] = useState<Shipment | null>(null);

  useEffect(() => {
    supabase()
      .from("shipments")
      .select("id,container_no,carrier,vessel_name,origin_port,destination_port,status,free_time_days,clock_start_at")
      .neq("status", "closed")
      .then(({ data }) => setRows((data as Shipment[]) ?? []));
  }, []);

  const vessels = useMemo(
    () =>
      rows.map((s) => {
        const lane = LANES[s.origin_port] ?? LANES["Shanghai"];
        const t = s.status === "in_transit" ? 0.2 + (hash(s.id) % 60) / 100 : 0.97;
        const p = pointOnPath(lane, t);
        const jitter = ((hash(s.container_no) % 100) - 50) / 12;
        const color =
          s.status === "in_demurrage" ? "#ff5a5f" : s.status === "at_risk" ? "#f2a93c" : "#4cd9e0";
        return { ...s, x: p.x + jitter, y: p.y + jitter / 2, angle: p.angle, color };
      }),
    [rows]
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold">Live map</h1>
          <p className="mt-1 text-sm text-mist">
            {rows.length} active shipments · positions estimated until live AIS feed is connected
          </p>
        </div>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-xl border border-panel-border" style={{ background: "#0b1220" }}>
        <svg viewBox="0 0 1000 500" className="w-full">
          <defs>
            <pattern id="agrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a2540" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1000" height="500" fill="#0b1220" />
          <rect width="1000" height="500" fill="url(#agrid)" />
          {CONTINENTS.map((d, i) => (
            <path key={i} d={d} fill="#132038" stroke="#1e2f4f" strokeWidth="1" />
          ))}
          {Object.values(LANES).map((lane, i) => (
            <polyline
              key={i}
              points={lane.map((p) => lonLat(p).join(",")).join(" ")}
              fill="none"
              stroke="#1e3350"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
          ))}
          {vessels.map((v) => (
            <g key={v.id} transform={`translate(${v.x} ${v.y})`} onClick={() => setSelected(v)} style={{ cursor: "pointer" }}>
              <circle r="9" fill={v.color} opacity="0.15">
                <animate attributeName="r" values="6;15;6" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <ShipGlyph color={v.color} travelAngle={v.angle} scale={1.1} />
            </g>
          ))}
        </svg>

        {selected && (
          <div className="glass-panel absolute right-4 top-4 w-72 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">{selected.carrier}</div>
                <div className="mt-0.5 font-mono text-sm">{selected.container_no}</div>
                <div className="text-xs text-mist">{selected.vessel_name}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-xs text-mist hover:text-paper">✕</button>
            </div>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-mist">Lane</span><span>{selected.origin_port} → {selected.destination_port}</span></div>
              <div className="flex justify-between">
                <span className="text-mist">Free time</span>
                <span className="font-mono">
                  {(() => {
                    const d = daysLeft(selected.clock_start_at, selected.free_time_days);
                    return d === null ? "not started" : d < 0 ? `${Math.abs(d)}d over` : `${d}d left`;
                  })()}
                </span>
              </div>
            </div>
            <Link
              href={`/app/shipments/${selected.id}`}
              className="mt-3 block rounded-full bg-cyan py-2 text-center text-xs font-semibold text-navy hover:brightness-110"
            >
              Open shipment →
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
