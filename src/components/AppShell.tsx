"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Ship, Map, FileText, Scale, FolderOpen, ClipboardCheck, Settings, Bell, LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/TopNav";

const NAV: { group: string; items: { href: string; label: string; icon: React.ElementType }[] }[] = [
  {
    group: "Operate",
    items: [
      { href: "/app", label: "Overview", icon: LayoutDashboard },
      { href: "/app/shipments", label: "Shipments", icon: Ship },
      { href: "/app/live-map", label: "Live Map", icon: Map },
    ],
  },
  {
    group: "Recover",
    items: [
      { href: "/app/invoices", label: "Invoices", icon: FileText },
      { href: "/app/disputes", label: "Disputes", icon: Scale },
    ],
  },
  {
    group: "Data",
    items: [
      { href: "/app/documents", label: "Documents", icon: FolderOpen },
      { href: "/app/review", label: "Review Queue", icon: ClipboardCheck },
      { href: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState<{ id: string; message: string; severity: string; created_at: string }[]>([]);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/app/login");
      } else {
        setReady(true);
        sb.from("alerts")
          .select("id,message,severity,created_at,read")
          .order("created_at", { ascending: false })
          .limit(12)
          .then(({ data }) => {
            if (data) {
              setAlerts(data);
              setUnread(data.filter((a: { read: boolean }) => !a.read).length);
            }
          });
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
        <div className="text-xs font-medium uppercase tracking-[0.3em] text-muted">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-border bg-surface">
        <Link href="/" className="px-5 py-5">
          <Logo />
        </Link>
        <nav className="mt-1 flex-1 space-y-5 px-3">
          {NAV.map((section) => (
            <div key={section.group}>
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                {section.group}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-accent-soft text-accent"
                          : "text-muted hover:bg-surface-2 hover:text-fg"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-4 text-[11px] leading-relaxed text-muted">
          Northwind Logistics
          <br />
          Pilot plan
        </div>
      </aside>

      <div className="ml-56 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/85 px-6 py-3 backdrop-blur-xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Northwind Logistics
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setShowAlerts((s) => !s)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:text-fg"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {showAlerts && (
                <div className="card absolute right-0 top-11 w-80 p-2">
                  {alerts.length === 0 && <div className="p-3 text-xs text-muted">No alerts.</div>}
                  {alerts.map((a) => (
                    <div key={a.id} className="flex gap-2 rounded-lg p-2.5 text-xs hover:bg-surface-2">
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          background:
                            a.severity === "critical"
                              ? "var(--danger)"
                              : a.severity === "warning"
                              ? "var(--warn)"
                              : "var(--accent)",
                        }}
                      />
                      <span className="text-fg/90">{a.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-muted hover:text-fg"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  const kind = ["in_demurrage", "disputable", "resolved_lost"].includes(status)
    ? "danger"
    : ["at_risk", "needs_review", "offer", "sent", "acknowledged", "pending"].includes(status)
    ? "warn"
    : ["closed", "draft"].includes(status)
    ? "muted"
    : "accent";
  const map: Record<string, { bg: string; fg: string }> = {
    danger: { bg: "var(--danger-soft)", fg: "var(--danger)" },
    warn: { bg: "var(--warn-soft)", fg: "var(--warn)" },
    accent: { bg: "var(--accent-soft)", fg: "var(--accent)" },
    muted: { bg: "var(--surface-2)", fg: "var(--muted-fg)" },
  };
  const c = map[kind];
  return (
    <span className="pill" style={{ background: c.bg, color: c.fg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.fg }} />
      {label}
    </span>
  );
}
