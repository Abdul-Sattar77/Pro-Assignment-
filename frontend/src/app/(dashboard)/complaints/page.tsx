"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { ComplaintsList } from "@/features/complaints";

export default function ComplaintsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Complaint Management"
          description="Track and resolve customer concerns, timeline disputes, and writing feedback issues."
        />
      </motion.div>

      <motion.div variants={fadeIn}>
        <ComplaintsList />
      </motion.div>
    </motion.div>
  );
}
