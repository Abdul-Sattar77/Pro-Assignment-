import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ROUTES } from "@/constants/routes";
import { BrandMark } from "@/features/marketing";

/**
 * Auth route group shell: cinematic brand panel (desktop) + centered form
 * column. The panel is fixed-dark (obsidian & champagne, matching the
 * landing identity) regardless of app theme; the form column follows theme.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel — hidden on small screens */}
      <aside className="relative hidden overflow-hidden lg:block">
        {/* Photography */}
        <Image
          src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80"
          alt="Fountain pen writing on paper"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 0vw"
          className="object-cover"
        />
        {/* Obsidian wash + gold breath */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-[#070b18] via-[#070b18]/72 to-[#070b18]/38"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_30%_85%,rgba(59,130,246,0.16),transparent_70%)]"
        />
        {/* Film grain */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Panel content */}
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link
            href={ROUTES.home}
            className="font-display flex items-center gap-2.5 text-2xl font-bold tracking-tight text-[#eaf0ff]"
          >
            <BrandMark className="size-9 text-[#eaf0ff]" />
            prossignment
          </Link>

          <div className="max-w-md">
            <p className="font-mono text-[11px] tracking-[0.3em] text-[#3b82f6] uppercase">
              The assignment studio
            </p>
            <blockquote className="font-display mt-5 text-4xl leading-tight font-bold text-balance text-[#eaf0ff]">
              Every great grade begins with a single, well-placed brief.
            </blockquote>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#eaf0ff]/60">
              Vetted experts, live progress, revisions included — from first
              enquiry to final approval, in one private workspace.
            </p>

            {/* Trust row */}
            <div className="mt-9 flex items-center gap-8 border-t border-white/12 pt-6">
              {[
                ["2,500+", "delivered"],
                ["98%", "on time"],
                ["4.9/5", "rating"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-xl font-bold text-[#3b82f6]">
                    {value}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] tracking-[0.18em] text-[#eaf0ff]/50 uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="font-mono text-[11px] text-[#eaf0ff]/40">
            © {new Date().getFullYear()} Prossignment Portal — Confidential &
            secure
          </p>
        </div>
      </aside>

      {/* Form column */}
      <main className="relative flex flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Link
            href={ROUTES.home}
            className="font-display flex items-center gap-2 text-lg font-bold tracking-tight lg:hidden"
          >
            <BrandMark className="text-foreground size-6" />
            prossignment
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
