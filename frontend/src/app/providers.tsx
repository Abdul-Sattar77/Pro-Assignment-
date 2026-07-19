"use client";

import { useState, type ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CallProvider } from "@/features/chat";

/**
 * Global client providers for the whole app.
 * - ThemeProvider   → light/dark/system theme (design-system §14)
 * - QueryClient     → server-state cache (architecture §14; realtime-ready)
 * - Toaster         → app-wide toast notifications (design-system §15)
 *
 * Auth context is added by the Identity module and composed here later.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {/* Honor the user's OS reduced-motion preference app-wide. */}
        <MotionConfig reducedMotion="user">
          <TooltipProvider delayDuration={200}>
            <CallProvider>{children}</CallProvider>
          </TooltipProvider>
        </MotionConfig>
        <Toaster richColors position="bottom-right" closeButton />
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
