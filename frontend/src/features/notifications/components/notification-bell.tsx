"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "../hooks/use-notifications";
import type { AppNotification } from "../types";

/**
 * Notification bell — unread badge (polled) + dropdown list. Clicking an item
 * marks it read and opens the related order. Used in both the staff topbar
 * and the client studio nav.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: unread = 0 } = useUnreadCount();
  const { data: notifications, isPending } = useNotifications(open);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const onOpen = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
    setOpen(false);
    if (notification.assignmentId) {
      router.push(`/assignments/${notification.assignmentId}`);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
          className="relative"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isPending && (
            <p className="text-muted-foreground px-3 py-8 text-center text-sm">
              Loading…
            </p>
          )}

          {notifications && notifications.length === 0 && (
            <p className="text-muted-foreground px-3 py-8 text-center text-sm">
              You&apos;re all caught up.
            </p>
          )}

          {notifications?.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => onOpen(notification)}
              className="hover:bg-accent flex w-full flex-col items-start gap-0.5 border-b px-3 py-2.5 text-left transition-colors last:border-b-0"
            >
              <div className="flex w-full items-center gap-2">
                {!notification.read && (
                  <span className="bg-primary size-1.5 shrink-0 rounded-full" />
                )}
                <span
                  className={cn(
                    "flex-1 truncate text-sm",
                    notification.read ? "font-normal" : "font-semibold",
                  )}
                >
                  {notification.title}
                </span>
              </div>
              <span className="text-muted-foreground line-clamp-2 text-xs">
                {notification.message}
              </span>
              {notification.createdAt && (
                <span className="text-muted-foreground text-[10px]">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
