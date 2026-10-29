import { NextResponse } from "next/server";

/**
 * Document extraction endpoint — wiring point for the Claude vision pipeline.
 *
 * Next build: receives { documentId }, fetches the file from Supabase Storage,
 * sends it to the Anthropic API with a per-document-type JSON schema, writes
 * extracted_fields + confidence back to the documents row, and (for invoices)
 * runs lib/audit-engine.ts against the matching contract + shipment to set
 * audit_status and audit_findings.
 */
export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error: "extraction_not_configured",
        message:
          "ANTHROPIC_API_KEY is not set. Add it to the environment to enable AI extraction.",
      },
      { status: 501 }
    );
  }
  return NextResponse.json(
    { error: "not_implemented", message: "Extraction pipeline ships in the next build." },
    { status: 501 }
  );
}
