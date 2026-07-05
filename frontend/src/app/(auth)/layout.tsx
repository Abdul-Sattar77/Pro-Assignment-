import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ROUTES } from "@/constants/routes";

/**
 * Auth route group shell: brand panel (desktop) + centered form column.
 * Route pages render inside the right column.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel — hidden on small screens */}
      <aside className="bg-sidebar text-sidebar-foreground relative hidden flex-col justify-between overflow-hidden border-r p-10 lg:flex dark:bg-[#0e1626]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_color-mix(in_oklab,var(--primary)_14%,transparent),transparent_55%)]"
        />
        <Link href={ROUTES.home} className="relative flex items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
            <LayoutGrid className="size-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight">
            Prossignment
          </span>
        </Link>

        <div className="relative max-w-md space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-balance">
            Every assignment, one workspace.
          </h2>
          <p className="text-muted-foreground text-base">
            Leads, assignments, files, messaging, and finance — centralized for
            your whole team, from first enquiry to final payment.
          </p>
        </div>

        <p className="text-muted-foreground relative text-xs">
          © {new Date().getFullYear()} Prossignment Portal
        </p>
      </aside>

      {/* Form column */}
      <main className="relative flex flex-col">
        <div className="flex items-center justify-between p-6 lg:justify-end">
          <Link
            href={ROUTES.home}
            className="flex items-center gap-2 lg:hidden"
          >
            <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <LayoutGrid className="size-4" />
            </span>
            <span className="font-semibold tracking-tight">Prossignment</span>
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
