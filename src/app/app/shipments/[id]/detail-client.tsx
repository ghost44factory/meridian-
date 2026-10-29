"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell, Panel, StatusPill } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, daysLeft, STATUS_LABELS } from "@/lib/format";

type Row = Record<string, unknown> & { id: string };

export function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [ship, setShip] = useState<Row | null>(null);
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [documents, setDocuments] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = supabase();
    Promise.all([
      sb.from("shipments").select("*").eq("id", id).maybeSingle(),
      sb.from("invoices").select("id,invoice_no,amount,audit_status,disputable_amount").eq("shipment_id", id),
      sb.from("documents").select("id,type,file_path,extraction_status").eq("shipment_id", id),
    ]).then(([s, i, d]) => {
      setShip(s.data as Row | null);
      setInvoices((i.data as Row[]) ?? []);
      setDocuments((d.data as Row[]) ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return (
      <AppShell>
        <div className="py-20 text-center font-mono text-xs uppercase tracking-[0.3em] text-mist">Loading…</div>
      </AppShell>
    );
  if (!ship)
    return (
      <AppShell>
        <div className="py-20 text-center text-mist">Shipment not found.</div>
      </AppShell>
    );

  const d = daysLeft(ship.clock_start_at as string | null, Number(ship.free_time_days), ship.gate_out_at as string | null);
  const milestones: [string, string | null][] = [
    ["Departed", ship.etd as string | null],
    ["Arrival", ship.eta as string | null],
    ["Discharged", ship.discharged_at as string | null],
    ["Gate out", ship.gate_out_at as string | null],
    ["Empty returned", ship.empty_returned_at as string | null],
  ];

  return (
    <AppShell>
      <Link href="/app/shipments" className="mb-4 inline-flex items-center gap-2 text-sm text-mist hover:text-paper">
        <ArrowLeft className="h-4 w-4" /> All shipments
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-mist">{String(ship.carrier)} · {String(ship.vessel_name ?? "")}</div>
          <h1 className="font-mono text-2xl font-semibold">{String(ship.container_no)}</h1>
          <div className="mt-1 text-sm text-mist">
            {String(ship.origin_port)} → {String(ship.destination_port)} · BL <span className="font-mono">{String(ship.bl_no ?? "—")}</span>
          </div>
        </div>
        <StatusPill status={String(ship.status)} label={STATUS_LABELS[String(ship.status)] ?? String(ship.status)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="p-5">
          <div className="text-sm font-semibold">Free time</div>
          <div
            className="mt-3 font-mono text-3xl font-semibold"
            style={{ color: d === null ? "var(--muted-fg)" : d < 0 ? "var(--danger)" : d <= 3 ? "var(--warn)" : "var(--accent)" }}
          >
            {d === null ? "—" : d < 0 ? `${Math.abs(d)}d over` : `${d}d left`}
          </div>
          <div className="mt-2 text-xs text-mist">
            {Number(ship.free_time_days)} contracted days · clock {ship.clock_start_at ? `started ${formatDate(ship.clock_start_at as string)}` : "not started"}
          </div>
          <div className="mt-6 space-y-3">
            {milestones.map(([label, when], i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className={`h-2 w-2 rounded-full ${when ? "bg-cyan" : "bg-surface-2"}`} />
                <span className={when ? "text-paper" : "text-mist/50"}>{label}</span>
                <span className="ml-auto font-mono text-xs text-mist">{formatDate(when)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="text-sm font-semibold">Invoices</div>
          <div className="mt-3 space-y-2">
            {invoices.length === 0 && <div className="text-xs text-mist">No invoices linked.</div>}
            {invoices.map((i) => (
              <Link
                key={i.id}
                href={`/app/invoices/${i.id}`}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm hover:bg-surface-2/60"
              >
                <span className="font-mono text-[13px]">{String(i.invoice_no)}</span>
                <span className="flex items-center gap-3">
                  <StatusPill status={String(i.audit_status)} label={STATUS_LABELS[String(i.audit_status)] ?? ""} />
                  <span className="font-mono text-xs">{formatCurrency(Number(i.amount))}</span>
                </span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="text-sm font-semibold">Documents</div>
          <div className="mt-3 space-y-2">
            {documents.length === 0 && <div className="text-xs text-mist">No documents linked.</div>}
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span className="capitalize text-paper/90">{String(doc.type)}</span>
                <StatusPill status={String(doc.extraction_status)} label={String(doc.extraction_status).replace("_", " ")} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
