"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeIn } from "@/animations/variants";
import { FilesList } from "@/features/files";

export default function FilesPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <h1 className="text-2xl font-bold tracking-tight">Files</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          View, upload and manage assignment files.
        </p>
      </motion.div>

      <motion.div variants={fadeIn}>
        <FilesList />
      </motion.div>
    </motion.div>
  );
}
