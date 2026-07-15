"use client";

import { useState } from "react";
import { useInvoices, useDeleteInvoice } from "../hooks/use-finance";
import { CreateInvoiceDialog } from "./create-invoice-dialog";
import { INVOICE_STATUS_META, INVOICE_SORT_OPTIONS } from "../constants";
import { INVOICE_STATUS, type Invoice, type InvoiceStatus } from "../types";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Loader2,
  Trash2,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/features/auth";

export function InvoicesList() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [sort, setSort] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);

  const filters = {
    search: search || undefined,
    status: status === "all" ? undefined : status,
    sort,
    page,
    perPage: 15,
  };

  const { data, isLoading } = useInvoices(filters);
  const deleteInvoice = useDeleteInvoice();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoice.mutate(id);
    }
  };

  const invoices = data?.invoices || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search invoice number or client name..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val as InvoiceStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(INVOICE_STATUS_META).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
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
              {INVOICE_SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isAdmin && (
          <Button onClick={() => setOpenCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Invoice
          </Button>
        )}
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && (
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 7 : 6}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">
                      Loading invoices...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 7 : 6}
                  className="text-muted-foreground h-24 text-center"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>{invoice.client?.name || "N/A"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {invoice.assignment?.title || "N/A"}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    PKR {invoice.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {invoice.dueDate ? (
                      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={INVOICE_STATUS_META[invoice.status].badgeClass}
                    >
                      {INVOICE_STATUS_META[invoice.status].label}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deleteInvoice.isPending}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <div className="text-muted-foreground text-xs">
            Showing Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total items)
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

      <CreateInvoiceDialog open={openCreate} onOpenChange={setOpenCreate} />
    </div>
  );
}
