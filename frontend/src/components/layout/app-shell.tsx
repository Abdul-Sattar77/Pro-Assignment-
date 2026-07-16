"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChatWidget } from "@/features/chat";
import { AppSidebar } from "./app-sidebar";
import { Topbar } from "./topbar";
import { useSidebarStore } from "./use-sidebar-store";

/**
 * Authenticated application shell: fixed sidebar + sticky topbar + content
 * area. Content offset tracks the sidebar's collapsed state.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const collapsed = useSidebarStore((state) => state.collapsed);

  return (
    <div className="min-h-dvh">
      <AppSidebar />
      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-200 ease-out",
          collapsed ? "lg:pl-16" : "lg:pl-60",
        )}
      >
        <Topbar />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
