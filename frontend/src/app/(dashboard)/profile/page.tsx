"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeIn } from "@/animations/variants";
import {
  CheckCircle2,
  Star,
  TrendingUp,
  Clock,
  Award,
  Mail,
  Calendar,
  Shield,
  FileText,
  MessageSquare,
  FolderOpen,
  Edit2,
  Check,
  X,
  Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth, useProfileStats } from "@/features/auth";

const DEFAULT_STATS = {
  assignmentsCompleted: 0,
  assignmentsInProgress: 0,
  totalEarned: "PKR 0",
  avgRating: 5.0,
  responseTime: "< 2 hrs",
  memberSince: "January 2026",
  totalLeads: 0,
  convertedLeads: 0,
  filesManaged: 0,
  messagesExchanged: 0,
};

const ACHIEVEMENTS = [
  {
    label: "Top Performer",
    icon: Award,
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
  {
    label: "Fast Responder",
    icon: Clock,
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  {
    label: "High Converter",
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
  },
  {
    label: "Client Favourite",
    icon: Star,
    color: "text-purple-400",
    bg: "bg-purple-400/10 border-purple-400/20",
  },
];

const SKILLS = [
  "Project Management",
  "Client Relations",
  "Assignment Review",
  "Writer Coordination",
  "Lead Conversion",
  "Quality Assurance",
  "Team Leadership",
  "SaaS Operations",
];

const RECENT_ACTIVITY = [
  { text: "Converted Lead L002 to Assignment #A-105", time: "2 hours ago" },
  {
    text: "Reviewed and approved Draft for Assignment #A-101",
    time: "5 hours ago",
  },
  { text: "Assigned writer Sara to Assignment #A-104", time: "1 day ago" },
  {
    text: "Replied to client John Smith on Assignment #A-101",
    time: "1 day ago",
  },
  { text: "Uploaded revision notes for Assignment #A-103", time: "2 days ago" },
];

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: stats = DEFAULT_STATS } = useProfileStats();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState(
    "Experienced Project Manager at Prossignment. I coordinate between clients and writers to deliver high-quality academic work on time.",
  );
  const [editBio, setEditBio] = useState(bio);
  const [avatarColor] = useState("from-primary/40 to-primary/10");

  if (!user) return null;

  const name = displayName || user.name;
  const conversionRate = stats.totalLeads > 0
    ? Math.round((stats.convertedLeads / stats.totalLeads) * 100)
    : 0;
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
      {/* ── Profile Header ── */}
      <motion.div variants={fadeIn}>
        <Card className="overflow-hidden">
          <div className={`h-28 bg-gradient-to-r ${avatarColor}`} />
          <CardContent className="pt-0 pb-6">
            <div className="-mt-12 mb-5 flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="relative w-fit">
                <div className="bg-primary/20 border-background text-primary flex size-24 items-center justify-center rounded-2xl border-4 text-3xl font-bold select-none">
                  {initials}
                </div>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full shadow-md transition-colors">
                  <Camera className="size-3.5" />
                </button>
              </div>

              {/* Name + role */}
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold">{name}</h1>
                  <button
                    onClick={() => setEditing(!editing)}
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
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <span className="size-1.5 animate-pulse rounded-full bg-green-400" />
                    Active
                  </span>
                </div>
              </div>

              {/* Edit controls */}
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

            {/* Bio */}
            {editing ? (
              <Input
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="mb-4 text-sm"
                placeholder="Write a short bio..."
              />
            ) : (
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {bio}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Mail className="size-3.5" /> {user.email}
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Calendar className="size-3.5" /> Member since{" "}
                {stats.memberSince}
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Shield className="size-3.5" /> {user.permissions.length}{" "}
                permissions
              </span>
              <span className="flex items-center gap-1.5 text-xs text-amber-400">
                <Star className="size-3.5 fill-amber-400" />{" "}
                {stats.avgRating} rating
              </span>
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Clock className="size-3.5" /> {stats.responseTime}{" "}
                response
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Stats Cards ── */}
      <motion.div
        variants={fadeIn}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          {
            value: stats.assignmentsCompleted,
            label: "Assignments Done",
            color: "text-primary",
          },
          {
            value: `${conversionRate}%`,
            label: "Lead Conversion",
            color: "text-green-400",
          },
          {
            value: stats.avgRating,
            label: "Avg Rating",
            color: "text-amber-400",
          },
          {
            value: stats.assignmentsInProgress,
            label: "In Progress",
            color: "text-blue-400",
          },
        ].map(({ value, label, color }) => (
          <Card
            key={label}
            className="hover:bg-muted/30 p-4 text-center transition-colors"
          >
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{label}</p>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeIn} className="grid gap-4 sm:grid-cols-2">
        {/* ── Progress Bars ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatBar
              label="Leads managed"
              value={stats.totalLeads}
              max={100}
              color="bg-green-400"
            />
            <StatBar
              label="Files managed"
              value={stats.filesManaged}
              max={200}
              color="bg-blue-400"
            />
            <StatBar
              label="Messages sent"
              value={stats.messagesExchanged}
              max={500}
              color="bg-purple-400"
            />
            <StatBar
              label="Assignments completed"
              value={stats.assignmentsCompleted}
              max={100}
              color="bg-primary"
            />
          </CardContent>
        </Card>

        {/* ── Achievements ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Achievements</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map(({ label, icon: Icon, color, bg }) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 rounded-xl border p-3 ${bg}`}
              >
                <Icon className={`size-5 ${color} shrink-0`} />
                <span className="text-xs leading-tight font-medium">
                  {label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Skills ── */}
      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {SKILLS.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="bg-muted/40 hover:bg-muted/70 cursor-default px-3 py-1 text-xs transition-colors"
              >
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Recent Activity ── */}
      <motion.div variants={fadeIn}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {RECENT_ACTIVITY.map((activity, i) => (
              <div key={i}>
                <div className="flex items-start gap-3 py-2.5">
                  <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {activity.time}
                    </p>
                  </div>
                </div>
                {i < RECENT_ACTIVITY.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Revenue ── */}
      <motion.div variants={fadeIn}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-muted-foreground text-xs">
                Total Revenue Managed
              </p>
              <p className="text-primary mt-1 text-3xl font-bold">
                {stats.totalEarned}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Across {stats.assignmentsCompleted} completed assignments
              </p>
            </div>
            <div className="bg-primary/15 flex size-16 items-center justify-center rounded-2xl">
              <TrendingUp className="text-primary size-8" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
