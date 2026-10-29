"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-panel" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-cyan/60">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan glow-cyan" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Meridian</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="/#platform" className="text-sm text-mist transition hover:text-paper">
            Platform
          </a>
          <a href="/#how" className="text-sm text-mist transition hover:text-paper">
            How it works
          </a>
          <Link href="/map" className="text-sm text-mist transition hover:text-paper">
            Live map
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={authed ? "/app" : "/app/login"}
            className="hidden rounded-full px-4 py-2 text-xs font-medium text-mist transition hover:text-paper md:inline-flex"
          >
            {authed ? "Dashboard" : "Sign in"}
          </Link>
          <a
            href="/#book"
            className="rounded-full bg-cyan px-4 py-2 text-xs font-medium text-navy transition hover:brightness-110"
          >
            Book a demo
          </a>
        </div>
      </div>
    </nav>
  );
}
