"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package, Ship } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Portal = "cargo" | "owner";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-bg" />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [portal, setPortal] = useState<Portal>(params.get("portal") === "owner" ? "owner" : "cargo");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim()) {
      setError("Company name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    const sb = supabase();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          marevo_company: company.trim(),
          marevo_name: name.trim() || email.split("@")[0],
          marevo_portal: portal,
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push(portal === "owner" ? "/owner" : "/app");
      return;
    }
    setDone(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-cyan/60">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan glow-cyan" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Marevo</span>
        </Link>

        {done ? (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <h1 className="font-display text-xl font-semibold">Check your inbox</h1>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              We sent a confirmation link to <span className="font-mono text-paper">{email}</span>.
              Confirm it, then sign in — your workspace is ready.
            </p>
            <Link href="/app/login" className="mt-6 inline-block rounded-full bg-cyan px-6 py-2.5 text-sm font-semibold text-navy hover:brightness-110">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {([
                { key: "cargo" as Portal, icon: Package, title: "Cargo account", sub: "Dispute D&D on your containers" },
                { key: "owner" as Portal, icon: Ship, title: "Owner account", sub: "Issue voyage demurrage claims" },
              ]).map((p) => {
                const Icon = p.icon;
                const active = portal === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPortal(p.key)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active ? "border-cyan bg-cyan/10" : "border-border bg-surface hover:border-cyan/40"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-cyan" : "text-mist"}`} />
                    <div className={`mt-2 text-sm font-semibold ${active ? "text-cyan" : ""}`}>{p.title}</div>
                    <div className="mt-0.5 text-[11px] text-mist">{p.sub}</div>
                  </button>
                );
              })}
            </div>

            <form onSubmit={signUp} className="glass-panel rounded-2xl p-8">
              <h1 className="font-display text-xl font-semibold">Create your account</h1>
              <p className="mt-1 text-sm text-mist">
                {portal === "owner" ? "For vessel owners, operators and disponent owners." : "For importers, forwarders and BCOs."}
              </p>
              <label className="mt-6 block text-xs text-mist">Company</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={portal === "owner" ? "e.g. Northgate Tankers" : "e.g. Northwind Logistics"}
                className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-cyan"
              />
              <label className="mt-4 block text-xs text-mist">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-cyan"
                autoComplete="name"
              />
              <label className="mt-4 block text-xs text-mist">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm outline-none focus:border-cyan"
                autoComplete="email"
              />
              <label className="mt-4 block text-xs text-mist">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm outline-none focus:border-cyan"
                autoComplete="new-password"
              />
              {error && <div className="mt-3 text-xs text-coral">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-full bg-cyan py-2.5 text-sm font-semibold text-navy transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Creating…" : `Create ${portal === "owner" ? "owner" : "cargo"} account`}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-mist">
              Already have an account?{" "}
              <Link href="/app/login" className="font-semibold text-cyan hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
