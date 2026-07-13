"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { fadeIn, staggerContainer } from "@/animations/variants";
import { useAuth } from "@/features/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceDashboard } from "@/features/finance/components/finance-dashboard";
import { InvoicesList } from "@/features/finance/components/invoices-list";
import { PaymentsList } from "@/features/finance/components/payments-list";

export default function FinancePage() {
  const { hasRole } = useAuth();
  const isStaff = hasRole("admin") || hasRole("project_manager");
  const isClient = hasRole("client");
  const isWriter = hasRole("writer");

  // Determine default tab based on role
  const defaultTab = isStaff ? "overview" : isClient ? "invoices" : "payments";
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <PageHeader
          title="Finance & Payments"
          description={
            isStaff
              ? "Track revenue, payouts, expenses, and manage client invoices and verification."
              : "Manage invoices, track payments, and review transactions."
          }
        />
      </motion.div>

      <motion.div variants={fadeIn}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            {isStaff && (
              <TabsTrigger value="overview">Overview</TabsTrigger>
            )}
            {(isStaff || isClient) && (
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            )}
            <TabsTrigger value="payments">
              {isWriter ? "Payouts" : "Payments"}
            </TabsTrigger>
          </TabsList>

          {isStaff && (
            <TabsContent value="overview" className="mt-6">
              <FinanceDashboard onTabChange={setActiveTab} />
            </TabsContent>
          )}

          {(isStaff || isClient) && (
            <TabsContent value="invoices" className="mt-6">
              <InvoicesList />
            </TabsContent>
          )}

          <TabsContent value="payments" className="mt-6">
            <PaymentsList />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
