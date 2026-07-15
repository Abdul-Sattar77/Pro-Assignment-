"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { AssignmentsTable } from "@/features/assignments";

/**
 * Conversations hub. Each order has its own thread — open one to chat. Reuses
 * the orders table (role-scoped by the API); the chat lives on each order's
 * detail page.
 */
export default function MessagingPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Messages"
          description="Open an assignment to chat with everyone working on it."
        />
      </motion.div>
      <motion.div variants={fadeIn}>
        <AssignmentsTable />
      </motion.div>
    </motion.div>
  );
}
