"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Ship, Scale, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/TopNav";

const NAV: { href: string; label: string; icon: React.ElementType }[] = [
  { href: "/owner", label: "Overview", icon: LayoutDashboard },
  { href: "/owner/voyages", label: "Voyages", icon: Ship },
  { href: "/owner/claims", label: "Claims", icon: Scale },
];

export function OwnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [orgName, setOrgName] = useState<string>("");

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/app/login");
        return;
      }
      setReady(true);
      const { data: profile } = await sb.from("profiles").select("org_id").maybeSingle();
      const orgId = (profile as { org_id: string } | null)?.org_id;
      if (orgId) {
        const { data: org } = await sb.from("orgs").select("name").eq("id", orgId).maybeSingle();
        setOrgName((org as { name: string } | null)?.name ?? "");
      }
    });
  }, [router]);

  async function signOut() {
    await supabase().auth.signOut();
    router.replace("/app/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-border bg-surface lg:flex">
        <Link href="/" className="px-5 py-5">
          <Logo />
        </Link>
        <div className="mx-3 mb-3 rounded-lg bg-accent-soft px-3 py-2 font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
          Vessel owner portal
        </div>
        <nav className="mt-1 flex-1 space-y-0.5 px-3">
          {NAV.map((item) => {
            const active = item.href === "/owner" ? pathname === "/owner" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-fg"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4 text-[11px] leading-relaxed text-muted">
          {orgName || "Owner account"}
          <br />
          Owner pilot
        </div>
      </aside>

      <div className="flex-1 lg:ml-56">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/85 px-6 py-3 backdrop-blur-xl">
          <div className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {orgName || "Owner account"}
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <button
              onClick={signOut}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-fg"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <nav className="sticky top-[57px] z-20 flex gap-1 overflow-x-auto border-b border-border bg-bg/95 px-3 py-2 backdrop-blur-xl lg:hidden">
          {NAV.map((item) => {
            const active = item.href === "/owner" ? pathname === "/owner" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                  active ? "bg-accent-soft text-accent" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function laytimeOverHours(allowed: number, used: number) {
  return Math.max(0, used - allowed);
}

export function voyageExposure(allowed: number, used: number, ratePerDay: number) {
  return (laytimeOverHours(allowed, used) / 24) * ratePerDay;
}

export function fmtUSD(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export const OWNER_STATUS: Record<string, { label: string; cls: string }> = {
  loading: { label: "Loading", cls: "bg-surface-2 text-muted" },
  discharging: { label: "Discharging", cls: "bg-surface-2 text-fg" },
  claim_ready: { label: "Claim ready", cls: "bg-accent-soft text-accent" },
  claimed: { label: "Claim issued", cls: "text-amber" },
  settled: { label: "Settled", cls: "bg-accent-soft text-accent" },
  draft: { label: "Draft", cls: "bg-surface-2 text-muted" },
  issued: { label: "Issued", cls: "text-amber" },
  acknowledged: { label: "Acknowledged", cls: "text-amber" },
  disputed: { label: "Disputed", cls: "text-coral" },
};

export function OwnerPill({ status }: { status: string }) {
  const s = OWNER_STATUS[status] ?? { label: status, cls: "bg-surface-2 text-muted" };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.1em] ${s.cls}`}>
      {s.label}
    </span>
  );
}
