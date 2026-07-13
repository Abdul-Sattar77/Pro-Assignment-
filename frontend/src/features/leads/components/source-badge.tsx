import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SOURCE_META } from "../constants";
import type { LeadSource } from "../types";

export function SourceBadge({ source }: { source: LeadSource }) {
  const meta = SOURCE_META[source];

  if (!meta) return null;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium border shadow-sm px-2 py-0.5 rounded-full text-xs", meta.badgeClass)}
    >
      {meta.label}
    </Badge>
  );
}
