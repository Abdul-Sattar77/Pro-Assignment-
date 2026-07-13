"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { CalendarView } from "@/features/calendar";

/**
 * Calendar main dashboard page. Displays all assignment deadlines,
 * meetings, task milestones, and custom events.
 */
export default function CalendarPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Calendar"
          description="View assignment deadlines, meeting schedules, payment milestones, and task checklists."
        />
      </motion.div>
      <motion.div variants={fadeIn}>
        <CalendarView />
      </motion.div>
    </motion.div>
  );
}
