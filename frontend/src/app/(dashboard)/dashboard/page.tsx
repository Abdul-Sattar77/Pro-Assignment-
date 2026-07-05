"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { useAuth } from "@/features/auth";

/**
 * Dashboard landing (initial version). Confirms the authenticated session and
 * RBAC payload. Replaced by the full role-aware dashboard (KPIs, activity)
 * as the Dashboard module is built out.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null; // AuthGuard guarantees a user; satisfies narrowing.

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Dashboard"
          description={`Signed in as ${user.email}`}
        />
      </motion.div>

      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Welcome, {user.name} 👋</CardTitle>
            <CardDescription>
              Your workspace is ready. Modules will appear in the sidebar as
              they come online.
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
    </motion.div>
  );
}
