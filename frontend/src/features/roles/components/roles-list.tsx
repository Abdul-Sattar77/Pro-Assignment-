"use client";

import { useState } from "react";
import { useRoles, useDeleteRole } from "../hooks/use-roles";
import { RoleFormDialog } from "./role-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Key,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";
import type { Role } from "../types";

const CORE_ROLES = ["admin", "project_manager", "writer", "client"];

export function RolesList() {
  const [search, setSearch] = useState("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const { data: roles, isLoading, refetch } = useRoles();
  const deleteRole = useDeleteRole();

  const handleCreate = () => {
    setEditingRole(null);
    setOpenForm(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setOpenForm(true);
  };

  const handleDelete = (role: Role) => {
    if (confirm(`Are you sure you want to delete the "${role.name}" role?`)) {
      deleteRole.mutate(role.id, {
        onSuccess: () => {
          void refetch();
        },
      });
    }
  };

  const filteredRoles =
    roles?.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())) ||
    [];

  return (
    <div className="space-y-4">
      {/* Search and actions bar */}
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search roles by name..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Custom Role
        </Button>
      </div>

      {/* Roles table */}
      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capabilities</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">
                      Loading security roles...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center text-sm"
                >
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => {
                const isCore = CORE_ROLES.includes(role.name);
                return (
                  <TableRow key={role.id}>
                    <TableCell className="font-semibold text-slate-800 capitalize dark:text-slate-200">
                      {role.name.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      {isCore ? (
                        <Badge
                          variant="secondary"
                          className="bg-slate-150 text-slate-700 dark:bg-slate-800/85 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/40"
                        >
                          System Locked
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        >
                          Custom RBAC
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-pre-wrap">
                      <div className="flex items-center gap-1">
                        <Key className="size-3 text-slate-400" />
                        <span>
                          {role.permissions.length} capabilities assigned
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {role.createdAt
                        ? format(new Date(role.createdAt), "MMM dd, yyyy")
                        : "System Default"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${role.name}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEdit(role)}>
                            <Pencil className="size-4" />
                            Configure Permissions
                          </DropdownMenuItem>
                          {!isCore && (
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => handleDelete(role)}
                              disabled={deleteRole.isPending}
                            >
                              <Trash2 className="size-4" />
                              Delete Role
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <RoleFormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        role={editingRole}
      />
    </div>
  );
}
