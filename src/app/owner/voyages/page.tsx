"use client";

import { useEffect, useState } from "react";
import { OwnerShell, OwnerPill, voyageExposure, fmtUSD } from "@/components/OwnerShell";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/format";

type Voyage = {
  id: string; vessel_name: string; vessel_type: string | null; charterer: string | null;
  cp_date: string | null; load_port: string | null; discharge_port: string | null; cargo: string | null;
  laytime_allowed_hrs: number; laytime_used_hrs: number; demurrage_rate_day: number;
  nor_tendered_at: string | null; status: string;
};

export default function OwnerVoyages() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);

  useEffect(() => {
    supabase().from("voyages").select("*").order("cp_date", { ascending: false }).then(({ data }) => setVoyages((data as Voyage[]) ?? []));
  }, []);

  return (
    <OwnerShell>
      <h1 className="font-display text-xl font-semibold">Voyages</h1>
      <p className="mt-1 text-sm text-muted">Every fixture with its laytime position and demurrage exposure, calculated from the SOF.</p>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border text-left font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              <th className="px-4 py-3">Vessel</th>
              <th className="px-4 py-3">Charterer</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">CP date</th>
              <th className="px-4 py-3">Laytime</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Exposure</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {voyages.map((v) => {
              const used = Number(v.laytime_used_hrs);
              const allowed = Number(v.laytime_allowed_hrs);
              const over = used > allowed;
              const exposure = voyageExposure(allowed, used, Number(v.demurrage_rate_day));
              return (
                <tr key={v.id} className="hover:bg-surface-2/60">
                  <td className="px-4 py-3">
                    <div className="font-medium">{v.vessel_name}</div>
                    <div className="text-xs text-muted">{v.vessel_type} · {v.cargo}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{v.charterer}</td>
                  <td className="px-4 py-3 text-xs">{v.load_port} → {v.discharge_port}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{formatDate(v.cp_date)}</td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs" style={{ color: over ? "var(--danger)" : "var(--accent)" }}>
                      {used}h / {allowed}h
                    </div>
                    <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full" style={{ width: `${Math.min(100, (used / allowed) * 100)}%`, background: over ? "var(--danger)" : "var(--accent)" }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{fmtUSD(Number(v.demurrage_rate_day))}/d</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: over ? "var(--danger)" : undefined }}>
                    {over ? fmtUSD(exposure) : "—"}
                  </td>
                  <td className="px-4 py-3"><OwnerPill status={v.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </OwnerShell>
  );
}
