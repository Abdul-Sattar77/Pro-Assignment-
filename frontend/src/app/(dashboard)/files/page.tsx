"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileUp,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fadeIn, staggerContainer } from "@/animations/variants";
import {
  FileList,
  UploadDialog,
  useFiles,
  FILE_TYPE_OPTIONS,
  SORT_BY_OPTIONS,
  type FileFilters,
} from "@/features/files";

export default function FilesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileType, setFileType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [uploadOpen, setUploadOpen] = useState(false);

  // Map state to API filters
  const filters: FileFilters = {
    search: searchQuery.trim() || undefined,
    type: fileType === "all" ? undefined : (fileType as FileFilters["type"]),
    sortBy: sortBy as FileFilters["sortBy"],
    sortOrder,
  };

  const { data: files, isPending, refetch } = useFiles(filters);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <motion.div variants={fadeIn}>
          <PageHeader
            title="Files & Attachments"
            description="Manage assignment briefs, submitted files, assets, and project archives in one secure place."
          />
        </motion.div>

        <motion.div variants={fadeIn}>
          <Button onClick={() => setUploadOpen(true)} className="gap-1.5 shadow-sm">
            <FileUp className="size-4" />
            Upload File
          </Button>
        </motion.div>
      </div>

      {/* Filters Bar */}
      <motion.div
        variants={fadeIn}
        className="flex flex-wrap items-center justify-between gap-4 bg-card border rounded-xl p-4 shadow-2xs"
      >
        <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Type Filter */}
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger className="w-40 h-9" aria-label="Filter by file type">
              <SelectValue placeholder="All File Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All File Types</SelectItem>
              {FILE_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sorting Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground mr-1" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sort By
          </span>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 h-9" aria-label="Sort files by">
              <SelectValue placeholder="Sort option" />
            </SelectTrigger>
            <SelectContent>
              {SORT_BY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="size-9"
            title={sortOrder === "asc" ? "Sorted Ascending" : "Sorted Descending"}
            aria-label="Toggle sort order"
          >
            {sortOrder === "asc" ? (
              <ArrowUp className="size-4" />
            ) : (
              <ArrowDown className="size-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => void refetch()}
            className="size-9"
            title="Refresh List"
            aria-label="Refresh files"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </motion.div>

      {/* Files List Table */}
      <motion.div variants={fadeIn}>
        <FileList files={files || []} isLoading={isPending} />
      </motion.div>

      {/* Upload Dialog */}
      {uploadOpen && (
        <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      )}
    </motion.div>
  );
}
