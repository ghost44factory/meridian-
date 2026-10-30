"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell, Panel, StatusPill } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/format";
import { Upload } from "lucide-react";

type Doc = { id: string; type: string; file_path: string | null; uploaded_at: string; extraction_status: string; confidence: number | null };
type Contract = { id: string; carrier: string; valid_from: string | null; valid_to: string | null; free_time_days: number; demurrage_rate_tiers: { days: string; rate: number }[]; notes: string | null };

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tab, setTab] = useState<"documents" | "contracts">("documents");
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    const sb = supabase();
    sb.from("documents").select("*").order("uploaded_at", { ascending: false }).then(({ data }) => setDocs((data as Doc[]) ?? []));
    sb.from("contracts").select("*").then(({ data }) => setContracts((data as Contract[]) ?? []));
  }

  async function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setNotice(null);
    const sb = supabase();
    const { data: profile } = await sb.from("profiles").select("org_id").maybeSingle();
    const orgId = (profile as { org_id: string } | null)?.org_id;
    if (!orgId) {
      setNotice("Could not resolve organisation.");
      setUploading(false);
      return;
    }
    for (const file of Array.from(files)) {
      const path = `${orgId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await sb.storage.from("documents").upload(path, file);
      if (upErr) {
        setNotice(`Upload failed: ${upErr.message}`);
        continue;
      }
      const lower = file.name.toLowerCase();
      const type = lower.includes("invoice") ? "invoice"
        : lower.includes("lading") || /(^|[^a-z])bl([^a-z]|$)/.test(lower) ? "bl"
        : lower.includes("contract") ? "contract"
        : lower.includes("booking") ? "booking"
        : lower.includes("arrival") ? "arrival_notice"
        : "invoice";
      await sb.from("documents").insert({
        org_id: orgId,
        type,
        file_path: path,
        extraction_status: "pending",
      });
    }
    setUploading(false);
    setNotice("Uploaded — hit Extract to run the AI over it.");
    load();
  }

  function toBase64(buf: ArrayBuffer) {
    const bytes = new Uint8Array(buf);
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin);
  }

  const DOC_TYPE_MAP: Record<string, string> = {
    bl: "bill_of_lading", bill_of_lading: "bill_of_lading", contract: "contract",
    booking: "booking", arrival_notice: "arrival_notice", invoice: "invoice",
  };

  async function runExtraction(d: Doc) {
    if (!d.file_path || extracting) return;
    setExtracting(d.id);
    setNotice(null);
    try {
      const sb = supabase();
      const { data: blob, error } = await sb.storage.from("documents").download(d.file_path);
      if (error || !blob) {
        setNotice(`Could not read the file: ${error?.message ?? "not found"}`);
        return;
      }
      const mediaType = blob.type || (d.file_path.endsWith(".pdf") ? "application/pdf" : "image/png");
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          docType: DOC_TYPE_MAP[d.type] ?? "invoice",
          fileBase64: toBase64(await blob.arrayBuffer()),
          mediaType,
        }),
      });
      const out = await res.json();
      if (!res.ok) {
        setNotice(`Extraction failed: ${out.error ?? res.status}`);
        return;
      }
      await sb
        .from("documents")
        .update({ extracted_fields: out.fields, confidence: out.confidence, extraction_status: "needs_review" })
        .eq("id", d.id);
      setNotice(`Extracted at ${Math.round(out.confidence * 100)}% confidence — verify it in the Review Queue.`);
      load();
    } finally {
      setExtracting(null);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold">Document vault</h1>
          <p className="mt-1 text-sm text-mist">Invoices, BLs, bookings and carrier contracts.</p>
        </div>
        <div className="flex gap-2">
          {(["documents", "contracts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-1.5 text-xs capitalize transition ${
                tab === t ? "border-cyan bg-cyan/15 text-cyan" : "border-border bg-surface-2 text-mist hover:bg-surface-2"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "documents" && (
        <>
          <div
            onClick={() => fileRef.current?.click()}
            className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2/60 py-10 transition hover:border-cyan/50"
          >
            <Upload className="h-6 w-6 text-mist" />
            <div className="mt-2 text-sm text-paper/90">{uploading ? "Uploading…" : "Drop files or click to upload"}</div>
            <div className="mt-1 text-xs text-mist">Invoices · bills of lading · booking confirmations · contracts</div>
            <input ref={fileRef} type="file" multiple hidden onChange={(e) => onUpload(e.target.files)} />
          </div>
          {notice && <div className="mt-3 text-xs text-amber">{notice}</div>}

          <div className="mt-5 overflow-x-auto rounded-xl border border-panel-border" style={{ background: "var(--surface)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left font-display font-semibold text-[10px] uppercase tracking-[0.14em] text-mist">
                  <th className="px-4 py-3 font-normal">File</th>
                  <th className="px-4 py-3 font-normal">Type</th>
                  <th className="px-4 py-3 font-normal">Uploaded</th>
                  <th className="px-4 py-3 font-normal">Extraction</th>
                  <th className="px-4 py-3 font-normal">Confidence</th>
                  <th className="px-4 py-3 font-normal"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-2/60">
                    <td className="max-w-xs truncate px-4 py-3 font-mono text-xs">{d.file_path?.split("/").pop() ?? "—"}</td>
                    <td className="px-4 py-3 capitalize text-mist">{d.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mist">{formatDate(d.uploaded_at)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={d.extraction_status} label={d.extraction_status.replace("_", " ")} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-mist">
                      {d.confidence ? `${Math.round(Number(d.confidence) * 100)}%` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {d.file_path && (d.extraction_status === "pending" || d.extraction_status === "failed") && (
                        <button
                          onClick={() => runExtraction(d)}
                          disabled={!!extracting}
                          className="rounded-full bg-cyan px-3.5 py-1.5 text-xs font-semibold text-navy transition hover:brightness-110 disabled:opacity-50"
                        >
                          {extracting === d.id ? "Extracting…" : "Extract"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "contracts" && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {contracts.map((c) => (
            <Panel key={c.id} className="p-5">
              <div className="flex items-center justify-between">
                <div className="font-display text-base font-semibold">{c.carrier}</div>
                <span className="font-mono text-xs text-mist">
                  {formatDate(c.valid_from)} – {formatDate(c.valid_to)}
                </span>
              </div>
              <div className="mt-3 text-sm">
                Free time: <span className="font-mono text-cyan">{c.free_time_days} days</span>
              </div>
              <div className="mt-2 space-y-1">
                {(c.demurrage_rate_tiers ?? []).map((t, i) => (
                  <div key={i} className="flex justify-between text-xs text-mist">
                    <span>Days {t.days}</span>
                    <span className="font-mono">${t.rate}/day</span>
                  </div>
                ))}
              </div>
              {c.notes && <div className="mt-3 border-t border-border pt-3 text-xs text-mist">{c.notes}</div>}
            </Panel>
          ))}
        </div>
      )}
    </AppShell>
  );
}
