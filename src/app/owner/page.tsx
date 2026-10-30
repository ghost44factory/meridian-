"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OwnerShell, OwnerPill, voyageExposure, fmtUSD } from "@/components/OwnerShell";
import { supabase } from "@/lib/supabase";

type Voyage = {
  id: string; vessel_name: string; vessel_type: string | null; charterer: string | null;
  load_port: string | null; discharge_port: string | null; cargo: string | null;
  laytime_allowed_hrs: number; laytime_used_hrs: number; demurrage_rate_day: number; status: string;
};
type Claim = {
  id: string; counterparty: string | null; amount: number; status: string;
  issued_at: string | null; due_at: string | null; settled_amount: number | null;
};

export default function OwnerOverview() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const sb = supabase();
    sb.from("voyages").select("*").order("created_at", { ascending: false }).then(({ data }) => setVoyages((data as Voyage[]) ?? []));
    sb.from("owner_claims").select("*").order("created_at", { ascending: false }).then(({ data }) => setClaims((data as Claim[]) ?? []));
  }, []);

  const active = voyages.filter((v) => ["loading", "discharging", "claim_ready"].includes(v.status));
  const onDem = active.filter((v) => Number(v.laytime_used_hrs) > Number(v.laytime_allowed_hrs));
  const accruingPerDay = onDem.reduce((s, v) => s + Number(v.demurrage_rate_day), 0);
  const claimReady = claims.filter((c) => c.status === "draft").reduce((s, c) => s + Number(c.amount), 0);
  const outstanding = claims.filter((c) => ["issued", "acknowledged"].includes(c.status)).reduce((s, c) => s + Number(c.amount), 0);
  const settled = claims.filter((c) => c.status === "settled").reduce((s, c) => s + Number(c.settled_amount ?? c.amount), 0);

  return (
    <OwnerShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">Fleet demurrage</h1>
          <p className="mt-1 text-sm text-muted">Laytime, exposure and claims across your voyages.</p>
        </div>
        <Link href="/owner/claims" className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-fg hover:brightness-105">
          Review claims →
        </Link>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <Stat label="Vessels on demurrage" value={`${onDem.length}`} sub={`accruing ${fmtUSD(accruingPerDay)}/day`} tone="var(--danger)" />
        <Stat label="Claim-ready" value={fmtUSD(claimReady)} sub="laytime statements complete" tone="var(--accent)" />
        <Stat label="Issued, outstanding" value={fmtUSD(outstanding)} sub="awaiting counterparty payment" tone="var(--warn)" />
        <Stat label="Settled this year" value={fmtUSD(settled)} sub="recovered to your account" tone="var(--accent)" />
      </div>

      <h2 className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">Active voyages</h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        {active.map((v) => {
          const used = Number(v.laytime_used_hrs);
          const allowed = Number(v.laytime_allowed_hrs);
          const over = used > allowed;
          const pct = Math.min(100, (used / allowed) * 100);
          const exposure = voyageExposure(allowed, used, Number(v.demurrage_rate_day));
          return (
            <Link key={v.id} href="/owner/voyages" className="card block p-5 transition hover:border-accent/50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-base font-semibold">{v.vessel_name}</div>
                  <div className="mt-0.5 text-xs text-muted">{v.vessel_type} · {v.load_port} → {v.discharge_port}</div>
                </div>
                <OwnerPill status={v.status} />
              </div>
              <div className="mt-3 text-xs text-muted">{v.cargo} · {v.charterer}</div>
              <div className="mt-4 flex items-baseline justify-between text-xs">
                <span className="text-muted">Laytime</span>
                <span className="font-mono" style={{ color: over ? "var(--danger)" : "var(--accent)" }}>
                  {used}h / {allowed}h
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? "var(--danger)" : "var(--accent)" }} />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[11px]">
                <span className="text-muted">{fmtUSD(Number(v.demurrage_rate_day))}/day rate</span>
                <span style={{ color: over ? "var(--danger)" : "var(--accent)" }}>
                  {over ? `${fmtUSD(exposure)} accrued` : "within laytime"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">Recent claims</h2>
      <div className="card mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              <th className="px-4 py-3">Counterparty</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Issued</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {claims.slice(0, 5).map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">{c.counterparty}</td>
                <td className="px-4 py-3 font-mono text-accent">{fmtUSD(Number(c.status === "settled" ? c.settled_amount ?? c.amount : c.amount))}</td>
                <td className="px-4 py-3"><OwnerPill status={c.status} /></td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{c.issued_at ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OwnerShell>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: string }) {
  return (
    <div className="card p-5">
      <div className="font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-2 font-mono text-2xl font-semibold" style={{ color: tone }}>{value}</div>
      <div className="mt-1 text-xs text-muted">{sub}</div>
    </div>
  );
}
