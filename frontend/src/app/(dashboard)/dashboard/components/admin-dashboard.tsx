"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/animations/variants";
import { WelcomeBanner } from "./welcome-banner";
import { StatCards } from "./stat-cards";
import { AnalyticsPreview } from "./analytics-preview";
import { RecentAssignments } from "./recent-assignments";
import { RecentActivity } from "./recent-activity";
import { QuickActions } from "./quick-actions";

export function AdminDashboard() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <WelcomeBanner />

      <StatCards />

      <AnalyticsPreview />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RecentAssignments />
          <QuickActions />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </motion.div>
  );
}
