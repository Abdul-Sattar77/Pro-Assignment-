"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { AnalyticsDashboard } from "@/features/analytics";

export default function AnalyticsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="System Analytics"
          description="Consolidated overview of operational performance metrics, client engagement, writer completions, and financial growth trends."
        />
      </motion.div>

      <motion.div variants={fadeIn}>
        <AnalyticsDashboard />
      </motion.div>
    </motion.div>
  );
}
