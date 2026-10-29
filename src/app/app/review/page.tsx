"use client";

import { useEffect, useState } from "react";
import { AppShell, Panel } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type Doc = {
  id: string; type: string; file_path: string | null;
  extracted_fields: Record<string, string> | null; confidence: number | null;
};

export default function ReviewPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    supabase()
      .from("documents")
      .select("*")
      .eq("extraction_status", "needs_review")
      .then(({ data }) => {
        setDocs((data as Doc[]) ?? []);
        setLoading(false);
      });
  }

  async function setField(docId: string, key: string, value: string) {
    setDocs((ds) => ds.map((d) => (d.id === docId ? { ...d, extracted_fields: { ...(d.extracted_fields ?? {}), [key]: value } } : d)));
  }

  async function act(doc: Doc, status: "confirmed" | "pending") {
    await supabase()
      .from("documents")
      .update({ extraction_status: status, extracted_fields: doc.extracted_fields })
      .eq("id", doc.id);
    load();
  }

  return (
    <AppShell>
      <h1 className="font-display text-xl font-semibold">Review queue</h1>
      <p className="mt-1 text-sm text-mist">
        Low-confidence extractions. Confirm or correct the fields — corrections train the pipeline.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {loading && <div className="text-sm text-mist">Loading…</div>}
        {!loading && docs.length === 0 && (
          <div className="text-sm text-mist">Queue clear — nothing needs review.</div>
        )}
        {docs.map((doc) => (
          <Panel key={doc.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="max-w-[60%] truncate font-mono text-xs">{doc.file_path?.split("/").pop()}</div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber">
                {doc.confidence ? `${Math.round(Number(doc.confidence) * 100)}% confidence` : "unscored"}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {Object.entries(doc.extracted_fields ?? {}).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  <label className="w-32 shrink-0 font-mono text-[10px] uppercase tracking-wider text-mist">
                    {k.replace(/_/g, " ")}
                  </label>
                  <input
                    value={String(v)}
                    onChange={(e) => setField(doc.id, k, e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5 font-mono text-xs outline-none focus:border-cyan"
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => act(doc, "confirmed")}
                className="rounded-full bg-cyan px-4 py-2 text-xs font-semibold text-navy hover:brightness-110"
              >
                Confirm
              </button>
              <button
                onClick={() => act(doc, "pending")}
                className="rounded-full border border-border bg-surface-2 px-4 py-2 text-xs hover:bg-surface-2"
              >
                Re-queue
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
