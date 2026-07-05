import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_META } from "../constants";
import type { AssignmentStatus } from "../types";

/** Consistent workflow-status badge (dot + label) used everywhere. */
export function StatusBadge({ status }: { status: AssignmentStatus }) {
  const meta = STATUS_META[status];

  return (
    <Badge variant="outline" className={cn("gap-1.5", meta.textClass)}>
      <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </Badge>
  );
}
