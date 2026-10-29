"use client";

import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { RoiCalculator } from "@/components/RoiCalculator";

const PortScene = lazy(() =>
  import("@/components/PortScene").then((m) => ({ default: m.PortScene }))
);

const ZONES = [
  { key: "hero", label: "Overview" },
  { key: "ship", label: "Vessel" },
  { key: "crane", label: "Quay" },
  { key: "yard", label: "Yard" },
  { key: "warehouse", label: "Warehouse" },
  { key: "gate", label: "Gate" },
] as const;

function useSupports3D() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      setOk(!!gl && !isMobile);
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

export default function Home() {
  const progressRef = useRef(0);
  const { scrollYProgress } = useScroll();
  const use3D = useSupports3D();
  const [activeZone, setActiveZone] = useState(0);
  const railHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      // 3D journey occupies the first ~75% of total scroll (6 zones + calculator + footer below)
      const journey = Math.min(1, v / 0.75);
      progressRef.current = journey;
      const idx = Math.min(ZONES.length - 1, Math.floor(journey * ZONES.length));
      setActiveZone(idx);
    });
  }, [scrollYProgress]);

  return (
    <div className="relative bg-navy text-paper">
      <TopNav />

      {use3D && (
        <div className="fixed inset-0 z-0">
          <Suspense fallback={<div className="h-full w-full bg-navy" />}>
            <PortScene progressRef={progressRef} />
          </Suspense>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/60 via-transparent to-navy/80" />
        </div>
      )}

      {use3D && (
        <div className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
          <div className="relative flex flex-col items-center">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />
            <motion.div
              className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-cyan"
              style={{ height: railHeight }}
            />
            {ZONES.map((z, i) => (
              <div key={z.key} className="relative flex items-center gap-3" style={{ height: 60 }}>
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest transition-all ${
                    activeZone === i ? "text-cyan opacity-100" : "text-mist opacity-40"
                  }`}
                >
                  {z.label}
                </span>
                <span
                  className={`h-2 w-2 rounded-full border transition-all ${
                    activeZone === i
                      ? "border-cyan bg-cyan shadow-[0_0_12px_#4cd9e0]"
                      : "border-white/30 bg-transparent"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {use3D ? (
        <div className="relative z-10">
          <Overlay index={0} active={activeZone === 0}>
            <HeroOverlay />
          </Overlay>
          <Overlay index={1} active={activeZone === 1} align="left">
            <StatCard />
          </Overlay>
          <Overlay index={2} active={activeZone === 2} align="right">
            <FeatureCard
              tag="LIVE FREE-TIME"
              title="Every container's clock, tracked automatically."
              body="Live free-time countdowns for every box. Know before the charge hits — not after it lands on an invoice."
            />
          </Overlay>
          <Overlay index={3} active={activeZone === 3} align="left">
            <FeatureCard
              tag="INVOICE RECONCILIATION"
              title="Automatic invoice parsing."
              body="Carrier invoices reconciled against your contract terms the moment they arrive. Line-by-line, in seconds."
            />
          </Overlay>
          <Overlay index={4} active={activeZone === 4} align="right">
            <FeatureCard
              tag="ONE-CLICK DISPUTES"
              title="Overcharges flagged. Claim letter drafted."
              body="Every disputed charge cites the exact clause violated. 20–30% of contested charges get overturned."
            />
          </Overlay>
          <Overlay index={5} active={activeZone === 5}>
            <ClosingCTA />
          </Overlay>
        </div>
      ) : (
        <FallbackSections />
      )}

      <section id="roi" className="relative z-10 bg-navy px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber">
              The free retro-audit
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              What could you recover?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-mist">
              Send us last quarter&apos;s demurrage &amp; detention invoices and we&apos;ll show
              you what you could have recovered — free, in five days. Or estimate it now:
            </p>
          </div>
          <RoiCalculator />
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-navy py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-mist">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
            © 2026 Meridian Freight Intelligence
          </div>
          <div className="flex gap-6 text-xs text-mist">
            <Link href="/app/login" className="hover:text-paper">
              Sign in
            </Link>
            <a href="#" className="hover:text-paper">
              Privacy
            </a>
            <a href="#" className="hover:text-paper">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Overlay({
  index,
  active,
  children,
  align = "center",
}: {
  index: number;
  active: boolean;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
}) {
  const alignClass =
    align === "left"
      ? "md:justify-start md:pl-24"
      : align === "right"
      ? "md:justify-end md:pr-24"
      : "justify-center";
  return (
    <section
      data-zone={index}
      className={`pointer-events-none flex h-screen w-full items-center justify-center px-6 ${alignClass}`}
    >
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto max-w-xl"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function HeroOverlay() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mist backdrop-blur">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
        </span>
        AI-Native Freight Intelligence
      </div>
      <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
        Every container, tracked.
        <br />
        <span className="bg-gradient-to-r from-cyan via-[#a3f0f3] to-amber bg-clip-text text-transparent">
          Every overcharge, contested.
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
        Meridian watches your shipments in real time, catches demurrage and detention charges
        before they cost you, and drafts the dispute automatically.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="#roi"
          className="rounded-full bg-cyan px-6 py-3 text-sm font-medium text-navy transition hover:brightness-110"
        >
          Get a free audit
        </a>
        <Link
          href="/map"
          className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm text-paper backdrop-blur transition hover:bg-white/10"
        >
          See live tracking →
        </Link>
      </div>
      <div className="mt-16 font-mono text-[10px] uppercase tracking-[0.3em] text-mist/60">
        ↓ Scroll to enter the port
      </div>
    </div>
  );
}

function StatCard() {
  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-coral">The problem</div>
      <div className="mt-4 font-display text-5xl font-semibold md:text-6xl">
        $22B<span className="text-cyan">.</span>
      </div>
      <div className="mt-2 text-sm text-mist">
        Lost industry-wide to detention &amp; demurrage every year.
      </div>
      <div className="mt-6 border-t border-white/10 pt-6 text-sm text-paper/90">
        Meridian tracks every vessel and container in real time — from berth to gate — so the
        charges never surprise you.
      </div>
    </div>
  );
}

function FeatureCard({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">{tag}</div>
      <h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
      <p className="mt-4 text-base text-mist">{body}</p>
    </div>
  );
}

function ClosingCTA() {
  return (
    <div id="book" className="glass-panel mx-auto max-w-xl rounded-3xl p-10 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">Pilot program</div>
      <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">
        See your own shipments on the map.
      </h2>
      <p className="mt-4 text-mist">
        We&apos;ll set up a free pilot with your live containers — no cost, no commitment.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a
          href="mailto:hello@meridian.freight"
          className="rounded-full bg-cyan px-6 py-3 text-sm font-medium text-navy transition hover:brightness-110"
        >
          Book a demo
        </a>
        <Link
          href="/map"
          className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm text-paper transition hover:bg-white/10"
        >
          Explore the live map
        </Link>
      </div>
    </div>
  );
}

function FallbackSections() {
  return (
    <div className="relative z-10 pt-32">
      <div className="mx-auto max-w-5xl px-6">
        <HeroOverlay />
        <div className="mt-24 grid gap-6 md:grid-cols-2">
          <StatCard />
          <FeatureCard
            tag="LIVE FREE-TIME"
            title="Every container's clock, tracked automatically."
            body="Live free-time countdowns for every box. Know before the charge hits — not after it lands on an invoice."
          />
          <FeatureCard
            tag="INVOICE RECONCILIATION"
            title="Automatic invoice parsing."
            body="Carrier invoices reconciled against your contract terms the moment they arrive. Line-by-line, in seconds."
          />
          <FeatureCard
            tag="ONE-CLICK DISPUTES"
            title="Overcharges flagged. Claim letter drafted."
            body="Every disputed charge cites the exact clause violated. 20–30% of contested charges get overturned."
          />
        </div>
        <div className="my-24 flex justify-center">
          <ClosingCTA />
        </div>
      </div>
    </div>
  );
}
