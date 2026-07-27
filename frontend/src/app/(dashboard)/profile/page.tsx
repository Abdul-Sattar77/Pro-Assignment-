"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { staggerContainer, fadeIn } from "@/animations/variants";
import {
  Star,
  TrendingUp,
  Briefcase,
  Mail,
  Calendar,
  Shield,
  Edit2,
  Check,
  X,
  Clock,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useProfileStats } from "@/features/auth";
import { formatCurrency } from "@/config/currency";

const DEFAULT_STATS = {
  assignmentsCompleted: 0,
  assignmentsInProgress: 0,
  totalEarned: "0",
  avgRating: 5.0,
  responseTime: "< 2 hrs",
  memberSince: "January 2026",
  totalLeads: 0,
  convertedLeads: 0,
  filesManaged: 0,
  messagesExchanged: 0,
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: stats = DEFAULT_STATS } = useProfileStats();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [editBio, setEditBio] = useState("");

  if (!user) return null;

  const name = user.name;

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isWriter = user.roles.includes("writer");
  const memberSince = user.createdAt
    ? format(new Date(user.createdAt), "MMMM yyyy")
    : stats.memberSince || "—";
  const rating = user.averageRating ?? stats.avgRating ?? 0;
  const workload = user.currentWorkload ?? stats.assignmentsInProgress ?? 0;

  // Real skills come from the writer's structured profile / expertise.
  const wp = user.writerProfile;
  const skills = [wp?.subjects, wp?.codingLanguages, user.expertise]
    .filter(Boolean)
    .join(", ")
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  function saveEdit() {
    setBio(editBio);
    setEditing(false);
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-4xl space-y-5"
    >
      {/* Header */}
      <motion.div variants={fadeIn}>
        <Card className="overflow-hidden">
          <div className="from-primary/40 to-primary/10 h-28 bg-linear-to-r" />
          <CardContent className="pt-0 pb-6">
            <div className="-mt-12 mb-5 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative w-fit">
                <div className="bg-primary/20 border-background text-primary flex size-24 items-center justify-center rounded-2xl border-4 text-3xl font-bold select-none">
                  {initials}
                </div>
              </div>

              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold">{name}</h1>
                  <button
                    onClick={() => setEditing(!editing)}
                    aria-label="Edit bio"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {user.roles.map((role: string) => (
                    <Badge
                      key={role}
                      variant="outline"
                      className="border-primary/30 text-primary bg-primary/10 text-xs capitalize"
                    >
                      {role.replace("_", " ")}
                    </Badge>
                  ))}
                  <span className="flex items-center gap-1 text-xs text-green-500 dark:text-green-400">
                    <span className="size-1.5 animate-pulse rounded-full bg-green-500 dark:bg-green-400" />
                    Active
                  </span>
                </div>
              </div>

              {editing && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} className="h-8 gap-1">
                    <Check className="size-3.5" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(false)}
                    className="h-8 gap-1"
                  >
                    <X className="size-3.5" /> Cancel
                  </Button>
                </div>
              )}
            </div>

            {editing ? (
              <Input
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="mb-4 text-sm"
                placeholder="Write a short bio…"
              />
            ) : (
              bio && (
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {bio}
                </p>
              )
            )}

            {/* Real meta */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Mail className="size-3.5" /> {user.email}
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5" /> Member since {memberSince}
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Shield className="size-3.5" /> {user.permissions.length}{" "}
                permissions
              </span>
              {rating > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-400">
                  <Star className="size-3.5 fill-amber-400" />{" "}
                  {rating.toFixed(1)} rating
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Real stat cards */}
      <motion.div
        variants={fadeIn}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <Card className="p-4 text-center">
          <p className="text-primary text-3xl font-bold tabular-nums">
            {stats.assignmentsCompleted ?? 0}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Assignments done</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-blue-500 tabular-nums dark:text-blue-400">
            {workload}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Active work</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-amber-500 tabular-nums dark:text-amber-400">
            {rating > 0 ? rating.toFixed(1) : "—"}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Average rating</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-emerald-500 tabular-nums dark:text-emerald-400">
            {user.permissions.length}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Permissions</p>
        </Card>
      </motion.div>

      {/* Expertise (real, when present) */}
      {skills.length > 0 && (
        <motion.div variants={fadeIn}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Expertise &amp; skills
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <Badge
                  key={`${skill}:${i}`}
                  variant="outline"
                  className="bg-muted/40 cursor-default px-3 py-1 text-xs"
                >
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Earnings / Revenue Card */}
      <motion.div variants={fadeIn}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-muted-foreground text-xs">
                {isWriter ? "Total Earnings" : "Total Revenue Managed"}
              </p>
              <p className="text-primary mt-1 text-3xl font-bold tabular-nums">
                {formatCurrency(user.totalEarnings ?? stats.totalEarned)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {isWriter
                  ? "From verified payouts"
                  : `Across ${stats.assignmentsCompleted} completed assignments`}
              </p>
            </div>
            <div className="bg-primary/15 flex size-16 items-center justify-center rounded-2xl">
              {(user.totalEarnings ?? 0) > 0 ||
              (stats.assignmentsCompleted ?? 0) > 0 ? (
                <TrendingUp className="text-primary size-8" />
              ) : (
                <Briefcase className="text-primary size-8" />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
