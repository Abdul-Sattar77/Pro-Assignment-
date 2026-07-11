"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeIn } from "@/animations/variants";
import { LeadsTable } from "@/features/leads";

export default function LeadsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          View approved leads and convert them to assignments.
        </p>
      </motion.div>

      <motion.div variants={fadeIn}>
        <LeadsTable />
      </motion.div>
    </motion.div>
  );
}
