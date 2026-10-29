"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@meridian.app");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/app");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-cyan/60">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan glow-cyan" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Meridian</span>
        </Link>
        <form onSubmit={signIn} className="glass-panel rounded-2xl p-8">
          <h1 className="font-display text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-mist">Operations console</p>
          <label className="mt-6 block text-xs text-mist">Email</label>
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
            Demo: demo@meridian.app · MeridianDemo2026!
          </p>
        </form>
      </div>
    </div>
  );
}
