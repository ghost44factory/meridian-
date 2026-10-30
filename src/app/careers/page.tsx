import Link from "next/link";
import { TopNav, Logo } from "@/components/TopNav";
import { ArrowRight } from "lucide-react";

export const metadata = { title: "Careers — Marevo" };

const ROLES = [
  {
    title: "Founding Full-Stack Engineer",
    where: "London · Remote",
    type: "Full-time · equity-heavy",
    body: "Own the product with the founder: Next.js, Supabase, and the AI extraction pipeline. You ship to production daily and talk to customers weekly.",
  },
  {
    title: "Freight Operations Analyst",
    where: "London · Dubai",
    type: "Full-time",
    body: "Run retro-audits, verify every AI finding before it ships, and own the carrier dispute channels. Freight forwarding or carrier billing experience is gold here.",
  },
  {
    title: "Carrier & Partnerships Lead",
    where: "London · Dubai",
    type: "Full-time",
    body: "Build the relationships that make disputes resolve fast — carrier dispute desks, terminal operators, and the data partners behind live tracking.",
  },
  {
    title: "Growth — Founding Marketer",
    where: "Remote",
    type: "Full-time or fractional",
    body: "One funnel: the free audit. You own LinkedIn, outbound to forwarders, and the content engine that turns recovered-money stories into pipeline.",
  },
];

export default function Careers() {
  return (
    <div className="bg-bg text-fg">
      <TopNav />
      <header className="mx-auto max-w-6xl px-5 pb-10 pt-32 md:pt-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="pill border border-border bg-surface text-muted">Careers</div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
              Ship money <span className="text-accent">back.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
              Marevo recovers the billions the shipping industry overpays in demurrage
              &amp; detention. Tiny team, AI-native from day one, customers from day one.
              Roles open as pilot customers land — early applications get first calls.
            </p>
            <a
              href="mailto:hello@marevohq.com?subject=Joining%20Marevo"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:brightness-105"
            >
              Introduce yourself <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Lanyard */}
          <div className="relative mx-auto hidden w-80 lg:block">
            <div className="overflow-hidden rounded-3xl border border-border shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/lanyard.png" alt="Marevo founding-team lanyard badge" className="w-full" />
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-5 md:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r.title} className="card flex flex-col p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{r.title}</h2>
                <span className="pill bg-accent-soft text-accent">{r.where}</span>
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">{r.type}</div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{r.body}</p>
              <a
                href={`mailto:hello@marevohq.com?subject=${encodeURIComponent("Application: " + r.title)}`}
                className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium transition hover:bg-surface-2"
              >
                Apply <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">
          No role that fits? If you know freight, carriers, or how to make software feel
          inevitable — <a className="text-accent underline-offset-2 hover:underline" href="mailto:hello@marevohq.com?subject=Speculative%20application">write anyway</a>.
        </p>
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
