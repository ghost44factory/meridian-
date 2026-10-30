import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav, Logo } from "@/components/TopNav";
import { GUIDES, getGuide } from "@/lib/guides";
import { ArrowRight } from "lucide-react";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { title: g.title, description: g.description, type: "article" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    dateModified: g.updated,
    author: { "@type": "Organization", name: "Marevo", url: "https://marevoapp.com" },
    publisher: { "@type": "Organization", name: "Marevo", logo: { "@type": "ImageObject", url: "https://marevoapp.com/brand/mark-mint.png" } },
    mainEntityOfPage: `https://marevoapp.com/guides/${g.slug}`,
  };
  const faqLd = g.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: g.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const related = GUIDES.filter((x) => x.category === g.category && x.slug !== g.slug).slice(0, 2);

  return (
    <div className="bg-bg text-fg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <TopNav />

      <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-40">
        <Link href="/guides" className="text-sm text-accent hover:underline">← All guides</Link>
        <div className="mt-4 pill border border-border bg-surface text-muted">{g.category}</div>
        <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">{g.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{g.description}</p>
        <div className="mt-3 font-mono text-xs text-muted">Updated {g.updated}</div>

        {g.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="text-xl font-semibold">{s.h}</h2>
            {s.paras.map((p, i) => (
              <p key={i} className="mt-3 leading-relaxed text-muted">{p}</p>
            ))}
          </section>
        ))}

        {g.faqs && g.faqs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold">Frequently asked</h2>
            <div className="mt-4 space-y-4">
              {g.faqs.map((f) => (
                <div key={f.q} className="card p-5">
                  <h3 className="font-semibold">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="card mt-12 p-7">
          <div className="pill bg-accent-soft text-accent">Free retro-audit</div>
          <h2 className="mt-3 text-xl font-semibold">Find out what your last quarter owes you</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Marevo reads your invoices against your contracts and the terminal data, drafts the
            disputes, and is paid mostly from what actually comes back. The audit itself is free.
          </p>
          <a
            href="mailto:hello@marevoapp.com?subject=Free%20retro-audit"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition hover:brightness-105"
          >
            Claim the free audit <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted">Related guides</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {related.map((r) => (
                <Link key={r.slug} href={`/guides/${r.slug}`} className="card block p-5 transition hover:border-accent/50">
                  <h3 className="text-sm font-semibold leading-snug">{r.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

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
