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
      className={cn(
        "rounded-full border px-2 py-0.5 text-xs font-medium shadow-sm",
        meta.badgeClass,
      )}
    >
      {meta.label}
    </Badge>
  );
}
