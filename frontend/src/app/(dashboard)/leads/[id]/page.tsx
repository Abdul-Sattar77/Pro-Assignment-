"use client";

import { use } from "react";
import { LeadDetail } from "@/features/leads";

/**
 * Lead detail route. Renders full lead metadata, system metrics, and logs.
 */
export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <LeadDetail id={id} />;
}
