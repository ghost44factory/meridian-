import Link from "next/link";
import { TopNav, Logo } from "@/components/TopNav";
import { RoiCalculator } from "@/components/RoiCalculator";
import { MapShowcase } from "@/components/MapShowcase";
import {
  FileSearch, Radar, Scale, BellRing, ArrowRight, Check,
  Upload, Mail, MousePointerClick, Banknote, ShieldCheck,
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-bg text-fg">
      <TopNav />

      {/* ---------- HERO ---------- */}
      <header className="mx-auto max-w-6xl px-5 pb-16 pt-32 md:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="pill border border-border bg-surface text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
              AI-native freight intelligence
            </div>
            <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.05] md:text-6xl">
              Stop paying shipping charges
              <span className="text-accent"> you don&apos;t owe.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Marevo tracks every container, audits every demurrage &amp; detention
              invoice against your contracts, and drafts the dispute — automatically.
              You review, click send, and get credited.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#audit"
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:brightness-105"
              >
                Audit last quarter free <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/map"
                className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium transition hover:bg-surface-2"
              >
                See the live demo
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-accent" />
              No charges recovered, no fee. We never touch your money.
            </div>
          </div>

          <div className="relative">
            <div className="card overflow-hidden p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/shots/hero-dashboard.png"
                alt="Marevo dashboard — live free-time countdowns and recovered charges"
                className="w-full rounded-xl"
              />
            </div>
            <div className="card absolute -bottom-6 -left-4 hidden w-64 p-4 md:block">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Dispute resolved
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold text-accent">+£680</span>
                <span className="text-xs text-muted">credited by carrier</span>
              </div>
              <TimelineMini />
            </div>
          </div>
        </div>
      </header>

      {/* ---------- STAT BAND ---------- */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-10 sm:grid-cols-3">
          <Stat big="$22B" label="lost to demurrage & detention charges every year, industry-wide" />
          <Stat big="20–30%" label="of charges are overturned when disputed with evidence" />
          <Stat big="£150+" label="per container per day once free time runs out" />
        </div>
      </section>

      {/* ---------- WHAT MERIDIAN DOES ---------- */}
      <section id="product" className="mx-auto max-w-6xl px-5 py-24">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-accent">What Marevo does</div>
          <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
            Your freight back-office, on autopilot
          </h2>
          <p className="mt-3 text-muted">
            Forward us your shipping emails — or connect your inbox and we find them
            automatically. Everything else just happens.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Feature
            icon={<Radar className="h-5 w-5" />}
            title="Track every container"
            body="Bookings and bills of lading are read automatically — every container appears with a live free-time countdown and vessel position. No data entry, ever."
          />
          <Feature
            icon={<BellRing className="h-5 w-5" />}
            title="Prevent charges before they start"
            body="Email alerts before free time expires — '2 days left at Felixstowe, book your trucker' — so avoidable charges never happen."
          />
          <Feature
            icon={<FileSearch className="h-5 w-5" />}
            title="Audit every invoice"
            body="Each demurrage & detention invoice is checked line-by-line against your contract free time, weekend and holiday exclusions, terminal timestamps and the FMC 30-day rules."
          />
          <Feature
            icon={<Scale className="h-5 w-5" />}
            title="Dispute in one click"
            body="Overcharges are flagged with the exact clause violated. A formal dispute letter with the evidence pack attached is drafted for you — you review and send."
          />
        </div>
      </section>

      {/* ---------- LIVE MAP ---------- */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold text-accent">The live map</div>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
                Your whole shipping world, on one screen
              </h2>
              <p className="mt-4 text-muted">
                This is the actual product, running below — watch it click a vessel and pull
                up the cargo. Every route follows real sea lanes; every countdown is live.
              </p>
            </div>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:brightness-105"
            >
              Open the interactive demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10">
            <MapShowcase />
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            <MapPoint title="Colour is risk" body="Green is on schedule, amber means free time is running out, red means charges are accruing right now." />
            <MapPoint title="Click any vessel" body="See exactly which of your containers are on board, their cargo, and each one's free-time countdown." />
            <MapPoint title="From estimate to live" body="Positions switch to real-time AIS satellite data the moment your account goes live." />
          </ul>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold text-accent">What you actually do</div>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              15 minutes a week. That&apos;s it.
            </h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <Step
              n={1}
              icon={<Mail className="h-5 w-5" />}
              title="Forward your emails"
              body="Auto-forward carrier emails to your Marevo address — or connect Gmail/Outlook read-only and we find them, history included. Contracts uploaded once a year."
            />
            <Step
              n={2}
              icon={<Upload className="h-5 w-5" />}
              title="We read & audit everything"
              body="Shipments appear, clocks tick, and every invoice is audited the moment it arrives."
            />
            <Step
              n={3}
              icon={<MousePointerClick className="h-5 w-5" />}
              title="You click send"
              body="Review the findings and the drafted dispute letter. One click sends it to the right carrier channel."
            />
            <Step
              n={4}
              icon={<Banknote className="h-5 w-5" />}
              title="You get credited"
              body="The carrier credits you directly. Recovered money shows up on your dashboard — we invoice our share after."
            />
          </div>
        </div>
      </section>

      {/* ---------- ROI / FREE AUDIT ---------- */}
      <section id="audit" className="mx-auto max-w-4xl px-5 py-24">
        <div className="text-center">
          <div className="text-sm font-semibold text-accent">The free retro-audit</div>
          <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
            Find out what you could have recovered
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Send us last quarter&apos;s D&amp;D invoices and contracts. In five days you get a
            report with a number on it — free, no commitment. Or estimate it now:
          </p>
        </div>
        <div className="mt-10">
          <RoiCalculator />
        </div>
      </section>

      {/* ---------- PRICING ---------- */}
      <section id="pricing" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold text-accent">Pricing</div>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              Self-funding by design
            </h2>
            <p className="mt-3 text-muted">
              Every plan starts with the free retro-audit and a <strong className="text-fg">free first month</strong>.
              Success fees apply only to money actually recovered.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            <Plan name="Starter" price="£500" unit="/mo" fee="20% of recovered" blurb="50–150 containers a month" />
            <Plan name="Growth" price="£1,500" unit="/mo" fee="15% of recovered" blurb="150–600 containers a month" highlighted />
            <Plan name="Scale" price="£3,500" unit="/mo" fee="12% of recovered" blurb="600–2,000 containers a month" />
            <Plan name="Recover" price="£0" unit="/mo" fee="30% of recovered" blurb="Fully managed — we run everything, you approve. Pay only on results." />
          </div>
        </div>
      </section>

      {/* ---------- OWNERS & CHARTERERS ---------- */}
      <section className="dark" style={{ background: "#0b0c0e" }}>
        <div className="mx-auto max-w-6xl px-5 py-24 text-fg">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold text-accent">For vessel owners &amp; charterers</div>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
                The other side of demurrage
              </h2>
              <p className="mt-4 text-muted">
                Containers are where we started. Voyage demurrage — the laytime claims
                between owners and charterers on tankers and bulkers — is the same dispute
                with two more zeros. Oil is the heartland: demurrage on a crude tanker runs
                $30k+ a day, and the majors keep entire departments to fight it.
              </p>
            </div>
            <div className="pill border border-accent/40 bg-accent-soft text-accent">
              In development · pilot Apr 2027
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="card p-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Laytime engine</div>
              <h3 className="mt-3 font-semibold">SOF in, laytime statement out</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Statements of facts parsed automatically; laytime computed against the
                charter party's own terms — weather, shifts, exceptions included.
              </p>
            </div>
            <div className="card p-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Charter-party aware</div>
              <h3 className="mt-3 font-semibold">Your CP is the contract</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                The same clause-level audit we run on container contracts, pointed at
                charter parties — demurrage rates, despatch, notice provisions.
              </p>
            </div>
            <div className="card p-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">Claims that matter</div>
              <h3 className="mt-3 font-semibold">$50k–$500k per voyage</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A single tanker or bulker claim is 100× a container dispute — one crude
                cargo delayed three days is a six-figure argument. Evidence quality decides
                it, which is exactly what software is for.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href="mailto:hello@marevohq.com?subject=Voyage%20demurrage%20pilot"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:brightness-105"
            >
              Become a design partner <ArrowRight className="h-4 w-4" />
            </a>
            <p className="text-sm text-muted">
              <strong className="text-fg">Pilot pricing:</strong> no subscription — 10% of recovered
              demurrage or despatch. Founding design partners pay 5%, locked for two years.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- ROADMAP ---------- */}
      <section className="mx-auto max-w-4xl px-5 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold text-accent">The next six months</div>
          <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Where this is going</h2>
          <p className="mt-3 text-muted">
            Built in public. Everything marked live is running on this site today.
          </p>
        </div>
        <ol className="mx-auto mt-12 w-full max-w-xl space-y-0">
          <RoadmapItem when="Now" tag="LIVE" title="Track, audit, dispute, recover" body="Live countdowns on every container, line-by-line invoice audits, one-click dispute letters and a recovery pipeline — everything on this page is built and running." />
          <RoadmapItem when="Dec 2026" tag="IN BUILD" title="AI document extraction at scale + alert emails" body="AI reading of every invoice, bill of lading and booking at production scale, with alert emails before free time expires." />
          <RoadmapItem when="Jan 2027" tag="PLANNED" title="Connect your inbox" body="One-click, read-only Gmail and Outlook connection — we find carrier emails automatically, including last year's, so your free retro-audit becomes instant." />
          <RoadmapItem when="Feb 2027" tag="PLANNED" title="Live AIS vessel feed" body="Terminal and satellite data switch the map from estimated to real-time positions, port congestion included." />
          <RoadmapItem when="Mar 2027" tag="PLANNED" title="Auto-filed disputes + recovery-based billing" body="Set approval rules once and strong-evidence disputes file themselves. Billing runs automatically on recovered money." />
          <RoadmapItem when="Apr 2027" tag="PILOT" title="Voyage demurrage for owners & charterers" body="The audit engine pointed at charter parties, laytime statements and $50k–$500k voyage claims." last />
        </ol>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="text-2xl font-semibold">Questions, answered</h2>
        <div className="mt-6 space-y-3">
          <Faq q="Do you handle our money?" a="Never. Carriers credit or refund you directly. Marevo invoices its success fee afterwards, against recoveries evidenced by the carrier's own credit note." />
          <Faq q="What do we have to upload?" a="Almost nothing by hand. Auto-forward carrier emails to your Marevo address; upload each carrier contract once a year. Everything else is extracted automatically." />
          <Faq q="Is our data safe?" a="Each customer's data is isolated at the database level with row-level security, stored encrypted in a private bucket, UK/EU region. Your documents are never shared or used to train public models." />
          <Faq q="What if we stop getting charges?" a="Perfect — that's the prevention layer doing its job. The subscription covers tracking, alerts and audit; the success fee only ever applies to what we actually recover." />
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">
            One quarter of invoices.<br />One number. Five days.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            The audit is free whether or not you ever become a customer.
          </p>
          <a
            href="mailto:hello@marevohq.com?subject=Free%20retro-audit"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-fg transition hover:brightness-105"
          >
            Claim your free audit <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row">
          <Logo />
          <div className="flex gap-6 text-xs text-muted">
            <Link href="/app/login" className="hover:text-fg">Sign in</Link>
            <Link href="/map" className="hover:text-fg">Live demo</Link>
            <Link href="/careers" className="hover:text-fg">Careers</Link>
            <Link href="/investors" className="hover:text-fg">Investors</Link>
            <a href="#" className="hover:text-fg">Privacy</a>
          </div>
          <div className="text-xs text-muted">© 2026 Marevo Intelligence Ltd</div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- small pieces ---------- */

function TimelineMini() {
  const steps = ["Audited", "Sent", "Acknowledged", "Credited"];
  return (
    <div className="mt-3 flex items-center">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1">
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full ${
                i < 4 ? "bg-accent" : "bg-surface-2"
              }`}
            >
              <Check className="h-2.5 w-2.5 text-accent-fg" />
            </span>
            <span className="text-[9px] text-muted">{s}</span>
          </div>
          {i < steps.length - 1 && <span className="mx-0.5 mb-4 h-px flex-1 bg-accent/40" />}
        </div>
      ))}
    </div>
  );
}

function MapPoint({ title, body }: { title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
      <span className="text-sm leading-relaxed text-muted">
        <strong className="text-fg">{title}.</strong> {body}
      </span>
    </li>
  );
}

function Stat({ big, label }: { big: string; label: string }) {
  return (
    <div className="text-center sm:text-left">
      <div className="font-mono text-3xl font-semibold text-accent">{big}</div>
      <div className="mt-1 text-sm leading-snug text-muted">{label}</div>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Step({ n, icon, title, body }: { n: number; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-fg">
          {n}
        </span>
        <span className="text-accent">{icon}</span>
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Plan({
  name, price, unit, fee, blurb, highlighted,
}: {
  name: string; price: string; unit: string; fee: string; blurb: string; highlighted?: boolean;
}) {
  return (
    <div className={`card relative p-6 ${highlighted ? "ring-2 ring-accent" : ""}`}>
      {highlighted && (
        <span className="pill absolute -top-3 left-6 bg-accent text-accent-fg">Most popular</span>
      )}
      <div className="text-sm font-semibold text-muted">{name}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-semibold">{price}</span>
        <span className="text-sm text-muted">{unit}</span>
      </div>
      <div className="mt-1 text-sm font-medium text-accent">+ {fee}</div>
      <p className="mt-3 text-sm text-muted">{blurb}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {["Free retro-audit", "First month free", "Cancel anytime"].map((f) => (
          <li key={f} className="flex items-center gap-2 text-muted">
            <Check className="h-3.5 w-3.5 text-accent" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RoadmapItem({
  when, tag, title, body, last,
}: {
  when: string; tag: string; title: string; body: string; last?: boolean;
}) {
  const tone =
    tag === "LIVE" ? "bg-accent text-accent-fg" :
    tag === "IN BUILD" ? "bg-warn-soft text-warn" : "bg-surface-2 text-muted";
  return (
    <li className="relative flex gap-5 pb-10">
      {!last && <span className="absolute left-[7px] top-5 h-full w-px bg-border" />}
      <span className={`mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 ${tag === "LIVE" ? "border-accent bg-accent" : "border-border bg-surface"}`} />
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs text-muted">{when}</span>
          <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${tone}`}>{tag}</span>
        </div>
        <h3 className="mt-1.5 font-semibold">{title}</h3>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </li>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="card group p-5">
      <summary className="cursor-pointer list-none font-medium">{q}</summary>
      <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
    </details>
  );
}
