"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { ReportViewer } from "@/features/reports";

export default function ReportsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn} className="no-print">
        <PageHeader
          title="Business Reports"
          description="Access detailed operational summaries, performance metrics, and financial inflow/outflow reports."
        />
      </motion.div>

      <motion.div variants={fadeIn}>
        <ReportViewer />
      </motion.div>
    </motion.div>
  );
}
