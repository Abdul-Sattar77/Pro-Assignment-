"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { AssignmentsTable, CreateAssignmentDialog } from "@/features/assignments";

/**
 * Orders queue. PMs/admins manage all orders here; the API scopes results
 * for writers (their work) and clients (their orders) automatically.
 */
export default function AssignmentsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Assignments"
          description="Every assignment from brief to delivery — assign, review, and track."
          actions={
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              New Assignment
            </Button>
          }
        />
      </motion.div>
      <motion.div variants={fadeIn}>
        <AssignmentsTable />
      </motion.div>
      <CreateAssignmentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </motion.div>
  );
}
