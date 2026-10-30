"use client";

import { useEffect, useState } from "react";
import { AppShell, Panel } from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("—");
  const [email, setEmail] = useState("—");
  const [threshold, setThreshold] = useState(3);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "—"));
    sb.from("orgs").select("name").maybeSingle().then(({ data }) => {
      if (data) setOrgName((data as { name: string }).name);
    });
  }, []);

  return (
    <AppShell>
      <h1 className="font-display text-xl font-semibold">Settings</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
