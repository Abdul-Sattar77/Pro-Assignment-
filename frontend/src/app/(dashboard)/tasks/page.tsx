"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeIn } from "@/animations/variants";
import { TaskBoard } from "@/features/tasks";

export default function TasksPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your personal tasks and to-dos.
        </p>
      </motion.div>

      <motion.div variants={fadeIn}>
        <TaskBoard />
      </motion.div>
    </motion.div>
  );
}
