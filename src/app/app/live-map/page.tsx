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

type Vessel = {
  name: string;
  carrier: string;
  origin: string;
  destination: string;
  shipments: Shipment[];
  x: number; y: number; angle: number;
  t: number;
  color: string;
  worst: string;
  imo: string;
  flag: string;
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

const SEVERITY: Record<string, number> = { in_demurrage: 3, at_risk: 2, at_port: 1, in_transit: 0 };

export default function AppLiveMap() {
  const [rows, setRows] = useState<Shipment[]>([]);
  const [selected, setSelected] = useState<Vessel | null>(null);

  useEffect(() => {
    supabase()
      .from("shipments")
      .select("id,container_no,carrier,vessel_name,origin_port,destination_port,status,free_time_days,clock_start_at")
      .neq("status", "closed")
      .then(({ data }) => setRows((data as Shipment[]) ?? []));
  }, []);

  // One glyph per VESSEL; its shipments ride together, worst status wins the colour.
  const vessels = useMemo(() => {
    const byVessel = new Map<string, Shipment[]>();
    for (const s of rows) {
      const key = s.vessel_name ?? `Unassigned · ${s.origin_port}`;
      byVessel.set(key, [...(byVessel.get(key) ?? []), s]);
    }
    const out: Vessel[] = [];
    for (const [name, group] of byVessel) {
      const first = group[0];
      const lane = PORT_LANES[first.origin_port] ?? PORT_LANES["Shanghai"];
      const anyMoving = group.some((s) => s.status === "in_transit");
      const tj = ((hash(name) % 100) - 50) / 1400;
      const t = anyMoving ? Math.min(0.94, Math.max(0.04, 0.22 + (hash(name) % 58) / 100 + tj)) : 0.985;
      const p = pointAlong(lane, t);
      const worst = group.reduce((w, s) => (SEVERITY[s.status] > SEVERITY[w] ? s.status : w), "in_transit");
      out.push({
        name,
        carrier: first.carrier,
        origin: first.origin_port,
        destination: first.destination_port,
        shipments: group.sort((a, b) => SEVERITY[b.status] - SEVERITY[a.status]),
        x: p.x, y: p.y, angle: p.angle, t,
        worst,
        color: worst === "in_demurrage" ? "var(--danger)" : worst === "at_risk" ? "var(--warn)" : "var(--accent)",
        imo: `${9300000 + (hash(name) % 400000)}`,
        flag: ["Panama", "Liberia", "Marshall Is.", "Malta", "Singapore", "Hong Kong"][hash(name) % 6],
      });
    }
    return out;
  }, [rows]);

  const atRiskCount = vessels.filter((v) => v.worst === "at_risk" || v.worst === "in_demurrage").length;

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">Live map</h1>
          <p className="mt-1 text-sm text-mist">
            {vessels.length} vessels carrying {rows.length} of your containers · positions estimated until the AIS feed connects
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full border border-border bg-surface-2 px-3 py-1.5">{vessels.length} vessels</span>
          <span className="rounded-full px-3 py-1.5" style={{ background: "color-mix(in srgb, var(--warn) 15%, transparent)", color: "var(--warn)" }}>
            {atRiskCount} need attention
          </span>
        </div>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-xl border border-panel-border" style={{ background: "#0a0b0d" }}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full">
          <defs>
            <pattern id="agrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1c20" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={MAP_W} height={MAP_H} fill="#0a0b0d" />
          <rect width={MAP_W} height={MAP_H} fill="url(#agrid)" />
          <path d={WORLD_PATH} fill="#16181c" stroke="#26292e" strokeWidth="0.7" strokeLinejoin="round" />
          {Object.values(PORT_LANES).map((lane, i) =>
            lanePolylines(lane).map((points, j) => (
              <polyline key={`${i}-${j}`} points={points} fill="none" stroke="#31353b" strokeWidth="0.9" strokeDasharray="3 5" />
            ))
          )}
          {vessels.map((v) => (
            <g key={v.name} transform={`translate(${v.x} ${v.y})`} onClick={() => setSelected(v)} style={{ cursor: "pointer" }}>
              <circle r="9" fill={v.color} opacity="0.15">
                <animate attributeName="r" values="6;15;6" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <ShipGlyph color={v.color} travelAngle={v.angle} scale={1.2} />
            </g>
          ))}
        </svg>

        {selected && (
          <div className="glass-panel absolute bottom-4 right-4 top-4 flex w-80 flex-col overflow-y-auto rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display font-semibold text-[10px] uppercase tracking-[0.18em] text-cyan">{selected.carrier}</div>
                <div className="mt-0.5 font-display text-lg font-semibold leading-tight">{selected.name}</div>
                <div className="mt-0.5 flex gap-3 text-[11px] text-mist">
                  <span>IMO <span className="font-mono">{selected.imo}</span></span>
                  <span>{selected.flag}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-xs text-mist hover:text-paper">✕</button>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-surface-2/60 p-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span>{selected.origin}</span>
                <span className="px-1 text-mist">→</span>
                <span>{selected.destination}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-cyan" style={{ width: `${Math.round(selected.t * 100)}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[10px] text-mist">
                <span>{Math.round(selected.t * 100)}% of passage</span>
                <span>{selected.t >= 0.98 ? "arrived — clock running" : "at sea"}</span>
              </div>
            </div>

            <div className="mt-4 font-display font-semibold text-[10px] uppercase tracking-[0.18em] text-mist">
              Your containers aboard — {selected.shipments.length}
            </div>
            <div className="mt-2 flex-1 space-y-2">
              {selected.shipments.map((s) => {
                const d = daysLeft(s.clock_start_at, s.free_time_days);
                const tone = s.status === "in_demurrage" ? "var(--danger)" : s.status === "at_risk" ? "var(--warn)" : "var(--accent)";
                return (
                  <Link
                    key={s.id}
                    href={`/app/shipments/${s.id}`}
                    className="block rounded-lg border border-border bg-surface-2/60 p-3 transition hover:border-cyan/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{s.container_no}</span>
                      <span className="font-mono text-[10px]" style={{ color: tone }}>
                        {d === null ? "clock not started" : d < 0 ? `${Math.abs(d)}d over` : `${d}d free left`}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full"
                        style={{
                          width: d === null ? "8%" : `${Math.max(6, Math.min(100, ((s.free_time_days - (d ?? 0)) / s.free_time_days) * 100))}%`,
                          background: tone,
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/app/shipments"
              className="mt-3 block rounded-full bg-cyan py-2 text-center text-xs font-semibold text-navy hover:brightness-110"
            >
              All shipments →
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
