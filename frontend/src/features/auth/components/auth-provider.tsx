"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AuthUser } from "../types";
import { useCurrentUser } from "../hooks/use-auth-queries";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  /** True once the session lookup resolved to an authenticated user. */
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * App-level auth context. Wraps protected route groups; internally backed by
 * React Query (single deduped /auth/me lookup). UX-only — the backend is the
 * real authorization enforcer (architecture §7).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isPending } = useCurrentUser();

  const value = useMemo<AuthContextValue>(() => {
    const permissions = new Set(user?.permissions ?? []);
    const roles = new Set(user?.roles ?? []);

    return {
      user: user ?? null,
      isLoading: isPending,
      isAuthenticated: Boolean(user),
      hasPermission: (permission) => permissions.has(permission),
      hasRole: (role) => roles.has(role),
    };
  }, [user, isPending]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return context;
}
