"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAV_SECTIONS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth";

/**
 * Mobile navigation drawer for the STAFF app shell (< lg only). Standalone —
 * it reads the shared nav registry read-only and does NOT touch the desktop
 * sidebar (teammate-owned). The hamburger lives in the topbar.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const close = () => setOpen(false);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              aria-hidden
            />
            <motion.aside
              key="panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r"
              role="dialog"
              aria-label="Navigation"
            >
              {/* Header */}
              <div className="flex h-16 items-center justify-between border-b px-4">
                <Link
                  href={ROUTES.dashboard}
                  onClick={close}
                  className="flex items-center gap-2"
                >
                  <span className="bg-primary text-primary-foreground font-display flex size-8 items-center justify-center rounded-lg text-base font-bold">
                    p
                  </span>
                  <span className="font-display text-lg font-bold tracking-tight">
                    prossignment
                    <span className="text-primary">*</span>
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close navigation menu"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>

              {/* Links */}
              <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
                {NAV_SECTIONS.map((section) => {
                  const visible = section.items.filter(
                    (item) =>
                      !item.permission || hasPermission(item.permission),
                  );
                  if (visible.length === 0) return null;

                  return (
                    <div key={section.title}>
                      <p className="text-muted-foreground/70 mb-2 px-2 font-mono text-[10px] font-medium tracking-[0.2em] uppercase">
                        {section.title}
                      </p>
                      <ul className="space-y-1">
                        {visible.map((item) => {
                          const active =
                            pathname === item.href ||
                            pathname.startsWith(`${item.href}/`);
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={close}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                  "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                  active
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                                )}
                              >
                                {active && (
                                  <span
                                    aria-hidden
                                    className="bg-primary absolute inset-y-1.5 left-0 w-0.5 rounded-full"
                                  />
                                )}
                                <item.icon
                                  className={cn(
                                    "size-4.5 shrink-0",
                                    active && "text-primary",
                                  )}
                                />
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </nav>

              <div className="text-muted-foreground border-t px-4 py-3">
                <span className="flex items-center gap-2 text-xs">
                  <LayoutGrid className="size-3.5" />
                  Prossignment Portal
                </span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
