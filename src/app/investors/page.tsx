import Link from "next/link";
import { TopNav, Logo } from "@/components/TopNav";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Investors",
  description: "Shipping leaks $22B a year to demurrage & detention. Marevo is the AI that gets it back — live product, two portals, outcome-based pricing.",
};

const PROJECTIONS = [
  { year: "Year 1", customers: "12", arr: "£290k" },
  { year: "Year 2", customers: "48", arr: "£1.3M" },
  { year: "Year 3", customers: "120", arr: "£3.4M" },
  { year: "Year 4", customers: "230", arr: "£7.2M" },
  { year: "Year 5", customers: "400", arr: "£13M" },
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
          <InvStat big="£24k" label="ARR per mid-size customer at ~75% gross margin" />
          <InvStat big="<£30/mo" label="total infrastructure cost of the live product" />
          <InvStat big="Live" label="product, pipeline and demo — built in weeks, not years" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <div className="overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/container-green.png" alt="Marevo-branded shipping container" className="w-full" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <h2 className="text-2xl font-semibold">Why this wins</h2>
        <div className="mt-6 space-y-4">
          <Point n="01" title="Self-funding sales motion" body="The free retro-audit turns a cold prospect into a customer with one number: what they could have recovered. The product pays for itself before we invoice." />
          <Point n="02" title="A wedge that widens into oil" body="D&D disputes are the entry. The same engine extends to voyage demurrage for tanker and bulker owners — VLCC demurrage runs $45–52k/day in a normal market (Argus) and hit several hundred thousand/day in the 2026 Gulf crisis, when soaring freight added $5.4B to Shell's shipping costs in one quarter. Dry-bulk demurrage alone is an $8–10B/yr pool (Marcura), ~99% of port timesheets are still processed by hand, and the owner portal is already live in our demo." />
          <Point n="03" title="Data compounds" body="Every audit teaches the system which carriers overcharge, where, and what wins. At scale that dataset is a product of its own — and a moat no entrant starts with." />
          <Point n="04" title="AI-native economics" body="One founder and an AI stack shipped what a seed-stage team builds in a year. Headcount follows revenue, not the other way round." />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <h2 className="text-2xl font-semibold">Against the incumbents</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          The category leaders sell workflow software to the majors&apos; claims departments.
          Marevo sells the outcome — recovered money — to the 95% of the market that has
          no claims department at all.
        </p>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                <th className="px-5 py-3"></th>
                <th className="px-5 py-3">Veson (IMOS)</th>
                <th className="px-5 py-3">Voyager Portal</th>
                <th className="px-5 py-3 text-accent">Marevo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <CompareRow label="You pay" a="Enterprise licence, results or not" b="Subscription, results or not" c="Mostly a % of money recovered" />
              <CompareRow label="Who does the work" a="Your claims team, in their software" b="Your claims team, in their software" c="The AI drafts the claim; you approve" />
              <CompareRow label="Container D&D + voyage demurrage" a="Voyage only" b="Voyage only" c="Both, one engine, two portals" />
              <CompareRow label="Time to first value" a="Months of implementation" b="Pilot after workflow diagnosis" c="Free audit — a number in days" />
              <CompareRow label="Built for" a="Majors (Cargill, Trafigura)" b="Traders' claims teams" c="The mid-market nobody serves" />
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Based on each vendor&apos;s public positioning, Oct 2026. Veson has processed $71B
          of claims in 20 years — the category is proven; the delivery model is what&apos;s stale.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10">
        <h2 className="text-2xl font-semibold">Base-case trajectory</h2>
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left font-display font-semibold text-[11px] uppercase tracking-[0.14em] text-muted">
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
        <h2 className="text-2xl font-semibold">Team</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-display text-lg font-semibold">Taimur Javaid</h3>
            <div className="mt-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Founder &amp; CEO</div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Operator across trade and manufacturing — ships containers out of South Asia and the
              Gulf for his own B2B apparel business, so he has paid these invoices himself. Built
              Marevo AI-native from day one: live product, two portals, near-zero run cost.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-display text-lg font-semibold">Najah Shehzad</h3>
            <div className="mt-0.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Co-founder — Growth &amp; Partnerships</div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Founder &amp; CEO of PARALLAX, a property-media studio, where she owns client
              onboarding and relationships. Currently at IE in Madrid — bringing its venture
              programme and Gulf-heavy alumni network to Marevo&apos;s raise and pilot pipeline.
            </p>
          </div>
        </div>
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
            <div className="flex flex-col gap-2">
              <code className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-xs">
                Cargo side — investor@marevo.app · MarevoTour2026
              </code>
              <code className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 font-mono text-xs">
                Owner side — owner@marevo.app · MarevoOwner2026
              </code>
            </div>
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
            href="mailto:hello@marevoapp.com?subject=Investor%20pack%20request"
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

function CompareRow({ label, a, b, c }: { label: string; a: string; b: string; c: string }) {
  return (
    <tr>
      <td className="px-5 py-3 font-medium">{label}</td>
      <td className="px-5 py-3 text-muted">{a}</td>
      <td className="px-5 py-3 text-muted">{b}</td>
      <td className="px-5 py-3 font-medium text-accent">{c}</td>
    </tr>
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
