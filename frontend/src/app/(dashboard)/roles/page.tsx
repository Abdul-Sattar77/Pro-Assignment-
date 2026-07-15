"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { RolesList } from "@/features/roles";

export default function RolesPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Role Based Access Control (RBAC)"
          description="Create security groups, sync system permissions, and enforce administrative rules."
        />
      </motion.div>

      <motion.div variants={fadeIn}>
        <RolesList />
      </motion.div>
    </motion.div>
  );
}
