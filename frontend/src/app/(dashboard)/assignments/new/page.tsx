"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { OrderForm } from "@/features/assignments";

/**
 * New order route — the target of every "Place an order" CTA. Clients see it
 * inside their studio shell; staff (who can also create) inside the workspace.
 */
export default function NewAssignmentPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Submit an assignment"
          description="Brief us once — we take it from there."
        />
      </motion.div>
      <motion.div variants={fadeIn}>
        <OrderForm />
      </motion.div>
    </motion.div>
  );
}
