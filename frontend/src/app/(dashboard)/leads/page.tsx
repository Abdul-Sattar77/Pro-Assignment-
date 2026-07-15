"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { LeadsTable } from "@/features/leads";

/**
 * Leads queue page. Staff can manage inbound prospects, follow up,
 * and track conversions.
 */
export default function LeadsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Leads"
          description="Inbound inquiries, client prospects, and conversion tracking."
        />
      </motion.div>
      <motion.div variants={fadeIn}>
        <LeadsTable />
      </motion.div>
    </motion.div>
  );
}
