"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Calendar,
  Star,
  Briefcase,
  BookOpen,
  FileText,
  Building,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/config/currency";
import type { UserListItem } from "../types";

interface UserDetailDrawerProps {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDrawer({
  user,
  open,
  onOpenChange,
}: UserDetailDrawerProps) {
  if (!user) return null;

  const isClient = user.roles.includes("client");
  const isWriter = user.roles.includes("writer");
  const isPM = user.roles.includes("project_manager");

  const formattedDate = user.createdAt
    ? format(new Date(user.createdAt), "PPP")
    : "Recently registered";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full text-lg font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {user.name}
                </DialogTitle>
                <DialogDescription className="mt-0.5 flex items-center gap-2 text-xs">
                  <Mail className="size-3.5" /> {user.email}
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active Account" : "Suspended / Inactive"}
              </Badge>
              <div className="flex flex-wrap justify-end gap-1">
                {user.roles.map((r) => (
                  <Badge
                    key={r}
                    variant="outline"
                    className="text-[10px] capitalize"
                  >
                    {r.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4 w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {isClient && (
              <TabsTrigger value="client">Client Details</TabsTrigger>
            )}
            {isWriter && (
              <TabsTrigger value="writer">Writer Profile</TabsTrigger>
            )}
            {isPM && <TabsTrigger value="pm">PM Performance</TabsTrigger>}
            {!isClient && !isWriter && !isPM && (
              <TabsTrigger value="roles">Roles & Notes</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    <Calendar className="size-3.5" /> Date Joined
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-3 text-sm font-medium">
                  {formattedDate}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    <Star className="size-3.5 text-amber-500" /> Rating /
                    Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between px-4 pt-0 pb-3 text-sm font-medium">
                  <span>
                    ★{" "}
                    {user.averageRating ? user.averageRating.toFixed(1) : "5.0"}
                  </span>
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(user.totalEarnings ?? 0)}
                  </span>
                </CardContent>
              </Card>
            </div>

            {user.notes && (
              <Card>
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    <FileText className="size-3.5" /> Internal Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground px-4 pt-0 pb-3 text-sm whitespace-pre-wrap">
                  {user.notes}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Client Tab */}
          {isClient && (
            <TabsContent value="client" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Building className="text-primary size-4" /> Client Profile
                    & History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">
                        Account Status:
                      </span>{" "}
                      <span className="font-semibold text-emerald-600">
                        Verified Client
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Preferred Contact:
                      </span>{" "}
                      Email & Chat
                    </div>
                  </div>
                  <div className="bg-muted/40 space-y-1 rounded-lg border p-3 text-xs">
                    <p className="text-foreground font-medium">
                      Assignment History Summary
                    </p>
                    <p className="text-muted-foreground">
                      Client orders, active briefs, and payment receipts are
                      logged under the Assignments and Invoices tabs.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Writer Tab */}
          {isWriter && (
            <TabsContent value="writer" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <BookOpen className="text-primary size-4" /> Writer
                    Expertise & Workload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4">
                  <div>
                    <span className="text-muted-foreground text-xs font-medium">
                      Availability Status:
                    </span>
                    <p className="text-primary mt-0.5 text-sm font-semibold capitalize">
                      {user.availability || "Available for assignments"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs font-medium">
                      Subject Expertise:
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(
                        user.expertise?.split(",") || [
                          "Computer Science",
                          "Academic Writing",
                          "Business",
                        ]
                      ).map((sub) => (
                        <Badge
                          key={sub}
                          variant="secondary"
                          className="text-xs"
                        >
                          {sub.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-md border p-2.5 text-center">
                      <p className="text-muted-foreground text-xs">
                        Overall Rating
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-amber-500">
                        ★{" "}
                        {user.averageRating
                          ? user.averageRating.toFixed(1)
                          : "4.9"}
                      </p>
                    </div>
                    <div className="rounded-md border p-2.5 text-center">
                      <p className="text-muted-foreground text-xs">
                        Verified Earnings
                      </p>
                      <p className="mt-0.5 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(user.totalEarnings ?? 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* PM Tab */}
          {isPM && (
            <TabsContent value="pm" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="px-4 py-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Briefcase className="text-primary size-4" /> Project
                    Manager Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted/30 rounded-md border p-3">
                      <p className="text-muted-foreground">Role Scope</p>
                      <p className="text-foreground mt-0.5 font-semibold">
                        Order Review & Delivery
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-md border p-3">
                      <p className="text-muted-foreground">
                        Active Team Oversight
                      </p>
                      <p className="mt-0.5 font-semibold text-emerald-600">
                        All Assigned Writers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
