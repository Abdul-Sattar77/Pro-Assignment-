import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_META } from "../constants";
import type { TaskPriority } from "../types";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const meta = PRIORITY_META[priority];

  if (!meta) return null;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-normal", meta.textClass)}
    >
      <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </Badge>
  );
}
