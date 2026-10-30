import Link from "next/link";
import { TopNav, Logo } from "@/components/TopNav";
import { CalculatorClient } from "./CalculatorClient";

export const metadata = {
  title: "Demurrage calculator — free",
  description:
    "Free demurrage & detention calculator: enter your discharge date, free days and tariff tiers to see exactly what a container is accruing per day — and what your exposure is right now.",
  alternates: { canonical: "/tools/demurrage-calculator" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Marevo Demurrage Calculator",
  url: "https://marevoapp.com/tools/demurrage-calculator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  publisher: { "@type": "Organization", name: "Marevo", url: "https://marevoapp.com" },
};

export default function CalculatorPage() {
  return (
    <div className="bg-bg text-fg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopNav />
      <header className="mx-auto max-w-3xl px-5 pb-6 pt-32 md:pt-40">
        <div className="pill border border-border bg-surface text-muted">Free tool</div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">
          Demurrage <span className="text-accent">calculator</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          What is that box actually costing you? Enter the dates and your tariff — the
          calculator shows the days over, the tier breakdown, and the bill as it stands today.
        </p>
      </header>

      <CalculatorClient />

      <section className="mx-auto max-w-3xl px-5 py-12 pb-24">
        <h2 className="text-xl font-semibold">How demurrage is calculated</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Demurrage starts when your free time runs out. The clock begins at container
          discharge from the vessel (not vessel arrival — a common billing error), free days
          count from there, and each day beyond them is billed at your tariff&apos;s tier for
          that day. Tiers escalate: a typical shape is one rate for the first few days over,
          roughly double for the next band, and more again beyond that. Detention works the
          same way outside the terminal, from gate-out until the empty is returned.
        </p>
        <p className="mt-3 leading-relaxed text-muted">
          The number this tool shows is also the number worth auditing: 20–30% of disputed
          demurrage &amp; detention charges are overturned when checked against the contract
          and the terminal&apos;s own timestamps. Marevo does that automatically —{" "}
          <Link href="/guides/how-to-dispute-demurrage-invoice" className="text-accent hover:underline">
            here&apos;s the full dispute process
          </Link>
          , and the retro-audit of your last quarter is free.
        </p>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-xs text-muted">
          <Logo />
          <div className="flex gap-6">
            <Link href="/" className="hover:text-fg">Home</Link>
            <Link href="/guides" className="hover:text-fg">Guides</Link>
            <Link href="/map" className="hover:text-fg">Live demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
