import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_META } from "../constants";
import type { Assignment, AssignmentStatus } from "../types";

/** Consistent workflow-status badge (dot + label) used everywhere. */
export function StatusBadge({
  status,
  label,
  assignment,
}: {
  status: AssignmentStatus;
  label?: string;
  assignment?: Assignment;
}) {
  const meta = STATUS_META[status];

  let displayLabel = label ?? assignment?.statusLabel ?? meta.label;
  if (assignment && !label && !assignment.statusLabel) {
    if (assignment.status === "pending_assignment") {
      displayLabel = assignment.projectManager
        ? "Awaiting Writer"
        : "Awaiting Project Manager";
    } else if (assignment.status === "assigned") {
      displayLabel = "Writer Assigned";
    } else if (assignment.status === "submitted") {
      displayLabel = "PM Review";
    } else if (assignment.status === "delivered") {
      displayLabel = "Delivered to Client";
    } else if (assignment.status === "in_progress") {
      displayLabel = "In Progress";
    } else if (assignment.status === "revision_requested") {
      displayLabel = "Revision Requested";
    }
  }

  return (
    <Badge variant="outline" className={cn("gap-1.5", meta.textClass)}>
      <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
      {displayLabel}
    </Badge>
  );
}
