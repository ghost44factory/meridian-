import { NextResponse } from "next/server";
import { extractDocument, ExtractError } from "@/lib/extract-core";

// AI document extraction. The client (authenticated under RLS) downloads the
// file from storage, sends it here as base64; we run vision extraction and
// return structured fields + confidence. The client writes results back to the
// DB under its own session. The Anthropic key never leaves the server.

export const maxDuration = 60;

export async function POST(req: Request) {
  let body: { docType?: string; fileBase64?: string; mediaType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { docType = "invoice", fileBase64, mediaType } = body;
  if (!fileBase64 || !mediaType) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  try {
    const { fields, confidence } = await extractDocument(docType, fileBase64, mediaType);
    return NextResponse.json({ fields, confidence });
  } catch (e) {
    if (e instanceof ExtractError) {
      return NextResponse.json({ error: e.code, detail: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "extract_failed" }, { status: 500 });
  }
}
