"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Trash2,
  RotateCcw,
  Loader2,
  Search,
  RefreshCw,
  MessageSquareX,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import type { ApiError } from "@/lib/http-error";

interface DeletedMessage {
  id: string;
  uuid: string;
  body: string | null;
  sender?: { id: string; name: string; email: string } | null;
  conversation?: { id: string } | null;
  deletedAt: string | null;
  createdAt: string | null;
}

async function fetchDeleted(): Promise<DeletedMessage[]> {
  const { data } = await apiClient.get<{ data: DeletedMessage[] }>(
    "/admin/deleted-messages",
  );
  return data.data;
}

async function restoreMessage(uuid: string): Promise<DeletedMessage> {
  const { data } = await apiClient.post<{ data: DeletedMessage }>(
    `/admin/deleted-messages/${uuid}/restore`,
  );
  return data.data;
}

export function DeletedMessagesList() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<DeletedMessage[], ApiError>({
    queryKey: ["admin", "deleted-messages"],
    queryFn: fetchDeleted,
    staleTime: 30 * 1000,
  });

  const restore = useMutation<DeletedMessage, ApiError, string>({
    mutationFn: (uuid) => restoreMessage(uuid),
    onSuccess: (msg) => {
      void queryClient.invalidateQueries({
        queryKey: ["admin", "deleted-messages"],
      });
      toast.success(`Message by ${msg.sender?.name ?? "user"} restored.`);
    },
    onError: (error) => toast.error(error.message || "Restore failed."),
  });

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (m.body ?? "").toLowerCase().includes(q) ||
      (m.sender?.name ?? "").toLowerCase().includes(q) ||
      (m.sender?.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquareX className="size-4 text-rose-500" /> Deleted Messages
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs">
            View and restore soft-deleted chat messages. Admin only.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-1.5 size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </CardHeader>

      <div className="px-6 pb-3">
        <div className="relative max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by content or sender…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading deleted
            messages…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            <Trash2 className="mx-auto mb-2 size-8 opacity-30" />
            {search
              ? "No messages match your search."
              : "No deleted messages found."}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content Preview</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Deleted At</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((msg) => (
                <TableRow key={msg.uuid}>
                  <TableCell className="max-w-xs text-sm">
                    <span className="text-muted-foreground line-clamp-2 italic">
                      {msg.body ? (
                        msg.body.length > 120 ? (
                          msg.body.substring(0, 120) + "…"
                        ) : (
                          msg.body
                        )
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Attachment/Media
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {msg.sender?.name ?? "Unknown"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {msg.sender?.email ?? "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap text-rose-500">
                    {msg.deletedAt
                      ? format(new Date(msg.deletedAt), "MMM d, yyyy HH:mm")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {msg.createdAt
                      ? format(new Date(msg.createdAt), "MMM d, yyyy HH:mm")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs hover:border-emerald-500 hover:text-emerald-600"
                      onClick={() => restore.mutate(msg.uuid)}
                      disabled={restore.isPending}
                    >
                      {restore.isPending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <RotateCcw className="size-3" />
                      )}
                      Restore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
