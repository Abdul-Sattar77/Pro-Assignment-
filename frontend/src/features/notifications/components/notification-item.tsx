"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, CreditCard, Clock, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "../types";

function NotificationIcon({ type }: { type: NotificationType }) {
  const icons: Record<NotificationType, React.ReactNode> = {
    assignment_new: <FileText className="size-4" />,
    assignment_status: <Bell className="size-4" />,
    message_new: <MessageSquare className="size-4" />,
    payment_received: <CreditCard className="size-4" />,
    deadline_reminder: <Clock className="size-4" />,
    revision_requested: <FileText className="size-4" />,
  };
  return icons[type] ?? <Bell className="size-4" />;
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const content = (
    <div
      className={cn(
        "hover:bg-muted/60 flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
        !notification.isRead && "bg-muted/40",
      )}
      onClick={() => onRead(notification.id)}
    >
      <div
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
          !notification.isRead
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <NotificationIcon type={notification.type} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm leading-snug",
            !notification.isRead ? "font-medium" : "text-muted-foreground",
          )}
        >
          {notification.title}
        </p>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
          {notification.message}
        </p>
        <p className="text-muted-foreground/70 mt-1 text-[11px]">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>
      {!notification.isRead && (
        <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" />
      )}
    </div>
  );

  if (notification.href) {
    return <Link href={notification.href}>{content}</Link>;
  }
  return content;
}
