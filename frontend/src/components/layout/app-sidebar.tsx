"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAV_SECTIONS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth";
import { useSidebarStore } from "./use-sidebar-store";

/**
 * Application sidebar: brand, permission-filtered navigation, collapse toggle.
 * Collapsed state persists via Zustand (localStorage). Fixed on desktop;
 * hidden on small screens (topbar handles mobile nav in a later iteration).
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  const { collapsed, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30 hidden flex-col border-r transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Link href={ROUTES.dashboard} className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
            <LayoutGrid className="size-4" />
          </span>
          {!collapsed && (
            <span className="truncate font-semibold tracking-tight">
              Prossignment
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => {
          const visible = section.items.filter(
            (item) => !item.permission || hasPermission(item.permission),
          );
          if (visible.length === 0) return null;

          return (
            <div key={section.title}>
              {!collapsed && (
                <p className="text-muted-foreground mb-2 px-2 text-[11px] font-semibold tracking-wider uppercase">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {visible.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const link = (
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "size-4.5 shrink-0",
                          active && "text-primary",
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  );

                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn("w-full", collapsed && "px-0")}
        >
          <ChevronsLeft
            className={cn(
              "size-4 transition-transform duration-200",
              collapsed && "rotate-180",
            )}
          />
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
