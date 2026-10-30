import { NextResponse } from "next/server";
import { freeTimeAlert, disputableInvoice } from "@/lib/emails";

// Sends an alert email via Resend. Needs RESEND_API_KEY in the environment;
// without a verified sending domain, Resend only delivers to the account
// owner's own address from onboarding@resend.dev — fine for testing.

export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "alerts_not_configured", hint: "Set RESEND_API_KEY (resend.com → API Keys)." },
      { status: 501 }
    );
  }
  let body: { to?: string; template?: string; params?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { to, template, params } = body;
  if (!to || !template) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

  let email: { subject: string; html: string };
  if (template === "free_time_alert") email = freeTimeAlert(params as Parameters<typeof freeTimeAlert>[0]);
  else if (template === "disputable_invoice") email = disputableInvoice(params as Parameters<typeof disputableInvoice>[0]);
  else return NextResponse.json({ error: "unknown_template" }, { status: 400 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ALERT_FROM ?? "Marevo <onboarding@resend.dev>",
      to: [to],
      subject: email.subject,
      html: email.html,
    }),
  });
  const out = await res.json();
  if (!res.ok) return NextResponse.json({ error: "resend_error", detail: out }, { status: 502 });
  return NextResponse.json({ sent: true, id: out.id });
}
