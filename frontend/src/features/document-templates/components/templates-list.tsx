"use client";

import { useState } from "react";
import { useTemplates, useDeleteTemplate } from "../hooks/use-templates";
import { CreateTemplateDialog } from "./create-template-dialog";
import { TEMPLATE_CATEGORIES, TEMPLATE_SORT_OPTIONS } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Plus, Search, Trash2, FileDown, ShieldCheck, Tag } from "lucide-react";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground text-sm font-medium">Loading templates...</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground text-sm">
          No templates found matching your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="border flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="capitalize text-[10px] gap-1 px-1.5 py-0">
                    <Tag className="size-2.5" />
                    {tpl.category.replace("_", " ")}
                  </Badge>
                  {isStaff && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-7 w-7 hover:bg-destructive/10 -mt-1 -mr-2"
                      onClick={() => handleDelete(tpl.id)}
                      disabled={deleteTemplate.isPending}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 mt-2">
                  {tpl.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Published: {format(new Date(tpl.createdAt), "MMM dd, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-2 text-xs text-slate-650 dark:text-slate-350 leading-relaxed flex-1">
                {tpl.description || "No descriptions detailed."}
              </CardContent>
              <CardFooter className="pt-2 border-t flex justify-between items-center text-xs">
                <span className="text-[10px] text-muted-foreground">By {tpl.uploader?.name}</span>
                {tpl.file ? (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${tpl.file.downloadUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline font-semibold"
                  >
                    <FileDown className="size-4" />
                    <span>Download ({tpl.file.humanSize})</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-muted-foreground">No file attached</span>
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
