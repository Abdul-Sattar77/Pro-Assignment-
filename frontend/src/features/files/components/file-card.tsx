"use client";

import {
  FileText,
  FileSpreadsheet,
  Image,
  File,
  Download,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AssignmentFile, FileType } from "../types";

function FileIcon({ type }: { type: FileType }) {
  const icons = {
    pdf: <FileText className="size-5 text-red-400" />,
    docx: <FileText className="size-5 text-blue-400" />,
    xlsx: <FileSpreadsheet className="size-5 text-green-400" />,
    image: <Image className="size-5 text-purple-400" />,
    other: <File className="text-muted-foreground size-5" />,
  };
  return icons[type];
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const UPLOADER_COLORS = {
  client: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  writer: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  pm: "bg-primary/15 text-primary border-primary/30",
  admin: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface FileCardProps {
  file: AssignmentFile;
  onDelete?: (id: string) => void;
}

export function FileCard({ file, onDelete }: FileCardProps) {
  return (
    <div className="bg-card hover:bg-muted/30 group flex items-center gap-4 rounded-xl border p-4 transition-colors">
      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
        <FileIcon type={file.type} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">
            {formatSize(file.size)}
          </span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <Badge
            variant="outline"
            className={cn(
              "px-1.5 py-0 text-[10px] capitalize",
              UPLOADER_COLORS[file.uploadedBy],
            )}
          >
            {file.uploaderName}
          </Badge>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-muted-foreground text-xs">
            {file.assignmentTitle}
          </span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNow(new Date(file.uploadedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="size-8">
          <Download className="size-4" />
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive size-8"
            onClick={() => onDelete(file.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
