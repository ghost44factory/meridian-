"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CCY: Record<string, string> = { GBP: "£", USD: "$", EUR: "€", AED: "AED " };

const INP = "w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-accent";

function daysBetween(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

export function CalculatorClient() {
  const [discharge, setDischarge] = useState("");
  const [asOf, setAsOf] = useState("");
  useEffect(() => {
    const now = new Date();
    setAsOf(now.toISOString().slice(0, 10));
    const d = new Date(now);
    d.setDate(d.getDate() - 12);
    setDischarge(d.toISOString().slice(0, 10));
  }, []);
  const [freeDays, setFreeDays] = useState(5);
  const [boxes, setBoxes] = useState(1);
  const [ccy, setCcy] = useState("GBP");
  const [t1, setT1] = useState(85);
  const [t1len, setT1len] = useState(4);
  const [t2, setT2] = useState(170);
  const [t2len, setT2len] = useState(5);
  const [t3, setT3] = useState(300);

  const result = useMemo(() => {
    const d0 = new Date(discharge);
    const d1 = new Date(asOf);
    if (isNaN(d0.getTime()) || isNaN(d1.getTime())) return null;
    const elapsed = daysBetween(d0, d1);
    const over = Math.max(0, elapsed - freeDays);
    const tier1Days = Math.min(over, t1len);
    const tier2Days = Math.min(Math.max(0, over - t1len), t2len);
    const tier3Days = Math.max(0, over - t1len - t2len);
    const perBox = tier1Days * t1 + tier2Days * t2 + tier3Days * t3;
    const dailyNow = over <= 0 ? (elapsed >= freeDays ? t1 : 0) : over <= t1len ? t1 : over <= t1len + t2len ? t2 : t3;
    return { elapsed, over, tier1Days, tier2Days, tier3Days, perBox, total: perBox * boxes, dailyNow: dailyNow * boxes, freeLeft: Math.max(0, freeDays - elapsed) };
  }, [discharge, asOf, freeDays, boxes, t1, t1len, t2, t2len, t3]);

  const sym = CCY[ccy] ?? "";
  const fmt = (n: number) => sym + n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

  return (
    <section className="mx-auto max-w-3xl px-5">
      <div className="card p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Container discharged on">
            <input type="date" value={discharge} onChange={(e) => setDischarge(e.target.value)} className={INP} />
          </Field>
          <Field label="Calculate as of">
            <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className={INP} />
          </Field>
          <Field label="Free days (from your contract)">
            <input type="number" min={0} max={30} value={freeDays} onChange={(e) => setFreeDays(Number(e.target.value))} className={INP} />
          </Field>
          <Field label="Containers affected">
            <input type="number" min={1} max={500} value={boxes} onChange={(e) => setBoxes(Number(e.target.value))} className={INP} />
          </Field>
        </div>

        <div className="mt-6 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Tariff tiers (per container per day)
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Field label={`Days 1–${t1len} over`}>
            <div className="flex gap-2">
              <select value={ccy} onChange={(e) => setCcy(e.target.value)} className={INP + " !w-24"}>
                {Object.keys(CCY).map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="number" min={0} value={t1} onChange={(e) => setT1(Number(e.target.value))} className={INP} />
            </div>
          </Field>
          <Field label={`Days ${t1len + 1}–${t1len + t2len} over`}>
            <input type="number" min={0} value={t2} onChange={(e) => setT2(Number(e.target.value))} className={INP} />
          </Field>
          <Field label={`Day ${t1len + t2len + 1}+ over`}>
            <input type="number" min={0} value={t3} onChange={(e) => setT3(Number(e.target.value))} className={INP} />
          </Field>
        </div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Tier 1 length (days)">
            <input type="number" min={1} max={30} value={t1len} onChange={(e) => setT1len(Number(e.target.value))} className={INP} />
          </Field>
          <Field label="Tier 2 length (days)">
            <input type="number" min={1} max={30} value={t2len} onChange={(e) => setT2len(Number(e.target.value))} className={INP} />
          </Field>
        </div>

        {result && (
          <div className="mt-8 rounded-xl border border-border bg-surface p-6">
            {result.over > 0 ? (
              <>
                <div className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Accrued so far</div>
                <div className="mt-1 font-mono text-4xl font-semibold" style={{ color: "var(--danger)" }}>{fmt(result.total)}</div>
                <div className="mt-2 text-sm text-muted">
                  {result.over} day{result.over === 1 ? "" : "s"} over free time across {boxes} container{boxes === 1 ? "" : "s"} — currently accruing <span className="font-mono text-fg">{fmt(result.dailyNow)}/day</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center font-mono text-xs text-muted">
                  <div className="rounded-lg bg-surface-2 p-2.5">{result.tier1Days}d × {fmt(t1)}</div>
                  <div className="rounded-lg bg-surface-2 p-2.5">{result.tier2Days}d × {fmt(t2)}</div>
                  <div className="rounded-lg bg-surface-2 p-2.5">{result.tier3Days}d × {fmt(t3)}</div>
                </div>
              </>
            ) : (
              <>
                <div className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Still inside free time</div>
                <div className="mt-1 font-mono text-4xl font-semibold text-accent">{fmt(0)}</div>
                <div className="mt-2 text-sm text-muted">
                  {result.freeLeft} free day{result.freeLeft === 1 ? "" : "s"} left — after that, the clock starts at {fmt(t1 * boxes)}/day.
                </div>
              </>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <span className="text-sm text-muted">20–30% of charges like this are overturned when audited.</span>
              <a
                href="mailto:hello@marevoapp.com?subject=Free%20retro-audit"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition hover:brightness-105"
              >
                Audit my invoices free <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/guides/how-to-dispute-demurrage-invoice" className="text-sm font-medium text-accent hover:underline">
                How disputes work →
              </Link>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
