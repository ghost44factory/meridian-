import Link from "next/link";
import { TopNav, Logo } from "@/components/TopNav";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Investors — Marevo" };

const PROJECTIONS = [
  { year: "Year 1", customers: "10", arr: "£180k" },
  { year: "Year 2", customers: "40", arr: "£850k" },
  { year: "Year 3", customers: "100", arr: "£2.2M" },
  { year: "Year 4", customers: "200", arr: "£4.8M" },
  { year: "Year 5", customers: "350", arr: "£8.5M" },
];

export default function Investors() {
  return (
    <div className="bg-bg text-fg">
      <TopNav />
      <header className="mx-auto max-w-4xl px-5 pb-6 pt-32 md:pt-40">
        <div className="pill border border-border bg-surface text-muted">Investors</div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
          Shipping leaks <span className="text-accent">$22B a year.</span><br />
          We built the machine that gets it back.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Demurrage &amp; detention overcharges go unfought because auditing one invoice
          takes an expert an hour. Our AI does it in seconds, drafts the dispute, and
          tracks the claim to the recovered pound — and we take a share of what comes back.
        </p>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <InvStat big="20–30%" label="of disputed charges are overturned (FMC data)" />
          <InvStat big="£21k" label="ARR per mid-size customer at ~75% gross margin" />
          <InvStat big="<£30/mo" label="total infrastructure cost of the live product" />
          <InvStat big="Live" label="product, pipeline and demo — built in weeks, not years" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <div className="overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/container.png" alt="Marevo-branded shipping container" className="w-full" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <h2 className="text-2xl font-semibold">Why this wins</h2>
        <div className="mt-6 space-y-4">
          <Point n="01" title="Self-funding sales motion" body="The free retro-audit turns a cold prospect into a customer with one number: what they could have recovered. The product pays for itself before we invoice." />
          <Point n="02" title="A wedge that widens into oil" body="D&D disputes are the entry. The same engine extends to full freight-invoice audit, carrier data, recovery financing — and voyage demurrage for tanker and bulker owners, where crude demurrage runs $30k+/day and single claims hit $500k. That market alone is measured in billions." />
          <Point n="03" title="Data compounds" body="Every audit teaches the system which carriers overcharge, where, and what wins. At scale that dataset is a product of its own — and a moat no entrant starts with." />
          <Point n="04" title="AI-native economics" body="One founder and an AI stack shipped what a seed-stage team builds in a year. Headcount follows revenue, not the other way round." />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <h2 className="text-2xl font-semibold">Base-case trajectory</h2>
        <div className="card mt-6 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[11px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3">Customers</th>
                <th className="px-5 py-3">ARR</th>
              </tr>
            </thead>
            <tbody>
              {PROJECTIONS.map((p) => (
                <tr key={p.year} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">{p.year}</td>
                  <td className="px-5 py-3 font-mono">{p.customers}</td>
                  <td className="px-5 py-3 font-mono text-accent">{p.arr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Blended subscription + success fees; funnel assumption of 350 accounts approached
          → 35 free audits → 10 customers in year one. Full model in the investor pack.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <div className="card p-8">
          <div className="pill bg-accent-soft text-accent">See it yourself</div>
          <h2 className="mt-3 text-2xl font-semibold">Walk the customer journey, live</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Don&apos;t take the deck&apos;s word for it — log into the actual product with a
            demo book of 45 shipments. Watch countdowns tick, open a disputable invoice,
            read the audit findings, and generate a dispute letter yourself.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link
              href="/app/login"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:brightness-105"
            >
              Open the portal <ArrowRight className="h-4 w-4" />
            </Link>
            <code className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-xs">
              investor@marevo.app · MarevoTour2026
            </code>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10 pb-24">
        <div className="card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <div className="pill bg-accent-soft text-accent">Pre-seed</div>
            <h2 className="mt-3 text-2xl font-semibold">Raising £500k to compress time</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              The product exists and costs almost nothing to run. Capital goes to the first
              ten customers, the data integrations, and the two hires that turn a working
              product into a working company.
            </p>
          </div>
          <a
            href="mailto:hello@marevohq.com?subject=Investor%20pack%20request"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:brightness-105"
          >
            Request the pack <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-xs text-muted">
          <Logo />
          <div className="flex gap-6">
            <Link href="/" className="hover:text-fg">Home</Link>
            <Link href="/careers" className="hover:text-fg">Careers</Link>
            <Link href="/map" className="hover:text-fg">Live demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InvStat({ big, label }: { big: string; label: string }) {
  return (
    <div className="card p-5">
      <div className="font-mono text-2xl font-semibold text-accent">{big}</div>
      <div className="mt-1.5 text-xs leading-snug text-muted">{label}</div>
    </div>
  );
}

function Point({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card flex gap-5 p-6">
      <span className="font-mono text-sm text-accent">{n}</span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}
