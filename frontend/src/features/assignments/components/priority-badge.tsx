import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_META } from "../constants";
import type { AssignmentPriority } from "../types";

/** Priority badge with dot + label — like StatusBadge but for priority. */
export function PriorityBadge({ priority }: { priority: AssignmentPriority }) {
  const meta = PRIORITY_META[priority];

  return (
    <Badge variant="outline" className={cn("gap-1.5", meta.badgeClass)}>
      <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </Badge>
  );
}
