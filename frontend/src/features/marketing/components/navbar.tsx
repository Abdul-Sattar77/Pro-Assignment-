"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
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
    () => window.scrollY > 8,
    () => false,
  );
}

/**
 * Editorial navbar: hairline rule, serif wordmark, understated links, one
 * strong Order action. Session-aware (guests → sign in; members → studio).
 */
export function Navbar() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);

  return (
    <header
      className={cn(
        "bg-background/90 fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-shadow duration-300",
        scrolled ? "shadow-[0_1px_0_var(--border)]" : "",
      )}
    >
      <nav className="mx-auto flex h-[4.5rem] max-w-[88rem] items-center justify-between px-6 lg:px-10">
        <Link
          href={ROUTES.home}
          className="font-serif text-[1.35rem] font-semibold tracking-tight"
        >
          Prossignment
          <span className="text-primary">.</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {LANDING_SECTIONS.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-muted-foreground hover:text-foreground group text-sm transition-colors"
            >
              <span className="text-primary/70 mr-1.5 font-mono text-[11px]">
                0{index + 1}
              </span>
              {section.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isAuthed ? (
            <Button
              asChild
              className="h-10 rounded-full px-5 text-sm font-medium"
            >
              <Link href={ROUTES.dashboard}>
                Open studio
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Link
                href={ROUTES.login}
                className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
              >
                Sign in
              </Link>
              <Button
                asChild
                className="h-10 rounded-full px-5 text-sm font-medium"
              >
                <Link href={orderHref(false)}>
                  Place an order
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {menuOpen && (
        <div className="bg-background border-b px-6 pt-1 pb-5 md:hidden">
          <div className="flex flex-col">
            {LANDING_SECTIONS.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setMenuOpen(false)}
                className="text-foreground border-b py-3.5 font-serif text-lg"
              >
                <span className="text-primary/70 mr-2 font-mono text-xs">
                  0{index + 1}
                </span>
                {section.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2.5">
              {isAuthed ? (
                <Button asChild className="h-11 w-full rounded-full">
                  <Link href={ROUTES.dashboard}>
                    Open studio
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild className="h-11 w-full rounded-full">
                    <Link href={orderHref(false)}>
                      Place an order
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="h-11 w-full rounded-full"
                  >
                    <Link href={ROUTES.login}>Sign in</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
