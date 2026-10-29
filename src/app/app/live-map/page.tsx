"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { daysLeft } from "@/lib/format";
import { ShipGlyph } from "@/components/ShipGlyph";
import { WORLD_PATH, MAP_W, MAP_H } from "@/lib/world-path";
import { LANES, makeLane, pointAlong, lanePolylines, type Lane } from "@/lib/sea-lanes";

type Shipment = {
  id: string; container_no: string; carrier: string; vessel_name: string | null;
  origin_port: string; destination_port: string; status: string;
  free_time_days: number; clock_start_at: string | null;
};

const PORT_LANES: Record<string, Lane> = {
  Shanghai: makeLane(LANES.asiaEurope),
  Ningbo: makeLane(LANES.asiaEurope),
  Shenzhen: makeLane(LANES.asiaEurope),
  "Jebel Ali": makeLane(LANES.jebelAliEurope),
  Karachi: makeLane(LANES.karachiEurope),
  "Los Angeles": makeLane(LANES.pacificWestbound),
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
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
        const lane = PORT_LANES[s.origin_port] ?? PORT_LANES["Shanghai"];
        // jitter along the lane (not off it) so vessels spread out but stay at sea
        const tj = ((hash(s.container_no) % 100) - 50) / 2500;
        const t = s.status === "in_transit" ? Math.min(0.96, Math.max(0.02, 0.2 + (hash(s.id) % 60) / 100 + tj)) : 0.985;
        const p = pointAlong(lane, t);
        const color =
          s.status === "in_demurrage" ? "var(--danger)" : s.status === "at_risk" ? "var(--warn)" : "var(--accent)";
        return { ...s, x: p.x, y: p.y, angle: p.angle, color };
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

      <div className="relative mt-5 overflow-hidden rounded-xl border border-panel-border" style={{ background: "#0b0d12" }}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full">
          <defs>
            <pattern id="agrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a2540" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={MAP_W} height={MAP_H} fill="#0b1220" />
          <rect width={MAP_W} height={MAP_H} fill="url(#agrid)" />
          <path d={WORLD_PATH} fill="#132038" stroke="#22354f" strokeWidth="0.7" strokeLinejoin="round" />
          {Object.values(PORT_LANES).map((lane, i) =>
            lanePolylines(lane).map((points, j) => (
              <polyline key={`${i}-${j}`} points={points} fill="none" stroke="#2a4266" strokeWidth="0.9" strokeDasharray="3 5" />
            ))
          )}
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
