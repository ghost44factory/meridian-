import type { Metadata } from "next";
import { Geist, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marevoapp.com"),
  title: {
    default: "Marevo — Recover the shipping charges you don't owe",
    template: "%s | Marevo",
  },
  description:
    "Marevo tracks your containers, audits every demurrage & detention invoice against your contracts, and drafts the dispute for you. Free audit of last quarter's invoices.",
  keywords: [
    "demurrage", "detention", "D&D charges", "demurrage recovery", "detention dispute",
    "freight audit", "container tracking", "laytime calculation", "voyage demurrage",
    "demurrage software", "freight invoice audit", "shipping overcharges",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://marevoapp.com",
    siteName: "Marevo",
    title: "Marevo — Ship money back.",
    description:
      "AI that audits demurrage & detention invoices against your contracts, drafts the dispute, and recovers what you're owed. Paid mostly on results.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Marevo — Ship money back." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marevo — Ship money back.",
    description:
      "AI that audits demurrage & detention invoices, drafts the dispute, and recovers what you're owed.",
    images: ["/og.png"],
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Marevo",
  url: "https://marevoapp.com",
  logo: "https://marevoapp.com/brand/mark-mint.png",
  slogan: "Ship money back.",
  description:
    "AI freight intelligence that audits demurrage & detention charges and recovers overpayments for importers, forwarders and vessel owners.",
  email: "hello@marevoapp.com",
  foundingDate: "2026",
  areaServed: ["GB", "AE", "SA", "EU"],
};

const themeInit = `(function(){try{var t=localStorage.getItem('marevo-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={`${geist.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
