"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MarevoMark({ className = "h-5 w-auto" }: { className?: string }) {
  // Licensed M-arrow mark: dark version on light theme, mint on dark.
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mark-dark.png" alt="" className={`${className} dark:hidden`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mark-mint.png" alt="" className={`${className} hidden dark:block`} />
    </>
  );
}

export function Logo({ size = "base" }: { size?: "base" | "lg" }) {
  return (
    <span className="flex items-center gap-2.5">
      <MarevoMark className={size === "lg" ? "h-6 w-auto" : "h-5 w-auto"} />
      <span className={`font-semibold tracking-tight ${size === "lg" ? "text-xl" : "text-[17px]"}`}>
        marevo
      </span>
    </span>
  );
}

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const sb = supabase();
    sb.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => {
      window.removeEventListener("scroll", onScroll);
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-200 ${
        scrolled ? "border-border bg-surface/85 backdrop-blur-xl" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/">
          <Logo />
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          <a href="/#product" className="text-sm text-muted transition hover:text-fg">Product</a>
          <a href="/#how" className="text-sm text-muted transition hover:text-fg">How it works</a>
          <a href="/#pricing" className="text-sm text-muted transition hover:text-fg">Pricing</a>
          <a href="/#owners" className="text-sm text-muted transition hover:text-fg">Vessel owners</a>
          <Link href="/map" className="text-sm text-muted transition hover:text-fg">Live demo</Link>
        </div>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href={authed ? "/app" : "/app/login"}
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-muted transition hover:text-fg md:inline-flex"
          >
            {authed ? "Dashboard" : "Sign in"}
          </Link>
          <a
            href="/#audit"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:brightness-105"
          >
            Get a free audit
          </a>
        </div>
      </div>
    </nav>
  );
}
