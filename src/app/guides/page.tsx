import Link from "next/link";
import { TopNav, Logo } from "@/components/TopNav";
import { GUIDES, GUIDE_CATEGORIES } from "@/lib/guides";
import { ArrowRight, Calculator } from "lucide-react";

export const metadata = {
  title: "Demurrage & detention guides",
  description:
    "Practical guides to demurrage, detention and laytime: carrier-by-carrier dispute processes, port free-time explainers, OSRA rights, time bars and worked laytime examples.",
};

export default function GuidesIndex() {
  return (
    <div className="bg-bg text-fg">
      <TopNav />
      <header className="mx-auto max-w-6xl px-5 pb-8 pt-32 md:pt-40">
        <div className="pill border border-border bg-surface text-muted">Guides</div>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
          The demurrage &amp; detention <span className="text-accent">playbook.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
          How the clocks work, how claims are won, and how each carrier and port actually
          behaves — written from the documents, with the numbers.
        </p>
        <Link
          href="/tools/demurrage-calculator"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:brightness-105"
        >
          <Calculator className="h-4 w-4" /> Try the demurrage calculator
        </Link>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        {GUIDE_CATEGORIES.map((cat) => (
          <div key={cat} className="mt-10">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">{cat}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {GUIDES.filter((g) => g.category === cat).map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="card group block p-6 transition hover:border-accent/50">
                  <h3 className="font-semibold leading-snug group-hover:text-accent">{g.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{g.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-xs text-muted">
          <Logo />
          <div className="flex gap-6">
            <Link href="/" className="hover:text-fg">Home</Link>
            <Link href="/owners" className="hover:text-fg">Vessel owners</Link>
            <Link href="/map" className="hover:text-fg">Live demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
