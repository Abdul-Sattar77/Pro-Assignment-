"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { TasksTable } from "@/features/tasks";

/**
 * Tasks queue page. Staff can manage internally assigned actions,
 * follow up, and track completions.
 */
export default function TasksPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Tasks"
          description="Track team actions, project items, and workflow checklist priorities."
        />
      </motion.div>
      <motion.div variants={fadeIn}>
        <TasksTable />
      </motion.div>
    </motion.div>
  );
}
