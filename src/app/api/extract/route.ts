import { NextResponse } from "next/server";

// AI document extraction. The client (authenticated under RLS) downloads the
// file from storage, sends it here as base64; we run vision extraction and
// return structured fields + confidence. The client writes results back to the
// DB under its own session. The Anthropic key never leaves the server.

export const maxDuration = 60;

const FIELD_SPECS: Record<string, string> = {
  invoice: `carrier (string), invoice_no (string), invoice_date (YYYY-MM-DD),
container_no (string), vessel (string|null), port (string),
charge_type ("demurrage"|"detention"|"both"|"other"), currency (3-letter code),
amount (number, total), rate_per_day (number|null), days_billed (number|null),
free_time_days (number|null), period_start (YYYY-MM-DD|null), period_end (YYYY-MM-DD|null)`,
  bill_of_lading: `bl_no (string), carrier (string), vessel (string), voyage (string|null),
containers (array of container numbers), port_of_loading (string), port_of_discharge (string),
etd (YYYY-MM-DD|null), eta (YYYY-MM-DD|null), shipper (string|null), consignee (string|null),
cargo_description (string|null), gross_weight (string|null)`,
  contract: `carrier (string), valid_from (YYYY-MM-DD|null), valid_to (YYYY-MM-DD|null),
free_time_days (number), demurrage_rate_tiers (array of {days, rate_per_day, currency}),
weekend_excluded (boolean|null), holiday_excluded (boolean|null), notes (string|null)`,
  booking: `booking_no (string), carrier (string), vessel (string|null), voyage (string|null),
containers (array|null), port_of_loading (string|null), port_of_discharge (string|null),
etd (YYYY-MM-DD|null), eta (YYYY-MM-DD|null), cargo_cutoff (YYYY-MM-DD|null)`,
  arrival_notice: `carrier (string), vessel (string|null), container_no (string|null),
port_of_discharge (string), arrival_date (YYYY-MM-DD|null), free_time_start (YYYY-MM-DD|null),
last_free_day (YYYY-MM-DD|null)`,
};

function prompt(docType: string) {
  const spec = FIELD_SPECS[docType] ?? FIELD_SPECS.invoice;
  return `You are the extraction engine of a freight-audit platform. Extract data from this ${docType.replace(/_/g, " ")} document.

Return ONLY a JSON object, no prose, with exactly these fields (null when absent):
${spec}

Plus: confidence (number 0-1, your overall confidence that every extracted value is exactly what the document states — dates and amounts matter most; be honest, use <0.8 if anything is unclear or illegible).

Rules: never guess a number or date that is not visibly present; prefer null. Copy identifiers (container, BL, invoice numbers) character-for-character.`;
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "extraction_not_configured" }, { status: 501 });
  }
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

  const fileBlock =
    mediaType === "application/pdf"
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: fileBase64 } }
      : { type: "image", source: { type: "base64", media_type: mediaType, data: fileBase64 } };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: [fileBlock, { type: "text", text: prompt(docType) }] }],
    }),
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    return NextResponse.json({ error: "anthropic_error", detail }, { status: 502 });
  }

  const data = await res.json();
  const text: string =
    data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return NextResponse.json({ error: "parse_failed" }, { status: 502 });
  }
  const { confidence = 0.7, ...fields } = parsed;
  return NextResponse.json({ fields, confidence });
}
