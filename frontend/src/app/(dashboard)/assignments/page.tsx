"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { AssignmentsTable } from "@/features/assignments";

/**
 * Orders queue. PMs/admins manage all orders here; the API scopes results
 * for writers (their work) and clients (their orders) automatically.
 */
export default function AssignmentsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Orders"
          description="Every assignment from brief to delivery — assign, review, and track."
        />
      </motion.div>
      <motion.div variants={fadeIn}>
        <AssignmentsTable />
      </motion.div>
    </motion.div>
  );
}
