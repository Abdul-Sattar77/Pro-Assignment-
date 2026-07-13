"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { SettingsForm } from "@/features/settings";

export default function SettingsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="System Settings"
          description="Manage general application configurations, company profiles, and file upload parameters."
        />
      </motion.div>

      <motion.div variants={fadeIn}>
        <SettingsForm />
      </motion.div>
    </motion.div>
  );
}
