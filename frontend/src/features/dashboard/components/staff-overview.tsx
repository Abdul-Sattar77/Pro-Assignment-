"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowUpRight, ShieldCheck, UserRound, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { ROUTES } from "@/constants/routes";
import { Can, useAuth } from "@/features/auth";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Workspace overview for STAFF roles (admin, project manager, writer) inside
 * the AppShell. Photography banner + real account/RBAC data. Module KPIs
 * land here as their modules come online.
 */
export function StaffOverview() {
  const { user } = useAuth();
  if (!user) return null;

  const firstName = user.name.split(/\s+/)[0] ?? user.name;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Photography banner */}
      <motion.div
        variants={fadeIn}
        className="relative overflow-hidden rounded-2xl border"
      >
        <Image
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1800&q=80"
          alt="Library shelves lined with books"
          width={1800}
          height={520}
          priority
          className="h-48 w-full object-cover sm:h-56"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-[#0a0a0c]/92 via-[#0a0a0c]/65 to-[#0a0a0c]/25"
        />
        <div className="absolute inset-0 flex flex-col justify-center p-7 sm:p-9">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#d5b36b] uppercase">
            {greeting()}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-[#f2f0ea] sm:text-4xl">
            {firstName}&apos;s workspace
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {user.roles.map((role) => (
              <Badge
                key={role}
                className="border-[#d5b36b]/40 bg-[#d5b36b]/15 text-[#ecd9a8] capitalize"
                variant="outline"
              >
                {role.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Real account facts */}
      <motion.div variants={fadeIn} className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              Permissions
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {user.permissions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            active for this account
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <UserRound className="size-3.5" />
              Member since
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {user.createdAt ? format(new Date(user.createdAt), "MMM d") : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {user.createdAt ? format(new Date(user.createdAt), "yyyy") : ""}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Signed in as</CardDescription>
            <CardTitle className="truncate text-lg">{user.email}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-emerald-500" />
            Session active
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick actions (existing destinations only) */}
      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick actions</CardTitle>
            <CardDescription>
              Modules appear in the sidebar as they come online.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Can permission="users.view">
              <Button asChild>
                <Link href={ROUTES.users}>
                  <Users className="size-4" />
                  Manage users
                </Link>
              </Button>
            </Can>
            <Button variant="outline" asChild>
              <Link href={ROUTES.home} target="_blank">
                View public site
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
