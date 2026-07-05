import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { LANDING_SECTIONS } from "../constants";

/** Landing footer: brand, section links, legal line. */
export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
          <div className="text-center sm:text-left">
            <Link href={ROUTES.home} className="inline-flex items-center gap-2">
              <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                <LayoutGrid className="size-4" />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                Prossignment
              </span>
            </Link>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm">
              Expert help for every assignment — managed in one beautifully
              simple workspace.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {LANDING_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {section.label}
              </a>
            ))}
            <Link
              href={ROUTES.login}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>

        <div className="text-muted-foreground mt-10 border-t pt-6 text-center text-xs">
          © {new Date().getFullYear()} Prossignment Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
