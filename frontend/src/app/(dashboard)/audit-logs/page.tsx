"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { AuditLogsList } from "@/features/audit-logs";

export default function AuditLogsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="System Audit Trail"
          description="Secure logs tracking database transactions, model records creations, and administrative edits."
        />
      </motion.div>

      <motion.div variants={fadeIn}>
        <AuditLogsList />
      </motion.div>
    </motion.div>
  );
}
