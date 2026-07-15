"use client";

import { use } from "react";
import { TaskDetail } from "@/features/tasks";

/**
 * Task detail route. Renders full task attributes, linked assignment,
 * assignees, status modifiers, and note histories.
 */
export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <TaskDetail id={id} />;
}
