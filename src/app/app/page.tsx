"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, Panel, StatusPill } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { formatCurrency, daysLeft, STATUS_LABELS } from "@/lib/format";

type Shipment = { id: string; container_no: string; carrier: string; destination_port: string; free_time_days: number; clock_start_at: string | null; status: string };
type Invoice = { id: string; invoice_no: string; carrier: string; amount: number; disputable_amount: number; audit_status: string };
type Dispute = { id: string; status: string; amount_claimed: number; amount_recovered: number; deadline_at: string | null };

export default function Overview() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = supabase();
    Promise.all([
      sb.from("shipments").select("id,container_no,carrier,destination_port,free_time_days,clock_start_at,status"),
      sb.from("invoices").select("id,invoice_no,carrier,amount,disputable_amount,audit_status"),
      sb.from("disputes").select("id,status,amount_claimed,amount_recovered,deadline_at"),
    ]).then(([s, i, d]) => {
      setShipments((s.data as Shipment[]) ?? []);
      setInvoices((i.data as Invoice[]) ?? []);
      setDisputes((d.data as Dispute[]) ?? []);
      setLoading(false);
    });
  }, []);

  const inTransit = shipments.filter((s) => s.status === "in_transit").length;
  const atRisk = shipments.filter((s) => ["at_risk", "in_demurrage"].includes(s.status));
  const exposure =
    invoices.filter((i) => i.audit_status === "disputable").reduce((a, i) => a + Number(i.disputable_amount), 0) +
    atRisk.length * 150;
  const recovered = disputes.reduce((a, d) => a + Number(d.amount_recovered), 0);
  const inFlight = disputes.filter((d) => !d.status.startsWith("resolved")).length;
  const disputable = invoices.filter((i) => i.audit_status === "disputable");

  return (
    <AppShell>
      <h1 className="font-display text-xl font-semibold">Portfolio overview</h1>
      <p className="mt-1 text-sm text-mist">
        {shipments.length} shipments · {invoices.length} invoices · live
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Containers in transit" value={loading ? "—" : String(inTransit)} />
        <Kpi label="At risk" value={loading ? "—" : String(atRisk.length)} tone="#f2a93c" />
        <Kpi label="£ exposure" value={loading ? "—" : formatCurrency(exposure)} tone="#ff5a5f" />
        <Kpi label="£ recovered" value={loading ? "—" : formatCurrency(recovered)} tone="#4cd9e0" />
        <Kpi label="Disputes in flight" value={loading ? "—" : String(inFlight)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel className="overflow-hidden">
          <div className="border-b border-white/8 px-5 py-3.5 text-sm font-semibold">Needs action</div>
          <div className="divide-y divide-white/5">
            {atRisk
              .sort((a, b) => (daysLeft(a.clock_start_at, a.free_time_days) ?? 99) - (daysLeft(b.clock_start_at, b.free_time_days) ?? 99))
              .slice(0, 6)
              .map((s) => {
                const d = daysLeft(s.clock_start_at, s.free_time_days);
                return (
                  <Link key={s.id} href={`/app/shipments/${s.id}`} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-white/[0.03]">
                    <div>
                      <span className="font-mono text-[13px]">{s.container_no}</span>
                      <span className="ml-3 text-xs text-mist">{s.carrier} → {s.destination_port}</span>
                    </div>
                    <span className="font-mono text-xs" style={{ color: d !== null && d < 0 ? "#ff5a5f" : "#f2a93c" }}>
                      {d === null ? "—" : d < 0 ? `${Math.abs(d)}d over` : `${d}d left`}
                    </span>
                  </Link>
                );
              })}
            {disputable.slice(0, 3).map((i) => (
              <Link key={i.id} href={`/app/invoices/${i.id}`} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-white/[0.03]">
                <div>
                  <span className="font-mono text-[13px]">{i.invoice_no}</span>
                  <span className="ml-3 text-xs text-mist">{i.carrier} · awaiting decision</span>
                </div>
                <span className="font-mono text-xs text-coral">-{formatCurrency(i.disputable_amount)}</span>
              </Link>
            ))}
            {!loading && atRisk.length === 0 && disputable.length === 0 && (
              <div className="px-5 py-6 text-sm text-mist">Nothing needs action right now.</div>
            )}
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="border-b border-white/8 px-5 py-3.5 text-sm font-semibold">Disputes</div>
          <div className="divide-y divide-white/5">
            {disputes.slice(0, 8).map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <StatusPill status={d.status} label={STATUS_LABELS[d.status] ?? d.status} />
                <span className="font-mono text-xs text-mist">
                  claimed {formatCurrency(d.amount_claimed)}
                  {Number(d.amount_recovered) > 0 && (
                    <span className="ml-2 text-cyan">won {formatCurrency(d.amount_recovered)}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <Link href="/app/disputes" className="block border-t border-white/8 px-5 py-3 text-xs text-cyan hover:bg-white/[0.03]">
            Open dispute pipeline →
          </Link>
        </Panel>
      </div>
    </AppShell>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-panel-border p-4" style={{ background: "#101b30" }}>
      <div className="text-xs text-mist">{label}</div>
      <div className="mt-2 font-mono text-2xl font-medium" style={{ color: tone ?? "#eaf1f7" }}>
        {value}
      </div>
    </div>
  );
}
