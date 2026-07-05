"use client";

import { use } from "react";
import { AssignmentDetail } from "@/features/assignments";

/**
 * Order detail route. One page for every role — the action bar inside
 * renders only what the backend granted this viewer.
 */
export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <AssignmentDetail id={id} />;
}
