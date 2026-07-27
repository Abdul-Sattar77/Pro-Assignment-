"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { Can, WriterProfileCard } from "@/features/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreateInvoiceDialog,
  FinanceSummaryTiles,
  InvoicesTable,
  PaymentsList,
  PaymentRemindersList,
} from "@/features/finance";

/**
 * Finance page — money summary + invoices & payments/transactions. Scoped by
 * the API: clients see their own totals & invoices; staff see everything.
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
      <Can role="writer">
        <motion.div variants={fadeIn}>
          <WriterProfileCard />
        </motion.div>
      </Can>

      <motion.div variants={fadeIn}>
        <FinanceSummaryTiles />
      </motion.div>

      <motion.div variants={fadeIn}>
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments & Transactions</TabsTrigger>
            <TabsTrigger value="reminders">Payment Reminders</TabsTrigger>
          </TabsList>
          <TabsContent value="invoices" className="space-y-4">
            <InvoicesTable />
          </TabsContent>
          <TabsContent value="payments" className="space-y-4">
            <PaymentsList />
          </TabsContent>
          <TabsContent value="reminders" className="space-y-4">
            <PaymentRemindersList />
          </TabsContent>
        </Tabs>
      </motion.div>

      <CreateInvoiceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </motion.div>
  );
}
