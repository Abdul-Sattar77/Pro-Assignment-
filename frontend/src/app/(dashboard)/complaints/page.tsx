"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { ClientComplaints, ComplaintsList } from "@/features/complaints";
import { usePortalRole } from "@/features/dashboard";

export default function ComplaintsPage() {
  const portal = usePortalRole();

  // Clients get the landing-style "file & track" view; staff (PM/admin) get the
  // management console. The backend scopes the list per role.
  if (portal === "client") {
    return <ClientComplaints />;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Complaint Management"
          description="Track and resolve customer concerns, timeline disputes, and writing feedback issues."
        />
      </motion.div>

      <motion.div variants={fadeIn}>
        <ComplaintsList />
      </motion.div>
    </motion.div>
  );
}
