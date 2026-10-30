"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell, Panel } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/format";

type Org = { id: string; name: string };
type Row = { org_id: string; audit_status?: string; status?: string; amount_recovered?: number; disputable_amount?: number };

export default function AdminConsole() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [disputes, setDisputes] = useState<Row[]>([]);
  const [shipments, setShipments] = useState<Row[]>([]);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const sb = supabase();
    sb.from("profiles").select("is_staff").maybeSingle().then(({ data }) => {
      const staff = (data as { is_staff: boolean } | null)?.is_staff ?? false;
      setAllowed(staff);
      if (!staff) {
        router.replace("/app");
        return;
      }
      sb.from("orgs").select("id,name").then(({ data }) => setOrgs((data as Org[]) ?? []));
      sb.from("invoices").select("org_id,audit_status,disputable_amount").then(({ data }) => setInvoices((data as Row[]) ?? []));
      sb.from("disputes").select("org_id,status,amount_recovered").then(({ data }) => setDisputes((data as Row[]) ?? []));
      sb.from("shipments").select("org_id,status").then(({ data }) => setShipments((data as Row[]) ?? []));
    });
  }, [router]);

  if (allowed === null)
    return (
      <AppShell>
        <div className="py-20 text-center font-display font-semibold text-xs uppercase tracking-[0.2em] text-mist">Checking access…</div>
      </AppShell>
    );
  if (!allowed) return null;

  const totalRecovered = disputes.reduce((a, d) => a + Number(d.amount_recovered ?? 0), 0);
  const openDisputable = invoices.filter((i) => i.audit_status === "disputable");

  return (
    <AppShell>
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl font-semibold">Admin console</h1>
        <span className="rounded-full bg-amber/15 px-2.5 py-1 font-display font-semibold text-[10px] uppercase tracking-[0.14em] text-amber">
          Staff only
        </span>
      </div>
      <p className="mt-1 text-sm text-mist">
        Cross-customer operations view — the managed-tier workbench.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Customers" value={String(orgs.length)} />
        <Kpi label="Active shipments" value={String(shipments.filter((s) => s.status !== "closed").length)} />
        <Kpi label="Disputable queue" value={String(openDisputable.length)} tone="var(--warn)" />
        <Kpi label="Recovered (all-time)" value={formatCurrency(totalRecovered)} tone="var(--accent)" />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-panel-border" style={{ background: "var(--surface)" }}>
        <div className="border-b border-border px-5 py-3.5 text-sm font-semibold">Customers</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left font-display font-semibold text-[10px] uppercase tracking-[0.14em] text-mist">
              <th className="px-5 py-3 font-normal">Organisation</th>
              <th className="px-5 py-3 font-normal">Active shipments</th>
              <th className="px-5 py-3 font-normal">Disputable invoices</th>
              <th className="px-5 py-3 font-normal">£ at stake</th>
              <th className="px-5 py-3 font-normal">Open disputes</th>
              <th className="px-5 py-3 font-normal">£ recovered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orgs.map((o) => {
              const inv = invoices.filter((i) => i.org_id === o.id);
              const disp = disputes.filter((d) => d.org_id === o.id);
              const atStake = inv
                .filter((i) => i.audit_status === "disputable")
                .reduce((a, i) => a + Number(i.disputable_amount ?? 0), 0);
              return (
                <tr key={o.id} className="hover:bg-surface-2/60">
                  <td className="px-5 py-3 font-medium">{o.name}</td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {shipments.filter((s) => s.org_id === o.id && s.status !== "closed").length}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {inv.filter((i) => i.audit_status === "disputable").length}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-coral">{formatCurrency(atStake)}</td>
                  <td className="px-5 py-3 font-mono text-xs">
                    {disp.filter((d) => !String(d.status).startsWith("resolved")).length}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-cyan">
                    {formatCurrency(disp.reduce((a, d) => a + Number(d.amount_recovered ?? 0), 0))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-mist">
        Next build: per-customer drill-down, run-extraction actions, audit approval queue, and the
        retro-audit intake pipeline — this console becomes the managed-tier workbench.{" "}
        <Link href="/app" className="text-cyan hover:underline">Back to customer view →</Link>
      </p>
    </AppShell>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-panel-border p-4" style={{ background: "var(--surface)" }}>
      <div className="text-xs text-mist">{label}</div>
      <div className="mt-2 font-mono text-2xl font-medium" style={{ color: tone ?? "var(--fg)" }}>
        {value}
      </div>
    </div>
  );
}
