"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell, StatusPill } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { daysLeft, STATUS_LABELS } from "@/lib/format";

type Shipment = {
  id: string; container_no: string; bl_no: string; carrier: string; vessel_name: string;
  origin_port: string; destination_port: string; free_time_days: number; clock_start_at: string | null;
  gate_out_at: string | null; status: string;
};

export default function ShipmentsPage() {
  const [rows, setRows] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    supabase()
      .from("shipments")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Shipment[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (status !== "all" && r.status !== status) return false;
        if (q && !`${r.container_no} ${r.bl_no} ${r.carrier} ${r.destination_port}`.toLowerCase().includes(q.toLowerCase()))
          return false;
        return true;
      }),
    [rows, q, status]
  );

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">Shipments</h1>
          <p className="mt-1 text-sm text-mist">{filtered.length} containers</p>
        </div>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs outline-none"
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABELS)
              .filter(([k]) => ["in_transit", "at_port", "at_risk", "in_demurrage", "closed"].includes(k))
              .map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search container / BL…"
            className="w-56 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-xs outline-none placeholder:text-mist/60 focus:border-cyan"
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-panel-border" style={{ background: "#101b30" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-left font-mono text-[10px] uppercase tracking-wider text-mist">
              <th className="px-4 py-3 font-normal">Container</th>
              <th className="px-4 py-3 font-normal">Carrier</th>
              <th className="px-4 py-3 font-normal">Lane</th>
              <th className="px-4 py-3 font-normal">Free time</th>
              <th className="px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-mist">Loading…</td></tr>
            )}
            {filtered.map((s) => {
              const d = daysLeft(s.clock_start_at, s.free_time_days, s.gate_out_at);
              const color = d === null ? "#8fa3be" : d < 0 ? "#ff5a5f" : d <= 3 ? "#f2a93c" : "#4cd9e0";
              return (
                <tr key={s.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link href={`/app/shipments/${s.id}`} className="font-mono text-[13px] text-paper hover:text-cyan">
                      {s.container_no}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-mist">{s.carrier}</td>
                  <td className="px-4 py-3 text-mist">{s.origin_port} → {s.destination_port}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs" style={{ color }}>
                      {d === null ? "not started" : d < 0 ? `${Math.abs(d)}d over` : `${d}d left`}
                    </span>
                    <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${d === null ? 0 : Math.max(8, Math.min(100, 100 - (d / s.free_time_days) * 100))}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={s.status} label={STATUS_LABELS[s.status] ?? s.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
