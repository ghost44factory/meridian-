import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meridian — Recover the shipping charges you don't owe",
  description:
    "Meridian tracks your containers, audits every demurrage & detention invoice against your contracts, and drafts the dispute for you. Free audit of last quarter's invoices.",
  openGraph: {
    title: "Meridian — AI-native freight intelligence",
    description: "Every container tracked. Every overcharge contested.",
    type: "website",
  },
};

const themeInit = `(function(){try{var t=localStorage.getItem('meridian-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
