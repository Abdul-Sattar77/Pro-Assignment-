"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { PasswordForm, ProfileForm, SettingsForm } from "@/features/settings";
import { useAuth } from "@/features/auth";

/**
 * Account settings — profile details + password. Available to every role
 * (staff reach it from the sidebar; clients from their account menu).
 * If the user is an administrator, it also renders system configuration tabs.
 */
export default function SettingsPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-3xl space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Settings"
          description="Manage your account details and password."
        />
      </motion.div>
      <motion.div variants={fadeIn}>
        <ProfileForm />
      </motion.div>
      <motion.div variants={fadeIn}>
        <PasswordForm />
      </motion.div>
      {isAdmin && (
        <motion.div variants={fadeIn}>
          <SettingsForm />
        </motion.div>
      )}
    </motion.div>
  );
}
