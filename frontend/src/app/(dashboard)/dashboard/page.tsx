"use client";

import { motion } from "framer-motion";
import { Loader2, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { useAuth, useLogout } from "@/features/auth";

/**
 * Dashboard landing (initial version). Confirms the authenticated session and
 * RBAC payload end-to-end. Replaced by the full role-aware dashboard as the
 * Dashboard module is built out.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const logout = useLogout();

  if (!user) return null; // AuthGuard guarantees a user; satisfies narrowing.

  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Signed in as {user.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LogOut className="size-4" />
            )}
            Sign out
          </Button>
        </div>
      </header>

      <motion.main
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-5xl space-y-6 p-6"
      >
        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Welcome, {user.name} 👋</CardTitle>
              <CardDescription>
                Your workspace is ready. Modules will appear here as they come
                online.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm">Roles:</span>
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary" className="capitalize">
                    {role.replace("_", " ")}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                {user.permissions.length} permissions active for this account.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.main>
    </div>
  );
}
