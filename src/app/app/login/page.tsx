"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Ship } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Portal = "cargo" | "owner";

export default function LoginPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<Portal>("cargo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = supabase();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Route by the account's portal type, not the tab the user happened to pick.
    const { data: profile } = await sb.from("profiles").select("portal").maybeSingle();
    const dest = (profile as { portal?: string } | null)?.portal === "owner" ? "/owner" : "/app";
    router.push(dest);
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

        {/* Portal picker */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          {([
            { key: "cargo" as Portal, icon: Package, title: "Cargo portal", sub: "Importers & forwarders" },
            { key: "owner" as Portal, icon: Ship, title: "Owner portal", sub: "Vessel owners & operators" },
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

        <form onSubmit={signIn} className="glass-panel rounded-2xl p-8">
          <h1 className="font-display text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-mist">
            {portal === "owner" ? "Fleet demurrage console" : "Container recovery console"}
          </p>
          <label className="mt-6 block text-xs text-mist">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={portal === "owner" ? "owner@marevo.app" : "demo@marevo.app"}
            className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm outline-none focus:border-cyan"
            autoComplete="email"
          />
          <label className="mt-4 block text-xs text-mist">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm outline-none focus:border-cyan"
            autoComplete="current-password"
          />
          {error && <div className="mt-3 text-xs text-coral">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-cyan py-2.5 text-sm font-semibold text-navy transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-4 text-center text-[11px] text-mist/70">
            {portal === "owner"
              ? "Demo: owner@marevo.app · MarevoOwner2026"
              : "Demo: demo@marevo.app · MarevoDemo2026!"}
          </p>
        </form>

        <p className="mt-5 text-center text-sm text-mist">
          New to Marevo?{" "}
          <Link href={`/app/signup?portal=${portal}`} className="font-semibold text-cyan hover:underline">
            Create a {portal === "owner" ? "vessel owner" : "cargo"} account
          </Link>
        </p>
      </div>
    </div>
  );
}
