"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Loader2, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { useAuth, useLogout } from "@/features/auth";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Chrome for CLIENT users — deliberately styled like the public landing
 * (Obsidian & Champagne, floating pill nav, grain), NOT the staff admin
 * shell. Clients are customers; their portal continues the marketing
 * experience. Staff get AppShell instead.
 */
export function ClientShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) return null;

  return (
    <div className="theme-aurora bg-background text-foreground dark min-h-dvh">
      {/* Finishing textures (same as landing) */}
      <div aria-hidden className="aurora-vignette" />
      <div aria-hidden className="aurora-grain" />

      {/* Floating pill nav */}
      <header className="fixed inset-x-0 top-4 z-40 px-4">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-white/10 bg-[#0d0d0f]/85 px-5 backdrop-blur-xl">
          <Link
            href={ROUTES.dashboard}
            className="font-display text-lg font-bold tracking-tight"
          >
            prossignment
            <span className="aurora-text">*</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden font-mono text-[10px] tracking-[0.25em] uppercase sm:inline">
              Your studio
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open account menu"
                  className="flex items-center gap-2 rounded-full py-1 pr-1 pl-2 transition-colors hover:bg-white/5"
                >
                  <span className="hidden max-w-32 truncate text-sm sm:inline">
                    {user.name}
                  </span>
                  <Avatar className="size-8 border border-[#d5b36b]/40">
                    <AvatarFallback className="bg-[#d5b36b]/15 text-xs font-semibold text-[#d5b36b]">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="text-muted-foreground truncate text-xs font-normal">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    logout.mutate();
                  }}
                  disabled={logout.isPending}
                >
                  {logout.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      <main className="relative mx-auto max-w-5xl px-6 pt-32 pb-20">
        {children}
      </main>

      <footer className="relative border-t border-white/8 py-8 text-center">
        <p className="text-muted-foreground font-mono text-xs">
          © {new Date().getFullYear()} Prossignment — Confidential & secure
        </p>
      </footer>
    </div>
  );
}
