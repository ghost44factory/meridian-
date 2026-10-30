"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/format";

type Dispute = {
  id: string; status: string; amount_claimed: number; amount_recovered: number;
  deadline_at: string | null; letter_text: string | null; evidence_notes: string | null;
  invoices?: { invoice_no: string; carrier: string } | null;
};

const COLUMNS = [
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "offer", label: "Offer" },
  { key: "resolved", label: "Resolved" },
] as const;

export default function DisputesPage() {
  const [rows, setRows] = useState<Dispute[]>([]);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [recoveredInput, setRecoveredInput] = useState("");

  useEffect(() => {
    load();
  }, []);

  function load() {
    supabase()
      .from("disputes")
      .select("*, invoices(invoice_no,carrier)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as Dispute[]) ?? []));
  }

  function colOf(d: Dispute) {
    return d.status.startsWith("resolved") ? "resolved" : d.status;
  }

  async function moveTo(col: string) {
    if (!dragId || col === "resolved") return;
    setRows((rs) => rs.map((r) => (r.id === dragId ? { ...r, status: col } : r)));
    await supabase().from("disputes").update({ status: col }).eq("id", dragId);
    setDragId(null);
  }

  async function resolve(won: boolean) {
    if (!selected) return;
    const recovered = won ? Number(recoveredInput || selected.amount_claimed) : 0;
    await supabase()
      .from("disputes")
      .update({
        status: won ? "resolved_won" : "resolved_lost",
        amount_recovered: recovered,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    setSelected(null);
    setRecoveredInput("");
    load();
  }

  async function saveLetter() {
    if (!selected) return;
    await supabase().from("disputes").update({ letter_text: selected.letter_text }).eq("id", selected.id);
    load();
  }

  return (
    <AppShell>
      <h1 className="font-display text-xl font-semibold">Dispute pipeline</h1>
      <p className="mt-1 text-sm text-mist">Drag cards between stages. Click a card to open it.</p>

      <div className="mt-5 grid grid-cols-5 gap-3">
        {COLUMNS.map((col) => {
          const cards = rows.filter((r) => colOf(r) === col.key);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => moveTo(col.key)}
              className="rounded-xl border border-panel-border p-3"
              style={{ background: "var(--surface-2)" }}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="font-display font-semibold text-[10px] uppercase tracking-[0.16em] text-mist">{col.label}</span>
                <span className="font-mono text-[10px] text-mist">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((d) => {
                  const days = d.deadline_at
                    ? Math.ceil((new Date(d.deadline_at).getTime() - Date.now()) / 86400000)
                    : null;
                  return (
                    <div
                      key={d.id}
                      draggable={col.key !== "resolved"}
                      onDragStart={() => setDragId(d.id)}
                      onClick={() => setSelected(d)}
                      className="cursor-pointer rounded-lg border border-border p-3 transition hover:border-cyan/40"
                      style={{ background: "var(--surface)" }}
                    >
                      <div className="font-mono text-xs">{d.invoices?.invoice_no ?? "Manual"}</div>
                      <div className="mt-0.5 text-[11px] text-mist">{d.invoices?.carrier ?? ""}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-mono text-xs text-paper">{formatCurrency(d.amount_claimed)}</span>
                        {col.key === "resolved" ? (
                          <span className={`font-mono text-[10px] ${d.status === "resolved_won" ? "text-cyan" : "text-coral"}`}>
                            {d.status === "resolved_won" ? `won ${formatCurrency(d.amount_recovered)}` : "lost"}
                          </span>
                        ) : (
                          days !== null && (
                            <span className={`font-mono text-[10px] ${days < 5 ? "text-coral" : "text-mist"}`}>
                              {days}d
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={() => setSelected(null)}>
          <div className="glass-panel max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display font-semibold text-[10px] uppercase tracking-[0.18em] text-cyan">Dispute</div>
                <h2 className="mt-1 font-mono text-lg font-semibold">{selected.invoices?.invoice_no ?? "Manual dispute"}</h2>
                <div className="text-xs text-mist">
                  {selected.invoices?.carrier} · deadline {formatDate(selected.deadline_at)} · claimed {formatCurrency(selected.amount_claimed)}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs hover:bg-surface-2">
                Close
              </button>
            </div>

            <label className="mt-5 block font-display font-semibold text-[10px] uppercase tracking-[0.18em] text-mist">Dispute letter</label>
            <textarea
              value={selected.letter_text ?? ""}
              onChange={(e) => setSelected({ ...selected, letter_text: e.target.value })}
              rows={12}
              className="mt-2 w-full rounded-xl border border-border bg-surface-2 p-4 font-mono text-xs leading-relaxed outline-none focus:border-cyan"
            />
            {selected.evidence_notes && (
              <div className="mt-2 text-[11px] text-mist">Evidence: {selected.evidence_notes}</div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button onClick={saveLetter} className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs hover:bg-surface-2">
                Save letter
              </button>
              {!selected.status.startsWith("resolved") && (
                <>
                  <div className="ml-auto flex items-center gap-2">
                    <input
                      value={recoveredInput}
                      onChange={(e) => setRecoveredInput(e.target.value)}
                      placeholder={`recovered £ (default ${Math.round(Number(selected.amount_claimed))})`}
                      className="w-44 rounded-full border border-border bg-surface-2 px-3 py-2 font-mono text-xs outline-none focus:border-cyan"
                    />
                    <button onClick={() => resolve(true)} className="rounded-full bg-cyan px-4 py-2 text-xs font-semibold text-navy hover:brightness-110">
                      Mark won
                    </button>
                    <button onClick={() => resolve(false)} className="rounded-full bg-coral/80 px-4 py-2 text-xs font-semibold text-white hover:brightness-110">
                      Mark lost
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
