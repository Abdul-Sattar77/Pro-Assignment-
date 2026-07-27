"use client";

import { useState } from "react";
import { Search, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFiles } from "../hooks/use-files";
import { FILES_QUERY_KEYS } from "../constants";
import { FileList } from "./file-list";
import { UploadDialog } from "./upload-dialog";

export function FilesList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filters = {
    search: search.trim() || undefined,
    type:
      type === "all" ? undefined : (type as "document" | "image" | "archive"),
  };

  const {
    data: files = [],
    isLoading,
    isFetching,
    refetch,
  } = useFiles(filters);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEYS.all });
    await refetch();
    setIsRefreshing(false);
    toast.success("Files list refreshed.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search files by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="archive">Archives</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            disabled={isFetching || isRefreshing}
          >
            <RefreshCw
              className={cn(
                "mr-1.5 size-4",
                (isFetching || isRefreshing) && "animate-spin",
              )}
            />{" "}
            Refresh
          </Button>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-1.5 size-4" /> Upload File
          </Button>
        </div>
      </div>

      <FileList files={files} isLoading={isLoading} />

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
