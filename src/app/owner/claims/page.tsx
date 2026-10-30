"use client";

import { useEffect, useState } from "react";
import { OwnerShell, OwnerPill, fmtUSD } from "@/components/OwnerShell";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/format";

type Claim = {
  id: string; voyage_id: string | null; counterparty: string | null; amount: number; status: string;
  issued_at: string | null; due_at: string | null; settled_amount: number | null; notes: string | null;
};
type Voyage = { id: string; vessel_name: string; load_port: string | null; discharge_port: string | null };

export default function OwnerClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [voyages, setVoyages] = useState<Record<string, Voyage>>({});

  useEffect(() => {
    const sb = supabase();
    sb.from("owner_claims").select("*").order("created_at", { ascending: false }).then(({ data }) => setClaims((data as Claim[]) ?? []));
    sb.from("voyages").select("id,vessel_name,load_port,discharge_port").then(({ data }) => {
      const map: Record<string, Voyage> = {};
      for (const v of (data as Voyage[]) ?? []) map[v.id] = v;
      setVoyages(map);
    });
  }, []);

  const total = claims.reduce((s, c) => s + Number(c.status === "settled" ? c.settled_amount ?? c.amount : c.amount), 0);

  return (
    <OwnerShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">Demurrage claims</h1>
          <p className="mt-1 text-sm text-muted">Drafted from the laytime statement, issued with the SOF bundle, tracked to settlement.</p>
        </div>
        <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-xs">
          {fmtUSD(total)} across {claims.length} claims
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {claims.map((c) => {
          const v = c.voyage_id ? voyages[c.voyage_id] : undefined;
          return (
            <div key={c.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-display text-base font-semibold">
                    {v ? `${v.vessel_name} · ${v.load_port} → ${v.discharge_port}` : c.counterparty}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">vs {c.counterparty}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-semibold text-accent">
                    {fmtUSD(Number(c.status === "settled" ? c.settled_amount ?? c.amount : c.amount))}
                  </span>
                  <OwnerPill status={c.status} />
                </div>
              </div>
              {c.notes && <p className="mt-3 text-sm leading-relaxed text-muted">{c.notes}</p>}
              <div className="mt-3 flex gap-5 font-mono text-[11px] text-muted">
                <span>Issued {c.issued_at ? formatDate(c.issued_at) : "—"}</span>
                <span>Due {c.due_at ? formatDate(c.due_at) : "—"}</span>
                {c.status === "settled" && c.settled_amount && (
                  <span className="text-accent">
                    settled at {Math.round((Number(c.settled_amount) / Number(c.amount)) * 100)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </OwnerShell>
  );
}
