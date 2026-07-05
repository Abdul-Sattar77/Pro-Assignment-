"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, LayoutGrid, Menu, X } from "lucide-react";
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

/** True once the page is scrolled past the hero's top edge. SSR-safe. */
function useScrolled(): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 12,
    () => false,
  );
}

/**
 * Landing navbar. Transparent at the top, glass once scrolled. Session-aware:
 * guests see Sign in + Order Now; authenticated visitors see Dashboard.
 */
export function Navbar() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const isAuthed = Boolean(user);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-background/75 border-b shadow-xs backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href={ROUTES.home} className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <LayoutGrid className="size-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Prossignment
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LANDING_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {section.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isAuthed ? (
            <Button asChild>
              <Link href={ROUTES.dashboard}>
                Dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href={ROUTES.login}>Sign in</Link>
              </Button>
              <Button asChild>
                <Link href={orderHref(false)}>
                  Order Now
                  <ArrowRight className="size-4" />
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

      {/* Mobile panel */}
      {menuOpen && (
        <div className="bg-background/95 border-b px-6 pt-2 pb-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {LANDING_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              >
                {section.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {isAuthed ? (
                <Button asChild className="w-full">
                  <Link href={ROUTES.dashboard}>
                    Dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={ROUTES.login}>Sign in</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href={orderHref(false)}>
                      Order Now
                      <ArrowRight className="size-4" />
                    </Link>
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
