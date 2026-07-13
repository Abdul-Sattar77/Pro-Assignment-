import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_META } from "../constants";
import type { TaskStatus } from "../types";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status];

  if (!meta) return null;

  return (
    <Badge variant="outline" className={cn("gap-1.5 font-normal", meta.textClass)}>
      <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
      {meta.label}
    </Badge>
  );
}
