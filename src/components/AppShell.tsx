"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Ship, Map, FileText, Scale, FolderOpen, ClipboardCheck, Settings, Bell, LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/shipments", label: "Shipments", icon: Ship },
  { href: "/app/live-map", label: "Live Map", icon: Map },
  { href: "/app/invoices", label: "Invoices", icon: FileText },
  { href: "/app/disputes", label: "Disputes", icon: Scale },
  { href: "/app/documents", label: "Documents", icon: FolderOpen },
  { href: "/app/review", label: "Review Queue", icon: ClipboardCheck },
  { href: "/app/settings", label: "Settings", icon: Settings },
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
      <div className="flex min-h-screen items-center justify-center bg-navy">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-mist">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-navy text-paper">
      <aside className="fixed inset-y-0 left-0 z-40 w-56 border-r border-white/8 bg-abyss">
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-cyan/60">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan glow-cyan" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Meridian</span>
        </Link>
        <nav className="mt-2 space-y-0.5 px-3">
          {NAV.map((item) => {
            const active =
              item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-cyan/10 text-cyan" : "text-mist hover:bg-white/5 hover:text-paper"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="ml-56 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-navy/80 px-6 py-3 backdrop-blur">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist">
            Northwind Logistics
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowAlerts((s) => !s)}
                className="relative rounded-full border border-white/10 bg-white/5 p-2 hover:bg-white/10"
              >
                <Bell className="h-4 w-4 text-mist" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-semibold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {showAlerts && (
                <div className="glass-panel absolute right-0 top-11 w-80 rounded-xl p-2">
                  {alerts.length === 0 && (
                    <div className="p-3 text-xs text-mist">No alerts.</div>
                  )}
                  {alerts.map((a) => (
                    <div key={a.id} className="flex gap-2 rounded-lg p-2.5 text-xs hover:bg-white/5">
                      <span
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          background:
                            a.severity === "critical" ? "#ff5a5f" : a.severity === "warning" ? "#f2a93c" : "#4cd9e0",
                        }}
                      />
                      <span className="text-paper/90">{a.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-mist hover:bg-white/10 hover:text-paper"
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
  return (
    <div className={`rounded-xl border border-panel-border bg-current ${className}`} style={{ background: "#101b30" }}>
      {children}
    </div>
  );
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  const color =
    ["in_demurrage", "disputable", "resolved_lost"].includes(status)
      ? "#ff5a5f"
      : ["at_risk", "needs_review", "offer", "sent", "acknowledged"].includes(status)
      ? "#f2a93c"
      : ["closed", "draft"].includes(status)
      ? "#8fa3be"
      : "#4cd9e0";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{ background: `${color}1f`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
