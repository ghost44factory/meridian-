import Link from "next/link";
import { TopNav, Logo } from "@/components/TopNav";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "For vessel owners",
  description: "Voyage demurrage claims built and chased for you — AI reads the charter party and SOF, computes laytime, drafts the claim pack and tracks it to settlement.",
};

export default function OwnersPage() {
  return (
    <div className="bg-bg text-fg">
      <TopNav />

      {/* Hero */}
      <header className="mx-auto max-w-6xl px-5 pb-10 pt-32 md:pt-40">
        <div className="max-w-2xl">
          <div className="pill border border-border bg-surface text-muted">For vessel owners &amp; operators</div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
            Your ship waited.<br />
            <span className="text-accent">Get paid for every hour.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Voyage demurrage claims are built by hand from scanned port logs, argued over
            email for months, and void if filed a day late. Marevo reads the charter party
            and the Statement of Facts, computes the laytime statement, drafts the claim
            pack, and tracks it to settlement — before the time bar does its work.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/app/login"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:brightness-105"
            >
              Open the owner demo <ArrowRight className="h-4 w-4" />
            </Link>
            <code className="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-[11px] text-muted">
              owner@marevo.app · MarevoOwner2026
            </code>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4">
          <OStat big="$45–52k" label="demurrage per day on a VLCC in a normal market (Argus)" />
          <OStat big="~10×" label="that during the 2026 Gulf disruption" />
          <OStat big="90 days" label="typical time bar — a late claim is a void claim" />
          <OStat big="~99%" label="of Statements of Facts still processed by hand" />
        </div>
      </section>

      {/* Image */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/ship.png" alt="Vessel at sea carrying Marevo containers" className="max-h-[380px] w-full object-cover" />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-accent">How it works</div>
          <h2 className="mt-2 text-3xl font-semibold">SOF in. Claim pack out.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Step n="01" title="Fixture in" body="Upload the charter party once per fixture. The AI reads the laytime allowance, demurrage rate, exclusions, notice provisions and the time bar — your CP becomes the rulebook." />
          <Step n="02" title="Voyage watched" body="NOR, SOF and port events come in by upload or your private forwarding address. Laytime is computed against the CP's own terms; the portal shows exposure accruing per voyage, live." />
          <Step n="03" title="Claim issued & chased" body="The moment laytime expires, the claim drafts itself — laytime statement, SOF extracts, interest clause — for your approval. Countdown to the time bar, chase cadence, settlement tracking." />
        </div>
      </section>

      {/* What you see */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card title="Fleet laytime view" body="Every active voyage with hours used vs allowed, colour-coded the moment a vessel goes on demurrage." />
          <Card title="Exposure, priced" body="Accrued demurrage in dollars per voyage at the CP rate — the number your ops meeting actually needs." />
          <Card title="Time-bar countdowns" body="Every claim shows days to the bar. Nothing dies in a drawer." />
          <Card title="Despatch guarded" body="Finished early? The same engine checks you're not overpaying despatch either." />
        </div>
      </section>

      {/* Pricing + CTA */}
      <section className="mx-auto max-w-6xl px-5 py-14 pb-24">
        <div className="card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <div className="pill bg-accent-soft text-accent">Founding design partners</div>
            <h2 className="mt-3 text-2xl font-semibold">No subscription. 10% of what we recover.</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Founding design partners pay 5%, locked for two years, in exchange for feedback
              as we tune the laytime engine on your fixtures. If nothing is recovered, nothing is owed.
            </p>
          </div>
          <a
            href="mailto:hello@marevoapp.com?subject=Voyage%20demurrage%20pilot"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:brightness-105"
          >
            Become a design partner <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-xs text-muted">
          <Logo />
          <div className="flex gap-6">
            <Link href="/" className="hover:text-fg">Home</Link>
            <Link href="/investors" className="hover:text-fg">Investors</Link>
            <Link href="/map" className="hover:text-fg">Live demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function OStat({ big, label }: { big: string; label: string }) {
  return (
    <div className="text-center sm:text-left">
      <div className="font-mono text-2xl font-semibold text-accent md:text-3xl">{big}</div>
      <div className="mt-1 text-sm leading-snug text-muted">{label}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card p-6">
      <span className="font-mono text-sm text-accent">{n}</span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
