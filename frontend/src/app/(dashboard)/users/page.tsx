"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { UsersTable } from "@/features/users";

/** User management page (admin area). Actions inside are permission-gated. */
export default function UsersPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Users"
          description="Manage team and client accounts, roles, and access."
        />
      </motion.div>
      <motion.div variants={fadeIn}>
        <UsersTable />
      </motion.div>
    </motion.div>
  );
}
