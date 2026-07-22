"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/features/auth";
import { NAV_LINKS, orderHref } from "../constants";
import { BrandMark } from "./brand-mark";

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
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === ROUTES.home ? pathname === href : pathname.startsWith(href);

  // The home hero is light; when we're on it and not yet scrolled, the floating
  // navbar sits over a light background and needs dark text. Everywhere else
  // (and once scrolled into the dark pill) it uses light text.
  const onLight = pathname === ROUTES.home && !scrolled;

  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4">
      <nav
        className={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border px-5 transition-all duration-300",
          scrolled
            ? "border-white/12 bg-[#0b1428]/85 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Link
          href={ROUTES.home}
          className={cn(
            "font-display flex items-center gap-2 text-lg font-bold tracking-tight",
            onLight ? "text-slate-900" : "text-foreground",
          )}
        >
          <BrandMark
            className={cn(
              "size-7",
              onLight ? "text-slate-900" : "text-foreground",
            )}
          />
          prossignment
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors",
                onLight ? "hover:bg-slate-900/5" : "hover:bg-white/5",
                isActive(link.href)
                  ? onLight
                    ? "text-slate-900"
                    : "text-foreground"
                  : onLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthed ? (
            <Link
              href={ROUTES.dashboard}
              className="flex h-10 items-center gap-1.5 rounded-full bg-[#3b82f6] px-5 text-sm font-semibold text-white transition-all hover:scale-[1.04] hover:bg-[#60a5fa]"
            >
              Enter studio
              <ArrowUpRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                href={ROUTES.login}
                className={cn(
                  "px-3 text-sm transition-colors",
                  onLight
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Sign in
              </Link>
              <Link
                href={orderHref(false)}
                className="flex h-10 items-center gap-1.5 rounded-full bg-[#3b82f6] px-5 text-sm font-semibold text-white transition-all hover:scale-[1.04] hover:bg-[#60a5fa]"
              >
                Submit assignment
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
          className={cn("rounded-full md:hidden", onLight && "text-slate-900")}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </nav>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="mx-auto mt-2 max-w-5xl rounded-3xl border border-white/12 bg-[#0b1428]/95 p-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-3 text-base transition-colors hover:bg-white/5",
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-foreground/90",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {isAuthed ? (
                <Link
                  href={ROUTES.dashboard}
                  className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-[#3b82f6] text-sm font-semibold text-white"
                >
                  Enter studio
                  <ArrowUpRight className="size-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href={orderHref(false)}
                    className="flex h-12 items-center justify-center gap-1.5 rounded-full bg-[#3b82f6] text-sm font-semibold text-white"
                  >
                    Submit assignment
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
