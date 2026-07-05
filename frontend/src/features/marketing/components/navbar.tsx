"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/features/auth";
import { LANDING_SECTIONS, orderHref } from "../constants";

function subscribeToScroll(callback: () => void): () => void {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

/** True once the page is scrolled. SSR-safe. */
function useScrolled(): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 24,
    () => false,
  );
}

/**
 * Aurora navbar: floating pill that condenses on scroll. Session-aware —
 * guests get Sign in + gradient Order CTA; members get "Enter studio".
 */
export function Navbar() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);

  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4">
      <nav
        className={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border px-5 transition-all duration-300",
          scrolled
            ? "border-white/12 bg-[#0a0a18]/85 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Link
          href={ROUTES.home}
          className="font-display text-lg font-bold tracking-tight"
        >
          prossignment
          <span className="aurora-text">*</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {LANDING_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-muted-foreground hover:text-foreground rounded-full px-4 py-2 text-sm transition-colors hover:bg-white/5"
            >
              {section.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Link
              href={ROUTES.dashboard}
              className="flex h-10 items-center gap-1.5 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-semibold text-white transition-transform hover:scale-[1.04]"
            >
              Enter studio
              <ArrowUpRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                href={ROUTES.login}
                className="text-muted-foreground hover:text-foreground px-3 text-sm transition-colors"
              >
                Sign in
              </Link>
              <Link
                href={orderHref(false)}
                className="flex h-10 items-center gap-1.5 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-semibold text-white transition-transform hover:scale-[1.04]"
              >
                Start order
                <ArrowUpRight className="size-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-full md:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="mx-auto mt-2 max-w-5xl rounded-3xl border border-white/12 bg-[#0a0a18]/95 p-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col">
            {LANDING_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setMenuOpen(false)}
                className="text-foreground/90 rounded-xl px-3 py-3 text-base transition-colors hover:bg-white/5"
              >
                {section.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {isAuthed ? (
                <Link
                  href={ROUTES.dashboard}
                  className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold text-white"
                >
                  Enter studio
                  <ArrowUpRight className="size-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href={orderHref(false)}
                    className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold text-white"
                  >
                    Start order
                    <ArrowUpRight className="size-4" />
                  </Link>
                  <Link
                    href={ROUTES.login}
                    className="text-foreground/90 flex h-12 items-center justify-center rounded-full border border-white/15 text-sm"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
