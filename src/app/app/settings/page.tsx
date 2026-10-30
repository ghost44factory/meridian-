"use client";

import { useEffect, useState } from "react";
import { AppShell, Panel } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("—");
  const [email, setEmail] = useState("—");
  const [threshold, setThreshold] = useState(3);
  const [inboundToken, setInboundToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "—"));
    sb.from("orgs").select("name,inbound_token").maybeSingle().then(({ data }) => {
      if (data) {
        setOrgName((data as { name: string }).name);
        setInboundToken((data as { inbound_token?: string }).inbound_token ?? null);
      }
    });
  }, []);

  const forwardAddress = inboundToken ? `docs-${inboundToken}@in.marevoapp.com` : null;

  async function copyAddress() {
    if (!forwardAddress) return;
    try {
      await navigator.clipboard.writeText(forwardAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <AppShell>
      <h1 className="font-display text-xl font-semibold">Settings</h1>

      <Panel className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold">Connect your inbox</div>
          <span className="rounded-full bg-cyan/15 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan">
            Your private intake address
          </span>
        </div>
        <p className="mt-2 text-sm text-mist">
          Auto-forward carrier emails here — demurrage invoices, arrival notices, BLs. Attachments are
          extracted by AI on arrival and land in your Review Queue, no uploading.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-sm text-cyan">
            {forwardAddress ?? "provisioning…"}
          </code>
          <button
            onClick={copyAddress}
            disabled={!forwardAddress}
            className="rounded-full bg-cyan px-4 py-2 text-xs font-semibold text-navy transition hover:brightness-110 disabled:opacity-50"
          >
            {copied ? "Copied ✓" : "Copy address"}
          </button>
        </div>
        <p className="mt-3 text-xs text-mist">
          Set a rule in Gmail/Outlook: from your carriers → auto-forward here. Read-only one-click
          inbox sync is on the roadmap; this address is live for your account today.
        </p>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="text-sm font-semibold">Organisation</div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-mist">Name</span><span>{orgName}</span></div>
            <div className="flex justify-between"><span className="text-mist">Signed in as</span><span className="font-mono text-xs">{email}</span></div>
            <div className="flex justify-between"><span className="text-mist">Plan</span><span className="text-cyan">Pilot</span></div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="text-sm font-semibold">Alert thresholds</div>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-mist">Warn when free time below</span>
              <span className="font-mono text-cyan">{threshold} days</span>
            </div>
            <input
              type="range"
              min={1}
              max={7}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-3 text-xs text-mist">
              Alert delivery channels (email / WhatsApp) are configured in the next build.
            </p>
          </div>
        </Panel>
        <Panel className="p-5 lg:col-span-2">
          <div className="text-sm font-semibold">Data &amp; billing</div>
          <p className="mt-2 text-xs leading-relaxed text-mist">
            Documents are stored encrypted in a private bucket isolated to your organisation. Row-level
            security enforces tenant isolation at the database layer. Billing: platform fee + success
            fee on recovered charges, invoiced monthly. Marevo never handles recovered funds —
            carriers credit you directly.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
