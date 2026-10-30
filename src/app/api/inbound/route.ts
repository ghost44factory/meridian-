import { NextResponse } from "next/server";
import { extractDocument, docTypeFromFilename, ExtractError } from "@/lib/extract-core";

// Inbound email ingestion. Each org has a private forwarding address:
//   docs-<token>@in.marevoapp.com
// The email provider's inbound webhook POSTs here; we route by the token,
// run AI extraction on the first usable attachment, and file the document
// into the org's vault via a security-definer RPC (no service key needed).

export const maxDuration = 60;

type Attachment = { filename?: string; content?: string; content_type?: string; contentType?: string };

const USABLE = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

function tokenFromRecipients(addresses: string[]): string | null {
  for (const a of addresses) {
    const m = /docs-([a-z0-9]{6,})@/i.exec(a);
    if (m) return m[1].toLowerCase();
  }
  return null;
}

export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Accept Resend-style webhooks ({type, data:{...}}) and generic shapes.
  const data = (payload.data ?? payload) as {
    to?: string | string[];
    subject?: string;
    attachments?: Attachment[];
  };
  const to = Array.isArray(data.to) ? data.to : data.to ? [data.to] : [];
  const token = tokenFromRecipients(to);
  if (!token) {
    return NextResponse.json({ error: "no_routing_token", hint: "address must look like docs-<token>@…" }, { status: 400 });
  }

  const attachments = (data.attachments ?? []).filter((a) => {
    const t = (a.content_type ?? a.contentType ?? "").toLowerCase();
    return a.content && USABLE.includes(t);
  });
  if (attachments.length === 0) {
    return NextResponse.json({ error: "no_usable_attachment", accepted: USABLE }, { status: 422 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "storage_not_configured" }, { status: 501 });
  }

  const results: { filename: string; documentId?: string; confidence?: number; error?: string }[] = [];

  for (const att of attachments.slice(0, 5)) {
    const filename = att.filename ?? "attachment";
    const mediaType = (att.content_type ?? att.contentType ?? "application/pdf").toLowerCase();
    const docType = docTypeFromFilename(filename);
    let fields: Record<string, unknown> | null = null;
    let confidence: number | null = null;
    try {
      const out = await extractDocument(docType, att.content as string, mediaType);
      fields = out.fields;
      confidence = out.confidence;
    } catch (e) {
      // Extraction failing shouldn't lose the document — file it as pending.
      if (!(e instanceof ExtractError)) fields = null;
    }

    const rpc = await fetch(`${supabaseUrl}/rest/v1/rpc/ingest_inbound_document`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        p_token: token,
        p_filename: filename,
        p_doc_type: docType === "bill_of_lading" ? "bl" : docType,
        p_fields: fields,
        p_confidence: confidence,
      }),
    });

    if (!rpc.ok) {
      const detail = (await rpc.text()).slice(0, 200);
      results.push({ filename, error: `ingest_failed: ${detail}` });
      continue;
    }
    const documentId = (await rpc.json()) as string;
    results.push({ filename, documentId, confidence: confidence ?? undefined });
  }

  const ok = results.some((r) => r.documentId);
  return NextResponse.json({ ok, results }, { status: ok ? 200 : 502 });
}
