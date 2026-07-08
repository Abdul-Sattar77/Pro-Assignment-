"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { Can } from "@/features/auth";
import {
  CreateInvoiceDialog,
  FinanceSummaryTiles,
  InvoicesTable,
} from "@/features/finance";

/**
 * Finance page — money summary + invoices. Scoped by the API: clients see
 * their own totals & invoices (and can pay); staff see everything (and can
 * raise/verify/cancel).
 */
export default function FinancePage() {
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
          title="Finance"
          description="Invoices, payments, and balances."
          actions={
            <Can permission="invoices.manage">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                New invoice
              </Button>
            </Can>
          }
        />
      </motion.div>
      <motion.div variants={fadeIn}>
        <FinanceSummaryTiles />
      </motion.div>
      <motion.div variants={fadeIn}>
        <InvoicesTable />
      </motion.div>

      <CreateInvoiceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </motion.div>
  );
}
