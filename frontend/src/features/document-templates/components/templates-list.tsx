"use client";

import { useState } from "react";
import { useTemplates, useDeleteTemplate } from "../hooks/use-templates";
import { CreateTemplateDialog } from "./create-template-dialog";
import { TEMPLATE_CATEGORIES, TEMPLATE_SORT_OPTIONS } from "../constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Loader2,
  Plus,
  Search,
  Trash2,
  FileDown,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/features/auth";

export function TemplatesList() {
  const { hasRole } = useAuth();
  const isStaff = hasRole("admin") || hasRole("project_manager");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);

  const filters = {
    category: category === "all" ? undefined : category,
    search: search || undefined,
    sort,
    page,
    perPage: 12,
  };

  const { data, isLoading } = useTemplates(filters);
  const deleteTemplate = useDeleteTemplate();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document template?")) {
      deleteTemplate.mutate(id);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const templates = data?.templates || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search outlines or guidelines..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {TEMPLATE_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(val) => {
              setSort(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isStaff && (
          <Button onClick={() => setOpenCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        )}
      </div>

      {/* Grid Cards layout */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center gap-2">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
          <span className="text-muted-foreground text-sm font-medium">
            Loading templates...
          </span>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          No templates found matching your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <Card
              key={tpl.id}
              className="flex flex-col justify-between border transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Badge
                    variant="secondary"
                    className="gap-1 px-1.5 py-0 text-[10px] capitalize"
                  >
                    <Tag className="size-2.5" />
                    {tpl.category.replace("_", " ")}
                  </Badge>
                  {isStaff && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 -mt-1 -mr-2 h-7 w-7"
                      onClick={() => handleDelete(tpl.id)}
                      disabled={deleteTemplate.isPending}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
                <CardTitle className="mt-2 text-base font-bold text-slate-800 dark:text-slate-200">
                  {tpl.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Published: {format(new Date(tpl.createdAt), "MMM dd, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-650 dark:text-slate-350 flex-1 py-2 text-xs leading-relaxed">
                {tpl.description || "No descriptions detailed."}
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-2 text-xs">
                <span className="text-muted-foreground text-[10px]">
                  By {tpl.uploader?.name}
                </span>
                {tpl.file ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${tpl.file.downloadUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary flex items-center gap-1 font-semibold hover:underline"
                  >
                    <FileDown className="size-4" />
                    <span>
                      Download ({Math.max(1, Math.round(tpl.file.size / 1024))}{" "}
                      KB)
                    </span>
                  </a>
                ) : (
                  <span className="text-muted-foreground text-[10px]">
                    No file attached
                  </span>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-muted-foreground text-xs">
            Showing Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <CreateTemplateDialog open={openCreate} onOpenChange={setOpenCreate} />
    </div>
  );
}
