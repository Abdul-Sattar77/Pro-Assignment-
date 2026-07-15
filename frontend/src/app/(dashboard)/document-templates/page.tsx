"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { TemplatesList } from "@/features/document-templates";

export default function DocumentTemplatesPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Document Templates"
          description="Access standard outlines, criteria guideline drafts, contracts, and assignment briefs."
        />
      </motion.div>

      <motion.div variants={fadeIn}>
        <TemplatesList />
      </motion.div>
    </motion.div>
  );
}
