"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { FileText, Users, Wallet, BarChart3, ArrowRight } from "lucide-react";

interface ActionItem {
  title: string;
  description: string;
  href: string;
  icon: any;
  cta: string;
}

const ACTIONS: ActionItem[] = [
  {
    title: "Assignment Management",
    description: "Manage, assign, and track client project briefs.",
    href: ROUTES.assignments,
    icon: FileText,
    cta: "Manage Assignments",
  },
  {
    title: "User Management",
    description: "Administrate clients, writers, and managers.",
    href: ROUTES.users,
    icon: Users,
    cta: "Manage Users",
  },
  {
    title: "Financial Management",
    description: "Track payouts, invoice summaries, and balances.",
    href: ROUTES.finance,
    icon: Wallet,
    cta: "Manage Finance",
  },
  {
    title: "Reports",
    description: "Review generated system performance briefs.",
    href: ROUTES.reports,
    icon: BarChart3,
    cta: "View Reports",
  },
];

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>
          Direct access to administrative control modules.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.title}
              className="border-border hover:bg-sidebar-accent/50 flex flex-col justify-between rounded-xl border p-5 transition-colors"
            >
              <div className="space-y-2">
                <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-foreground text-sm leading-tight font-semibold">
                  {action.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {action.description}
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="group mt-4 w-full"
              >
                <Link href={action.href}>
                  {action.cta}
                  <ArrowRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
