"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeIn } from "@/animations/variants";
import { CalendarView } from "@/features/calendar";

export default function CalendarPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          View your assignments and deadlines.
        </p>
      </motion.div>

      <motion.div variants={fadeIn}>
        <CalendarView />
      </motion.div>
    </motion.div>
  );
}
