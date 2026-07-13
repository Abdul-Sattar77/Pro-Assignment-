"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Power,
  Search,
  Trash2,
  UserPlus,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Can, useAuth } from "@/features/auth";
import { ASSIGNABLE_ROLES } from "../constants";
import { useUpdateUser, useUsers } from "../hooks/use-users";
import type { UserListItem } from "../types";
import { DeleteUserDialog } from "./delete-user-dialog";
import { UserFormDialog } from "./user-form-dialog";
import { WriterRatingsDialog } from "./writer-ratings-dialog";

const ALL = "all";

function roleLabel(slug: string): string {
  return ASSIGNABLE_ROLES.find((role) => role.value === slug)?.label ?? slug;
}

/**
 * User management table: debounced search, role/status filters, pagination,
 * and permission-gated row actions (edit, activate/deactivate, delete).
 */
export function UsersTable() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);

  const { data, isPending, isError, refetch } = useUsers({
    search: debouncedSearch || undefined,
    role: role === ALL ? undefined : role,
    status: status === ALL ? undefined : (status as "active" | "inactive"),
    page,
    perPage: 10,
  });

  const updateUser = useUpdateUser();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [deleting, setDeleting] = useState<UserListItem | null>(null);
  const [ratingWriter, setRatingWriter] = useState<UserListItem | null>(null);

  const pagination = data?.pagination;

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (user: UserListItem) => {
    setEditing(user);
    setFormOpen(true);
  };

  const toggleActive = (user: UserListItem) => {
    updateUser.mutate({ id: user.id, payload: { isActive: !user.isActive } });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email…"
            className="pl-9"
            aria-label="Search users"
          />
        </div>
        <Select
          value={role}
          onValueChange={(value) => {
            setRole(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All roles</SelectItem>
            {ASSIGNABLE_ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Can permission="users.create">
          <Button onClick={openCreate}>
            <UserPlus className="size-4" />
            Add user
          </Button>
        </Can>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 6 }, (_, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <p className="text-muted-foreground mb-3 text-sm">
                    Couldn&apos;t load users. Please try again.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            )}

            {data && data.users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <p className="text-sm font-medium">No users found</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Try adjusting your search or filters.
                  </p>
                </TableCell>
              </TableRow>
            )}

            {data?.users.map((user) => {
              const isSelf = user.id === currentUser?.id;
              const isWriter = user.roles.includes("writer");
              const isClient = user.roles.includes("client");

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isSelf && (
                          <span className="text-muted-foreground text-xs font-normal">
                            (you)
                          </span>
                        )}
                        {isWriter && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-500 font-semibold ml-1">
                            ⭐ {user.averageRating?.toFixed(1) || "0.0"}
                          </span>
                        )}
                      </div>
                      
                      {isWriter && (
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-normal text-muted-foreground">
                          <span>Earnings: PKR {user.totalEarnings?.toLocaleString() || "0"}</span>
                          {user.expertise && (
                            <>
                              <span>·</span>
                              <span className="max-w-[200px] truncate">Niches: {user.expertise}</span>
                            </>
                          )}
                        </div>
                      )}

                      {isClient && user.notes && (
                        <p className="text-[11px] font-normal text-muted-foreground italic max-w-xs truncate">
                          Notes: {user.notes}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {user.roles.map((r) => (
                        <Badge key={r} variant="secondary">
                          {roleLabel(r)}
                        </Badge>
                      ))}
                      {isWriter && user.availability && (
                        <Badge
                          variant="outline"
                          className={
                            user.availability === "available"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize"
                              : user.availability === "busy"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 capitalize"
                              : "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400 capitalize"
                          }
                        >
                          {user.availability}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.isActive
                          ? "border-success/40 text-success"
                          : "border-muted-foreground/40 text-muted-foreground"
                      }
                    >
                      <span
                        className={`mr-1 inline-block size-1.5 rounded-full ${
                          user.isActive ? "bg-success" : "bg-muted-foreground"
                        }`}
                      />
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {user.createdAt
                      ? format(new Date(user.createdAt), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${user.name}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Can permission="users.update">
                          <DropdownMenuItem onSelect={() => openEdit(user)}>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={isSelf}
                            onSelect={() => toggleActive(user)}
                          >
                            <Power className="size-4" />
                            {user.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        </Can>
                        <Can permission="users.delete">
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={isSelf}
                            onSelect={() => setDeleting(user)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </Can>
                        {isWriter && (
                          <DropdownMenuItem onSelect={() => setRatingWriter(user)}>
                            <Award className="size-4" />
                            Ratings & Performance
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm tabular-nums">
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {pagination.total} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
      />
      <DeleteUserDialog user={deleting} onClose={() => setDeleting(null)} />
      {ratingWriter && (
        <WriterRatingsDialog
          writer={ratingWriter}
          onClose={() => setRatingWriter(null)}
        />
      )}
    </div>
  );
}
