"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeIn } from "@/animations/variants";
import { SettingsProfile } from "@/features/settings";
import { SettingsPassword } from "@/features/settings";
import { SettingsNotifications } from "@/features/settings";

export default function SettingsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl space-y-6"
    >
      <motion.div variants={fadeIn}>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account settings and preferences.
        </p>
      </motion.div>

      <motion.div variants={fadeIn}>
        <SettingsProfile />
      </motion.div>

      <motion.div variants={fadeIn}>
        <SettingsPassword />
      </motion.div>

      <motion.div variants={fadeIn}>
        <SettingsNotifications />
      </motion.div>
    </motion.div>
  );
}
