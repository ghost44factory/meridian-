"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell, Panel, StatusPill } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, STATUS_LABELS } from "@/lib/format";

type Invoice = {
  id: string; org_id: string; invoice_no: string; carrier: string; amount: number;
  disputable_amount: number; audit_status: string; audit_findings: string | null;
  issued_at: string | null; line_items: { desc: string; amount: number }[];
  shipments?: { id: string; container_no: string; origin_port: string; destination_port: string; gate_out_at: string | null; discharged_at: string | null } | null;
};

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase()
      .from("invoices")
      .select("*, shipments(id,container_no,origin_port,destination_port,gate_out_at,discharged_at)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setInv(data as Invoice | null);
        setLoading(false);
      });
  }, [id]);

  async function setStatus(status: string) {
    setBusy(true);
    await supabase().from("invoices").update({ audit_status: status }).eq("id", id);
    router.push("/app/invoices");
  }

  async function generateDispute() {
    if (!inv) return;
    setBusy(true);
    const letter = `Re: Invoice ${inv.invoice_no}

Dear ${inv.carrier} billing dispute team,

We formally dispute the charges on the above invoice, dated ${formatDate(inv.issued_at)}, in the amount of ${formatCurrency(inv.amount)} covering container ${inv.shipments?.container_no ?? ""}.

Audit findings:
${inv.audit_findings ?? "See attached evidence pack."}

Claimed amount: ${formatCurrency(inv.disputable_amount)}.

Per 46 CFR Part 541 we request resolution within 30 days of this dispute. Please issue a corrected invoice or credit note.

Regards,
Northwind Logistics`;
    const deadline = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const { error } = await supabase().from("disputes").insert({
      org_id: inv.org_id,
      invoice_id: inv.id,
      status: "draft",
      amount_claimed: inv.disputable_amount,
      deadline_at: deadline,
      letter_text: letter,
      evidence_notes: "Attach: invoice copy, contract free-time clause, terminal gate log.",
    });
    if (!error) router.push("/app/disputes");
    else setBusy(false);
  }

  if (loading)
    return (
      <AppShell>
        <div className="py-20 text-center font-mono text-xs uppercase tracking-[0.3em] text-mist">Loading…</div>
      </AppShell>
    );
  if (!inv)
    return (
      <AppShell>
        <div className="py-20 text-center text-mist">Invoice not found.</div>
      </AppShell>
    );

  const disputable = Number(inv.disputable_amount) > 0 && inv.audit_status === "disputable";
  const items = Array.isArray(inv.line_items) ? inv.line_items : [];

  return (
    <AppShell>
      <Link href="/app/invoices" className="mb-4 inline-flex items-center gap-2 text-sm text-mist hover:text-paper">
        <ArrowLeft className="h-4 w-4" /> All invoices
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-mist">{inv.carrier}</div>
          <h1 className="font-mono text-2xl font-semibold">{inv.invoice_no}</h1>
          <div className="mt-1 text-sm text-mist">
            Issued {formatDate(inv.issued_at)} · container{" "}
            <span className="font-mono">{inv.shipments?.container_no ?? "—"}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-3xl font-semibold">{formatCurrency(inv.amount)}</div>
          {Number(inv.disputable_amount) > 0 && (
            <div className="font-mono text-sm text-coral">-{formatCurrency(inv.disputable_amount)} disputable</div>
          )}
          <div className="mt-2">
            <StatusPill status={inv.audit_status} label={STATUS_LABELS[inv.audit_status] ?? inv.audit_status} />
          </div>
        </div>
      </div>

      {inv.audit_findings && (
        <div
          className={`mt-6 rounded-xl border p-5 ${
            disputable ? "border-coral/40 bg-coral/5" : "border-cyan/30 bg-cyan/5"
          }`}
        >
          <div className={`font-mono text-[10px] uppercase tracking-[0.25em] ${disputable ? "text-coral" : "text-cyan"}`}>
            Audit findings
          </div>
          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-paper/90">{inv.audit_findings}</div>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <div className="text-sm font-semibold">Line items</div>
          <table className="mt-3 w-full text-sm">
            <tbody className="divide-y divide-border">
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="py-2.5 text-paper/90">{it.desc}</td>
                  <td className="py-2.5 text-right font-mono">{formatCurrency(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel className="p-5">
          <div className="text-sm font-semibold">Linked shipment</div>
          {inv.shipments ? (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-mist">Container</span><span className="font-mono">{inv.shipments.container_no}</span></div>
              <div className="flex justify-between"><span className="text-mist">Lane</span><span>{inv.shipments.origin_port} → {inv.shipments.destination_port}</span></div>
              <div className="flex justify-between"><span className="text-mist">Discharged</span><span className="font-mono">{formatDate(inv.shipments.discharged_at)}</span></div>
              <div className="flex justify-between"><span className="text-mist">Gate out</span><span className="font-mono">{formatDate(inv.shipments.gate_out_at)}</span></div>
              <Link href={`/app/shipments/${inv.shipments.id}`} className="mt-2 inline-block text-cyan hover:underline">
                Open shipment →
              </Link>
            </div>
          ) : (
            <div className="mt-3 text-xs text-mist">No shipment linked.</div>
          )}
        </Panel>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setStatus("approved")}
          disabled={busy}
          className="rounded-full bg-cyan px-5 py-2.5 text-sm font-semibold text-navy transition hover:brightness-110 disabled:opacity-50"
        >
          Approve &amp; close
        </button>
        <button
          onClick={() => setStatus("needs_review")}
          disabled={busy}
          className="rounded-full border border-border bg-surface-2 px-5 py-2.5 text-sm transition hover:bg-surface-2 disabled:opacity-50"
        >
          Send to review
        </button>
        {disputable && (
          <button
            onClick={generateDispute}
            disabled={busy}
            className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Drafting…" : "Generate dispute"}
          </button>
        )}
      </div>
    </AppShell>
  );
}
