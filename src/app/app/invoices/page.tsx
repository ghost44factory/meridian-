"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/format";

type Invoice = {
  id: string; invoice_no: string; carrier: string; amount: number; disputable_amount: number;
  audit_status: string; issued_at: string | null; shipment_id: string | null;
  shipments?: { container_no: string } | null;
};

const TABS = [
  { key: "disputable", label: "Disputable" },
  { key: "needs_review", label: "Needs review" },
  { key: "clean", label: "Clean" },
  { key: "approved", label: "Approved" },
] as const;

export default function InvoicesPage() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [tab, setTab] = useState<string>("disputable");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase()
      .from("invoices")
      .select("*, shipments(container_no)")
      .order("issued_at", { ascending: false })
      .then(({ data }) => {
        setRows((data as Invoice[]) ?? []);
        setLoading(false);
      });
  }, []);

  const current = rows.filter((r) => r.audit_status === tab);

  return (
    <AppShell>
      <h1 className="font-display text-xl font-semibold">Invoice reconciliation</h1>
      <p className="mt-1 text-sm text-mist">Every charge audited against contract terms and terminal records.</p>

      <div className="mt-5 flex gap-2">
        {TABS.map((t) => {
          const count = rows.filter((r) => r.audit_status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-4 py-1.5 text-xs transition ${
                tab === t.key
                  ? "border-cyan bg-cyan/15 text-cyan"
                  : "border-white/15 bg-white/5 text-mist hover:bg-white/10"
              }`}
            >
              {t.label} <span className="ml-1 font-mono">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loading && <div className="text-sm text-mist">Loading…</div>}
        {!loading && current.length === 0 && (
          <div className="text-sm text-mist">No invoices in this lane.</div>
        )}
        {current.map((i) => (
          <Link
            key={i.id}
            href={`/app/invoices/${i.id}`}
            className="rounded-xl border border-panel-border p-4 transition hover:border-cyan/40"
            style={{ background: "#101b30" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-wider text-mist">{i.carrier}</div>
                <div className="mt-0.5 font-mono text-sm">{i.invoice_no}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base">{formatCurrency(i.amount)}</div>
                {Number(i.disputable_amount) > 0 && (
                  <div className="font-mono text-xs text-coral">-{formatCurrency(i.disputable_amount)} disputable</div>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-mist">
              <span className="font-mono">{i.shipments?.container_no ?? "—"}</span>
              <span>{formatDate(i.issued_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
