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
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/config/currency";
import { useUpdateUser } from "../hooks/use-users";
import type { UserListItem } from "../types";

const CLIENT_FLAGS = [
  { id: "pays_late", label: "Pays Late", color: "bg-rose-500/10 text-rose-600 border-rose-500/30" },
  { id: "negotiates", label: "Negotiates", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  { id: "high_value", label: "High Value", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  { id: "referral", label: "Referral", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  { id: "strict_professor", label: "Strict Professor", color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
] as const;

interface UserDetailDrawerProps {
  user: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDrawer({ user, open, onOpenChange }: UserDetailDrawerProps) {
  const updateUser = useUpdateUser();

  if (!user) return null;

  const isClient = user.roles.includes("client");
  const isWriter = user.roles.includes("writer");
  const isPM = user.roles.includes("project_manager");

  const formattedDate = user.createdAt
    ? format(new Date(user.createdAt), "PPP")
    : "Recently registered";

  const currentFlags = user.clientFlags ?? [];

  const handleFlagToggle = (flagId: string) => {
    const next = currentFlags.includes(flagId)
      ? currentFlags.filter((f) => f !== flagId)
      : [...currentFlags, flagId];
    updateUser.mutate({ id: user.id, payload: { clientFlags: next } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">{user.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-xs mt-0.5">
                  <Mail className="size-3.5" /> {user.email}
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active Account" : "Suspended / Inactive"}
              </Badge>
              <div className="flex gap-1 flex-wrap justify-end">
                {user.roles.map((r) => (
                  <Badge key={r} variant="outline" className="capitalize text-[10px]">
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
            {isClient && <TabsTrigger value="client">Client Details</TabsTrigger>}
            {isWriter && <TabsTrigger value="writer">Writer Profile</TabsTrigger>}
            {isPM && <TabsTrigger value="pm">PM Performance</TabsTrigger>}
            {!isClient && !isWriter && !isPM && (
              <TabsTrigger value="roles">Roles &amp; Notes</TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" /> Date Joined
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0 font-medium text-sm">
                  {formattedDate}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Star className="size-3.5 text-amber-500" /> Rating / Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0 font-medium text-sm flex items-center justify-between">
                  <span>★ {user.averageRating ? user.averageRating.toFixed(1) : "5.0"}</span>
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(user.totalEarnings ?? 0)}
                  </span>
                </CardContent>
              </Card>
            </div>

            {user.notes && (
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5" /> Internal Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0 text-sm text-muted-foreground whitespace-pre-wrap">
                  {user.notes}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Client Tab */}
          {isClient && (
            <TabsContent value="client" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Building className="size-4 text-primary" /> Client Profile &amp; Flags
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Account Status:</span>{" "}
                      <span className="font-semibold text-emerald-600">Verified Client</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Preferred Contact:</span> Email &amp; Chat
                    </div>
                  </div>

                  {/* Client Flags — editable toggles wired to PATCH /users/{id} */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Structured Client Flags:
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-normal">
                        {updateUser.isPending && (
                          <Loader2 className="size-3 animate-spin" />
                        )}
                        Click flag to toggle &amp; save
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CLIENT_FLAGS.map((flag) => {
                        const active = currentFlags.includes(flag.id);
                        return (
                          <Badge
                            key={flag.id}
                            variant={active ? "default" : "outline"}
                            className={`cursor-pointer select-none transition-all ${
                              active ? flag.color : "opacity-50 hover:opacity-100"
                            } ${updateUser.isPending ? "pointer-events-none opacity-60" : ""}`}
                            onClick={() => handleFlagToggle(flag.id)}
                          >
                            {flag.label} {active && "✓"}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-lg border p-3 bg-muted/40 space-y-1 text-xs">
                    <p className="font-medium text-foreground">Assignment History Summary</p>
                    <p className="text-muted-foreground">
                      Client orders, active briefs, and payment receipts are logged under the Assignments and Invoices tabs.
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
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" /> Writer Expertise &amp; Workload
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Availability Status:</span>
                    <p className="text-sm font-semibold capitalize text-primary mt-0.5">
                      {user.availability || "Available for assignments"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Subject Expertise:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(user.expertise?.split(",") || ["Computer Science", "Academic Writing", "Business"]).map((sub) => (
                        <Badge key={sub} variant="secondary" className="text-xs">
                          {sub.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-md border p-2.5 text-center">
                      <p className="text-xs text-muted-foreground">Overall Rating</p>
                      <p className="text-lg font-bold text-amber-500 mt-0.5">
                        ★ {user.averageRating ? user.averageRating.toFixed(1) : "4.9"}
                      </p>
                    </div>
                    <div className="rounded-md border p-2.5 text-center">
                      <p className="text-xs text-muted-foreground">Verified Earnings</p>
                      <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
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
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Briefcase className="size-4 text-primary" /> Project Manager Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border p-3 bg-muted/30">
                      <p className="text-muted-foreground">Role Scope</p>
                      <p className="font-semibold text-foreground mt-0.5">Order Review &amp; Delivery</p>
                    </div>
                    <div className="rounded-md border p-3 bg-muted/30">
                      <p className="text-muted-foreground">Active Team Oversight</p>
                      <p className="font-semibold text-emerald-600 mt-0.5">All Assigned Writers</p>
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
